// Sinh slide cho "Lý thuyết luật y tế" từ data/ly_thuyet.json: data/slides/ly-thuyet.json.
// Mỗi chương: một slide mở đầu (mục tiêu), mỗi bước: slide khái niệm (chia nhỏ theo câu), slide ví dụ, slide hay nhầm,
// và cuối chương là câu ôn nhanh dạng tự luận có đáp án mẫu.
// Chạy: node scripts/build-ly-thuyet.mjs
import { readFile, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const data = JSON.parse(await readFile(join(ROOT, 'data/ly_thuyet.json'), 'utf8'));

const MAX_SENT = 3; // số câu tối đa trên một slide khái niệm

// Tách câu theo dấu chấm, giữ nguyên nội dung
function sentences(text) {
  return text
    .split(/(?<=[.!?])\s+(?=[A-ZĐÂÊÔƠƯ0-9«"(])/u)
    .map((s) => s.trim())
    .filter(Boolean);
}

function chunk(list, n) {
  const out = [];
  for (let i = 0; i < list.length; i += n) out.push(list.slice(i, i + n));
  return out;
}

const slides = [];

for (const c of data.chuong) {
  slides.push({ type: 'text', title: c.ten, body: [c.muc_tieu].filter(Boolean) });

  for (const b of c.buoc) {
    const parts = chunk(sentences(b.giai_thich || ''), MAX_SENT);
    parts.forEach((body, k) => {
      slides.push({
        type: 'text',
        title: k === 0 ? b.tieu_de : b.tieu_de + ' (tiếp)',
        body,
      });
    });
    if (b.vi_du) slides.push({ type: 'text', title: 'Ví dụ: ' + b.tieu_de, body: [b.vi_du] });
    if (b.hay_nham) slides.push({ type: 'text', title: 'Hay nhầm: ' + b.tieu_de, body: [b.hay_nham] });
  }

  (c.on_nhanh || []).forEach((q) => {
    slides.push({ type: 'essay', q: q.hoi, model: q.dap });
  });
}

const out = {
  title: data.meta?.ten || 'Lý thuyết luật y tế theo trình tự học',
  slides,
};
await writeFile(join(ROOT, 'data/slides/ly-thuyet.json'), JSON.stringify(out, null, 2) + '\n', 'utf8');
console.log('chương:', data.chuong.length, 'slide:', slides.length);
