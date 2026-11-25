import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createServer } from 'node:http';
import { openDb } from '../src/db.mjs';
import { createApp } from '../src/app.mjs';
import { hashPassword } from '../src/auth.mjs';

const T0 = Date.parse('2026-06-15T05:00:00Z');
const PW = 'mat-khau-dai-10';
const NEW = 'mat-khau-moi-12345';

test('quên mật khẩu: mã một lần, hết hạn sau 30 phút, đặt lại xong thì mọi phiên bị đăng xuất', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'reset-test-'));
  let clock = T0;
  const db = openDb(join(dir, 'x.db'));
  const iso = new Date(T0).toISOString();
  const uid = db.prepare('INSERT INTO users (email, username, name, password_hash, role, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run('hoc-vien@vidu.vn', 'hoc_vien', 'Học viên', hashPassword(PW), 'user', 'active', iso).lastInsertRowid;
  const server = createServer(createApp({ db, now: () => clock, paymentSecret: 'bi-mat-thanh-toan-16+', backupDir: join(dir, 'bk'), cryptoKey: Buffer.alloc(32, 1), allowedOrigins: [] }));
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const B = `http://127.0.0.1:${server.address().port}`;
  const post = (path, data, headers = {}) => fetch(B + path, { method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body: JSON.stringify(data) });
  try {
    // Email lạ vẫn trả 200 giống hệt, không tạo mã
    assert.equal((await post('/api/auth/forgot', { email: 'khong-co@vidu.vn' })).status, 200);
    assert.equal(db.prepare('SELECT COUNT(*) n FROM password_resets').get().n, 0);

    // Email có thật: tạo mã và xếp thư vào hàng đợi (mã không lưu dạng rõ)
    assert.equal((await post('/api/auth/forgot', { email: 'hoc-vien@vidu.vn' })).status, 200);
    assert.equal(db.prepare('SELECT COUNT(*) n FROM password_resets').get().n, 1);
    const mail = db.prepare('SELECT body FROM email_queue ORDER BY id DESC LIMIT 1').get();
    const code = /mã đặt lại mật khẩu của bạn là (\S+)\./.exec(mail.body)[1];
    assert.ok(code.length >= 20);
    assert.equal(db.prepare('SELECT token_hash FROM password_resets').get().token_hash === code, false, 'không lưu mã dạng rõ');

    // Mã sai bị từ chối
    assert.equal((await post('/api/auth/reset', { token: 'sai', password: NEW })).status, 400);

    // Có một phiên đăng nhập đang mở trước khi đặt lại
    const login = await post('/api/auth/login', { identifier: 'hoc-vien@vidu.vn', password: PW });
    assert.equal(login.status, 200);
    const cookie = login.headers.get('set-cookie').split(';')[0];
    assert.equal((await fetch(B + '/api/me', { headers: { cookie } })).status, 200);

    // Đặt lại đúng mã
    const ok = await post('/api/auth/reset', { token: code, password: NEW });
    assert.equal(ok.status, 200);
    assert.equal((await fetch(B + '/api/me', { headers: { cookie } })).status, 401, 'phiên cũ phải bị thu hồi');
    assert.equal((await post('/api/auth/login', { identifier: 'hoc-vien@vidu.vn', password: PW })).status, 401, 'mật khẩu cũ không dùng được nữa');
    assert.equal((await post('/api/auth/login', { identifier: 'hoc-vien@vidu.vn', password: NEW })).status, 200);

    // Mã đã dùng không dùng lại được
    assert.equal((await post('/api/auth/reset', { token: code, password: 'mat-khau-khac-99' })).status, 400);

    // Mã hết hạn sau 30 phút
    await post('/api/auth/forgot', { email: 'hoc-vien@vidu.vn' });
    const mail2 = db.prepare('SELECT body FROM email_queue ORDER BY id DESC LIMIT 1').get();
    const code2 = /mã đặt lại mật khẩu của bạn là (\S+)\./.exec(mail2.body)[1];
    clock += 31 * 60 * 1000;
    assert.equal((await post('/api/auth/reset', { token: code2, password: 'mat-khau-khac-99' })).status, 400, 'mã quá 30 phút');
    assert.equal(db.prepare('SELECT COUNT(*) n FROM password_resets WHERE user_id = ?').get(uid).n, 2);
  } finally {
    server.close();
    db.close?.();
    rmSync(dir, { recursive: true, force: true });
  }
});

test('quên mật khẩu bị giới hạn: quá 3 yêu cầu cho một email trong 15 phút thì trả 429', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'reset-rl-'));
  const db = openDb(join(dir, 'x.db'));
  db.prepare('INSERT INTO users (email, username, name, password_hash, role, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run('hoc-vien@vidu.vn', 'hoc_vien', 'Học viên', hashPassword(PW), 'user', 'active', new Date(T0).toISOString());
  const server = createServer(createApp({ db, now: () => T0, paymentSecret: 'bi-mat-thanh-toan-16+', backupDir: join(dir, 'bk'), cryptoKey: Buffer.alloc(32, 1), allowedOrigins: [] }));
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const B = `http://127.0.0.1:${server.address().port}`;
  try {
    const statuses = [];
    for (let i = 0; i < 4; i++) statuses.push((await fetch(B + '/api/auth/forgot', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: 'hoc-vien@vidu.vn' }) })).status);
    assert.deepEqual(statuses, [200, 200, 200, 429]);
  } finally {
    server.close();
    db.close?.();
    rmSync(dir, { recursive: true, force: true });
  }
});
