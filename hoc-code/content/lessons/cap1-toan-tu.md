# Toán tử: máy tính tính thế nào

## Mục tiêu
- Biết các phép tính cơ bản và kết quả của từng phép
- Hiểu vì sao `7 / 2` cho kết quả là 3 chứ không phải 3.5
- Phân biệt `i++` và `++i`

## Trước khi đọc: thử đoán
Mỗi dòng sau in ra gì?

```
printf("%d\n", 7 / 2);
printf("%d\n", 7 % 2);
printf("%d\n", 5 > 3);
```

Viết đáp án ra giấy trước. Lưu ý: `5 > 3` đúng hay sai, và máy tính biểu diễn "đúng" bằng số nào?

## Ý chính 1: phép tính trên số nguyên luôn cắt phần lẻ
Khi cả hai số đều là số nguyên, phép chia `/` chỉ giữ phần nguyên.
- `7 / 2` là 3 (vì 3,5 bị cắt bỏ phần lẻ)
- `7 % 2` là 1 (phần dư, tức là 7 - 3 × 2)

Muốn kết quả có phần lẻ thì một trong hai số phải viết dạng thập phân: `7.0 / 2` cho 3.5.

## Ý chính 2: phép so sánh cho kết quả 1 hoặc 0
C không có kiểu "đúng/sai" riêng. Phép so sánh cho:
- `1` nếu đúng
- `0` nếu sai

Ví dụ: `5 > 3` cho 1, còn `2 == 3` cho 0. Đây là lý do `if` có thể dùng trực tiếp một phép so sánh.

## Ý chính 3: `i++` và `++i` khác nhau ở thời điểm tăng
Cả hai đều làm `i` tăng thêm 1. Khác nhau là giá trị dùng trong biểu thức:
- `n++`: dùng giá trị cũ của `n`, rồi mới tăng.
- `++n`: tăng `n` trước, rồi mới dùng giá trị mới.

Khi chỉ viết `i++;` một mình thì không khác gì nhau. Chỉ khác khi nó nằm trong một biểu thức khác.

## Bảng theo dõi
Theo dõi đoạn sau, mỗi hàng là một dòng lệnh:

```c
int n = 10;
int r = n++ + 1;
```

| Dòng lệnh | `n` | `r` | Ghi chú |
|---|---|---|---|
| `n = 10` | 10 | (chưa có) | |
| `r = n++ + 1` | 11 | 11 | Lấy `n` cũ là 10, cộng 1 được 11; sau đó `n` tăng thành 11 |

## Ví dụ có code

```c
#include <stdio.h>

int main(void) {
    int x = 7, y = 2;
    printf("%d %d\n", x / y, x % y);     // chia lấy nguyên, lấy dư
    printf("%.1f\n", 7.0 / 2);           // số thực
    int k = 3;
    k += 4;                              // giống k = k + 4
    printf("%d\n", k);
    return 0;
}
```

**Kết quả khi chạy:**
```
3 1
3.5
7
```

## Lỗi hay gặp
- Nghĩ `7 / 2` là 3.5. Thực tế là 3, vì cả hai số đều là số nguyên.
- Dùng `=` thay cho `==` khi so sánh. `if (x = 5)` là gán, không phải so sánh.
- Dùng `%` với số thực. Phép `%` chỉ dùng cho số nguyên.

## Tự kiểm tra
1. `17 / 5` và `17 % 5` bằng bao nhiêu?
2. `int a = 4; int b = a++ * 2;` thì `a` và `b` bằng bao nhiêu?
3. Vì sao `if (diem = 10)` sai? Nên viết thế nào để so sánh?
