import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { existsSync, mkdirSync, rmSync, renameSync, readdirSync } from 'node:fs';
import { findDefenderCli, scanForThreats } from './lib/virus-scan.js';
import { runProjectTests } from './lib/project-tests.js';
import { extractZip, ZipError, ZIP_LIMITS } from './lib/zip.js';
import { scanDomain } from './lib/domain-scan.js';
import { collectProjectFiles, collectSourceFiles, ruleSuggestions, claudeSuggestions, aiSuggestions } from './lib/code-review.js';
import { saveTestIdeas } from './lib/test-ideas-store.js';
import { createAutoRunner } from './lib/autorun.js';
import { runProjectPipeline, PIPELINE_STEPS } from './lib/pipeline.js';
import { newJob, setStep, summarize } from './lib/progress.js';
import os from 'node:os';
import { execFile, spawn } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

const execFileAsync = promisify(execFile);
import { createStore } from './lib/store.js';
import {
  validateTestCase, validateTestCaseStatus, validateTestCaseResult, validateBug,
  validateBugUpdate, validateReview, validateChecklistUpdate,
  TC_STATUSES, TC_RESULTS, PRIORITIES, BUG_TRANSITIONS,
} from './lib/validate.js';
import { buildStages, computeStats, readReport } from './lib/metrics.js';
import { collectSpecResults, planAutoUpdates } from './lib/auto-results.js';
import { buildSummary, buildStlc } from './lib/summary.js';
import {
  buildGapReport, buildContextText, fallbackReply, askProvider, MAX_MESSAGE,
} from './lib/assistant.js';
import {
  PROVIDERS, DEFAULT_SETTINGS, applySettingsUpdate, publicView, resolveActive,
} from './lib/ai-config.js';
import {
  DEFAULT_PROJECT_ID, WORKFLOW_STEPS, emptyWorkflow, validateProject,
  validateWorkflowPatch, validateProjectNotes, snapshotRun,
} from './lib/projects.js';

const projectItems = (name, projectId) => store.list(name).filter((item) => item.projectId === projectId);

function projectIdParam(url) {
  const id = url.searchParams.get('projectId') ?? DEFAULT_PROJECT_ID;
  if (!store.find('projects', id)) throw new HttpError(400, 'projectId không tồn tại');
  return id;
}

function resolveProjectId(body) {
  const id = isObject(body) && body.projectId !== undefined ? body.projectId : DEFAULT_PROJECT_ID;
  if (typeof id !== 'string' || !store.find('projects', id)) {
    throw new HttpError(400, 'Dữ liệu không hợp lệ', { projectId: 'Dự án không tồn tại' });
  }
  return id;
}

const root = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT ?? 3000);
const HOST = process.env.HOST ?? '127.0.0.1';
const DATA_DIR = path.resolve(process.env.DATA_DIR ?? path.join(root, 'data', 'runtime'));
const RESULTS_FILE = path.resolve(process.env.RESULTS_FILE ?? path.join(root, 'results', 'playwright-results.json'));
const PUBLIC_DIR = path.join(root, 'public');
const MAX_BODY_BYTES = 100 * 1024;
const VERSION = '1.0.0';
const startedAt = Date.now();

const store = createStore({ dataDir: DATA_DIR, seedFile: path.join(root, 'data', 'seed.json') });
const PLAN = JSON.parse(readFileSync(path.join(root, 'data', 'plan.json'), 'utf8'));

const SECURITY_HEADERS = {
  'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer',
};

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

function sendJson(res, status, body, extraHeaders = {}) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    ...SECURITY_HEADERS,
    ...extraHeaders,
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(payload),
    'Cache-Control': 'no-store',
  });
  res.end(payload);
}

async function readJsonBody(req) {
  const contentType = (req.headers['content-type'] ?? '').split(';')[0].trim();
  if (contentType !== 'application/json') {
    throw new HttpError(415, 'Content-Type phải là application/json');
  }
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) {
      throw new HttpError(413, 'Dữ liệu gửi lên quá lớn');
    }
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8') || 'null');
  } catch {
    throw new HttpError(400, 'JSON không hợp lệ');
  }
}

function parseFilter(url, name, allowed) {
  const value = url.searchParams.get(name);
  if (value && !allowed.includes(value)) {
    throw new HttpError(400, `Giá trị ${name} không hợp lệ`);
  }
  return value;
}

const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

async function getHealth(req, res) {
  sendJson(res, 200, {
    status: 'ok',
    version: VERSION,
    environment: process.env.APP_ENV ?? 'QA',
    uptimeSec: Math.round((Date.now() - startedAt) / 1000),
  });
}

async function getStats(req, res) {
  const stats = computeStats({
    testcases: store.list('testcases'),
    bugs: store.list('bugs'),
    report: readReport(RESULTS_FILE),
  });
  sendJson(res, 200, stats);
}

// Sự kiện thật từ file và dữ liệu để tính trạng thái giai đoạn (không ghi tay).
function deriveFacts() {
  const configPath = path.join(root, 'playwright.config.mjs');
  const config = existsSync(configPath) ? readFileSync(configPath, 'utf8') : '';
  const testcases = projectItems('testcases', DEFAULT_PROJECT_ID);
  return {
    planReady: existsSync(path.join(root, 'data', 'plan.json')),
    requirementCount: store.list('requirements').length,
    testcaseCount: testcases.length,
    withExpected: testcases.filter((tc) => (tc.expected ?? '').trim() !== '').length,
    resetHarness: existsSync(path.join(root, 'scripts', 'test-server.mjs')),
    browserProjects: (config.match(/\{\s*name:\s*'[^']+'\s*,\s*use:/g) ?? []).length,
    ciWorkflow: existsSync(path.join(root, '.github', 'workflows', 'ci.yml')),
  };
}

async function getStages(req, res) {
  const report = readReport(RESULTS_FILE);
  sendJson(res, 200, { stages: buildStages(report, deriveFacts()), reportAvailable: report !== null });
}

function currentSummary(projectId = DEFAULT_PROJECT_ID) {
  return buildSummary({
    testcases: projectItems('testcases', projectId),
    requirements: store.list('requirements'),
    bugs: projectItems('bugs', projectId),
  });
}

async function getSummary(req, res, url) {
  sendJson(res, 200, currentSummary(projectIdParam(url)));
}

function planExists() {
  return existsSync(path.join(root, 'data', 'plan.json'));
}

function stlcFor(projectId) {
  const project = projectOrThrow(projectId);
  const summary = currentSummary(projectId);
  return buildStlc({
    testcases: projectItems('testcases', projectId),
    requirements: store.list('requirements'),
    suites: store.list('suites'),
    checklist: projectChecklist(project),
    summary,
    planReady: planExists(),
  });
}

async function getStlc(req, res, url) {
  sendJson(res, 200, { phases: stlcFor(projectIdParam(url)), projectId: projectIdParam(url) });
}

async function getPlan(req, res) {
  sendJson(res, 200, PLAN);
}

async function listRequirements(req, res) {
  const items = store.list('requirements');
  sendJson(res, 200, { items, total: items.length });
}

async function listSuites(req, res) {
  const items = store.list('suites');
  sendJson(res, 200, { items, total: items.length });
}

async function listTestCases(req, res, url) {
  const status = parseFilter(url, 'status', TC_STATUSES);
  const priority = parseFilter(url, 'priority', PRIORITIES);
  const result = parseFilter(url, 'result', TC_RESULTS);
  const query = (url.searchParams.get('q') ?? '').trim().toLowerCase();

  let items = projectItems('testcases', projectIdParam(url));
  if (status) items = items.filter((item) => item.status === status);
  if (priority) items = items.filter((item) => item.priority === priority);
  if (result) items = items.filter((item) => (item.result ?? 'not_run') === result);
  if (query) {
    items = items.filter((item) => `${item.id} ${item.title} ${item.module}`.toLowerCase().includes(query));
  }
  sendJson(res, 200, { items, total: items.length });
}

function assertReferencesExist(value) {
  const errors = {};
  for (const reqId of value.requirementIds ?? []) {
    if (!store.find('requirements', reqId)) errors.requirementId = `Không tìm thấy ${reqId}`;
  }
  if (value.suiteId && !store.find('suites', value.suiteId)) {
    errors.suiteId = `Không tìm thấy ${value.suiteId}`;
  }
  if (Object.keys(errors).length > 0) {
    throw new HttpError(400, 'Dữ liệu không hợp lệ', errors);
  }
}

async function createTestCase(req, res) {
  const body = await readJsonBody(req);
  const result = validateTestCase(body);
  if (!result.ok) {
    throw new HttpError(400, 'Dữ liệu không hợp lệ', result.errors);
  }
  assertReferencesExist(result.value);
  const projectId = resolveProjectId(body);
  const item = store.insert('testcases', { ...result.value, projectId, result: 'not_run', status: 'draft' });
  sendJson(res, 201, item);
}

// Kết quả pass/fail chỉ do kiểm thử tự động ghi (xem /api/automation/sync). Không nhận ghi tay.
async function updateTestCase(req, res, url, match) {
  const id = match[1];
  if (!store.find('testcases', id)) {
    throw new HttpError(404, `Không tìm thấy ${id}`);
  }
  const body = await readJsonBody(req);
  if (isObject(body) && body.result !== undefined) {
    throw new HttpError(403, 'Kết quả do kiểm thử tự động ghi, không sửa tay');
  }
  const result = validateTestCaseStatus(body);
  if (!result.ok) {
    throw new HttpError(400, 'Dữ liệu không hợp lệ', result.errors);
  }
  sendJson(res, 200, store.update('testcases', id, result.value));
}

// Đọc báo cáo Playwright JSON mới nhất và ghi pass/fail vào các test case có automationKey khớp.
async function syncAutoResults(req, res) {
  if (!existsSync(RESULTS_FILE)) {
    throw new HttpError(404, 'Chưa có báo cáo Playwright. Chạy npm test trước.');
  }
  const report = JSON.parse(readFileSync(RESULTS_FILE, 'utf8'));
  const specResults = collectSpecResults(report);
  const updates = planAutoUpdates(store.list('testcases'), specResults);
  for (const update of updates) store.update('testcases', update.id, update.patch);
  sendJson(res, 200, {
    specs: specResults.size,
    matched: updates.length,
    updated: updates.map((u) => ({ id: u.id, result: u.patch.result })),
  });
}

// Nhận kết quả pipeline CI: tự tick các mục có bằng chứng đạt, luôn ghi bằng chứng vào mục.
// Không bao giờ bỏ tick một mục đã tick.
const CI_LATEST_FILE = path.join(root, 'results', 'ci', 'latest.json');

async function applyCiReport(req, res) {
  const body = await readJsonBody(req);
  if (!isObject(body) || !Array.isArray(body.ticks)) {
    throw new HttpError(400, 'Thiếu danh sách ticks');
  }
  const applied = [];
  for (const tick of body.ticks) {
    if (!isObject(tick) || typeof tick.id !== 'string' || typeof tick.evidence !== 'string') continue;
    if (!store.find('checklist', tick.id)) continue;
    const patch = { evidence: tick.evidence.slice(0, 500), evidenceAt: new Date().toISOString() };
    if (tick.done === true) patch.done = true;
    store.update('checklist', tick.id, patch);
    applied.push({ id: tick.id, done: tick.done === true });
  }
  sendJson(res, 200, { applied });
}

async function getCiLatest(req, res) {
  const latest = existsSync(CI_LATEST_FILE) ? JSON.parse(readFileSync(CI_LATEST_FILE, 'utf8')) : null;
  sendJson(res, 200, latest);
}

// Tiến độ lần chạy đang diễn ra. Khóa chống chạy chồng: một lần chạy "đang chạy" quá 15 phút coi như đã hỏng.
const CI_PROGRESS_FILE = path.join(root, 'results', 'ci', 'progress.json');
const CI_STALE_MS = 15 * 60 * 1000;

function readCiProgress() {
  return existsSync(CI_PROGRESS_FILE) ? JSON.parse(readFileSync(CI_PROGRESS_FILE, 'utf8')) : null;
}

function ciRunning() {
  const p = readCiProgress();
  return Boolean(p?.running) && Date.now() - Date.parse(p.startedAt) < CI_STALE_MS;
}

// Chưa có lần chạy thì trả null (200), không trả 404, để trang Tổng không báo lỗi tài nguyên.
async function getCiProgress(req, res) {
  sendJson(res, 200, readCiProgress());
}

async function runCi(req, res) {
  if (ciRunning()) throw new HttpError(409, 'Đang có lần chạy CI, đợi lần đó xong');
  const child = spawn(process.execPath, [path.join(root, 'scripts', 'ci.mjs')], {
    cwd: root,
    env: { ...process.env, LIVE_URL: `http://127.0.0.1:${PORT}` },
    detached: true,
    stdio: 'ignore',
  });
  child.unref();
  sendJson(res, 202, { started: true });
}

async function listBugs(req, res, url) {
  const items = projectItems('bugs', projectIdParam(url));
  sendJson(res, 200, { items, total: items.length, transitions: BUG_TRANSITIONS });
}

async function createBug(req, res) {
  const body = await readJsonBody(req);
  const result = validateBug(body);
  if (!result.ok) {
    throw new HttpError(400, 'Dữ liệu không hợp lệ', result.errors);
  }
  const projectId = resolveProjectId(body);
  const item = store.insert('bugs', { ...result.value, projectId, status: 'new' });
  sendJson(res, 201, item);
}

async function updateBug(req, res, url, match) {
  const id = match[1];
  const current = store.find('bugs', id);
  if (!current) {
    throw new HttpError(404, `Không tìm thấy ${id}`);
  }
  const result = validateBugUpdate(await readJsonBody(req));
  if (!result.ok) {
    throw new HttpError(400, 'Dữ liệu không hợp lệ', result.errors);
  }
  const patch = { ...result.value };
  if (patch.status !== undefined && patch.status !== current.status) {
    const allowed = BUG_TRANSITIONS[current.status] ?? [];
    if (!allowed.includes(patch.status)) {
      throw new HttpError(409, `Không thể chuyển từ "${current.status}" sang "${patch.status}"`, {
        status: allowed.length ? `Chỉ được chuyển tới: ${allowed.join(', ')}` : 'Bug đã ở trạng thái cuối',
      });
    }
    if (patch.status === 'closed') patch.closedAt = new Date().toISOString();
  }
  sendJson(res, 200, store.update('bugs', id, patch));
}

async function listReviews(req, res) {
  const items = store.list('reviews');
  sendJson(res, 200, { items, total: items.length });
}

async function createReview(req, res) {
  const result = validateReview(await readJsonBody(req));
  if (!result.ok) {
    throw new HttpError(400, 'Dữ liệu không hợp lệ', result.errors);
  }
  sendJson(res, 201, store.insert('reviews', result.value));
}

async function listChecklist(req, res) {
  const items = store.list('checklist');
  const done = items.filter((item) => item.done).length;
  sendJson(res, 200, { items, total: items.length, done });
}

async function updateChecklist(req, res, url, match) {
  const id = match[1];
  if (!store.find('checklist', id)) {
    throw new HttpError(404, `Không tìm thấy ${id}`);
  }
  const result = validateChecklistUpdate(await readJsonBody(req));
  if (!result.ok) {
    throw new HttpError(400, 'Dữ liệu không hợp lệ', result.errors);
  }
  sendJson(res, 200, store.update('checklist', id, result.value));
}

// ---------- Dự án ----------

function projectOrThrow(id) {
  const project = store.find('projects', id);
  if (!project) throw new HttpError(404, `Không tìm thấy ${id}`);
  return project;
}

async function listProjects(req, res) {
  const items = store.list('projects').map((project) => {
    const testcases = projectItems('testcases', project.id);
    const bugs = projectItems('bugs', project.id);
    const runs = store.list('runs').filter((run) => run.projectId === project.id);
    return {
      ...project,
      testcaseCount: testcases.length,
      bugsOpen: snapshotRun({ testcases, bugs }).bugsOpen,
      runCount: runs.length,
      lastRunAt: runs.at(-1)?.finishedAt ?? null,
    };
  });
  sendJson(res, 200, { items, total: items.length, steps: WORKFLOW_STEPS });
}

async function createProject(req, res) {
  const result = validateProject(await readJsonBody(req));
  if (!result.ok) throw new HttpError(400, 'Dữ liệu không hợp lệ', result.errors);
  const workflow = { ...emptyWorkflow(), source: true };
  const created = store.insert('projects', { ...result.value, workflow, extraFindings: '', checklistState: {} });
  scheduleAutoPipeline(created.id);
  sendJson(res, 201, created);
}

async function getProject(req, res, url, match) {
  const project = projectOrThrow(match[1]);
  const runs = store.list('runs').filter((run) => run.projectId === project.id).reverse();
  sendJson(res, 200, { project, steps: WORKFLOW_STEPS, runs });
}

async function updateProjectNotes(req, res, url, match) {
  projectOrThrow(match[1]);
  const result = validateProjectNotes(await readJsonBody(req));
  if (!result.ok) throw new HttpError(400, 'Dữ liệu không hợp lệ', result.errors);
  sendJson(res, 200, store.update('projects', match[1], result.value));
}

async function updateWorkflowStep(req, res, url, match) {
  const project = projectOrThrow(match[1]);
  const key = match[2];
  const step = WORKFLOW_STEPS.find((s) => s.key === key);
  const result = validateWorkflowPatch(await readJsonBody(req));
  if (!result.ok) throw new HttpError(400, 'Dữ liệu không hợp lệ', result.errors);
  const { done, confirmed } = result.value;
  if (done && step.needsConfirm && project.sourceType !== 'local' && !confirmed) {
    throw new HttpError(409, 'Bước này chạy mã của dự án bên ngoài, cần xác nhận trước', {
      confirmed: 'Tích xác nhận rồi mới đánh dấu bước này',
    });
  }
  sendJson(res, 200, store.update('projects', project.id, {
    workflow: { ...project.workflow, [key]: done },
  }));
}

// Chỉ lấy mã nguồn (clone nông, không chạy script nào của repo). Cài đặt và chạy test vẫn cần xác nhận riêng.
async function cloneProject(req, res, url, match) {
  const project = projectOrThrow(match[1]);
  if (project.sourceType !== 'github') {
    throw new HttpError(400, 'Chỉ dự án GitHub mới lấy mã nguồn bằng bước này');
  }
  // Thư mục tạm ngắn: đường dẫn dài trong thư mục dự án làm git lỗi trên Windows.
  const base = path.join(os.tmpdir(), 'qa-hub-workspaces');
  const dir = path.join(base, project.id);
  if (existsSync(dir)) {
    throw new HttpError(409, 'Mã nguồn đã được lấy trước đó');
  }
  mkdirSync(base, { recursive: true });
  try {
    await execFileAsync('git', ['clone', '--depth', '1', '--quiet', project.sourceRef, dir], { timeout: 90000 });
  } catch (err) {
    rmSync(dir, { recursive: true, force: true });
    throw new HttpError(502, 'Không clone được repo', { sourceRef: String(err.stderr || err.message).split('\n')[0].slice(0, 200) });
  }
  const workflow = { ...project.workflow, clone: true };
  const updated = store.update('projects', project.id, { workflow, localPath: dir });
  scheduleAutoPipeline(project.id);
  sendJson(res, 200, updated);
}

async function recordRun(req, res, url, match) {
  const project = projectOrThrow(match[1]);
  const body = await readJsonBody(req);
  const note = isObject(body) && typeof body.note === 'string' ? body.note.trim().slice(0, 500) : '';
  const snapshot = snapshotRun({
    testcases: projectItems('testcases', project.id),
    bugs: projectItems('bugs', project.id),
  });
  const now = new Date().toISOString();
  const run = store.insert('runs', { projectId: project.id, startedAt: now, finishedAt: now, note, snapshot });
  const executed = snapshot.total - snapshot.byResult.not_run > 0;
  const workflow = { ...project.workflow, report: true };
  if (executed && project.sourceType === 'local') workflow.tests = true;
  store.update('projects', project.id, { workflow });
  sendJson(res, 201, run);
}

async function getProjectReport(req, res, url, match) {
  const project = projectOrThrow(match[1]);
  const testcases = projectItems('testcases', project.id);
  const bugs = projectItems('bugs', project.id);
  const requirements = store.list('requirements');
  sendJson(res, 200, {
    generatedAt: new Date().toISOString(),
    project,
    steps: WORKFLOW_STEPS.map((step) => ({ ...step, done: Boolean(project.workflow[step.key]) })),
    testcases,
    bugs,
    runs: store.list('runs').filter((run) => run.projectId === project.id).slice(-5).reverse(),
    summary: buildSummary({ testcases, requirements, bugs }),
    extraFindings: project.extraFindings ?? '',
    checklist: projectChecklist(project),
    scan: project.scan ?? null,
    checklistAi: project.checklistAi ?? null,
  });
}

// ---------- Mã nguồn, quét domain, AI review, checklist theo dự án ----------

const workspaceFor = (id) => path.join(os.tmpdir(), 'qa-hub-workspaces', id);

// Dự án mặc định dùng checklist toàn cục; dự án khác có trạng thái riêng.
function projectChecklist(project) {
  const state = project.checklistState ?? {};
  return store.list('checklist').map((item) => ({
    ...item,
    done: project.id === DEFAULT_PROJECT_ID ? item.done : Boolean(state[item.id]),
  }));
}

async function readRawBody(req, limit) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limit) throw new HttpError(413, 'File zip vượt quá 20 MB');
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

async function uploadZip(req, res, url, match) {
  const project = projectOrThrow(match[1]);
  if (project.sourceType !== 'zip') {
    throw new HttpError(400, 'Chỉ dự án nguồn zip mới nhận file upload');
  }
  const type = (req.headers['content-type'] ?? '').split(';')[0].trim();
  if (type !== 'application/zip') throw new HttpError(415, 'Content-Type phải là application/zip');
  const buffer = await readRawBody(req, ZIP_LIMITS.maxArchiveBytes);
  const dir = workspaceFor(project.id);
  const staging = `${dir}-staging`;
  rmSync(staging, { recursive: true, force: true });
  try {
    extractZip(buffer, staging);
  } catch (err) {
    rmSync(staging, { recursive: true, force: true });
    if (err instanceof ZipError) throw new HttpError(400, err.message);
    throw err;
  }
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(path.dirname(dir), { recursive: true });
  renameSync(staging, dir);
  let rawName = 'upload.zip';
  try {
    rawName = decodeURIComponent(String(req.headers['x-file-name'] ?? 'upload.zip'));
  } catch {
    rawName = 'upload.zip';
  }
  const fileName = path.basename(rawName).replace(/[^\w.-]/g, '_').slice(0, 120);
  const updated = store.update('projects', project.id, {
    workflow: { ...project.workflow, clone: true },
    localPath: dir,
    sourceRef: fileName,
  });
  scheduleAutoPipeline(project.id);
  sendJson(res, 200, updated);
}

const SCAN_COOLDOWN_MS = 60000;

async function scanProject(req, res, url, match) {
  const project = projectOrThrow(match[1]);
  if (project.sourceType !== 'domain' || project.ownershipConfirmed !== true) {
    throw new HttpError(400, 'Chỉ quét dự án domain đã xác nhận quyền');
  }
  const last = project.scan?.scannedAt ? Date.parse(project.scan.scannedAt) : 0;
  if (Date.now() - last < SCAN_COOLDOWN_MS) {
    throw new HttpError(429, 'Đợi 60 giây giữa hai lần quét');
  }
  let scan;
  try {
    scan = await scanDomain(project.sourceRef);
  } catch (err) {
    const network = err.name === 'TimeoutError' || /fetch failed/i.test(err.message);
    throw new HttpError(network ? 502 : 400, network ? 'Không kết nối được domain' : err.message);
  }
  const homeOk = scan.checks.some((c) => (c.name === 'Trang chủ tải được' || c.name === 'Trang chủ chuyển hướng') && c.ok);
  sendJson(res, 200, store.update('projects', project.id, {
    scan,
    workflow: { ...project.workflow, smoke: homeOk },
  }));
}

async function aiReview(req, res, url, match) {
  const project = projectOrThrow(match[1]);
  const body = await readJsonBody(req);
  // Rà soát mã hiện chỉ dùng Claude; provider khác dùng luật.
  const active = activeAi();
  const apiKey = active?.kind === 'anthropic' ? active.apiKey : undefined;
  // Chỉ gửi trích đoạn mã ra ngoài khi có key và người dùng đồng ý.
  if (apiKey && !(isObject(body) && body.consent === true)) {
    throw new HttpError(400, 'Dữ liệu không hợp lệ', {
      consent: 'Đồng ý gửi trích đoạn mã tới Claude API (hoặc tắt AI để chỉ dùng luật)',
    });
  }
  if (!project.localPath || !existsSync(project.localPath)) {
    throw new HttpError(409, 'Chưa có mã nguồn: hãy upload zip hoặc clone trước');
  }
  const { tree, excerpts } = collectProjectFiles(project.localPath);
  const items = store.list('checklist');
  let mode = 'rules';
  let note = null;
  let suggestions;
  if (apiKey) {
    try {
      suggestions = await claudeSuggestions({ apiKey, items, tree, excerpts });
      mode = 'ai';
    } catch {
      suggestions = ruleSuggestions(tree, items);
      note = 'AI lỗi, dùng luật dự phòng';
    }
  } else {
    suggestions = ruleSuggestions(tree, items);
  }
  sendJson(res, 200, store.update('projects', project.id, {
    checklistAi: { reviewedAt: new Date().toISOString(), mode, note, fileCount: tree.length, suggestions },
  }));
}

async function applyAiReview(req, res, url, match) {
  const project = projectOrThrow(match[1]);
  const body = await readJsonBody(req);
  const ids = isObject(body) && Array.isArray(body.ids) && body.ids.every((id) => typeof id === 'string')
    ? body.ids
    : null;
  if (!ids) throw new HttpError(400, 'Dữ liệu không hợp lệ', { ids: 'ids phải là danh sách mã mục' });
  const accepted = (project.checklistAi?.suggestions ?? []).filter((s) => s.done && ids.includes(s.id));
  const state = { ...(project.checklistState ?? {}) };
  for (const s of accepted) state[s.id] = true;
  if (project.id === DEFAULT_PROJECT_ID) {
    for (const s of accepted) store.update('checklist', s.id, { done: true });
  }
  sendJson(res, 200, { applied: accepted.map((s) => s.id), project: store.update('projects', project.id, { checklistState: state }) });
}

async function getProjectChecklist(req, res, url, match) {
  const project = projectOrThrow(match[1]);
  const items = projectChecklist(project);
  sendJson(res, 200, { items, total: items.length, done: items.filter((i) => i.done).length });
}

async function setProjectChecklistItem(req, res, url, match) {
  const project = projectOrThrow(match[1]);
  const id = match[2];
  if (!store.find('checklist', id)) throw new HttpError(404, `Không tìm thấy ${id}`);
  const result = validateChecklistUpdate(await readJsonBody(req));
  if (!result.ok) throw new HttpError(400, 'Dữ liệu không hợp lệ', result.errors);
  if (project.id === DEFAULT_PROJECT_ID) {
    store.update('checklist', id, { done: result.value.done });
    sendJson(res, 200, store.find('checklist', id));
    return;
  }
  sendJson(res, 200, store.update('projects', project.id, {
    checklistState: { ...(project.checklistState ?? {}), [id]: result.value.done },
  }));
}

// Trạng thái app cho trợ lý: lấy từ dữ liệu thật, không để client tự gửi lên.
function gatherAssistantState(projectId = DEFAULT_PROJECT_ID) {
  const summary = currentSummary(projectId);
  const testcases = projectItems('testcases', projectId);
  const requirements = store.list('requirements');
  const suites = store.list('suites');
  const checklist = projectChecklist(projectOrThrow(projectId));
  const stlc = buildStlc({ testcases, requirements, suites, checklist, summary, planReady: planExists() });
  return { stlc, checklist, testcases, requirements, summary, projectId };
}

const AI_SETTINGS_FILE = path.join(DATA_DIR, 'ai-settings.json');

// Đọc cấu hình AI đã lưu; file hỏng hoặc chưa có thì dùng mặc định.
function loadAiSettings() {
  try {
    const parsed = JSON.parse(readFileSync(AI_SETTINGS_FILE, 'utf8'));
    return { ...DEFAULT_SETTINGS, ...parsed, keys: { ...(parsed.keys ?? {}) } };
  } catch {
    return { ...DEFAULT_SETTINGS, keys: {} };
  }
}

// Ghi tạm rồi đổi tên để không bao giờ để file ghi dở.
function saveAiSettings(settings) {
  mkdirSync(DATA_DIR, { recursive: true });
  const tmp = `${AI_SETTINGS_FILE}.tmp`;
  writeFileSync(tmp, JSON.stringify(settings, null, 2), { mode: 0o600 });
  renameSync(tmp, AI_SETTINGS_FILE);
}

function activeAi() {
  return resolveActive(loadAiSettings(), process.env);
}

async function getAiSettings(req, res) {
  sendJson(res, 200, { ...publicView(loadAiSettings()), presets: PROVIDERS });
}

async function putAiSettings(req, res) {
  const result = applySettingsUpdate(loadAiSettings(), await readJsonBody(req));
  if (!result.ok) throw new HttpError(400, 'Dữ liệu không hợp lệ', result.errors);
  saveAiSettings(result.value);
  sendJson(res, 200, { ...publicView(result.value), presets: PROVIDERS });
}

async function getAssistant(req, res, url) {
  const projectId = projectIdParam(url);
  const report = buildGapReport(gatherAssistantState(projectId));
  sendJson(res, 200, { aiEnabled: Boolean(activeAi()), projectId, report });
}

async function postAssistant(req, res) {
  const body = await readJsonBody(req);
  const message = isObject(body) && typeof body.message === 'string' ? body.message.trim() : '';
  if (message.length === 0 || message.length > MAX_MESSAGE) {
    throw new HttpError(400, 'Dữ liệu không hợp lệ', { message: `Tin nhắn từ 1 đến ${MAX_MESSAGE} ký tự` });
  }
  const projectId = resolveProjectId(body);
  const state = gatherAssistantState(projectId);
  const report = buildGapReport(state);
  const active = activeAi();
  if (!active) {
    sendJson(res, 200, { aiEnabled: false, reply: fallbackReply(report), report });
    return;
  }
  try {
    const context = buildContextText(report, { execution: state.summary.execution, bugs: state.summary.bugs });
    const reply = await askProvider({ active, message, context });
    sendJson(res, 200, { aiEnabled: true, reply, report });
  } catch {
    sendJson(res, 502, { error: 'Không gọi được trợ lý AI, thử lại sau', aiEnabled: true, report });
  }
}

const ROUTES = [
  { method: 'GET', pattern: /^\/api\/ai\/settings$/, handler: getAiSettings },
  { method: 'PUT', pattern: /^\/api\/ai\/settings$/, handler: putAiSettings },
  { method: 'GET', pattern: /^\/api\/autorun$/, handler: getAutorun },
  { method: 'POST', pattern: /^\/api\/autorun\/run$/, handler: postAutorunRun },
  { method: 'GET', pattern: /^\/api\/projects$/, handler: listProjects },
  { method: 'POST', pattern: /^\/api\/projects$/, handler: createProject },
  { method: 'GET', pattern: /^\/api\/projects\/(PRJ-\d{3,})$/, handler: getProject },
  { method: 'PATCH', pattern: /^\/api\/projects\/(PRJ-\d{3,})\/notes$/, handler: updateProjectNotes },
  { method: 'PATCH', pattern: /^\/api\/projects\/(PRJ-\d{3,})\/workflow\/(source|clone|install|smoke|tests|report)$/, handler: updateWorkflowStep },
  { method: 'POST', pattern: /^\/api\/projects\/(PRJ-\d{3,})\/clone$/, handler: cloneProject },
  { method: 'POST', pattern: /^\/api\/projects\/(PRJ-\d{3,})\/upload$/, handler: uploadZip },
  { method: 'POST', pattern: /^\/api\/projects\/(PRJ-\d{3,})\/scan$/, handler: scanProject },
  { method: 'POST', pattern: /^\/api\/projects\/(PRJ-\d{3,})\/auto$/, handler: runPipelineNow },
  { method: 'GET', pattern: /^\/api\/progress$/, handler: getProgress },
  { method: 'POST', pattern: /^\/api\/run-all$/, handler: runEverything },
  { method: 'POST', pattern: /^\/api\/automation\/sync$/, handler: syncAutoResults },
  { method: 'POST', pattern: /^\/api\/automation\/ci-report$/, handler: applyCiReport },
  { method: 'GET', pattern: /^\/api\/ci\/latest$/, handler: getCiLatest },
  { method: 'GET', pattern: /^\/api\/ci\/progress$/, handler: getCiProgress },
  { method: 'POST', pattern: /^\/api\/ci\/run$/, handler: runCi },
  { method: 'POST', pattern: /^\/api\/projects\/(PRJ-\d{3,})\/ai-review$/, handler: aiReview },
  { method: 'POST', pattern: /^\/api\/projects\/(PRJ-\d{3,})\/ai-review\/apply$/, handler: applyAiReview },
  { method: 'GET', pattern: /^\/api\/projects\/(PRJ-\d{3,})\/checklist$/, handler: getProjectChecklist },
  { method: 'PATCH', pattern: /^\/api\/projects\/(PRJ-\d{3,})\/checklist\/(CL-\d{2})$/, handler: setProjectChecklistItem },
  { method: 'POST', pattern: /^\/api\/projects\/(PRJ-\d{3,})\/runs$/, handler: recordRun },
  { method: 'GET', pattern: /^\/api\/projects\/(PRJ-\d{3,})\/report$/, handler: getProjectReport },
  { method: 'GET', pattern: /^\/api\/assistant$/, handler: getAssistant },
  { method: 'POST', pattern: /^\/api\/assistant$/, handler: postAssistant },
  { method: 'GET', pattern: /^\/api\/health$/, handler: getHealth },
  { method: 'GET', pattern: /^\/api\/stats$/, handler: getStats },
  { method: 'GET', pattern: /^\/api\/stages$/, handler: getStages },
  { method: 'GET', pattern: /^\/api\/stlc$/, handler: getStlc },
  { method: 'GET', pattern: /^\/api\/summary$/, handler: getSummary },
  { method: 'GET', pattern: /^\/api\/plan$/, handler: getPlan },
  { method: 'GET', pattern: /^\/api\/requirements$/, handler: listRequirements },
  { method: 'GET', pattern: /^\/api\/suites$/, handler: listSuites },
  { method: 'GET', pattern: /^\/api\/testcases$/, handler: listTestCases },
  { method: 'POST', pattern: /^\/api\/testcases$/, handler: createTestCase },
  { method: 'PATCH', pattern: /^\/api\/testcases\/(TC-\d{3,})$/, handler: updateTestCase },
  { method: 'GET', pattern: /^\/api\/bugs$/, handler: listBugs },
  { method: 'POST', pattern: /^\/api\/bugs$/, handler: createBug },
  { method: 'PATCH', pattern: /^\/api\/bugs\/(BUG-\d{3,})$/, handler: updateBug },
  { method: 'GET', pattern: /^\/api\/reviews$/, handler: listReviews },
  { method: 'POST', pattern: /^\/api\/reviews$/, handler: createReview },
  { method: 'GET', pattern: /^\/api\/checklist$/, handler: listChecklist },
  { method: 'PATCH', pattern: /^\/api\/checklist\/(CL-\d{2})$/, handler: updateChecklist },
];

async function handleApi(req, res, url) {
  const matched = ROUTES
    .map((route) => ({ route, match: route.pattern.exec(url.pathname) }))
    .filter((entry) => entry.match);
  if (matched.length === 0) {
    throw new HttpError(404, 'API không tồn tại');
  }
  const hit = matched.find((entry) => entry.route.method === req.method);
  if (!hit) {
    const allow = [...new Set(matched.map((entry) => entry.route.method))].join(', ');
    return sendJson(res, 405, { error: 'Method không được hỗ trợ' }, { Allow: allow });
  }
  return hit.route.handler(req, res, url, hit.match);
}

async function serveStatic(req, res, pathname) {
  const requested = pathname === '/' ? '/index.html' : pathname;
  const filePath = path.normalize(path.join(PUBLIC_DIR, decodeURIComponent(requested)));
  if (!filePath.startsWith(PUBLIC_DIR + path.sep)) {
    throw new HttpError(403, 'Không có quyền truy cập');
  }
  let body;
  try {
    body = await readFile(filePath);
  } catch {
    throw new HttpError(404, 'Không tìm thấy trang');
  }
  res.writeHead(200, {
    ...SECURITY_HEADERS,
    'Content-Type': MIME_TYPES[path.extname(filePath)] ?? 'application/octet-stream',
    'Content-Length': body.length,
    'Cache-Control': 'no-cache',
  });
  res.end(req.method === 'HEAD' ? undefined : body);
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? '/', 'http://localhost');
    if (url.pathname.startsWith('/api/')) {
      await handleApi(req, res, url);
      return;
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      sendJson(res, 405, { error: 'Method không được hỗ trợ' }, { Allow: 'GET, HEAD' });
      return;
    }
    await serveStatic(req, res, url.pathname);
  } catch (err) {
    if (err instanceof HttpError) {
      const body = { error: err.message };
      if (err.details) body.details = err.details;
      sendJson(res, err.status, body);
      return;
    }
    if (err instanceof URIError) {
      sendJson(res, 400, { error: 'Đường dẫn không hợp lệ' });
      return;
    }
    console.error(err);
    sendJson(res, 500, { error: 'Lỗi máy chủ' });
  }
});

// ---------- Tự chạy bộ test theo lịch ----------

// Ghi kết quả thật của lần tự chạy vào lịch sử dự án QA Hub.
function recordAutoRun(record) {
  const testcases = projectItems('testcases', DEFAULT_PROJECT_ID);
  const bugs = projectItems('bugs', DEFAULT_PROJECT_ID);
  const passed = record.exitCode === 0;
  store.insert('runs', {
    projectId: DEFAULT_PROJECT_ID,
    startedAt: record.startedAt,
    finishedAt: record.finishedAt,
    note: `Tự chạy bộ test (exit ${record.exitCode})`,
    snapshot: snapshotRun({ testcases, bugs }),
    suite: { passed: record.passed ?? 0, failed: record.failed ?? 0, flaky: record.flaky ?? 0, durationMs: record.durationMs ?? null, exitCode: record.exitCode },
  });
  const project = store.find('projects', DEFAULT_PROJECT_ID);
  store.update('projects', DEFAULT_PROJECT_ID, {
    workflow: { ...project.workflow, tests: passed, report: true },
  });
}

// Sau mỗi lần chạy bộ test, tự cập nhật kết quả test case bằng cách chạy script thực thi.
// Tắt mặc định: script này ghi test case thử vào dữ liệu thật. Chỉ bật khi AUTO_EXECUTE=on và server chạy trên dữ liệu thử.
const AUTO_EXECUTE_ON = process.env.AUTO_EXECUTE === 'on';
function runExecutorAfterTests() {
  if (!AUTO_EXECUTE_ON) return;
  const child = spawn(process.execPath, [path.join(root, 'scripts', 'execute-test-cases.mjs')], {
    cwd: root,
    env: { ...process.env, BASE_URL: `http://${HOST}:${PORT}` },
    stdio: 'ignore',
  });
  child.on('error', (err) => console.error('Không chạy được script thực thi:', err.message));
}

const autorunFinish = (record) => {
  recordAutoRun(record);
  runExecutorAfterTests();
};

// Mặc định 60 phút một lần; đặt AUTO_TEST_MINUTES=0 để tắt.
const autoMinutes = Number(process.env.AUTO_TEST_MINUTES ?? 60);
const autorunner = createAutoRunner({ root, resultsFile: RESULTS_FILE, onFinish: autorunFinish });
const autoInterval = autoMinutes > 0 ? autorunner.start(autoMinutes) : null;
// Khởi động xong là tự chạy một lượt, không cần bấm (đợi 30 giây để server ổn định).
const STARTUP_DELAY_MS = 30000;
if (autoMinutes > 0) setTimeout(() => autorunner.runNow(), STARTUP_DELAY_MS).unref();

// ---------- Luồng tự động theo dự án ----------
const AUTO_PIPELINE_ON = process.env.AUTO_PIPELINE !== 'off';
const PIPELINE_MINUTES = Number(process.env.PIPELINE_MINUTES ?? 60);

const DEFENDER_CLI = findDefenderCli(existsSync, (dir) => readdirSync(dir));

function pipelineDeps() {
  return {
    scanDomain,
    scanVirus: (dir) => scanForThreats(dir, { cli: DEFENDER_CLI }),
    runTests: (dir) => runProjectTests(dir),
    recordTests: (id, status) => {
      store.update('projects', id, { testedAt: new Date().toISOString(), testStatus: status });
    },
    saveScan: (id, scan, homeOk) => {
      const project = store.find('projects', id);
      store.update('projects', id, { scan, workflow: { ...project.workflow, smoke: homeOk } });
    },
    exists: existsSync,
    collectFiles: collectProjectFiles,
    collectSources: collectSourceFiles,
    saveTestIdeas: (projectId, ideas) => saveTestIdeas(store, projectId, ideas),
    suggest: async ({ tree, excerpts }) => {
      const items = store.list('checklist');
      const active = activeAi();
      // AI chỉ đọc mã khi người dùng đã bật đồng ý trong phần cấu hình AI.
      if (active && loadAiSettings().allowCodeToAi === true) {
        try {
          return await aiSuggestions({ active, items, tree, excerpts });
        } catch (err) {
          console.error('AI đọc mã lỗi, dùng bộ luật:', err.message);
        }
      }
      return ruleSuggestions(tree, items);
    },
    applyChecklist: (id, suggestions, doneIds) => {
      const project = store.find('projects', id);
      const state = { ...(project.checklistState ?? {}) };
      for (const itemId of doneIds) state[itemId] = true;
      if (id === DEFAULT_PROJECT_ID) {
        for (const itemId of doneIds) store.update('checklist', itemId, { done: true });
      }
      store.update('projects', id, {
        checklistState: state,
        checklistAi: { reviewedAt: new Date().toISOString(), mode: 'rules', note: 'Tự động sau khi có mã', fileCount: null, suggestions },
      });
    },
    recordReport: (id) => {
      const project = store.find('projects', id);
      store.update('projects', id, { workflow: { ...project.workflow, report: true } });
    },
  };
}

function logPipelineError(projectId, err) {
  console.error(`Luồng tự động lỗi cho ${projectId}:`, err.message);
}

// Lượt tự động gần nhất, để bảng tiến độ bên phải hiển thị. Chỉ một lượt chạy tại một thời điểm.
let latestJob = null;
let jobCount = 0;

function startTrackedPipeline(project, options = {}) {
  if (latestJob?.state === 'running') return null;
  jobCount += 1;
  const jobId = `JOB-${String(jobCount).padStart(3, '0')}`;
  latestJob = newJob({ id: jobId, projectId: project.id, stepDefs: PIPELINE_STEPS, now: new Date().toISOString() });
  const onStep = (key, status, detail) => {
    if (latestJob?.id === jobId) latestJob = setStep(latestJob, key, status, detail);
  };
  return runProjectPipeline(project, { ...pipelineDeps(), onStep }, options)
    .then((outcome) => {
      latestJob = { ...latestJob, state: 'done', finishedAt: new Date().toISOString() };
      return outcome;
    })
    .catch((err) => {
      latestJob = { ...latestJob, state: 'error', finishedAt: new Date().toISOString() };
      logPipelineError(project.id, err);
      throw err;
    });
}

function scheduleAutoPipeline(projectId) {
  if (!AUTO_PIPELINE_ON) return;
  setImmediate(() => {
    const project = store.find('projects', projectId);
    const run = project && startTrackedPipeline(project);
    if (run) run.catch(() => {}); // Lỗi đã được ghi trong startTrackedPipeline.
  });
}

async function runAllPipelines() {
  for (const project of store.list('projects')) {
    const run = startTrackedPipeline(project);
    if (!run) return;
    await run.catch(() => {});
  }
}

// Body tùy chọn: { "runTests": true } để chạy test ngay (nút "Chạy từ A đến Z").
async function runPipelineNow(req, res, url, match) {
  const project = projectOrThrow(match[1]);
  const body = await readJsonBody(req).catch(() => ({}));
  const run = startTrackedPipeline(project, { force: body?.runTests === true });
  if (!run) throw new HttpError(409, 'Đang có lượt tự động chạy, đợi lượt đó xong');
  sendJson(res, 200, await run);
}

// Ưu tiên bộ test đang chạy (hiện test nào đang chạy và đã xong bao nhiêu), không thì lượt dự án gần nhất.
// Chạy toàn bộ: bộ test QA Hub + mọi dự án. Chỉ bật khi tự chạy đang bật (không chạy trong test).
async function runEverything(req, res) {
  if (autoMinutes <= 0) {
    sendJson(res, 200, { started: false, reason: 'Tự chạy đang tắt (AUTO_TEST_MINUTES=0)' });
    return;
  }
  const tests = autorunner.runNow();
  const projectsRunning = latestJob?.state !== 'running';
  if (projectsRunning) runAllPipelines();
  sendJson(res, 202, { started: tests.started || projectsRunning, tests, projects: projectsRunning ? 'started' : 'already running' });
}
async function getProgress(req, res) {
  const live = autorunner.status().live;
  if (live.running) {
    sendJson(res, 200, {
      kind: 'tests', state: 'running', percent: live.percent, current: live.current,
      done: live.done, total: live.total, passed: live.passed, failed: live.failed, steps: [],
    });
    return;
  }
  sendJson(res, 200, { kind: 'pipeline', ...summarize(latestJob) });
}

if (AUTO_PIPELINE_ON && PIPELINE_MINUTES > 0) {
  // unref để timer không giữ tiến trình sống khi server tắt.
  setInterval(runAllPipelines, PIPELINE_MINUTES * 60000).unref();
  setTimeout(runAllPipelines, STARTUP_DELAY_MS).unref();
}

async function getAutorun(req, res) {
  sendJson(res, 200, autorunner.status(autoInterval));
}

async function postAutorunRun(req, res) {
  const result = autorunner.runNow();
  if (!result.started) throw new HttpError(409, result.reason);
  sendJson(res, 202, { started: true });
}

server.listen(PORT, HOST, () => {
  console.log(`QA Hub đang chạy tại http://${HOST}:${PORT}`);
});

export { server };
