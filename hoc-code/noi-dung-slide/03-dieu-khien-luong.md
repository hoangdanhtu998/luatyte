# Bài 3 · Điều khiển luồng

**Mục tiêu:** dùng `if`, `switch`, `while`, `for` để chương trình làm việc khác nhau tùy tình huống và lặp lại công việc.

---

## Slide 1 · Bìa
**Điều khiển luồng**
Chương trình rẽ nhánh như ngã tư, và lặp lại như vòng xe buýt.

## Slide 2 · Mục tiêu
- Rẽ nhánh với `if` và `switch`
- Lặp với `while` và `for`
- Dùng `break` và `continue` đúng lúc

## Slide 3 · Rẽ nhánh với if
Ví dụ: đèn giao thông. Đèn xanh thì đi, đèn đỏ thì dừng.

```c
int den = 1;   // 1 = xanh, 0 = đỏ
if (den == 1) {
    printf("Di\n");
} else {
    printf("Dung lai\n");
}
```

## Slide 4 · Nhiều nhánh với else if
```c
int diem = 7;
if (diem >= 9) {
    printf("Gioi\n");
} else if (diem >= 7) {
    printf("Kha\n");
} else {
    printf("Can co gang\n");
}
```

## Slide 5 · switch: chọn theo giá trị
Dùng khi cần chọn theo một giá trị cụ thể, như số ngày trong tuần. Nhớ `break`, nếu không máy chạy tiếp nhánh sau.

```c
int ngay = 2;
switch (ngay) {
    case 1: printf("Chu nhat\n"); break;
    case 2: printf("Thu hai\n");  break;
    default: printf("Ngay khac\n");
}
```

## Slide 6 · while: lặp khi còn điều kiện
Ví dụ: đếm từ 1 đến 3.

```c
int i = 1;
while (i <= 3) {
    printf("%d\n", i);
    i++;            // quên dòng này là lặp mãi mãi
}
```

## Slide 7 · for: lặp khi biết số lần
`for` gồm ba phần: khởi tạo, điều kiện, bước tiến. Ví dụ in các số chẵn từ 0 đến 8.

```c
for (int i = 0; i <= 8; i += 2) {
    printf("%d ", i);
}
printf("\n");   // in: 0 2 4 6 8
```

## Slide 8 · break và continue
- `break`: thoát khỏi vòng lặp ngay
- `continue`: bỏ qua phần còn lại của lượt này, sang lượt sau

```c
for (int i = 1; i <= 5; i++) {
    if (i == 2) continue;   // bỏ qua số 2
    if (i == 4) break;      // dừng khi tới 4
    printf("%d ", i);       // in: 1 3
}
printf("\n");
```

## Slide 9 · Ví dụ thực tế: tổng các số
Cộng các số từ 1 đến 10 bằng một vòng lặp.

```c
#include <stdio.h>

int main(void) {
    int tong = 0;
    for (int i = 1; i <= 10; i++) {
        tong += i;
    }
    printf("Tong = %d\n", tong);   // 55
    return 0;
}
```

## Slide 10 · Tự kiểm tra
1. `for` và `while` khác nhau ở điểm nào khi biết trước số lần lặp?
2. Bỏ dòng `i++` trong vòng `while` thì chuyện gì xảy ra?
3. `break` và `continue` khác nhau thế nào?

## Slide 11 · Tổng kết
- `if` chọn một nhánh theo điều kiện
- `while` lặp khi còn điều kiện, `for` lặp khi biết số lần
- Luôn đảm bảo điều kiện lặp sẽ có lúc sai

---

**Ghi chú người thuyết trình (đáp án slide 10):**
1. `for` gọn hơn khi biết trước số lần (đếm từ 1 đến 10). `while` hợp khi không biết trước, ví dụ chờ người dùng nhập đúng.
2. Biến `i` không bao giờ tăng, điều kiện luôn đúng, vòng lặp chạy mãi (vòng lặp vô hạn).
3. `break` thoát hẳn khỏi vòng lặp. `continue` chỉ bỏ qua lượt hiện tại.
