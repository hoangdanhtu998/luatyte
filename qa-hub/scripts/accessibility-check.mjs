// Chạy axe-core (WCAG 2.1 AA) trên các trang và ghi báo cáo.
// Dùng: npm run a11y -- [URL...]   (mặc định: các trang chính của QA Hub trên BASE_URL)
// Ra: results/a11y/axe-report.json và results/a11y/accessibility-report.md. Thoát mã 1 nếu vượt ngưỡng.
import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { countByImpact, evaluate, buildMarkdownReport, DEFAULT_THRESHOLDS } from '../lib/a11y-report.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = path.join(ROOT, 'results', 'a11y');
const BASE = process.env.BASE_URL ?? 'http://127.0.0.1:3000';
const PAGES = ['#/tong', '#/testcases', '#/bugs', '#/summary', '#/assistant'];
const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

function targetUrls(argv) {
  if (argv.length) return argv;
  return PAGES.map((hash) => `${BASE.replace(/\/$/, '')}/${hash}`);
}

async function scanPage(browser, url) {
  const context = await browser.newContext({ locale: 'vi-VN', viewport: { width: 1280, height: 800 } });
  try {
    const page = await context.newPage();
    await page.goto(url, { waitUntil: 'load' });
    await page.waitForTimeout(800);
    const result = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
    return { url, violations: result.violations };
  } finally {
    await context.close();
  }
}

async function main() {
  const urls = targetUrls(process.argv.slice(2));
  mkdirSync(OUT_DIR, { recursive: true });
  const browser = await chromium.launch();
  const scans = [];
  try {
    for (const url of urls) scans.push(await scanPage(browser, url));
  } finally {
    await browser.close();
  }

  const all = scans.flatMap((s) => s.violations);
  const counts = countByImpact(all);
  const verdict = evaluate(counts, DEFAULT_THRESHOLDS);
  const date = new Date().toISOString();

  writeFileSync(path.join(OUT_DIR, 'axe-report.json'), JSON.stringify({ date, thresholds: DEFAULT_THRESHOLDS, counts, verdict, pages: scans }, null, 2), 'utf8');
  const md = scans.map((s) => buildMarkdownReport({
    url: s.url,
    date,
    violations: s.violations,
    counts: countByImpact(s.violations),
    verdict: evaluate(countByImpact(s.violations), DEFAULT_THRESHOLDS),
  })).join('\n---\n\n');
  writeFileSync(path.join(OUT_DIR, 'accessibility-report.md'), md, 'utf8');

  console.log(`Đã quét ${scans.length} trang. Lỗi: critical=${counts.critical}, serious=${counts.serious}, moderate=${counts.moderate}, minor=${counts.minor}`);
  for (const w of verdict.warnings) console.warn(`Cảnh báo: ${w}`);
  if (!verdict.ok) {
    console.error(`KHÔNG ĐẠT: ${verdict.failures.join('; ')}`);
    process.exitCode = 1;
  } else {
    console.log('ĐẠT ngưỡng.');
  }
}

main().catch((err) => {
  console.error('Lỗi khi chạy axe:', err.message);
  process.exitCode = 2;
});
