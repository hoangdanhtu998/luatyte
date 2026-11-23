# K12: kiểm thử đăng nhập bằng mã lớp và PIN

Học sinh đăng nhập bằng thẻ có mã lớp và PIN 4 số, không cần email. Kiểm giới hạn thử sai, khóa, và quyền riêng tư.

Bài trình chiếu đầy đủ nằm trong mục slide của bài này. Bài tập ở cuối trang.

## Nhìn bằng hình

*Hình vẽ gốc, dùng để minh họa thứ tự các bước chính của bài.*

## Thẻ đăng nhập in ra giấy

Giáo viên in thẻ cho cả lớp. Mỗi thẻ có mã lớp và PIN 4 số. Ai cầm được thẻ là vào được tài khoản. Vậy app phải chống dò PIN thế nào, và khi nào được cấp lại PIN?

*Nguồn: Thư viện Học liệu K12 (README và backend/tests của repo), đã đọc. Thông tin lấy từ README: đăng nhập bằng thẻ do giáo viên in.*

## PIN 4 số có bao nhiêu khả năng?

Chỉ có 10.000 PIN có thể (0000 đến 9999). Nếu không giới hạn số lần thử, một máy có thể thử hết trong vài phút. Vì vậy giới hạn thử sai là yêu cầu bảo mật thật, không phải tính năng phụ.

*Kiến thức chung.*

## Giới hạn trong app thật

| Quy tắc | Giá trị trong mã nguồn |
| --- | --- |
| Số lần gửi mã đăng nhập mỗi IP trong 15 phút | 20 |
| Số lần nhập PIN sai mỗi IP trong 15 phút | 30 |

*Nguồn: Thư viện Học liệu K12 (README và backend/tests của repo), đã đọc. Hằng số IP_CODES_15M và IP_PIN_FAILS_15M trong backend/app/routers/auth_routes.py.*

## Kiểm giới hạn đúng cách

1. Nhập sai 29 lần: vẫn cho nhập tiếp.
2. Nhập sai lần thứ 30: báo lỗi và tạm khóa IP đó.
3. Đợi hết 15 phút: cho nhập lại.
4. Thử từ IP khác: không bị khóa theo IP đầu tiên.
5. Đăng nhập đúng xong, số lần sai có được đặt lại không? (Cần đọc code để biết, rồi kiểm.)

*Ca 1 đến 4 là suy ra từ hằng số. Ca 5 là câu hỏi mở tester phải kiểm chứng.*

## Test có trong repo

- **test_login_code_limits_per_ip**: kiểm giới hạn mã đăng nhập theo IP.
- **test_classroom_pin_login_and_data_rights**: đăng nhập bằng PIN và quyền dữ liệu.
- **test_sessions_revocable_and_self_delete**: phiên có thể thu hồi, tài khoản có thể tự xóa.

*Nguồn: Thư viện Học liệu K12 (README và backend/tests của repo), đã đọc. Tên test lấy từ backend/tests/test_api.py.*

## Thông báo lỗi không lộ thông tin

| Nên | Không nên |
| --- | --- |
| "Mã lớp hoặc PIN không đúng" | "Lớp này không tồn tại" (lộ danh sách lớp) |
| Chậm lại sau nhiều lần sai | Trả về nhanh hơn khi sai (lộ thông tin qua thời gian) |

*Kiến thức chung.*

## Viết kịch bản dò PIN

Viết bằng ngôn ngữ thường: làm sao kiểm rằng giới hạn thật sự hoạt động, mà không làm khóa cả lớp khi test? Gợi ý: dùng một IP test và một lớp test riêng.

## Tính thời gian dò

Nếu không có giới hạn, và mỗi lần thử mất 0,2 giây, dò hết 10.000 PIN mất bao lâu? Có giới hạn 30 lần mỗi 15 phút thì sao?

## Sai ở đâu, và sửa thế nào

## Giải thích chi tiết

**PIN**

**Giới hạn tốc độ (rate limit)**

## Giải thích chi tiết

**Khóa tạm (lockout)**


## Thực hành: giới hạn thử PIN

Mở [trang thực hành](thuc-hanh.html?id=k12-dang-nhap-pin) để làm bài mô phỏng ngay trên trình duyệt.
