// Kiểm tra bảo mật tự động, chỉ đọc, không dùng AI: gọi các route và ghi báo cáo vào data/security-reports/.
// Chạy: node scripts/security-smoke.mjs   (thoát mã 0 nếu không có lỗi, 1 nếu có lỗi, 2 nếu server tắt)
import { mkdirSync, writeFileSync, readdirSync, readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const base = process.env.ADMIN_URL || 'http://localhost:3200';
const reportDir = join(root, 'data', 'security-reports');
mkdirSync(reportDir, { recursive: true });

const results = [];
const check = (name, ok, detail) => results.push({ name, ok, detail });

try {
  await fetch(base + '/api/plans', { signal: AbortSignal.timeout(5000) });
} catch (e) {
  console.log('Server không truy cập được, bỏ qua lượt này.');
  process.exit(2);
}

// 1. Các route quản trị phải chặn khi chưa đăng nhập
for (const p of ['/api/admin/users', '/api/admin/overview', '/api/admin/audit-logs', '/api/admin/backups', '/api/admin/costs']) {
  const r = await fetch(base + p);
  check(`route admin chặn khi chưa đăng nhập: ${p}`, r.status === 401, `HTTP ${r.status}`);
}

// 2. Ghi không có CSRF token phải bị chặn
const w = await fetch(base + '/api/admin/plans', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' });
check('yêu cầu ghi không đăng nhập bị chặn', w.status === 401 || w.status === 403, `HTTP ${w.status}`);

// 4. CORS: origin lạ không được nhận header cho phép
const cors = await fetch(base + '/api/plans', { headers: { origin: 'https://evil.example' } });
check('CORS không cho origin lạ', !cors.headers.get('access-control-allow-origin'), cors.headers.get('access-control-allow-origin') || 'không có header');

// 5. Header bảo mật trên trang chính (ghi nhận, chưa phải lỗi nghiêm trọng)
const home = await fetch(base + '/');
for (const h of ['x-content-type-options', 'x-frame-options', 'content-security-policy', 'referrer-policy']) {
  check(`có header ${h}`, home.headers.has(h), home.headers.get(h) || 'thiếu');
}

// 6. Lỗi không được lộ stack trace (dùng route không phải đăng nhập, để không làm đầy bộ đếm đăng nhập)
const bad = await fetch(base + '/api/admin/plans', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{not json' });
const txt = await bad.text();
check('lỗi không lộ stack trace', !/at .*\(.*\.mjs:\d+/.test(txt) && !txt.includes('node:internal'), `HTTP ${bad.status}`);

const failed = results.filter(r => !r.ok);
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const lines = [
  `# Báo cáo kiểm tra bảo mật tự động`,
  `Thời điểm: ${new Date().toISOString()}`,
  `Địa chỉ: ${base}`,
  `Kết quả: ${results.length - failed.length}/${results.length} đạt`,
  '',
  ...results.map(r => `- [${r.ok ? 'ĐẠT' : 'CHƯA ĐẠT'}] ${r.name} (${r.detail})`),
  '',
];
const file = join(reportDir, `security-${stamp}.md`);
writeFileSync(file, lines.join('\n'), 'utf8');

// Giữ 30 báo cáo gần nhất
const all = readdirSync(reportDir).filter(n => n.startsWith('security-')).sort();
for (const old of all.slice(0, Math.max(0, all.length - 30))) {
  try { (await import('node:fs')).unlinkSync(join(reportDir, old)); } catch {}
}

console.log(`Đã ghi báo cáo: ${file}`);
console.log(`Đạt ${results.length - failed.length}/${results.length}`);
if (failed.length) { console.log('Chưa đạt: ' + failed.map(f => f.name).join('; ')); process.exit(1); }
process.exit(0);
