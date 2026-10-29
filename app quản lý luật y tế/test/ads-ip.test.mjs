import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createServer } from 'node:http';
import { openDb } from '../src/db.mjs';
import { createApp } from '../src/app.mjs';
import { hashPassword } from '../src/auth.mjs';
import { createPlan, grantSubscription } from '../src/billing.mjs';
import { validateAd } from '../src/ads-ip-routes.mjs';

const T0 = Date.parse('2026-06-15T05:00:00Z');
const PW = 'mat-khau-dai-10';

function boot({ trustProxy = false } = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'ads-ip-test-'));
  const db = openDb(join(dir, 'x.db'));
  const iso = new Date(T0).toISOString();
  const add = (email, role, totp) => db.prepare('INSERT INTO users (email, password_hash, role, status, totp_enabled, created_at) VALUES (?, ?, ?, ?, ?, ?)')
    .run(email, hashPassword(PW), role, 'active', totp, iso).lastInsertRowid;
  const admin = add('admin@vidu.vn', 'admin', 1);
  const user = add('user@vidu.vn', 'user', 0);
  createPlan(db, { name: 'Miễn phí', durationDays: -1, price: 0, features: { chatDailyLimit: 5, lawVisibleLines: 30, showAds: true } }, T0);
  const week = createPlan(db, { name: 'Gói 7 ngày', durationDays: 7, price: 50000, features: { chatDailyLimit: 50, lawVisibleLines: 100 } }, T0);
  const server = createServer(createApp({ db, now: () => T0, trustProxy, paymentSecret: 'bi-mat-thanh-toan-16+', backupDir: join(dir, 'bk'), cryptoKey: Buffer.alloc(32, 1), allowedOrigins: [] }));
  return { dir, db, admin, user, week, server };
}

async function listen(server) {
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  return `http://127.0.0.1:${server.address().port}`;
}

async function login(B, email) {
  const r = await fetch(B + '/api/auth/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email, password: PW }) });
  return r.headers.get('set-cookie').split(';')[0];
}

test('kiểm tra quảng cáo: link phải là http/https', () => {
  assert.equal(validateAd({ placement: 'banner-top', title: 'A', linkUrl: 'https://vidu.vn' }).link_url, 'https://vidu.vn');
  assert.throws(() => validateAd({ placement: 'banner-top', title: 'A', linkUrl: 'javascript:alert(1)' }), /http/);
  assert.throws(() => validateAd({ placement: 'chay-khap', title: 'A' }), /Vị trí/);
  assert.throws(() => validateAd({ placement: 'inline', title: '' }), /Tiêu đề/);
});

test('ghi nhận IP truy cập và thống kê theo ngày', async () => {
  const s = boot();
  const B = await listen(s.server);
  try {
    for (let i = 0; i < 3; i++) await fetch(B + '/api/public/visit', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' });
    const admin = await login(B, 'admin@vidu.vn');
    s.db.prepare('UPDATE sessions SET mfa_ok = 1').run();
    const st = await (await fetch(B + '/api/admin/ip-stats?days=7', { headers: { cookie: admin } })).json();
    assert.equal(st.totals.hits, 3);
    assert.equal(st.totals.uniqueIps, 1);
    assert.equal(st.topIps[0].hits, 3);
    assert.equal(st.daily[0].hits, 3);
  } finally { await new Promise(r => s.server.close(r)); s.db.close(); rmSync(s.dir, { recursive: true, force: true }); }
});

test('IP lấy từ X-Forwarded-For chỉ khi bật TRUST_PROXY', async () => {
  for (const trust of [false, true]) {
    const s = boot({ trustProxy: trust });
    const B = await listen(s.server);
    try {
      await fetch(B + '/api/public/visit', { method: 'POST', headers: { 'content-type': 'application/json', 'x-forwarded-for': '203.0.113.7, 10.0.0.1' }, body: '{}' });
      const ip = s.db.prepare('SELECT ip FROM ip_visits').get().ip;
      assert.equal(ip, trust ? '203.0.113.7' : '127.0.0.1');
    } finally { await new Promise(r => s.server.close(r)); s.db.close(); rmSync(s.dir, { recursive: true, force: true }); }
  }
});

test('quảng cáo: gói miễn phí thấy, gói trả phí và admin không thấy', async () => {
  const s = boot();
  const B = await listen(s.server);
  try {
    const admin = await login(B, 'admin@vidu.vn');
    s.db.prepare('UPDATE sessions SET mfa_ok = 1').run();
    const created = await fetch(B + '/api/admin/ads', { method: 'POST', headers: { cookie: admin, 'content-type': 'application/json', 'x-csrf-token': (await (await fetch(B + '/api/me', { headers: { cookie: admin } })).json()).csrfToken }, body: JSON.stringify({ placement: 'banner-top', title: 'Khóa học luật', linkUrl: 'https://vidu.vn/khoa-hoc' }) });
    assert.equal(created.status, 201);

    // Khách và người dùng miễn phí: thấy quảng cáo
    const anon = await (await fetch(B + '/api/public/ads?placement=banner-top')).json();
    assert.equal(anon.ads.length, 1);

    // Người dùng có gói 7 ngày: không thấy
    const uc = await login(B, 'user@vidu.vn');
    grantSubscription(s.db, s.user, s.week.id, T0);
    const paid = await (await fetch(B + '/api/public/ads?placement=banner-top', { headers: { cookie: uc } })).json();
    assert.equal(paid.ads.length, 0);

    // Admin: không thấy quảng cáo
    const adminView = await (await fetch(B + '/api/public/ads', { headers: { cookie: admin } })).json();
    assert.equal(adminView.ads.length, 0);
  } finally { await new Promise(r => s.server.close(r)); s.db.close(); rmSync(s.dir, { recursive: true, force: true }); }
});
