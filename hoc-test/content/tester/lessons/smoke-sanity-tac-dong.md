# Smoke, sanity và phân tích tác động

Sau mỗi lần triển khai, câu hỏi đầu tiên là: bản này có đáng để kiểm sâu không? Nếu đăng nhập đã hỏng, kiểm chi tiết các màn khác là lãng phí thời gian. Đó là việc của smoke test.

Khi chỉ sửa một phần nhỏ, câu hỏi tiếp theo là: cần kiểm những gì? Đó là việc của sanity test và phân tích tác động. Bài này dạy ba việc này và cách chọn đúng cái, không chạy tất cả.

## Sau bài này bạn làm được gì

- Phân biệt smoke test, sanity test và regression.
- Thiết kế bộ smoke gồm các luồng quan trọng nhất và chạy nhanh.
- Thực hiện phân tích tác động để biết cần kiểm lại những gì.
- Giải thích vì sao không nên chỉ kiểm đúng chỗ vừa sửa.

## Ba khái niệm dễ nhầm

| Loại | Khi nào dùng | Phạm vi |
|---|---|---|
| Smoke | Ngay sau khi có bản build mới | Các luồng quan trọng nhất, chạy nhanh |
| Sanity | Sau một thay đổi nhỏ, có mục tiêu | Khu vực quanh thay đổi |
| Regression | Trước khi phát hành, hoặc sau thay đổi lớn | Mọi chức năng liên quan, có thể cả hệ thống |

Smoke trả lời: "Bản này có chạy được không?" Sanity trả lời: "Thay đổi này có hoạt động không?" Regression trả lời: "Thay đổi này có làm hỏng thứ khác không?"

## Thiết kế bộ smoke

Một bộ smoke tốt có khoảng 5 đến 10 ca, và chạy trong vài phút. Chọn các luồng mà nếu hỏng thì không ai làm được việc chính:

- Đăng nhập và đăng xuất.
- Tạo mới dữ liệu chính (đặt lịch, nộp bài).
- Xem kết quả hoặc trạng thái vừa tạo.
- Luồng thanh toán, nếu có.

Nếu smoke thất bại, dừng lại và báo ngay. Đừng kiểm tiếp rồi ghi nhận hàng chục lỗi đã biết là do cùng một nguyên nhân.

## Phân tích tác động

Khi có thay đổi, làm theo năm bước:

1. Xác định phần nào của hệ thống đã đổi (module, API, cơ sở dữ liệu).
2. Xác định phần nào **phụ thuộc** vào phần đó.
3. Liệt kê các màn hình, API và báo cáo đi qua phần phụ thuộc.
4. Chọn ca cần chạy lại từ các mục trên.
5. Ghi lý do chọn và các phần chưa kiểm.

Ví dụ: đổi công thức phí khám. Phần đổi là hàm tính phí. Phần phụ thuộc là đơn đặt lịch, hóa đơn, màn quản trị, báo cáo doanh thu. Đó là danh sách cần kiểm, không chỉ màn tính phí.

## Vì sao không chỉ kiểm chỗ vừa sửa

Lỗi hồi quy thường nằm ở chức năng phụ thuộc, không phải nơi được sửa. Developer sửa hàm phí đúng, nhưng màn hóa đơn vẫn dùng công thức cũ được copy từ trước. Nếu chỉ kiểm màn tính phí, lỗi này lọt qua.

Ngược lại, không nên chạy full regression cho mọi thay đổi nhỏ. Cân bằng: sanity có mục tiêu cộng với phân tích tác động là đủ cho đa số trường hợp.

## Tóm lại

- Smoke kiểm nhanh luồng quan trọng nhất để quyết định có kiểm tiếp không.
- Sanity kiểm khu vực quanh thay đổi.
- Phân tích tác động cho biết cần kiểm những gì, kể cả phần không được sửa.
- Ghi rõ lý do chọn ca và những phần chưa kiểm trong báo cáo.

Tham khảo: Cem Kaner (*Lessons Learned in Software Testing*) về regression và lựa chọn ca; tài liệu ISTQB Foundation về kiểm thử hồi quy. Kiểm tra lại nguồn trước khi trích dẫn.
