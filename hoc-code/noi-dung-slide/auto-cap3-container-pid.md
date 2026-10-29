# Container: không gian PID riêng

## Slide 1 · Bìa
**Container: không gian PID riêng**


## Slide 2 · Ý chính
Container dùng namespace để cô lập. Trong không gian PID riêng, tiến trình đầu tiên có PID 1, và các PID thật trên máy chủ được ánh xạ sang số riêng bên trong container.

## Slide 3 · Ví dụ
Các tiến trình thật 700, 701, 705 thuộc container, sẽ là PID 1, 2, 3 bên trong.

## Slide 4 · Lưu ý
Bài này mô phỏng việc ánh xạ bằng bảng. Namespace thật cần Linux.

## Slide 5 · Tự kiểm tra
1. Container khác máy ảo ở điểm nào?
2. Vì sao PID bên trong bắt đầu từ 1?
