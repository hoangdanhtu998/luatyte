// Mở từng trang trên site bằng Chromium, ghi lỗi JavaScript và lỗi console.
// Bỏ qua 404 của /api/me (site tĩnh không có máy chủ tài khoản, giao diện đã xử lý).
// Dùng: node scripts/check-console.mjs [base-url]
import { readdirSync, statSync } from 'node:fs';
import { join, dirname, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', 'app luật y tế');
const BASE = (process.argv[2] || 'https://luatyte.online').replace(/\/$/, '');
const IGNORE = [/\/api\/me(\/entitlements)?/, /favicon\.ico/];

function htmlFiles(dir, out = []) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) {
      if (!['node_modules', 'slides-ly-thuyet', 'deliverables', 'assets', 'scripts'].includes(f)) htmlFiles(p, out);
    } else if (f.endsWith('.html')) out.push(p);
  }
  return out;
}

const pages = htmlFiles(ROOT).map((p) => relative(ROOT, p).split(sep).join('/'));
const browser = await chromium.launch();
const problems = [];

async function checkPage(page) {
  const context = await browser.newContext();
  const tab = await context.newPage();
  const errors = [];
  tab.on('pageerror', (e) => errors.push(`lỗi JS: ${e.message.split('\n')[0]}`));
  tab.on('console', (m) => {
    if (m.type() !== 'error') return;
    const text = m.text();
    if (IGNORE.some((re) => re.test(text) || re.test(m.location()?.url || ''))) return;
    errors.push(`console: ${text.slice(0, 160)}`);
  });
  try {
    await tab.goto(`${BASE}/${page}`, { waitUntil: 'load', timeout: 30000 });
    await tab.waitForTimeout(800);
  } catch (e) {
    errors.push(`không tải được: ${e.message.split('\n')[0]}`);
  }
  for (const e of errors) problems.push(`${page}: ${e}`);
  await context.close();
}

const queue = [...pages];
await Promise.all(Array.from({ length: 3 }, async () => {
  const context = null;
  while (queue.length) await checkPage(queue.shift());
}));
await browser.close();

console.log(`Đã mở ${pages.length} trang trên ${BASE}.`);
if (problems.length) {
  console.log(problems.sort().join('\n'));
  process.exit(1);
}
console.log('Không có lỗi JavaScript hoặc console.');
