# Web: kiểm thử theo luồng người dùng

Kiểm thử trang web từ góc nhìn người dùng: đi qua một luồng hoàn chỉnh trên trình duyệt thật, không chỉ gọi hàm.

Bài trình chiếu đầy đủ nằm trong mục slide của bài này. Bài tập ở cuối trang.

## Nhìn bằng hình

*Hình vẽ gốc, dùng để minh họa thứ tự các bước chính của bài.*

## Luồng người dùng

Một luồng là chuỗi việc người dùng làm để đạt một mục tiêu, ví dụ: mở trang, đăng nhập, thêm sản phẩm vào giỏ, thanh toán. Kiểm thử luồng quan trọng hơn kiểm từng nút riêng lẻ.

## Điều kiện trước và điều kiện sau

- Trước: tài khoản tồn tại, giỏ hàng đang rỗng.
- Sau: đơn hàng được tạo, email xác nhận được gửi, số lượng tồn kho giảm đúng bằng số đã bán.

## Luồng đăng nhập

```
1. Mở /dang-nhap
2. Nhập email hợp lệ, mật khẩu đúng
3. Bấm "Đăng nhập"
Kỳ vọng: chuyển sang trang chủ, hiện tên người dùng
```

## Chạy trên trình duyệt thật

Công cụ tự động như Playwright hoặc Selenium mở trình duyệt, điền form, bấm nút và kiểm nội dung trên màn hình. Mỗi ca nên chạy trên ít nhất hai trình duyệt.

## Một luồng, nhiều tầng kiểm

| Tầng | Kiểm gì | Ví dụ |
| --- | --- | --- |
| Giao diện | Nút, thông báo, chuyển trang | Bấm Thanh toán thì hiện trang xác nhận |
| Dữ liệu | Bản ghi đơn hàng được tạo đúng | Đơn có đúng tổng tiền và trạng thái |
| Tích hợp | Dịch vụ thanh toán nhận yêu cầu | Giao dịch thử được ghi nhận |
| Ngoài hệ thống | Email xác nhận đã gửi | Hộp thư nhận được email trong 1 phút |

*Kiến thức chung, chưa đối chiếu nguồn gốc.*

## Kịch bản luồng bằng ngôn ngữ nghiệp vụ

```
Kịch bản: Mua hàng bằng thẻ thử
Dữ liệu: tài khoản test01, sản phẩm A giá 100.000 đ
1. Đăng nhập test01
2. Thêm sản phẩm A vào giỏ
3. Kiểm: giỏ có 1 sản phẩm, tổng 100.000 đ
4. Thanh toán bằng thẻ thử
5. Kiểm: trang "Đặt hàng thành công" hiện mã đơn
6. Kiểm: đơn có trạng thái "Đã thanh toán"
```

*Kiến thức chung, chưa đối chiếu nguồn gốc.*

## Dọn dẹp sau khi chạy

Luồng để lại đơn hàng và tài khoản. Mỗi lần chạy nên dùng dữ liệu riêng hoặc dọn sau khi xong, để ca sau không bị lẫn dữ liệu.

*Kiến thức chung, chưa đối chiếu nguồn gốc.*

## Sai ở đâu, và sửa thế nào

**Thuật ngữ trong slide này:** **Điều kiện trước (precondition)**: Trạng thái cần có trước khi bắt đầu một ca. Nếu không đúng, ca không có ý nghĩa.

## Giải thích chi tiết

**Luồng người dùng (user flow)**

**Điều kiện trước (precondition)**

## Giải thích chi tiết

**Locator (bộ định vị)**

## Điều cần nhớ

- Viết ca theo luồng người dùng, có điều kiện trước và kết quả sau.
- Kiểm trên trình duyệt thật, không chỉ môi trường giả lập.

**Thuật ngữ trong slide này:** **Luồng người dùng (user flow)**: Chuỗi việc người dùng làm để đạt mục tiêu, từ bước đầu đến lúc xong. · **Điều kiện trước (precondition)**: Trạng thái cần có trước khi bắt đầu một ca. Nếu không đúng, ca không có ý nghĩa.

## Viết ca theo luồng và kiểm từng bước

Mỗi bước trong luồng cần một kiểm tra riêng. Nếu bước nào sai thì dừng và ghi lại đúng bước đó.

- Điều kiện trước: trạng thái ban đầu rõ ràng.
- Mỗi bước: hành động và kết quả mong đợi của bước đó.
- Điều kiện sau: dữ liệu và thông báo cuối cùng.
- Thử thêm đường đi lỗi: bấm nút hai lần, quay lại giữa chừng.

**Thuật ngữ trong slide này:** **Điều kiện trước (precondition)**: Trạng thái cần có trước khi bắt đầu một ca. Nếu không đúng, ca không có ý nghĩa.

## Luồng thêm vào giỏ và thanh toán

1. Bước 1: mở trang sản phẩm, kiểm giá hiển thị đúng.
2. Bước 2: thêm vào giỏ, kiểm số lượng trên biểu tượng giỏ tăng 1.
3. Bước 3: vào giỏ, kiểm tổng tiền đúng.
4. Bước 4: thanh toán, kiểm trang xác nhận hiện đúng mã đơn.
5. Đường lỗi: bấm "Thanh toán" hai lần, kiểm chỉ có một đơn được tạo.

## Tách lớp trang khỏi kịch bản

Khi mỗi bước của luồng đăng nhập, thanh toán nằm trong một lớp trang riêng, luồng test đọc như mô tả nghiệp vụ. Nếu giao diện đổi, chỉ sửa lớp trang.

*Nguồn: Martin Fowler, Page Object [đã đọc].*

## Đọc thêm: Mục mở rộng (liên quan Test Automation)

- **Selenium**, **WebdriverIO**, **Page Object Pattern** (Martin Fowler): viết ca theo luồng người dùng.

Nguồn: github.com/PaulWaltersDev/FreeLearningResourcesForSoftwareTesters, mục "Mục mở rộng (liên quan Test Automation)". Tìm tên tài liệu trong repo để lấy liên kết.

**Thuật ngữ trong slide này:** **Luồng người dùng (user flow)**: Chuỗi việc người dùng làm để đạt mục tiêu, từ bước đầu đến lúc xong.

