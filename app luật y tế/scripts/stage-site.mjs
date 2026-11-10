// Gom file site vào thư mục _site (dùng để đưa lên Cloudflare Pages hoặc hosting tĩnh khác).
// Chỉ lấy file đã track trong git (giống bước checkout của CI), nên không kéo file tạm hay node_modules.
// Chạy: node scripts/stage-site.mjs [thư-mục-đích]   (mặc định: _site)
// Ghép thêm hoc-test/, 404.html, CNAME từ thư mục cha (gốc repo) nếu có.
// Bỏ mã nguồn, công cụ, dữ liệu nội bộ và thư mục audio/ (file giọng được phát từ jsDelivr).
import { cp, rm, mkdir, readdir, access } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { join, resolve, dirname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const APP = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const REPO = resolve(APP, '..');
const OUT = resolve(process.argv[2] || join(APP, '_site'));

// Thư mục ở gốc site không đưa lên
const SKIP_TOP = new Set(['.git', 'node_modules', '.github', 'scripts', 'test', 'docs', 'deploy', 'deliverables', 'output', 'src', 'audio', '_site', 'voices']);
// File ở gốc site không đưa lên
const SKIP_TOP_FILES = new Set(['server.mjs']);

function keep(rel) {
  const parts = rel.split('/');
  if (SKIP_TOP.has(parts[0])) return false;
  if (parts.length === 1 && SKIP_TOP_FILES.has(parts[0])) return false;
  if (parts.includes('node_modules')) return false;
  if (rel.endsWith('.log')) return false;
  return true;
}

async function exists(p) {
  try { await access(p); return true; } catch { return false; }
}

async function countFiles(dir) {
  let n = 0;
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) n += await countFiles(p);
    else n++;
  }
  return n;
}

const tracked = execFileSync('git', ['ls-files', '-z'], { cwd: APP, maxBuffer: 64 * 1024 * 1024 })
  .toString('utf8').split('\0').filter(Boolean);
const files = tracked.filter(keep);

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });
for (const rel of files) {
  const dest = join(OUT, ...rel.split('/'));
  await mkdir(dirname(dest), { recursive: true });
  await cp(join(APP, ...rel.split('/')), dest);
}

if (await exists(join(REPO, 'hoc-test'))) {
  const hocFiles = execFileSync('git', ['ls-files', '-z', '--', 'hoc-test'], { cwd: REPO, maxBuffer: 64 * 1024 * 1024 })
    .toString('utf8').split('\0').filter(Boolean);
  for (const rel of hocFiles) {
    const dest = join(OUT, ...rel.split('/').slice(0));
    await mkdir(dirname(dest), { recursive: true });
    await cp(join(REPO, ...rel.split('/')), dest);
  }
}
for (const f of ['404.html', 'CNAME']) {
  if (await exists(join(REPO, f))) await cp(join(REPO, f), join(OUT, f));
}

console.log(`Đã gom site vào ${OUT}: ${await countFiles(OUT)} file`);
