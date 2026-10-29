import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { openDb } from '../src/db.mjs';
import { createApp } from '../src/app.mjs';
import { hashPassword } from '../src/auth.mjs';
import { codeAt } from '../src/totp.mjs';
import { signPayload, enqueue, processQueue, RETRY_DELAYS_MS, MAX_TRIES, renderTemplate } from '../src/mail.mjs';
import { createPlan } from '../src/billing.mjs';

const PW = 'mat-khau-dai-10';
const SECRET = 'bi-mat-thanh-toan-16+';
const DAY = 24 * 60 * 60 * 1000;

// Thời gian có thể chỉnh để kiểm tra mã hết hạn và nhắc gia hạn.
function clock(start = Date.parse('2026-06-01T00:00:00Z')) {
  let t = start;
  return { now: () => t, set: v => { t = v; }, add: ms => { t += ms; }, get: () => t };
}

async function start(extra = {}) {
  const db = openDb(':memory:');
  const clk = clock();
  const sent = [];
  const server = createServer(createApp({ db, now: clk.now, paymentSecret: SECRET, sendEmail: async (to, s, b) => { sent.push({ to, s, b }); }, ...extra }));
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${server.address().port}`;
  return { db, clk, base, sent, close: () => new Promise(r => server.close(r)) };
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
  return { status: r.status, data, cookie: token && token[1] ? `lyt_session=${token[1]}` : null };
}

function addUser(db, email, { role = 'user', name = '' } = {}) {
  const info = db.prepare('INSERT INTO users (email, password_hash, role, status, created_at, name) VALUES (?, ?, ?, ?, ?, ?)')
    .run(email, hashPassword(PW), role, 'active', new Date().toISOString(), name);
  return Number(info.lastInsertRowid);
}

// Đăng nhập admin và bật TOTP để gọi được các API admin.
async function adminCookie(base, db, clk, email = 'admin@vidu.com') {
  addUser(db, email, { role: 'admin' });
  const r1 = await call(base, 'POST', '/api/auth/login', { body: { email, password: PW } });
  const setup = await call(base, 'POST', '/api/admin/totp/setup', { body: {}, cookie: r1.cookie });
  const step = Math.floor(clk.now() / 30000);
  await call(base, 'POST', '/api/admin/totp/enable', { body: { code: codeAt(setup.data.secret, step) }, cookie: r1.cookie });
  const r2 = await call(base, 'POST', '/api/auth/login', { body: { email, password: PW } });
  await call(base, 'POST', '/api/auth/totp', { body: { code: codeAt(setup.data.secret, step + 1) }, cookie: r2.cookie });
  return { cookie: r2.cookie, secret: setup.data.secret };
}

async function userCookie(base, db, email = 'nguoi@vidu.com', name = 'Nguyễn Văn A') {
  addUser(db, email, { name });
  const r = await call(base, 'POST', '/api/auth/login', { body: { email, password: PW } });
  return r.cookie;
}

test('admin tạo, sửa và xóa gói; người dùng chỉ thấy gói đang bán', async () => {
  const { db, clk, base, close } = await start();
  try {
    const { cookie } = await adminCookie(base, db, clk);
    const c = await call(base, 'POST', '/api/admin/plans', { body: { name: '7 ngày', durationDays: 7, price: 50000, features: { maxBooks: 50 } }, cookie });
    assert.equal(c.status, 201);
    const id = c.data.plan.id;
    await call(base, 'POST', '/api/admin/plans', { body: { name: 'Trọn đời', durationDays: -1, price: 299000 }, cookie });
    const pub = await call(base, 'GET', '/api/plans');
    assert.equal(pub.data.plans.length, 2);
    await call(base, 'DELETE', `/api/admin/plans/${id}`, { cookie });
    const after = await call(base, 'GET', '/api/plans');
    assert.deepEqual(after.data.plans.map(p => p.name), ['Trọn đời']);
    const admin = await call(base, 'GET', '/api/admin/plans', { cookie });
    assert.equal(admin.data.plans.length, 1, 'gói đã xóa mềm không còn trong danh sách admin');
  } finally { await close(); }
});

test('gói sai dữ liệu bị từ chối với thông báo rõ ràng', async () => {
  const { db, clk, base, close } = await start();
  try {
    const { cookie } = await adminCookie(base, db, clk);
    const bad = await call(base, 'POST', '/api/admin/plans', { body: { name: 'x', durationDays: 7, price: -5 }, cookie });
    assert.equal(bad.status, 400);
    assert.equal(bad.data.error.code, 'INVALID_INPUT');
    const badDays = await call(base, 'POST', '/api/admin/plans', { body: { name: 'x', durationDays: 0, price: 5 }, cookie });
    assert.equal(badDays.status, 400);
  } finally { await close(); }
});

test('mã giảm giá: phần trăm, số tiền cố định, hết hạn, hết lượt, sai gói', async () => {
  const { db, clk, base, close } = await start();
  try {
    const { cookie } = await adminCookie(base, db, clk);
    const plan = (await call(base, 'POST', '/api/admin/plans', { body: { name: '7 ngày', durationDays: 7, price: 50000 }, cookie })).data.plan;
    await call(base, 'POST', '/api/admin/discount-codes', { body: { code: 'summer20', type: 'percent', value: 20, maxUses: 1, expiresAt: '2026-12-31T00:00:00Z' }, cookie });
    await call(base, 'POST', '/api/admin/discount-codes', { body: { code: 'MOI10K', type: 'fixed', value: 10000, planId: plan.id }, cookie });
    const u = await userCookie(base, db);

    const ok = await call(base, 'POST', '/api/payments/apply-discount', { body: { code: 'SUMMER20', planId: plan.id }, cookie: u });
    assert.equal(ok.status, 200);
    assert.deepEqual([ok.data.discountAmount, ok.data.finalAmount], [10000, 40000]);

    const fixed = await call(base, 'POST', '/api/payments/apply-discount', { body: { code: 'MOI10K', planId: plan.id }, cookie: u });
    assert.equal(fixed.data.finalAmount, 40000);

    const other = await createPlan(db, { name: 'Khác', durationDays: 7, price: 90000 }, clk.now());
    const wrong = await call(base, 'POST', '/api/payments/apply-discount', { body: { code: 'MOI10K', planId: other.id }, cookie: u });
    assert.equal(wrong.data.error.code, 'DISCOUNT_WRONG_PLAN');

    clk.set(Date.parse('2027-01-02T00:00:00Z'));
    const relogin = await call(base, 'POST', '/api/auth/login', { body: { email: 'nguoi@vidu.com', password: PW } });
    const expired = await call(base, 'POST', '/api/payments/apply-discount', { body: { code: 'SUMMER20', planId: plan.id }, cookie: relogin.cookie });
    assert.equal(expired.data.error.code, 'DISCOUNT_EXPIRED');

  } finally { await close(); }
});

test('thanh toán: callback đúng chữ ký thì kích hoạt gói, lặp lại không cộng gói thêm lần nữa', async () => {
  const { db, clk, base, close } = await start();
  try {
    const { cookie } = await adminCookie(base, db, clk);
    const plan = (await call(base, 'POST', '/api/admin/plans', { body: { name: '7 ngày', durationDays: 7, price: 50000 }, cookie })).data.plan;
    await call(base, 'POST', '/api/admin/discount-codes', { body: { code: 'SALE20', type: 'percent', value: 20, maxUses: 5 }, cookie });
    const u = await userCookie(base, db);

    const order = await call(base, 'POST', '/api/payments/create', { body: { planId: plan.id, gateway: 'sandbox', code: 'SALE20' }, cookie: u });
    assert.equal(order.status, 201);
    assert.equal(order.data.finalAmount, 40000);
    assert.match(order.data.paymentUrl, /order=/);

    const txn = 'TXN-1';
    const sig = signPayload(SECRET, [order.data.orderId, txn, 40000, 'paid']);
    const cb = { orderId: order.data.orderId, txn, amount: 40000, status: 'paid', signature: sig };
    const first = await call(base, 'POST', '/api/payments/callback/sandbox', { body: cb });
    assert.equal(first.status, 200);
    assert.equal(first.data.alreadyPaid, false);

    const sub = await call(base, 'GET', '/api/subscriptions/me', { cookie: u });
    assert.ok(sub.data.subscription, 'phải có gói sau khi thanh toán');
    const endsFirst = sub.data.subscription.endsAt;
    assert.equal(endsFirst - clk.now(), 7 * DAY);

    const again = await call(base, 'POST', '/api/payments/callback/sandbox', { body: cb });
    assert.equal(again.data.alreadyPaid, true);
    const sub2 = await call(base, 'GET', '/api/subscriptions/me', { cookie: u });
    assert.equal(sub2.data.subscription.endsAt, endsFirst, 'lặp callback không được cộng thêm ngày');

    const used = db.prepare('SELECT used_count FROM discount_codes WHERE code = ?').get('SALE20');
    assert.equal(used.used_count, 1);
  } finally { await close(); }
});

test('callback sai chữ ký hoặc sai số tiền bị từ chối, gói không được kích hoạt', async () => {
  const { db, clk, base, close } = await start();
  try {
    const { cookie } = await adminCookie(base, db, clk);
    const plan = (await call(base, 'POST', '/api/admin/plans', { body: { name: '7 ngày', durationDays: 7, price: 50000 }, cookie })).data.plan;
    const u = await userCookie(base, db);
    const order = await call(base, 'POST', '/api/payments/create', { body: { planId: plan.id }, cookie: u });
    const forged = { orderId: order.data.orderId, txn: 'X', amount: 50000, status: 'paid', signature: 'sai' };
    const r1 = await call(base, 'POST', '/api/payments/callback/sandbox', { body: forged });
    assert.equal(r1.status, 400);
    assert.equal((await call(base, 'GET', '/api/subscriptions/me', { cookie: u })).data.subscription, null);

    const sig = signPayload(SECRET, [order.data.orderId, 'T', 1000, 'paid']);
    const r2 = await call(base, 'POST', '/api/payments/callback/sandbox', { body: { orderId: order.data.orderId, txn: 'T', amount: 1000, status: 'paid', signature: sig } });
    assert.equal(r2.data.reason, 'AMOUNT_MISMATCH');
  } finally { await close(); }
});

test('nhắc gia hạn: gói sắp hết hạn trong 7 ngày được xếp hàng gửi đúng một lần', async () => {
  const { db, clk, base, close } = await start();
  try {
    const { cookie } = await adminCookie(base, db, clk);
    const plan = (await call(base, 'POST', '/api/admin/plans', { body: { name: '7 ngày', durationDays: 7, price: 50000 }, cookie })).data.plan;
    const uid = addUser(db, 'sapHet@vidu.com', { name: 'Bình' });
    db.prepare("INSERT INTO subscriptions (user_id, plan_id, starts_at, ends_at, status) VALUES (?, ?, ?, ?, 'active')")
      .run(uid, plan.id, clk.now() - 4 * DAY, clk.now() + 3 * DAY);
    const conDai = addUser(db, 'conDai@vidu.com');
    db.prepare("INSERT INTO subscriptions (user_id, plan_id, starts_at, ends_at, status) VALUES (?, ?, ?, ?, 'active')")
      .run(conDai, plan.id, clk.now(), clk.now() + 30 * DAY);

    const r1 = await call(base, 'POST', '/api/admin/jobs/run/subscription-reminder', { body: {}, cookie });
    assert.deepEqual(r1.data, { candidates: 1, queued: 1 });
    const r2 = await call(base, 'POST', '/api/admin/jobs/run/subscription-reminder', { body: {}, cookie });
    assert.deepEqual(r2.data, { candidates: 0, queued: 0 }, 'chạy lại không gửi trùng');
    const q = db.prepare("SELECT to_address, subject FROM email_queue").all();
    assert.equal(q.length, 1);
    assert.equal(q[0].to_address, 'sapHet@vidu.com');
  } finally { await close(); }
});

test('hàng đợi email: lỗi thì thử lại đúng lịch, đủ số lần thì đánh dấu thất bại', async () => {
  const db = openDb(':memory:');
  let t = 1_000_000;
  enqueue(db, { to: 'a@b.vn', subject: 'S', body: 'B' }, t);
  const fail = async () => { throw new Error('SMTP lỗi'); };
  let stats = await processQueue(db, t, fail);
  assert.deepEqual(stats, { sent: 0, retried: 1, failed: 0 });
  let row = db.prepare('SELECT attempts, next_attempt_at, status FROM email_queue').get();
  assert.equal(row.next_attempt_at, t + RETRY_DELAYS_MS[0]);

  t = row.next_attempt_at;
  await processQueue(db, t, fail);
  t += RETRY_DELAYS_MS[1];
  await processQueue(db, t, fail);
  t += RETRY_DELAYS_MS[2];
  stats = await processQueue(db, t, fail);
  row = db.prepare('SELECT attempts, status, last_error FROM email_queue').get();
  assert.equal(row.attempts, MAX_TRIES);
  assert.equal(row.status, 'failed');
  assert.match(row.last_error, /SMTP/);
});

test('mẫu email: thiếu biến thì báo lỗi, không gửi thư thiếu thông tin', () => {
  assert.throws(() => renderTemplate('renewal-reminder', { userName: 'A' }), /Thiếu biến: expiryDate/);
  const ok = renderTemplate('renewal-reminder', { userName: 'A', expiryDate: '2026-06-08' });
  assert.match(ok.body, /2026-06-08/);
});
