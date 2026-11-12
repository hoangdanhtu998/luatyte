// Pipeline CI của QA Hub: chạy thật từng bước, ghi log và kết quả từng bước, rồi tự tick checklist kèm bằng chứng.
// Dùng: npm run ci   (LIVE_URL mặc định http://127.0.0.1:3000 để gửi tick vào QA Hub đang chạy)
// Dữ liệu thử nghiệm của CI nằm ở .ci-data, không ghi vào dữ liệu thật.
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, openSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CI_STAGES, evaluateChecklistEvidence } from '../lib/ci-plan.js';
import { collectSpecResults } from '../lib/auto-results.js';
import { axeEvidence, lighthouseEvidence } from '../lib/evidence.js';
import { npmCliPath } from '../lib/project-tests.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CI_DIR = path.join(ROOT, 'results', 'ci');
// 4190 là cổng bị fetch của Node chặn (bad port), nên dùng 4290.
const CI_PORT = Number(process.env.CI_PORT ?? 4290);
const CI_BASE = `http://127.0.0.1:${CI_PORT}`;
const LIVE_URL = (process.env.LIVE_URL ?? 'http://127.0.0.1:3000').replace(/\/$/, '');
const LOG_TAIL_LINES = 40;

function run(args, { env = {}, cwd = ROOT } = {}) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, args, { cwd, env: { ...process.env, ...env } });
    let output = '';
    const onData = (chunk) => { output += chunk.toString(); };
    child.stdout.on('data', onData);
    child.stderr.on('data', onData);
    child.on('close', (code) => resolve({ code, output }));
    child.on('error', (err) => resolve({ code: -1, output: err.message }));
  });
}

function tail(text) {
  return text.split(/\r?\n/).filter(Boolean).slice(-LOG_TAIL_LINES).join('\n');
}

function readJson(file) {
  return existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : null;
}

async function waitForHealth(url, attempts = 60) {
  let lastError = 'không có phản hồi';
  for (let i = 0; i < attempts; i += 1) {
    try {
      const res = await fetch(`${url}/api/health`);
      if (res.ok) return true;
      lastError = `HTTP ${res.status}`;
    } catch (err) {
      lastError = err.cause?.code ?? err.message;
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  console.error(`Server CI chưa sẵn sàng tại ${url}: ${lastError}`);
  return false;
}

function jsFilesIn(dir) {
  return readdirSync(path.join(ROOT, dir)).filter((f) => f.endsWith('.js') || f.endsWith('.mjs')).map((f) => `${dir}/${f}`);
}

async function stageInstall() {
  const r = await run([npmCliPath(), 'install', '--no-audit', '--no-fund'], { cwd: ROOT });
  return { ok: r.code === 0, detail: r.code === 0 ? 'npm install thành công' : `npm install lỗi (mã ${r.code})`, log: tail(r.output) };
}

async function stageSyntax() {
  const files = ['server.js', 'public/app.js', ...jsFilesIn('lib'), ...jsFilesIn('scripts')];
  const failures = [];
  for (const f of files) {
    const r = await run(['--check', path.join(ROOT, f)]);
    if (r.code !== 0) failures.push(`${f}: ${tail(r.output).split('\n').slice(-3).join(' ')}`);
  }
  return {
    ok: failures.length === 0,
    detail: failures.length ? `${failures.length} file lỗi cú pháp` : `${files.length} file JS đều đúng cú pháp`,
    log: failures.join('\n') || `Đã kiểm ${files.length} file`,
  };
}

async function stageE2E() {
  const r = await run([path.join(ROOT, 'node_modules', '@playwright', 'test', 'cli.js'), 'test'], { cwd: ROOT });
  const report = readJson(path.join(ROOT, 'results', 'playwright-results.json'));
  const stats = report?.stats ?? {};
  const passed = stats.expected ?? 0;
  const failed = stats.unexpected ?? 0;
  const ok = r.code === 0 && failed === 0 && passed > 0;
  return {
    ok,
    detail: `${passed} đạt, ${failed} lỗi, ${stats.skipped ?? 0} bỏ qua`,
    failures: failingTitles(report),
    log: tail(r.output),
  };
}

// Tiêu đề các test lỗi (tối đa 10) để tóm tắt sau khi chạy.
function failingTitles(report) {
  const titles = [];
  const visit = (suite) => {
    for (const spec of suite.specs ?? []) {
      if ((spec.tests ?? []).some((t) => t.status === 'unexpected')) titles.push(spec.title);
    }
    for (const child of suite.suites ?? []) visit(child);
  };
  for (const suite of report?.suites ?? []) visit(suite);
  return [...new Set(titles)].slice(0, 10);
}

// Tóm tắt ngắn gọn toàn bộ lần chạy: mỗi bước một dòng, kèm test lỗi và số mục đã tick.
export function summarize(stages, ticks, sentNote) {
  const lines = ['TÓM TẮT CI'];
  for (const s of stages) {
    lines.push(`${s.ok ? '✓' : '✗'} ${s.label}: ${s.detail}`);
    for (const f of s.failures ?? []) lines.push(`    - lỗi: ${f}`);
  }
  const ticked = ticks.filter((t) => t.done).length;
  lines.push(`Checklist: ${ticked}/${ticks.length} mục có bằng chứng đạt (đã tick)`);
  if (sentNote) lines.push(sentNote);
  return lines.join('\n');
}

async function stageSync(server) {
  if (!server) return { ok: false, detail: 'Không khởi động được server CI', log: '' };
  const res = await fetch(`${CI_BASE}/api/automation/sync`, { method: 'POST' });
  const body = await res.json().catch(() => ({}));
  return {
    ok: res.ok,
    detail: res.ok ? `${body.matched} test case nhận kết quả tự động` : `Lỗi ${res.status}`,
    log: JSON.stringify(body.updated ?? body, null, 2),
  };
}

async function stageA11y() {
  const r = await run([path.join(ROOT, 'scripts', 'accessibility-check.mjs')], { env: { BASE_URL: CI_BASE } });
  const axe = readJson(path.join(CI_DIR_A11Y, 'axe-report.json'));
  const ev = axeEvidence(axe);
  return { ok: r.code === 0, detail: ev ? ev.detail : 'không có báo cáo axe', log: tail(r.output) };
}
const CI_DIR_A11Y = path.join(ROOT, 'results', 'a11y');

async function stageLhci() {
  const npm = npmCliPath();
  const r = await run([npm, 'run', 'lhci'], { cwd: ROOT });
  const dir = path.join(ROOT, '.lighthouseci');
  const lhrFile = existsSync(dir)
    ? readdirSync(dir).filter((f) => /^lhr-.*\.json$/.test(f)).sort().pop()
    : null;
  const ev = lhrFile ? lighthouseEvidence(readJson(path.join(dir, lhrFile))) : null;
  return { ok: r.code === 0 && ev?.result === 'Đạt', detail: ev ? ev.detail : 'không có báo cáo Lighthouse', log: tail(r.output) };
}

function stageReport(stages) {
  mkdirSync(CI_DIR, { recursive: true });
  const r = run([path.join(ROOT, 'scripts', 'export-html.mjs')], { cwd: ROOT });
  return r.then((res) => ({
    ok: res.code === 0,
    detail: res.code === 0 ? 'Đã xuất results/QA-Hub-Du-Lieu.html' : 'Xuất HTML lỗi',
    log: tail(res.output),
  }));
}

async function sendTicks(ticks) {
  try {
    const res = await fetch(`${LIVE_URL}/api/automation/ci-report`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ticks }),
    });
    if (!res.ok) return { sent: false, note: `QA Hub trả ${res.status}` };
    const body = await res.json();
    return { sent: true, note: `Đã gửi ${ticks.length} mục vào ${LIVE_URL}`, applied: body.applied };
  } catch (err) {
    return { sent: false, note: `Không gửi được vào ${LIVE_URL}: ${err.message}. Chạy QA Hub rồi chạy lại CI.` };
  }
}

async function main() {
  const started = Date.now();
  const runAt = new Date().toISOString();
  mkdirSync(CI_DIR, { recursive: true });

  const stages = [];
  const progress = {
    running: true,
    startedAt: runAt,
    current: null,
    steps: CI_STAGES.map((s) => ({ key: s.key, label: s.label, status: 'pending', detail: '' })),
  };
  const saveProgress = () => writeFileSync(path.join(CI_DIR, 'progress.json'), JSON.stringify(progress, null, 2), 'utf8');
  saveProgress();

  const record = (key, result, ms) => {
    const def = CI_STAGES.find((s) => s.key === key);
    stages.push({ key, label: def.label, ok: result.ok, detail: result.detail, durationMs: ms, failures: result.failures ?? [], log: result.log ?? '' });
    console.log(`${result.ok ? 'OK ' : 'LỖI'} ${def.label}: ${result.detail}`);
    const step = progress.steps.find((s) => s.key === key);
    step.status = result.ok ? 'ok' : 'fail';
    step.detail = result.detail;
    progress.current = null;
    saveProgress();
  };

  const timed = async (key, fn) => {
    const t0 = Date.now();
    progress.current = key;
    progress.steps.find((s) => s.key === key).status = 'running';
    saveProgress();
    const result = await fn();
    record(key, result, Date.now() - t0);
    return result;
  };

  await timed('install', stageInstall);
  await timed('syntax', stageSyntax);
  await timed('e2e', stageE2E);

  // Server CI riêng (dữ liệu thử ở .ci-data) để đồng bộ kết quả và chạy axe.
  const serverLog = openSync(path.join(CI_DIR, 'server.log'), 'w');
  const serverProc = spawn(process.execPath, [path.join(ROOT, 'server.js')], {
    cwd: ROOT,
    env: { ...process.env, PORT: String(CI_PORT), DATA_DIR: '.ci-data', RESULTS_FILE: 'results/playwright-results.json' },
    stdio: ['ignore', serverLog, serverLog],
  });
  serverProc.on('exit', (code) => console.error(`Server CI thoát với mã ${code}`));
  const healthy = await waitForHealth(CI_BASE);
  try {
    await timed('sync', () => stageSync(healthy ? true : null));
    await timed('a11y', stageA11y);
  } finally {
    serverProc.removeAllListeners('exit');
    serverProc.kill();
  }
  await timed('lhci', stageLhci);
  await timed('report', () => stageReport(stages));

  const specResults = collectSpecResults(readJson(path.join(ROOT, 'results', 'playwright-results.json')) ?? {});
  const stageMap = Object.fromEntries(stages.map((s) => [s.key, s]));
  const ticks = evaluateChecklistEvidence({ stages: stageMap, specResults, runAt });
  const sent = await sendTicks(ticks);

  const summary = {
    runAt,
    durationMs: Date.now() - started,
    ok: stages.every((s) => s.ok),
    summary: summarize(stages, ticks, sent.note),
    stages: stages.map(({ log, ...rest }) => ({ ...rest, logTail: log })),
    ticks,
    sent,
  };
  writeFileSync(path.join(CI_DIR, 'latest.json'), JSON.stringify(summary, null, 2), 'utf8');
  progress.running = false;
  progress.current = null;
  progress.finishedAt = new Date().toISOString();
  saveProgress();
  console.log(`\n${summary.summary}`);
  console.log(`Kết luận: ${summary.ok ? 'ĐẠT' : 'KHÔNG ĐẠT'} (${Math.round(summary.durationMs / 1000)} giây)`);
  process.exitCode = summary.ok ? 0 : 1;
}

main().catch((err) => {
  console.error('Lỗi pipeline:', err);
  process.exitCode = 2;
});
