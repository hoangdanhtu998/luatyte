# Checksum và tiêu đề IPv4

## Slide 1 · Bìa
**Checksum và tiêu đề IPv4**


## Slide 2 · Ý chính
Mỗi gói IPv4 có checksum để phát hiện lỗi trong tiêu đề. Cách tính: cộng các từ 16 bit, gấp phần nhớ về, rồi lấy bù một.

## Slide 3 · Các bước
1. Đặt trường checksum bằng 0.
2. Cộng tất cả từ 16 bit.
3. Gấp phần vượt 16 bit vào phần thấp, lặp lại đến khi gọn.
4. Lấy bù một (đảo bit).

## Slide 4 · Ví dụ
Tiêu đề mẫu cho kết quả checksum `b861`.

## Slide 5 · Lỗi hay gặp
- Quên đặt checksum bằng 0 trước khi tính.
- Bỏ qua phần nhớ.

## Slide 6 · Tự kiểm tra
1. Checksum dùng phép cộng gì?
2. Vì sao phải gấp phần nhớ?
