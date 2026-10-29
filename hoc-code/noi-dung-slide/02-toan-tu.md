# Bài 2 · Toán tử

**Mục tiêu:** dùng đúng toán tử số học, so sánh và logic, và hiểu thứ tự tính.

---

## Slide 1 · Bìa
**Toán tử**
Dấu cộng, trừ, so sánh và "và/hoặc". Máy làm theo đúng từng dấu.

## Slide 2 · Mục tiêu
- Dùng toán tử số học: `+ - * / %`
- Dùng toán tử so sánh và logic: `== != < > && || !`
- Hiểu toán tử gán `=` khác với so sánh `==`

## Slide 3 · Toán tử số học
```c
int a = 17, b = 5;
printf("%d\n", a + b);  // 22
printf("%d\n", a - b);  // 12
printf("%d\n", a * b);  // 85
printf("%d\n", a / b);  // 3  (chia số nguyên bỏ phần thập phân)
printf("%d\n", a % b);  // 2  (phần dư)
```

## Slide 4 · Cạm bẫy: chia số nguyên
Khi cả hai số là `int`, kết quả cũng là `int`. Muốn có phần thập phân, một số phải là `double`.

```c
printf("%d\n", 7 / 2);      // 3
printf("%.1f\n", 7.0 / 2);  // 3.5
```

## Slide 5 · Gán và so sánh: hai dấu khác nhau
- `=` là **gán**: đặt giá trị vào biến
- `==` là **so sánh**: hỏi hai giá trị có bằng nhau không

```c
int x = 5;        // gán 5 cho x
if (x == 5) {     // hỏi: x có bằng 5 không?
    printf("Dung\n");
}
```

## Slide 6 · So sánh và logic
| Toán tử | Nghĩa | Ví dụ |
|---|---|---|
| `<` `>` `<=` `>=` | nhỏ hơn, lớn hơn | `3 < 5` đúng |
| `==` `!=` | bằng, khác | `2 != 2` sai |
| `&&` | và (cả hai đúng) | `tuoi >= 18 && co_ve` |
| `||` | hoặc (một trong hai đúng) | `ngay == 7 || ngay == 1` |
| `!` | không | `!mua` đảo đúng thành sai |

## Slide 7 · Ví dụ đời thường: vào rạp
Vào rạp nếu đủ tuổi **và** có vé. Thiếu một trong hai thì không vào.

```c
#include <stdio.h>

int main(void) {
    int tuoi = 16;
    int co_ve = 1;   // 1 nghĩa là có vé, 0 nghĩa là không
    if (tuoi >= 18 && co_ve) {
        printf("Vao rap\n");
    } else {
        printf("Chua duoc vao\n");
    }
    return 0;
}
```

## Slide 8 · Tăng và giảm
`x++` tăng x thêm 1. `x--` giảm 1. Trong C, `0` là sai, mọi số khác `0` là đúng.

```c
int dem = 0;
dem++;      // dem bây giờ là 1
dem += 5;   // dem bây giờ là 6
```

## Slide 9 · Tự kiểm tra
1. `7 / 2` cho kết quả là bao nhiêu? Vì sao?
2. Viết điều kiện: số nằm trong khoảng từ 1 đến 10.
3. `if (x = 3)` có phải là so sánh không?

## Slide 10 · Tổng kết
- `/` và `%` làm việc với số nguyên trước tiên
- `=` gán, `==` so sánh
- `&&` cần cả hai đúng, `||` chỉ cần một đúng

---

**Ghi chú người thuyết trình (đáp án slide 9):**
1. Kết quả là `3`. Hai số đều là số nguyên nên phần thập phân bị bỏ.
2. `x >= 1 && x <= 10`.
3. Không, đó là phép gán. `x` nhận giá trị 3 và điều kiện luôn đúng (vì 3 khác 0).
