# Lập lịch round-robin (hệ điều hành)

## Ý chính
Hệ điều hành chia thời gian CPU. Round-robin cho mỗi tiến trình chạy một lượng tử (quantum), rồi chuyển sang tiến trình kế tiếp. Tiến trình chưa xong quay lại cuối hàng.

## Ví dụ
Ba tiến trình cần 5, 3, 1 đơn vị, quantum 2: P3 xong lúc 5, P2 xong lúc 8, P1 xong lúc 9.

## Lỗi hay gặp
- Quên đưa tiến trình chưa xong về cuối hàng.

## Tự kiểm tra
1. Quantum là gì?
2. Round-robin có công bằng không? Vì sao?
