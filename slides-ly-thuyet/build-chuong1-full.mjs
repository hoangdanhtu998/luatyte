// Tạo bộ slide đầy đủ chương 1: phần tường thuật (chuong1-v2.md) + chi tiết từng điều luật lấy từ bai-giang.json.
import { readFile, writeFile } from 'node:fs/promises';

const base = await readFile('chuong1-v2.md', 'utf8');
const lessons = JSON.parse(await readFile('../data/bai-giang.json', 'utf8'));
const CH1 = ['kcb', 'bhyt', 'tt21_2023', 'tt22_2023'];
const IMG = { kcb: 'kham.png', bhyt: 'bhyt.png', tt21_2023: 'benhvien.png', tt22_2023: 'thanhtoan.png' };
const SRC = {
  kcb: 'Luật Khám bệnh, chữa bệnh số 15/2023/QH15',
  bhyt: 'Luật Bảo hiểm y tế (sửa đổi 2024), số 51/2024/QH15',
  tt21_2023: 'Thông tư 21/2023/TT-BYT',
  tt22_2023: 'Thông tư 22/2023/TT-BYT',
};
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
// Làm nổi số điều, khoản, mẫu, số ngày/lần/%, và từ khóa
const emph = t => esc(t).replace(/(Điều \d+[a-z]?|khoản \d+|Mẫu \d+[–-]?\d*|Phụ lục [IVXLC]+|\d+\s?(?:ngày|lần|%|tuổi|năm)|\b(?:phải|không|chỉ)\b)/gi, '<mark>$1</mark>');

const parts = [base.trimEnd()];
parts.push(`---
layout: center
class: ch1
---

<div class="kicker">Phụ lục · Chi tiết từng luật trong chương 1</div>

# Bốn văn bản, đầy đủ từng điều

<div class="sub">Khám chữa bệnh · Bảo hiểm y tế · Mức giá khám chữa bệnh · Khung giá dịch vụ</div>

<!--
Phần này trình bày đầy đủ nội dung từng văn bản trong chương, để người học tra lại khi cần.
-->`);

for (const id of CH1) {
  const l = lessons.find(x => x.id === id);
  if (!l) continue;
  const pts = l.slides.slice(1);
  parts.push(`---
layout: default
class: ch1
---

<div class="cover-grid">
  <div>
    <div class="kicker">Nguồn: ${esc(SRC[id])}</div>
    <h1>${esc(l.title)}</h1>
    <div class="sub">${pts.length} ý chính</div>
  </div>
  ${IMG[id] ? `<div class="cover-icon"><img class="cover-img" src="/img/${IMG[id]}" alt="" /></div>` : ''}
</div>

<!--
Mở đầu nội dung của ${esc(l.title)}. Các ý tiếp theo đi theo thứ tự trong văn bản.
-->`);
  pts.forEach((s, i) => {
    parts.push(`---
layout: default
class: point ch1
---

<div class="point-head">
  <div class="num">${String(i + 1).padStart(2, '0')}</div>
  <div class="point-meta">
    <div class="kicker">${esc(l.title)}</div>
    <div class="step">Ý ${i + 1} / ${pts.length} · Nguồn: ${esc(SRC[id])}</div>
  </div>
</div>

<div class="point-text">${emph(s.text)}</div>

<audio controls preload="none" src="audio/bai-giang/${s.audio.split('/').pop()}"></audio>

<!--
${esc(s.text)}
-->`);
  });
}

parts.push(`---
layout: center
class: lesson-cover ch1
---

# Tổng kết chương 1

<div class="sub">Bốn văn bản · Ca thực tế · Mức hưởng BHYT · Nguồn đầy đủ trong từng slide</div>

<!--
Kết thúc chương 1. Người học có thể quay lại các slide nguồn để đối chiếu.
-->
`);

await writeFile('chuong1-day-du.md', parts.join('\n\n'));
console.log('slides:', parts.length);
