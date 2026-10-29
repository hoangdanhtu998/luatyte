import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createServer } from 'node:http';
import { openDb } from '../src/db.mjs';
import { createApp } from '../src/app.mjs';
import { hashPassword } from '../src/auth.mjs';
import { createPlan, grantSubscription } from '../src/billing.mjs';

const T0 = Date.parse('2026-06-15T05:00:00Z');
const PW = 'mat-khau-dai-10';

test('quản lý người dùng: danh sách có lọc, chi tiết, sửa hồ sơ, ẩn danh cần xác nhận', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'people-test-'));
  const db = openDb(join(dir, 'x.db'));
  const iso = new Date(T0).toISOString();
  const add = (email, username, name, role, totp) => db.prepare('INSERT INTO users (email, username, name, password_hash, role, status, totp_enabled, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .run(email, username, name, hashPassword(PW), role, 'active', totp, iso).lastInsertRowid;
  const admin = Number(add('admin@vidu.vn', null, 'Quản trị', 'admin', 1));
  const an = Number(add('an@vidu.vn', 'nguyen_an', 'Nguyễn An', 'user', 0));
  const binh = Number(add('binh@vidu.vn', 'binh_le', 'Lê Bình', 'user', 0));
  const week = createPlan(db, { name: 'Gói 7 ngày', durationDays: 7, price: 50000, features: {} }, T0);
  grantSubscription(db, an, week.id, T0);
  db.prepare('INSERT INTO login_logs (user_id, email, ip, user_agent, success, failed_reason, logged_at) VALUES (?, ?, ?, ?, 1, NULL, ?)').run(an, 'an@vidu.vn', '203.0.113.5', 'test', T0);
  db.prepare('INSERT INTO consents (user_id, type, version, agreed_at, ip) VALUES (?, ?, ?, ?, ?)').run(an, 'terms', '2026-10-27', iso, '203.0.113.5');

  const server = createServer(createApp({ db, now: () => T0, paymentSecret: 'bi-mat-thanh-toan-16+', backupDir: join(dir, 'bk'), cryptoKey: Buffer.alloc(32, 1), allowedOrigins: [] }));
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const B = `http://127.0.0.1:${server.address().port}`;
  try {
    const login = await fetch(B + '/api/auth/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ identifier: 'admin@vidu.vn', password: PW }) });
    const cookie = login.headers.get('set-cookie').split(';')[0];
    db.prepare('UPDATE sessions SET mfa_ok = 1').run();
    const csrf = (await (await fetch(B + '/api/me', { headers: { cookie } })).json()).csrfToken;
    const H = { cookie, 'x-csrf-token': csrf, 'content-type': 'application/json' };
    const get = async p => (await fetch(B + p, { headers: { cookie } })).json();

    // Danh sách và bộ lọc
    const all = await get('/api/admin/people');
    assert.equal(all.total, 3);
    const byQ = await get('/api/admin/people?q=nguyen');
    assert.equal(byQ.total, 1);
    assert.equal(byQ.items[0].username, 'nguyen_an');
    assert.equal(byQ.items[0].plan.name, 'Gói 7 ngày');
    assert.equal(byQ.items[0].lastIp, '203.0.113.5');
    assert.equal(byQ.items[0].registerIp, '203.0.113.5');
    const paid = await get('/api/admin/people?plan=paid');
    assert.deepEqual(paid.items.map(i => i.id), [an]);
    const free = await get('/api/admin/people?plan=free&role=user');
    assert.deepEqual(free.items.map(i => i.id), [binh]);

    // Chi tiết
    const detail = await get(`/api/admin/people/${an}`);
    assert.equal(detail.person.email, 'an@vidu.vn');
    assert.equal(detail.subscriptions.length, 1);
    assert.equal(detail.logins.length, 1);
    assert.equal(detail.consents[0].type, 'terms');

    // Sửa hồ sơ: trùng tên đăng nhập bị chặn, đổi được tên hợp lệ
    const dup = await fetch(B + `/api/admin/people/${binh}`, { method: 'PUT', headers: H, body: JSON.stringify({ username: 'NGUYEN_AN' }) });
    assert.equal(dup.status, 409);
    const ok = await fetch(B + `/api/admin/people/${an}`, { method: 'PUT', headers: H, body: JSON.stringify({ name: 'Nguyễn Văn An', username: 'an_nguyen' }) });
    assert.equal(ok.status, 200);
    assert.equal((await ok.json()).person.username, 'an_nguyen');
    assert.equal((await fetch(B + `/api/admin/people/${an}`, { method: 'PUT', headers: H, body: JSON.stringify({ email: 'khong-hop-le' }) })).status, 400);

    // Ẩn danh: bắt buộc gõ XOA
    assert.equal((await fetch(B + `/api/admin/people/${binh}/anonymize`, { method: 'POST', headers: H, body: JSON.stringify({}) })).status, 400);
    const anon = await fetch(B + `/api/admin/people/${binh}/anonymize`, { method: 'POST', headers: H, body: JSON.stringify({ confirm: 'XOA' }) });
    assert.equal(anon.status, 200);
    assert.ok(db.prepare('SELECT email FROM users WHERE id = ?').get(binh).email.endsWith('@anonymized.local'));

    // Không tồn tại
    assert.equal((await fetch(B + '/api/admin/people/99999', { headers: { cookie } })).status, 404);
  } finally {
    await new Promise(r => server.close(r));
    db.close();
    rmSync(dir, { recursive: true, force: true });
  }
});
