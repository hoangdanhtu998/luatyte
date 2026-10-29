import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createServer } from 'node:http';
import { openDb } from '../src/db.mjs';
import { createApp } from '../src/app.mjs';
import { hashPassword } from '../src/auth.mjs';
import * as P from '../src/phase567.mjs';
import { createPlan } from '../src/billing.mjs';

const DAY = 24 * 60 * 60 * 1000;
const T0 = Date.parse('2026-06-15T12:00:00Z');
const PW = 'mat-khau-dai-10';

function tmpDir() { return mkdtempSync(join(tmpdir(), 'qlyt-test-')); }

function ensureUser(db, id) {
  if (!db.prepare('SELECT id FROM users WHERE id = ?').get(id)) {
    db.prepare('INSERT INTO users (id, email, password_hash, role, status, created_at) VALUES (?, ?, ?, ?, ?, ?)').run(id, `u${id}@vidu.vn`, 'x', 'user', 'active', new Date(T0).toISOString());
  }
}

function addPaidOrder(db, { userId, planId, amount, at }) {
  ensureUser(db, userId);
  db.prepare("INSERT INTO orders (user_id, plan_id, gateway, amount, final_amount, status, created_at, paid_at) VALUES (?, ?, 'sandbox', ?, ?, 'paid', ?, ?)")
    .run(userId, planId, amount, amount, new Date(at).toISOString(), new Date(at).toISOString());
}

test('tổng quan: đếm user, doanh thu hôm nay và tháng', () => {
  const db = openDb(':memory:');
  const plan = createPlan(db, { name: 'Gói', durationDays: 7, price: 50000 }, T0);
  db.prepare('INSERT INTO users (email, password_hash, role, status, created_at) VALUES (?, ?, ?, ?, ?)').run('a@vidu.vn', 'x', 'user', 'active', new Date(T0).toISOString());
  db.prepare('INSERT INTO users (email, password_hash, role, status, created_at) VALUES (?, ?, ?, ?, ?)').run('b@vidu.vn', 'x', 'user', 'locked', new Date(T0 - 10 * DAY).toISOString());
  addPaidOrder(db, { userId: 1, planId: plan.id, amount: 40000, at: T0 });
  addPaidOrder(db, { userId: 1, planId: plan.id, amount: 60000, at: T0 - 20 * DAY });
  const o = P.overview(db, T0);
  assert.equal(o.users.total, 2);
  assert.equal(o.users.active, 1);
  assert.equal(o.users.newToday, 1);
  assert.equal(o.revenue.today, 40000);
  assert.equal(o.revenue.currency, 'VND');
});

test('cảnh báo lỗi: hơn 5 lỗi trong 5 phút thì tạo cảnh báo; không tạo trùng; xử lý được', () => {
  const db = openDb(':memory:');
  for (let i = 0; i < 6; i++) P.recordError(db, { path: '/api/x', message: 'boom ' + i, now: T0 + i * 1000 });
  const open = P.listAlerts(db);
  assert.equal(open.length, 1);
  assert.equal(open[0].type, 'SERVER_ERROR');
  assert.equal(open[0].severity, 'critical');
  P.recordError(db, { path: '/api/x', message: 'boom 7', now: T0 + 7000 });
  assert.equal(P.listAlerts(db).length, 1, 'không tạo cảnh báo trùng khi đã có cảnh báo đang mở');
  P.resolveAlert(db, open[0].id, T0 + 8000);
  assert.equal(P.listAlerts(db).length, 0);
});

test('sao lưu: tạo bản sao được, chỉ giữ 7 bản mới nhất', () => {
  const db = openDb(':memory:');
  db.prepare('INSERT INTO settings (key, value, is_secret, updated_at) VALUES (?, ?, 0, ?)').run('k', '"v"', new Date(T0).toISOString());
  const dir = tmpDir();
  try {
    for (let i = 0; i < 9; i++) P.createBackup(db, dir, T0 + i * DAY);
    const files = readdirSync(dir).filter(n => n.endsWith('.db'));
    assert.equal(files.length, 7, 'phải giữ đúng 7 bản');
    assert.equal(P.listBackups(dir).length, 7);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('nội dung luật: sửa nội dung thì bỏ đánh dấu đã đối chiếu, đánh dấu lại được', () => {
  const db = openDb(':memory:');
  const cat = P.createCategory(db, { name: 'Khám chữa bệnh' });
  const art = P.createArticle(db, { categoryId: cat.id, number: '38', title: 'Điều 38', content: 'Nội dung gốc' }, T0);
  assert.equal(art.isVerified, false);
  const ver = P.updateArticle(db, art.id, { isVerified: true }, T0);
  assert.equal(ver.isVerified, true);
  assert.equal(ver.verifiedAt, T0);
  const edited = P.updateArticle(db, art.id, { content: 'Nội dung đã sửa' }, T0 + DAY);
  assert.equal(edited.isVerified, false, 'sửa nội dung thì phải đối chiếu lại');
  const exp = P.exportLawContent(db);
  assert.equal(exp.articles.length, 1);
  assert.equal(exp.categories.length, 1);
});

test('trang pháp lý: lưu và đọc được; trang không tồn tại báo lỗi', () => {
  const db = openDb(':memory:');
  P.setLegal(db, 'terms', 'Điều khoản sử dụng (chờ luật sư duyệt)', T0);
  assert.equal(P.getLegal(db, 'terms').text, 'Điều khoản sử dụng (chờ luật sư duyệt)');
  assert.equal(P.getLegal(db, 'privacy').text, '');
  assert.throws(() => P.getLegal(db, 'khac'), /Không có trang này/);
});

test('xuất và xóa dữ liệu cá nhân: xuất đủ dữ liệu, xóa thì ẩn danh và giữ đơn hàng', async () => {
  const db = openDb(':memory:');
  let t = T0;
  const clk = () => t;
  const server = createServer(createApp({ db, now: clk, paymentSecret: 'bi-mat-thanh-toan-16+' }));
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const uid = Number(db.prepare('INSERT INTO users (email, name, password_hash, role, status, created_at) VALUES (?, ?, ?, ?, ?, ?)').run('nguoi@vidu.vn', 'Nguyễn Văn A', hashPassword(PW), 'user', 'active', new Date(t).toISOString()).lastInsertRowid);
    const plan = createPlan(db, { name: 'Gói', durationDays: 7, price: 50000 }, t);
    addPaidOrder(db, { userId: uid, planId: plan.id, amount: 50000, at: t });
    const login = await fetch(base + '/api/auth/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: 'nguoi@vidu.vn', password: PW }) });
    const cookie = login.headers.get('set-cookie').split(';')[0];
    const exp = await fetch(base + '/api/me/export', { headers: { cookie } });
    const data = await exp.json();
    assert.equal(data.profile.email, 'nguoi@vidu.vn');
    assert.equal(data.orders.length, 1);
    assert.ok(exp.headers.get('content-disposition').includes('attachment'));

    const meRes = await fetch(base + '/api/me', { headers: { cookie } });
    const csrf = (await meRes.json()).csrfToken;
    const del = await fetch(base + '/api/me/data', { method: 'DELETE', headers: { cookie, 'x-csrf-token': csrf } });
    assert.equal(del.status, 200);
    const row = db.prepare('SELECT email, name, password_hash, status FROM users WHERE id = ?').get(uid);
    assert.ok(row.email.endsWith('@anonymized.local'));
    assert.equal(row.name, '');
    assert.equal(row.status, 'locked');
    assert.equal(db.prepare('SELECT COUNT(*) n FROM orders WHERE user_id = ?').get(uid).n, 1, 'đơn hàng vẫn giữ cho kế toán');
    const again = await fetch(base + '/api/auth/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: 'nguoi@vidu.vn', password: PW }) });
    assert.equal(again.status, 401, 'email cũ không đăng nhập được nữa');
  } finally { await new Promise(r => server.close(r)); }
});

test('báo cáo doanh thu theo ngày và theo gói; chi phí chia đều theo ngày; lợi nhuận đúng', () => {
  const db = openDb(':memory:');
  const plan = createPlan(db, { name: '7 ngày', durationDays: 7, price: 50000 }, T0);
  addPaidOrder(db, { userId: 1, planId: plan.id, amount: 50000, at: T0 });
  addPaidOrder(db, { userId: 1, planId: plan.id, amount: 30000, at: T0 - DAY });
  const from = T0 - 2 * DAY, to = T0 + DAY;
  const rev = P.revenueReport(db, { from, to, groupBy: 'day' });
  assert.equal(rev.totalRevenue, 80000);
  assert.equal(rev.byPlan[0].revenue, 80000);
  assert.equal(rev.byPeriod.length, 2);

  // Chi phí 30.000 cho 10 ngày, nằm trọn trong khoảng báo cáo: chia 3.000/ngày, 3 ngày trong báo cáo = 9.000
  P.createCost(db, { name: 'Hosting', type: 'fixed', amount: 30000, periodStart: new Date(T0 - 5 * DAY).toISOString(), periodEnd: new Date(T0 + 5 * DAY).toISOString() });
  const profit = P.profitReport(db, { from, to });
  assert.equal(profit.revenue, 80000);
  assert.equal(profit.costs, 9000);
  assert.equal(profit.profit, 71000);
});

test('cảnh báo lỗ 30 ngày liên tiếp: có chi phí mà không có doanh thu thì bật cảnh báo', () => {
  const db = openDb(':memory:');
  P.createCost(db, { name: 'Máy chủ', type: 'fixed', amount: 300000, periodStart: new Date(T0 - 60 * DAY).toISOString(), periodEnd: new Date(T0 + 60 * DAY).toISOString() });
  assert.equal(P.lossWarning(db, T0), true);
  const plan = createPlan(db, { name: 'Gói', durationDays: 7, price: 500000 }, T0);
  for (let i = 0; i < 30; i++) addPaidOrder(db, { userId: 1, planId: plan.id, amount: 500000, at: T0 - i * DAY + 1000 });
  assert.equal(P.lossWarning(db, T0), false);
});

test('chi phí AI: ghi nhận và quy đổi sang VND theo tỷ giá', () => {
  const db = openDb(':memory:');
  P.logAiUsage(db, { feature: 'skill-suggestion', tokens: 1000, costUsd: 0.5, now: T0 });
  P.logAiUsage(db, { feature: 'question-generation', tokens: 2000, costUsd: 0.25, now: T0 });
  const r = P.aiCostReport(db, { from: T0 - DAY, to: T0 + DAY, fxVndPerUsd: 26000 });
  assert.equal(r.totalUsd, 0.75);
  assert.equal(r.totalVnd, 19500);
  assert.throws(() => P.logAiUsage(db, { feature: 'x', tokens: -1, costUsd: 1, now: T0 }), /không hợp lệ/);
});
