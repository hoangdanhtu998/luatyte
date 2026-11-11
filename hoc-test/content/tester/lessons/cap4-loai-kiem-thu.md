# Các loại kiểm thử và kiểm thử thủ công

Phân biệt kiểm thử chức năng và phi chức năng; khi nào làm thủ công; công cụ hỗ trợ.

Bài trình chiếu đầy đủ nằm trong mục slide của bài này. Bài tập ở cuối trang.

## Nhìn bằng hình

*Hình vẽ gốc, dùng để minh họa thứ tự các bước chính của bài.*

## Kiểm thử chức năng

Kiểm tra từng chức năng theo yêu cầu. Gồm kiểm thử đơn vị, tích hợp, hệ thống, hồi quy và chấp nhận của người dùng.

## Kiểm thử phi chức năng

Đo các tiêu chí chất lượng: hiệu năng, tải, bảo mật, khả năng sử dụng, khả năng phục hồi sau sự cố.

## Cùng một nút "Thanh toán"

| Câu hỏi | Loại kiểm thử |
| --- | --- |
| Bấm xong có trừ tiền đúng không? | Chức năng |
| Bấm 1000 lần/giây có chịu nổi không? | Hiệu năng |
| Thẻ có được mã hóa khi gửi không? | Bảo mật |

## Khi nào nên làm bằng tay

- Kiểm thử khám phá: chưa có tài liệu, cần trực giác.
- Giao diện và trải nghiệm: cảm giác dùng có ổn không.
- Chưa đáng viết tự động vì chỉ chạy một lần.

## Công cụ hỗ trợ kiểm thử thủ công

- Bảng tính hoặc công cụ quản lý ca kiểm thử.
- Hệ thống theo dõi lỗi để ghi, gán và đóng lỗi.
- Ghi màn hình hoặc ảnh chụp để tái hiện lỗi.

## Sai ở đâu, và sửa thế nào

## Giải thích chi tiết

**Kiểm thử chức năng (functional testing)**

**Kiểm thử phi chức năng (non-functional testing)**

## Giải thích chi tiết

**Kiểm thử hồi quy (regression testing)**

**Kiểm thử thủ công (manual testing)**

## Điều cần nhớ

- Một chức năng có thể cần nhiều loại kiểm thử, không chỉ một.
- Thủ công phù hợp khi cần con người đánh giá.

## Phân biệt kiểm thử chức năng và phi chức năng

Chức năng hỏi "làm đúng việc không". Phi chức năng hỏi "làm tốt đến mức nào".

- Chức năng: đăng nhập, tính tiền, gửi form.
- Hiệu năng: thời gian phản hồi, số người dùng đồng thời.
- Bảo mật: mã hóa dữ liệu, kiểm quyền truy cập.
- Khả dụng và dễ dùng: người mới có làm được việc chính không.

## Lập kế hoạch kiểm thử một trang đăng ký

1. Chức năng: đăng ký với dữ liệu hợp lệ và không hợp lệ.
2. Hiệu năng: thời gian phản hồi dưới 2 giây khi 100 người đăng ký cùng lúc.
3. Bảo mật: mật khẩu không hiện nguyên văn trong mã nguồn trang.
4. Dễ dùng: thông báo lỗi nói rõ phải sửa trường nào.

## Yêu cầu chưa viết ra

James Bach nói: tester không chỉ kiểm yêu cầu đã viết, mà còn kiểm yêu cầu chưa viết. Ví dụ: thiết bị y tế không được gây nguy hiểm khi điện áp ngoài dải, dù tài liệu không ghi.

*Nguồn: James Bach, Open Lecture on Software Testing (YouTube ILkT_HV9DVU), phụ đề tự động. Quan điểm của diễn giả.*

## Chức năng và phi chức năng

- **Chức năng**: làm đúng việc được yêu cầu.
- **Phi chức năng**: làm việc đó tốt đến đâu, an toàn ra sao, chịu tải thế nào.

*Kiến thức chung, chưa đối chiếu nguồn gốc.*

## Thực hành: làm ngay trên app mô phỏng

Đọc xong lý thuyết, mở [trang thực hành](thuc-hanh.html?id=loai-kiem-thu). Bên trái là app đang test, bên phải là trợ giảng. Bấm **Chạy demo** để xem mẫu, rồi tự làm các bài.

## Đọc thêm: Test Design and Execution

- **Software Testing Best Practices** (PDF).
- **Requirements Analysis** (slide).

Nguồn: github.com/PaulWaltersDev/FreeLearningResourcesForSoftwareTesters, mục "Test Design and Execution". Tìm tên tài liệu trong repo để lấy liên kết.

