// Kiểm tra ngoại tuyến (mục 28): mở trang chủ để cài service worker, mở các bài đã chọn khi có mạng,
// rồi chuyển ngoại tuyến và mở lại. Nội dung phải giống hệt bản online.
// Dùng: node scripts/check-offline.mjs [base-url]
import { chromium } from 'playwright';

const BASE = (process.argv[2] || 'https://luatyte.online').replace(/\/$/, '');
const CHAPTERS = [
  '/ly_thuyet.html',
  '/hoc-test/lesson.html?track=tester&id=cap4-kiem-thu-la-gi',
  '/hoc-code/lesson.html?id=con-tro-va-bo-nho',
];
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await context.newPage();
const failures = [];

const textLength = () => page.locator('body').innerText().then((t) => t.trim().length);

await page.goto(BASE + '/', { waitUntil: 'load' });
await page.waitForTimeout(3000); // để service worker cài và cache lõi
const online = {};
for (const path of CHAPTERS) {
  await page.goto(BASE + path, { waitUntil: 'load', timeout: 30000 });
  await page.waitForTimeout(2500);
  online[path] = await textLength();
}
await page.waitForTimeout(1500);
await context.setOffline(true);
for (const path of CHAPTERS) {
  try {
    await page.goto(BASE + path, { waitUntil: 'load', timeout: 15000 });
    await page.waitForTimeout(2000);
    const offline = await textLength();
    if (offline !== online[path]) failures.push(`${path}: online ${online[path]} ký tự, offline ${offline} ký tự`);
  } catch (e) {
    failures.push(`${path}: không mở được khi ngoại tuyến (${e.message.split('\n')[0]})`);
  }
}
await context.setOffline(false);
await browser.close();
if (failures.length) {
  console.log('CÓ LỖI:\n- ' + failures.join('\n- '));
  process.exit(1);
}
console.log(`Ngoại tuyến: ${CHAPTERS.length} bài mở đúng nội dung khi mất mạng trên ${BASE}.`);
