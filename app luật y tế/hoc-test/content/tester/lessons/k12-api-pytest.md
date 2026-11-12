# K12: viết kiểm thử API bằng pytest

Đọc một bộ test API thật, học cách đặt tên ca, dùng dữ liệu riêng cho từng ca, và kiểm mã trạng thái HTTP.

Bài trình chiếu đầy đủ nằm trong mục slide của bài này. Bài tập ở cuối trang.

## Nhìn bằng hình

*Hình vẽ gốc, dùng để minh họa thứ tự các bước chính của bài.*

## Một bộ test 49 ca

Thư viện K12 có 49 hàm test trong backend/tests. Mỗi hàm kiểm một chức năng. Làm sao đọc nhanh một bộ test như vậy, và viết ca mới theo cùng cách?

*Nguồn: Thư viện Học liệu K12 (README và backend/tests của repo), đã đọc. Đếm số hàm test_ trong thư mục backend/tests.*

## Một ca API gồm ba bước

```
def test_csrf_header_required(client):
    # 1. Chuẩn bị: tạo dữ liệu, đăng nhập
    # 2. Hành động: gửi yêu cầu ghi thiếu header
    r = client.post("/api/...", json={...})
    # 3. Kiểm tra: mã trạng thái và trạng thái dữ liệu
    assert r.status_code == 403
```

*Cấu trúc chung. Tên hàm và header là minh họa, không phải nguyên văn test trong repo.*

**Thuật ngữ trong slide này:** **CSRF (cross-site request forgery)**: Kẻ tấn công lừa trình duyệt của người dùng gửi yêu cầu ghi mà người đó không định làm.

## Tên nói điều được kiểm

| Tên tốt | Tên kém |
| --- | --- |
| test_login_code_limits_per_ip | test_login_2 |
| test_csrf_header_required | test_security |
| test_deck_batch_cut_keeps_complete_slides | test_deck |

*Nguồn: Thư viện Học liệu K12 (README và backend/tests của repo), đã đọc. Các tên bên trái là tên thật trong backend/tests/test_api.py.*

**Thuật ngữ trong slide này:** **CSRF (cross-site request forgery)**: Kẻ tấn công lừa trình duyệt của người dùng gửi yêu cầu ghi mà người đó không định làm.

## Mỗi ca tự tạo dữ liệu riêng

Nếu hai ca cùng dùng một email, ca này tạo tài khoản thì ca kia lỗi "email đã tồn tại". Mỗi ca nên tạo dữ liệu riêng và dọn sau khi xong.

*Kiến thức chung.*

## Kiểm đúng mã, không chỉ "có lỗi"

| Tình huống | Mã nên trả về |
| --- | --- |
| Gửi yêu cầu ghi thiếu CSRF header | 403 (hoặc mã từ chối tương đương) |
| Đăng ký khi đã đóng | 403 |
| Thiếu điều khoản đồng ý | 400 |
| Đăng nhập sai quá nhiều | 429 |

*Mã 403 và 429 là chuẩn HTTP chung. Mã cụ thể của app cần kiểm trong code trước khi ghi vào đặc tả.*

**Thuật ngữ trong slide này:** **CSRF (cross-site request forgery)**: Kẻ tấn công lừa trình duyệt của người dùng gửi yêu cầu ghi mà người đó không định làm.

## Viết một ca mới

Viết ý tưởng cho một ca mới: đăng ký không có tên đăng nhập, hoặc tên có ký tự đặc biệt. Nêu dữ liệu, hành động, và kết quả mong đợi, chưa cần viết code.

## Đọc ca của người khác

Chọn một hàm test trong repo, tóm tắt bằng ba câu: chuẩn bị gì, làm gì, kiểm gì. Nếu không tóm tắt được, hãy ghi lại điều còn chưa rõ.

## Sai ở đâu, và sửa thế nào

## Giải thích chi tiết

**API**

**pytest**

## Giải thích chi tiết

**CSRF (cross-site request forgery)**

