// Phase 3 (cấu hình email, quản lý hàng đợi) và Phase 4 (nhật ký đăng nhập, nhật ký thao tác, cài đặt mã hóa, CSRF).
import { encryptSecret, decryptSecret } from './crypto.mjs';
import { enqueue, processQueue } from './mail.mjs';
import { randomBytes } from 'node:crypto';

export class OpsError extends Error {
  constructor(code, message, status = 400) { super(message); this.code = code; this.status = status; }
}

// ---------- Cài đặt (bí mật được mã hóa) ----------
export function setSetting(db, key, value, { secret = false, cryptoKey = null, now }) {
  if (secret && !cryptoKey) throw new OpsError('KEY_MISSING', 'Chưa cấu hình SETTINGS_KEY nên không lưu được bí mật.', 500);
  const stored = secret ? encryptSecret(value, cryptoKey) : JSON.stringify(value);
  db.prepare(`INSERT INTO settings (key, value, is_secret, updated_at) VALUES (?, ?, ?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, is_secret = excluded.is_secret, updated_at = excluded.updated_at`)
    .run(key, stored, secret ? 1 : 0, new Date(now).toISOString());
}

export function getSetting(db, key, { cryptoKey = null } = {}) {
  const r = db.prepare('SELECT value, is_secret FROM settings WHERE key = ?').get(key);
  if (!r) return null;
  if (r.is_secret) {
    if (!cryptoKey) throw new OpsError('KEY_MISSING', 'Chưa cấu hình SETTINGS_KEY.', 500);
    return decryptSecret(r.value, cryptoKey);
  }
  return JSON.parse(r.value);
}

// ---------- Cấu hình email (V3.1) ----------
export function getEmailConfig(db, cryptoKey) {
  const cfg = getSetting(db, 'email.config', { cryptoKey }) || {};
  return {
    host: cfg.host || '', port: cfg.port || 587, user: cfg.user || '', from: cfg.from || '',
    enabled: !!cfg.enabled,
    hasPassword: !!getSettingRaw(db, 'email.password'),
  };
}
function getSettingRaw(db, key) {
  return db.prepare('SELECT 1 FROM settings WHERE key = ?').get(key);
}

export function saveEmailConfig(db, body, now, cryptoKey) {
  const host = String(body.host || '').trim();
  const port = Number(body.port || 587);
  if (host && !/^[a-zA-Z0-9.-]{1,253}$/.test(host)) throw new OpsError('INVALID_INPUT', 'Máy chủ SMTP không hợp lệ.');
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new OpsError('INVALID_INPUT', 'Cổng SMTP không hợp lệ.');
  const from = String(body.from || '').trim();
  if (from && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(from)) throw new OpsError('INVALID_INPUT', 'Địa chỉ người gửi không hợp lệ.');
  setSetting(db, 'email.config', { host, port, user: String(body.user || '').trim(), from, enabled: body.enabled === true }, { now });
  if (typeof body.password === 'string' && body.password.length > 0) {
    setSetting(db, 'email.password', body.password, { secret: true, cryptoKey, now });
  }
  return getEmailConfig(db, cryptoKey);
}

// Gửi thử qua hàm sender (SMTP thật được truyền vào từ server). Không ghi bí mật ra kết quả.
export async function sendTestEmail(sender, to, subject, body) {
  if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) throw new OpsError('INVALID_INPUT', 'Địa chỉ nhận không hợp lệ.');
  try {
    await sender(to, subject || 'Thư thử', body || 'Thư thử từ hệ thống quản lý.');
    // Khi chưa có SMTP thật, thư chỉ được ghi vào outbox: báo rõ để không hiểu nhầm là đã gửi tới hộp thư.
    if (sender.mode === 'outbox') return { success: true, mode: 'outbox', note: 'Chưa có SMTP thật: thư đã được ghi vào outbox, chưa gửi tới hộp thư.' };
    return { success: true, mode: sender.mode || 'smtp' };
  } catch (e) {
    return { success: false, error: String(e.message || e).slice(0, 300) };
  }
}

// ---------- Hàng đợi email (V3.2) ----------
export function listEmailQueue(db, { status, limit = 50, offset = 0 } = {}) {
  const rows = db.prepare(`SELECT id, to_address, subject, status, attempts, next_attempt_at, last_error, created_at, tried_at FROM email_queue
    WHERE (? IS NULL OR status = ?) ORDER BY id DESC LIMIT ? OFFSET ?`).all(status ?? null, status ?? null, Math.min(limit, 200), offset);
  return rows.map(r => ({ id: r.id, to: r.to_address, subject: r.subject, status: r.status, attempts: r.attempts, nextAttemptAt: r.next_attempt_at, lastError: r.last_error, createdAt: r.created_at, triedAt: r.tried_at }));
}

// Đưa thư lỗi về hàng đợi để gửi lại ngay (admin bấm thử lại).
export function retryEmail(db, id, now) {
  const r = db.prepare('SELECT status FROM email_queue WHERE id = ?').get(id);
  if (!r) throw new OpsError('NOT_FOUND', 'Không tìm thấy thư.', 404);
  if (r.status === 'sent') throw new OpsError('ALREADY_SENT', 'Thư đã gửi thành công.', 409);
  db.prepare("UPDATE email_queue SET status = 'queued', next_attempt_at = ? WHERE id = ?").run(now, id);
  return { ok: true };
}

export { enqueue, processQueue };

// ---------- Nhật ký đăng nhập (V4.1) ----------
export function recordLogin(db, { userId = null, email, ip, userAgent, success, reason = null, now }) {
  db.prepare('INSERT INTO login_logs (user_id, email, ip, user_agent, success, failed_reason, logged_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(userId, String(email || '').slice(0, 254), String(ip || '').slice(0, 64), String(userAgent || '').slice(0, 300), success ? 1 : 0, reason, now);
}

export function listLoginLogs(db, { userId, ip, from, to, limit = 50, offset = 0 } = {}) {
  const rows = db.prepare(`SELECT * FROM login_logs WHERE (? IS NULL OR user_id = ?) AND (? IS NULL OR ip = ?)
    AND (? IS NULL OR logged_at >= ?) AND (? IS NULL OR logged_at <= ?) ORDER BY id DESC LIMIT ? OFFSET ?`)
    .all(userId ?? null, userId ?? null, ip ?? null, ip ?? null, from ?? null, from ?? null, to ?? null, to ?? null, Math.min(limit, 200), offset);
  return rows.map(r => ({ id: r.id, userId: r.user_id, email: r.email, ip: r.ip, userAgent: r.user_agent, success: !!r.success, failedReason: r.failed_reason, loggedAt: r.logged_at }));
}

// ---------- Nhật ký thao tác admin (V4.2) ----------
export function audit(db, { adminId, action, entity, entityId = null, oldValue = null, newValue = null, ip = '', now }) {
  db.prepare('INSERT INTO audit_logs (admin_id, action, entity, entity_id, old_value, new_value, ip, logged_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .run(adminId, action, entity, entityId === null ? null : String(entityId), oldValue === null ? null : JSON.stringify(oldValue), newValue === null ? null : JSON.stringify(newValue), String(ip), now);
}

export function listAudit(db, { limit = 50, offset = 0 } = {}) {
  return db.prepare('SELECT * FROM audit_logs ORDER BY id DESC LIMIT ? OFFSET ?').all(Math.min(limit, 200), offset).map(r => ({
    id: r.id, adminId: r.admin_id, action: r.action, entity: r.entity, entityId: r.entity_id,
    oldValue: r.old_value ? JSON.parse(r.old_value) : null, newValue: r.new_value ? JSON.parse(r.new_value) : null, ip: r.ip, loggedAt: r.logged_at,
  }));
}

// ---------- CSRF (V4.4) ----------
export function newCsrfToken() { return randomBytes(24).toString('base64url'); }

// Các đường không cần CSRF: đăng nhập, đăng ký, callback cổng thanh toán (cổng tự ký), đăng xuất.
export const CSRF_EXEMPT = [/^\/api\/auth\/(login|register|logout)$/, /^\/api\/payments\/callback\//, /^\/api\/public\/visit$/];
export function csrfRequired(method, pathname) {
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') return false;
  return !CSRF_EXEMPT.some(r => r.test(pathname));
}

// Trả về danh sách origin được phép (cấu hình ALLOWED_ORIGINS, cách nhau bằng dấu phẩy).
export function corsHeadersFor(origin, allowed) {
  if (!origin || !allowed.includes(origin)) return {};
  return {
    'access-control-allow-origin': origin,
    'access-control-allow-credentials': 'true',
    'access-control-allow-headers': 'content-type, x-csrf-token',
    'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
    vary: 'Origin',
  };
}
