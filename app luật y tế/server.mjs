// Máy chủ cho app luật y tế: phục vụ file tĩnh, đăng nhập và TTS
// Chạy: node server.mjs   (mặc định cổng 4400)
import { createServer } from 'node:http';
import { readFileSync, existsSync, mkdirSync, writeFileSync, statSync } from 'node:fs';
import { dirname, join, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes, scryptSync, timingSafeEqual, createHash } from 'node:crypto';
import { speak, getVoices, healthCheck as ttsHealth } from './src/tts.mjs';

const ROOT = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 4400);
const DB = resolve(process.env.ACCOUNT_DB || join(ROOT, '..', '2026-10-27-so-y-te-data', 'users.json'));
// Tài khoản (email/tên đăng nhập, đăng ký, phiên) do máy chủ quản lý xử lý.
const ACCOUNTS_URL = (process.env.ACCOUNTS_URL || 'http://localhost:3200').replace(/\/$/, '');
const PROXIED_AUTH = new Set(['/api/auth/login', '/api/auth/register', '/api/auth/logout', '/api/me', '/api/me/entitlements', '/api/plans', '/api/progress']);

async function proxyToAccounts(req, res, path) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  // IP thật của người dùng: lấy từ kết nối, không tin header do trình duyệt gửi lên.
  const headers = { 'x-forwarded-for': req.socket.remoteAddress || 'unknown' };
  for (const h of ['content-type', 'cookie', 'x-csrf-token']) if (req.headers[h]) headers[h] = req.headers[h];
  const noBody = req.method === 'GET' || req.method === 'HEAD';
  try {
    const r = await fetch(ACCOUNTS_URL + path, { method: req.method, headers, body: noBody ? undefined : Buffer.concat(chunks) });
    const out = { 'content-type': r.headers.get('content-type') || 'application/json; charset=utf-8' };
    const cookies = r.headers.getSetCookie ? r.headers.getSetCookie() : [];
    if (cookies.length) out['set-cookie'] = cookies;
    res.writeHead(r.status, out);
    res.end(Buffer.from(await r.arrayBuffer()));
  } catch (e) {
    sendJson(res, 503, { error: { code: 'ACCOUNTS_UNAVAILABLE', message: 'Chưa kết nối được máy chủ tài khoản. Thử lại sau.' } });
  }
}

const SESSION_MS = 24 * 60 * 60 * 1000;
const REQUIRE_LOGIN = process.env.REQUIRE_LOGIN === 'true'; // phiên đăng nhập tự hết sau 24 giờ
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.xml': 'application/xml', '.txt': 'text/plain', '.wav': 'audio/wav' };

export function loadUsers(path = DB) {
  if (!existsSync(path)) return { users: [] };
  return JSON.parse(readFileSync(path, 'utf8'));
}
export function saveUsers(data, path = DB) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(data, null, 2) + '\n', 'utf8');
}
export function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `scrypt$${salt}$${hash}`;
}
export function checkPassword(password, stored) {
  const [alg, salt, hash] = String(stored).split('$');
  if (alg !== 'scrypt' || !salt || !hash) return false;
  const a = Buffer.from(hash, hex);
  const b = scryptSync(password, salt, a.length);
  return a.length === b.length && timingSafeEqual(a, b);
}
export function addUser(email, password, path = DB) {
  const e = String(email || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) throw new Error('Email không hợp lệ.');
  if (typeof password !== 'string' || password.length < 10) throw new Error('Mật khẩu phải có ít nhất 10 ký tự.');
  const data = loadUsers(path);
  if (data.users.some(u => u.email === e)) throw new Error('Email đã có tài khoản.');
  data.users.push({ email: e, password: hashPassword(password), createdAt: new Date().toISOString() });
  saveUsers(data, path);
  return e;
}

const sessions = new Map(); // token hash -> { email, exp }
const hashToken = t => createHash('sha256').update(t).digest('hex');
function readCookie(req, name) {
  const m = (req.headers.cookie || '').match(new RegExp('(?:^|;\\s*)' + name + '=([^;]+)'));
  return m ? decodeURIComponent(m[1]) : null;
}
function currentUser(req) {
  const t = readCookie(req, 'lyt_session');
  if (!t) return null;
  const s = sessions.get(hashToken(t));
  if (!s || s.exp < Date.now()) return null;
  return s.email;
}
function sendJson(res, code, obj, headers = {}) {
  res.writeHead(code, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers });
  res.end(JSON.stringify(obj));
}
function readBody(req) {
  return new Promise((ok, bad) => {
    let s = '';
    req.on('data', c => { s += c; if (s.length > 10_000) { req.destroy(); bad(new Error('too large')); } });
    req.on('end', () => { try { ok(s ? JSON.parse(s) : {}); } catch (e) { bad(e); } });
    req.on('error', bad);
  });
}

export function createHandler() {
  return async (req, res) => {
    const url = new URL(req.url, 'http://localhost');

    // ---- TTS Routes ----
    if (url.pathname === '/api/tts/voices' && req.method === 'GET') {
      return sendJson(res, 200, getVoices());
    }
    if (url.pathname === '/api/tts/health' && req.method === 'GET') {
      return sendJson(res, 200, ttsHealth());
    }
    if (url.pathname === '/api/tts/speak' && req.method === 'POST') {
      let body;
      try { body = await readBody(req); } catch { return sendJson(res, 400, { error: 'Dữ liệu không hợp lệ.' }); }
      const { text, voice = 'vi_VN-vais1000-medium' , speed = 1.0 } = body;
      if (!text || typeof text !== 'string') {
        return sendJson(res, 400, { error: 'Thiếu trường "text".' });
      }
      try {
        const result = speak(text, voice, speed);
        return sendJson(res, 200, {
          success: true,
          audioFile: `/output/${result.outputWav.split(/[\\/]/).pop()}`,
          voice: result.voice,
          duration: result.duration
        });
      } catch (error) {
        return sendJson(res, 500, { error: error.message });
      }
    }
    if (url.pathname.startsWith('/output/') && req.method === 'GET') {
      const filename = url.pathname.slice('/output/'.length);
      const filePath = join(ROOT, 'output', filename);
      if (!existsSync(filePath) || !filePath.startsWith(join(ROOT, 'output'))) {
        return sendJson(res, 404, { error: 'Không tìm thấy file.' });
      }
      res.writeHead(200, { 'content-type': 'audio/wav', 'cache-control': 'public, max-age=3600' });
      return res.end(readFileSync(filePath));
    }

    // ---- Tài khoản: chuyển tiếp sang máy chủ quản lý (email hoặc tên đăng nhập, đăng ký, phiên) ----
    if (url.pathname === '/api/scores' || url.pathname.startsWith('/api/scores/')) {
      return proxyToAccounts(req, res, url.pathname);
    }
    if (PROXIED_AUTH.has(url.pathname)) {
      return proxyToAccounts(req, res, url.pathname);
    }

    // ---- Yêu cầu đăng nhập: chỉ trang đăng nhập và giao diện được mở tự do; nội dung cần phiên đăng nhập ----
    const PUBLIC_FILES = ['/dang-nhap.html', '/404.html', '/robots.txt', '/manifest.json', '/sw.js', '/icon.svg', '/site.css', '/base.css', '/tokens.css'];
    const isPublic = PUBLIC_FILES.includes(url.pathname) || url.pathname.startsWith('/img/') || url.pathname.endsWith('.css');
    // Đăng nhập bắt buộc chỉ bật khi REQUIRE_LOGIN=true (mặc định tắt)
    if (REQUIRE_LOGIN && !isPublic && (req.method === 'GET' || req.method === 'HEAD')) {
      let loggedIn = false;
      try {
        const r = await fetch(ACCOUNTS_URL + '/api/me', { headers: { cookie: req.headers.cookie || '' } });
        loggedIn = r.ok;
      } catch { loggedIn = false; }
      if (!loggedIn) {
        res.writeHead(302, { location: '/dang-nhap.html?next=' + encodeURIComponent(url.pathname), 'cache-control': 'no-store' });
        return res.end();
      }
    }

    // ---- Bài giảng dạng slide (Slidev, build sẵn trong slides-ly-thuyet/dist) ----
    if (url.pathname === '/slides' || url.pathname.startsWith('/slides/')) {
      if (req.method !== 'GET' && req.method !== 'HEAD') return sendJson(res, 405, { error: 'Không hỗ trợ.' });
      const DIST = resolve(ROOT, 'slides-ly-thuyet', 'dist');
      const rel = decodeURIComponent(url.pathname.slice('/slides'.length)) || '/';
      let target = resolve(DIST, '.' + rel);
      if (!target.startsWith(DIST)) { res.writeHead(404); return res.end('Không tìm thấy'); }
      const isDir = existsSync(target) && statSync(target).isDirectory();
      if (isDir) target = join(target, 'index.html');
      if (!existsSync(target)) {
        // Slide theo đường dẫn (/slides/3): trả về bộ slide gốc hoặc bộ chương tương ứng
        const seg = rel.split('/')[1];
        const folder = ['chuong1', 'chuong1-v2'].includes(seg) ? join(DIST, seg) : DIST;
        target = join(folder, 'index.html');
      }
      if (!existsSync(target)) { res.writeHead(404); return res.end('Chưa có bài giảng slide. Chạy build trong slides-ly-thuyet.'); }
      const ext = extname(target);
      const TYPE = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.wav': 'audio/wav', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.webp': 'image/webp', '.jpg': 'image/jpeg' };
      res.writeHead(200, { 'content-type': TYPE[ext] || 'application/octet-stream', 'cache-control': 'no-cache' });
      return res.end(readFileSync(target));
    }

    // ---- Static Files ----
    if (req.method !== 'GET' && req.method !== 'HEAD') return sendJson(res, 405, { error: 'Không hỗ trợ.' });
    let p = decodeURIComponent(url.pathname);
    if (p.endsWith('/')) p += 'index.html';
    const file = resolve(ROOT, '.' + p);
    if (!file.startsWith(ROOT) || /\.(mjs)$/.test(file) || file === resolve(ROOT, 'server.mjs')) { res.writeHead(404); return res.end('Không tìm thấy'); }
    if (!existsSync(file)) { res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }); return res.end('Không tìm thấy'); }
    // no-cache: trình duyệt luôn kiểm tra bản mới, tránh dùng trang cũ sau khi sửa.
    res.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream', 'cache-control': 'no-cache' });
    res.end(readFileSync(file));
  };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  createServer(createHandler()).listen(PORT, () => console.log(`Luật y tế đang chạy tại http://localhost:${PORT}`));
}
