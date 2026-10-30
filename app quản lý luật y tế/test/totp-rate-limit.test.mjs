import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { openDb } from '../src/db.mjs';
import { createApp } from '../src/app.mjs';
import { hashPassword } from '../src/auth.mjs';
import { codeAt } from '../src/totp.mjs';

const PW = 'mat-khau-dai-10';

async function start() {
  const db = openDb(':memory:');
  const server = createServer(createApp({ db, allowRegistration: true }));
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${server.address().port}`;
  const close = () => new Promise(r => server.close(r));
  return { db, base, close };
}

function addUser(db, email, role = 'user', pw = PW) {
  db.prepare('INSERT INTO users (email, password_hash, role, status, created_at) VALUES (?, ?, ?, ?, ?)')
    .run(email, hashPassword(pw), role, 'active', new Date().toISOString());
}

async function call(base, method, path, { body, cookie, csrf } = {}) {
  const headers = {};
  if (body !== undefined) headers['content-type'] = 'application/json';
  if (cookie) headers.cookie = cookie;
  if (csrf) headers['x-csrf-token'] = csrf;
  const r = await fetch(base + path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  const data = await r.json().catch(() => ({}));
  const set = r.headers.get('set-cookie');
  const token = set && set.match(/lyt_session=([^;]+)/);
  return { status: r.status, data, cookie: token ? `lyt_session=${token[1]}` : null };
}

test('TOTP rate-limit: sau 5 lần sai thì bị chặn 429', async () => {
  const { db, base, close } = await start();
  try {
    addUser(db, 'admin@vidu.com', 'admin', PW);
    
    // Đăng nhập
    const login = await call(base, 'POST', '/api/auth/login', {
      body: { email: 'admin@vidu.com', password: PW }
    });
    assert.equal(login.status, 200);
    
    // Setup TOTP
    const setup = await call(base, 'POST', '/api/admin/totp/setup', {
      body: {},
      cookie: login.cookie,
      csrf: login.data.csrfToken
    });
    assert.equal(setup.status, 200);
    
    // Tính mã TOTP đúng cho step hiện tại
    const now = Date.now();
    const step = Math.floor(now / 30000);
    const { codeAt } = await import('../src/totp.mjs');
    const correctCode = codeAt(setup.data.secret, step);
    
    // Enable TOTP với mã đúng
    const enable = await call(base, 'POST', '/api/admin/totp/enable', {
      body: { code: correctCode },
      cookie: login.cookie,
      csrf: login.data.csrfToken
    });
    assert.equal(enable.status, 200, `Enable TOTP failed: ${JSON.stringify(enable.data)}`);
    
    // Đăng nhập lại để có session cần TOTP
    const login2 = await call(base, 'POST', '/api/auth/login', {
      body: { email: 'admin@vidu.com', password: PW }
    });
    assert.equal(login2.status, 200);
    
    // Thử 5 mã sai
    for (let i = 0; i < 5; i++) {
      const r = await call(base, 'POST', '/api/auth/totp', {
        body: { code: '000000' },
        cookie: login2.cookie,
        csrf: login2.data.csrfToken
      });
      assert.equal(r.status, 401, `Lần thử ${i + 1} phải trả 401`);
    }
    
    // Lần thứ 6 phải bị rate-limit
    const blocked = await call(base, 'POST', '/api/auth/totp', {
      body: { code: '000000' },
      cookie: login2.cookie,
      csrf: login2.data.csrfToken
    });
    assert.equal(blocked.status, 429);
    assert.equal(blocked.data.error.code, 'RATE_LIMITED');
  } finally { await close(); }
});
