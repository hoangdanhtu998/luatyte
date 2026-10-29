import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { openDb } from '../src/db.mjs';
import { createApp } from '../src/app.mjs';
import { hashPassword } from '../src/auth.mjs';
import { codeAt } from '../src/totp.mjs';
import { createPlan } from '../src/billing.mjs';
import { toCsv } from '../src/csv.mjs';

const PW = 'mat-khau-dai-10';
const T0 = Date.parse('2026-06-15T12:00:00Z');

function clock() { let t = T0; return { now: () => t, add: ms => { t += ms; } }; }

async function start() {
  const db = openDb(':memory:');
  const clk = clock();
  const server = createServer(createApp({ db, now: clk.now }));
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  return { db, clk, base: `http://127.0.0.1:${server.address().port}`, close: () => new Promise(r => server.close(r)) };
}

async function call(base, method, path, { body, cookie, csrf } = {}) {
  const headers = {};
  if (body !== undefined) headers['content-type'] = 'application/json';
  if (cookie) headers.cookie = cookie;
  if (csrf !== undefined) headers['x-csrf-token'] = csrf;
  const r = await fetch(base + path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  const text = await r.text();
  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch { data = { text }; }
  const set = r.headers.get('set-cookie');
  const token = set && set.match(/lyt_session=([^;]+)/);
  return { status: r.status, data, text, headers: r.headers, cookie: token && token[1] ? `lyt_session=${token[1]}` : null };
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

test('CSV người dùng: có BOM, tiêu đề, lọc được và thoát dấu phẩy/ngoặc kép', async () => {
  const { db, clk, base, close } = await start();
  try {
    const s = await adminSession(base, db, clk);
    db.prepare('INSERT INTO users (email, username, name, password_hash, role, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run('a@vidu.vn', 'nguoiA', 'Nguyễn, "A"', 'x', 'user', 'active', new Date(T0).toISOString());
    db.prepare('INSERT INTO users (email, username, name, password_hash, role, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run('b@vidu.vn', 'nguoiB', 'Trần B', 'x', 'user', 'locked', new Date(T0).toISOString());

    const r = await call(base, 'GET', '/api/admin/users.csv', { cookie: s.cookie });
    assert.equal(r.status, 200);
    assert.match(r.headers.get('content-type'), /text\/csv/);
    // Response.text() tự bỏ BOM khi giải mã UTF-8, nên kiểm tra BOM ở hàm tạo CSV.
    assert.ok(toCsv([], [{ label: 'a', key: 'a' }]).startsWith('\uFEFF'), 'CSV phải có BOM');
    assert.ok(r.text.startsWith('Tên đăng nhập'), 'phải có tiêu đề');
    assert.ok(r.text.includes('"Nguyễn, ""A"""'), 'dấu phẩy và ngoặc kép phải được thoát');
    assert.ok(r.text.includes('nguoiB'));

    const filtered = await call(base, 'GET', '/api/admin/users.csv?status=locked', { cookie: s.cookie });
    assert.ok(filtered.text.includes('nguoiB'));
    assert.ok(!filtered.text.includes('nguoiA'));

    const anon = await call(base, 'GET', '/api/admin/users.csv');
    assert.equal(anon.status, 401);
  } finally { await close(); }
});

test('CSV doanh thu: có dòng tổng, số tiền đúng và cần quyền admin', async () => {
  const { db, clk, base, close } = await start();
  try {
    const s = await adminSession(base, db, clk);
    const plan = createPlan(db, { name: 'Gói tháng', durationDays: 30, price: 50000 }, T0);
    db.prepare("INSERT INTO orders (user_id, plan_id, gateway, amount, final_amount, status, created_at, paid_at) VALUES (?, ?, 'sandbox', ?, ?, 'paid', ?, ?)")
      .run(1, plan.id, 50000, 50000, new Date(T0).toISOString(), new Date(T0).toISOString());

    const from = encodeURIComponent(new Date(T0 - 86400000).toISOString());
    const to = encodeURIComponent(new Date(T0 + 86400000).toISOString());
    const r = await call(base, 'GET', `/api/admin/reports/revenue.csv?groupBy=day&from=${from}&to=${to}`, { cookie: s.cookie });
    assert.equal(r.status, 200);
    assert.match(r.headers.get('content-type'), /text\/csv/);
    assert.ok(r.text.includes('Ngày,Doanh thu (VND)'));
    assert.ok(r.text.includes('TỔNG,50000'));
    assert.ok(r.text.includes('2026-06-15,50000'));

    const anon = await call(base, 'GET', `/api/admin/reports/revenue.csv?groupBy=day&from=${from}&to=${to}`);
    assert.equal(anon.status, 401);
  } finally { await close(); }
});
