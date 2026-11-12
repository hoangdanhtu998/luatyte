# Viết test tự động bằng C

Viết test có kiểm tra tự động: so kết quả, in ca nào sai, và chạy lại được mỗi khi sửa code.

Bài trình chiếu đầy đủ nằm trong mục slide của bài này. Bài tập ở cuối trang.

## Nhìn bằng hình

*Hình vẽ gốc, dùng để minh họa thứ tự các bước chính của bài.*

## Một test gồm những gì

- Gọi hàm với đầu vào đã biết.
- So kết quả với giá trị mong đợi.
- Báo pass hoặc fail, nêu rõ ca nào fail.

## Một khung test nhỏ

```
static int dem_loi = 0;

void kiem(const char *ten, int thuc, int mong) {
    if (thuc != mong) {
        printf("FAIL %s: nhan %d, mong %d\n", ten, thuc, mong);
        dem_loi++;
    }
}
```

Mỗi ca là một lời gọi `kiem(...)`. Cuối chương trình in số ca lỗi.

## Test phải đủ nhiều ca

Một test chỉ có ca đúng là chưa đủ. Nên có: ca bình thường, ca biên, ca không hợp lệ, và ca từng gây lỗi trước đây (test hồi quy).

## Năm có phải năm nhuận không?

Quy tắc: năm chia hết cho 400 là nhuận; chia hết cho 4 nhưng không chia hết cho 100 cũng là nhuận. Hãy liệt kê ca test cho năm 2000, 1900, 2024, 2023.

## Kết quả mong đợi

2000 là nhuận (chia hết cho 400). 1900 không nhuận (chia hết cho 100 nhưng không chia hết cho 400). 2024 nhuận. 2023 không nhuận.

## Đặt tên ca như một câu khẳng định

Tên ca nên nói điều được kiểm, để khi ca đỏ người đọc hiểu ngay chỗ hỏng mà không cần mở code.

```
// Tên mơ hồ
test_leap1()

// Tên nói rõ điều kiểm
nam_chia_het_cho_400_la_nhuan()
nam_chia_het_cho_100_khong_chia_het_400_khong_nhuan()
```

*Kiến thức chung, chưa đối chiếu nguồn gốc.*

## Vì sao test phải độc lập

- Mỗi ca tự chuẩn bị dữ liệu, không dựa vào ca chạy trước.
- Đảo thứ tự ca không được làm kết quả đổi.
- Ca lỗi không làm các ca sau bị lỗi theo (lỗi dây chuyền).

*Kiến thức chung, chưa đối chiếu nguồn gốc.*

## Kiểm tra thất bại thì báo gì

```
static int dem_loi = 0;

void kiem(const char *ten, int thuc, int mong) {
    if (thuc != mong) {
        printf("FAIL %s: nhan %d, mong %d\n", ten, thuc, mong);
        dem_loi++;
    }
}

int main(void) {
    kiem("2000 nhuan", is_leap(2000), 1);
    kiem("1900 khong nhuan", is_leap(1900), 0);
    printf("%d ca loi\n", dem_loi);
    return dem_loi != 0;
}
```

Hàm trả về khác 0 khi có lỗi, để công cụ build hoặc CI biết bộ test thất bại.

## Sai ở đâu, và sửa thế nào

## Giải thích chi tiết

**Khung kiểm thử (test framework)**

**Assertion (khẳng định)**

## Giải thích chi tiết

**Kiểm thử hồi quy tự động (automated regression)**

## Điều cần nhớ

- Test tự động so kết quả với mong đợi, không cần nhìn bằng mắt.
- Chọn đủ ca: bình thường, biên, không hợp lệ, hồi quy.
- Chạy lại toàn bộ test sau mỗi lần sửa code.

## Cấu trúc một ca test tự động

Mọi ca test đều có ba phần: chuẩn bị, hành động, kiểm tra.

- Chuẩn bị: tạo dữ liệu đầu vào và trạng thái ban đầu.
- Hành động: gọi đúng một hàm hoặc một thao tác.
- Kiểm tra: so kết quả với giá trị mong đợi, không chỉ kiểm là "không báo lỗi".

Test tốt có tên mô tả đúng điều nó kiểm, ví dụ `nam_chia_het_cho_400_la_nhuan`.

## Viết test cho hàm kiểm năm nhuận

1. Chuẩn bị: danh sách năm 2000, 1900, 2024, 2023.
2. Hành động: với mỗi năm, gọi `is_leap(year)`.
3. Kiểm tra: 2000 phải trả 1, 1900 phải trả 0, 2024 phải trả 1, 2023 phải trả 0.
4. Khi một ca sai, in tên ca và giá trị nhận được, rồi đếm số ca lỗi ở cuối chương trình.

## Ba khái niệm của WebDriver

- **Session**: một phiên làm việc giữa code test và trình duyệt.
- **Locator**: cách xác định một phần tử trên trang.
- **Wait**: chờ phần tử sẵn sàng, không chờ cố định bằng số giây.

*Nguồn: Selenium WebDriver documentation (selenium.dev), mục WebDriver [đã đọc].*

## Thực hành: làm ngay trên app mô phỏng

Đọc xong lý thuyết, mở [trang thực hành](thuc-hanh.html?id=test-tu-dong). Bên trái là app đang test, bên phải là trợ giảng. Bấm **Chạy demo** để xem mẫu, rồi tự làm các bài.

## Đọc thêm: Test Automation

- **Elemental Selenium Tips** (bài viết).
- **Evil Tester** (playlist): các ví dụ tự động hóa có mã lệnh.

Nguồn: github.com/PaulWaltersDev/FreeLearningResourcesForSoftwareTesters, mục "Test Automation". Tìm tên tài liệu trong repo để lấy liên kết.

