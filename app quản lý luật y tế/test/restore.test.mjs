import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { openDb } from '../src/db.mjs';
import { validateBackup, restoreBackup, RestoreError } from '../src/restore.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const T0 = Date.parse('2026-10-29T03:00:00Z');

function insertUser(db, email, username = null) {
  db.prepare('INSERT INTO users (email, username, name, password_hash, role, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(email, username, '', 'x', 'user', 'active', new Date(T0).toISOString());
}

test('khôi phục DB: kiểm tra bản sao lưu, từ chối thiếu --yes, giữ bản an toàn', () => {
  const dir = mkdtempSync(join(tmpdir(), 'qlyt-restore-'));
  try {
    const dbPath = join(dir, 'quan-ly.db');
    const backup = join(dir, 'backup.db');
    const db = openDb(dbPath);
    insertUser(db, 'cu@vidu.vn', 'nguoicu');
    db.exec(`VACUUM INTO '${backup.replace(/'/g, "''")}'`);
    insertUser(db, 'moi@vidu.vn', 'nguoimoi');
    db.close();

    const info = validateBackup(backup);
    assert.ok(info.tables.includes('users'));
    assert.ok(info.tables.includes('orders'));

    assert.throws(() => restoreBackup({ file: backup, dbPath, yes: false }), e => e instanceof RestoreError && e.code === 'CONFIRM_REQUIRED');

    const r = restoreBackup({ file: backup, dbPath, yes: true, now: () => T0 });
    assert.equal(r.restored, dbPath);
    assert.ok(r.safety && existsSync(r.safety), 'phải giữ bản an toàn của DB cũ');

    const after = openDb(dbPath);
    const emails = after.prepare('SELECT email FROM users ORDER BY id').all().map(x => x.email);
    after.close();
    assert.deepEqual(emails, ['cu@vidu.vn'], 'chỉ còn dữ liệu trong bản sao lưu');
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('khôi phục DB: từ chối file rác, file trùng DB đích và bản sao lưu hỏng', () => {
  const dir = mkdtempSync(join(tmpdir(), 'qlyt-restore-bad-'));
  try {
    const dbPath = join(dir, 'quan-ly.db');
    const db = openDb(dbPath);
    db.close();
    const txt = join(dir, 'khong-phai-db.txt');
    writeFileSync(txt, 'day khong phai sqlite', 'utf8');
    assert.throws(() => validateBackup(txt), e => e instanceof RestoreError && e.code === 'NOT_SQLITE');
    assert.throws(() => restoreBackup({ file: dbPath, dbPath, yes: true }), e => e instanceof RestoreError && e.code === 'SAME_FILE');
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('CLI restore chạy được với DB_PATH và --yes', () => {
  const dir = mkdtempSync(join(tmpdir(), 'qlyt-restore-cli-'));
  try {
    const dbPath = join(dir, 'quan-ly.db');
    const backup = join(dir, 'backup.db');
    const db = openDb(dbPath);
    insertUser(db, 'cli@vidu.vn', 'nguoicli');
    db.exec(`VACUUM INTO '${backup.replace(/'/g, "''")}'`);
    db.close();

    const out = execFileSync(process.execPath, [join(ROOT, 'src', 'cli.mjs'), 'restore', backup, '--yes'], {
      cwd: ROOT, env: { ...process.env, DB_PATH: dbPath }, encoding: 'utf8',
    });
    assert.match(out, /Đã khôi phục/);

    const after = openDb(dbPath);
    assert.equal(after.prepare('SELECT COUNT(*) AS n FROM users').get().n, 1);
    after.close();
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
