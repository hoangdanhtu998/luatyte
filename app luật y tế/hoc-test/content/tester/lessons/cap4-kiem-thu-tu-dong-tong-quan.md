# Kiểm thử tự động: tổng quan

Khi nào nên tự động hóa, quy trình, tháp kiểm thử và các lỗi thường gặp với test tự động.

Bài trình chiếu đầy đủ nằm trong mục slide của bài này. Bài tập ở cuối trang.

## Nhìn bằng hình

*Hình vẽ gốc, dùng để minh họa thứ tự các bước chính của bài.*

## Nên tự động hóa cái gì

- Ca chạy lặp lại nhiều lần, ví dụ kiểm hồi quy.
- Ca ổn định, ít thay đổi giao diện.
- Ca tốn công làm bằng tay, ví dụ nhập dữ liệu hàng loạt.

## Quy trình ba bước

```
1. Viết kịch bản: đầu vào, hành động, kết quả mong đợi
2. Chạy tự động trên môi trường giống thật
3. Đọc kết quả, sửa kịch bản hoặc sửa lỗi
```

## Một ca đăng nhập tự động

```
dang_nhap("user", "sai-mat-khau")
kiem(thong_bao == "Sai mật khẩu")
```

Kịch bản đơn giản, dễ đọc, chạy lại được sau mỗi lần sửa code.

## Test không ổn định (flaky)

Lúc đậu lúc hỏng dù code không đổi. Thường do thời gian chờ, dữ liệu chung, hoặc giao diện tải chậm.

Cách xử lý: chờ đúng điều kiện thay vì chờ cố định, và để mỗi test có dữ liệu riêng.

## Có nên tự động không?

Ca "kiểm giao diện logo đúng màu một lần khi ra mắt" không nên tự động: nó chỉ chạy một lần, và nhận ra màu đúng cần mắt người.

## Vì sao test không ổn định

| Nguyên nhân | Triệu chứng | Cách xử lý |
| --- | --- | --- |
| Chờ theo số giây cố định | Đậu khi máy nhanh, hỏng khi máy chậm | Chờ theo điều kiện |
| Dữ liệu dùng chung | Ca này làm ca kia lỗi | Mỗi ca tạo dữ liệu riêng |
| Phụ thuộc mạng hoặc dịch vụ ngoài | Hỏng ngẫu nhiên | Dùng bản giả (mock) hoặc môi trường cố định |
| Phụ thuộc thời gian | Hỏng vào một giờ nhất định | Truyền thời gian vào như tham số |

*Nguồn: Selenium WebDriver documentation (selenium.dev) [đã đọc, phần khái niệm]. Các nguyên nhân khác là kiến thức chung.*

**Thuật ngữ trong slide này:** **Chờ theo điều kiện (explicit wait)**: Chờ đến khi một điều kiện đúng, thay vì chờ cố định bao nhiêu giây.

## Chờ đúng điều kiện

```
// Không tốt: chờ cứng
sleep(5);
click("Gửi");

// Tốt: chờ đến khi nút sẵn sàng, tối đa 10 giây
wait_until(nut_gui_hien_thi, timeout=10);
click("Gửi");
```

*Nguồn: Selenium WebDriver documentation (selenium.dev) [đã đọc, phần khái niệm].*

## Tháp tự động hóa

Tháp tự động hóa cũng áp dụng như tháp kiểm thử: nhiều ca đơn vị, ít ca giao diện. Nếu đội có nhiều ca giao diện chậm và hay hỏng, nên chuyển bớt xuống mức đơn vị hoặc tích hợp.

*Kiến thức chung, chưa đối chiếu nguồn gốc.*

**Thuật ngữ trong slide này:** **Tự động hóa (automation)**: Dùng máy để chạy các ca kiểm thử lặp lại, thay cho công làm tay.

## Quy trình khi một ca đỏ

1. Chạy lại một lần để xem có ổn định không.
2. Nếu hỏng đều, tìm lỗi thật trong sản phẩm, báo lỗi kèm log.
3. Nếu hỏng ngẫu nhiên, đánh dấu ca không ổn định và sửa nguyên nhân, không xóa ca.

*Kiến thức chung, chưa đối chiếu nguồn gốc.*

## Sai ở đâu, và sửa thế nào

## Giải thích chi tiết

**Test không ổn định (flaky test)**

**Chờ theo điều kiện (explicit wait)**

## Giải thích chi tiết

**Tự động hóa (automation)**

## Điều cần nhớ

- Tự động hóa ca lặp lại và ổn định.
- Giữ test không ổn định ở mức thấp, vì nó làm mất niềm tin vào bộ test.

**Thuật ngữ trong slide này:** **Test không ổn định (flaky test)**: Ca test lúc đậu lúc hỏng dù code không đổi. · **Tự động hóa (automation)**: Dùng máy để chạy các ca kiểm thử lặp lại, thay cho công làm tay.

## Khi nào nên tự động hóa và khi nào không

Tự động hóa có chi phí viết và bảo trì. Chỉ nên làm khi lợi ích lớn hơn chi phí.

- Nên: ca chạy lại nhiều lần, ca ổn định, ca kiểm hồi quy.
- Không nên: ca chỉ chạy một lần, giao diện đang thay đổi liên tục, ca cần đánh giá cảm nhận.

**Thuật ngữ trong slide này:** **Tự động hóa (automation)**: Dùng máy để chạy các ca kiểm thử lặp lại, thay cho công làm tay.

## Đếm ca đậu trong một lần chạy

1. Chạy bộ test và thu kết quả của từng ca: 1 là đậu, 0 là hỏng.
2. Đếm số ca đậu, tính số ca hỏng bằng tổng trừ số đậu.
3. Ví dụ: 4 ca, kết quả 1 1 0 1, đậu 3, hỏng 1.
4. Ghi tên ca hỏng để người sửa biết chỗ cần xem.

## Chờ đúng điều kiện

Nguyên nhân phổ biến của test không ổn định là chờ theo số giây cố định. WebDriver có cơ chế chờ theo điều kiện, ví dụ chờ phần tử hiển thị rồi mới thao tác.

- Chờ theo điều kiện: nhanh hơn và ít lỗi hơn.
- Chờ cố định: chậm khi máy nhanh, vẫn lỗi khi máy chậm.

*Nguồn: Selenium WebDriver documentation (selenium.dev), mục WebDriver [đã đọc]. Ý về chờ theo điều kiện là cách làm chung [kiến thức chung].*

**Thuật ngữ trong slide này:** **Test không ổn định (flaky test)**: Ca test lúc đậu lúc hỏng dù code không đổi. · **Chờ theo điều kiện (explicit wait)**: Chờ đến khi một điều kiện đúng, thay vì chờ cố định bao nhiêu giây.

## Giữ logic kiểm tra ở đâu

Martin Fowler khuyên tách thao tác trên trang khỏi kịch bản. Assertion nên giữ ngoài lớp trang, trừ kiểm tra trạng thái bất biến. Điều này giúp đổi giao diện mà không phải sửa kịch bản.

*Nguồn: Martin Fowler, Page Object [đã đọc].*

## Đọc thêm: Test Automation

- **Test Automation University** (khóa học miễn phí).
- **Selenium**, **Postman**, **WebdriverIO** (tài liệu chính thức).

Nguồn: github.com/PaulWaltersDev/FreeLearningResourcesForSoftwareTesters, mục "Test Automation". Tìm tên tài liệu trong repo để lấy liên kết.

**Thuật ngữ trong slide này:** **Tự động hóa (automation)**: Dùng máy để chạy các ca kiểm thử lặp lại, thay cho công làm tay.

