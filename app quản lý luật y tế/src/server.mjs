// Khởi động máy chủ quản lý. Biến môi trường:
//   PORT (3200), DB_PATH (./data/quan-ly.db), ALLOW_REGISTRATION (true)
//   SETTINGS_KEY (64 ký tự hex, bắt buộc để lưu mật khẩu SMTP)
//   PAYMENT_SECRET (ít nhất 16 ký tự, bật cổng thanh toán thử nghiệm)
//   ALLOWED_ORIGINS (các origin trình duyệt được gọi API, cách nhau bằng dấu phẩy)
//   BACKUP_DIR (./data/backups), FX_VND_PER_USD (26000)
// Việc chạy nền: hàng đợi email mỗi 10 phút; nhắc gia hạn lúc 8:00; sao lưu lúc 2:00 (giờ máy chủ).
import { createServer } from 'node:http';
import { appendFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { openDb } from './db.mjs';
import { createApp } from './app.mjs';
import { parseKey } from './crypto.mjs';
import { processQueue } from './mail.mjs';
import { runRenewalReminders } from './billing.mjs';
import { createBackup } from './phase567.mjs';

const PORT = Number(process.env.PORT || 3200);
const DB_PATH = process.env.DB_PATH || './data/quan-ly.db';
const BACKUP_DIR = process.env.BACKUP_DIR || './data/backups';
const OUTBOX = `${dirname(DB_PATH)}/outbox.log`;

const db = openDb(DB_PATH);
const cryptoKey = process.env.SETTINGS_KEY ? parseKey(process.env.SETTINGS_KEY) : null;

// Chưa có SMTP thật: thư được ghi vào outbox để kiểm tra. Đây không phải gửi thư thật.
mkdirSync(dirname(OUTBOX), { recursive: true });
const sendEmail = async (to, subject, body) => {
  appendFileSync(OUTBOX, JSON.stringify({ at: new Date().toISOString(), to, subject, body }) + '\n', 'utf8');
};
sendEmail.mode = 'outbox';

const handler = createApp({
  db,
  trustProxy: process.env.TRUST_PROXY === 'true',
  allowRegistration: process.env.ALLOW_REGISTRATION !== 'false',
  paymentSecret: process.env.PAYMENT_SECRET || '',
  cryptoKey,
  sendEmail,
  allowedOrigins: (process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean),
  backupDir: BACKUP_DIR,
  fxVndPerUsd: Number(process.env.FX_VND_PER_USD || 26000),
});

// Việc chạy nền
let lastDay = { reminder: '', backup: '' };
setInterval(async () => {
  try { await processQueue(db, Date.now(), sendEmail); } catch (e) { console.error('hàng đợi email lỗi:', e.message); }
  const d = new Date();
  const day = d.toISOString().slice(0, 10);
  if (d.getHours() === 8 && lastDay.reminder !== day) { lastDay.reminder = day; runRenewalReminders(db, Date.now()); }
  if (d.getHours() === 2 && lastDay.backup !== day) {
    lastDay.backup = day;
    try { createBackup(db, BACKUP_DIR, Date.now()); } catch (e) { console.error('sao lưu lỗi:', e.message); }
  }
}, 10 * 60 * 1000);

createServer(handler).listen(PORT, () => {
  console.log(`Ứng dụng quản lý đang chạy tại http://localhost:${PORT}`);
  if (!cryptoKey) console.log('Cảnh báo: chưa có SETTINGS_KEY, không lưu được mật khẩu SMTP.');
});
