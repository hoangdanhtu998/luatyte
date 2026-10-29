// Kiểm tra an toàn tối thiểu cho máy chủ app học: không lộ server.mjs, không traversal,
// không lộ .git, URL méo không làm chết server. Kết quả ghi ra .qoder/security/.
import { spawn } from 'node:child_process';
import { request } from 'node:http';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const APP = resolve(HERE, '..', 'app luật y tế');
const OUT_DIR = resolve(HERE, '..', '.qoder', 'security');
const PORT = 4600 + Math.floor(Math.random() * 200);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const results = [];
let child;

function get(path) {
  return new Promise((ok, bad) => {
    const req = request({ host: '127.0.0.1', port: PORT, path, method: 'GET' }, res => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => ok({ status: res.statusCode, type: res.headers['content-type'] || '', body }));
    });
    req.on('error', bad);
    req.end();
  });
}

async function check(name, path, verify) {
  try {
    const r = await get(path);
    const pass = verify(r);
    results.push({ name, path, status: r.status, pass, detail: pass ? '' : r.body.slice(0, 160) });
  } catch (e) {
    results.push({ name, path, pass: false, detail: String(e.message || e) });
  }
}

try {
  child = spawn(process.execPath, ['server.mjs'], {
    cwd: APP,
    env: { ...process.env, PORT: String(PORT) },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let up = false;
  for (let i = 0; i < 50; i++) {
    try { const r = await get('/robots.txt'); if (r.status) { up = true; break; } } catch {}
    await sleep(100);
  }
  if (!up) throw new Error('server không khởi động');

  await check('Trang chủ trả HTML', '/', r => r.status === 200 && /text\/html/.test(r.type) && r.body.includes('Sổ tay Luật Y tế'));
  await check('Chặn server.mjs', '/server.mjs', r => r.status === 404);
  await check('Chặn .git/config', '/.git/config', r => r.status === 404);
  await check('Chặn traversal ../server.mjs', '/..%2f..%2fserver.mjs', r => r.status === 404 || r.status === 400);
  await check('Chặn file .mjs tĩnh', '/js/swipe-core.mjs', r => r.status === 404);
  await check('Module 3D fallback tồn tại', '/js/clinic3d.js', r => r.status === 200 && /javascript/.test(r.type));
  await check('URL méo trả JSON 500', '/%', r => r.status === 500 && r.type.includes('json'));
  await check('Server còn sống sau URL méo', '/robots.txt', r => r.status === 200);

  const pass = results.every(x => x.pass);
  mkdirSync(OUT_DIR, { recursive: true });
  const file = join(OUT_DIR, 'security-smoke.json');
  writeFileSync(file, JSON.stringify({ at: new Date().toISOString(), pass, results }, null, 2) + '\n', 'utf8');
  console.log(`Security smoke: ${results.filter(x => x.pass).length}/${results.length} pass — ${file}`);
  if (!pass) process.exitCode = 1;
} catch (e) {
  console.error('Security smoke lỗi:', e.message || e);
  process.exitCode = 1;
} finally {
  if (child) child.kill();
}
