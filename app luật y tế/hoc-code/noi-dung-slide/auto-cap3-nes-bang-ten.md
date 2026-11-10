# NES: tính vị trí ô trên bảng tên

## Slide 1 · Bìa
**NES: tính vị trí ô trên bảng tên**


## Slide 2 · Ý chính
NES chia màn hình nền thành lưới 32 cột và 30 hàng ô. Bảng tên là một mảng một chiều, nên đổi tọa độ (cột, hàng) thành chỉ số: `hàng * 32 + cột`.

## Slide 3 · Ví dụ
Ô ở cột 3, hàng 2 có chỉ số 2*32 + 3 = 67.

## Slide 4 · Lỗi hay gặp
- Đổi thứ tự cột và hàng.

## Slide 5 · Tự kiểm tra
1. NES có bao nhiêu cột ô nền?
2. Công thức đổi tọa độ là gì?
