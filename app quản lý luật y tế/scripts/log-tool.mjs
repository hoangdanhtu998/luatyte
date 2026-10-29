// Ghi một lần sử dụng công cụ vào sổ: node scripts/log-tool.mjs <id-công-cụ> [ghi-chú]
// Dùng trong các script làm bài giảng để số lần dùng tự cập nhật.
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { openDb } from '../src/db.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const id = process.argv[2];
if (!id) { console.error('Cách dùng: node scripts/log-tool.mjs <id-công-cụ> [ghi-chú]'); process.exit(2); }
const db = openDb(process.env.DB_PATH || join(ROOT, 'data', 'quan-ly.db'));
const row = db.prepare('SELECT id, uses FROM tool_registry WHERE id = ?').get(id);
if (!row) { console.error('Không có công cụ "' + id + '" trong sổ.'); process.exit(1); }
db.prepare('UPDATE tool_registry SET uses = uses + 1, last_used = ? WHERE id = ?').run(Date.now(), id);
console.log(id + ': đã ghi, tổng ' + (row.uses + 1) + ' lần.');
