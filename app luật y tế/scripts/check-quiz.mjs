// Kiểm tra cấu trúc các file quiz: mỗi câu có nội dung, ít nhất 2 lựa chọn,
// đáp án (a) là chỉ số hợp lệ trong danh sách lựa chọn (o), và id không trùng.
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const DATA = join(dirname(fileURLToPath(import.meta.url)), '..', 'data');
const problems = [];
let total = 0;

for (const file of readdirSync(DATA).filter((f) => /^quiz.*\.json$/.test(f))) {
  const items = JSON.parse(readFileSync(join(DATA, file), 'utf8'));
  const seen = new Set();
  items.forEach((it, i) => {
    total++;
    const where = `${file}[${i}]${it.id ? ` (${it.id})` : ''}`;
    if (!it.q || !String(it.q).trim()) problems.push(`${where}: thiếu nội dung câu hỏi`);
    if (!Array.isArray(it.o) || it.o.length < 2) problems.push(`${where}: cần ít nhất 2 lựa chọn`);
    if (it.a !== undefined && (!Number.isInteger(it.a) || it.a < 0 || it.a >= (it.o || []).length)) {
      problems.push(`${where}: đáp án a=${it.a} không hợp lệ với ${(it.o || []).length} lựa chọn`);
    }
    if (it.id) {
      if (seen.has(it.id)) problems.push(`${where}: id bị trùng`);
      seen.add(it.id);
    }
  });
}

console.log(`Đã kiểm tra ${total} câu hỏi.`);
if (problems.length) {
  console.log(problems.join('\n'));
  process.exit(1);
}
console.log('Không có lỗi cấu trúc.');
