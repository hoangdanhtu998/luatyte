// Kế hoạch pipeline CI của QA Hub và luật tự tick checklist kèm bằng chứng.
// Tick chỉ khi bước liên quan đạt thật. Không đạt thì ghi bằng chứng "Không đạt", không tick.
// Người dùng đã cho phép tự tích checklist kèm bằng chứng; mọi mục tự tích đều có trường evidence để kiểm tra.

export const CI_STAGES = [
  { key: 'install', label: 'Cài đặt' },
  { key: 'syntax', label: 'Kiểm cú pháp' },
  { key: 'e2e', label: 'E2E, API, UI, bảo mật' },
  { key: 'sync', label: 'Đồng bộ kết quả vào test case' },
  { key: 'a11y', label: 'Accessibility (axe-core)' },
  { key: 'lhci', label: 'Hiệu năng (Lighthouse CI)' },
  { key: 'report', label: 'Báo cáo và xuất HTML' },
];

// Tên tiêu đề test (trong bộ Playwright) dùng để chứng minh một mục checklist.
const SPEC_EVIDENCE = [
  { id: 'CL-24', spec: 'health endpoint trả 200 và JSON có status ok', what: 'smoke test' },
  { id: 'CL-37', spec: 'menu điều hướng vẫn bấm được ở 375px', what: 'responsive 375px' },
  { id: 'CL-51', spec: 'payload script trong tiêu đề được lưu nhưng hiển thị dạng chữ, không thực thi', what: 'XSS' },
];

function stageOk(stages, key) {
  return stages[key]?.ok === true;
}

// stages: { install, syntax, e2e, sync, a11y, lhci, report } mỗi bước { ok, detail }
// specResults: Map tiêu đề test -> { result: 'pass'|'fail'|'not_run' }
export function evaluateChecklistEvidence({ stages, specResults, runAt }) {
  const out = [];
  const at = runAt ?? 'không rõ thời điểm';

  out.push({
    id: 'CL-19',
    ok: stageOk(stages, 'install'),
    evidence: `Cài đặt phụ thuộc: ${stages.install?.detail ?? '—'} (${at})`,
  });
  out.push({
    id: 'CL-25',
    ok: stageOk(stages, 'e2e'),
    evidence: `Đã chạy bộ test: ${stages.e2e?.detail ?? '—'} (${at})`,
  });
  out.push({
    id: 'CL-26',
    ok: stageOk(stages, 'e2e'),
    evidence: `Ghi nhận Pass/Fail từ báo cáo Playwright: ${stages.e2e?.detail ?? '—'}`,
  });
  out.push({
    id: 'CL-30',
    ok: stageOk(stages, 'e2e') && stageOk(stages, 'sync'),
    evidence: `Chạy lại toàn bộ bộ test (hồi quy): ${stages.e2e?.detail ?? '—'}`,
  });
  out.push({
    id: 'CL-46',
    ok: stageOk(stages, 'a11y'),
    evidence: `axe-core: ${stages.a11y?.detail ?? '—'}`,
  });
  out.push({
    id: 'CL-47',
    ok: stageOk(stages, 'lhci'),
    evidence: `Lighthouse CI: ${stages.lhci?.detail ?? '—'}`,
  });
  out.push({
    id: 'CL-35',
    ok: stageOk(stages, 'report'),
    evidence: `Báo cáo tổng hợp: ${stages.report?.detail ?? '—'}`,
  });
  out.push({
    id: 'CL-27',
    ok: stageOk(stages, 'report'),
    evidence: `Bằng chứng lưu tại results/ (báo cáo Playwright, axe, Lighthouse, CI)`,
  });
  out.push({
    id: 'CL-88',
    ok: CI_STAGES.every((s) => stageOk(stages, s.key)),
    evidence: `Pipeline CI chạy đủ ${CI_STAGES.length} bước (${at})`,
  });

  for (const rule of SPEC_EVIDENCE) {
    const hit = specResults.get(rule.spec);
    if (!hit) continue;
    out.push({
      id: rule.id,
      ok: hit.result === 'pass',
      evidence: `${rule.what}: test "${rule.spec}" → ${hit.result === 'pass' ? 'pass' : 'fail'} (${at})`,
    });
  }

  return out.map((item) => ({
    id: item.id,
    done: item.ok,
    evidence: item.ok ? item.evidence : `Không đạt: ${item.evidence}`,
  }));
}
