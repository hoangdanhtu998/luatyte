# Kiểm thử hiệu năng với JMeter (tổng quan)

Đo tốc độ phản hồi, mô phỏng nhiều người dùng, và đọc kết quả để quyết định hệ thống có đủ nhanh không.

Bài trình chiếu đầy đủ nằm trong mục slide của bài này. Bài tập ở cuối trang.

## Nhìn bằng hình

*Hình vẽ gốc, dùng để minh họa thứ tự các bước chính của bài.*

## Kịch bản tải

Một kịch bản gồm: số người dùng ảo, thời gian tăng dần, và các yêu cầu mỗi người gửi. Ví dụ: 100 người, tăng trong 5 phút, giữ 10 phút.

**Thuật ngữ trong slide này:** **Người dùng ảo (virtual user)**: Một tiến trình giả lập người dùng thật, gửi yêu cầu theo kịch bản đã định.

## Đọc kết quả

Xem thời gian phản hồi trung bình và phần trăm chậm nhất (ví dụ 95%). Tỉ lệ lỗi tăng đột ngột là dấu hiệu hệ thống đã quá tải.

## Ngưỡng cho phép

```
Yêu cầu: thời gian phản hồi trung bình < 500 ms
Đo được: 420 ms → đạt
Đo được: 830 ms → không đạt, cần kiểm tra
```

## JMeter là gì

Công cụ mã nguồn mở để tạo kịch bản tải, chạy và xem báo cáo. Thường dùng cho kiểm thử API và web; có thể chạy trong quy trình CI.

## Sai ở đâu, và sửa thế nào

**Thuật ngữ trong slide này:** **Phân vị 95 (p95)**: Ngưỡng mà 95% yêu cầu nhanh hơn. Phản ánh trải nghiệm của người chậm nhất tốt hơn trung bình.

## Giải thích chi tiết

**Phân vị 95 (p95)**

**Tải (load)**

## Giải thích chi tiết

**Người dùng ảo (virtual user)**

## Điều cần nhớ

- Đặt ngưỡng rõ ràng trước khi đo.
- Đọc cả trung bình lẫn phần trăm chậm nhất.

## Kịch bản tải và cách đọc kết quả

Một kịch bản tải gồm số người dùng ảo, cách tăng dần và thời gian giữ.

- Đo thời gian phản hồi trung bình và phân vị 95 (95% yêu cầu nhanh hơn mức này).
- Đo tỉ lệ lỗi. Tỉ lệ lỗi tăng đột ngột khi tải tăng là dấu hiệu quá tải.
- Chỉ so sánh khi các lần đo cùng môi trường và cùng kịch bản.

**Thuật ngữ trong slide này:** **Phân vị 95 (p95)**: Ngưỡng mà 95% yêu cầu nhanh hơn. Phản ánh trải nghiệm của người chậm nhất tốt hơn trung bình. · **Người dùng ảo (virtual user)**: Một tiến trình giả lập người dùng thật, gửi yêu cầu theo kịch bản đã định.

## Đọc kết quả một lần chạy

1. Yêu cầu: trung bình dưới 500 ms, phân vị 95 dưới 1500 ms.
2. Kết quả: trung bình 420 ms, phân vị 95 là 1800 ms.
3. Trung bình đạt nhưng phân vị 95 không đạt.
4. Kết luận: không đạt. Cần tìm các yêu cầu chậm nhất.

**Thuật ngữ trong slide này:** **Phân vị 95 (p95)**: Ngưỡng mà 95% yêu cầu nhanh hơn. Phản ánh trải nghiệm của người chậm nhất tốt hơn trung bình.

## Đọc kết quả tải

- Thời gian trung bình: dễ nhìn, nhưng che giấu các yêu cầu chậm.
- Phân vị 95: 95% yêu cầu nhanh hơn mức này.
- Tỉ lệ lỗi: tăng đột ngột khi tải tăng là dấu hiệu quá tải.

*Kiến thức chung, chưa đối chiếu nguồn gốc.*

**Thuật ngữ trong slide này:** **Phân vị 95 (p95)**: Ngưỡng mà 95% yêu cầu nhanh hơn. Phản ánh trải nghiệm của người chậm nhất tốt hơn trung bình.

## Thực hành: làm ngay trên app mô phỏng

Đọc xong lý thuyết, mở [trang thực hành](thuc-hanh.html?id=hieu-nang). Bên trái là app đang test, bên phải là trợ giảng. Bấm **Chạy demo** để xem mẫu, rồi tự làm các bài.

## Đọc thêm: Mục mở rộng (không có mục riêng trong repo)

- Repo không có mục hiệu năng riêng. Tham khảo tài liệu công cụ tải trong mục Test Automation.

Nguồn: github.com/PaulWaltersDev/FreeLearningResourcesForSoftwareTesters, mục "Mục mở rộng (không có mục riêng trong repo)". Tìm tên tài liệu trong repo để lấy liên kết.

