# Container: không gian PID riêng

## Ý chính
Container dùng namespace để cô lập. Trong không gian PID riêng, tiến trình đầu tiên có PID 1, và các PID thật trên máy chủ được ánh xạ sang số riêng bên trong container.

## Ví dụ
Các tiến trình thật 700, 701, 705 thuộc container, sẽ là PID 1, 2, 3 bên trong.

## Lưu ý
Bài này mô phỏng việc ánh xạ bằng bảng. Namespace thật cần Linux.

## Tự kiểm tra
1. Container khác máy ảo ở điểm nào?
2. Vì sao PID bên trong bắt đầu từ 1?
