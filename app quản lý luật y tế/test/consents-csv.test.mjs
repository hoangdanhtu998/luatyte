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

test('xuất CSV lịch sử đồng ý: chỉ quản trị viên đã xác thực TOTP, có đủ cột và ghi nhật ký', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'consents-csv-'));
  const db = openDb(join(dir, 'x.db'));
  const iso = new Date(T0).toISOString();
  const add = (email, username, role, totp) => db.prepare('INSERT INTO users (email, username, name, password_hash, role, status, totp_enabled, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .run(email, username, 'Tài khoản thử', hashPassword(PW), role, 'active', totp, iso).lastInsertRowid;
  add('admin@vidu.vn', null, 'admin', 1);
  const uid = add('hoc-vien@vidu.vn', 'hoc_vien', 'user', 0);
  db.prepare('INSERT INTO consents (user_id, type, version, agreed_at, ip) VALUES (?, ?, ?, ?, ?)').run(uid, 'dieu-khoan', 'v1', iso, '10.0.0.5');

  const server = createServer(createApp({ db, now: () => T0, paymentSecret: 'bi-mat-thanh-toan-16+', backupDir: join(dir, 'bk'), cryptoKey: Buffer.alloc(32, 1), allowedOrigins: [] }));
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const B = `http://127.0.0.1:${server.address().port}`;
  try {
    const login = async identifier => (await fetch(B + '/api/auth/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ identifier, password: PW }) })).headers.get('set-cookie').split(';')[0];

    assert.equal((await fetch(B + '/api/admin/consents.csv')).status, 401);
    const adminCookie = await login('admin@vidu.vn');
    assert.equal((await fetch(B + '/api/admin/consents.csv', { headers: { cookie: adminCookie } })).status, 403, 'chưa xác thực TOTP thì bị chặn');
    db.prepare('UPDATE sessions SET mfa_ok = 1').run();

    const res = await fetch(B + '/api/admin/consents.csv', { headers: { cookie: adminCookie } });
    assert.equal(res.status, 200);
    assert.match(res.headers.get('content-type'), /text\/csv/);
    const lines = (await res.text()).replace(/^﻿/, '').trim().split(/\r?\n/);
    assert.equal(lines[0].split(',')[0].replace(/"/g, ''), 'Đồng ý lúc');
    assert.equal(lines.length, 2, 'một dòng cho một lần đồng ý');
    assert.match(lines[1], /hoc-vien@vidu\.vn/);
    assert.match(lines[1], /dieu-khoan/);
    assert.match(lines[1], /10\.0\.0\.5/);

    const audit = db.prepare("SELECT COUNT(*) n FROM audit_logs WHERE action = 'EXPORT' AND entity = 'Consent.csv'").get();
    assert.equal(audit.n, 1, 'phải ghi nhật ký xuất');
  } finally {
    server.close();
    db.close?.();
    rmSync(dir, { recursive: true, force: true });
  }
});
