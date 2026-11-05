# Web: kiểm thử form và bảo mật cơ bản

Kiểm dữ liệu đầu vào, thông báo lỗi, phiên đăng nhập và các lỗi bảo mật thường gặp như XSS và SQL injection.

Bài trình chiếu đầy đủ nằm trong mục slide của bài này. Bài tập ở cuối trang.

## Nhìn bằng hình

*Hình vẽ gốc, dùng để minh họa thứ tự các bước chính của bài.*

## Kiểm đầu vào hợp lệ và không hợp lệ

- Hợp lệ: email đúng định dạng, mật khẩu đủ độ dài.
- Không hợp lệ: để trống, quá dài, sai định dạng, ký tự đặc biệt.
- Ranh giới: đúng 10 ký tự và 9 ký tự với mật khẩu yêu cầu 10.

## Lỗi bảo mật thường gặp

- XSS: chèn script vào ô nhập, rồi kiểm xem script có chạy khi hiển thị không.
- SQL injection: nhập ký tự như ' OR '1'='1 để xem câu truy vấn có bị ảnh hưởng.

**Thuật ngữ trong slide này:** **SQL injection**: Lỗ hổng khi đầu vào của người dùng được ghép thẳng vào câu truy vấn cơ sở dữ liệu, làm đổi nghĩa câu truy vấn.

## Kiểm mật khẩu

```
Yêu cầu: tối thiểu 10 ký tự, có chữ và có số
"abc123" → từ chối (ngắn)
"abcdefghi1" → chấp nhận
"abcdefghij" → từ chối (không có số)
```

## Phiên đăng nhập

Sau khi đăng xuất, quay lại bằng nút Back không được vào trang riêng tư. Phiên hết hạn sau một thời gian không hoạt động.

## Kiểm ở máy chủ

Mọi kiểm tra ở trình duyệt có thể bị bỏ qua bằng công cụ gửi yêu cầu trực tiếp. Vì vậy mỗi quy tắc quan trọng (độ dài, định dạng, quyền) cần được kiểm lại ở máy chủ, và tester nên thử gửi yêu cầu trái quy tắc trực tiếp.

*Kiến thức chung, chưa đối chiếu nguồn gốc.*

## Thông báo lỗi an toàn

| Nên | Không nên |
| --- | --- |
| "Email hoặc mật khẩu không đúng" | "Tài khoản này không tồn tại" (lộ danh sách tài khoản) |
| "Đầu vào không hợp lệ, tối đa 100 ký tự" | Hiện câu truy vấn SQL hoặc tên bảng |
| Ghi log chi tiết ở máy chủ | Hiện stack trace cho người dùng |

*Kiến thức chung, chưa đối chiếu nguồn gốc.*

## Thử an toàn trên môi trường thử

- Chỉ thử trên môi trường được phép, không thử trên hệ thống thật của người khác.
- Dùng chuỗi vô hại để kiểm, ví dụ một thông báo đơn giản.
- Ghi lại kết quả và báo người phát triển, không khai thác thêm.

*Kiến thức chung, chưa đối chiếu nguồn gốc.*

## Sai ở đâu, và sửa thế nào

## Giải thích chi tiết

**XSS (cross-site scripting)**

**SQL injection**

## Giải thích chi tiết

**IDOR (tham chiếu đối tượng không an toàn)**

**Mã trạng thái HTTP (401, 403, 400, 429)**

## Điều cần nhớ

- Kiểm cả đầu vào hợp lệ, không hợp lệ và giá trị biên.
- Thử các lỗi bảo mật cơ bản trên môi trường thử, không trên hệ thống thật của người khác.

## Kiểm đầu vào và báo lỗi an toàn

Đầu vào cần kiểm ở cả phía trình duyệt lẫn máy chủ. Kiểm ở trình duyệt chỉ để trải nghiệm tốt hơn, không đủ để bảo mật.

- Chấp nhận có điều kiện: đúng định dạng, đúng độ dài.
- Báo lỗi cụ thể cho người dùng, nhưng không lộ chi tiết kỹ thuật như tên bảng hay câu truy vấn.
- Thử ký tự đặc biệt, chuỗi rất dài, và mã script trong ô nhập.

## Thử XSS trên ô bình luận (môi trường thử)

1. Nhập chuỗi chứa thẻ script vô hại, ví dụ một hộp thông báo.
2. Gửi bình luận và tải lại trang.
3. Kiểm: nội dung hiện dạng chữ, không chạy script, không hiện hộp thông báo.
4. Nếu script chạy, ghi lỗi XSS và báo người phát triển sửa bằng cách mã hóa khi hiển thị.

## Kiểm đầu vào ở cả hai phía

Kiểm đầu vào ở trình duyệt chỉ để trải nghiệm tốt hơn. Bảo mật phải kiểm ở máy chủ, vì người tấn công không đi qua giao diện.

*Kiến thức chung, chưa đối chiếu nguồn gốc. OWASP Top Ten Cheat Sheet trên wiki.owasp.org không đọc được khi soạn bài này.*

## Đọc thêm: Security and Penetration Testing

- **OWASP Testing Guide** và **OWASP Top 10 Cheat Sheet**.
- **WebGoat guide**: bài tập bảo mật có hướng dẫn.

Nguồn: github.com/PaulWaltersDev/FreeLearningResourcesForSoftwareTesters, mục "Security and Penetration Testing". Tìm tên tài liệu trong repo để lấy liên kết.

