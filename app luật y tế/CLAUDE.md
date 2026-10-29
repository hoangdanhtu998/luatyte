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
- **Ô mục tiêu mỗi ngày:** dùng stepper tự vẽ (− / số / +) thay spinner mặc định của `input[type=number]`; giới hạn 1–100, bấm Enter hoặc "Lưu" mới ghi, không tự lưu khi bấm +/− để tránh ghi đè ngoài ý muốn.
- **Mini game Vuốt Luật:** `game.html` tự nhận thiết bị (mobile → vuốt, desktop → bàn phím ←/→), hỗ trợ `?ban=dien-thoai|may-tinh`; lõi thuần trong `js/swipe-core.js`, test `test/swipe-core.test.mjs` chạy `node --test`. Vì server tĩnh chặn `.mjs`, module dùng `.js` + `js/package.json` `{"type":"module"}`; `js/swipe-core.mjs` chỉ là alias `export *` cho Node/test. Điểm mobile lưu `lyt_swipe`, desktop dùng chung `lyt_tfbest`; đồng bộ chỉ chèn khóa game vào bản remote để không ghi đè tiến độ học. Service worker `lyt-v26` cache `game.html`, `js/swipe-core.js` và dùng `ignoreSearch` khi offline để `?ban=` vẫn mở được.
- **Câu hỏi đặc thù:** tách 8 câu về số hiệu/ngày hiệu lực/cấu trúc hoặc văn bản thay thế khỏi pool chính (`regularQuiz`/`regularHis`); chọn bộ “Câu hỏi đặc thù (số hiệu, ngày)” trong tab Trắc nghiệm. Thi thử dùng pool thường (đã kiểm 40 câu không lẫn); game mobile giữ nguyên theo yêu cầu.
- **Kiểm toán nội dung 29/10/2026:** đã thêm 10 văn bản (96/2023, 13/2026, 163/2025, 31/2025, 50/2025, 165/2026, 29/2025, 18/2026, 32/2026, 33/2026); sửa trạng thái Luật Phòng, chống tác hại của thuốc lá thành `amend` (sửa bởi Luật Phòng bệnh 114/2025); bổ sung points cho 9 mục trống; thêm 14 câu hỏi nội dung và chương lý thuyết c14. Báo cáo: `docs/audit-noi-dung-luat-2026-10-29.md`. Chưa rà toàn bộ câu hỏi/đáp án.
