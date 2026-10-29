import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { openDb } from '../src/db.mjs';
import { createApp } from '../src/app.mjs';

const PW = 'mat-khau-dai-10';

async function start() {
  const db = openDb(':memory:');
  const server = createServer(createApp({ db }));
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  return { db, base: `http://127.0.0.1:${server.address().port}`, close: () => new Promise(r => server.close(r)) };
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
  return { status: r.status, data, cookie: token && token[1] ? `lyt_session=${token[1]}` : null };
}

async function loginUser(base, email = 'u1@vidu.vn', username = 'nguoi1') {
  await call(base, 'POST', '/api/auth/register', { body: { email, username, password: PW, acceptTerms: true } });
  return call(base, 'POST', '/api/auth/login', { body: { email, password: PW } });
}

test('tiến độ: cần đăng nhập, lưu và đọc lại đúng dữ liệu', async () => {
  const { base, close } = await start();
  try {
    const anon = await call(base, 'GET', '/api/progress');
    assert.equal(anon.status, 401);

    const s = await loginUser(base);
    const data = { lyt_qstat: '{"câu 1":{"s":2,"w":0}}', lyt_exams: '[]' };
    const put = await call(base, 'PUT', '/api/progress', { body: { data }, cookie: s.cookie, csrf: s.data.csrfToken });
    assert.equal(put.status, 200);
    assert.ok(put.data.updatedAt > 0);

    const get = await call(base, 'GET', '/api/progress', { cookie: s.cookie });
    assert.equal(get.status, 200);
    assert.deepEqual(get.data.data, data);
    assert.equal(get.data.updatedAt, put.data.updatedAt);
  } finally { await close(); }
});

test('tiến độ: thiếu CSRF bị chặn, dữ liệu sai bị từ chối', async () => {
  const { base, close } = await start();
  try {
    const s = await loginUser(base);
    const noCsrf = await call(base, 'PUT', '/api/progress', { body: { data: { lyt_a: '1' } }, cookie: s.cookie });
    assert.equal(noCsrf.status, 403);

    const notObject = await call(base, 'PUT', '/api/progress', { body: { data: [] }, cookie: s.cookie, csrf: s.data.csrfToken });
    assert.equal(notObject.status, 400);
    assert.equal(notObject.data.error.code, 'INVALID_DATA');

    const badKey = await call(base, 'PUT', '/api/progress', { body: { data: { 'evil-key': '1' } }, cookie: s.cookie, csrf: s.data.csrfToken });
    assert.equal(badKey.status, 400);
    assert.equal(badKey.data.error.code, 'INVALID_KEY');

    const notString = await call(base, 'PUT', '/api/progress', { body: { data: { lyt_a: 1 } }, cookie: s.cookie, csrf: s.data.csrfToken });
    assert.equal(notString.status, 400);
    assert.equal(notString.data.error.code, 'INVALID_VALUE');
  } finally { await close(); }
});

test('tiến độ: mỗi tài khoản chỉ thấy dữ liệu của mình', async () => {
  const { base, close } = await start();
  try {
    const a = await loginUser(base, 'a@vidu.vn', 'nguoiA');
    const b = await loginUser(base, 'b@vidu.vn', 'nguoiB');

    await call(base, 'PUT', '/api/progress', { body: { data: { lyt_qstat: '{"a":1}' } }, cookie: a.cookie, csrf: a.data.csrfToken });
    const gotB = await call(base, 'GET', '/api/progress', { cookie: b.cookie });
    assert.equal(gotB.status, 200);
    assert.equal(gotB.data.data, null);

    await call(base, 'PUT', '/api/progress', { body: { data: { lyt_qstat: '{"b":2}' } }, cookie: b.cookie, csrf: b.data.csrfToken });
    const gotA = await call(base, 'GET', '/api/progress', { cookie: a.cookie });
    assert.deepEqual(gotA.data.data, { lyt_qstat: '{"a":1}' });
  } finally { await close(); }
});
