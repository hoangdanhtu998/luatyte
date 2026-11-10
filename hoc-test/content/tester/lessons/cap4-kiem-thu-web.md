# Kiểm thử giao diện web và đa trình duyệt

Trang web phải chạy đúng trên nhiều trình duyệt, kích thước màn hình và thiết bị khác nhau.

Bài trình chiếu đầy đủ nằm trong mục slide của bài này. Bài tập ở cuối trang.

## Nhìn bằng hình

*Hình vẽ gốc, dùng để minh họa thứ tự các bước chính của bài.*

## Ma trận kiểm thử

Lập bảng: trình duyệt nào, phiên bản nào, thiết bị nào, và ca nào cần chạy. Không cần thử hết mọi tổ hợp, chỉ thử các tổ hợp người dùng thật hay dùng.

## Kiểm bố cục theo kích thước màn hình

- Điện thoại hẹp: nội dung có bị tràn ngang không?
- Máy tính: bảng có bị cắt không?
- Phóng to chữ: nút có còn bấm được không?

## Một bảng ghi kết quả

| Trình duyệt | Điện thoại | Kết quả |
| --- | --- | --- |
| Chrome | Không | Đạt |
| Safari | Có | Lỗi nút Gửi |

## Công cụ kiểm trên nhiều trình duyệt

Có thể dùng công cụ tự động mở nhiều trình duyệt, chạy cùng một kịch bản và chụp ảnh màn hình để so sánh.

## Sai ở đâu, và sửa thế nào

## Giải thích chi tiết

**Đa trình duyệt (cross-browser)**

**Engine trình duyệt**

## Giải thích chi tiết

**Responsive**

## Điều cần nhớ

- Chọn tổ hợp trình duyệt và thiết bị theo người dùng thật.
- Kiểm cả bố cục và chức năng.

## Ma trận trình duyệt và thiết bị

Không thể thử hết mọi tổ hợp. Chọn tổ hợp người dùng thật hay dùng nhất.

- Xem số liệu trình duyệt của người dùng trong công cụ thống kê.
- Ưu tiên: trình duyệt phổ biến nhất, và một trình duyệt khác engine.
- Thiết bị: điện thoại phổ biến và máy tính, mỗi loại thử ít nhất một kích thước.

## Lập ma trận cho trang thanh toán

1. Chọn 3 trình duyệt: Chrome, Safari, Firefox.
2. Chọn 2 thiết bị: điện thoại 390px và máy tính 1280px.
3. Chạy cùng một luồng thanh toán trên 6 tổ hợp.
4. Ghi kết quả vào bảng: đạt, lỗi kèm ảnh chụp, ghi chú.

## Chạy trên trình duyệt thật

WebDriver điều khiển trình duyệt gốc theo cách người dùng thao tác. Vì vậy một kịch bản có thể chạy trên nhiều trình duyệt, nhưng vẫn cần kiểm sự khác biệt giữa các trình duyệt.

*Nguồn: Selenium WebDriver documentation (selenium.dev), mục WebDriver [đã đọc].*

## Đọc thêm: Mục mở rộng (không có mục riêng trong repo)

- Trình bày ma trận trình duyệt: tham khảo **Selenium** và **WebdriverIO** trong mục Test Automation.

Nguồn: github.com/PaulWaltersDev/FreeLearningResourcesForSoftwareTesters, mục "Mục mở rộng (không có mục riêng trong repo)". Tìm tên tài liệu trong repo để lấy liên kết.

