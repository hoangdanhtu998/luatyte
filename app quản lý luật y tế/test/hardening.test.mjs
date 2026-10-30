import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { openDb } from '../src/db.mjs';
import { createApp } from '../src/app.mjs';
import { checkConfig } from '../src/config-check.mjs';

async function start() {
  const db = openDb(':memory:');
  const server = createServer(createApp({ db, allowRegistration: true }));
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  return { base: `http://127.0.0.1:${server.address().port}`, close: () => new Promise(r => server.close(r)) };
}

test('health: trả 200, không cần đăng nhập, không lộ thông tin nhạy cảm', async () => {
  const { base, close } = await start();
  try {
    const res = await fetch(`${base}/api/health`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.ok, true);
    assert.equal(body.db, 'ok');
    assert.equal(typeof body.uptimeSec, 'number');
    assert.equal('users' in body, false);
    assert.equal(res.headers.get('cache-control'), 'no-store');
  } finally { await close(); }
});

test('header bảo mật có mặt trên API và trang tĩnh', async () => {
  const { base, close } = await start();
  try {
    for (const path of ['/api/health', '/']) {
      const res = await fetch(`${base}${path}`);
      assert.equal(res.headers.get('x-content-type-options'), 'nosniff', path);
      assert.equal(res.headers.get('x-frame-options'), 'DENY', path);
      assert.equal(res.headers.get('referrer-policy'), 'no-referrer', path);
      assert.ok(res.headers.get('permissions-policy'), path);
    }
  } finally { await close(); }
});

test('cấu hình: không có SETTINGS_KEY ở dev chỉ cảnh báo, ở production là lỗi', () => {
  const dev = checkConfig({});
  assert.deepEqual(dev.errors, []);
  assert.ok(dev.warnings.some(w => w.includes('SETTINGS_KEY')));

  const prod = checkConfig({ NODE_ENV: 'production' });
  assert.ok(prod.errors.some(e => e.includes('SETTINGS_KEY')));
});

test('cấu hình: SETTINGS_KEY sai định dạng là lỗi và thông báo không in giá trị khóa', () => {
  const bad = 'khoa-sai-dinh-dang-XYZ';
  const r = checkConfig({ SETTINGS_KEY: bad });
  assert.ok(r.errors.length >= 1);
  assert.ok(r.errors.every(e => !e.includes(bad)));
});

test('cấu hình: SETTINGS_KEY đúng 64 hex và PAYMENT_SECRET đủ dài thì không lỗi', () => {
  const r = checkConfig({ NODE_ENV: 'production', SETTINGS_KEY: 'a'.repeat(64), PAYMENT_SECRET: 'bi-mat-thanh-toan-16+', ALLOW_REGISTRATION: 'false', TRUST_PROXY: 'true' });
  assert.deepEqual(r.errors, []);
  assert.deepEqual(r.warnings, []);
});

test('cấu hình: PAYMENT_SECRET ngắn là lỗi', () => {
  const r = checkConfig({ PAYMENT_SECRET: 'ngan' });
  assert.ok(r.errors.some(e => e.includes('PAYMENT_SECRET')));
});
