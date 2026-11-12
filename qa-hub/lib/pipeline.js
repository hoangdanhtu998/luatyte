// Luồng tự động cho từng dự án: không cần người bấm. Chỉ dựa vào dữ liệu đã có
// (domain đã xác nhận quyền, mã nguồn đã có trên máy). Mã nguồn chỉ được đọc sau khi
// quét virus sạch. Không chạy mã của dự án bên ngoài.

export const PIPELINE_STEPS = [
  { key: 'domain', label: 'Quét domain' },
  { key: 'scan', label: 'Quét virus mã nguồn' },
  { key: 'code', label: 'Đọc mã và tích checklist' },
  { key: 'tests', label: 'Chạy test của dự án' },
  { key: 'report', label: 'Ghi báo cáo' },
];

// Chạy test dự án tối đa một lần mỗi 24 giờ, để luồng theo giờ không cài lại mỗi lượt.
export const TEST_INTERVAL_MS = 24 * 60 * 60 * 1000;

export function testsDue(project, now = Date.now()) {
  if (!project.testedAt) return true;
  return now - Date.parse(project.testedAt) >= TEST_INTERVAL_MS;
}

// Dự án domain được quét tự động khi đã xác nhận quyền sở hữu.
export function shouldScanDomain(project) {
  return project.sourceType === 'domain' && project.ownershipConfirmed === true;
}

// Dự án có mã nguồn trên máy thì mới quét virus và đọc mã.
export function hasLocalCode(project, exists) {
  return ['zip', 'github'].includes(project.sourceType) && Boolean(project.localPath) && exists(project.localPath);
}

async function runDomainStep(project, deps, report, outcome) {
  if (!shouldScanDomain(project)) {
    outcome.steps.domain = { ok: false, skipped: true };
    report('domain', 'skipped', 'Không phải domain đã xác nhận quyền');
    return;
  }
  report('domain', 'running');
  try {
    const scan = await deps.scanDomain(project.sourceRef);
    const homeOk = scan.checks.some((c) => (c.name === 'Trang chủ tải được' || c.name === 'Trang chủ chuyển hướng') && c.ok);
    await deps.saveScan(project.id, scan, homeOk);
    outcome.steps.domain = { ok: true, homeOk };
    report('domain', 'done', homeOk ? 'Trang chủ tải được' : 'Trang chủ không tải được');
  } catch (err) {
    outcome.steps.domain = { ok: false, error: err.message };
    report('domain', 'error', err.message);
  }
}

// Trả về true nếu được phép đọc mã tiếp.
async function runVirusStep(project, deps, report, outcome) {
  if (!hasLocalCode(project, deps.exists)) {
    outcome.steps.scan = { ok: false, skipped: true };
    report('scan', 'skipped', 'Chưa có mã nguồn trên máy');
    return false;
  }
  report('scan', 'running');
  const result = await deps.scanVirus(project.localPath);
  outcome.steps.scan = { ok: result.status === 'clean', status: result.status };
  if (result.status === 'clean') {
    report('scan', 'done', result.detail);
    return true;
  }
  report('scan', 'error', result.detail);
  return false;
}

async function runCodeStep(project, deps, report, outcome, allowed) {
  if (!allowed) {
    outcome.steps.code = { ok: false, skipped: true };
    report('code', 'skipped', 'Không đọc mã vì quét virus chưa sạch');
    return;
  }
  report('code', 'running');
  const { tree, excerpts } = deps.collectFiles(project.localPath);
  const suggestions = await deps.suggest({ tree, excerpts });
  const doneIds = suggestions.filter((s) => s.done).map((s) => s.id);
  await deps.applyChecklist(project.id, suggestions, doneIds);
  outcome.steps.code = { ok: true, fileCount: tree.length, applied: doneIds.length };
  report('code', 'done', `${doneIds.length} mục đã có bằng chứng`);
}

// Chỉ chạy khi dự án bật autoTests, mã đã quét sạch, và đến hạn chạy lại.
async function runTestsStep(project, deps, report, outcome, clean) {
  if (!project.autoTests) {
    outcome.steps.tests = { ok: false, skipped: true };
    report('tests', 'skipped', 'Dự án chưa bật chạy test');
    return;
  }
  if (!clean) {
    outcome.steps.tests = { ok: false, skipped: true };
    report('tests', 'skipped', 'Không chạy test vì quét virus chưa sạch');
    return;
  }
  if (!testsDue(project)) {
    outcome.steps.tests = { ok: true, skipped: true };
    report('tests', 'skipped', 'Đã chạy trong 24 giờ qua');
    return;
  }
  report('tests', 'running');
  const result = await deps.runTests(project.localPath);
  await deps.recordTests(project.id, result.status);
  outcome.steps.tests = { ok: result.status === 'pass', status: result.status };
  if (result.status === 'pass') report('tests', 'done', result.detail);
  else if (result.status === 'unavailable') report('tests', 'skipped', result.detail);
  else report('tests', 'error', result.detail);
}

// Chạy toàn bộ luồng cho một dự án. Mọi phụ thuộc được truyền vào để kiểm thử được.
// deps.onStep(key, status, detail) được gọi khi mỗi bước bắt đầu và kết thúc (tùy chọn).
export async function runProjectPipeline(project, deps) {
  const report = (key, status, detail = null) => deps.onStep?.(key, status, detail);
  const outcome = { projectId: project.id, steps: {} };

  await runDomainStep(project, deps, report, outcome);
  const clean = await runVirusStep(project, deps, report, outcome);
  await runCodeStep(project, deps, report, outcome, clean);
  await runTestsStep(project, deps, report, outcome, clean);

  report('report', 'running');
  await deps.recordReport(project.id);
  outcome.steps.report = { ok: true };
  report('report', 'done', 'Đã ghi báo cáo');
  return outcome;
}
