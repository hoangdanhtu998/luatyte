// Test tích hợp proxy tài khoản của app học: 401, CSRF sai, snapshot 200, máy chủ tài khoản chết.
// Chạy: cd "app luật y tế" && node --test test/sync-proxy.test.mjs
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const sleep = ms => new Promise(r => setTimeout(r, ms));

let mock, study, mockPort, studyPort;
let lastPut = null;
let lastGetHeaders = null;

function json(res, code, obj, headers = {}) {
  res.writeHead(code, { 'content-type': 'application/json; charset=utf-8', ...headers });
  res.end(JSON.stringify(obj));
}

async function waitFor(url, tries = 50) {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(url);
      if (r.status) return true;
    } catch {}
    await sleep(100);
  }
  return false;
}

before(async () => {
  mock = createServer(async (req, res) => {
    let body = '';
    for await (const c of req) body += c;
    const cookie = req.headers.cookie || '';
    if (req.url === '/api/me') {
      return json(res, 200, { user: { email: 'test@vidu.com' }, csrfToken: 'csrf-ok' });
    }
    if (req.url === '/api/progress') {
      if (req.method === 'GET') {
        lastGetHeaders = req.headers;
        if (!/lyt_session=good/.test(cookie)) return json(res, 401, { error: { code: 'UNAUTHENTICATED' } });
        return json(res, 200, { data: { lyt_answers: '{"a":1}' }, updatedAt: 111 });
      }
      if (req.method === 'PUT') {
        if (!/lyt_session=good/.test(cookie)) return json(res, 401, { error: { code: 'UNAUTHENTICATED' } });
        if (req.headers['x-csrf-token'] !== 'csrf-ok') return json(res, 403, { error: { code: 'CSRF' } });
        lastPut = JSON.parse(body || '{}');
        return json(res, 200, { updatedAt: 222 });
      }
    }
    json(res, 404, { error: { code: 'NOT_FOUND' } });
  });
  await new Promise(ok => mock.listen(0, '127.0.0.1', ok));
  mockPort = mock.address().port;
  studyPort = 4400 + 1 + Math.floor(Math.random() * 90);
  study = spawn(process.execPath, ['server.mjs'], {
    cwd: ROOT,
    env: { ...process.env, PORT: String(studyPort), ACCOUNTS_URL: `http://127.0.0.1:${mockPort}`, REQUIRE_LOGIN: 'false' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  study.stderr.on('data', d => process.stderr.write('[study] ' + d));
  const up = await waitFor(`http://127.0.0.1:${studyPort}/robots.txt`);
  assert.equal(up, true, 'study server phải khởi động');
});

after(async () => {
  if (study) study.kill();
  if (mock) await new Promise(ok => mock.close(ok));
});

const base = () => `http://127.0.0.1:${studyPort}`;

test('GET /api/progress chưa đăng nhập trả 401 qua proxy', async () => {
  const r = await fetch(base() + '/api/progress');
  assert.equal(r.status, 401);
  assert.equal((await r.json()).error.code, 'UNAUTHENTICATED');
});

test('GET /api/progress có phiên trả snapshot và không tin x-forwarded-for của trình duyệt', async () => {
  const r = await fetch(base() + '/api/progress', {
    headers: { cookie: 'lyt_session=good', 'x-forwarded-for': '1.2.3.4' },
  });
  assert.equal(r.status, 200);
  const d = await r.json();
  assert.equal(d.updatedAt, 111);
  assert.equal(d.data.lyt_answers, '{"a":1}');
  assert.match(lastGetHeaders['x-forwarded-for'], /^(127\.0\.0\.1|::1|::ffff:127\.0\.0\.1)$/);
});

test('PUT /api/progress thiếu CSRF bị từ chối, không ghi snapshot', async () => {
  lastPut = null;
  const r = await fetch(base() + '/api/progress', {
    method: 'PUT',
    headers: { cookie: 'lyt_session=good', 'content-type': 'application/json' },
    body: JSON.stringify({ data: { lyt_goal: '30' } }),
  });
  assert.equal(r.status, 403);
  assert.equal(lastPut, null);
});

test('PUT /api/progress đúng CSRF nhận snapshot và trả updatedAt', async () => {
  const r = await fetch(base() + '/api/progress', {
    method: 'PUT',
    headers: { cookie: 'lyt_session=good', 'content-type': 'application/json', 'x-csrf-token': 'csrf-ok' },
    body: JSON.stringify({ data: { lyt_goal: '30', lyt_answers: '{"a":2}' } }),
  });
  assert.equal(r.status, 200);
  assert.equal((await r.json()).updatedAt, 222);
  assert.deepEqual(lastPut.data, { lyt_goal: '30', lyt_answers: '{"a":2}' });
});

test('máy chủ tài khoản chết trả 503 ACCOUNTS_UNAVAILABLE', async () => {
  await new Promise(ok => mock.close(ok));
  const r = await fetch(base() + '/api/progress', { headers: { cookie: 'lyt_session=good' } });
  assert.equal(r.status, 503);
  assert.equal((await r.json()).error.code, 'ACCOUNTS_UNAVAILABLE');
});
