// Hàng đợi email: ghi vào bảng email_queue, gửi nền, thử lại theo lịch 1h, 6h, 24h, ghi kết quả.
// Lưu ý: chưa có SMTP thật. sender mặc định ghi ra outbox (giống nền tảng cũ). Gửi thật cần cấu hình SMTP.
import { createHmac } from 'node:crypto';

export const RETRY_DELAYS_MS = [60 * 60 * 1000, 6 * 60 * 60 * 1000, 24 * 60 * 60 * 1000];
export const MAX_TRIES = 1 + RETRY_DELAYS_MS.length; // 1 lần gửi đầu + 3 lần thử lại

export const TEMPLATES = {
  'verify-email': { subject: 'Xác minh email của bạn', body: 'Xin chào ${userName}, mã xác minh của bạn là ${verificationCode}.' },
  'forgot-password': { subject: 'Đặt lại mật khẩu', body: 'Xin chào ${userName}, bạn vừa yêu cầu đặt lại mật khẩu.' },
  'invoice': { subject: 'Hóa đơn của bạn', body: 'Xin chào ${userName}, hóa đơn của bạn: ${invoiceLink}.' },
  'renewal-reminder': { subject: 'Gói của bạn sắp hết hạn', body: 'Xin chào ${userName}, gói của bạn hết hạn ngày ${expiryDate}. Hãy gia hạn để tiếp tục học.' },
};

// Thay ${tên} bằng giá trị. Biến không có thì để nguyên và báo lại để không gửi thư thiếu thông tin.
export function renderTemplate(name, vars) {
  const t = TEMPLATES[name];
  if (!t) throw Object.assign(new Error('Không có mẫu email này.'), { code: 'UNKNOWN_TEMPLATE' });
  const missing = [];
  const fill = s => s.replace(/\$\{(\w+)\}/g, (m, k) => {
    if (vars[k] === undefined || vars[k] === null || vars[k] === '') { missing.push(k); return m; }
    return String(vars[k]);
  });
  const out = { subject: fill(t.subject), body: fill(t.body) };
  if (missing.length) throw Object.assign(new Error(`Thiếu biến: ${[...new Set(missing)].join(', ')}`), { code: 'MISSING_VARIABLE' });
  return out;
}

export function enqueue(db, { to, subject, body }, now) {
  if (!to || !subject || !body) throw Object.assign(new Error('Thiếu người nhận, tiêu đề hoặc nội dung.'), { code: 'INVALID_EMAIL' });
  const info = db.prepare('INSERT INTO email_queue (to_address, subject, body, status, attempts, next_attempt_at, created_at) VALUES (?, ?, ?, ?, 0, ?, ?)')
    .run(String(to), String(subject), String(body), 'queued', now, new Date(now).toISOString());
  return Number(info.lastInsertRowid);
}

// Gửi các thư đến hạn. send(to, subject, body) ném lỗi nếu thất bại. Trả về thống kê.
export async function processQueue(db, now, send) {
  const due = db.prepare("SELECT * FROM email_queue WHERE status = 'queued' AND next_attempt_at <= ? ORDER BY id").all(now);
  const stats = { sent: 0, retried: 0, failed: 0 };
  for (const mail of due) {
    const attempts = mail.attempts + 1;
    try {
      await send(mail.to_address, mail.subject, mail.body);
      db.prepare("UPDATE email_queue SET status = 'sent', attempts = ?, tried_at = ?, last_error = NULL WHERE id = ?").run(attempts, new Date(now).toISOString(), mail.id);
      stats.sent++;
    } catch (e) {
      const msg = String(e && e.message || e).slice(0, 500);
      if (attempts >= MAX_TRIES) {
        db.prepare("UPDATE email_queue SET status = 'failed', attempts = ?, tried_at = ?, last_error = ? WHERE id = ?").run(attempts, new Date(now).toISOString(), msg, mail.id);
        stats.failed++;
      } else {
        const next = now + RETRY_DELAYS_MS[attempts - 1];
        db.prepare('UPDATE email_queue SET attempts = ?, next_attempt_at = ?, tried_at = ?, last_error = ? WHERE id = ?').run(attempts, next, new Date(now).toISOString(), msg, mail.id);
        stats.retried++;
      }
    }
  }
  return stats;
}

// Chữ ký HMAC dùng cho cổng thanh toán thử nghiệm và cho kiểm thử.
export function signPayload(secret, parts) {
  return createHmac('sha256', secret).update(parts.join('|')).digest('hex');
}
