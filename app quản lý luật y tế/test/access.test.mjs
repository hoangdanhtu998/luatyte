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
import { truncateLines, dayKey, consumeChat, DEFAULT_FREE } from '../src/access.mjs';

const T0 = Date.parse('2026-06-15T05:00:00Z'); // 12:00 giờ Việt Nam
const PW = 'mat-khau-dai-10';

function seed() {
  const dir = mkdtempSync(join(tmpdir(), 'access-test-'));
  const db = openDb(join(dir, 'x.db'));
  const iso = new Date(T0).toISOString();
  const add = (email, role) => db.prepare('INSERT INTO users (email, password_hash, role, status, totp_enabled, created_at) VALUES (?, ?, ?, ?, ?, ?)')
    .run(email, hashPassword(PW), role, 'active', role === 'admin' ? 1 : 0, iso).lastInsertRowid;
  const admin = add('admin@vidu.vn', 'admin');
  const user = add('user@vidu.vn', 'user');
  const free = createPlan(db, { name: 'Miễn phí', durationDays: -1, price: 0, features: { chatDailyLimit: 5, lawVisibleLines: 30 } }, T0);
  const week = createPlan(db, { name: 'Gói 7 ngày', durationDays: 7, price: 50000, features: { chatDailyLimit: 50, lawVisibleLines: 100 } }, T0);
  const cat = db.prepare("INSERT INTO law_categories (name) VALUES ('Khám chữa bệnh')").run().lastInsertRowid;
  const lines = Array.from({ length: 100 }, (_, i) => `Dòng ${i + 1}`).join('\n');
  const art = db.prepare('INSERT INTO law_articles (category_id, number, title, content, is_verified) VALUES (?, ?, ?, ?, 1)')
    .run(cat, '38', 'Điều 38', lines).lastInsertRowid;
  const hidden = db.prepare('INSERT INTO law_articles (category_id, number, title, content, is_verified) VALUES (?, ?, ?, ?, 0)')
    .run(cat, '39', 'Điều 39 chưa duyệt', 'nội dung nháp').lastInsertRowid;
  return { dir, db, admin, user, free, week, art: Number(art), hidden: Number(hidden) };
}

test('cắt nội dung theo số dòng được xem', () => {
  const text = Array.from({ length: 100 }, (_, i) => `d${i + 1}`).join('\n');
  const free = truncateLines(text, 30);
  assert.equal(free.shownLines, 30);
  assert.equal(free.totalLines, 100);
  assert.equal(free.truncated, true);
  assert.equal(free.text.split('\n').length, 30);
  const all = truncateLines(text, -1);
  assert.equal(all.truncated, false);
  assert.equal(all.shownLines, 100);
});

test('lượt chat theo ngày: hết lượt thì chặn, sang ngày mới được reset', () => {
  const s = seed();
  try {
    for (let i = 0; i < 5; i++) assert.equal(consumeChat(s.db, s.user, DEFAULT_FREE, T0).allowed, true);
    const blocked = consumeChat(s.db, s.user, DEFAULT_FREE, T0);
    assert.equal(blocked.allowed, false);
    assert.equal(blocked.remaining, 0);
    // Ngày hôm sau theo giờ Việt Nam
    assert.equal(consumeChat(s.db, s.user, DEFAULT_FREE, T0 + 24 * 60 * 60 * 1000).allowed, true);
    assert.notEqual(dayKey(T0), dayKey(T0 + 24 * 60 * 60 * 1000));
  } finally { s.db.close(); rmSync(s.dir, { recursive: true, force: true }); }
});

test('HTTP: free bị cắt 30 dòng và hết lượt chat thì nhận 429; gói trả phí xem đủ hơn', async () => {
  const s = seed();
  const server = createServer(createApp({ db: s.db, now: () => T0, paymentSecret: 'bi-mat-thanh-toan-16+', backupDir: join(s.dir, 'bk'), cryptoKey: Buffer.alloc(32, 1), allowedOrigins: [] }));
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const B = `http://127.0.0.1:${server.address().port}`;
  try {
    // Khách chưa đăng nhập: xem 30 dòng
    const anon = await (await fetch(B + `/api/law/articles/${s.art}`)).json();
    assert.equal(anon.shownLines, 30);
    assert.equal(anon.truncated, true);

    // Điều chưa đối chiếu không lộ ra
    assert.equal((await fetch(B + `/api/law/articles/${s.hidden}`)).status, 404);

    // Đăng nhập user thường (gói miễn phí)
    const login = await fetch(B + '/api/auth/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: 'user@vidu.vn', password: PW }) });
    const cookie = login.headers.get('set-cookie').split(';')[0];
    const csrf = (await (await fetch(B + '/api/me', { headers: { cookie } })).json()).csrfToken;
    const H = { cookie, 'x-csrf-token': csrf, 'content-type': 'application/json' };

    for (let i = 0; i < 5; i++) assert.equal((await fetch(B + '/api/chat/consume', { method: 'POST', headers: H, body: '{}' })).status, 200);
    const over = await fetch(B + '/api/chat/consume', { method: 'POST', headers: H, body: '{}' });
    assert.equal(over.status, 429);
    assert.equal((await over.json()).error.code, 'QUOTA_EXCEEDED');

    // Cấp gói 7 ngày: xem được 100 dòng và có 50 lượt
    grantSubscription(s.db, s.user, s.week.id, T0);
    const paid = await (await fetch(B + `/api/law/articles/${s.art}`, { headers: { cookie } })).json();
    assert.equal(paid.shownLines, 100);
    assert.equal(paid.truncated, false);
    const ent = await (await fetch(B + '/api/me/entitlements', { headers: { cookie } })).json();
    assert.equal(ent.tier, 'plan');
    assert.equal(ent.features.chatDailyLimit, 50);
    assert.equal((await fetch(B + '/api/chat/consume', { method: 'POST', headers: H, body: '{}' })).status, 200);

    // Admin: quyền cao nhất, không giới hạn
    const alogin = await fetch(B + '/api/auth/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: 'admin@vidu.vn', password: PW }) });
    const acookie = alogin.headers.get('set-cookie').split(';')[0];
    s.db.prepare('UPDATE sessions SET mfa_ok = 1').run();
    const aent = await (await fetch(B + '/api/me/entitlements', { headers: { cookie: acookie } })).json();
    assert.equal(aent.tier, 'admin');
    assert.equal(aent.features.chatDailyLimit, -1);

    // Chat cần đăng nhập
    assert.equal((await fetch(B + '/api/chat/consume', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' })).status, 401);
  } finally {
    await new Promise(r => server.close(r));
    s.db.close();
    rmSync(s.dir, { recursive: true, force: true });
  }
});
