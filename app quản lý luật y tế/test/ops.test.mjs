import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { openDb } from '../src/db.mjs';
import { createApp } from '../src/app.mjs';
import { hashPassword } from '../src/auth.mjs';
import { codeAt } from '../src/totp.mjs';
import { encryptSecret, decryptSecret, parseKey } from '../src/crypto.mjs';
import { enqueue } from '../src/mail.mjs';

const PW = 'mat-khau-dai-10';
const KEY_HEX = '00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff';
const KEY = parseKey(KEY_HEX);
const ORIGIN = 'https://hoclieu.vn';

function clock() { let t = Date.parse('2026-06-01T00:00:00Z'); return { now: () => t, add: ms => { t += ms; } }; }

async function start({ sendEmail = null } = {}) {
  const db = openDb(':memory:');
  const clk = clock();
  const server = createServer(createApp({
    db, now: clk.now, cryptoKey: KEY, allowedOrigins: [ORIGIN], paymentSecret: 'bi-mat-thanh-toan-16+', sendEmail,
  }));
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  return { db, clk, base: `http://127.0.0.1:${server.address().port}`, close: () => new Promise(r => server.close(r)) };
}

async function call(base, method, path, { body, cookie, csrf, headers: extra = {} } = {}) {
  const headers = { ...extra };
  if (body !== undefined) headers['content-type'] = 'application/json';
  if (cookie) headers.cookie = cookie;
  if (csrf !== undefined) headers['x-csrf-token'] = csrf;
  const r = await fetch(base + path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  const data = await r.json().catch(() => ({}));
  const set = r.headers.get('set-cookie');
  const token = set && set.match(/lyt_session=([^;]+)/);
  return { status: r.status, data, headers: r.headers, cookie: token && token[1] ? `lyt_session=${token[1]}` : null };
}

async function adminSession(base, db, clk) {
  db.prepare('INSERT INTO users (email, password_hash, role, status, created_at) VALUES (?, ?, ?, ?, ?)').run('admin@vidu.com', hashPassword(PW), 'admin', 'active', new Date().toISOString());
  const r1 = await call(base, 'POST', '/api/auth/login', { body: { email: 'admin@vidu.com', password: PW } });
  const setup = await call(base, 'POST', '/api/admin/totp/setup', { body: {}, cookie: r1.cookie, csrf: r1.data.csrfToken });
  const step = Math.floor(clk.now() / 30000);
  await call(base, 'POST', '/api/admin/totp/enable', { body: { code: codeAt(setup.data.secret, step) }, cookie: r1.cookie, csrf: r1.data.csrfToken });
  const r2 = await call(base, 'POST', '/api/auth/login', { body: { email: 'admin@vidu.com', password: PW } });
  await call(base, 'POST', '/api/auth/totp', { body: { code: codeAt(setup.data.secret, step + 1) }, cookie: r2.cookie, csrf: r2.data.csrfToken });
  return { cookie: r2.cookie, csrf: r2.data.csrfToken };
}

test('mã hóa AES-256: đúng khóa mới giải được, sửa dữ liệu thì bị phát hiện', () => {
  const enc = encryptSecret('mat-khau-smtp', KEY);
  assert.ok(enc.startsWith('v1:'));
  assert.ok(!enc.includes('mat-khau-smtp'));
  assert.equal(decryptSecret(enc, KEY), 'mat-khau-smtp');
  const tampered = enc.slice(0, -2) + (enc.endsWith('A') ? 'BB' : 'AA');
  assert.throws(() => decryptSecret(tampered, KEY));
  assert.throws(() => parseKey('ngan'), /64 ký tự hex/);
});

test('cấu hình email: mật khẩu SMTP được mã hóa trong DB và không bao giờ trả về qua API', async () => {
  const { db, clk, base, close } = await start();
  try {
    const { cookie, csrf } = await adminSession(base, db, clk);
    const put = await call(base, 'PUT', '/api/admin/settings/email-config', {
      body: { host: 'smtp.vidu.vn', port: 587, user: 'nguoi@vidu.vn', from: 'no-reply@vidu.vn', password: 'mat-khau-smtp-that', enabled: true },
      cookie, csrf,
    });
    assert.equal(put.status, 200);
    assert.equal(put.data.config.hasPassword, true);
    assert.ok(!JSON.stringify(put.data).includes('mat-khau-smtp-that'));
    const raw = db.prepare("SELECT value, is_secret FROM settings WHERE key = 'email.password'").get();
    assert.equal(raw.is_secret, 1);
    assert.ok(raw.value.startsWith('v1:'), 'DB chỉ chứa bản mã hóa');
    const get = await call(base, 'GET', '/api/admin/settings/email-config', { cookie });
    assert.equal(get.data.config.host, 'smtp.vidu.vn');
    assert.ok(!JSON.stringify(get.data).includes('mat-khau-smtp-that'));
  } finally { await close(); }
});

test('gửi thử email: báo thành công hoặc thất bại rõ ràng', async () => {
  const sent = [];
  const { db, clk, base, close } = await start({ sendEmail: async (to, s, b) => { if (to.startsWith('loi')) throw new Error('Máy chủ SMTP từ chối'); sent.push(to); } });
  try {
    const { cookie, csrf } = await adminSession(base, db, clk);
    const ok = await call(base, 'POST', '/api/admin/settings/email-config/test', { body: { to: 'a@vidu.vn' }, cookie, csrf });
    assert.equal(ok.data.success, true);
    const bad = await call(base, 'POST', '/api/admin/settings/email-config/test', { body: { to: 'loi@vidu.vn' }, cookie, csrf });
    assert.equal(bad.data.success, false);
    assert.match(bad.data.error, /SMTP/);
    assert.deepEqual(sent, ['a@vidu.vn']);
  } finally { await close(); }
});

test('hàng đợi email: xem danh sách theo trạng thái và thử lại thư lỗi', async () => {
  const { db, clk, base, close } = await start();
  try {
    const { cookie, csrf } = await adminSession(base, db, clk);
    const id = enqueue(db, { to: 'x@vidu.vn', subject: 'S', body: 'B' }, clk.now());
    db.prepare("UPDATE email_queue SET status = 'failed', attempts = 4, last_error = 'lỗi' WHERE id = ?").run(id);
    const list = await call(base, 'GET', '/api/admin/email-queue?status=failed', { cookie });
    assert.equal(list.data.items.length, 1);
    assert.equal(list.data.items[0].lastError, 'lỗi');
    const retry = await call(base, 'POST', `/api/admin/email-queue/${id}/retry`, { body: {}, cookie, csrf });
    assert.deepEqual(retry.data, { ok: true });
    assert.equal(db.prepare('SELECT status FROM email_queue WHERE id = ?').get(id).status, 'queued');
  } finally { await close(); }
});

test('nhật ký đăng nhập ghi cả lần đúng và lần sai, admin xem được', async () => {
  const { db, clk, base, close } = await start();
  try {
    const { cookie } = await adminSession(base, db, clk);
    await call(base, 'POST', '/api/auth/login', { body: { email: 'admin@vidu.com', password: 'sai-mat-khau-1' } });
    const logs = await call(base, 'GET', '/api/admin/login-logs', { cookie });
    const fails = logs.data.items.filter(l => !l.success);
    assert.ok(fails.length >= 1);
    assert.equal(fails[0].failedReason, 'INVALID_CREDENTIALS');
    assert.ok(logs.data.items.some(l => l.success));
  } finally { await close(); }
});

test('nhật ký thao tác admin: sửa cấu hình email được ghi kèm giá trị cũ và mới, không lộ mật khẩu', async () => {
  const { db, clk, base, close } = await start();
  try {
    const { cookie, csrf } = await adminSession(base, db, clk);
    await call(base, 'PUT', '/api/admin/settings/email-config', { body: { host: 'smtp.a.vn', password: 'mat-khau-bi-mat-99' }, cookie, csrf });
    const audit = await call(base, 'GET', '/api/admin/audit-logs', { cookie });
    const entry = audit.data.items.find(a => a.entity === 'Setting.email');
    assert.ok(entry, 'phải có bản ghi audit');
    assert.equal(entry.action, 'UPDATE');
    assert.ok(!JSON.stringify(entry).includes('mat-khau-bi-mat-99'));
    assert.equal(entry.newValue.host, 'smtp.a.vn');
  } finally { await close(); }
});

test('CSRF: yêu cầu ghi có phiên nhưng sai hoặc thiếu token bị từ chối 403', async () => {
  const { db, clk, base, close } = await start();
  try {
    const { cookie, csrf } = await adminSession(base, db, clk);
    const noToken = await call(base, 'PUT', '/api/admin/settings/email-config', { body: { host: 'smtp.x.vn' }, cookie });
    assert.equal(noToken.status, 403);
    assert.equal(noToken.data.error.code, 'CSRF_INVALID');
    const wrong = await call(base, 'PUT', '/api/admin/settings/email-config', { body: { host: 'smtp.x.vn' }, cookie, csrf: 'sai' });
    assert.equal(wrong.status, 403);
    const right = await call(base, 'PUT', '/api/admin/settings/email-config', { body: { host: 'smtp.x.vn' }, cookie, csrf });
    assert.equal(right.status, 200);
  } finally { await close(); }
});

test('CORS: chỉ origin trong danh sách được phép nhận header; origin lạ không nhận', async () => {
  const { base, close } = await start();
  try {
    const ok = await fetch(base + '/api/config', { headers: { origin: ORIGIN } });
    assert.equal(ok.headers.get('access-control-allow-origin'), ORIGIN);
    const bad = await fetch(base + '/api/config', { headers: { origin: 'https://evil.example' } });
    assert.equal(bad.headers.get('access-control-allow-origin'), null);
    const pre = await fetch(base + '/api/me', { method: 'OPTIONS', headers: { origin: ORIGIN } });
    assert.equal(pre.status, 204);
    assert.match(pre.headers.get('access-control-allow-headers'), /x-csrf-token/);
  } finally { await close(); }
});
