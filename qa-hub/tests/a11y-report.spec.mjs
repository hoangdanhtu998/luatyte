import { test, expect } from '@playwright/test';
import { countByImpact, evaluate, buildMarkdownReport, DEFAULT_THRESHOLDS } from '../lib/a11y-report.js';

const violation = (id, impact, nodes = 1) => ({
  id,
  impact,
  help: `Trợ giúp ${id}`,
  description: `Mô tả ${id}`,
  helpUrl: `https://example.test/${id}`,
  tags: ['wcag2aa', 'wcag143'],
  nodes: Array.from({ length: nodes }, (_, k) => ({ target: [`#el-${id}-${k}`] })),
});

test.describe('Báo cáo accessibility', () => {
  test('đếm lỗi theo mức độ, tính theo số node', () => {
    const counts = countByImpact([violation('a', 'critical', 2), violation('b', 'serious'), violation('c', 'minor', 3)]);
    expect(counts).toEqual({ critical: 2, serious: 1, moderate: 0, minor: 3 });
  });

  test('impact lạ hoặc thiếu được xếp vào minor, không làm mất lỗi', () => {
    const counts = countByImpact([{ id: 'x', nodes: [{}] }]);
    expect(counts.minor).toBe(1);
  });

  test('critical hoặc serious vượt ngưỡng thì không đạt', () => {
    const verdict = evaluate({ critical: 1, serious: 0, moderate: 0, minor: 0 }, DEFAULT_THRESHOLDS);
    expect(verdict.ok).toBe(false);
    expect(verdict.failures[0]).toContain('critical');
  });

  test('moderate và minor chỉ cảnh báo, không làm fail', () => {
    const verdict = evaluate({ critical: 0, serious: 0, moderate: 12, minor: 3 }, DEFAULT_THRESHOLDS);
    expect(verdict.ok).toBe(true);
    expect(verdict.warnings).toHaveLength(1);
  });

  test('báo cáo markdown ghi kết quả, mức độ, chi tiết và khuyến nghị', () => {
    const violations = [violation('color-contrast', 'serious', 2)];
    const md = buildMarkdownReport({
      url: 'http://127.0.0.1:3000/#/tong',
      date: '2026-11-12T00:00:00.000Z',
      violations,
      counts: countByImpact(violations),
      verdict: evaluate(countByImpact(violations)),
    });
    expect(md).toContain('KHÔNG ĐẠT');
    expect(md).toContain('| serious | 2 |');
    expect(md).toContain('### [serious] color-contrast');
    expect(md).toContain('#el-color-contrast-0');
    expect(md).toContain('## Khuyến nghị');
  });

  test('không có vi phạm thì báo ĐẠT và ghi rõ không có vi phạm', () => {
    const md = buildMarkdownReport({
      url: 'u', date: 'd', violations: [], counts: countByImpact([]), verdict: evaluate(countByImpact([])),
    });
    expect(md).toContain('ĐẠT');
    expect(md).toContain('Không có vi phạm');
  });
});
