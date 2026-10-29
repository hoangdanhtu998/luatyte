# Biên dịch và gỡ lỗi

## Vì sao cần biết cái này
Viết code xong chưa chắc chạy được. Trình biên dịch là người kiểm tra đầu tiên, và đọc đúng thông báo của nó tiết kiệm rất nhiều thời gian.

## Quy trình cơ bản
1. Viết code vào file `main.c`.
2. Biên dịch: `gcc -Wall -Wextra -std=c17 -g main.c -o main`.
3. Đọc lỗi từ trên xuống, bắt đầu từ lỗi đầu tiên.
4. Sửa, biên dịch lại.

## Ba loại lỗi
- **Lỗi cú pháp:** thiếu dấu `;`, thiếu ngoặc. Ví dụ báo `expected ';' before '}'`.
- **Lỗi liên kết (link):** hàm được khai báo nhưng không có phần định nghĩa. Ví dụ `undefined reference to 'foo'`.
- **Lỗi chạy:** chương trình biên dịch được nhưng sai kết quả hoặc crash.

## Cờ quan trọng
- `-Wall -Wextra`: bật thêm cảnh báo, bắt lỗi tiềm ẩn sớm.
- `-g`: gắn thông tin gỡ lỗi để debugger biết dòng nào tương ứng với code.

## Gỡ lỗi bằng gdb
- `gdb ./main` rồi gõ `run` để chạy.
- `break main` đặt điểm dừng, `next` chạy từng dòng, `print x` xem giá trị biến.

## Lỗi hay gặp
- Chỉ sửa dòng báo lỗi mà không đọc dòng phía trên: lỗi thiếu `;` thường được báo ở dòng sau.
- Bỏ qua cảnh báo: cảnh báo hôm nay thường là lỗi chạy ngày mai.

## Tự kiểm tra
1. Cờ `-Wall -Wextra` dùng để làm gì?
2. Lỗi `undefined reference` xuất hiện ở giai đoạn nào?
3. gdb dùng để làm gì?
