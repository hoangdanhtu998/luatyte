# Thiết kế ca: biên, bảng quyết định và chuyển trạng thái

Bạn đã biết phần tính phí và phần ngày khám là rủi ro cao. Giờ phải biến nhận định đó thành các ca kiểm thử cụ thể. Nếu ngồi nghĩ ngẫu hứng, bạn sẽ thử tuổi 30, tuổi 70, rồi tự thấy "chắc ổn". Lỗi thật thì nằm ở đúng tuổi 60.

Ba kỹ thuật trong bài này là công cụ hằng ngày của tester. Mỗi kỹ thuật hợp với một kiểu yêu cầu.

## Sau bài này bạn làm được gì

- Chọn đúng kỹ thuật cho từng yêu cầu trong tài liệu Sao Mai.
- Viết bộ ca biên đầy đủ cho một ô nhập có khoảng giá trị.
- Lập bảng quyết định khi nhiều điều kiện cùng ảnh hưởng một kết quả.
- Vẽ sơ đồ trạng thái và rút ra cả ca hợp lệ lẫn ca không hợp lệ.

## Chọn kỹ thuật theo kiểu yêu cầu

| Yêu cầu có dạng | Kỹ thuật | Ví dụ ở Sao Mai |
|---|---|---|
| Một khoảng giá trị, một ngưỡng | Phân vùng tương đương và giá trị biên | R1 độ dài tên, R3 tuổi, R4 ngày, R5 giờ, R6 sức chứa |
| Nhiều điều kiện cùng quyết định một kết quả | Bảng quyết định | R7 phí khám |
| Một đối tượng đổi trạng thái theo hành động | Chuyển trạng thái | R9 trạng thái lịch |

## Giá trị biên làm cho kỹ

Lấy R3: tuổi là số nguyên từ 0 đến 120. Có ba vùng: nhỏ hơn 0, từ 0 đến 120, lớn hơn 120. Mỗi ranh giới cần thử giá trị ở hai phía.

| Ranh giới | Giá trị thử | Mong đợi |
|---|---|---|
| Dưới | -1 và 0 | -1 từ chối, 0 nhận |
| Trên | 120 và 121 | 120 nhận, 121 từ chối |

R3 còn một ngưỡng nữa nằm giữa khoảng: dưới 16 tuổi cần người giám hộ. Thử 15 và 16, để trống ô người giám hộ.

Đừng quên vùng không phải số: để trống, chữ "abc", số thập phân "12.5", số có khoảng trắng. Mỗi loại một ca là đủ.

**Mẹo cho biên ngày tháng.** R4 nói "từ ngày mai đến hết ngày thứ 30". Bốn giá trị cần thử: hôm nay, hôm nay + 1, hôm nay + 30, hôm nay + 31. Nhưng nếu hôm nay + 30 rơi vào Chủ nhật thì ca đó bị từ chối vì lý do khác, và bạn không biết biên có đúng không. App tập có ô **Ngày hệ thống (giả lập)** ở chân trang: đặt một ngày cố định sao cho các ngày biên không rơi vào Chủ nhật. Trên dự án thật, khả năng điều khiển đồng hồ của hệ thống là thứ tester nên đề nghị ngay từ đầu.

## Bảng quyết định cho phí khám

R7 có ba điều kiện: nhóm tuổi (dưới 6, từ 6 đến 59, từ 60), loại khám (thường, chuyên khoa), BHYT (có, không). Tổng cộng 3 × 2 × 2 = 12 tổ hợp. Số này đủ nhỏ để liệt kê hết.

Cách lập bảng:

1. Viết mỗi điều kiện thành một cột, mỗi tổ hợp thành một dòng.
2. Với từng dòng, **tự tính tay** kết quả mong đợi theo đúng câu chữ của R7. Không mở app để xem nó ra bao nhiêu rồi chép vào.
3. Ở các điều kiện có ngưỡng số, chọn giá trị nằm đúng ngưỡng: 5 và 6 tuổi, 59 và 60 tuổi.

Ví dụ hai dòng:

| Tuổi | Loại khám | BHYT | Cách tính theo R7 | Phí mong đợi |
|---|---|---|---|---|
| 30 | Thường | Có | 150.000 − 50.000 | 100.000đ |
| 70 | Chuyên khoa | Có | 300.000 × 80% − 50.000 | 190.000đ |

Chú ý những dòng mà hai quy tắc đụng nhau: trẻ được miễn phí lại có BHYT. R7 có câu "phí không bao giờ nhỏ hơn 0đ". Câu đó tồn tại chính vì tổ hợp này.

## Chuyển trạng thái cho lịch khám

Theo R9, lịch có bốn trạng thái: Chờ xác nhận, Đã xác nhận, Đã khám, Đã hủy.

| Từ trạng thái | Hành động | Đến trạng thái |
|---|---|---|
| Chờ xác nhận | Quản trị xác nhận | Đã xác nhận |
| Đã xác nhận | Quản trị ghi đã khám | Đã khám |
| Chờ xác nhận | Hủy (ngày khám ở tương lai) | Đã hủy |
| Đã xác nhận | Hủy (ngày khám ở tương lai) | Đã hủy |

Bảng trên là các chuyển **hợp lệ**. Người mới dừng ở đây. Phần giá trị nhất là các chuyển **không được phép**:

- Đã khám → hủy.
- Đã hủy → hủy lần nữa, hoặc xác nhận.
- Chờ xác nhận → ghi đã khám (bỏ qua bước xác nhận).

Với mỗi chuyển không hợp lệ, kiểm xem giao diện có để lộ nút bấm đó không, ở mọi màn có hiển thị lịch (Tra cứu và Quản trị).

Cuối cùng, nghĩ đến **hệ quả của việc đổi trạng thái lên quy tắc khác**: lịch đã hủy thì chỗ trong khung giờ có được trả lại không (R6)? Lỗi nằm ở chỗ hai quy tắc gặp nhau thường không ai kiểm.

## Viết ca cho người khác chạy được

Một ca kiểm thử tốt có đủ: mã ca, yêu cầu liên quan, điều kiện ban đầu, dữ liệu cụ thể, các bước, kết quả mong đợi.

Kết quả mong đợi kém: "Hệ thống xử lý đúng." Kết quả mong đợi tốt: "Hiện thông báo lỗi ở ô Tuổi, không tạo lịch mới."

## Việc cần làm

1. Mở [sổ tay](lab/so-tay.html), mục Bài 3. Viết ca cho R3, R4, R7 và R9 theo khung mẫu.
2. Mở [app tập bản 1.0](lab/index.html), bấm **Đặt lại dữ liệu mẫu**, cố định **Ngày hệ thống**.
3. Chạy từng ca. Ghi kết quả thực tế. Ca nào không đạt thì ghi một dòng vào mục **Sổ lỗi** của sổ tay (bài 5 sẽ dạy viết báo cáo đầy đủ).
4. Làm thêm cho R1, R2, R5, R6 nếu còn thời gian. Các yêu cầu này đều dùng giá trị biên.
5. Tự chấm, rồi so với bài mẫu.

## Sai lầm hay gặp

- **Thử giá trị "ở giữa" rồi kết luận.** Tuổi 30 và 70 chạy đúng không nói gì về tuổi 60.
- **Chép kết quả của app làm kết quả mong đợi.** Khi đó ca của bạn chỉ chứng minh app giống chính nó.
- **Chỉ có ca hợp lệ.** Bộ ca thiếu ca bị từ chối là bộ ca thiếu một nửa.
- **Một ca kiểm năm thứ.** Khi nó không đạt, bạn không biết thứ nào sai.

## Thuật ngữ

**Phân vùng tương đương (equivalence partitioning)**: chia dữ liệu thành các nhóm mà hệ thống được kỳ vọng xử lý giống nhau, rồi thử đại diện mỗi nhóm. · **Phân tích giá trị biên (boundary value analysis)**: thử các giá trị nằm ở mép của mỗi vùng. · **Bảng quyết định (decision table)**: bảng liệt kê tổ hợp điều kiện và kết quả tương ứng. · **Kiểm thử chuyển trạng thái (state transition testing)**: thiết kế ca từ các trạng thái và các chuyển đổi giữa chúng, gồm cả chuyển đổi không hợp lệ.
