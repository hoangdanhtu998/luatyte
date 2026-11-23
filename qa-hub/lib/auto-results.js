// Ghi kết quả pass/fail TỰ ĐỘNG từ báo cáo JSON của Playwright vào test case.
// Mỗi test case có trường automationKey = tiêu đề của test trong bộ test. Không có key thì không có kết quả tự động.
// Không có đường nào để người dùng sửa tay kết quả (API trả 403 khi cố ghi result).

// Đi qua cây suite của Playwright JSON, trả về Map: tiêu đề test -> { result, evidence }.
export function collectSpecResults(report) {
  const out = new Map();
  const visit = (suite, file) => {
    const currentFile = suite.file ?? file;
    for (const spec of suite.specs ?? []) {
      const statuses = (spec.tests ?? []).flatMap((t) => (t.results ?? []).map((r) => r.status));
      const failed = (spec.tests ?? []).some((t) => t.status === 'unexpected');
      let result = 'not_run';
      if (failed) result = 'fail';
      else if (statuses.length > 0 && statuses.every((s) => s === 'skipped')) result = 'not_run';
      else if (statuses.length > 0) result = 'pass';
      const key = spec.title;
      // Nếu cùng tiêu đề xuất hiện nhiều lần, ưu tiên kết quả xấu nhất.
      const prev = out.get(key);
      if (!prev || rank(result) > rank(prev.result)) {
        out.set(key, { result, evidence: `${currentFile ?? '?'}: ${spec.title}` });
      }
    }
    for (const child of suite.suites ?? []) visit(child, currentFile);
  };
  for (const suite of report?.suites ?? []) visit(suite, suite.file);
  return out;
}

// Thứ tự xấu dần: fail > pass > not_run (không chạy).
function rank(result) {
  return { fail: 2, pass: 1, not_run: 0 }[result] ?? 0;
}

// Trả về danh sách cập nhật cho test case có automationKey khớp một test trong báo cáo.
export function planAutoUpdates(testcases, specResults, now = new Date().toISOString()) {
  const updates = [];
  for (const tc of testcases) {
    if (!tc.automationKey) continue;
    const hit = specResults.get(tc.automationKey);
    if (!hit) continue;
    updates.push({
      id: tc.id,
      patch: { result: hit.result, autoResultAt: now, autoEvidence: hit.evidence },
    });
  }
  return updates;
}
