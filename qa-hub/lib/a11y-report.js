// Tóm tắt kết quả axe-core theo mức độ nghiêm trọng và đánh giá theo ngưỡng.
// Mức impact của axe: critical, serious, moderate, minor. Lỗi critical hoặc serious làm kiểm tra thất bại.
export const IMPACTS = ['critical', 'serious', 'moderate', 'minor'];

// Ngưỡng mặc định: 0 lỗi critical, 0 lỗi serious. Moderate và minor chỉ cảnh báo.
export const DEFAULT_THRESHOLDS = { critical: 0, serious: 0, moderate: 10, minor: 50 };

// Đếm số lỗi theo impact. Một violation có nhiều node thì tính theo số node (mỗi chỗ lỗi).
export function countByImpact(violations) {
  const counts = Object.fromEntries(IMPACTS.map((k) => [k, 0]));
  for (const v of violations) {
    const key = IMPACTS.includes(v.impact) ? v.impact : 'minor';
    counts[key] += Math.max(1, v.nodes?.length ?? 0);
  }
  return counts;
}

// Đánh giá: fail nếu vượt ngưỡng critical/serious; warn nếu vượt moderate/minor.
export function evaluate(counts, thresholds = DEFAULT_THRESHOLDS) {
  const failures = [];
  const warnings = [];
  for (const impact of ['critical', 'serious']) {
    if (counts[impact] > thresholds[impact]) failures.push(`${counts[impact]} lỗi ${impact} (ngưỡng ${thresholds[impact]})`);
  }
  for (const impact of ['moderate', 'minor']) {
    if (counts[impact] > thresholds[impact]) warnings.push(`${counts[impact]} lỗi ${impact} (ngưỡng ${thresholds[impact]})`);
  }
  return { ok: failures.length === 0, failures, warnings };
}

// Báo cáo markdown: tóm tắt, lỗi theo mức độ, chi tiết từng quy tắc, khuyến nghị.
export function buildMarkdownReport({ url, date, violations, counts, verdict }) {
  const lines = [
    '# Báo cáo accessibility (axe-core)',
    '',
    `- Trang: ${url}`,
    `- Thời điểm: ${date}`,
    `- Chuẩn: WCAG 2.0 A/AA, WCAG 2.1 A/AA`,
    `- Kết quả: ${verdict.ok ? 'ĐẠT' : 'KHÔNG ĐẠT'}`,
    '',
    '## Tóm tắt theo mức độ',
    '',
    '| Mức độ | Số lỗi |',
    '| --- | --- |',
    ...IMPACTS.map((k) => `| ${k} | ${counts[k]} |`),
    '',
  ];
  if (verdict.failures.length) lines.push('### Lỗi làm kiểm tra thất bại', '', ...verdict.failures.map((f) => `- ${f}`), '');
  if (verdict.warnings.length) lines.push('### Cảnh báo', '', ...verdict.warnings.map((w) => `- ${w}`), '');
  lines.push('## Chi tiết', '');
  if (violations.length === 0) lines.push('Không có vi phạm.', '');
  for (const v of violations) {
    lines.push(`### [${v.impact ?? 'minor'}] ${v.id}: ${v.help}`, '');
    lines.push(`- Tiêu chuẩn: ${(v.tags ?? []).filter((t) => t.startsWith('wcag')).join(', ') || '—'}`);
    lines.push(`- Mô tả: ${v.description}`);
    lines.push(`- Tài liệu: ${v.helpUrl}`);
    for (const node of (v.nodes ?? []).slice(0, 5)) {
      lines.push(`- Phần tử: \`${(node.target ?? []).join(' ')}\``);
    }
    lines.push('');
  }
  lines.push('## Khuyến nghị', '');
  lines.push('1. Sửa lỗi critical trước, rồi serious.');
  lines.push('2. Lỗi moderate và minor xếp vào backlog, sửa dần.');
  lines.push('3. axe chỉ phát hiện khoảng 30–40% vấn đề truy cập. Cần kiểm thủ công: bàn phím, screen reader, phóng to 200%.');
  lines.push('');
  return lines.join('\n');
}
