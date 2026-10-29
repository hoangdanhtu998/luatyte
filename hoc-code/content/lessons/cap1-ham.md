# Hàm

## Tóm tắt trong 1 phút
- Hàm gói một việc lại, đặt tên rõ ràng, để gọi nhiều lần.
- Truyền biến vào hàm là truyền một **bản sao**, nên đổi bản sao không đổi biến gốc.
- Muốn hàm đổi được biến gốc, truyền **địa chỉ** bằng con trỏ.

## Mục tiêu
- Viết và gọi hàm
- Truyền tham số và nhận giá trị trả về
- Hiểu vì sao hàm truyền giá trị không đổi biến gốc

## Vì sao cần hàm
Một công việc lặp lại (ví dụ tính diện tích hình chữ nhật) nên được gói lại. Muốn đổi cách tính, chỉ sửa một chỗ.

## Cấu trúc một hàm
```c
int cong(int a, int b) {    // kiểu trả về, tên, tham số
    return a + b;            // trả về kết quả
}
```

Gọi hàm: `int ket_qua = cong(3, 4);` cho `ket_qua` là `7`.

## Hàm không trả về gì
Dùng `void` khi hàm chỉ làm việc, không cần kết quả.

```c
void chao(const char *ten) {
    printf("Xin chao %s\n", ten);
}
```

## Truyền giá trị: hàm nhận bản sao
Khi truyền `x` vào hàm, hàm nhận một bản sao. Đổi bản sao không làm đổi `x`.

```c
#include <stdio.h>

void tang(int n) {
    n = n + 10;          // chỉ đổi bản sao
}

int main(void) {
    int x = 5;
    tang(x);
    printf("%d\n", x);   // vẫn là 5
    return 0;
}
```

## Muốn đổi biến gốc: truyền địa chỉ
Dùng con trỏ để hàm đi tới ô của biến gốc. Đây là lý do của bài con trỏ.

```c
#include <stdio.h>

void tang_that(int *p) {
    *p = *p + 10;        // đi tới ô, đổi giá trị ở đó
}

int main(void) {
    int x = 5;
    tang_that(&x);
    printf("%d\n", x);   // 15
    return 0;
}
```

## Ví dụ thực tế: tính điểm trung bình
Một hàm nhận ba điểm và trả về điểm trung bình. Chương trình chính dùng lại hàm này.

```c
#include <stdio.h>

double trung_binh(double a, double b, double c) {
    return (a + b + c) / 3.0;
}

int main(void) {
    printf("%.2f\n", trung_binh(7, 8, 9));   // 8.00
    return 0;
}
```

## Tự kiểm tra
1. Hàm `cong` có thay đổi biến `a` ở chỗ gọi không? Vì sao?
2. Muốn hàm đổi giá trị của biến bên ngoài, cần truyền gì?
3. Hàm `chao` trả về gì?

## Tổng kết
- Hàm gói một việc, đặt tên rõ ràng
- Truyền giá trị: hàm nhận bản sao
- Truyền địa chỉ: hàm đổi được biến gốc

