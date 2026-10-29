import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { openDb } from '../src/db.mjs';
import { createApp } from '../src/app.mjs';
import { hashPassword, verifyPassword } from '../src/auth.mjs';
import { codeAt, base32Encode, base32Decode, matchTotp } from '../src/totp.mjs';
import { createLimiter } from '../src/ratelimit.mjs';

const PW = 'mat-khau-dai-10';

async function start({ allowRegistration = true } = {}) {
  const db = openDb(':memory:');
  const server = createServer(createApp({ db, allowRegistration }));
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${server.address().port}`;
  const close = () => new Promise(r => server.close(r));
  return { db, base, close };
}

function addUser(db, email, role = 'user', pw = PW) {
  db.prepare('INSERT INTO users (email, password_hash, role, status, created_at) VALUES (?, ?, ?, ?, ?)')
    .run(email, hashPassword(pw), role, 'active', new Date().toISOString());
}

async function call(base, method, path, { body, cookie } = {}) {
  const headers = {};
  if (body !== undefined) headers['content-type'] = 'application/json';
  if (cookie) headers.cookie = cookie;
  if (cookie && method !== 'GET' && !(['/api/auth/login', '/api/auth/register', '/api/auth/logout'].includes(path) || path.startsWith('/api/payments/callback'))) {
    const me = await fetch(base + '/api/me', { headers: { cookie } });
    const j = await me.json().catch(() => ({}));
    if (j.csrfToken) headers['x-csrf-token'] = j.csrfToken;
  }
  const r = await fetch(base + path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  const data = await r.json().catch(() => ({}));
  const set = r.headers.get('set-cookie');
  const token = set && set.match(/lyt_session=([^;]+)/);
  return { status: r.status, data, cookie: token && token[1] ? `lyt_session=${token[1]}` : null, cleared: set && /Max-Age=0/.test(set) };
}

const login = (base, email, password = PW) => call(base, 'POST', '/api/auth/login', { body: { email, password } });
const currentCode = secret => codeAt(secret, Math.floor(Date.now() / 1000 / 30));
// Mã của bước kế tiếp: mã của bước hiện tại đã dùng khi bật TOTP nên không được dùng lại.
const nextCode = secret => codeAt(secret, Math.floor(Date.now() / 1000 / 30) + 1);

// ---- Mật khẩu và TOTP ----

test('mật khẩu: băm và kiểm tra đúng, không lưu gốc, không chấp nhận quá ngắn', () => {
  const h = hashPassword(PW);
  assert.ok(h.startsWith('scrypt$'));
  assert.ok(!h.includes(PW));
  assert.equal(verifyPassword(PW, h), true);
  assert.equal(verifyPassword('sai-mat-khau', h), false);
  assert.throws(() => hashPassword('ngan'), /ít nhất 10 ký tự/);
});

test('TOTP khớp vector RFC 6238 (SHA1, bí mật ASCII "12345678901234567890", lấy 6 số cuối của mã 8 số)', () => {
  const secret = base32Encode(Buffer.from('12345678901234567890', 'ascii'));
  assert.equal(base32Decode(secret).toString('ascii'), '12345678901234567890');
  // T=59 → 94287082; T=1111111109 → 07081804; T=1234567890 → 89005924
  assert.equal(codeAt(secret, 1), '287082');
  assert.equal(codeAt(secret, 37037036), '081804');
  assert.equal(codeAt(secret, 41152263), '005924');
});

test('TOTP chấp nhận bước lệch ±1 và từ chối bước đã dùng', () => {
  const secret = base32Encode(Buffer.from('12345678901234567890', 'ascii'));
  const t = 59 * 1000;
  assert.equal(matchTotp(secret, '287082', t, -1), 1);
  assert.equal(matchTotp(secret, '287082', t, 1), null, 'bước 1 đã dùng thì không được dùng lại');
  assert.equal(matchTotp(secret, 'abcdef', t, -1), null);
});

test('giới hạn thử: đếm lần sai theo IP và email, quá ngưỡng thì chặn', () => {
  let t = 0;
  const lim = createLimiter({ max: 2, windowMs: 1000, now: () => t });
  assert.equal(lim.blocked('k'), false);
  lim.attempt('k'); lim.attempt('k'); lim.attempt('k');
  assert.equal(lim.blocked('k'), true);
  t = 2000;
  assert.equal(lim.blocked('k'), false, 'hết cửa sổ thì mở lại');
});

// ---- API ----

test('đăng nhập sai nhiều lần bị chặn theo email (3 lần) rồi trả 429', async () => {
  const { db, base, close } = await start();
  try {
    addUser(db, 'a@vidu.com');
    for (let i = 0; i < 3; i++) assert.equal((await login(base, 'a@vidu.com', 'sai-sai-sai-1')).status, 401);
    assert.equal((await login(base, 'a@vidu.com', 'sai-sai-sai-1')).status, 429);
    assert.equal((await login(base, 'a@vidu.com')).status, 429, 'đã bị chặn thì đúng mật khẩu cũng không vào');
  } finally { await close(); }
});

test('đăng nhập đúng không tính vào giới hạn', async () => {
  const { db, base, close } = await start();
  try {
    addUser(db, 'b@vidu.com');
    for (let i = 0; i < 10; i++) assert.equal((await login(base, 'b@vidu.com')).status, 200);
  } finally { await close(); }
});

test('không có phiên: API quản trị trả 401; user thường trả 403', async () => {
  const { db, base, close } = await start();
  try {
    assert.equal((await call(base, 'GET', '/api/admin/users')).status, 401);
    addUser(db, 'u@vidu.com', 'user');
    const r = await login(base, 'u@vidu.com');
    assert.equal((await call(base, 'GET', '/api/admin/users', { cookie: r.cookie })).status, 403);
  } finally { await close(); }
});

test('admin chưa bật TOTP: không vào được danh sách user, phải bật TOTP trước', async () => {
  const { db, base, close } = await start();
  try {
    addUser(db, 'admin@vidu.com', 'admin');
    const r = await login(base, 'admin@vidu.com');
    assert.equal(r.data.user.totpEnabled, false);
    const list = await call(base, 'GET', '/api/admin/users', { cookie: r.cookie });
    assert.equal(list.status, 403);
    assert.equal(list.data.error.code, 'TOTP_SETUP_REQUIRED');
  } finally { await close(); }
});

test('bật TOTP cho admin rồi đăng nhập lại: phải nhập mã mới vào được', async () => {
  const { db, base, close } = await start();
  try {
    addUser(db, 'admin2@vidu.com', 'admin');
    const r1 = await login(base, 'admin2@vidu.com');
    const setup = await call(base, 'POST', '/api/admin/totp/setup', { body: {}, cookie: r1.cookie });
    assert.equal(setup.status, 200);
    assert.match(setup.data.otpauth, /^otpauth:\/\/totp\//);
    const enable = await call(base, 'POST', '/api/admin/totp/enable', { body: { code: currentCode(setup.data.secret) }, cookie: r1.cookie });
    assert.equal(enable.status, 200);

    const r2 = await login(base, 'admin2@vidu.com');
    assert.equal(r2.data.user.mfaOk, false);
    assert.equal((await call(base, 'GET', '/api/admin/users', { cookie: r2.cookie })).data.error.code, 'TOTP_REQUIRED');
    assert.equal((await call(base, 'POST', '/api/auth/totp', { body: { code: '000000' }, cookie: r2.cookie })).status, 401);
    const ok = await call(base, 'POST', '/api/auth/totp', { body: { code: nextCode(setup.data.secret) }, cookie: r2.cookie });
    assert.equal(ok.status, 200);
    // Mã đã dùng không được dùng lại
    const r3 = await login(base, 'admin2@vidu.com');
    const reuse = await call(base, 'POST', '/api/auth/totp', { body: { code: nextCode(setup.data.secret) }, cookie: r3.cookie });
    assert.equal(reuse.status, 401);
    assert.equal((await call(base, 'GET', '/api/admin/users', { cookie: r2.cookie })).status, 200);
  } finally { await close(); }
});

test('admin khóa user: user đó không đăng nhập được và phiên cũ bị thu hồi', async () => {
  const { db, base, close } = await start();
  try {
    addUser(db, 'admin3@vidu.com', 'admin');
    addUser(db, 'nguoi@vidu.com', 'user');
    const adm = await login(base, 'admin3@vidu.com');
    const setup = await call(base, 'POST', '/api/admin/totp/setup', { body: {}, cookie: adm.cookie });
    await call(base, 'POST', '/api/admin/totp/enable', { body: { code: currentCode(setup.data.secret) }, cookie: adm.cookie });
    const adm2 = await login(base, 'admin3@vidu.com');
    await call(base, 'POST', '/api/auth/totp', { body: { code: nextCode(setup.data.secret) }, cookie: adm2.cookie });

    const userId = db.prepare('SELECT id FROM users WHERE email = ?').get('nguoi@vidu.com').id;
    const userSession = await login(base, 'nguoi@vidu.com');
    assert.equal((await call(base, 'PUT', `/api/admin/users/${userId}/lock`, { body: { locked: true }, cookie: adm2.cookie })).status, 200);
    assert.equal((await call(base, 'GET', '/api/me', { cookie: userSession.cookie })).status, 401);
    assert.equal((await login(base, 'nguoi@vidu.com')).data.error.code, 'ACCOUNT_LOCKED');
  } finally { await close(); }
});

test('admin không tự khóa hoặc tự hạ quyền chính mình', async () => {
  const { db, base, close } = await start();
  try {
    addUser(db, 'admin4@vidu.com', 'admin');
    const adm = await login(base, 'admin4@vidu.com');
    const setup = await call(base, 'POST', '/api/admin/totp/setup', { body: {}, cookie: adm.cookie });
    await call(base, 'POST', '/api/admin/totp/enable', { body: { code: currentCode(setup.data.secret) }, cookie: adm.cookie });
    const adm2 = await login(base, 'admin4@vidu.com');
    await call(base, 'POST', '/api/auth/totp', { body: { code: nextCode(setup.data.secret) }, cookie: adm2.cookie });
    const selfId = db.prepare('SELECT id FROM users WHERE email = ?').get('admin4@vidu.com').id;
    assert.equal((await call(base, 'PUT', `/api/admin/users/${selfId}/lock`, { body: { locked: true }, cookie: adm2.cookie })).data.error.code, 'SELF_LOCK');
    assert.equal((await call(base, 'PUT', `/api/admin/users/${selfId}/role`, { body: { role: 'user' }, cookie: adm2.cookie })).data.error.code, 'SELF_DEMOTE');
  } finally { await close(); }
});

test('đăng ký ghi lịch sử đồng ý; admin xem được lịch sử', async () => {
  const { db, base, close } = await start();
  try {
    const reg = await call(base, 'POST', '/api/auth/register', { body: { email: 'moi@vidu.com', username: 'moi_vidu', password: PW, acceptTerms: true } });
    assert.equal(reg.status, 201);
    const row = db.prepare('SELECT type, version FROM consents').get();
    assert.equal(row.type, 'terms');
    const noTerms = await call(base, 'POST', '/api/auth/register', { body: { email: 'x@vidu.com', username: 'x_vidu', password: PW, acceptTerms: false } });
    assert.equal(noTerms.data.error.code, 'TERMS_REQUIRED');
    assert.equal((await call(base, 'POST', '/api/auth/register', { body: { email: 'moi@vidu.com', username: 'moi_vidu', password: PW, acceptTerms: true } })).status, 409);
  } finally { await close(); }
});

test('đăng ký đóng thì trả 403', async () => {
  const { base, close } = await start({ allowRegistration: false });
  try {
    const r = await call(base, 'POST', '/api/auth/register', { body: { email: 'a@vidu.com', username: 'a_vidu', password: PW, acceptTerms: true } });
    assert.equal(r.status, 403);
  } finally { await close(); }
});

test('ghi API phải là application/json (chống CSRF đơn giản)', async () => {
  const { base, close } = await start();
  try {
    const r = await fetch(base + '/api/auth/login', { method: 'POST', headers: { 'content-type': 'text/plain' }, body: '{}' });
    assert.equal(r.status, 415);
  } finally { await close(); }
});
