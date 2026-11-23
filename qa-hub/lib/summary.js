import { TC_RESULTS, BUG_SEVERITIES, BUG_STATUSES } from './validate.js';

// Ngưỡng exit criteria (có thể đổi tại đây, không rải rác trong code).
export const EXIT_PASS_RATE = 90;

const CLOSED_BUG_STATUSES = ['closed', 'rejected', 'duplicate'];
const MS_PER_HOUR = 3600000;

const resultOf = (testcase) => testcase.result ?? 'not_run';
const isOpenBug = (bug) => !CLOSED_BUG_STATUSES.includes(bug.status);
const percent = (part, whole) => (whole === 0 ? null : Math.round((part / whole) * 100));

function countBy(items, keyOf, keys) {
  const counts = Object.fromEntries(keys.map((key) => [key, 0]));
  for (const item of items) {
    const key = keyOf(item);
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
}

function criterion(name, ok, detail, action) {
  return { name, ok, detail, action: ok ? null : action };
}

export function buildSummary({ testcases, requirements, bugs }) {
  const byResult = countBy(testcases, resultOf, TC_RESULTS);
  const decided = byResult.pass + byResult.fail;
  const passRate = percent(byResult.pass, decided);

  const covered = requirements.filter((req) =>
    testcases.some((tc) => (tc.requirementIds ?? []).includes(req.id)));
  const coveragePercent = percent(covered.length, requirements.length);

  const openBugs = bugs.filter(isOpenBug);
  const openCritical = openBugs.filter((bug) => bug.severity === 'critical');
  const resolutionHours = bugs
    .filter((bug) => bug.closedAt)
    .map((bug) => (Date.parse(bug.closedAt) - Date.parse(bug.createdAt)) / MS_PER_HOUR);
  const leaked = bugs.filter((bug) => bug.foundIn === 'production').length;

  const highTests = testcases.filter((tc) => tc.priority === 'high' && resultOf(tc) !== 'not_applicable');
  const highPassed = highTests.filter((tc) => resultOf(tc) === 'pass').length;
  const highAllPass = highTests.length > 0 && highPassed === highTests.length;

  const exitCriteria = [
    criterion(
      `Tỉ lệ pass ≥ ${EXIT_PASS_RATE}% trên test case đã thực thi`,
      passRate !== null && passRate >= EXIT_PASS_RATE,
      passRate === null ? 'Chưa có test case nào Pass/Fail' : `${passRate}%`,
      'Thực thi thêm test case và xử lý các lỗi Fail',
    ),
    criterion(
      'Không còn test case Blocked',
      byResult.blocked === 0,
      `${byResult.blocked} Blocked`,
      'Gỡ chặn test case Blocked (môi trường, dữ liệu hoặc bug đang chặn)',
    ),
    criterion(
      'Mọi test case Priority cao đều Pass',
      highAllPass,
      `${highPassed}/${highTests.length} Pass`,
      'Ưu tiên chạy và sửa các test case Priority cao',
    ),
    criterion(
      'Không còn bug Critical đang mở',
      openCritical.length === 0,
      `${openCritical.length} bug Critical đang mở`,
      'Ưu tiên sửa bug Critical trước khi bàn giao',
    ),
    criterion(
      'Requirement coverage 100%',
      coveragePercent === 100,
      `${coveragePercent ?? '—'}%`,
      'Thêm test case cho các requirement chưa có test',
    ),
    criterion(
      'Tất cả test case đã được thực thi',
      byResult.not_run === 0,
      `${byResult.not_run} test case chưa chạy`,
      'Chạy các test case còn Not run',
    ),
  ];

  return {
    execution: {
      total: testcases.length,
      byResult,
      passRate,
      failRate: percent(byResult.fail, decided),
      executedPercent: percent(testcases.length - byResult.not_run, testcases.length),
    },
    requirements: {
      total: requirements.length,
      covered: covered.length,
      percent: coveragePercent,
    },
    bugs: {
      total: bugs.length,
      open: openBugs.length,
      openCritical: openCritical.length,
      bySeverity: countBy(bugs, (bug) => bug.severity, BUG_SEVERITIES),
      byStatus: countBy(bugs, (bug) => bug.status, BUG_STATUSES),
      leakagePercent: percent(leaked, bugs.length),
      defectDensity: requirements.length === 0 ? null : Math.round((bugs.length / requirements.length) * 100) / 100,
      avgResolutionHours: resolutionHours.length === 0
        ? null
        : Math.round((resolutionHours.reduce((a, b) => a + b, 0) / resolutionHours.length) * 10) / 10,
    },
    exitCriteria,
    readyForRelease: exitCriteria.every((item) => item.ok),
  };
}

const phase = (id, name, status, note) => ({ id, name, status, note });

// done/total -> pass (đủ), partial (một phần), not_run (chưa có gì)
const statusFromRatio = (done, total) => {
  if (total === 0 || done === 0) return 'not_run';
  return done === total ? 'pass' : 'partial';
};

export function buildStlc({ testcases, requirements, suites, checklist, summary, planReady }) {
  const total = testcases.length;
  const withExpected = testcases.filter((tc) => (tc.expected ?? '').trim() !== '').length;
  const suitesWithCases = suites.filter((suite) => testcases.some((tc) => tc.suiteId === suite.id)).length;
  const executed = testcases.filter((tc) => resultOf(tc) !== 'not_run').length;
  const envItems = checklist.filter((item) => item.group === 'Chuẩn bị môi trường');
  const envDone = envItems.filter((item) => item.done).length;
  const unmet = summary.exitCriteria.filter((item) => !item.ok).length;

  return [
    phase(1, 'Phân tích yêu cầu', statusFromRatio(summary.requirements.covered, requirements.length),
      `${summary.requirements.covered}/${requirements.length} requirement có test case (RTM)`),
    phase(2, 'Lập kế hoạch kiểm thử', planReady ? 'pass' : 'not_run',
      planReady
        ? 'Scope, entry/exit criteria, rủi ro và công cụ: xem trang Kế hoạch'
        : 'Chưa có kế hoạch kiểm thử (data/plan.json)'),
    phase(3, 'Thiết kế kiểm thử', statusFromRatio(withExpected, total),
      `${withExpected}/${total} test case có kết quả mong đợi`),
    phase(4, 'Chuẩn bị môi trường', statusFromRatio(envDone, envItems.length),
      `${envDone}/${envItems.length} mục chuẩn bị môi trường đã xong`),
    phase(5, 'Chuẩn bị thực thi', statusFromRatio(suitesWithCases, suites.length),
      `${suitesWithCases}/${suites.length} test suite đã có test case`),
    phase(6, 'Thực thi kiểm thử', statusFromRatio(executed, total),
      `${executed}/${total} test case đã có kết quả`),
    phase(7, 'Hoàn tất kiểm thử', summary.readyForRelease ? 'pass' : (executed > 0 ? 'partial' : 'not_run'),
      summary.readyForRelease
        ? 'Đạt toàn bộ exit criteria'
        : `${unmet}/${summary.exitCriteria.length} tiêu chí exit chưa đạt`),
  ];
}
