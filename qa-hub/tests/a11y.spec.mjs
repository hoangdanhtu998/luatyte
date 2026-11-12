import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const PAGES = ['/#/start', '/#/overview', '/#/testcases', '/#/bugs', '/#/plan', '/#/summary', '/#/assistant', '/#/checklist'];

for (const url of PAGES) {
  test(`axe-core không có lỗi nghiêm trọng ở ${url}`, async ({ page }) => {
    await page.goto(url);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    const serious = results.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');
    expect(serious.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
  });
}

test('ngôn ngữ trang là tiếng Việt và có một h1', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'vi');
  await expect(page.locator('h1')).toHaveCount(1);
});

test('mọi ô nhập liệu ở trang Test case có nhãn', async ({ page }) => {
  await page.goto('/#/testcases');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  for (const name of ['Tiêu đề', 'Module', 'Ưu tiên', 'Lọc theo trạng thái', 'Tìm kiếm']) {
    await expect(page.getByLabel(name)).toBeVisible();
  }
});

test('bấm Tab đi được tới nút Thêm test case và thấy vùng focus', async ({ page }) => {
  await page.goto('/#/testcases');
  await page.getByLabel('Tiêu đề').focus();
  const submit = page.getByRole('button', { name: 'Thêm test case' });
  for (let i = 0; i < 15 && !(await submit.evaluate((node) => node === document.activeElement)); i += 1) {
    await page.keyboard.press('Tab');
  }
  await expect(submit).toBeFocused();
});
