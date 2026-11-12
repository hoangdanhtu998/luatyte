# Báo cáo lỗi và vòng đời lỗi

Một báo cáo lỗi tốt có các bước tái hiện, kết quả thực tế và kết quả mong đợi. Lỗi đi qua các trạng thái rõ ràng.

Bài trình chiếu đầy đủ nằm trong mục slide của bài này. Bài tập ở cuối trang.

## Nhìn bằng hình

*Hình vẽ gốc, dùng để minh họa thứ tự các bước chính của bài.*

## Mức nghiêm trọng và mức ưu tiên

**Nghiêm trọng**: lỗi gây hậu quả gì (mất dữ liệu, sai tiền, chỉ lệch giao diện).

**Ưu tiên**: nên sửa trước lúc nào. Lỗi nhẹ nhưng ở trang chính vẫn có thể cần sửa gấp.

## Vòng đời của một lỗi

```
Mới → Đang xem → Đang sửa → Chờ kiểm → Đã đóng
                  ↘ Không tái hiện được → Đóng
                  ↘ Không phải lỗi → Đóng
```

Người kiểm thử xác nhận lại sau khi sửa, không đóng lỗi chỉ vì người sửa báo đã xong.

**Thuật ngữ trong slide này:** **Tái hiện (reproduce)**: Làm lại đúng các bước để lỗi xuất hiện lần nữa.

## Báo cáo viết tốt và viết chưa tốt

**Chưa tốt**: "Hàm giảm giá bị sai."

**Tốt**: "Giảm giá 100000 đồng cho ra 100000 thay vì 90000. Bước: nhập gia = 100000, bấm Tính. Mong đợi: 90000."

## Viết lại một báo cáo

Viết lại báo cáo sau cho đủ ý: "Đăng nhập bị lỗi, bấm nút là văng ra."

## Gợi ý đáp án

Một phiên bản tốt cần: người dùng nào, đăng nhập bằng gì, bấm nút nào, lỗi hiện gì, kết quả mong đợi là gì, trên trình duyệt và phiên bản nào. Điền đủ các mục này thì người sửa mới làm được.

## Các trường trong một báo cáo lỗi

| Trường | Nội dung tốt |
| --- | --- |
| Tiêu đề | Hành vi sai, cụ thể: "Nút Thanh toán bị trừ tiền hai lần khi bấm nhanh" |
| Môi trường | Phiên bản, trình duyệt, hệ điều hành, tài khoản dùng thử |
| Các bước tái hiện | Đánh số, mỗi bước một hành động, có dữ liệu cụ thể |
| Kết quả thực tế | Điều xảy ra, kèm ảnh hoặc log |
| Kết quả mong đợi | Điều đúng theo yêu cầu, trích tài liệu nếu có |
| Mức độ nghiêm trọng | Ảnh hưởng đến người dùng và dữ liệu |
| Mức ưu tiên | Thứ tự cần sửa, do chủ sản phẩm quyết định |

*Kiến thức chung, chưa đối chiếu nguồn gốc.*

**Thuật ngữ trong slide này:** **Mức độ nghiêm trọng (severity)**: Mức ảnh hưởng của lỗi đến người dùng và dữ liệu. Tester thường đề xuất. · **Mức ưu tiên (priority)**: Thứ tự cần sửa trước sau, theo kế hoạch và bối cảnh kinh doanh. Chủ sản phẩm quyết định. · **Tái hiện (reproduce)**: Làm lại đúng các bước để lỗi xuất hiện lần nữa.

## Nghiêm trọng khác ưu tiên

Mức độ nghiêm trọng (severity) do tester đề xuất theo ảnh hưởng kỹ thuật. Mức ưu tiên (priority) do chủ sản phẩm quyết định theo kế hoạch. Một lỗi nhỏ về kỹ thuật có thể có ưu tiên cao nếu nó xuất hiện trước buổi ra mắt.

*Kiến thức chung, chưa đối chiếu nguồn gốc.*

**Thuật ngữ trong slide này:** **Mức độ nghiêm trọng (severity)**: Mức ảnh hưởng của lỗi đến người dùng và dữ liệu. Tester thường đề xuất. · **Mức ưu tiên (priority)**: Thứ tự cần sửa trước sau, theo kế hoạch và bối cảnh kinh doanh. Chủ sản phẩm quyết định.

## Tái hiện được là quan trọng nhất

1. Thử lại theo đúng các bước đã viết, trên môi trường khác nếu có.
2. Ghi rõ điều kiện: lỗi chỉ xảy ra khi mạng chậm, hay khi có hai tab mở.
3. Nếu không tái hiện được, ghi rõ đã thử những gì. Đừng ghi "thỉnh thoảng lỗi".

*Kiến thức chung, chưa đối chiếu nguồn gốc.*

**Thuật ngữ trong slide này:** **Tái hiện (reproduce)**: Làm lại đúng các bước để lỗi xuất hiện lần nữa.

## Báo cáo lỗi mẫu

```
Tiêu đề: Giỏ hàng cộng dồn số lượng khi tải lại trang
Môi trường: Chrome 124, Windows 11, tài khoản test01
Bước:
 1. Thêm sản phẩm A vào giỏ (số lượng 1)
 2. Tải lại trang (F5)
 3. Quan sát số lượng sản phẩm A
Thực tế: số lượng là 2
Mong đợi: số lượng vẫn là 1
Mức độ: nghiêm trọng vừa, ảnh hưởng tiền thanh toán
Bằng chứng: ảnh giỏ hàng trước và sau
```

## Viết lại tiêu đề

Viết lại tiêu đề sau cho đúng chuẩn: "Lỗi nút không hoạt động". Gợi ý: nêu nút nào, hoạt động gì, trong hoàn cảnh nào.

## Sai ở đâu, và sửa thế nào

**Thuật ngữ trong slide này:** **Tái hiện (reproduce)**: Làm lại đúng các bước để lỗi xuất hiện lần nữa.

## Giải thích chi tiết

**Mức độ nghiêm trọng (severity)**

**Mức ưu tiên (priority)**

## Giải thích chi tiết

**Tái hiện (reproduce)**

**Trạng thái lỗi (defect life cycle)**

## Điều cần nhớ

- Báo cáo phải tái hiện được và so được kết quả.
- Tách nghiêm trọng và ưu tiên.
- Đóng lỗi chỉ sau khi đã kiểm lại.

**Thuật ngữ trong slide này:** **Tái hiện (reproduce)**: Làm lại đúng các bước để lỗi xuất hiện lần nữa.

## Viết báo cáo để người khác tái hiện được

Người đọc báo cáo không có mặt lúc bạn gặp lỗi. Báo cáo phải đủ để họ làm lại đúng các bước.

- Môi trường: trình duyệt, phiên bản, hệ điều hành, tài khoản dùng.
- Các bước: đánh số, mỗi bước một hành động cụ thể.
- Kết quả thực tế và kết quả mong đợi, kèm ảnh chụp hoặc thông báo lỗi nguyên văn.
- Tần suất: luôn xảy ra, thỉnh thoảng, hay chỉ một lần.

## Viết lại một báo cáo mơ hồ

Báo cáo ban đầu: "Đặt hàng bị lỗi."

1. Môi trường: Chrome 130 trên Windows 11, tài khoản thử.
2. Bước: thêm sản phẩm A vào giỏ, chọn giao hàng nhanh, bấm "Đặt hàng".
3. Thực tế: hiện thông báo "Lỗi 500", đơn không được tạo.
4. Mong đợi: hiện trang xác nhận đơn hàng.
5. Tần suất: xảy ra 3/3 lần khi chọn giao hàng nhanh.

## Các trạng thái của một lỗi

| Trạng thái | Ai chuyển | Khi nào |
| --- | --- | --- |
| Open (mở) | Tester | Tester phát hiện và ghi nhận lỗi |
| Assigned (đã gán) | Trưởng nhóm dev | Lỗi hợp lệ, gán cho developer |
| Work in progress (đang sửa) | Developer | Đang sửa lỗi |
| Resolved / Retest (đã sửa, chờ kiểm) | Developer | Đã sửa, chuyển sang tester |
| Closed (đóng) | Tester | Kiểm lại xác nhận đã sửa |
| Reopened (mở lại) | Tester | Kiểm lại, lỗi vẫn còn |

*Nguồn: Udemy Blog, "Defect Life Cycle" [đã đọc]. Tên trạng thái khác nhau giữa các dự án, nên ghi trong test plan.*

**Thuật ngữ trong slide này:** **Trạng thái lỗi (defect life cycle)**: Chuỗi trạng thái của một lỗi từ lúc mở đến lúc đóng.

## Các trạng thái không phải lỗi thật

| Trạng thái | Ý nghĩa |
| --- | --- |
| Non-reproducible (không tái hiện được) | Developer không lặp lại được theo bước đã ghi |
| Not enough info (thiếu thông tin) | Trả về tester để bổ sung bước và dữ liệu |
| Duplicate (trùng) | Lỗi đã có ghi nhận trước đó |
| Not a bug / Working as intended | Hành vi đúng theo thiết kế, đóng lỗi |
| Deferred (hoãn) | Lỗi hợp lệ, làm ở bản sau |

*Nguồn: Udemy Blog [đã đọc].*

**Thuật ngữ trong slide này:** **Tái hiện (reproduce)**: Làm lại đúng các bước để lỗi xuất hiện lần nữa.

## Viết như một câu chuyện có bằng chứng

Diễn giả James Bach nói tester phải kể câu chuyện về việc kiểm thử, dùng ngôn từ chuyên môn, và biến những việc tưởng như chơi đùa thành báo cáo có cấu trúc. Một báo cáo lỗi tốt cho người đọc tái hiện được lỗi mà không cần hỏi lại.

- Tiêu đề nêu hành vi sai, không nêu giải pháp.
- Các bước tái hiện theo thứ tự, có dữ liệu cụ thể.
- Kết quả thực tế và kết quả mong đợi đặt cạnh nhau.

*Nguồn: James Bach, Open Lecture on Software Testing (YouTube ILkT_HV9DVU), phụ đề tự động. Quan điểm của diễn giả.*

**Thuật ngữ trong slide này:** **Tái hiện (reproduce)**: Làm lại đúng các bước để lỗi xuất hiện lần nữa.

## Thực hành: làm ngay trên app mô phỏng

Đọc xong lý thuyết, mở [trang thực hành](thuc-hanh.html?id=bao-cao-loi). Bên trái là app đang test, bên phải là trợ giảng. Bấm **Chạy demo** để xem mẫu, rồi tự làm các bài.

## Đọc thêm: Defect Lifecycle Management

- **Bug Advocacy** (Cem Kaner, PDF).
- **Defect Life Cycle** (Udemy Blog).

Nguồn: github.com/PaulWaltersDev/FreeLearningResourcesForSoftwareTesters, mục "Defect Lifecycle Management". Tìm tên tài liệu trong repo để lấy liên kết.

**Thuật ngữ trong slide này:** **Trạng thái lỗi (defect life cycle)**: Chuỗi trạng thái của một lỗi từ lúc mở đến lúc đóng.

## Test toàn bộ app: trang hướng dẫn từng bước

Mở [trang hướng dẫn test](huong-dan-test.html). Trợ giảng khoanh từng chỗ trong app, giải thích lý thuyết, kỹ thuật và thuật ngữ tiếng Anh của từng bước, rồi làm mẫu để bạn xem.
