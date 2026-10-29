# Trình biên dịch: số nguyên sang assembly

## Ý chính
Trình biên dịch dịch mã nguồn sang assembly. Bước đầu tiên là nhận diện một số và sinh lệnh đưa số đó vào thanh ghi. Với giá trị trả về, `ret` kết thúc hàm.

## Ví dụ
Với hàm trả về 42, assembly là:
```
mov $42, %eax
ret
```

## Lưu ý
Đây là bản rút gọn chỉ có một số. Trình biên dịch thật xử lý biểu thức, biến và hàm.

## Tự kiểm tra
1. `ret` làm gì?
2. Thanh ghi `%eax` thường dùng để chứa gì?
