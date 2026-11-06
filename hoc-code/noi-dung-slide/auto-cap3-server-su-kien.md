# Server đồng thời: vòng lặp sự kiện

## Slide 1 · Bìa
**Server đồng thời: vòng lặp sự kiện**


## Slide 2 · Ý chính
Có hai cách phục vụ nhiều kết nối: mỗi kết nối một luồng, hoặc một vòng lặp sự kiện xử lý các sự kiện theo thứ tự. Vòng lặp sự kiện tiết kiệm bộ nhớ và tránh chuyển ngữ cảnh.

## Slide 3 · Ví dụ
Sự kiện đến theo thứ tự: kết nối A, dữ liệu A, kết nối B. Vòng lặp xử lý lần lượt từng sự kiện.

## Slide 4 · Lưu ý
Bài này mô phỏng bằng hàng đợi sự kiện, không mở socket thật.

## Slide 5 · Tự kiểm tra
1. Vòng lặp sự kiện khác luồng cho mỗi kết nối ở điểm nào?
2. Nhược điểm của một luồng chặn là gì?
