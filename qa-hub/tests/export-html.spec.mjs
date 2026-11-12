import { test, expect } from '@playwright/test';
import { axeEvidence, lighthouseEvidence, collectEvidence, LCP_MAX_MS, CLS_MAX } from '../lib/evidence.js';
import { esc, renderHtml } from '../lib/html-export.js';

const baseData = {
  date: '2026-11-12 10:00',
  projects: [], testcases: [], bugs: [], requirements: [], suites: [], reviews: [], runs: [],
  checklist: [{ id: 'CL-46', group: 'Truy cập (a11y)', text: 'Quét axe', done: false }],
};

test.describe('Bằng chứng tự động', () => {
  test('axe: không có critical hoặc serious thì Đạt', () => {
    const e = axeEvidence({ counts: { critical: 0, serious: 0, moderate: 4, minor: 2 }, date: 'd' });
    expect(e.checklistId).toBe('CL-46');
    expect(e.result).toBe('Đạt');
  });

  test('axe: có serious thì Không đạt', () => {
    expect(axeEvidence({ counts: { critical: 0, serious: 1 } }).result).toBe('Không đạt');
  });

  test('axe: thiếu dữ liệu thì không tạo bằng chứng', () => {
    expect(axeEvidence(null)).toBeNull();
  });

  test('Lighthouse: LCP và CLS trong ngưỡng thì Đạt', () => {
    const lhr = { requestedUrl: 'http://x', audits: {
      'largest-contentful-paint': { numericValue: 1700 },
      'cumulative-layout-shift': { numericValue: 0 },
    } };
    const e = lighthouseEvidence(lhr);
    expect(e.checklistId).toBe('CL-47');
    expect(e.result).toBe('Đạt');
  });

  test('Lighthouse: LCP vượt ngưỡng thì Không đạt', () => {
    const lhr = { audits: {
      'largest-contentful-paint': { numericValue: LCP_MAX_MS + 1 },
      'cumulative-layout-shift': { numericValue: CLS_MAX / 2 },
    } };
    expect(lighthouseEvidence(lhr).result).toBe('Không đạt');
  });

  test('gom bằng chứng bỏ qua nguồn thiếu', () => {
    expect(collectEvidence({ axeReport: null, lhr: null })).toEqual([]);
  });
});

test.describe('Xuất HTML', () => {
  test('escape ký tự HTML để dữ liệu không thành mã chạy', () => {
    expect(esc('<img src=x onerror="alert(1)">')).not.toContain('<img');
    expect(esc('a & b')).toBe('a &amp; b');
  });

  test('HTML không có script và hiển thị bằng chứng cạnh mục checklist', () => {
    const html = renderHtml({
      ...baseData,
      evidence: [{ checklistId: 'CL-46', result: 'Đạt', detail: 'axe: critical=0' }],
    });
    expect(html).not.toMatch(/<script/i);
    expect(html).toContain('Đạt: axe: critical=0');
    expect(html).toContain('Đã tick');
  });

  test('bằng chứng không tự tick mục checklist', () => {
    const html = renderHtml({
      ...baseData,
      evidence: [{ checklistId: 'CL-46', result: 'Đạt', detail: 'x' }],
    });
    expect(html).toContain('<td>Chưa</td>');
  });
});
