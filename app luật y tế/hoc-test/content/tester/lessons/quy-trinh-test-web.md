# Quy trình kiểm thử một trang web

Từ lúc nhận yêu cầu đến lúc theo dõi sau phát hành: 14 giai đoạn, mỗi giai đoạn có việc cần làm, tiêu chí qua, và bằng chứng cần lưu.

Bài trình chiếu đầy đủ nằm trong mục slide của bài này. Bài tập ở cuối trang.

## Nhìn bằng hình

*Hình vẽ gốc, dùng để minh họa thứ tự các bước chính của bài.*

## Trang sắp ra mắt, còn hai ngày

Bạn nhận một trang đăng ký và thanh toán sắp ra mắt. Không thể kiểm hết mọi thứ. Cần biết kiểm gì trước, theo thứ tự nào, và khi nào được nói "đạt".

*Quy trình do người soạn bài tổng hợp từ kiến thức kiểm thử web thông thường. Đây là một gợi ý, không phải chuẩn bắt buộc.*

## 14 giai đoạn theo thứ tự

1. Chuẩn bị
2. Hiểu yêu cầu và bối cảnh
3. Thiết kế ca
4. Môi trường và dữ liệu
5. Smoke (kiểm nhanh)
6. Chức năng
7. Giao diện và responsive
8. Truy cập (accessibility)
9. Hiệu năng
10. Bảo mật cơ bản
11. Tương thích trình duyệt
12. Hồi quy và tự động hóa
13. Báo cáo và quyết định
14. Theo dõi sau phát hành

*Quy trình do người soạn bài tổng hợp từ kiến thức kiểm thử web thông thường. Đây là một gợi ý, không phải chuẩn bắt buộc.*

## Chuẩn bị trước khi bấm

- **Chuẩn bị**: mục tiêu, phạm vi, người dùng mục tiêu, quyền truy cập, ai duyệt kết quả.
- **Hiểu yêu cầu**: mỗi tính năng có tiêu chí chấp nhận đo được. Thiếu thì hỏi trước khi kiểm.
- **Thiết kế ca**: luồng chính, phân vùng và biên, bảng trạng thái, tổ hợp cặp, bảng quyết định, chấm rủi ro.
- **Môi trường và dữ liệu**: build đúng phiên bản, dựng môi trường tái tạo được, dữ liệu riêng cho mỗi lần chạy, không dùng dữ liệu thật.

*Quy trình do người soạn bài tổng hợp từ kiến thức kiểm thử web thông thường. Đây là một gợi ý, không phải chuẩn bắt buộc.*

## Smoke trước, rồi chức năng

- **Smoke test**: kiểm nhanh xem trang tải được, không có lỗi máy chủ, các chức năng cốt lõi chạy được. Nếu smoke hỏng, dừng và báo ngay.
- **Chức năng**: từng luồng từ điều kiện trước đến điều kiện sau. Form có ca hợp lệ, không hợp lệ, trống, biên, chuỗi rất dài.
- Thông báo lỗi phải rõ, nằm gần ô sai, và không lộ chi tiết kỹ thuật.

*Quy trình do người soạn bài tổng hợp từ kiến thức kiểm thử web thông thường. Đây là một gợi ý, không phải chuẩn bắt buộc.*

**Thuật ngữ trong slide này:** **Smoke test**: Kiểm nhanh các chức năng cốt lõi sau khi build (xem thêm mục Smoke testing).

## Giao diện, truy cập, hiệu năng

- **Giao diện**: các mốc màn hình, không tràn ngang, phóng to 200% vẫn dùng được.
- **Truy cập**: đi hết bằng bàn phím, focus nhìn thấy, ô nhập có nhãn, ảnh có alt, tương phản đủ.
- **Hiệu năng**: đo Core Web Vitals trên điện thoại và mạng giống người dùng thật, nhiều lượt, đọc phân vị 75. Đặt ngưỡng trước khi đo.

*Quy trình do người soạn bài tổng hợp từ kiến thức kiểm thử web thông thường. Đây là một gợi ý, không phải chuẩn bắt buộc.*

## Bảo mật cơ bản và tương thích

- **Bảo mật**: chỉ trên môi trường được phép. Thử đầu vào (XSS, SQL injection), đổi mã đối tượng (IDOR), thử yêu cầu thiếu token (CSRF), kiểm thông báo lỗi không lộ chi tiết.
- **Tương thích**: ít nhất ba trình duyệt khác engine (Chromium, Gecko, WebKit), và vài thiết bị thật. Ghi lại khác biệt, kể cả lỗi nhỏ.

*Quy trình do người soạn bài tổng hợp từ kiến thức kiểm thử web thông thường. Đây là một gợi ý, không phải chuẩn bắt buộc.*

## Hồi quy, báo cáo, theo dõi sau phát hành

- **Hồi quy**: ca ổn định đưa vào CI, mỗi lỗi đã sửa có một ca tái hiện.
- **Báo cáo**: ghi số ca đã chạy trên tổng số ca đã lên kế hoạch. Nêu rủi ro còn lại và đề xuất rõ ràng.
- **Sau phát hành**: theo dõi lỗi thật và số đo, kiểm lại lỗi đã sửa trên môi trường thật, viết bài học.

*Quy trình do người soạn bài tổng hợp từ kiến thức kiểm thử web thông thường. Đây là một gợi ý, không phải chuẩn bắt buộc.*

## Thứ tự stage và cổng chặn

| Stage | Chạy gì | Cổng qua |
| --- | --- | --- |
| 1. Build | Build, lint | Build thành công |
| 2. Unit | Test đơn vị | Mọi ca pass |
| 3. Smoke | Smoke trên bản vừa build | Mọi mục smoke đạt |
| 4. E2E chính | Luồng ưu tiên cao | Pass, không ca nào bị bỏ |
| 5. Truy cập tự động | Quét tương phản, nhãn | Không có lỗi nghiêm trọng |
| 6. Hiệu năng | Core Web Vitals, ngân sách kích thước | Trong ngưỡng đã đặt |
| 7. Bảo mật | Quét phụ thuộc, quét đầu vào | Không có lỗ hổng mức cao |
| 8. Báo cáo | Gom kết quả và bằng chứng | Đủ bằng chứng |

*Quy trình do người soạn bài tổng hợp từ kiến thức kiểm thử web thông thường. Đây là một gợi ý, không phải chuẩn bắt buộc.*

## Lưu gì cho mỗi đợt

- Danh sách ca và kết quả, có mẫu số.
- Ảnh chụp hoặc video của lỗi, kèm bước tái hiện.
- Log console, log máy chủ, và file HAR (ghi lại các yêu cầu mạng) khi có lỗi mạng.
- Số đo hiệu năng cùng điều kiện đo: thiết bị, mạng, số lượt.
- Phiên bản build và cấu hình môi trường.

*Quy trình do người soạn bài tổng hợp từ kiến thức kiểm thử web thông thường. Đây là một gợi ý, không phải chuẩn bắt buộc.*

## Khi chỉ còn hai giờ

Chỉ còn hai giờ trước khi phát hành. Hãy chọn các giai đoạn phải làm, các giai đoạn có thể để sau, và nêu rõ rủi ro còn lại trong báo cáo.

*Quy trình do người soạn bài tổng hợp từ kiến thức kiểm thử web thông thường. Đây là một gợi ý, không phải chuẩn bắt buộc.*

## Smoke hỏng thì sao

Smoke test hỏng ở bước đăng nhập. Có nên chạy tiếp kiểm thử giao diện không? Vì sao, và nên báo cáo gì?

*Quy trình do người soạn bài tổng hợp từ kiến thức kiểm thử web thông thường. Đây là một gợi ý, không phải chuẩn bắt buộc.*

**Thuật ngữ trong slide này:** **Smoke test**: Kiểm nhanh các chức năng cốt lõi sau khi build (xem thêm mục Smoke testing).

## Sai ở đâu, và sửa thế nào

## Giải thích chi tiết

**Smoke test**

**Cổng chặn (quality gate)**

## Giải thích chi tiết

**Ngân sách hiệu năng (performance budget)**

**HAR**

