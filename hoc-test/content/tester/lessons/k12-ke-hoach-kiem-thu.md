# K12: lập kế hoạch kiểm thử và chấm rủi ro

Bài tổng hợp: chọn rủi ro, chấm mức độ, quyết định kiểm gì trước, và viết phần kết luận của kế hoạch.

Bài trình chiếu đầy đủ nằm trong mục slide của bài này. Bài tập ở cuối trang.

## Nhìn bằng hình

*Hình vẽ gốc, dùng để minh họa thứ tự các bước chính của bài.*

## Đợt phát hành trước khai giảng

Còn hai tuần đến khai giảng. Đội có 3 tester và một ngày để kiểm thử. Không thể kiểm hết. Bạn chọn gì để kiểm trước, và vì sao?

*Kiến thức chung.*

## Chấm rủi ro bằng hai con số

Mức rủi ro = Mức nghiêm trọng × Khả năng xảy ra, mỗi cái từ 1 đến 5. Rủi ro từ 12 trở lên là ưu tiên kiểm trước.

| Rủi ro | Nghiêm trọng | Khả năng | Điểm |
| --- | --- | --- | --- |
| Học sinh xem được ghi chú giáo viên | 5 | 2 | 10 |
| Mất bài đang luyện khi đổi bản | 4 | 4 | 16 |
| Dò PIN không bị chặn | 5 | 3 | 15 |
| Font chữ lệch trên máy cũ | 2 | 3 | 6 |

*Điểm tính theo công thức trên. Số liệu trong bảng là ví dụ của người soạn bài, không phải đánh giá thật của đội K12.*

## Sắp thứ tự kiểm

1. Mất bài đang luyện (16): kiểm trước, vì ảnh hưởng học sinh trực tiếp.
2. Dò PIN (15): kiểm trước, vì là lỗ hổng bảo mật.
3. Ghi chú giáo viên (10): kiểm trong ngày đầu.
4. Font chữ (6): kiểm sau, nếu còn thời gian.

## Viết phần kết luận

```
Phạm vi: đăng nhập, xem bài, luyện tập, quyền truy cập
Không kiểm trong đợt này: soạn bằng AI, xuất SCORM (lý do: không có thay đổi)
Rủi ro cao còn lại: dò PIN chưa kiểm được trên môi trường thật
Khuyến nghị: không phát hành nếu chưa kiểm xong dò PIN
Việc cần từ đội khác: quản trị hệ thống cấp môi trường thử
```

*Mẫu do người soạn bài viết, theo cấu trúc báo cáo ở chặng trước.*

## Đổi một rủi ro

Giả sử đội phát hiện học sinh có thể đăng nhập bằng PIN của lớp khác. Chấm lại rủi ro này, cho biết nó đổi thứ tự kiểm thế nào, và viết một dòng thông báo cho quản lý.

## Mẫu số của phần trăm

Đợt kiểm có 40 ca, 30 đã chạy, 24 đạt. Viết lại kết luận về tỉ lệ đạt sao cho người đọc không hiểu lầm.

## Sai ở đâu, và sửa thế nào

## Giải thích chi tiết

**Kế hoạch kiểm thử (test plan)**

**Chấm điểm rủi ro**

