// Kiểm tra tính năng nhớ chỗ đọc dở (mục 33) trên trang lý thuyết: lưu, hiện thanh, Tiếp tục, Bỏ qua.
// Dùng: node scripts/check-resume.mjs [base-url]
import { chromium } from 'playwright';

const BASE = (process.argv[2] || 'https://luatyte.online').replace(/\/$/, '');
const URL = `${BASE}/ly_thuyet.html`;
const browser = await chromium.launch();
const failures = [];
const fail = (msg) => failures.push(msg);

async function fresh() {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, serviceWorkers: 'block' });
  return { context, page: await context.newPage() };
}

{
  const { context, page } = await fresh();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(URL, { waitUntil: 'load' });
  await page.waitForTimeout(500);
  await page.evaluate(() => window.scrollTo(0, 1200));
  await page.waitForTimeout(900);
  await page.goto(URL, { waitUntil: 'load' });
  await page.waitForTimeout(700);
  if (await page.locator('.resume-bar').count() !== 1) fail('không hiện thanh tiếp tục sau khi quay lại');
  await page.getByRole('button', { name: 'Tiếp tục' }).click();
  await page.waitForTimeout(1200);
  const y = await page.evaluate(() => Math.round(window.scrollY));
  if (Math.abs(y - 1200) > 40) fail(`Tiếp tục không đưa về chỗ cũ (y=${y}, cần ~1200)`);
  if (await page.locator('.resume-bar').count() !== 0) fail('thanh chưa ẩn sau khi bấm Tiếp tục');
  if (errors.length) fail(`lỗi trang: ${errors.join('; ')}`);
  await context.close();
}

{
  const { context, page } = await fresh();
  await page.goto(URL, { waitUntil: 'load' });
  await page.waitForTimeout(500);
  await page.evaluate(() => window.scrollTo(0, 900));
  await page.waitForTimeout(900);
  await page.goto(URL, { waitUntil: 'load' });
  await page.waitForTimeout(700);
  await page.getByRole('button', { name: 'Bỏ qua' }).click();
  await page.goto(URL, { waitUntil: 'load' });
  await page.waitForTimeout(700);
  if (await page.locator('.resume-bar').count() !== 0) fail('Bỏ qua xong vẫn hiện lại thanh');
  await context.close();
}

await browser.close();
if (failures.length) {
  console.log('CÓ LỖI:\n- ' + failures.join('\n- '));
  process.exit(1);
}
console.log(`Nhớ chỗ đọc dở: đạt trên ${BASE}.`);
