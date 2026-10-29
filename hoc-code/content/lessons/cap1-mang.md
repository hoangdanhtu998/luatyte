# Mảng

## Tóm tắt trong 1 phút
- Mảng là dãy ô liền nhau, cùng một kiểu dữ liệu.
- Chỉ số bắt đầu từ 0. Phần tử cuối có chỉ số `n - 1`.
- Duyệt bằng vòng `for` từ 0 đến `n - 1`.
- Không truy cập ngoài `n - 1`: C không báo lỗi, chương trình có thể sai hoặc sập.

## Mục tiêu
- Khai báo và gán giá trị cho mảng
- Truy cập phần tử bằng chỉ số bắt đầu từ 0
- Duyệt mảng và tránh tràn mảng

## Mảng là một dãy hộp liền nhau
Ví dụ: dãy 5 ngăn tủ đánh số 0 đến 4. Mỗi ngăn chứa một số nguyên.

```c
int diem[5] = {8, 6, 9, 7, 10};
```

| Chỉ số | 0 | 1 | 2 | 3 | 4 |
|---|---|---|---|---|---|
| Giá trị | 8 | 6 | 9 | 7 | 10 |

## Đánh số từ 0
Phần tử đầu tiên có chỉ số 0, phần tử cuối có chỉ số `n - 1`.

```c
printf("%d\n", diem[0]);   // 8, phần tử đầu
printf("%d\n", diem[4]);   // 10, phần tử cuối
```

## Duyệt mảng bằng vòng for
```c
for (int i = 0; i < 5; i++) {
    printf("%d ", diem[i]);
}
printf("\n");
```

## Tính tổng và tìm lớn nhất
```c
int tong = 0;
int max = diem[0];
for (int i = 0; i < 5; i++) {
    tong += diem[i];
    if (diem[i] > max) max = diem[i];
}
printf("Tong=%d Max=%d\n", tong, max);   // Tong=40 Max=10
```

## Cạm bẫy: tràn mảng
Mảng có 5 ô thì chỉ có chỉ số 0 đến 4. Truy cập `diem[5]` là ghi hoặc đọc ra ngoài mảng, kết quả không đoán được.

```c
int diem[5];
diem[5] = 1;   // sai: ngoài mảng
```

Dùng `i < 5` trong vòng lặp, không dùng `i <= 5`.

## Ví dụ thực tế: đếm học sinh đạt điểm
```c
#include <stdio.h>

int main(void) {
    int diem[5] = {8, 6, 9, 7, 10};
    int dat = 0;
    for (int i = 0; i < 5; i++) {
        if (diem[i] >= 8) dat++;
    }
    printf("So nguoi dat diem >= 8: %d\n", dat);   // 3
    return 0;
}
```

## Tự kiểm tra
1. Mảng có 4 phần tử, chỉ số hợp lệ là những số nào?
2. `diem[2]` là phần tử thứ mấy?
3. Vì sao `i <= 5` sai khi mảng có 5 phần tử?

## Tổng kết
- Chỉ số bắt đầu từ 0
- Duyệt bằng `for` với `i < n`
- Không truy cập ngoài mảng

