# Kernel: bảng vector ngắt

## Slide 1 · Bìa
**Kernel: bảng vector ngắt**


## Slide 2 · Ý chính
Ngắt là tín hiệu từ phần cứng (bàn phím, bộ hẹn giờ). Kernel đăng ký một trình xử lý cho mỗi số ngắt trong bảng vector. Khi ngắt số n đến, CPU gọi đúng trình xử lý thứ n.

## Slide 3 · Ví dụ
Ngắt 1 là bàn phím, ngắt 0 là bộ hẹn giờ. Khi ngắt 1 đến, trình xử lý bàn phím chạy.

## Slide 4 · Lưu ý
Bài này mô phỏng bảng vector bằng mảng hàm, không chạy trên phần cứng.

## Slide 5 · Tự kiểm tra
1. Bảng vector ngắt chứa gì?
2. Vì sao cần số hiệu cho mỗi ngắt?
