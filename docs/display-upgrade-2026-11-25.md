# Tùy chỉnh giao diện — 25/11/2026

## Cách sử dụng

Bấm **Tùy chỉnh hiển thị** ở đầu Luatyte hoặc trong thanh điều hướng QA Hub.

- Đổi tên hiển thị và mô tả ngắn; chữ chỉ thay ở nhận diện đầu trang.
- Chọn logo PNG, JPEG hoặc WebP tối đa 512 KB. Ảnh được thu về tối đa 256 px, giữ tỉ lệ và nền trong suốt.
- Xem trước rồi bấm **Lưu hiển thị**. **Hủy**, **Đóng** hoặc Escape không áp dụng bản chưa lưu.
- **Khôi phục mặc định** đưa bản xem trước về mặc định; bấm Lưu để áp dụng.
- **Xuất tùy chỉnh** tải tệp JSON của bản đang xem trước. **Nhập tùy chỉnh** đọc lại tệp của cùng ứng dụng rồi chờ người dùng bấm Lưu.

Tùy chỉnh chỉ thuộc trình duyệt và địa chỉ đang mở (localStorage). Không có tài khoản quản trị hay cập nhật công khai cho mọi người. Dùng nhập/xuất để chuyển máy. Khi xóa dữ liệu trang, tùy chỉnh cũng mất; logo và tên mặc định vẫn nằm trong mã nguồn.

## Phạm vi

- Luatyte: trang chủ, Lý thuyết, Tin luật và Tham chiếu, ở cả thư mục gốc lẫn `app luật y tế/`. Trang con giữ nguyên h1 và nội dung, chỉ thêm liên kết nhận diện quay về sổ tay. Không sửa các trang canvas/bài giảng chỉnh tay.
- QA Hub: nhận diện sidebar, khoảng cách/kiểu chữ, bố cục điều hướng di động. Tùy chọn màu/phông chữ nằm trong mục có thể mở/đóng, mặc định gọn trên điện thoại.
- Logo mặc định: sách và dấu cộng y tế cho Luatyte; cặp ngoặc và dấu kiểm cho QA Hub. SVG tự vẽ, không thêm dịch vụ hoặc thư viện.

Không thay đổi nội dung luật, câu hỏi, dữ liệu test case, bug, báo cáo, schema hoặc API. Không commit/push/deploy.

## Chi tiết kỹ thuật

`display-settings.js` là script độc lập, dùng DOM/textContent cho văn bản. Chỉ chấp nhận ảnh raster từ máy; JSON nhập có giới hạn dung lượng và phân biệt ứng dụng. Lỗi localStorage có thông báo, không báo lưu thành công. Khoá `luatyte-display-v1` nằm ngoài tiền tố tiến độ `lyt_`; QA Hub dùng `qa-hub-display-v1`.

`display-settings.css` chỉ định dạng bộ chỉnh hiển thị; `display-polish.css` định dạng bố cục từng app. Logo dùng object-fit: contain, có focus bàn phím, dialog native và bố cục 320 px. Service worker Luatyte tăng phiên bản và thêm tài nguyên mới vào bộ cache.

## Kết quả kiểm tra cuối

- Luatyte gốc: `node scripts/check-local.mjs` — 77/77 test + security smoke 8/8.
- Giao diện Luatyte: 16 kiểm tra bằng Chrome trên hai thư mục gốc/app học — 320, 390 và 1280 px; lưu qua tải lại; dùng lại trên trang con; dialog 320 px; không có pageerror. Đã mở xem ảnh chụp.
- QA Hub: `npx.cmd playwright test tests/display-settings.spec.mjs tests/responsive.spec.mjs tests/style-panel.spec.mjs tests/smoke.spec.mjs tests/keyboard.spec.mjs tests/a11y.spec.mjs` — 36/36 pass (Chromium/Chrome, 1.1 phút).
- QA Hub dialog ở 320 px: axe WCAG 2 A/AA không có lỗi serious/critical.
- `node --check` phần JavaScript mới và service worker; `git diff --check` đều đạt.
- Chưa chạy toàn bộ bộ test QA Hub hoặc Firefox/WebKit; chưa deploy.
- `tests/responsive.spec.mjs` được sửa bộ chọn menu chính vì trang có hai liên kết “Lỗi tìm thấy”.
- QA Hub sinh thêm `.test-data/`, `playwright-report/` và `results/` khi chạy test; đây là dữ liệu/báo cáo kiểm thử, không thuộc mã nguồn cần phát hành.
