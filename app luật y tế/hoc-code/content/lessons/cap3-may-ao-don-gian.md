# Máy ảo đơn giản

## Ý chính
Máy ảo là một chương trình giả lập một máy tính. Nó đọc từng lệnh, giải mã và thực thi trên các thanh ghi. Bài này làm một máy ảo rất nhỏ (kiểu LC-3 đơn giản hóa) để hiểu vòng lặp nạp - giải mã - thực thi.

## Tập lệnh của bài này
- `SET r v`: đặt thanh ghi r bằng v.
- `ADD r1 r2`: cộng r2 vào r1.
- `PRINT r`: in giá trị thanh ghi r.

## Vòng lặp của máy ảo
1. Nạp lệnh tiếp theo.
2. Giải mã: xem tên lệnh là gì.
3. Thực thi và chuyển sang lệnh sau.

## Lỗi hay gặp
- Quên tăng bộ đếm lệnh (chương trình lặp mãi).

## Tự kiểm tra
1. Ba bước của vòng lặp máy ảo là gì?
2. Thanh ghi dùng để làm gì?
