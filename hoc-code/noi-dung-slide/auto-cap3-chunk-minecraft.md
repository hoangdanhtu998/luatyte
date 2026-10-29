# Chunk và tọa độ khối (Minecraft)

## Slide 1 · Bìa
**Chunk và tọa độ khối (Minecraft)**


## Slide 2 · Ý chính
Thế giới khối (voxel) chia thành các chunk. Trong một chunk 16×16×16, mỗi khối có tọa độ (x, y, z). Muốn lưu vào mảng một chiều, dùng công thức `x + z*16 + y*256`.

## Slide 3 · Ví dụ
Khối (1, 2, 3) có chỉ số 1 + 3*16 + 2*256 = 561.

## Slide 4 · Lỗi hay gặp
- Đổi thứ tự x, y, z làm các khối lẫn nhau.

## Slide 5 · Tự kiểm tra
1. Vì sao cần chia thành chunk?
2. Khối (0, 0, 0) có chỉ số bao nhiêu?
