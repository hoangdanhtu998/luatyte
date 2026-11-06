// Sinh bài Đạo đức từ docs/dao-duc/dao-duc-hoc.md: trang dao-duc.html (phần đọc + trắc nghiệm)
// và data/slides/dao-duc.json (slide có trắc nghiệm, điền chỗ trống, tự luận có đáp án mẫu).
// Chạy: node scripts/build-dao-duc.mjs   (sau đó: node scripts/make-slide-audio.mjs dao-duc để tạo giọng đọc)
import { readFile, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const md = await readFile(join(ROOT, 'docs/dao-duc/dao-duc-hoc.md'), 'utf8');

// Trắc nghiệm: mỗi câu gắn với một phần; đáp án là chỉ số bắt đầu từ 0.
const QUIZ = [
  { part: 1, q: 'Đạo đức khác pháp luật ở điểm nào?', o: ['Đạo đức có chế tài cưỡng chế, pháp luật thì không.', 'Pháp luật do nhà nước ban hành có chế tài cưỡng chế; đạo đức dựa nhiều vào lương tâm và dư luận.', 'Hai khái niệm này giống hệt nhau.', 'Đạo đức chỉ liên quan đến tôn giáo.'], a: 1, fb: 'Pháp luật có chế tài cưỡng chế, còn đạo đức dựa phần lớn vào lương tâm và sự tự nguyện (Phần 1).' },
  { part: 2, q: 'Cách tiếp cận nào đánh giá hành động dựa trên hậu quả?', o: ['Nghĩa vụ', 'Đức hạnh', 'Vị lợi', 'Phong tục'], a: 2, fb: 'Vị lợi cho rằng hành động đúng là hành động đem lại nhiều lợi ích và ít tổn hại nhất (Phần 2).' },
  { part: 2, q: 'Theo Kant, vì sao không nên nói dối bệnh nhân về tình trạng bệnh để "giữ tinh thần"?', o: ['Vì pháp luật cấm.', 'Vì điều đó không thể trở thành nguyên tắc chung, và coi người khác như phương tiện.', 'Vì sẽ mất tiền khám.', 'Vì bệnh nhân luôn đoán ra.'], a: 1, fb: 'Nguyên tắc nghĩa vụ đòi hỏi đối xử với người khác như mục đích, không chỉ là phương tiện (Phần 2).' },
  { part: 4, q: 'Bộ quy tắc nào sau Thế chiến II nhấn mạnh sự đồng ý tự nguyện của người tham gia nghiên cứu?', o: ['Lời thề Hippocrates', 'Bộ luật Nuremberg (1947)', 'Báo cáo Belmont (1979)', 'Luật Khám bệnh, chữa bệnh'], a: 1, fb: 'Bộ luật Nuremberg ra đời sau các vụ xét xử bác sĩ làm thí nghiệm trên người không có sự đồng ý (Phần 4).' },
  { part: 5, q: 'Điều nào KHÔNG thuộc bốn điều kiện của đồng ý có thông tin?', o: ['Người bệnh được cung cấp đủ thông tin cần thiết.', 'Người bệnh hiểu thông tin đó.', 'Người nhà ký thay là đủ, không cần người bệnh hiểu.', 'Người bệnh tự nguyện, không bị ép buộc.'], a: 2, fb: 'Đồng ý có thông tin cần người bệnh hiểu và tự nguyện, và người bệnh có năng lực để quyết định (Phần 5).' },
  { part: 6, q: 'Khi báo tin xấu, bước nào nên làm đầu tiên?', o: ['Đưa ngay kết quả và nêu tiên lượng.', 'Hỏi người bệnh muốn biết đến đâu và muốn ai cùng nghe.', 'Gọi người nhà đến ký giấy.', 'Chờ đến khi người bệnh hỏi.'], a: 1, fb: 'Hỏi rõ người bệnh muốn biết đến đâu là bước đầu tiên trong các bước báo tin xấu (Phần 6).' },
  { part: 7, q: 'Hành động nào là vi phạm bảo mật thông tin người bệnh?', o: ['Trao đổi hồ sơ với đồng nghiệp đang trực tiếp điều trị.', 'Chụp ảnh phiếu xét nghiệm và gửi vào nhóm chat cá nhân.', 'Ghi chép hồ sơ theo quy định của cơ sở.', 'Chia sẻ với cơ quan có thẩm quyền khi pháp luật yêu cầu.'], a: 1, fb: 'Thông tin sức khỏe chỉ được chia sẻ khi cần cho điều trị hoặc khi pháp luật yêu cầu; gửi ảnh qua kênh cá nhân là vi phạm (Phần 7).' },
  { part: 8, q: 'Vì sao chỉ có xung đột lợi ích tiềm ẩn cũng đáng lo?', o: ['Vì người ngoài không biết quyết định được đưa ra vì ai, và điều đó làm giảm niềm tin.', 'Vì người làm nghề luôn bị phạt.', 'Vì quyết định nào cũng sai.', 'Vì phải nộp thêm thuế.'], a: 0, fb: 'Niềm tin của xã hội vào nghề y dựa trên việc quyết định vì người bệnh (Phần 8).' },
  { part: 9, q: 'Khi giường thở máy không đủ, tiêu chí phân loại ưu tiên nên thế nào?', o: ['Ưu tiên người quen biết lãnh đạo.', 'Ưu tiên người có tiền.', 'Rõ ràng, nhất quán và công khai.', 'Bốc thăm ngẫu nhiên, không cần tiêu chí.'], a: 2, fb: 'Công bằng đòi hỏi tiêu chí rõ ràng, nhất quán, có thể giải thích công khai (Phần 9).' },
  { part: 10, q: 'Trong quy trình lập luận đạo đức, bước nào đứng sau "xem xét các lựa chọn"?', o: ['Mô tả sự việc', 'Quyết định và giải thích', 'Xác định giá trị', 'Kiểm tra bằng quy định'], a: 1, fb: 'Sau khi xem xét các lựa chọn và kiểm tra, bước cuối là quyết định và giải thích lý do (Phần 10).' },
  { part: 11, q: 'Bác sĩ nhận lời mời nghỉ dưỡng từ hãng thuốc sau khi kê nhiều thuốc của hãng. Cách xử lý nào phù hợp?', o: ['Nhận, vì không ảnh hưởng đến kê đơn.', 'Từ chối lợi ích không minh bạch và không để lợi ích chi phối việc kê đơn.', 'Nhận nhưng không nói với ai.', 'Nhận rồi trả lại sau.'], a: 1, fb: 'Đây là xung đột lợi ích cần từ chối lợi ích không minh bạch (Tình huống E, Phần 11).' },
  { part: 11, q: 'Người bệnh yêu cầu sao chép toàn bộ hồ sơ bệnh án. Nguyên tắc nào cần ưu tiên?', o: ['Người bệnh có quyền tiếp cận thông tin về bệnh của mình, theo quy trình của cơ sở.', 'Chỉ bác sĩ được xem hồ sơ.', 'Từ chối vì hồ sơ thuộc bệnh viện.', 'Gửi cho người khác thay người bệnh.'], a: 0, fb: 'Người bệnh có quyền tiếp cận thông tin về bệnh của mình, nhưng cần làm theo quy trình và bảo vệ thông tin của người khác trong hồ sơ (Tình huống D, Phần 11).' },
];

// Điền chỗ trống: gắn sau phần tương ứng.
const FILLS = [
  { part: 2, title: 'Điền vào chỗ trống', text: 'Ba cách tiếp cận lớn của đạo đức học là hậu quả, {1} và đức hạnh.', blanks: [{ options: ['nghĩa vụ', 'tình cảm', 'pháp luật', 'phong tục'], answer: 0 }] },
  { part: 6, title: 'Điền vào chỗ trống', text: 'Khi báo tin xấu, nên bắt đầu bằng việc {1} người bệnh muốn biết đến đâu.', blanks: [{ options: ['hỏi', 'bỏ qua', 'ép', 'giấu'], answer: 0 }] },
];

// --- phân tích markdown ---
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const plain = (s) => s.replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*(.+?)\*/g, '$1');
const inline = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>');

const blocks = md.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
const sections = []; // {title, items:[{type, ...}]}
let intro = [];
let h1 = '';
let cur = null;
for (const b of blocks) {
  if (b === '---') continue;
  if (b.startsWith('# ')) { h1 = b.slice(2).trim(); continue; }
  if (b.startsWith('## ')) { cur = { title: b.slice(3).trim(), blocks: [] }; sections.push(cur); continue; }
  if (!cur) { intro.push(b); continue; }
  cur.blocks.push(b);
}

// Chuyển một khối thành {tag, html, text}
function toBlock(b) {
  const lines = b.split('\n');
  if (lines.every((l) => /^- /.test(l))) {
    const items = lines.map((l) => l.replace(/^- /, ''));
    return { kind: 'ul', items };
  }
  if (lines.every((l) => /^\d+\. /.test(l))) {
    const items = lines.map((l) => l.replace(/^\d+\. /, ''));
    return { kind: 'ol', items };
  }
  if (/^\*Tự kiểm tra:\*/.test(b)) return { kind: 'check', text: b.replace(/^\*Tự kiểm tra:\*\s*/, '') };
  return { kind: 'p', text: lines.join(' ') };
}

// ---- HTML ----
function renderBlock(x) {
  if (x.kind === 'ul') return '<ul>' + x.items.map((i) => '<li>' + inline(i) + '</li>').join('') + '</ul>';
  if (x.kind === 'ol') return '<ol>' + x.items.map((i) => '<li>' + inline(i) + '</li>').join('') + '</ol>';
  if (x.kind === 'check') return '<p class="check">Tự kiểm tra: ' + inline(x.text) + '</p>';
  return '<p>' + inline(x.text) + '</p>';
}

const toc = [];
let body = '';
sections.forEach((sec, idx) => {
  const id = 's' + (idx + 1);
  toc.push('<li><a href="#' + id + '">' + esc(sec.title) + '</a></li>');
  body += '<hr>\n<h2 id="' + id + '">' + esc(sec.title) + '</h2>\n';
  body += sec.blocks.map(toBlock).map(renderBlock).join('\n') + '\n';
});

const quizHtml = QUIZ.map((q, i) => {
  const L = ['A', 'B', 'C', 'D'];
  return '<div class="qz-item" data-ans="' + q.a + '">\n<p class="qz-stem"><strong>Câu ' + (i + 1) + '.</strong> ' + esc(q.q) + '</p>\n<div class="opts">\n' +
    q.o.map((o, k) => '<button class="opt" type="button"><span class="k">' + L[k] + '</span><span class="tx">' + esc(o) + '</span></button>').join('\n') +
    '\n</div>\n<div class="feedback qz-fb" style="display:none"><div class="hd"></div><p><em>Giải thích:</em> ' + esc(q.fb) + '</p></div>\n</div>';
}).join('\n');

const mainHtml = '<main class="triet">\n' +
  '<p><a href="hoc.html">← Học</a></p>\n' +
  '<h1>' + esc(h1 || 'Đạo đức học và đạo đức nghề y') + '</h1>\n' +
  '<p><a class="btn" href="slides.html?lesson=dao-duc">Học dạng slide có bài tập →</a></p>\n' +
  intro.map((p) => '<p>' + inline(p) + '</p>').join('\n') + '\n' +
  '<nav class="toc" aria-label="Mục lục"><strong>Mục lục</strong><ol>' + toc.join('') + '<li><a href="#s-quiz">Trắc nghiệm kiểm tra</a></li></ol></nav>\n' +
  body +
  '<h2 id="s-quiz">Trắc nghiệm kiểm tra</h2>\n<p>Chọn đáp án, xem giải thích ngay. Cuối cùng bấm "Xem kết quả".</p>\n' + quizHtml + '\n' +
  '</main>';

const htmlPath = join(ROOT, 'dao-duc.html');
const old = await readFile(htmlPath, 'utf8');
const start = old.indexOf('<main class="triet">');
const end = old.indexOf('</main>', start);
if (start < 0 || end < 0) throw new Error('Không tìm thấy <main class="triet"> trong dao-duc.html');
await writeFile(htmlPath, old.slice(0, start) + mainHtml + old.slice(end + '</main>'.length), 'utf8');

// ---- Slide ----
const slides = [];
slides.push({ type: 'text', title: 'Giới thiệu bài Đạo đức học và đạo đức nghề y', body: intro.map(plain) });

const MAX_BODY = 4;
sections.forEach((sec) => {
  const partNo = Number((sec.title.match(/^Phần (\d+)/) || [])[1]);
  const attachQuiz = () => {
    FILLS.filter((f) => f.part === partNo).forEach((f) => slides.push({ type: 'fill', title: f.title, text: f.text, blanks: f.blanks }));
    QUIZ.filter((q) => q.part === partNo).forEach((q) => slides.push({ type: 'mcq', q: q.q, options: q.o, answer: q.a, feedback: q.fb }));
  };
  if (/^Lưu ý$/.test(sec.title)) {
    slides.push({ type: 'text', title: sec.title, body: sec.blocks.map(plain) });
    return;
  }
  if (/Tình huống thực tế/.test(sec.title)) {
    // Mỗi tình huống thành một slide tự luận có đáp án mẫu
    // Mỗi khối gồm câu hỏi (dòng đầu) và dòng "Gợi ý:" (đáp án mẫu)
    sec.blocks.forEach((b) => {
      const lines = b.split('\n');
      const gi = lines.findIndex((l) => /^\*Gợi ý:\*/.test(l));
      if (gi < 0) return;
      const q = plain(lines.slice(0, gi).join(' ')).trim();
      const model = plain(lines.slice(gi).join(' ')).replace(/^Gợi ý:\s*/, '').trim();
      slides.push({ type: 'essay', q: q + ' Hãy viết hướng xử lý của bạn.', model });
    });
    attachQuiz();
    return;
  }
  if (/Bài tập/i.test(sec.title)) {
    sec.blocks.map(toBlock).forEach((x) => {
      if (x.kind === 'ol') x.items.forEach((it) => slides.push({ type: 'text', title: sec.title + ': bài tập', body: [plain(it)] }));
      else slides.push({ type: 'text', title: sec.title, body: [plain(x.text || '')] });
    });
    attachQuiz();
    return;
  }
  // Phần lý thuyết: gom các khối thành các slide tối đa MAX_BODY mục
  const items = [];
  sec.blocks.forEach((b) => {
    const x = toBlock(b);
    if (x.kind === 'ul' || x.kind === 'ol') x.items.forEach((i) => items.push(plain(i)));
    else if (x.kind === 'check') { /* câu tự kiểm tra được chuyển thành trắc nghiệm bên dưới */ }
    else items.push(plain(x.text));
  });
  for (let i = 0; i < items.length; i += MAX_BODY) {
    const part = Math.floor(i / MAX_BODY) + 1;
    slides.push({ type: 'text', title: part > 1 ? sec.title + ' (tiếp)' : sec.title, body: items.slice(i, i + MAX_BODY) });
  }
  // trắc nghiệm và điền chỗ trống của phần này
  attachQuiz();
});

const data = { title: 'Đạo đức học và đạo đức nghề y', slides };
await writeFile(join(ROOT, 'data/slides/dao-duc.json'), JSON.stringify(data, null, 2) + '\n', 'utf8');
console.log('slides:', slides.length, 'sections:', sections.length, 'quiz:', QUIZ.length);
