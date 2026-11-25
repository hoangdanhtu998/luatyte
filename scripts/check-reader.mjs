// Kiểm tra trình đọc bài (mục 26): nút Tạm dừng hiện khi đang đọc, đổi qua lại Tạm dừng/Tiếp tục, ẩn khi dừng.
// Dùng: node scripts/check-reader.mjs [base-url]
import { chromium } from 'playwright';

const BASE = (process.argv[2] || 'https://luatyte.online').replace(/\/$/, '');
const PAGES = ['/ly_thuyet.html', '/dao-duc.html', '/tam-quan.html'];
const browser = await chromium.launch();
const failures = [];

for (const path of PAGES) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, serviceWorkers: 'block' });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(BASE + path, { waitUntil: 'load' });
  await page.waitForSelector('#reader-play', { state: 'attached', timeout: 15000 }).catch(() => failures.push(`${path}: không có trình đọc`));
  if (!(await page.locator('#reader-pause').isHidden())) failures.push(`${path}: nút Tạm dừng hiện trước khi đọc`);
  await page.locator('#reader-play').click();
  await page.waitForTimeout(300);
  if (await page.locator('#reader-pause').isHidden()) failures.push(`${path}: đang đọc mà không thấy nút Tạm dừng`);
  await page.locator('#reader-pause').click();
  if ((await page.locator('#reader-pause').textContent()).trim() !== 'Tiếp tục') failures.push(`${path}: sau khi tạm dừng, nút không đổi thành Tiếp tục`);
  await page.locator('#reader-pause').click();
  if ((await page.locator('#reader-pause').textContent()).trim() !== 'Tạm dừng') failures.push(`${path}: sau khi tiếp tục, nút không đổi thành Tạm dừng`);
  await page.locator('#reader-play').click();
  await page.waitForTimeout(200);
  if (!(await page.locator('#reader-pause').isHidden())) failures.push(`${path}: đã dừng mà nút Tạm dừng vẫn hiện`);
  if (errors.length) failures.push(`${path}: lỗi trang: ${errors.join('; ')}`);
  await context.close();
}

await browser.close();
if (failures.length) {
  console.log('CÓ LỖI:\n- ' + failures.join('\n- '));
  process.exit(1);
}
console.log(`Trình đọc (tạm dừng/tiếp tục): đạt trên ${PAGES.length} trang của ${BASE}.`);
