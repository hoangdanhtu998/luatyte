import { existsSync, readFileSync } from 'node:fs';

// 14 giai đoạn trong workflow kiểm thử web (file web-testing-workflow.md).
// source: 'auto' = lấy kết quả từ Playwright; 'report' = có báo cáo; 'manual' = ghi tay.
export const STAGES = [
  { id: 0, name: 'Chuẩn bị', source: 'manual', derive: (f) => (f.planReady
    ? { status: 'pass', note: 'Có kế hoạch kiểm thử (data/plan.json): phạm vi, entry/exit criteria' }
    : { status: 'not_run', note: 'Chưa có kế hoạch kiểm thử' }) },
  { id: 1, name: 'Hiểu yêu cầu và bối cảnh', source: 'manual', derive: (f) => (f.requirementCount > 0
    ? { status: 'partial', note: `${f.requirementCount} requirement đã ghi; chưa có xác nhận với product owner` }
    : { status: 'not_run', note: 'Chưa có requirement' }) },
  { id: 2, name: 'Thiết kế ca kiểm thử', source: 'manual', derive: (f) => (f.testcaseCount === 0
    ? { status: 'not_run', note: 'Chưa có test case' }
    : { status: f.withExpected === f.testcaseCount ? 'pass' : 'partial', note: `${f.withExpected}/${f.testcaseCount} test case có kết quả mong đợi` }) },
  { id: 3, name: 'Môi trường và dữ liệu', source: 'manual', derive: (f) => (f.resetHarness
    ? { status: 'pass', note: 'Dữ liệu test reset từ seed trước mỗi lần chạy (scripts/test-server.mjs)' }
    : { status: 'not_run', note: 'Chưa có cơ chế reset dữ liệu test' }) },
  { id: 4, name: 'Smoke test', source: 'auto', file: 'smoke' },
  { id: 5, name: 'Chức năng', source: 'auto', file: 'functional' },
  { id: 6, name: 'Giao diện và responsive', source: 'auto', file: 'responsive' },
  { id: 7, name: 'Truy cập (a11y)', source: 'auto', file: 'a11y' },
  { id: 8, name: 'Hiệu năng', source: 'auto', file: 'performance' },
  { id: 9, name: 'Bảo mật cơ bản', source: 'auto', file: 'security' },
  { id: 10, name: 'Tương thích trình duyệt', source: 'manual', derive: (f) => (f.browserProjects >= 2
    ? { status: 'pass', note: `${f.browserProjects} trình duyệt được cấu hình` }
    : { status: 'partial', note: `${f.browserProjects} trình duyệt được cấu hình (cần ít nhất 2)` }) },
  { id: 11, name: 'Hồi quy và CI', source: 'manual', derive: (f) => (f.ciWorkflow
    ? { status: 'partial', note: 'Có workflow GitHub Actions; chưa xác nhận đã chạy trên GitHub' }
    : { status: 'not_run', note: 'Chưa có workflow CI' }) },
  { id: 12, name: 'Báo cáo', source: 'report', note: 'Báo cáo JSON và HTML sinh ra khi chạy npm test' },
  { id: 13, name: 'Theo dõi sau phát hành', source: 'manual', status: 'not_run', note: 'Ngoài phạm vi môi trường cục bộ' },
];

export function readReport(file) {
  if (!existsSync(file)) return null;
  try {
    return JSON.parse(readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

// Gom mọi test (spec) từ báo cáo JSON của Playwright, kèm tên file gốc.
export function collectSpecs(report) {
  const specs = [];
  const walk = (suite, inheritedFile) => {
    const file = suite.file ?? inheritedFile;
    for (const spec of suite.specs ?? []) {
      specs.push({ file, title: spec.title, ok: spec.ok === true });
    }
    for (const child of suite.suites ?? []) {
      walk(child, file);
    }
  };
  for (const suite of report?.suites ?? []) {
    walk(suite, undefined);
  }
  return specs;
}

const fileKey = (file) => String(file ?? '').replace(/\.spec\.(mjs|js|ts)$/, '');

export function buildStages(report, facts = {}) {
  const specs = collectSpecs(report);
  return STAGES.map((stage) => {
    if (stage.source === 'auto') {
      const mine = specs.filter((spec) => fileKey(spec.file) === stage.file);
      if (mine.length === 0) {
        return { id: stage.id, name: stage.name, source: stage.source, status: 'not_run', note: 'Chưa có kết quả — chạy npm test' };
      }
      const passed = mine.filter((spec) => spec.ok).length;
      return {
        id: stage.id,
        name: stage.name,
        source: stage.source,
        status: passed === mine.length ? 'pass' : 'fail',
        note: `${passed}/${mine.length} test đạt`,
      };
    }
    if (stage.source === 'report') {
      return { id: stage.id, name: stage.name, source: stage.source, status: report ? 'pass' : 'not_run', note: report ? stage.note : 'Chưa có báo cáo' };
    }
    if (stage.derive) {
      return { id: stage.id, name: stage.name, source: stage.source, ...stage.derive(facts) };
    }
    return { id: stage.id, name: stage.name, source: stage.source, status: stage.status, note: stage.note };
  });
}

const countBy = (items, key) => items.reduce((acc, item) => ({ ...acc, [item[key]]: (acc[item[key]] ?? 0) + 1 }), {});

export function computeStats({ testcases, bugs, report }) {
  const byStatus = countBy(testcases, 'status');
  const decided = (byStatus.passed ?? 0) + (byStatus.failed ?? 0);
  const specs = collectSpecs(report);
  const e2ePassed = specs.filter((spec) => spec.ok).length;

  return {
    testcases: {
      total: testcases.length,
      byStatus,
      passRate: decided === 0 ? null : Math.round(((byStatus.passed ?? 0) / decided) * 100),
    },
    bugs: {
      total: bugs.length,
      open: bugs.filter((bug) => !['closed', 'rejected', 'duplicate'].includes(bug.status)).length,
      bySeverity: countBy(bugs, 'severity'),
    },
    e2e: report
      ? {
          total: specs.length,
          passed: e2ePassed,
          failed: specs.length - e2ePassed,
          passRate: specs.length === 0 ? null : Math.round((e2ePassed / specs.length) * 100),
          durationMs: report.stats?.duration ?? null,
        }
      : null,
  };
}
