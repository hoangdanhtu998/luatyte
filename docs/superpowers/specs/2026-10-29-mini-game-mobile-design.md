# Vuốt Luật — Mini game mobile + bản máy tính

Ngày: 29/10/2026  
Trạng thái: đã build và kiểm tra ngày 29/10/2026. Kết quả: 10/10 test core pass; mobile 390×844, desktop 1280×800, reduced-motion, offline và đồng bộ (giữ `lyt_goal`/`lyt_qstat`) đã chạy thật.  
Người chủ trì: Qoder. Chủ dự án đã giao quyền quyết định chi tiết kỹ thuật; chỉ hỏi lại nếu một lựa chọn làm thay đổi hành vi người dùng.

## 1. Mục tiêu

Tạo một mini game nhẹ, mở nhanh trên điện thoại, dùng thao tác vuốt để trả lời Đúng/Sai trong 60 giây. Trang game tự nhận thiết bị:

- Điện thoại → bản vuốt (mới).
- Máy tính → bản 60 giây kiểu cũ (bàn phím ←/→), vẫn cho đổi bản thủ công.

Bản cũ trong tab Đúng/Sai của `index.html` vẫn giữ nguyên. Trang game là lối vào mới, không thay thế bản cũ.

Thành công khi:

- Mở `game.html` trên điện thoại là chơi được ngay bằng một tay, không cần hướng dẫn dài.
- Animation mượt, có phản hồi rõ khi đúng/sai/combo, không giật trên máy tầm trung.
- Điểm cao và chuỗi ngày chơi được lưu, tự đồng bộ tài khoản nếu đã đăng nhập.
- Không làm hỏng game cũ, không thêm thư viện ngoài, không cần thay đổi server.

## 2. Quyết định đã chốt

| Hạng mục | Quyết định |
|---|---|
| Gameplay mobile | Thẻ nhận định/câu hỏi, vuốt phải = Đúng, trái = Sai, 60 giây |
| Điểm vào | Trang riêng `game.html`, có link từ tab Đúng/Sai |
| Chọn bản | Tự nhận thiết bị, có nút "Đổi bản"; không có màn chọn riêng |
| Bản máy tính | Bố cục 60 giây kiểu cũ, phím ←/→, dùng kho TF |
| Bản điện thoại | Vuốt, combo, hiệu ứng hạt, dùng TF + câu sinh từ quiz |
| Lưu điểm mobile | `lyt_swipe` (điểm cao, combo, số ván, tổng, chuỗi ngày) |
| Lưu điểm desktop | Dùng lại `lyt_tfbest` của game cũ |
| Đồng bộ | Đẩy riêng các khóa game lên `/api/progress`, không ghi đè tiến độ học khác |
| Animation | Mượt + điểm nhấn; tôn trọng `prefers-reduced-motion` |
| Kiến trúc | `game.html` + `js/swipe-core.js` + test Node, không framework |
| Âm thanh | Không dùng |
| Hình ảnh | Không dùng ảnh AI; minh họa bằng CSS/SVG đơn giản |

## 3. Trải nghiệm

### 3.1. Tự nhận thiết bị

Khi mở `game.html`:

- Nếu URL có `?ban=dien-thoai` → bản điện thoại.
- Nếu URL có `?ban=may-tinh` → bản máy tính.
- Nếu không có query: dùng `matchMedia("(pointer: coarse)")` hoặc màn hình ≤ 760px → bản điện thoại; còn lại → bản máy tính.
- Nút "Đổi bản" chuyển sang bản còn lại bằng cách điều hướng tới `game.html?ban=...`; chỉ hiện ở màn bắt đầu và màn kết thúc, không hiện khi đang chơi để tránh mất ván.
- Mỗi lần mở không có query sẽ tự nhận lại; lựa chọn thủ công không được lưu vĩnh viễn.

### 3.2. Bản điện thoại (mới)

**Màn bắt đầu**

- Tiêu đề "Vuốt Luật", phụ đề "60 giây · vuốt để trả lời".
- Kỷ lục, chuỗi ngày chơi.
- 3 gợi ý ngắn: vuốt phải = Đúng; vuốt trái = Sai; sai trừ 3 giây.
- Nút lớn "Bắt đầu".
- Link "← Về sổ tay" và "Bản máy tính" (đổi bản).

**Trong ván**

- HUD trên: thanh thời gian + số giây; điểm; pill combo "×N" khi combo ≥ 2.
- Stack 3 thẻ; thẻ trên cùng hiển thị:
  - Nhãn nhỏ "NHẬN ĐỊNH" hoặc "CÂU HỎI + ĐÁP ÁN ĐỀ XUẤT".
  - Nội dung câu.
  - Nếu là thẻ sinh từ quiz: hộp "Đáp án đề xuất: …" tách màu.
  - Nguồn luật ở chân thẻ (nếu có).
- Hai nút dự phòng dưới thẻ: "Sai" và "Đúng"; phím ←/→ trên máy có bàn phím.
- Đếm ngược 3–2–1 trước khi bắt đầu tính giờ; mỗi bước 450ms, có scale/fade.
- Đúng: +1 điểm, combo +1, thẻ bay theo hướng vuốt, dấu "✓ ĐÚNG"/"✓ SAI" xanh theo lựa chọn, rung 8ms, hạt giấy khi combo đạt 5 và 10.
- Sai: trừ 3 giây, combo về 0, dấu "✗ ĐÚNG"/"✗ SAI" đỏ, rung 25ms, viền đỏ, thanh thời gian nháy đỏ, hiện "-3s" bay lên; nền màn hình ánh đỏ rất nhẹ.
- Sau mỗi câu, thanh phản hồi mỏng dưới thẻ hiện `✓`/`✗` + giải thích rút gọn (tối đa 140 ký tự), tự ẩn sau 1,6 giây hoặc khi sang thẻ mới. Không chặn thao tác.
- Hết 60 giây → màn kết thúc; không có mạng vẫn chơi được.

**Màn kết thúc**

- Điểm lớn, "Kỷ lục mới" nếu điểm > kỷ lục cũ.
- Số đúng / tổng đã trả lời, độ chính xác %, combo dài nhất, chuỗi ngày.
- Nút "Chơi lại" và "Đổi bản"; link "← Về sổ tay".
- Không liệt kê chi tiết từng câu sai trong bản này (giữ nhẹ); giải thích đã hiện trong lúc chơi.

**Tạm dừng**

- Khi tab bị ẩn: dừng đồng hồ, hủy thao tác kéo dở.
- Khi quay lại: tiếp tục với thời gian còn lại, không trừ thời gian đã ẩn.
- Nếu người dùng bấm quay lại giữa ván: hỏi xác nhận "Bỏ ván này?".

### 3.3. Bản máy tính (kiểu cũ)

- Không dùng vuốt; bố cục rộng, chữ lớn, hai nút "Sai ←" và "Đúng →"; hỗ trợ phím ←/→.
- 60 giây, đúng +1, sai trừ 3 giây; bắt đầu ngay sau khi bấm "Bắt đầu" (không đếm ngược), giống game cũ.
- Dùng kho TF 23 nhận định; hết thì xáo lại, tránh lặp liền tay.
- Hiện điểm, câu đã trả lời, thời gian, kỷ lục `tfbest`.
- Kết thúc: điểm, số câu, kỷ lục mới; nút "Chơi lại", "Đổi bản", "← Về sổ tay".
- Không dùng combo/hạt để giữ cảm giác bản cũ; chỉ hiệu ứng đổi màu, rung nhẹ và chuyển thẻ.
- Bản cũ trong tab Đúng/Sai của `index.html` không bị sửa logic.

### 3.4. Điều hướng

- Tab Đúng/Sai thêm một nút "Mở mini game" (hoặc "Chơi game") trỏ tới `game.html`.
- Trong `game.html`, "← Về sổ tay" trỏ `index.html#dungsai`.
- Không thêm tab mới vào nav chính.

## 4. Nội dung và dựng thẻ

### 4.1. Nguồn dữ liệu

- `data/tf.json`: mảng `[nhận định, đúng/sai, giải thích]`.
- `data/quiz.json`, `data/quiz_nentang.json`, `data/quiz_his.json`: câu hỏi 4 đáp án, có `q`, `o`, `a`, `e`, có thể có `t`, `law`, `src`.
- `data/laws.json`: map id → tên luật để hiện nguồn.

### 4.2. Thẻ TF

- Mỗi phần tử TF thành một thẻ:
  - `text`: nhận định.
  - `truth`: boolean.
  - `why`: giải thích.
  - `source`: "Nhận định nhanh" hoặc tên luật nếu suy ra được (không bắt buộc).
  - `kind`: `"tf"`.

### 4.3. Thẻ sinh từ quiz

- Chọn ngẫu nhiên một đáp án làm "đáp án đề xuất".
- `truth` = đáp án đề xuất có đúng là đáp án đúng của câu hay không.
- Nội dung thẻ:
  - `text`: câu hỏi.
  - `proposed`: nội dung đáp án đề xuất.
  - `truth`: boolean.
  - `why`: giải thích gốc + "Đáp án đúng: …".
  - `source`: tên luật từ `laws.json` hoặc `q.law` hoặc để trống.
  - `kind`: `"quiz"`.
- Không cần hiện 4 đáp án; người chơi chỉ chấm đáp án đề xuất đúng/sai.

### 4.4. Dựng deck mobile

- Mục tiêu 60 thẻ mỗi ván.
- Lấy toàn bộ TF (23) + phần còn lại sinh từ quiz đã xáo, không trùng câu hỏi trong cùng deck.
- Cân bằng Đúng/Sai: chênh lệch số thẻ Đúng và Sai không quá 2. Vì TF có 13 đúng / 10 sai, phần quiz được chọn số lượng đúng/sai bù lại.
- Không lặp liền tay; deck được xáo sau khi dựng.
- Nếu kho quiz thiếu, bù bằng TF; nếu tổng < 10 thẻ, hiện lỗi thân thiện và cho thử lại, không crash.
- Khi chơi hết deck (người chơi rất nhanh), dựng deck mới, tránh trùng thẻ cuối.

### 4.5. Dựng deck desktop

- Chỉ dùng TF; xáo toàn bộ; hết thì xáo lại, tránh trùng thẻ vừa rồi.
- Không sinh thẻ từ quiz ở bản desktop.

## 5. Kiến trúc và file

### 5.1. File mới

- `game.html`: shell, CSS riêng, UI hai bản, điều khiển pointer/keyboard, timer, lưu trữ, gọi đồng bộ.
- `js/swipe-core.js`: logic thuần, không DOM:
  - `detectMode({ coarsePointer, width, query })` → `"mobile" | "desktop"`.
  - `normalizeTf(list)`.
  - `makeQuizCard(question, source, wantTruth, rng)`.
  - `buildSwipeDeck({ tf, quiz, laws, size, rng })`.
  - `buildDesktopDeck({ tf, rng })`.
  - `createRound({ mode, deck, durationMs })`.
  - `applyAnswer(round, answer)` → `{ round, event }`; không mutate đầu vào.
  - `finishRound(round, prevStats, todayKey)` → `{ stats, isRecord }`.
  - `emptySwipeStats()`, `mergeSwipeStats(a, b)`.
  - `accuracy(round)`.
- `js/swipe-core.mjs`: alias `export * from "./swipe-core.js"` cho Node/test theo tên module trong spec; server tĩnh chặn `.mjs` nên `game.html` không import file này.
- `test/swipe-core.test.mjs`: test bằng `node:test`.
- `js/package.json`: `{"type":"module"}` để Node chạy `js/swipe-core.js` như ESM (server tĩnh chặn `.mjs`, nên dùng `.js`).

### 5.2. File sửa

- `index.html`: thêm nút mở `game.html` trong panel Đúng/Sai; đổi câu intro để phân biệt "bản máy tính ngay tại đây" và "mini game mobile". Không sửa logic game cũ.
- `sw.js`: tăng version cache, thêm `game.html` và `js/swipe-core.js` vào `CORE`.
- `CLAUDE.md`: ghi quyết định kỹ thuật mới sau khi build xong.

### 5.3. Không sửa

- `clinic.html`, `bai-giang.html`, `moi-truong-pixel.html`.
- Server, API, database.
- Logic game Đúng/Sai cũ trong `index.html`.

### 5.4. API của core (chi tiết)

`applyAnswer`:

- Input `round`: `{ mode, deck, index, score, answered, correct, combo, bestCombo, remainMs, answers: [] }`.
- `answer`: `"true" | "false"` (người chơi chọn).
- So sánh với `round.deck[round.index].truth`.
- Đúng: `score + 1`, `correct + 1`, `combo + 1`, `bestCombo = max`.
- Sai: `combo = 0`, `remainMs = max(0, remainMs - 3000)`.
- `answered + 1`, `index + 1`.
- `event`: `{ correct, card, penaltyMs, combo, milestone }` với `milestone` là 5 hoặc 10 nếu vừa đạt.
- Không tự kết thúc ván; UI kiểm tra `remainMs <= 0` hoặc hết deck.

`finishRound`:

- `plays + 1`.
- `totalCorrect += round.correct`, `totalAnswered += round.answered`.
- `best = max(best, round.score)`, `bestCombo = max(bestCombo, round.bestCombo)`.
- `isRecord = round.score > prev.best && round.score > 0`.
- Chuỗi ngày:
  - Nếu `prev.lastDay === today`: giữ nguyên `streak`.
  - Nếu `prev.lastDay === hôm qua`: `streak + 1`.
  - Còn lại: `streak = 1`.
  - `lastDay = today`.
- Trả về stats mới; không ghi localStorage trong core.

`mergeSwipeStats(a, b)`:

- `best`, `bestCombo`, `plays`, `totalCorrect`, `totalAnswered`: lấy max.
- `lastDay`: lấy ngày muộn hơn.
- `streak`: lấy của bản có `lastDay` muộn hơn; nếu cùng ngày lấy max.
- Dùng khi kéo dữ liệu từ tài khoản hoặc gộp bản local/remote.

## 6. Animation và mobile UX

### 6.1. Kéo thẻ

- Pointer Events + `setPointerCapture`; `touch-action: none` trên vùng thẻ.
- Chỉ thẻ trên cùng nhận kéo; bỏ qua pointer thứ hai.
- `dx`, `dy` cập nhật trong `requestAnimationFrame`.
- Transform: `translate(dx, dy * 0.35) rotate(dx * 0.055deg)`, giới hạn rotate ±14°.
- Hai thẻ dưới: `scale(0.96)` và `scale(0.92)`, dịch xuống 10px/20px.
- Nhãn ĐÚNG/SAI: opacity = `min(1, |dx| / 90)`, xoay −12°/+12°; chỉ hiện nhãn theo hướng kéo.
- Ngưỡng thả: `|dx| >= 72px` hoặc vận tốc `|vx| >= 0.45 px/ms`.
- Dưới ngưỡng: spring back 320ms, easing `cubic-bezier(.2,.9,.25,1.18)`.
- Đủ ngưỡng: bay ra 280ms, `translateX(±120vw) rotate(±20deg)`, opacity 0; sau đó thăng cấp thẻ kế trong 220ms.
- Khóa nhận câu trong lúc bay (khoảng 300ms) để tránh double answer.

### 6.2. Phản hồi

- Đúng: toàn màn hình ánh xanh nhẹ 300ms, stamp slam "✓ ĐÚNG"/"✓ SAI" xanh, viền thẻ xanh, "+1" bay lên từ điểm, điểm nảy 280ms; hạt giấy khi combo 5/10; rung 8ms.
- Sai: toàn màn hình ánh đỏ nhẹ 300ms, stamp slam "✗ ĐÚNG"/"✗ SAI" đỏ, viền thẻ đỏ, "-3s" bay lên từ đồng hồ, đồng hồ rung, thẻ rung 3 nhịp ±9px, thanh giờ nháy đỏ; rung thiết bị 25ms.
- Desktop dùng nhãn "✓/✗ ĐÚNG/SAI" ở góc thẻ thay cho stamp mobile.
- Combo pill: pop khi tăng; ẩn khi combo < 2.
- Countdown 3–2–1: mỗi số scale từ 1.3 → 1, fade; tổng 1,35 giây; bắt đầu tính giờ sau số 1.
- Không dùng âm thanh.

### 6.3. Hiệu năng

- Chỉ animate `transform` và `opacity`; không animate `width/height/top/left`.
- Hạt giới hạn 16 phần tử, tự xóa sau animation.
- `will-change: transform` chỉ trên thẻ trên cùng khi đang kéo; gỡ sau khi thả.
- Timer cập nhật 100ms bằng `setInterval` + `performance.now`; thanh thời gian dùng transform scaleX để mượt.
- Không thư viện animation ngoài.

### 6.4. Giảm chuyển động

- Nếu `prefers-reduced-motion: reduce`:
  - Không hạt, không rung, không nghiêng thẻ.
  - Bay ra bằng fade + dịch 12px trong 120ms.
  - Countdown rút còn 300ms hoặc bỏ, bắt đầu ngay.
  - Vẫn giữ nhãn ĐÚNG/SAI và đổi màu.
- Vẫn có nút bấm và phím ←/→ cho người không vuốt được.

## 7. Lưu trữ và đồng bộ

### 7.1. Khóa lưu

- `lyt_swipe` (mobile):
  ```json
  {
    "v": 1,
    "best": 0,
    "bestCombo": 0,
    "plays": 0,
    "totalCorrect": 0,
    "totalAnswered": 0,
    "lastDay": "",
    "streak": 0
  }
  ```
- `lyt_tfbest` (desktop): số nguyên, dùng chung với game cũ.
- `lyt_syncAt`: mốc đồng bộ chung, do server trả về.

### 7.2. Khi mở game

- Đọc local; hiện kỷ lục/chuỗi ngay (không chờ mạng).
- Nếu đã đăng nhập:
  - `GET /api/me` (timeout 1200ms) để lấy user + `csrfToken`.
  - `GET /api/progress` (timeout 1500ms).
  - Nếu remote có `lyt_swipe`, gộp bằng `mergeSwipeStats` và ghi local.
  - Nếu remote có `lyt_tfbest` lớn hơn local, cập nhật local.
- Lỗi mạng: bỏ qua, chơi bình thường.

### 7.3. Khi kết thúc ván

- Ghi local ngay.
- Nếu đã đăng nhập:
  - `GET /api/progress` lấy dữ liệu remote mới nhất.
  - `data = remote.data` (giữ nguyên các khóa học tập khác).
  - Gán `data.lyt_swipe` hoặc `data.lyt_tfbest` bằng giá trị local mới.
  - `PUT /api/progress` với `x-csrf-token`.
  - Thành công: lưu `updatedAt` vào `lyt_syncAt`.
  - Thất bại: đặt `lyt_syncAt = "0"` để lần mở `index.html` sau sẽ gộp local + remote và đẩy lại; không làm mất kết quả vừa chơi.
- Nếu chưa đăng nhập: đặt `lyt_syncAt = "0"` nếu vừa có kết quả mới, để lần đăng nhập sau gộp và đẩy lên.
- Không dùng full snapshot trong game; chỉ chèn khóa game vào bản remote để tránh ghi đè tiến độ học của thiết bị khác.

### 7.4. Xung đột

- Hai thiết bị chơi cùng lúc: `mergeSwipeStats` lấy max điểm/combo/số ván; chuỗi ngày lấy bản có `lastDay` muộn hơn.
- Không đảm bảo cộng dồn số ván giữa hai thiết bị (tránh đếm trùng); chấp nhận max.

## 8. Accessibility

- Nút Đúng/Sai là `<button>` thật, kích thước ≥ 44px, có `aria-label`.
- Thẻ có `aria-live="polite"` cho nội dung mới? Không đọc toàn bộ stack; chỉ thẻ trên cùng nằm trong vùng đọc, hai thẻ dưới `aria-hidden="true"`.
- Điểm/combo cập nhật qua vùng `aria-live="polite"`, không đọc mỗi 100ms.
- Timer có `role="timer"`, `aria-label` cập nhật mỗi 5 giây hoặc khi còn ≤ 10 giây, không spam.
- Màu không phải tín hiệu duy nhất: luôn có chữ "ĐÚNG"/"SAI" và icon.
- Focus visible rõ; sau khi chuyển thẻ, focus giữ ở nút vừa bấm hoặc vùng thẻ.
- Hỗ trợ bàn phím: ← = Sai, → = Đúng; Enter/Space ở nút bắt đầu/chơi lại.
- Không khóa zoom; không dùng `user-scalable=no`.

## 9. Xử lý lỗi

- Fetch `tf.json`/`quiz*.json` lỗi: hiện thẻ "Không tải được bộ câu. Thử lại" + nút thử lại; vẫn cho đổi bản và về app.
- Không có thẻ nào: không cho bắt đầu, hiện thông báo.
- localStorage lỗi/đầy: vẫn chơi trong bộ nhớ; không crash; hiện toast nhẹ nếu lưu thất bại.
- JSON `lyt_swipe` hỏng: bỏ qua, dùng stats rỗng; không để lỗi parse làm dừng game.
- Timer về 0 khi đang kéo: kết thúc ván, bỏ thao tác kéo.
- Người dùng thoát giữa ván: không lưu ván dở; chỉ lưu khi kết thúc.
- Mất mạng khi đẩy điểm: im lặng, đánh dấu `lyt_syncAt=0`, thử lại sau.

## 10. Kiểm thử và tiêu chí nghiệm thu

### 10.1. Unit test (`node --test test/swipe-core.test.mjs`)

- `buildSwipeDeck`:
  - Đủ 60 thẻ khi đủ dữ liệu; không trùng nội dung.
  - TF giữ nguyên `truth`.
  - Quiz: `truth === (proposed === đáp án đúng)`.
  - Chênh lệch Đúng/Sai ≤ 2.
  - Không có hai thẻ liền nhau cùng nội dung.
- `applyAnswer`:
  - Đúng +1 điểm, combo tăng, không trừ giờ.
  - Sai trừ 3000ms, combo về 0, không âm.
  - `milestone` đúng tại combo 5/10.
- `finishRound`:
  - Cập nhật best, bestCombo, plays, tổng.
  - `isRecord` đúng.
  - Chuỗi ngày: cùng ngày giữ, hôm qua +1, cách ngày reset 1.
- `mergeSwipeStats`: max điểm/combo/ván; chuỗi theo ngày muộn hơn.
- `buildDesktopDeck`: chỉ TF, không lặp liền tay.
- `detectMode`: query thắng auto; pointer coarse → mobile; desktop → desktop.

### 10.2. Kiểm tra trình duyệt

- Mở `game.html` ở viewport 390×844 (giả lập mobile): auto vào bản điện thoại, không tràn ngang, nút trong tầm ngón tay.
- Vuốt chuột/pointer sang phải/trái: thẻ bay đúng hướng, điểm/combo đúng; thả dưới ngưỡng thì thẻ bật về.
- Bấm nút Sai/Đúng và phím ←/→: hoạt động như vuốt.
- Sai: thời gian giảm 3 giây, combo reset, hiện "-3s".
- Hết giờ: màn kết thúc đúng số liệu; "Chơi lại" vào ván mới.
- Lưu: `lyt_swipe` đúng schema; mở lại thấy kỷ lục/chuỗi.
- Desktop 1280×800: auto bản máy tính; ←/→ chạy; `lyt_tfbest` cập nhật.
- "Đổi bản": chuyển đúng và giữ query; không mất dữ liệu đã lưu.
- `prefers-reduced-motion: reduce`: không tạo hạt, không shake; vẫn chơi được.
- Console không có lỗi JavaScript (ngoài lỗi mạng được chủ động bỏ qua).
- Offline sau lần tải đầu: `game.html` mở được từ cache (service worker).
- Đồng bộ: đăng nhập qua server, chơi xong, `GET /api/progress` có `lyt_swipe` mới; localStorage trống trên origin mới vẫn kéo được kỷ lục.

### 10.3. Tiêu chí chấp nhận

- Không sửa logic game cũ; tab Đúng/Sai vẫn chạy như trước.
- Không thêm dependency, không ảnh AI, không âm thanh.
- `node --check`/parse script sạch; test core pass 100%.
- Trải nghiệm mobile 60 giây hoàn chỉnh, animation không giật ở 60fps trên máy tầm trung.
- Có link qua lại giữa app và game.

## 11. Không làm (non-goals)

- Không làm bảng xếp hạng online, multiplayer, tài khoản riêng cho game.
- Không làm nhiệm vụ ngày, phần thưởng, cửa hàng, mở khóa.
- Không thêm âm thanh hoặc rung phức tạp.
- Không đổi API/server/database.
- Không thay thế hoặc xóa game Đúng/Sai cũ.
- Không sửa `clinic.html` hay các file chủ dự án chỉnh tay khác.
- Không dùng framework/thư viện animation.

## 12. Prompt build (dán cho agent)

Bạn là kỹ sư front-end của dự án "Sổ tay Luật Y tế" (thư mục `app luật y tế`). Hãy build mini game **Vuốt Luật** theo đúng spec này:

- Tạo `game.html` tự nhận thiết bị: mobile → bản vuốt 60 giây; desktop → bản 60 giây kiểu cũ dùng phím ←/→; có nút "Đổi bản" ở màn bắt đầu/kết thúc, hỗ trợ query `?ban=dien-thoai|may-tinh`.
- Tạo `js/swipe-core.js` chứa logic thuần (dựng deck TF + quiz, chấm điểm, combo, chuỗi ngày, merge stats) và `test/swipe-core.test.mjs` test bằng `node:test`.
- Dùng `data/tf.json`, `data/quiz.json`, `data/quiz_nentang.json`, `data/quiz_his.json`, `data/laws.json`; không thêm dữ liệu mới.
- Mobile: thẻ kéo 1:1, stamp ĐÚNG/SAI, spring back, bay ra, combo 5/10 bắn hạt, rung nhẹ, countdown 3-2-1, tạm dừng khi tab ẩn; tôn trọng `prefers-reduced-motion`.
- Lưu `lyt_swipe`; desktop dùng `lyt_tfbest`; đồng bộ riêng các khóa game lên `/api/progress` như mục 7, không ghi đè tiến độ học khác.
- Thêm nút mở game trong tab Đúng/Sai của `index.html`; cập nhật `sw.js` (version + cache `game.html`, `js/swipe-core.js`); không sửa logic game cũ.
- Không thêm thư viện, không âm thanh, không ảnh AI, không sửa server/API/DB.
- Tự quyết chi tiết nhỏ; chỉ hỏi nếu thay đổi hành vi người dùng. Sau khi build, chạy test core, kiểm tra mobile/desktop/reduced motion/offline và báo kết quả thật.

## 13. Rủi ro và lưu ý

- **Trùng lặp với game cũ:** bản desktop trong `game.html` là bố cục mới mô phỏng game cũ, không phải cùng DOM. Giữ nguyên tab cũ để tránh regression; hai nơi dùng chung `lyt_tfbest`.
- **Đồng bộ một phần:** game chỉ chèn khóa game vào remote; nếu index đang có thay đổi chưa đẩy, lần sync sau sẽ xử lý. Khi push lỗi, `lyt_syncAt=0` buộc gộp lại; đây là chủ ý, không phải bug.
- **Nội dung sinh từ quiz:** phải giữ đúng đáp án gốc; test kiểm tra truth. Không tự bịa đáp án.
- **Hiệu năng:** nếu máy yếu, giảm hạt xuống 8; không dùng filter blur lớn.
- **Không có git repo:** không commit spec; lưu file trong `docs/superpowers/specs/`.
