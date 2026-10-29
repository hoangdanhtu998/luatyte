# Đóng gói gói tin mạng

## Slide 1 · Bìa
**Đóng gói gói tin mạng**


## Slide 2 · Ý chính
Mạng truyền dòng byte, nên người nhận phải biết một thông điệp kết thúc ở đâu. Cách đơn giản là đặt tiền tố độ dài: 2 byte cho độ dài, theo sau là nội dung. Thứ tự big-endian: byte cao đi trước.

## Slide 3 · Ví dụ
Thông điệp "hi" (độ dài 2) được đóng gói thành `00 02 68 69`.

## Slide 4 · Lỗi hay gặp
- Đặt sai thứ tự byte (little-endian thay vì big-endian).

## Slide 5 · Tự kiểm tra
1. Vì sao cần tiền tố độ dài?
2. Big-endian nghĩa là gì?
