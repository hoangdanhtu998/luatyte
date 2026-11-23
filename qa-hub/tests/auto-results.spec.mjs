import { test, expect } from '@playwright/test';
import { collectSpecResults, planAutoUpdates } from '../lib/auto-results.js';

// Báo cáo Playwright JSON rút gọn: một suite, ba spec.
const report = {
  suites: [{
    title: 'api',
    file: 'tests/api.spec.mjs',
    specs: [
      { title: 'ca đạt', tests: [{ status: 'expected', results: [{ status: 'passed' }] }] },
      { title: 'ca lỗi', tests: [{ status: 'unexpected', results: [{ status: 'failed' }] }] },
      { title: 'ca bỏ qua', tests: [{ status: 'skipped', results: [{ status: 'skipped' }] }] },
    ],
    suites: [{
      title: 'con',
      specs: [{ title: 'ca flaky', tests: [{ status: 'flaky', results: [{ status: 'failed' }, { status: 'passed' }] }] }],
    }],
  }],
};

test.describe('Kết quả tự động từ Playwright', () => {
  test('đọc pass, fail, bỏ qua và flaky đúng cách, kể cả suite lồng', () => {
    const map = collectSpecResults(report);
    expect(map.get('ca đạt').result).toBe('pass');
    expect(map.get('ca lỗi').result).toBe('fail');
    expect(map.get('ca bỏ qua').result).toBe('not_run');
    expect(map.get('ca flaky').result).toBe('pass');
    expect(map.get('ca lỗi').evidence).toContain('tests/api.spec.mjs');
  });

  test('chỉ cập nhật test case có automationKey khớp tiêu đề test', () => {
    const map = collectSpecResults(report);
    const updates = planAutoUpdates([
      { id: 'TC-001', automationKey: 'ca đạt' },
      { id: 'TC-002', automationKey: 'ca lỗi' },
      { id: 'TC-003' },
      { id: 'TC-004', automationKey: 'không có trong báo cáo' },
    ], map, '2026-11-12T00:00:00.000Z');
    expect(updates.map((u) => u.id)).toEqual(['TC-001', 'TC-002']);
    expect(updates[1].patch).toEqual({
      result: 'fail',
      autoResultAt: '2026-11-12T00:00:00.000Z',
      autoEvidence: 'tests/api.spec.mjs: ca lỗi',
    });
  });

  test('báo cáo rỗng không tạo cập nhật nào', () => {
    expect(planAutoUpdates([{ id: 'TC-001', automationKey: 'x' }], collectSpecResults({}))).toEqual([]);
  });
});

test.describe('Giao diện không cho sửa kết quả tay', () => {
  test('trang Test case không có ô chọn kết quả, chỉ hiển thị nhãn tự động', async ({ page }) => {
    await page.goto('/#/testcases');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByLabel(/^Kết quả TC-/)).toHaveCount(0);
    await expect(page.locator('.auto-result').first()).toBeVisible();
  });
});
