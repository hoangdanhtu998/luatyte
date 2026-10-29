// Khôi phục cơ sở dữ liệu từ bản sao lưu SQLite. Chỉ chạy khi máy chủ đã dừng.
// Luôn giữ một bản an toàn của DB hiện tại trước khi ghi đè.
import { DatabaseSync } from 'node:sqlite';
import { existsSync, statSync, openSync, readSync, closeSync, copyFileSync, mkdirSync, unlinkSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const REQUIRED_TABLES = ['users', 'sessions', 'plans', 'orders', 'subscriptions'];
const SQLITE_HEADER = 'SQLite format 3\u0000';

export class RestoreError extends Error {
  constructor(code, message, status = 400) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

function readHeader(file) {
  const fd = openSync(file, 'r');
  try {
    const buf = Buffer.alloc(16);
    readSync(fd, buf, 0, 16, 0);
    return buf.toString('latin1');
  } finally {
    closeSync(fd);
  }
}

export function validateBackup(file) {
  const path = resolve(String(file || ''));
  if (!file) throw new RestoreError('MISSING_FILE', 'Chưa chỉ định file sao lưu.');
  if (!existsSync(path)) throw new RestoreError('NOT_FOUND', `Không thấy file sao lưu: ${path}`, 404);
  if (!statSync(path).isFile()) throw new RestoreError('NOT_FILE', 'Đường dẫn sao lưu không phải file.');
  if (readHeader(path) !== SQLITE_HEADER) {
    throw new RestoreError('NOT_SQLITE', 'File không phải cơ sở dữ liệu SQLite hợp lệ.');
  }

  let db;
  try {
    db = new DatabaseSync(path, { readOnly: true });
    const integrity = db.prepare('PRAGMA integrity_check').get();
    const verdict = integrity ? Object.values(integrity)[0] : null;
    if (verdict !== 'ok') throw new RestoreError('CORRUPT', `Bản sao lưu bị hỏng: ${String(verdict)}`);
    const tables = new Set(db.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all().map(r => r.name));
    const missing = REQUIRED_TABLES.filter(t => !tables.has(t));
    if (missing.length) {
      throw new RestoreError('MISSING_TABLES', `Bản sao lưu thiếu bảng: ${missing.join(', ')}.`);
    }
    return { path, tables: [...tables] };
  } catch (e) {
    if (e instanceof RestoreError) throw e;
    throw new RestoreError('INVALID_DB', `Không mở được bản sao lưu: ${e.message}`);
  } finally {
    try { db?.close(); } catch { /* đã đóng */ }
  }
}

// yes=false sẽ từ chối để tránh ghi đè nhầm. CLI truyền --yes.
export function restoreBackup({ file, dbPath, yes = false, now = () => Date.now() }) {
  if (!yes) {
    throw new RestoreError('CONFIRM_REQUIRED', 'Thêm --yes để xác nhận ghi đè cơ sở dữ liệu hiện tại. Hãy dừng máy chủ trước.');
  }
  const source = resolve(String(file || ''));
  const target = resolve(String(dbPath || ''));
  if (!file || !dbPath) throw new RestoreError('INVALID_INPUT', 'Cần cả file sao lưu và DB đích.');
  if (source === target) throw new RestoreError('SAME_FILE', 'File sao lưu trùng với DB đang dùng.');
  validateBackup(source);

  let safety = null;
  if (existsSync(target)) {
    const stamp = new Date(now()).toISOString().replace(/[:.]/g, '-');
    safety = `${target}.truoc-khoi-phuc-${stamp}`;
    copyFileSync(target, safety);
  }
  mkdirSync(dirname(target), { recursive: true });
  // Bỏ file tạm cũ để SQLite không đọc nhầm dữ liệu chưa ghi xong.
  for (const f of [target + '-wal', target + '-shm']) {
    if (existsSync(f)) unlinkSync(f);
  }
  copyFileSync(source, target);
  validateBackup(target);
  return { restored: target, safety, source };
}
