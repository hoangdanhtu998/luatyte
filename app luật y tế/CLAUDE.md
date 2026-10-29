# Hướng dẫn cho Claude trong dự án app luật y tế

## Cách trả lời
- Luôn trả lời bằng tiếng Việt.
- Phong cách trẻ trung, kiểu Gen Z: gần gũi, năng động, dùng ngôn ngữ đời thường, có chút icon/emoji vừa phải. Vẫn rõ ràng, đúng trọng tâm, không lan man.
- Báo lỗi hoặc việc bị chặn thì nói thẳng: chuyện gì đã xảy ra, thử gì rồi, bước tiếp theo là gì.

## Bối cảnh dự án
- Sản phẩm học luật y tế gồm trang tĩnh (luatyte.online), app học tập (Node, cổng 4400) và app quản lý (Node + SQLite, cổng 3200).

## Quy tắc làm việc
- Không tự ý tốn tiền cho lượt tạo ảnh AI. Hỏi trước khi gen.
- Không đọc hoặc commit thư mục thông tin đăng nhập, không đưa dữ liệu nhạy cảm (key, mật khẩu, `data/bhyt-cases.draft.json`) ra ngoài.
- Không ghi đè file chỉnh sửa tay của chủ dự án (`bai-giang.html`, `clinic.html`, `index.html`, `moi-truong-pixel.html`) nếu chưa được yêu cầu.
- Sau khi sửa, kiểm tra cú pháp JavaScript và đường dẫn file. Nếu chụp màn hình không được thì nói rõ là chưa kiểm tra trực quan.

## Điều phối teammate và Codex
- Chủ dự án cho phép Claude làm chủ dự án và điều phối Codex/teammate trong phạm vi thư mục này.
- Mỗi task giao cho worker phải kèm danh sách file được sửa và các bước nghiệm thu có kết quả thật.
- Ghi chú quyết định kỹ thuật mới vào file này, không ghi vào file dữ liệu của chủ dự án.

## Quyết định kỹ thuật (29/10/2026)
- **Thi thử theo chuyên đề:** bộ đề `topic` lọc từ `QUIZ`/`HIS` theo khóa `q|<mã luật>` hoặc `h|<tên luật>`; tên chuyên đề lưu vào `topic` của mỗi lượt trong `lyt_exams` và hiện ở tab Tiến độ.
- **Tab Tiến độ:** tổng hợp từ `lyt_qstat`, `lyt_daystat` (giữ 60 ngày), `lyt_exams`, `lyt_goal`; không thêm nguồn dữ liệu mới để tránh lệch với các tab cũ.
- **Đồng bộ tiến độ:** gửi ảnh chụp toàn bộ khóa `lyt_*` lên `PUT /api/progress` (bảng `user_progress`), gộp sau 1,5 giây; so sánh `updatedAt` kiểu last-write-wins. Lần đầu đăng nhập trên máy mới lấy dữ liệu máy chủ làm gốc rồi phủ dữ liệu đang có trên máy. Trong lúc `sync.init()` chạy thì không hẹn giờ đẩy để tránh ghi đè dữ liệu máy chủ bằng ảnh chụp rỗng.
- **CSV:** UTF-8 BOM, thoát theo RFC 4180; dùng chung `src/csv.mjs`. Doanh thu có thêm dòng TỔNG.
- **Khôi phục DB:** chỉ chạy CLI khi đã dừng server; bắt buộc `--yes`; kiểm tra header, `PRAGMA integrity_check`, bảng bắt buộc; giữ bản an toàn trước khi ghi đè.
- **Sửa lỗi:** `checkBadges()` chạy lúc khởi động có thể gọi `avatar` trước khi khai báo (TDZ) khi vừa có huy hiệu mới, làm dừng script và mất sự kiện tab. Đã khai báo `avatar` sớm hơn.
- **Ô mục tiêu mỗi ngày:** stepper tự vẽ (− / số / +) thay spinner mặc định; giới hạn 1–100. Bấm +/− ghi ngay; gõ tay chỉ ghi khi Enter/"Lưu", bấm ra ngoài thì trả về giá trị đã lưu (tránh tưởng đã đổi mà chưa lưu).
- **Mini game Vuốt Luật:** `game.html` tự nhận thiết bị (mobile → vuốt, desktop → bàn phím ←/→/Enter), hỗ trợ `?ban=dien-thoai|may-tinh`; lõi thuần trong `js/swipe-core.js`, test `test/swipe-core.test.mjs` chạy `node --test`. Vì server tĩnh chặn `.mjs`, module dùng `.js` + `js/package.json` `{"type":"module"}`; `js/swipe-core.mjs` chỉ là alias `export *` cho Node/test. Điểm mobile lưu `lyt_swipe`, desktop dùng chung `lyt_tfbest`; đồng bộ chỉ chèn khóa game vào bản remote để không ghi đè tiến độ học. Service worker `lyt-v30` cache `game.html`, `js/swipe-core.js`, `js/plan-badge.js`, `js/clinic3d.js` và dùng `ignoreSearch` khi offline để `?ban=` vẫn mở được.
- **Câu hỏi đặc thù:** tách 8 câu về số hiệu/ngày hiệu lực/cấu trúc hoặc văn bản thay thế khỏi pool chính (`regularQuiz`/`regularHis`); chọn bộ “Câu hỏi đặc thù (số hiệu, ngày)” trong tab Trắc nghiệm. Thi thử dùng pool thường (đã kiểm 40 câu không lẫn); game mobile giữ nguyên theo yêu cầu.
- **Kiểm toán nội dung 29/10/2026:** đợt 1 thêm 10 văn bản, bổ sung points cho 9 mục trống, thêm 14 câu hỏi nội dung và chương c14. Đợt 2 sửa mức hưởng BHYT trái tuyến (nội trú cấp chuyên sâu 100% mức hưởng, ngoại trú 50%), thêm Thông tư 21/2024/TT-BYT thay Thông tư 21/2023 và 22/2023 (hết hiệu lực 01/01/2025), đánh dấu 8 câu giá cũ là lịch sử + `verify`, cập nhật c5/c11. Đợt 3 thêm Nghị định 90/2026/NĐ-CP (xử phạt hành chính y tế, thay NĐ117/2020 từ 15/05/2026), 12 câu tình huống và chương c15; tổng 42 văn bản, 199 câu, 15 chương. Báo cáo: `docs/audit-noi-dung-luat-2026-10-29.md`.
- **Thi thử:** đảo thứ tự đáp án mỗi lượt và remap `a`; Playwright chọn đúng theo nội dung đạt 10/10, vị trí đáp án đổi 8/10.
- **Đồng bộ lỗi:** `sync.note()`/`paint()` phân biệt chưa đăng nhập, lỗi tải, 401/CSRF, lỗi máy chủ; nút “Thử lại”; chỉ ghi `lyt_syncAt` khi server trả `updatedAt`.
- **Kiểm tra cục bộ:** `node scripts/check-local.mjs` ở gốc chạy 20 test học + security smoke; thêm `--admin` để chạy 58 test quản lý. `scripts/security-smoke.mjs` chặn server.mjs/.git/traversal/.mjs và kiểm URL méo.
- **Máy chủ học:** `server.mjs` bọc toàn bộ route trong try/catch; URL hỏng trả 500 JSON `INTERNAL_ERROR` và server tiếp tục chạy (test `test/server-resilience.test.mjs`).
- **3D phòng khám:** `js/clinic3d.js` là fallback 2D (init/resize/frame) khi gói 3D chưa có; không sửa `clinic.html` chỉnh tay.
- **Desktop:** nav tab và chip chủ đề wrap ở ≥900px; mobile giữ chip wrap sẵn có.
