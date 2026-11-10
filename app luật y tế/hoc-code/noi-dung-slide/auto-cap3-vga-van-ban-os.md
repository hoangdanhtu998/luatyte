# Chữ trên màn hình VGA (OS tutorial)

## Slide 1 · Bìa
**Chữ trên màn hình VGA (OS tutorial)**


## Slide 2 · Ý chính
Khi máy khởi động ở chế độ văn bản, màn hình là bộ đệm tại địa chỉ 0xB8000, 80 cột và 25 hàng. Mỗi ô 2 byte: một byte ký tự, một byte màu. Địa chỉ ô (hàng, cột) là `(hàng * 80 + cột) * 2`.

## Slide 3 · Ví dụ
Ô ở hàng 1, cột 2 có offset (1*80 + 2)*2 = 164.

## Slide 4 · Lỗi hay gặp
- Quên nhân 2 vì mỗi ô 2 byte.

## Slide 5 · Tự kiểm tra
1. Mỗi ô văn bản VGA dùng bao nhiêu byte?
2. Công thức tính offset là gì?
