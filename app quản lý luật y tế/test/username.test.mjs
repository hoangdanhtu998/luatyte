import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createServer } from 'node:http';
import { openDb } from '../src/db.mjs';
import { createApp } from '../src/app.mjs';

const PW = 'mat-khau-dai-10';

async function post(B, path, body, cookie) {
  const headers = { 'content-type': 'application/json' };
  if (cookie) headers.cookie = cookie;
  return fetch(B + path, { method: 'POST', headers, body: JSON.stringify(body) });
}

test('đăng ký bằng tên đăng nhập; đăng nhập được bằng email hoặc tên đăng nhập', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'username-test-'));
  const db = openDb(join(dir, 'x.db'));
  const server = createServer(createApp({ db, now: () => Date.now(), paymentSecret: 'bi-mat-thanh-toan-16+', backupDir: join(dir, 'bk'), cryptoKey: Buffer.alloc(32, 1), allowedOrigins: [] }));
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const B = `http://127.0.0.1:${server.address().port}`;
  try {
    const reg = await post(B, '/api/auth/register', { email: 'hoc@vidu.vn', username: 'hoc_vien.01', password: PW, acceptTerms: true });
    assert.equal(reg.status, 201);

    // Đăng nhập bằng tên đăng nhập
    const byName = await post(B, '/api/auth/login', { identifier: 'hoc_vien.01', password: PW });
    assert.equal(byName.status, 200);

    // Đăng nhập bằng email (trường email vẫn dùng được)
    const byEmail = await post(B, '/api/auth/login', { email: 'hoc@vidu.vn', password: PW });
    assert.equal(byEmail.status, 200);

    // Tên đăng nhập không phân biệt hoa thường
    const upper = await post(B, '/api/auth/login', { identifier: 'HOC_VIEN.01', password: PW });
    assert.equal(upper.status, 200);

    // Sai mật khẩu thì không đăng nhập được
    assert.equal((await post(B, '/api/auth/login', { identifier: 'hoc_vien.01', password: 'sai-mat-khau-xyz' })).status, 401);
  } finally {
    await new Promise(r => server.close(r));
    db.close();
    rmSync(dir, { recursive: true, force: true });
  }
});

test('tên đăng nhập: không trùng (kể cả khác hoa thường), đúng định dạng', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'username-test-'));
  const db = openDb(join(dir, 'x.db'));
  const server = createServer(createApp({ db, now: () => Date.now(), paymentSecret: 'bi-mat-thanh-toan-16+', backupDir: join(dir, 'bk'), cryptoKey: Buffer.alloc(32, 1), allowedOrigins: [] }));
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const B = `http://127.0.0.1:${server.address().port}`;
  try {
    assert.equal((await post(B, '/api/auth/register', { email: 'a@vidu.vn', username: 'nguyen_an', password: PW, acceptTerms: true })).status, 201);
    const taken = await post(B, '/api/auth/register', { email: 'b@vidu.vn', username: 'NGUYEN_AN', password: PW, acceptTerms: true });
    assert.equal(taken.status, 409);
    assert.equal((await taken.json()).error.code, 'USERNAME_TAKEN');
    for (const bad of ['ab', 'có dấu', 'x'.repeat(31), 'bad name', '']) {
      const r = await post(B, '/api/auth/register', { email: `c${Math.random().toString(36).slice(2)}@vidu.vn`, username: bad, password: PW, acceptTerms: true });
      assert.equal(r.status, 400, `tên "${bad}" phải bị từ chối`);
    }
  } finally {
    await new Promise(r => server.close(r));
    db.close();
    rmSync(dir, { recursive: true, force: true });
  }
});
