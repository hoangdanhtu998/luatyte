// Tạo slides.md từ bài giảng đã có (data/bai-giang.json).
// Cấu trúc: mở đầu -> từng chương (mở chương, các bài, điều cần nhớ) -> tổng kết.
import { readFile, writeFile } from 'node:fs/promises';

const lessons = JSON.parse(await readFile('../data/bai-giang.json', 'utf8'));
const byId = Object.fromEntries(lessons.map(l => [l.id, l]));
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Làm nổi các chi tiết cần nhớ: số điều, khoản, mẫu, số ngày/lần/%, và từ khóa "phải", "không", "chỉ"
const emphasize = text => esc(text).replace(
  /(Điều \d+[a-z]?|khoản \d+|Mẫu \d+[–-]?\d*|Phụ lục [IVXLC]+|\d+\s?(?:ngày|lần|%|tuổi)|\b(?:phải|không|chỉ)\b)/gi,
  '<mark>$1</mark>'
);
// Con số nổi bật nhất của một ý (ví dụ 45 ngày), hiện thành thẻ số lớn
const statOf = text => {
  const m = String(text).match(/(\d+)\s?(ngày|lần|%|tuổi)/);
  return m ? { n: m[1], u: m[2] } : null;
};

// Chương: gom các bài theo mảng nội dung (id bài theo bai-giang.json)
const CHAPTERS = [
  { title: 'Khám chữa bệnh và bảo hiểm y tế', goal: 'Hiểu cách khám chữa bệnh được tổ chức và cách bảo hiểm y tế chi trả.', ids: ['kcb', 'bhyt', 'tt21_2023', 'tt22_2023'] },
  { title: 'Dược và kê đơn', goal: 'Nắm quy định về đơn thuốc, kê đơn và thanh toán thuốc.', ids: ['duoc', 'donthuoc', 'tt26_2025', 'tt22_2024'] },
  { title: 'Trang thiết bị và phòng thí nghiệm', goal: 'Biết quản lý trang thiết bị y tế và điều kiện thử nghiệm.', ids: ['tbyt', 'tt44_2025', 'tt36_2025'] },
  { title: 'Hồ sơ, dữ liệu và nhân lực', goal: 'Hiểu hồ sơ khám sức khỏe, dữ liệu y tế và cấp giấy hành nghề.', ids: ['dulieu', 'tt25_2026', 'tt49_2025'] },
  { title: 'Phòng bệnh và sức khỏe cộng đồng', goal: 'Nắm các luật phòng bệnh, dân số, phòng chống tác hại và an toàn thực phẩm.', ids: ['phongbenh', 'danso', 'thuocla', 'ruoubia', 'attp', 'hiv', 'ghepmo'] },
];

// Biểu tượng theo chủ đề (bộ mdi có sẵn trong @iconify-json/mdi)
const ICONS = [
  [/bảo hiểm|bhyt/i, 'shield-check'],
  [/khám bệnh|chữa bệnh|kcb|bệnh viện|khám sức khỏe/i, 'hospital-building'],
  [/dược|đơn thuốc|kê đơn|nhà thuốc/i, 'pill'],
  [/thanh toán|giá|chi phí|cash/i, 'cash-multiple'],
  [/hồ sơ|bệnh án|dữ liệu|sổ sức khỏe|điện tử/i, 'file-document-outline'],
  [/thuốc lá/i, 'smoking-off'],
  [/rượu|bia/i, 'glass-wine'],
  [/an toàn thực phẩm/i, 'food-apple'],
  [/hiv|aids/i, 'ribbon'],
  [/dân số/i, 'human-male-female-child'],
  [/phòng bệnh|truyền nhiễm|tiêm chủng/i, 'virus'],
  [/ghép|hiến|mô/i, 'hand-heart'],
  [/trang thiết bị|tbyt/i, 'medical-bag'],
  [/thử nghiệm|phòng thí nghiệm/i, 'flask-outline'],
  [/giấy chứng nhận|lương y|cấp phép|hành nghề/i, 'certificate-outline'],
];
// Ảnh minh họa cho từng bài (tạo bằng công cụ ảnh AI, phong cách phẳng)
const IMG = { tt36_2025: 'lab.png', tt25_2026: 'kham.png', tt26_2025: 'donthuoc.png', tt22_2024: 'nhathuoc.png', tt22_2023: 'thanhtoan.png', tt21_2023: 'benhvien.png', bhyt: 'bhyt.png', tt49_2025: 'luongy.png', tt44_2025: 'thietbi.png' };

// Nguồn của từng bài: số hiệu, năm ban hành (lấy từ dữ liệu bài giảng; ô nào chưa rõ được ghi "cần bổ sung")
const SRC = {
  tt36_2025: 'Thông tư 36/2025/TT-BYT',
  tt25_2026: 'Thông tư 25/2026/TT-BYT',
  tt26_2025: 'Thông tư 26/2025/TT-BYT',
  tt22_2024: 'Thông tư 22/2024/TT-BYT',
  tt22_2023: 'Thông tư 22/2023/TT-BYT',
  tt21_2023: 'Thông tư 21/2023/TT-BYT',
  tt49_2025: 'Thông tư 49/2025/TT-BYT',
  tt44_2025: 'Thông tư 44/2025/TT-BYT',
  dulieu: 'Nghị định 102/2025/NĐ-CP',
  kcb: 'Luật Khám bệnh, chữa bệnh số 15/2023/QH15',
  bhyt: 'Luật Bảo hiểm y tế (sửa đổi 2024), số 51/2024/QH15',
  duoc: 'Luật Dược (sửa đổi 2024), số hiệu cần bổ sung',
  phongbenh: 'Luật Phòng bệnh, số hiệu và năm cần bổ sung',
  danso: 'Luật Dân số 113/2025',
  thuocla: 'Luật Phòng, chống tác hại của thuốc lá, số hiệu và năm cần bổ sung',
  ruoubia: 'Luật Phòng, chống tác hại của rượu, bia, số hiệu và năm cần bổ sung',
  attp: 'Luật An toàn thực phẩm, số hiệu và năm cần bổ sung',
  hiv: 'Luật Phòng, chống HIV/AIDS, số hiệu và năm cần bổ sung',
  ghepmo: 'Luật Hiến, lấy, ghép mô, bộ phận cơ thể người và hiến, lấy xác, số hiệu và năm cần bổ sung',
  donthuoc: 'Thông tư 52/2017/TT-BYT',
  tbyt: 'Nghị định 98/2021/NĐ-CP',
};
const srcOf = id => SRC[id] || 'Nguồn cần bổ sung';
const iconOf = l => {
  const text = (l.id || '') + ' ' + (l.title || '');
  const hit = ICONS.find(([re]) => re.test(text));
  return hit ? hit[1] : 'bookshelf';
};
// Biểu tượng viết thành thẻ Vue của Slidev: <mdi-shield-check />
const icon = (name, cls) => `<mdi-${name} class="${cls}" />`;
const slide = (layout, cls, body) => `---\nlayout: ${layout}\nclass: ${cls}\n---\n\n${body}\n`;

const parts = [];

// 1. Mở đầu
parts.push(`---
layout: cover
---

<div class="cover-art">
${icon('hospital-building', 'art-main')}
</div>

# Bài giảng luật y tế

${CHAPTERS.length} chương · ${lessons.length} bài · có giọng đọc tiếng Việt

<div class="hint">Nhấn phím → để sang slide tiếp theo</div>
`);

parts.push(slide('center', 'lesson-cover', `<div class="kicker">Mục tiêu</div>

# Bạn sẽ học được gì

<div class="point-text">Các điều luật, thông tư về khám chữa bệnh, dược, trang thiết bị, hồ sơ và sức khỏe cộng đồng — và những điều cần nhớ sau mỗi chương.</div>`));

// 2. Từng chương
CHAPTERS.forEach((ch, ci) => {
  const chLessons = ch.ids.map(id => byId[id]).filter(Boolean);
  const points = chLessons.reduce((n, l) => n + (l.slides.length - 1), 0);

  // Mở chương
  parts.push(slide('center', `chapter-cover ch${ci + 1}`, `<div class="kicker">Chương ${ci + 1} / ${CHAPTERS.length}</div>

# ${esc(ch.title)}

<div class="sub">${esc(ch.goal)}</div>

<div class="sub">${chLessons.length} bài · ${points} ý chính</div>`));

  // Các bài trong chương
  chLessons.forEach((l, li) => {
    const ic = iconOf(l);
    parts.push(slide('center', `lesson-cover ch${ci + 1}`, `<div class="cover-grid">
  <div>
    <div class="kicker">Chương ${ci + 1} · Bài ${li + 1} / ${chLessons.length} · Nguồn: ${esc(srcOf(l.id))}</div>
    <h1>${esc(l.title)}</h1>
  </div>
  <div class="cover-icon">${IMG[l.id] ? `<img class="cover-img" src="/img/${IMG[l.id]}" alt="" />` : icon(ic, 'big')}</div>
</div>`));

    l.slides.slice(1).forEach((s, i) => {
      const n = String(i + 1).padStart(2, '0');
      const st = statOf(s.text);
      parts.push(slide('default', `point ch${ci + 1}`, `<div class="point-head">
  <div class="num">${n}</div>
  <div class="point-meta">
    <div class="kicker">${esc(l.title)}</div>
    <div class="step">Ý ${i + 1} / ${l.slides.length - 1} · ${esc(srcOf(l.id))}</div>
  </div>
  <div class="point-icon">${icon(ic, 'sm')}</div>
</div>

<div class="point-grid${st ? ' has-stat' : ''}">
  <div class="point-text">${emphasize(s.text)}</div>
  ${st ? `<div class="stat-card"><div class="stat-n">${st.n}</div><div class="stat-u">${st.u}</div></div>` : ''}
</div>

<audio controls preload="none" src="${s.audio}"></audio>`));
    });
  });

  // Điều cần nhớ của chương: ý đầu tiên của mỗi bài
  const keys = chLessons.map(l => ({ t: l.title, s: l.slides[1] ? l.slides[1].text : '' }));
  parts.push(slide('default', `recap ch${ci + 1}`, `<div class="kicker">Chương ${ci + 1} · Điều cần nhớ</div>

<ul class="recap-list">
${keys.map(k => `  <li><b>${esc(k.t)}</b><span>${emphasize(k.s)}</span></li>`).join('\n')}
</ul>`));
});

// 3. Tổng kết
parts.push(slide('center', 'lesson-cover', `<div class="kicker">Tổng kết</div>

# Đã học xong ${CHAPTERS.length} chương

<div class="sub">Ôn lại từng chương bằng slide "Điều cần nhớ", hoặc quay lại đầu để nghe lại từng ý.</div>`));

await writeFile('slides.md', parts.join('\n'));
console.log('slides:', parts.length);

// Ghi nhật ký dùng công cụ vào sổ quản trị (không làm lỗi script nếu sổ chưa sẵn sàng)
import { execFileSync as __ex } from "node:child_process";
import { fileURLToPath } from "node:url";
const __logTool = (id) => { try { __ex(process.execPath, [fileURLToPath(new URL("../../app quản lý luật y tế/scripts/log-tool.mjs", import.meta.url)), id], { stdio: "ignore" }); } catch (e) {} };

__logTool('slidev');
__logTool('iconify-mdi');
