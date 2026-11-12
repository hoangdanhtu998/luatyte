// Cài đặt một lần: kiểm tra Node, cài phụ thuộc, cài Chromium, tạo thư mục dữ liệu,
// rồi chạy bộ test để có kết quả thật. Dùng: npm run setup
import { execSync, spawn } from 'node:child_process';
import { mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MIN_NODE = 20;
const run = (cmd) => execSync(cmd, { cwd: root, stdio: 'inherit' });

const major = Number(process.versions.node.split('.')[0]);
if (major < MIN_NODE) {
  console.error(`Cần Node.js ${MIN_NODE} trở lên, đang có ${process.versions.node}`);
  process.exit(1);
}

console.log('1/4 Cài phụ thuộc (npm ci hoặc npm install)');
run(existsSync(path.join(root, 'package-lock.json')) ? 'npm ci' : 'npm install');

console.log('2/4 Cài Chromium cho Playwright');
run('npx playwright install chromium');

console.log('3/4 Tạo thư mục dữ liệu và kết quả');
for (const dir of ['data/runtime', 'results', 'playwright-report']) {
  mkdirSync(path.join(root, dir), { recursive: true });
}

console.log('4/4 Chạy bộ test để có kết quả thật');
try {
  run('npx playwright test');
  console.log('Setup xong: bộ test đã chạy.');
} catch {
  console.log('Setup xong nhưng có test lỗi. Xem báo cáo trong trang Tổng kết.');
}

console.log('Khởi động app: npm start  (tự chạy test theo lịch: npm run start:auto)');
