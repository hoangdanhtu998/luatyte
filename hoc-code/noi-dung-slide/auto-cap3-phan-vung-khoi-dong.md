# Phân vùng khởi động (bootloader)

## Slide 1 · Bìa
**Phân vùng khởi động (bootloader)**


## Slide 2 · Ý chính
Sector đầu của ổ đĩa (MBR) dài 512 byte, trong đó có bảng phân vùng. Mỗi mục phân vùng bắt đầu bằng một byte trạng thái: `0x80` nghĩa là phân vùng khởi động được.

## Slide 3 · Đời thường
Bảng hướng dẫn ở cổng tòa nhà: mỗi tầng có một ô ghi có ai đang ở đó. Byte trạng thái là ô đánh dấu.

## Slide 4 · Ví dụ
Bốn byte trạng thái `80 00 00 00` nghĩa là chỉ phân vùng đầu tiên là khởi động.

## Slide 5 · Lỗi hay gặp
- Đọc sai thứ tự byte.
- Nhầm `0x80` với `0x08`.

## Slide 6 · Tự kiểm tra
1. Byte trạng thái `0x80` có ý nghĩa gì?
2. MBR dài bao nhiêu byte?
