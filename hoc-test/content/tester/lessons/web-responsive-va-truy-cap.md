# Web: kiểm thử responsive và khả năng truy cập

Kiểm bố cục trên nhiều kích thước màn hình, dùng bàn phím, đọc được bằng trình đọc màn hình, và tương phản màu đủ cao.

Bài trình chiếu đầy đủ nằm trong mục slide của bài này. Bài tập ở cuối trang.

## Nhìn bằng hình

*Hình vẽ gốc, dùng để minh họa thứ tự các bước chính của bài.*

## Các mốc kích thước cần thử

| Thiết bị | Chiều rộng |
| --- | --- |
| Điện thoại | 360 đến 430 px |
| Máy tính bảng | 768 đến 1024 px |
| Máy tính | 1280 px trở lên |

## Khả năng truy cập

- Dùng được hoàn toàn bằng bàn phím, có thấy vị trí con trỏ focus.
- Ảnh có mô tả thay thế (alt).
- Form có nhãn rõ ràng.

**Thuật ngữ trong slide này:** **Focus (tiêu điểm)**: Phần tử đang được chọn khi dùng bàn phím, thường có viền nổi lên.

## Tương phản màu

Ngưỡng cho chữ thường là 4,5 : 1. Nên chọn màu đậm hơn một chút để an toàn.

## Kiểm tự động và bằng tay

Công cụ kiểm tương phản và kiểm truy cập tự động bắt được nhiều lỗi cơ bản. Lỗi về thứ tự đọc, bẫy bàn phím và cách trình đọc màn hình đọc nội dung vẫn cần kiểm bằng tay.

**Thuật ngữ trong slide này:** **Truy cập (accessibility, a11y)**: Làm cho người khiếm thị, không dùng chuột, hoặc dùng trình đọc màn hình vẫn dùng được sản phẩm.

## Kiểm bàn phím

1. Bấm Tab từ đầu trang, quan sát thứ tự focus.
2. Mỗi phần tử focus có viền nhìn thấy được.
3. Mở hộp thoại bằng bàn phím, thoát bằng Esc, focus quay lại nút đã mở.

*Kiến thức chung, chưa đối chiếu nguồn gốc.*

**Thuật ngữ trong slide này:** **Focus (tiêu điểm)**: Phần tử đang được chọn khi dùng bàn phím, thường có viền nổi lên.

## Kiểm nhãn và trình đọc

| Thành phần | Cần có |
| --- | --- |
| Ô nhập | Nhãn liên kết với ô (label) |
| Ảnh chức năng | Mô tả thay thế (alt) nói chức năng |
| Ảnh trang trí | alt rỗng để trình đọc bỏ qua |
| Thông báo lỗi | Gắn với ô sai, được đọc khi xuất hiện |

*Kiến thức chung, chưa đối chiếu nguồn gốc.*

## Tương phản màu

Với chữ thường, tỉ lệ tương phản tối thiểu thường được nêu là 4,5 : 1. Công cụ kiểm tương phản tự động có thể đo, nhưng tester vẫn cần xem chữ trên nền có dễ đọc không, đặc biệt khi phóng to.

*Kiến thức chung, chưa đối chiếu nguồn gốc.*

**Thuật ngữ trong slide này:** **Tỉ lệ tương phản (contrast ratio)**: Độ khác biệt giữa màu chữ và màu nền. Càng cao càng dễ đọc.

## Sai ở đâu, và sửa thế nào

## Giải thích chi tiết

**Truy cập (accessibility, a11y)**

**Thuộc tính alt**

## Giải thích chi tiết

**Tỉ lệ tương phản (contrast ratio)**

**Focus (tiêu điểm)**

## Điều cần nhớ

- Thử nhiều kích thước màn hình, không chỉ một.
- Kiểm bàn phím, nhãn form và tương phản màu.

## Kiểm truy cập bằng bàn phím và trình đọc

Truy cập không chỉ là màu sắc. Người dùng khiếm thị hoặc không dùng chuột cần đi qua được toàn bộ trang.

- Bấm Tab: thứ tự focus phải theo thứ tự đọc.
- Mỗi nút và ô nhập có nhãn đọc được.
- Ảnh có mô tả thay thế; ảnh trang trí để alt rỗng.
- Không có bẫy bàn phím: luôn thoát được khỏi hộp thoại bằng Esc.

**Thuật ngữ trong slide này:** **Truy cập (accessibility, a11y)**: Làm cho người khiếm thị, không dùng chuột, hoặc dùng trình đọc màn hình vẫn dùng được sản phẩm. · **Focus (tiêu điểm)**: Phần tử đang được chọn khi dùng bàn phím, thường có viền nổi lên.

## Kiểm form đăng ký bằng bàn phím

1. Đặt con trỏ ở đầu trang, bấm Tab liên tục.
2. Kiểm mỗi ô nhập được focus và có viền nhìn thấy được.
3. Kiểm nút "Đăng ký" nhận focus và bấm được bằng Enter.
4. Kiểm lỗi hiện ra gần ô sai và được đọc to bởi trình đọc màn hình.

**Thuật ngữ trong slide này:** **Focus (tiêu điểm)**: Phần tử đang được chọn khi dùng bàn phím, thường có viền nổi lên.

## Các mốc màn hình cần thử

- Điện thoại hẹp (khoảng 360 đến 430 px).
- Máy tính bảng (khoảng 768 đến 1024 px).
- Máy tính (từ 1280 px).

*Kiến thức chung, chưa đối chiếu nguồn gốc. Các mốc chỉ là gợi ý, nên lấy từ số liệu người dùng thật.*

## Đọc thêm: Mục mở rộng (liên quan Test Automation)

- Repo không có mục riêng về khả năng truy cập. Tham khảo bộ công cụ tự động trong mục Test Automation.

Nguồn: github.com/PaulWaltersDev/FreeLearningResourcesForSoftwareTesters, mục "Mục mở rộng (liên quan Test Automation)". Tìm tên tài liệu trong repo để lấy liên kết.

**Thuật ngữ trong slide này:** **Truy cập (accessibility, a11y)**: Làm cho người khiếm thị, không dùng chuột, hoặc dùng trình đọc màn hình vẫn dùng được sản phẩm.

