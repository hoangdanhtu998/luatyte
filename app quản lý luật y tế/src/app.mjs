// Ứng dụng quản lý: đăng nhập, TOTP, quản lý user, lịch sử đồng ý, gói cước, email, nhật ký, CSRF, CORS, giao diện admin.
import { createHash, randomBytes } from 'node:crypto';
import { readFileSync, existsSync } from 'node:fs';
import { join, extname, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { hashPassword, verifyPassword, MIN_PASSWORD } from './auth.mjs';
import { newSecret, matchTotp, otpauthUri, codeAt } from './totp.mjs';
import { createLimiter } from './ratelimit.mjs';
import { createGateways } from './billing.mjs';
import { createBillingRoutes } from './billing-routes.mjs';
import { createOpsRoutes } from './ops-routes.mjs';
import { recordLogin, audit, newCsrfToken, csrfRequired, corsHeadersFor } from './ops.mjs';
import { createP567Routes } from './phase567-routes.mjs';
import { createAccessRoutes } from './access-routes.mjs';
import { createAdsIpRoutes } from './ads-ip-routes.mjs';
import { createScoresRoutes } from './scores-routes.mjs';
import { createToolsRoutes } from './tools-routes.mjs';
import { createDiagramsRoutes } from './diagrams-routes.mjs';
import { createPeopleRoutes } from './users-routes.mjs';
import { createProgressRoutes } from './progress-routes.mjs';
import { recordError } from './phase567.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const PUBLIC = join(HERE, '..', 'public');
const SESSION_MS = 24 * 60 * 60 * 1000; // phiên đăng nhập tự hết sau 24 giờ
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon' };
const sha = s => createHash('sha256').update(s).digest('hex');

const USERNAME_RE = /^[A-Za-z0-9_.]{3,30}$/;

export function createApp({ db, now = () => Date.now(), trustProxy = false, allowRegistration = true, consentVersion = '2026-10-27', paymentSecret = '', sendEmail = null, cryptoKey = null, allowedOrigins = [], backupDir = './data/backups', fxVndPerUsd = 26000 }) {
  const ipLimiter = createLimiter({ max: 5, windowMs: 15 * 60 * 1000, now });
  const emailLimiter = createLimiter({ max: 3, windowMs: 15 * 60 * 1000, now });
  // Cổng thanh toán chỉ bật khi có PAYMENT_SECRET (ít nhất 16 ký tự).
  const gateways = paymentSecret ? createGateways({ secret: paymentSecret }) : {};

  function send(res, code, obj, headers = {}) {
    res.writeHead(code, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers });
    res.end(JSON.stringify(obj));
  }
  const err = (res, code, errorCode, message) => send(res, code, { error: { code: errorCode, message } });

  function readBody(req) {
    return new Promise((ok, bad) => {
      let s = '';
      req.on('data', c => { s += c; if (s.length > 20_000) { req.destroy(); bad(Object.assign(new Error('too large'), { code: 'TOO_LARGE' })); } });
      req.on('end', () => { try { ok(s ? JSON.parse(s) : {}); } catch { bad(Object.assign(new Error('bad json'), { code: 'BAD_JSON' })); } });
      req.on('error', bad);
    });
  }
  function cookie(req, name) {
    const m = (req.headers.cookie || '').match(new RegExp('(?:^|;\\s*)' + name + '=([^;]+)'));
    return m ? decodeURIComponent(m[1]) : null;
  }
  function sessionOf(req) {
    const t = cookie(req, 'lyt_session');
    if (!t) return null;
    const row = db.prepare('SELECT s.token_hash, s.user_id, s.exp, s.mfa_ok, s.csrf, u.email, u.username, u.role, u.status, u.totp_enabled FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = ?').get(sha(t));
    if (!row || row.exp <= now()) return null;
    if (row.status !== 'active') return null;
    return row;
  }
  function publicUser(row) {
    return { id: row.user_id ?? row.id, email: row.email, username: row.username ?? null, role: row.role, status: row.status, totpEnabled: !!(row.totp_enabled ?? row.totpEnabled), mfaOk: !!row.mfa_ok };
  }
  function startSession(res, userId, mfaOk) {
    const token = randomBytes(32).toString('base64url');
    const csrf = newCsrfToken();
    db.prepare('INSERT INTO sessions (token_hash, user_id, exp, mfa_ok, csrf) VALUES (?, ?, ?, ?, ?)').run(sha(token), userId, now() + SESSION_MS, mfaOk ? 1 : 0, csrf);
    return { headers: { 'set-cookie': `lyt_session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${SESSION_MS / 1000}` }, csrf };
  }
  function requireAdmin(req, res, { needMfa = true } = {}) {
    const s = sessionOf(req);
    if (!s) { err(res, 401, 'UNAUTHENTICATED', 'Chưa đăng nhập.'); return null; }
    if (s.role !== 'admin') { err(res, 403, 'FORBIDDEN', 'Chỉ quản trị viên mới dùng được.'); return null; }
    if (needMfa) {
      if (!s.totp_enabled) { err(res, 403, 'TOTP_SETUP_REQUIRED', 'Cần bật xác minh hai lớp trước.'); return null; }
      if (!s.mfa_ok) { err(res, 403, 'TOTP_REQUIRED', 'Cần nhập mã xác minh hai lớp.'); return null; }
    }
    return s;
  }
  function requireJson(req, res) {
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE') {
      if (req.method !== 'DELETE' && !String(req.headers['content-type'] || '').startsWith('application/json')) {
        err(res, 415, 'UNSUPPORTED_MEDIA', 'Yêu cầu ghi phải là application/json.');
        return false;
      }
    }
    return true;
  }
  // Chỉ đọc X-Forwarded-For khi TRUST_PROXY=true (đặt sau proxy/Cloudflare). Không thì dùng IP kết nối trực tiếp.
  const clientIp = req => {
    if (trustProxy) {
      const xff = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
      if (xff) return xff.slice(0, 64);
    }
    return (req.socket && req.socket.remoteAddress) || 'unknown';
  };
  const ua = req => String(req.headers['user-agent'] || '');
  const adminIdOf = s => s.user_id;
  const auditFn = (req, s, a) => audit(db, { adminId: adminIdOf(s), ip: clientIp(req), now: now(), ...a });

  async function handleApi(req, res, url) {
    const p = url.pathname;
    const m = req.method;

    if (p === '/api/auth/login' && m === 'POST') {
      const body = await readBody(req);
      // Đăng nhập bằng email hoặc tên đăng nhập (trường email hoặc identifier đều được).
      const identifier = String(body.identifier || body.email || body.username || '').trim().toLowerCase();
      const email = identifier;
      const ip = clientIp(req);
      // Chỉ đếm lần sai. IP: tối đa 5 lần sai, email: tối đa 3 lần sai, trong 15 phút.
      if (ipLimiter.blocked(`ip:${ip}`) || (email && emailLimiter.blocked(`email:${email}`))) {
        recordLogin(db, { email, ip, userAgent: ua(req), success: false, reason: 'RATE_LIMITED', now: now() });
        return err(res, 429, 'RATE_LIMITED', 'Bạn thử quá nhiều lần. Vui lòng đợi 15 phút.');
      }
      const user = identifier.includes('@')
        ? db.prepare('SELECT * FROM users WHERE email = ?').get(identifier)
        : db.prepare('SELECT * FROM users WHERE username = ? COLLATE NOCASE').get(identifier);
      const ok = verifyPassword(body.password, user ? user.password_hash : hashPassword('x'.repeat(MIN_PASSWORD)));
      if (!user || !ok) {
        ipLimiter.attempt(`ip:${ip}`);
        if (email) emailLimiter.attempt(`email:${email}`);
        recordLogin(db, { userId: user ? user.id : null, email, ip, userAgent: ua(req), success: false, reason: 'INVALID_CREDENTIALS', now: now() });
        return err(res, 401, 'INVALID_CREDENTIALS', 'Email hoặc mật khẩu không đúng.');
      }
      if (user.status !== 'active') {
        recordLogin(db, { userId: user.id, email, ip, userAgent: ua(req), success: false, reason: 'ACCOUNT_LOCKED', now: now() });
        return err(res, 403, 'ACCOUNT_LOCKED', 'Tài khoản đã bị khóa.');
      }
      ipLimiter.clear(`ip:${ip}`);
      emailLimiter.clear(`email:${email}`);
      recordLogin(db, { userId: user.id, email, ip, userAgent: ua(req), success: true, now: now() });
      const s = startSession(res, user.id, !user.totp_enabled);
      return send(res, 200, { user: publicUser({ ...user, mfa_ok: !user.totp_enabled }), csrfToken: s.csrf }, s.headers);
    }

    if (p === '/api/auth/totp' && m === 'POST') {
      const s = sessionOf(req);
      if (!s) return err(res, 401, 'UNAUTHENTICATED', 'Chưa đăng nhập.');
      const body = await readBody(req);
      if (!s.totp_enabled) return err(res, 400, 'TOTP_NOT_ENABLED', 'Tài khoản chưa bật xác minh hai lớp.');
      const user = db.prepare('SELECT totp_secret, totp_last_step FROM users WHERE id = ?').get(s.user_id);
      const step = matchTotp(user.totp_secret, body.code, now(), user.totp_last_step);
      if (step === null) return err(res, 401, 'INVALID_TOTP', 'Mã xác minh không đúng hoặc đã dùng.');
      db.prepare('UPDATE users SET totp_last_step = ? WHERE id = ?').run(step, s.user_id);
      db.prepare('UPDATE sessions SET mfa_ok = 1 WHERE token_hash = ?').run(s.token_hash);
      return send(res, 200, { ok: true });
    }

    if (p === '/api/auth/logout' && m === 'POST') {
      const t = cookie(req, 'lyt_session');
      if (t) db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(sha(t));
      return send(res, 200, { ok: true }, { 'set-cookie': 'lyt_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0' });
    }

    if (p === '/api/auth/register' && m === 'POST') {
      if (!allowRegistration) return err(res, 403, 'REGISTRATION_CLOSED', 'Đăng ký đang đóng.');
      const body = await readBody(req);
      const email = String(body.email || '').trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return err(res, 400, 'INVALID_EMAIL', 'Email không hợp lệ.');
      if (body.acceptTerms !== true) return err(res, 400, 'TERMS_REQUIRED', 'Cần đồng ý điều khoản.');
      let hash;
      try { hash = hashPassword(body.password); } catch (e) { return err(res, 400, 'WEAK_PASSWORD', e.message); }
      if (db.prepare('SELECT id FROM users WHERE email = ?').get(email)) return err(res, 409, 'EMAIL_TAKEN', 'Email này đã có tài khoản.');
      const username = String(body.username || '').trim();
      if (!USERNAME_RE.test(username)) return err(res, 400, 'INVALID_USERNAME', 'Tên đăng nhập 3 đến 30 ký tự, chỉ gồm chữ, số, dấu gạch dưới và dấu chấm.');
      if (db.prepare('SELECT id FROM users WHERE username = ? COLLATE NOCASE').get(username)) return err(res, 409, 'USERNAME_TAKEN', 'Tên đăng nhập này đã có người dùng.');
      const info = db.prepare('INSERT INTO users (email, username, name, password_hash, role, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)').run(email, username, String(body.name || '').slice(0, 100), hash, 'user', 'active', new Date(now()).toISOString());
      db.prepare('INSERT INTO consents (user_id, type, version, agreed_at, ip) VALUES (?, ?, ?, ?, ?)').run(Number(info.lastInsertRowid), 'terms', consentVersion, new Date(now()).toISOString(), clientIp(req));
      return send(res, 201, { ok: true });
    }

    if (p === '/api/me' && m === 'GET') {
      const s = sessionOf(req);
      if (!s) return err(res, 401, 'UNAUTHENTICATED', 'Chưa đăng nhập.');
      return send(res, 200, { user: publicUser(s), csrfToken: s.csrf });
    }

    if (p === '/api/consents' && m === 'POST') {
      const s = sessionOf(req);
      if (!s) return err(res, 401, 'UNAUTHENTICATED', 'Chưa đăng nhập.');
      const body = await readBody(req);
      const type = String(body.type || '').slice(0, 40);
      const version = String(body.version || consentVersion).slice(0, 40);
      if (!type) return err(res, 400, 'INVALID_INPUT', 'Thiếu loại đồng ý.');
      db.prepare('INSERT INTO consents (user_id, type, version, agreed_at, ip) VALUES (?, ?, ?, ?, ?)').run(s.user_id, type, version, new Date(now()).toISOString(), clientIp(req));
      return send(res, 201, { ok: true });
    }

    // ---- TOTP cho admin ----
    if (p === '/api/admin/totp/setup' && m === 'POST') {
      const s = requireAdmin(req, res, { needMfa: false });
      if (!s) return;
      if (s.totp_enabled) return err(res, 409, 'TOTP_ALREADY_ENABLED', 'Đã bật xác minh hai lớp.');
      const secret = newSecret();
      db.prepare('UPDATE users SET totp_secret = ? WHERE id = ?').run(secret, s.user_id);
      return send(res, 200, { secret, otpauth: otpauthUri(secret, s.email) });
    }
    if (p === '/api/admin/totp/enable' && m === 'POST') {
      const s = requireAdmin(req, res, { needMfa: false });
      if (!s) return;
      const body = await readBody(req);
      const user = db.prepare('SELECT totp_secret FROM users WHERE id = ?').get(s.user_id);
      if (!user.totp_secret) return err(res, 400, 'TOTP_NOT_SETUP', 'Chưa tạo khóa. Gọi setup trước.');
      const step = matchTotp(user.totp_secret, body.code, now(), -1);
      if (step === null) return err(res, 401, 'INVALID_TOTP', 'Mã xác minh không đúng.');
      db.prepare('UPDATE users SET totp_enabled = 1, totp_last_step = ? WHERE id = ?').run(step, s.user_id);
      db.prepare('UPDATE sessions SET mfa_ok = 1 WHERE token_hash = (SELECT token_hash FROM sessions WHERE user_id = ? AND exp > ? ORDER BY exp DESC LIMIT 1)').run(s.user_id, now());
      return send(res, 200, { ok: true });
    }
    if (p === '/api/admin/totp/disable' && m === 'POST') {
      const s = requireAdmin(req, res, { needMfa: true });
      if (!s) return;
      const body = await readBody(req);
      const user = db.prepare('SELECT totp_secret, totp_last_step FROM users WHERE id = ?').get(s.user_id);
      if (matchTotp(user.totp_secret, body.code, now(), user.totp_last_step) === null) return err(res, 401, 'INVALID_TOTP', 'Mã xác minh không đúng.');
      db.prepare('UPDATE users SET totp_enabled = 0, totp_secret = NULL, totp_last_step = -1 WHERE id = ?').run(s.user_id);
      db.prepare('DELETE FROM sessions WHERE user_id = ?').run(s.user_id);
      auditFn(req, s, { action: 'TOTP_DISABLE', entity: 'User', entityId: s.user_id });
      return send(res, 200, { ok: true }, { 'set-cookie': 'lyt_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0' });
    }

    // ---- Quản lý user (cần admin + TOTP) ----
    if (p === '/api/admin/users' && m === 'GET') {
      if (!requireAdmin(req, res)) return;
      const q = `%${(url.searchParams.get('q') || '').trim().toLowerCase()}%`;
      const role = url.searchParams.get('role');
      const status = url.searchParams.get('status');
      const rows = db.prepare(`SELECT id, email, role, status, totp_enabled, created_at FROM users
        WHERE lower(email) LIKE ? AND (? IS NULL OR role = ?) AND (? IS NULL OR status = ?) ORDER BY id`)
        .all(q, role, role, status, status);
      return send(res, 200, { users: rows.map(r => ({ id: r.id, email: r.email, role: r.role, status: r.status, totpEnabled: !!r.totp_enabled, createdAt: r.created_at })) });
    }
    const um = p.match(/^\/api\/admin\/users\/(\d+)(\/(role|lock|reset-password|consents))?$/);
    if (um) {
      const id = Number(um[1]);
      const action = um[3];
      const s = requireAdmin(req, res);
      if (!s) return;
      const target = db.prepare('SELECT id, role, status FROM users WHERE id = ?').get(id);
      if (!target) return err(res, 404, 'NOT_FOUND', 'Không tìm thấy user.');
      if (!action && m === 'GET') return send(res, 200, { user: target });
      if (action === 'consents' && m === 'GET') {
        const rows = db.prepare('SELECT type, version, agreed_at, ip FROM consents WHERE user_id = ? ORDER BY id DESC').all(id);
        return send(res, 200, { consents: rows.map(r => ({ type: r.type, version: r.version, agreedAt: r.agreed_at, ip: r.ip })) });
      }
      if (action === 'role' && m === 'PUT') {
        const body = await readBody(req);
        if (!['user', 'admin'].includes(body.role)) return err(res, 400, 'INVALID_INPUT', 'Vai trò không hợp lệ.');
        if (id === s.user_id && body.role !== 'admin') return err(res, 400, 'SELF_DEMOTE', 'Không tự hạ quyền chính mình.');
        db.prepare('UPDATE users SET role = ? WHERE id = ?').run(body.role, id);
        auditFn(req, s, { action: 'UPDATE', entity: 'User.role', entityId: id, oldValue: { role: target.role }, newValue: { role: body.role } });
        return send(res, 200, { ok: true });
      }
      if (action === 'lock' && m === 'PUT') {
        const body = await readBody(req);
        if (id === s.user_id) return err(res, 400, 'SELF_LOCK', 'Không tự khóa chính mình.');
        const status = body.locked === true ? 'locked' : 'active';
        db.prepare('UPDATE users SET status = ? WHERE id = ?').run(status, id);
        if (status === 'locked') db.prepare('DELETE FROM sessions WHERE user_id = ?').run(id);
        auditFn(req, s, { action: 'UPDATE', entity: 'User.status', entityId: id, oldValue: { status: target.status }, newValue: { status } });
        return send(res, 200, { ok: true, status });
      }
      if (action === 'reset-password' && m === 'POST') {
        const body = await readBody(req);
        let hash;
        try { hash = hashPassword(body.password); } catch (e) { return err(res, 400, 'WEAK_PASSWORD', e.message); }
        db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, id);
        db.prepare('DELETE FROM sessions WHERE user_id = ?').run(id);
        auditFn(req, s, { action: 'RESET_PASSWORD', entity: 'User', entityId: id });
        return send(res, 200, { ok: true });
      }
    }

    return false; // để các module khác xử lý
  }

  function serveStatic(req, res, url) {
    let p = decodeURIComponent(url.pathname);
    if (p === '/' || p === '/admin') p = '/index.html';
    const file = resolve(PUBLIC, '.' + p);
    if (!file.startsWith(resolve(PUBLIC))) { res.writeHead(404); return res.end('Không tìm thấy'); }
    if (!existsSync(file)) { res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }); return res.end('Không tìm thấy'); }
    res.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream', 'cache-control': 'no-cache' });
    res.end(readFileSync(file));
  }

  const helpers = { sessionOf, requireAdmin, readBody, send, err, audit: (req, s, a) => auditFn(req, s, a), clientIp, sendEmail, cryptoKey };
  const billing = createBillingRoutes({ db, now, gateways, helpers });
  const ops = createOpsRoutes({ db, now, helpers });
  const access = createAccessRoutes({ db, now, helpers });
  const adsIp = createAdsIpRoutes({ db, now, helpers });
  const scores = createScoresRoutes({ db, now, helpers });
  const tools = createToolsRoutes({ db, now, helpers });
  const diagrams = createDiagramsRoutes({ dir: join(HERE, '..', 'diagrams'), helpers });
  const people = createPeopleRoutes({ db, now, helpers });
  const progress = createProgressRoutes({ db, now, helpers });
  const p567 = createP567Routes({ db, now, helpers: { ...helpers, backupDir: () => backupDir, fxVndPerUsd: () => fxVndPerUsd } });

  return async function handler(req, res) {
    const url = new URL(req.url, 'http://localhost');
    // CORS: chỉ các origin trong ALLOWED_ORIGINS được gọi API từ trình duyệt.
    const cors = corsHeadersFor(req.headers.origin, allowedOrigins);
    for (const [k, v] of Object.entries(cors)) res.setHeader(k, v);
    if (req.method === 'OPTIONS' && url.pathname.startsWith('/api/')) { res.writeHead(204, cors); return res.end(); }
    try {
      if (url.pathname.startsWith('/api/')) {
        if (!requireJson(req, res)) return;
        // CSRF: yêu cầu ghi khi đã có phiên phải gửi đúng X-CSRF-Token.
        if (csrfRequired(req.method, url.pathname)) {
          const s = sessionOf(req);
          if (s && req.headers['x-csrf-token'] !== s.csrf) return err(res, 403, 'CSRF_INVALID', 'Thiếu hoặc sai mã CSRF.');
        }
        if (await handleApi(req, res, url) !== false) return;
        if (await billing(req, res, url)) return;
        if (await ops(req, res, url)) return;
        if (await access(req, res, url)) return;
        if (await adsIp(req, res, url)) return;
        if (await scores(req, res, url)) return;
        if (await tools(req, res, url)) return;
        if (await diagrams(req, res, url)) return;
        if (await people(req, res, url)) return;
        if (await progress(req, res, url)) return;
        if (await p567(req, res, url)) return;
        return err(res, 404, 'NOT_FOUND', 'Không tìm thấy API.');
      }
      return serveStatic(req, res, url);
    } catch (e) {
      if (e.code === 'BAD_JSON') return err(res, 400, 'BAD_JSON', 'Dữ liệu JSON không hợp lệ.');
      if (e.code === 'TOO_LARGE') return err(res, 413, 'TOO_LARGE', 'Dữ liệu quá lớn.');
      if (e.status && e.code) return err(res, e.status, e.code, e.message);
      console.error('lỗi:', e);
      try { recordError(db, { path: url.pathname, message: e && e.message ? e.message : String(e), now: now() }); } catch { /* không để lỗi ghi nhật ký làm hỏng phản hồi */ }
      return err(res, 500, 'INTERNAL', 'Lỗi hệ thống.');
    }
  };
}
