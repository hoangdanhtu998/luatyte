// Xuất dữ liệu QA Hub ra một file HTML duy nhất, kèm bằng chứng tự động từ axe và Lighthouse.
// Dùng: npm run export-html -- [đường_dẫn_file.html]   (mặc định: results/QA-Hub-Du-Lieu.html)
// Không ghi đè dữ liệu gốc; không tự tick checklist.
import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderHtml } from '../lib/html-export.js';
import { collectEvidence } from '../lib/evidence.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const RUNTIME = path.join(ROOT, 'data', 'runtime');
const OUT = path.resolve(ROOT, process.argv[2] ?? path.join('results', 'QA-Hub-Du-Lieu.html'));

function readJson(file, fallback) {
  return existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : fallback;
}

function listOf(name) {
  const data = readJson(path.join(RUNTIME, `${name}.json`), []);
  return Array.isArray(data) ? data : (data.items ?? []);
}

// Lấy báo cáo Lighthouse mới nhất trong .lighthouseci (một trang).
function latestLhr() {
  const dir = path.join(ROOT, '.lighthouseci');
  if (!existsSync(dir)) return null;
  const files = readdirSync(dir).filter((f) => /^lhr-.*\.json$/.test(f))
    .sort((a, b) => statSync(path.join(dir, b)).mtimeMs - statSync(path.join(dir, a)).mtimeMs);
  return files.length ? readJson(path.join(dir, files[0]), null) : null;
}

const axeReport = readJson(path.join(ROOT, 'results', 'a11y', 'axe-report.json'), null);
const a11yText = existsSync(path.join(ROOT, 'results', 'a11y', 'accessibility-report.md'))
  ? readFileSync(path.join(ROOT, 'results', 'a11y', 'accessibility-report.md'), 'utf8')
  : null;

const data = {
  date: new Date().toISOString().slice(0, 16).replace('T', ' '),
  projects: listOf('projects'),
  checklist: readJson(path.join(RUNTIME, 'checklist.json'), []),
  testcases: listOf('testcases'),
  bugs: listOf('bugs'),
  requirements: listOf('requirements'),
  suites: listOf('suites'),
  reviews: listOf('reviews'),
  runs: listOf('runs'),
  plan: readJson(path.join(ROOT, 'data', 'plan.json'), null),
  faq: existsSync(path.join(ROOT, 'knowledge', 'qa-hub-faq.md'))
    ? readFileSync(path.join(ROOT, 'knowledge', 'qa-hub-faq.md'), 'utf8')
    : null,
  a11yText,
  evidence: collectEvidence({ axeReport, lhr: latestLhr() }),
};

mkdirSync(path.dirname(OUT), { recursive: true });
writeFileSync(OUT, renderHtml(data), 'utf8');
console.log(`Đã xuất ${OUT}`);
console.log(`Bằng chứng tự động: ${data.evidence.map((e) => `${e.checklistId}=${e.result}`).join(', ') || 'không có'}`);
