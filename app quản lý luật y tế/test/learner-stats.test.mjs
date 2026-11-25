import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createServer } from 'node:http';
import { openDb } from '../src/db.mjs';
import { createApp } from '../src/app.mjs';
import { hashPassword } from '../src/auth.mjs';
import { learnerStats } from '../src/learner-stats.mjs';

// Mục 41: thống kê học viên gộp, không lộ danh tính, chỉ quản trị viên đã xác thực TOTP xem được.
const T0 = Date.parse('2026-06-15T05:00:00Z');
const PW = 'mat-khau-dai-10';

test('learnerStats: đếm đúng học viên, câu đã thuộc, câu sai; bỏ qua tài khoản bị khóa và quản trị viên', () => {
  const dir = mkdtempSync(join(tmpdir(), 'learner-stats-'));
  const db = openDb(join(dir, 'x.db'));
  const iso = new Date(T0).toISOString();
  const add = (email, role, status) => db.prepare('INSERT INTO users (email, username, name, password_hash, role, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(email, email.split('@')[0], 'Thử', hashPassword(PW), role, status, iso).lastInsertRowid;
  const a = add('a@vidu.vn', 'user', 'active');
  const b = add('b@vidu.vn', 'user', 'active');
  const locked = add('c@vidu.vn', 'user', 'locked');
  add('admin@vidu.vn', 'admin', 'active');
  const snap = (qstat) => JSON.stringify({ lyt_qstat: JSON.stringify(qstat) });
  db.prepare('INSERT INTO user_progress (user_id, data, updated_at) VALUES (?, ?, ?)').run(a, snap({ 'Câu 1': { s: 5, w: 0 }, 'Câu 2': { s: 0, w: 2 } }), T0);
  db.prepare('INSERT INTO user_progress (user_id, data, updated_at) VALUES (?, ?, ?)').run(b, snap({ 'Câu 2': { s: 1, w: 1 } }), T0 - 30 * 24 * 3600 * 1000);
  db.prepare('INSERT INTO user_progress (user_id, data, updated_at) VALUES (?, ?, ?)').run(locked, snap({ 'Câu 3': { s: 5, w: 9 } }), T0);

  const stats = learnerStats(db, T0);
  assert.equal(stats.learners, 2, 'chỉ đếm học viên đang hoạt động');
  assert.equal(stats.withProgress, 2);
  assert.equal(stats.activeLast7Days, 1, 'chỉ người đồng bộ trong 7 ngày');
  assert.equal(stats.questionsMastered, 1);
  assert.equal(stats.questionsWrong, 2);
  assert.deepEqual(stats.topWrong[0], { question: 'Câu 2', learners: 2 });
  assert.ok(!stats.topWrong.some(item => item.question === 'Câu 3'), 'tài khoản bị khóa không được tính');
  assert.ok(!JSON.stringify(stats).includes('@'), 'không lộ email');
  db.close?.();
  rmSync(dir, { recursive: true, force: true });
});

test('API thống kê học viên: chỉ quản trị viên đã xác thực TOTP', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'learner-api-'));
  const db = openDb(join(dir, 'x.db'));
  const iso = new Date(T0).toISOString();
  const add = (email, role, totp) => db.prepare('INSERT INTO users (email, username, name, password_hash, role, status, totp_enabled, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .run(email, email.split('@')[0], 'Thử', hashPassword(PW), role, 'active', totp, iso);
  add('admin@vidu.vn', 'admin', 1);
  add('hoc-vien@vidu.vn', 'user', 0);
  const server = createServer(createApp({ db, now: () => T0, paymentSecret: 'bi-mat-thanh-toan-16+', backupDir: join(dir, 'bk'), cryptoKey: Buffer.alloc(32, 1), allowedOrigins: [] }));
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const B = `http://127.0.0.1:${server.address().port}`;
  try {
    const login = async identifier => (await fetch(B + '/api/auth/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ identifier, password: PW }) })).headers.get('set-cookie').split(';')[0];
    assert.equal((await fetch(B + '/api/admin/stats/learners')).status, 401);
    const userCookie = await login('hoc-vien@vidu.vn');
    assert.equal((await fetch(B + '/api/admin/stats/learners', { headers: { cookie: userCookie } })).status, 403);
    const adminCookie = await login('admin@vidu.vn');
    assert.equal((await fetch(B + '/api/admin/stats/learners', { headers: { cookie: adminCookie } })).status, 403, 'chưa xác thực TOTP thì bị chặn');
    db.prepare('UPDATE sessions SET mfa_ok = 1').run();
    const res = await fetch(B + '/api/admin/stats/learners', { headers: { cookie: adminCookie } });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.learners, 1);
    assert.deepEqual(body.topWrong, []);
  } finally {
    server.close();
    db.close?.();
    rmSync(dir, { recursive: true, force: true });
  }
});
