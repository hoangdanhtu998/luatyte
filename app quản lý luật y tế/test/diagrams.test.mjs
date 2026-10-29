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

test('sơ đồ: chỉ quản trị viên đã xác thực TOTP mới xem được', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'diagrams-test-'));
  const db = openDb(join(dir, 'x.db'));
  const iso = new Date(T0).toISOString();
  const add = (email, username, role, totp) => db.prepare('INSERT INTO users (email, username, name, password_hash, role, status, totp_enabled, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .run(email, username, 'Tài khoản thử', hashPassword(PW), role, 'active', totp, iso);
  add('admin@vidu.vn', null, 'admin', 1);
  add('hoc-vien@vidu.vn', 'hoc_vien', 'user', 0);

  const server = createServer(createApp({ db, now: () => T0, paymentSecret: 'bi-mat-thanh-toan-16+', backupDir: join(dir, 'bk'), cryptoKey: Buffer.alloc(32, 1), allowedOrigins: [] }));
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const B = `http://127.0.0.1:${server.address().port}`;
  try {
    const login = async identifier => {
      const r = await fetch(B + '/api/auth/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ identifier, password: PW }) });
      return r.headers.get('set-cookie').split(';')[0];
    };

    // Chưa đăng nhập
    assert.equal((await fetch(B + '/api/admin/diagrams')).status, 401);
    assert.equal((await fetch(B + '/api/admin/diagrams/1-tai-khoan.html')).status, 401);

    // Học viên thường: bị từ chối
    const userCookie = await login('hoc_vien');
    assert.equal((await fetch(B + '/api/admin/diagrams', { headers: { cookie: userCookie } })).status, 403);
    assert.equal((await fetch(B + '/api/admin/diagrams/1-tai-khoan.html', { headers: { cookie: userCookie } })).status, 403);

    // Quản trị viên chưa xác thực TOTP: bị chặn
    const adminCookie = await login('admin@vidu.vn');
    assert.equal((await fetch(B + '/api/admin/diagrams', { headers: { cookie: adminCookie } })).status, 403);
    db.prepare('UPDATE sessions SET mfa_ok = 1').run();

    // Quản trị viên đã xác thực: xem được danh sách và từng sơ đồ
    const list = await (await fetch(B + '/api/admin/diagrams', { headers: { cookie: adminCookie } })).json();
    assert.equal(list.items.length, 4);
    assert.ok(list.items.every(d => /^\d-[\w-]+\.html$/.test(d.file)));

    const page = await fetch(B + '/api/admin/diagrams/3-ca-truc.html', { headers: { cookie: adminCookie } });
    assert.equal(page.status, 200);
    assert.match(page.headers.get('content-type'), /text\/html/);
    assert.match(page.headers.get('content-security-policy'), /default-src 'none'/);
    assert.match(await page.text(), /<html/i);

    // Tên file lạ hoặc ngoài danh sách: không lộ file
    assert.equal((await fetch(B + '/api/admin/diagrams/khong-co.html', { headers: { cookie: adminCookie } })).status, 404);
    assert.equal((await fetch(B + '/api/admin/diagrams/..%2Fx.html', { headers: { cookie: adminCookie } })).status, 404);

    // Lần xem được ghi nhật ký
    const logged = db.prepare("SELECT COUNT(*) AS n FROM audit_logs WHERE action = 'VIEW' AND entity = 'Diagram'").get();
    assert.ok(logged.n >= 1);
  } finally {
    server.close();
    db.close?.();
    rmSync(dir, { recursive: true, force: true });
  }
});
