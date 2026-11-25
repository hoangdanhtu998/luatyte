// Đặt phiên bản cache của sw.js theo hash nội dung các file trong CORE.
// Dùng: node scripts/bump-sw.mjs          (ghi phiên bản mới nếu tài nguyên đổi)
//       node scripts/bump-sw.mjs --check  (chỉ báo lỗi nếu phiên bản đang lệch)
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const APP = join(dirname(fileURLToPath(import.meta.url)), '..', 'app luật y tế');
const SW = join(APP, 'sw.js');
const check = process.argv.includes('--check');

const src = readFileSync(SW, 'utf8');
const core = src.match(/const CORE = \[([\s\S]*?)\];/);
if (!core) throw new Error('không tìm thấy mảng CORE trong sw.js');
const files = [...core[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]).filter((f) => f !== './');

const hash = createHash('sha1');
const missing = [];
for (const f of files) {
  const p = join(APP, f);
  if (!existsSync(p)) { missing.push(f); continue; }
  hash.update(f).update(readFileSync(p));
}
if (missing.length) console.log(`Bỏ qua file không tồn tại: ${missing.join(', ')}`);

const version = `lyt-${hash.digest('hex').slice(0, 8)}`;
const current = src.match(/const V = "([^"]+)";/)?.[1];
if (current === version) {
  console.log(`Phiên bản cache đã đúng: ${version}`);
  process.exit(0);
}
if (check) {
  console.error(`Phiên bản lệch: đang ${current}, cần ${version}. Chạy: node scripts/bump-sw.mjs`);
  process.exit(1);
}
writeFileSync(SW, src.replace(/const V = "[^"]+";/, `const V = "${version}";`), 'utf8');
console.log(`Đã cập nhật phiên bản cache: ${current} → ${version}`);
