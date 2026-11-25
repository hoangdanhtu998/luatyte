# Rà soát nội dung luatyte.online — 25/11/2026

## Kết quả

Đã sửa 11 file nội dung trong `app luật y tế/`, là thư mục được workflow GitHub Pages đưa vào website. Thêm báo cáo này và `BAO-CAO.md` để bàn giao. Chưa commit, push hoặc triển khai.

Đây là đợt sửa các lỗi nội dung và nguồn đã xác định, không phải chứng nhận toàn bộ dữ liệu luật đã đúng và còn hiệu lực. Không tự cập nhật ngày “toàn bộ website đã được kiểm” vì chưa có căn cứ đó.

## File và thay đổi

| File trong app luật y tế/ | Thay đổi |
| --- | --- |
| index.html | Thay tuyên bố cập nhật chung bằng hướng dẫn đọc nguồn và ghi chú xác minh từng mục. Chỉ thay chữ. |
| ly_thuyet.html | Sửa mô tả bộ câu hỏi, giải thích rõ mục verify đang chờ đối chiếu. |
| tin_luat.html | Làm rõ “đã ban hành” không tự đồng nghĩa đã có hiệu lực; “chưa xác minh” là chưa đủ căn cứ, không nhất thiết không có nguồn. |
| tham_chieu.html | Không dùng “hai nguồn” làm bảo đảm rằng toàn bộ nội dung đã kiểm chứng. |
| data/faq.json | Sửa lỗi giải thích ngược verify; thống nhất câu trả lời về trợ lý tra cứu; bổ sung căn cứ cho câu bảo mật. |
| data/laws.json | Sửa URL nguồn Thông tư 25/2026, nêu đủ bốn thông tư được sửa; bổ sung điều kiện không phải khám định kỳ cho hồ sơ người mất/hạn chế năng lực hành vi; ghi rõ hiệu lực chung và riêng Điều 2–3. Sửa URL Luật Phòng bệnh sang văn bản đúng. |
| data/tra_loi_nhanh.json | Đối chiếu Mẫu 03 từ phụ lục chính thức; bổ sung mục sản phụ khoa và thuật ngữ nội khoa; thay ghi chú “chưa đọc phụ lục” bằng phạm vi đã đọc. Đánh dấu verify cho suy luận về nghề đặc thù; giữ phân biệt khám đi học/đi làm và khám định kỳ. |
| data/ly_thuyet.json | Bổ sung điều kiện yêu cầu bằng văn bản khi khai thác hồ sơ; sửa c22 về Luật KCB 15/2023; sửa số điều/phạm vi/hiệu lực ở c16; thay các kết luận thiếu căn cứ ở c21, c17, c18 bằng hướng dẫn verify cụ thể. Giữ mã và cấu trúc hiện có. |
| data/quiz.json | Sửa 8 câu kcb-85…kcb-92 đang gắn “Luật KCB 40/2025”: dùng Luật 15/2023, Điều 1, 13, 60, 69 và 120; sửa lựa chọn đúng tương ứng và gắn nguồn. Giữ nguyên id, t, chỉ số a, thứ tự và số câu. |
| data/tham-chieu.json | Làm rõ số nguồn không thay thế đối chiếu đúng văn bản; đánh dấu verify cho MUC_HUONG và nhận định ký số XML bắt buộc trước khi triển khai. |
| data/tin_luat.json | Làm rõ phản hồi kiến nghị không tự tạo quy định mới, phân biệt ban hành/hiệu lực/dự thảo; ưu tiên văn bản gốc. Không sửa ngày cập nhật tin cũ để tránh hiểu nhầm đã rà lại toàn bộ tin. |

## Bằng chứng nguồn

- Luật KCB 15/2023/QH15, toàn văn trên Báo điện tử Chính phủ:
  https://xaydungchinhsach.chinhphu.vn/toan-van-luat-15-2023-qh15-kham-benh-chua-benh-119231127164453959.htm
  Đối chiếu các điều 1, 9–13, 45, 60, 69 và 120 dùng cho phần sửa.
- URL nguồn cũ của c22, docid=216500, mở **Luật Bảo vệ bí mật nhà nước 117/2025**, không phải Luật KCB:
  https://vanban.chinhphu.vn/?pageid=27160&docid=216500
- URL cũ docid=214890 ở c21 mở **Quyết định 1720/QĐ-TTg về thi hành kỷ luật**, không chứng minh các nhận định BHYT:
  https://vanban.chinhphu.vn/?pageid=27160&docid=214890
- Luật Phòng bệnh 114/2025:
  https://vanban.chinhphu.vn/?pageid=27160&docid=216498
  PDF gốc: https://datafiles.chinhphu.vn/cpp/files/vbpq/2026/01/luat114-2025.pdf
  Luật có 46 điều. Sửa c16: Điều 18 thông tin dịch bệnh, Điều 20 kiểm dịch, Điều 45 hiệu lực, Điều 46 chuyển tiếp. Các dẫn chiếu cũ Điều 56–80 và Điều 104 không phù hợp với văn bản này. c17/c18 dùng URL này cho luật khác nên không đủ căn cứ.
- Thông tư 25/2026/TT-BYT:
  https://chinhphu.vn/?classid=0&docid=218704&pageid=27160
  Văn bản ký số: https://datafiles.chinhphu.vn/cpp/files/vbpq/2026/7/25-byt.signed.pdf
  Phụ lục: https://datafiles.chinhphu.vn/cpp/files/vbpq/2026/7/25-byt-kem.pdf
  Đã đọc khoản 3–4 Điều 2, Điều 5–6 và Mẫu 03 (trang 9–13 của PDF phụ lục, số trang tính từ 1).

## Kiểm tra đã chạy

- Trước và sau sửa: `node --test test/content-contract.test.mjs test/role-roadmap.test.mjs test/exam-builder.test.mjs`: **45/45 đạt** ở cả hai lượt.
- Parse lại **17 file JSON** trực tiếp trong thư mục data, loại trừ file nháp bị cấm đọc.
- **7 JSON đã sửa**: UTF-8, JSON.stringify 2 space, parse được; đối chiếu đệ quy với bản trước sửa xác nhận không đổi khóa, kiểu, độ dài mảng.
- **4 HTML**: so sánh thẻ HTML và toàn bộ script với bản trước sửa: không thay cấu trúc thẻ hay JavaScript; parse **9 script inline** thành công.
- Không phát hiện ký tự CJK trong 11 file đã sửa.
- Git diff --check: đạt (exit 0); không stage/commit/push.
- Chưa kiểm tra trực quan bằng trình duyệt và chưa chơi lại ca trực 10 câu. Không báo kiểm tra trình duyệt/game đã đạt.

## Việc còn mở và giới hạn

1. c21 (BHYT), c17 (dân số), c18 (chuyển đổi số) còn **14 bước verify**: chưa khôi phục các kết luận, số điều hoặc mốc thời gian thiếu nguồn đúng. c16 còn 2 bước cần đối chiếu chi tiết về tiêm chủng/xử phạt. Không coi phần này là nội dung đã xác nhận.
2. Có khác biệt dữ liệu tồn tại trước đợt sửa: các chương mới c16/c17/c18/c21/c22 dùng `on_nhanh.q/a`, trong khi trang lý thuyết đọc `hoi/dap`; một số `muc_tieu` là mảng. Chưa sửa vì được yêu cầu giữ cấu trúc. Buddy kiểm tra phát hành cần kiểm tra phần hiển thị này trước khi phát hành; nếu sửa phải có phạm vi riêng.
3. Nhãn verify ở các chương mới đặt trong chữ hiện có để giữ schema. Đây không phải bổ sung cờ boolean tự động loại khỏi mọi chế độ luyện tập. Các câu trắc nghiệm KCB xác định sai đã được viết lại theo nguồn, không để đáp án cũ tiếp tục chấm.
4. Nội dung bài giảng và các bản slide/giọng đọc chưa được đồng bộ lại trong phạm vi này. Không sửa các file được đánh dấu chỉnh tay như bai-giang.html, clinic.html, moi-truong-pixel.html.
5. Không sửa bản dữ liệu ở gốc repo vì workflow phát hành dùng app luật y tế/. Không đọc secrets.env, DB, dữ liệu nháp, audio/voices hoặc node_modules.
6. Có thay đổi giao diện cùng lúc từ buddy khác (logo, CSS, service worker và các bản HTML gốc). Danh sách ở trên chỉ là các thay đổi nội dung của tác vụ này; không nhận thay đổi của buddy khác là của mình.
