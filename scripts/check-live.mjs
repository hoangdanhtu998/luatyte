// Kiểm tra trang đang chạy trên site: mọi trang HTML trong app trả 200,
// và mọi link nội bộ (tính theo thư mục của trang chứa link) trả 200.
// Dùng: node scripts/check-live.mjs [base-url]   (mặc định http://luatyte.online)
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, dirname, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', 'app luật y tế');
const BASE = (process.argv[2] || 'http://luatyte.online').replace(/\/$/, '');
const CONCURRENCY = 8;

function htmlFiles(dir, out = []) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) {
      if (!['node_modules', 'slides-ly-thuyet', 'deliverables', 'assets'].includes(f)) htmlFiles(p, out);
    } else if (f.endsWith('.html')) out.push(p);
  }
  return out;
}

async function status(url) {
  try {
    const r = await fetch(url, { method: 'HEAD', redirect: 'follow' });
    return r.status;
  } catch (e) {
    return `ERR ${e.cause?.code || e.message}`;
  }
}

const pages = htmlFiles(ROOT).map((p) => relative(ROOT, p).split(sep).join('/'));
const problems = [];

async function pool(items, fn) {
  const queue = [...items];
  await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
    while (queue.length) await fn(queue.shift());
  }));
}

await pool(pages, async (page) => {
  const s = await status(`${BASE}/${page}`);
  if (s !== 200) problems.push(`${page}: trang trả ${s}`);
  const html = readFileSync(join(ROOT, page), 'utf8');
  const links = new Set();
  for (const m of html.matchAll(/href="([^"#?]+)(?:[?#][^"]*)?"/g)) {
    const h = m[1];
    if (/^(https?:|mailto:|tel:|javascript:|data:)/.test(h) || h.startsWith('//')) continue;
    links.add(h);
  }
  const dir = dirname(page) === '.' ? '' : dirname(page) + '/';
  await pool([...links], async (h) => {
    const target = h.startsWith('/') ? h.slice(1) : dir + h;
    const ls = await status(`${BASE}/${target}`);
    if (ls !== 200) problems.push(`${page} → ${h}: ${ls}`);
  });
});

console.log(`Đã kiểm tra ${pages.length} trang trên ${BASE}.`);
if (problems.length) {
  console.log(problems.sort().join('\n'));
  process.exit(1);
}
console.log('Không có trang hoặc link nội bộ hỏng.');
