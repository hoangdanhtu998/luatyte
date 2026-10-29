# Mạng từ đầu: gửi theo gói và số thứ tự

## Ý chính
Thông điệp dài phải chia thành các gói nhỏ. Mỗi gói có số thứ tự để người nhận ghép đúng. Số gói cần gửi là làm tròn lên của độ dài chia cho kích thước gói tối đa.

## Ví dụ
Thông điệp 10 byte, mỗi gói tối đa 4 byte: cần 3 gói (4, 4, 2).

## Lưu ý
Bài này mô phỏng việc chia gói, không gửi qua mạng thật.

## Tự kiểm tra
1. Vì sao cần số thứ tự?
2. Có bao nhiêu gói cho 10 byte với gói tối đa 4 byte?
