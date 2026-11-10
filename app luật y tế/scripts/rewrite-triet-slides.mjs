// Viết lại các slide chữ của bài Triết học theo kiểu trình chiếu: tiêu đề ngắn, nhãn phần, 2–3 gạch đầu dòng ngắn.
// Chỉ thay slide loại "text"; trắc nghiệm, điền chỗ trống, tự luận giữ nguyên.
// Xóa file giọng cũ của các slide này để tạo lại. Chạy: node scripts/rewrite-triet-slides.mjs
import { readFile, writeFile, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const FILE = join(ROOT, 'data/slides/triet-hoc.json');

// Số thứ tự slide (1-based) -> nội dung mới
const NEW = {
  1: { kicker: 'Giới thiệu', title: 'Triết học từ A đến Z', body: ['14 phần, từ khái niệm đến lịch sử và triết học phương Đông', 'Mỗi phần: khái niệm, ví dụ, câu hỏi ôn', 'Tổng quan nhập môn, không thay giáo trình đại học'] },
  2: { kicker: 'Phần 1', title: 'Triết học là gì?', body: ['Từ philosophia: "yêu mến sự thông thái"', 'Đặt câu hỏi nền tảng: tồn tại, tri thức, đúng–sai, ý nghĩa', 'Không có đáp án được mọi người công nhận; giá trị nằm ở lập luận rõ ràng'] },
  3: { kicker: 'Phần 1', title: 'Khác khoa học và tôn giáo', body: ['Khoa học: kiểm chứng bằng thí nghiệm và quan sát', 'Triết học: xem xét chính các khái niệm nền của khoa học', 'Với tôn giáo: dựa vào lập luận, có thể bị phản biện công khai'] },
  7: { kicker: 'Phần 2', title: 'Các ngành chính', body: ['Bản thể luận: cái gì tồn tại?', 'Nhận thức luận: biết được gì, biết bằng cách nào?', 'Logic, đạo đức, mỹ học: lập luận, nên làm gì, cái đẹp là gì?'] },
  8: { kicker: 'Phần 2', title: 'Phân loại câu hỏi', body: ['"Mọi A là B, C là A, vậy C là B?" → Logic', '"Hành động đúng là hành động đem lại hậu quả tốt?" → Đạo đức', '"Cái đẹp nằm ở vật hay người cảm nhận?" → Mỹ học'] },
  11: { kicker: 'Phần 3', title: 'Phương pháp tư duy', body: ['Định nghĩa khái niệm trước khi tranh luận', 'Suy diễn: tiền đề đúng thì kết luận bắt buộc đúng', 'Quy nạp, phản ví dụ, thí nghiệm tư duy'] },
  12: { kicker: 'Phần 3', title: 'Ví dụ từng phương pháp', body: ['Suy diễn: mọi người sẽ chết; Socrates là người; vậy Socrates sẽ chết', 'Quy nạp: nhiều quan sát dẫn tới quy luật có khả năng đúng', 'Phản ví dụ: một trường hợp đủ để bác bỏ khẳng định chung'] },
  16: { kicker: 'Phần 4', title: 'Lỗi lập luận (ngụy biện)', body: ['Tấn công cá nhân: bác ý kiến bằng cách công kích người nói', 'Người rơm: dựng lại quan điểm đối phương yếu hơn', 'Lưỡng phân giả: chỉ đưa ra hai lựa chọn'] },
  17: { kicker: 'Phần 4', title: 'Nhận diện ngụy biện', body: ['Khái quát vội: kết luận chung từ vài trường hợp', 'Quyền uy: "người nổi tiếng nói vậy nên đúng"', 'Trượt nghĩa: một từ hai nghĩa trong cùng lập luận'] },
  20: { kicker: 'Phần 5', title: 'Cổ đại Hy Lạp: thời kỳ đầu', body: ['Thales: nước là bản nguyên, giải thích bằng lý do tự nhiên', 'Heraclitus: mọi thứ biến đổi liên tục', 'Parmenides cho sự thay đổi là ảo giác; Democritus: nguyên tử'] },
  21: { kicker: 'Phần 5', title: 'Socrates, Plato, Aristotle', body: ['Socrates: đối thoại bằng câu hỏi, "tôi biết mình không biết"', 'Plato: thế giới ý niệm bất biến; Cộng hòa bàn về công lý', 'Aristotle: logic, đạo đức trung dung, hạnh phúc là mục đích đời người'] },
  25: { kicker: 'Phần 6', title: 'Triết học trung cổ', body: ['Chủ yếu trong bối cảnh tôn giáo ở châu Âu và thế giới Ả Rập', 'Augustine kết hợp Plato với thần học Kitô giáo', 'Aquinas dung hòa lý tính (Aristotle) với đức tin'] },
  26: { kicker: 'Phần 6', title: 'Thế giới Hồi giáo', body: ['Avicenna (Ibn Sina) và Averroes (Ibn Rushd) giữ và phát triển triết học Hy Lạp', 'Triết học không tách khỏi tôn giáo, nhưng dùng lập luận chặt chẽ'] },
  29: { kicker: 'Phần 7', title: 'Phục hưng và cận đại', body: ['Descartes: "Tôi tư duy nên tôi tồn tại"', 'Spinoza: chỉ có một bản thể duy nhất', 'Locke: tâm trí như tờ giấy trắng; Berkeley: tồn tại là được tri giác'] },
  30: { kicker: 'Phần 7', title: 'Hume và Kant', body: ['Hume: nhân quả là thói quen nhận thức, không thấy được sự tất yếu', 'Kant: tri thức do cấu trúc tâm trí tổ chức từ kinh nghiệm', 'Đạo đức Kant: đối xử với người khác như mục đích, không chỉ là phương tiện'] },
  34: { kicker: 'Phần 8', title: 'Hegel và Marx', body: ['Hegel: lịch sử là quá trình tinh thần phát triển qua mâu thuẫn', 'Marx: từ biện chứng của Hegel, phát triển duy vật lịch sử', 'Điều kiện vật chất và quan hệ sản xuất quyết định xã hội'] },
  35: { kicker: 'Phần 8', title: 'Kierkegaard, Nietzsche, Comte', body: ['Kierkegaard: trải nghiệm cá nhân và sự lựa chọn, người mở đường hiện sinh', 'Nietzsche: phê phán đạo đức truyền thống, đề cao ý chí và sáng tạo giá trị', 'Comte: tri thức đáng tin là tri thức khoa học có thể kiểm chứng'] },
  38: { kicker: 'Phần 9', title: 'Thế kỷ XX và đương đại', body: ['Hiện tượng học (Husserl): quay về với sự vật như ý thức trải nghiệm', 'Hiện sinh (Heidegger, Sartre, Camus): tự do và trách nhiệm', 'Popper: lý thuyết khoa học phải có khả năng bị bác bỏ'] },
  39: { kicker: 'Phần 9', title: 'Ví dụ: Sartre và Popper', body: ['Sartre: tồn tại có trước bản chất; con người tự tạo mình qua lựa chọn', 'Popper: "Mai trời mưa ở Hà Nội" kiểm chứng được, nên là khoa học', '"Số phận quyết định mọi thứ" không bác bỏ được, nên không phải khoa học'] },
  43: { kicker: 'Phần 10', title: 'Triết học Ấn Độ', body: ['Upanishad: bản chất thực tại (Brahman) và bản ngã (Atman)', 'Phật giáo: phân tích khổ, nguyên nhân khổ và con đường diệt khổ', 'Nyaya, Samkhya, Vedanta: logic, nhận thức và thực tại'] },
  44: { kicker: 'Phần 10', title: 'Triết học Trung Hoa và Việt Nam', body: ['Khổng Tử: nhân và lễ; Mạnh Tử: con người có mầm thiện; Tuân Tử: uốn nắn bằng lễ', 'Lão Tử, Trang Tử: đạo tự nhiên, vô vi', 'Việt Nam chịu ảnh hưởng Nho, Phật, Đạo; Nguyễn Trãi đề cao nhân nghĩa, lấy dân làm gốc'] },
  48: { kicker: 'Phần 11', title: 'Các chủ đề xuyên suốt lịch sử', body: ['Tồn tại, tri thức, chuẩn mực đạo đức từ đâu?', 'Tự do và ý chí: con người có thực sự lựa chọn không?', 'Tâm trí và thân thể; công bằng xã hội; ý nghĩa cuộc sống; cái đẹp'] },
  49: { kicker: 'Phần 11', title: 'Liên hệ với Tam quan', body: ['Đây là các câu hỏi về thế giới quan và nhân sinh quan đã học ở Tam quan', 'Tự do ý chí: bạn chọn ăn gì hôm nay, hay chỉ theo thói quen?', 'Tâm trí và thân thể: đau ở tay hay ở não?'] },
  52: { kicker: 'Phần 12', title: 'Cách đọc triết học', body: ['Đọc chậm: đọc một đoạn, dừng lại, hỏi tác giả khẳng định gì', 'Tìm luận đề (điều cần chứng minh) và luận cứ (lý do đưa ra)', 'Viết lại bằng lời của mình; đặt câu hỏi phản biện'] },
  53: { kicker: 'Phần 12', title: 'Đọc đối lập và thảo luận', body: ['Đọc cả hai phía của một tranh luận', 'Giải thích ý tưởng cho người khác là cách kiểm tra hiểu biết tốt nhất', 'Ví dụ: "Không ai có quyền quyết định thay người khác điều tốt cho họ." Phản biện: người bệnh mất tỉnh táo thì sao?'] },
  56: { kicker: 'Phần 13', title: 'Gợi ý sách để học tiếp', body: ['Thế giới của Sophie (Jostein Gaarder): lịch sử triết học qua đối thoại, dành cho người mới', 'Lịch sử triết học phương Tây (Bertrand Russell): tổng quan rõ ràng', 'Cộng hòa (Plato); Đạo đức Nicomachus (Aristotle)'] },
  57: { kicker: 'Phần 13', title: 'Chọn sách thế nào', body: ['Suy niệm về đệ nhất triết học (Descartes): nền tảng triết học hiện đại', 'Phê phán lý tính thuần túy (Kant): khó, nên đọc sau khi có nền tảng', 'Ưu tiên bản dịch có chú thích rõ ràng'] },
  60: { kicker: 'Phần 14', title: 'Bài tập tổng hợp', body: ['Chọn một câu hỏi triết học trong đời sống và xác định ngành', 'Viết một lập luận có tiền đề, suy luận, kết luận; kiểm tra ngụy biện', 'So sánh Descartes, Hume và Kant về tri thức'] },
  62: { kicker: 'Ôn tập', title: 'Ôn tập Triết học', body: ['Trả lời các câu dưới đây để kiểm tra mình đã nhớ kiến thức chưa'] },
  75: { kicker: 'Tổng kết', title: 'Điều cần nhớ', body: ['Triết học đặt câu hỏi nền tảng về tồn tại, nhận thức và đạo đức', 'Các trường phái trả lời khác nhau; không có đáp án chung', 'Đọc chậm, viết lại, phản biện và thảo luận là cách học hiệu quả'] },
};

const data = JSON.parse(await readFile(FILE, 'utf8'));
let changed = 0;
for (const [k, v] of Object.entries(NEW)) {
  const i = Number(k) - 1;
  const s = data.slides[i];
  if (!s || s.type !== 'text') { console.log('bỏ qua slide', k, s && s.type); continue; }
  // Xóa giọng cũ để tạo lại theo nội dung mới
  for (const dir of ['vais', 'vivos', 'hours', 'gs', 'hsg', 'nt', 'bt', '']) {
    const f = join(ROOT, 'audio/slides/triet-hoc', dir, String(Number(k)).padStart(2, '0') + '.mp3');
    if (existsSync(f)) await rm(f);
  }
  data.slides[i] = { type: 'text', kicker: v.kicker, title: v.title, body: v.body, style: 'bullets' };
  changed++;
}
await writeFile(FILE, JSON.stringify(data, null, 2) + '\n', 'utf8');
console.log('slide chữ đã viết lại:', changed);
