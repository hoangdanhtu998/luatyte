// Máy chủ học phải sống sót khi URL méo (decodeURIComponent lỗi) và vẫn phục vụ request sau.
// Chạy: cd "app luật y tế" && node --test test/server-resilience.test.mjs
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { request } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const sleep = ms => new Promise(r => setTimeout(r, ms));
let child, port;

function httpGet(path) {
  return new Promise((ok, bad) => {
    const req = request({ host: '127.0.0.1', port, path, method: 'GET' }, res => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => ok({ status: res.statusCode, body }));
    });
    req.on('error', bad);
    req.end();
  });
}

before(async () => {
  port = 4500 + Math.floor(Math.random() * 300);
  child = spawn(process.execPath, ['server.mjs'], {
    cwd: ROOT,
    env: { ...process.env, PORT: String(port) },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  for (let i = 0; i < 50; i++) {
    try {
      const r = await httpGet('/robots.txt');
      if (r.status) return;
    } catch {}
    await sleep(100);
  }
  throw new Error('server không khởi động');
});

after(() => { if (child) child.kill(); });

test('URL chứa % méo trả 500 JSON, không làm chết server', async () => {
  const bad = await httpGet('/%');
  assert.equal(bad.status, 500);
  const j = JSON.parse(bad.body);
  assert.equal(j.error.code, 'INTERNAL_ERROR');
  const again = await httpGet('/robots.txt');
  assert.equal(again.status, 200);
});

test('đường dẫn /slides/% cũng không làm sập server', async () => {
  const bad = await httpGet('/slides/%');
  assert.equal(bad.status, 500);
  const again = await httpGet('/icon.svg');
  assert.equal(again.status, 200);
});
