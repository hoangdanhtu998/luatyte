# NES: tính vị trí ô trên bảng tên

## Ý chính
NES chia màn hình nền thành lưới 32 cột và 30 hàng ô. Bảng tên là một mảng một chiều, nên đổi tọa độ (cột, hàng) thành chỉ số: `hàng * 32 + cột`.

## Ví dụ
Ô ở cột 3, hàng 2 có chỉ số 2*32 + 3 = 67.

## Lỗi hay gặp
- Đổi thứ tự cột và hàng.

## Tự kiểm tra
1. NES có bao nhiêu cột ô nền?
2. Công thức đổi tọa độ là gì?
