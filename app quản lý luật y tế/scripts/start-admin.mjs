// Chạy server quản lý liên tục: tạo khóa bí mật một lần, rồi tự khởi động lại nếu server dừng.
// Chạy: node scripts/start-admin.mjs
// Khóa được lưu trong data/secrets.env (không đưa lên git). Đổi khóa sẽ làm mất khả năng giải mã dữ liệu đã mã hóa.
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync, appendFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = join(root, 'data');
const secretsFile = join(dataDir, 'secrets.env');
const logFile = join(dataDir, 'server.log');
mkdirSync(dataDir, { recursive: true });

if (!existsSync(secretsFile)) {
  const body = [
    `SETTINGS_KEY=${randomBytes(32).toString('hex')}`,
    `PAYMENT_SECRET=${randomBytes(24).toString('hex')}`,
    '',
  ].join('\n');
  writeFileSync(secretsFile, body, { encoding: 'utf8', mode: 0o600 });
  console.log('Đã tạo data/secrets.env (khóa bí mật, không chia sẻ).');
}

const secrets = Object.fromEntries(
  readFileSync(secretsFile, 'utf8').split(/\r?\n/).filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; }),
);

const env = {
  ...process.env,
  PORT: process.env.PORT || '3200',
  DB_PATH: join(dataDir, 'quan-ly.db'),
  BACKUP_DIR: join(dataDir, 'backups'),
  SETTINGS_KEY: secrets.SETTINGS_KEY,
  PAYMENT_SECRET: secrets.PAYMENT_SECRET,
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS || '',
  // App học đi qua proxy nội bộ, nên đọc IP người dùng từ X-Forwarded-For do app gửi.
  TRUST_PROXY: process.env.TRUST_PROXY || 'true',
};

// Nếu cổng đã có server đang chạy (bản khác của trình giám sát), thoát để tránh chạy trùng.
try {
  await fetch(`http://localhost:${env.PORT}/api/plans`, { signal: AbortSignal.timeout(2000) });
  console.log(`Cổng ${env.PORT} đã có server đang chạy, không khởi động thêm.`);
  process.exit(0);
} catch { /* cổng trống, tiếp tục */ }

let delay = 2000;
function start() {
  const started = Date.now();
  appendFileSync(logFile, `\n[${new Date().toISOString()}] khởi động server\n`);
  const child = spawn(process.execPath, [join(root, 'src', 'server.mjs')], { env, cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
  child.stdout.on('data', d => appendFileSync(logFile, d));
  child.stderr.on('data', d => appendFileSync(logFile, d));
  child.on('exit', code => {
    appendFileSync(logFile, `[${new Date().toISOString()}] server dừng (mã ${code}), khởi động lại sau ${delay / 1000}s\n`);
    // Chạy ổn định trên 1 phút thì reset độ trễ; nếu dừng nhanh liên tục thì tăng dần, tối đa 60s.
    delay = Date.now() - started > 60000 ? 2000 : Math.min(delay * 2, 60000);
    setTimeout(start, delay);
  });
}
start();
