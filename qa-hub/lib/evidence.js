// Bằng chứng tự động từ kết quả test thật, gắn vào mục checklist tương ứng.
// Chỉ hiển thị để người test tham khảo. KHÔNG tự tick mục checklist: việc tick là quyết định của người test.
export const LCP_MAX_MS = 2500;
export const CLS_MAX = 0.1;

// axe: đạt khi không có lỗi critical hoặc serious. counts lấy từ axe-report.json.
export function axeEvidence(axeReport) {
  if (!axeReport?.counts) return null;
  const { critical = 0, serious = 0 } = axeReport.counts;
  const ok = critical === 0 && serious === 0;
  return {
    checklistId: 'CL-46',
    result: ok ? 'Đạt' : 'Không đạt',
    detail: `axe: critical=${critical}, serious=${serious} (${axeReport.date ?? 'không rõ ngày'})`,
  };
}

// Lighthouse: đạt khi LCP và CLS trong ngưỡng. lhr là báo cáo JSON của Lighthouse (một trang).
export function lighthouseEvidence(lhr) {
  const audits = lhr?.audits;
  if (!audits) return null;
  const lcp = audits['largest-contentful-paint']?.numericValue;
  const cls = audits['cumulative-layout-shift']?.numericValue;
  if (typeof lcp !== 'number' || typeof cls !== 'number') return null;
  const ok = lcp <= LCP_MAX_MS && cls <= CLS_MAX;
  return {
    checklistId: 'CL-47',
    result: ok ? 'Đạt' : 'Không đạt',
    detail: `LCP ${Math.round(lcp)} ms, CLS ${cls.toFixed(3)} (${lhr.requestedUrl ?? 'trang không rõ'})`,
  };
}

export function collectEvidence({ axeReport, lhr }) {
  return [axeEvidence(axeReport), lighthouseEvidence(lhr)].filter(Boolean);
}
