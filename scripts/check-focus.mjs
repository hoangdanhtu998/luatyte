// Kiểm tra chế độ đọc tập trung (mục 32) trên trang lý thuyết: bật ẩn thanh, Thoát hiện lại, Esc thoát.
// Dùng: node scripts/check-focus.mjs [base-url]
import { chromium } from 'playwright';

const BASE = (process.argv[2] || 'https://luatyte.online').replace(/\/$/, '');
const URL = `${BASE}/ly_thuyet.html`;
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, serviceWorkers: 'block' });
const page = await context.newPage();
const failures = [];
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
const shown = (sel) => page.evaluate((s) => {
  const el = document.querySelector(s);
  return !!el && getComputedStyle(el).display !== 'none';
}, sel);

await page.goto(URL, { waitUntil: 'load' });
// Script nạp sau trang (defer): đợi nút xuất hiện thay vì chờ cố định.
await page.waitForSelector('#focus-toggle', { state: 'visible', timeout: 15000 }).catch(() => failures.push('không có nút Đọc tập trung trên trang'));
if (!(await shown('.topbar'))) failures.push('thanh tiêu đề không hiện trước khi bật đọc tập trung');
await page.getByRole('button', { name: 'Đọc tập trung' }).click();
await page.waitForTimeout(200);
if (await shown('.topbar')) failures.push('bật đọc tập trung nhưng thanh tiêu đề vẫn hiện');
if (await shown('nav[aria-label="Chuyển khu học"]')) failures.push('bật đọc tập trung nhưng thanh điều hướng vẫn hiện');
if (!(await shown('#focus-exit'))) failures.push('nút Thoát không hiện khi đang đọc tập trung');
await page.getByRole('button', { name: 'Thoát đọc tập trung' }).click();
await page.waitForTimeout(200);
if (!(await shown('.topbar'))) failures.push('Thoát không khôi phục thanh tiêu đề');
await page.getByRole('button', { name: 'Đọc tập trung' }).click();
await page.keyboard.press('Escape');
await page.waitForTimeout(200);
if (await page.evaluate(() => document.body.classList.contains('focus-read'))) failures.push('Esc không thoát đọc tập trung');
if (errors.length) failures.push(`lỗi trang: ${errors.join('; ')}`);

await browser.close();
if (failures.length) {
  console.log('CÓ LỖI:\n- ' + failures.join('\n- '));
  process.exit(1);
}
console.log(`Đọc tập trung: đạt trên ${BASE}.`);
