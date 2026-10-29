// Lệnh quản trị chạy từ dòng lệnh.
//   ADMIN_PASSWORD='...' npm run create-admin -- email@vidu.com
//   npm run restore -- data/backups/quan-ly-2026-10-29.db --yes
import { openDb } from './db.mjs';
import { hashPassword } from './auth.mjs';
import { restoreBackup, RestoreError } from './restore.mjs';

const [command, ...args] = process.argv.slice(2);
const DB_PATH = process.env.DB_PATH || './data/quan-ly.db';
const USAGE = [
  "Cách dùng:",
  "  ADMIN_PASSWORD='...' npm run create-admin -- email@vidu.com",
  '  npm run restore -- <file-sao-luu.db> --yes   (dừng máy chủ trước khi khôi phục)',
].join('\n');

if (command === 'create-admin') {
  const email = args[0];
  if (!email) {
    console.error(USAGE);
    process.exit(1);
  }
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    console.error('Thiếu biến môi trường ADMIN_PASSWORD.');
    process.exit(1);
  }
  const db = openDb(DB_PATH);
  const e = email.trim().toLowerCase();
  if (db.prepare('SELECT id FROM users WHERE email = ?').get(e)) {
    console.error('Email đã có tài khoản.');
    process.exit(1);
  }
  db.prepare('INSERT INTO users (email, password_hash, role, status, created_at) VALUES (?, ?, ?, ?, ?)')
    .run(e, hashPassword(password), 'admin', 'active', new Date().toISOString());
  console.log(`Đã tạo admin ${e}. Đăng nhập rồi bật xác minh hai lớp trước khi dùng các chức năng quản trị.`);
} else if (command === 'restore') {
  const file = args.find(a => !a.startsWith('--'));
  const yes = args.includes('--yes');
  if (!file) {
    console.error(USAGE);
    process.exit(1);
  }
  try {
    const r = restoreBackup({ file, dbPath: DB_PATH, yes });
    console.log(`Đã khôi phục ${r.restored} từ ${r.source}.`);
    if (r.safety) console.log(`Bản an toàn của DB cũ: ${r.safety}`);
    console.log('Khởi động lại máy chủ để dùng dữ liệu mới.');
  } catch (e) {
    if (e instanceof RestoreError) console.error(`Không khôi phục được: ${e.message}`);
    else console.error(e && e.message ? e.message : e);
    process.exit(1);
  }
} else {
  console.error(USAGE);
  process.exit(1);
}
