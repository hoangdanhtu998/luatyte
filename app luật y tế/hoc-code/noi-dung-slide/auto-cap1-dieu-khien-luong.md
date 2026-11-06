# Điều khiển luồng

## Slide 1 · Bìa
**Điều khiển luồng**


## Slide 2 · Mục tiêu
- Đọc được `if`, `else if`, `else` và biết nhánh nào được chạy
- Theo dõi được vòng lặp `while` và `for` qua từng lượt
- Hiểu `break` và `continue` làm thay đổi đường đi thế nào

## Slide 3 · Trước khi đọc: thử đoán
Đoạn sau in ra gì? Đếm trước khi đọc tiếp.

```c
int n = 3, i = 1, total = 0;
while (i <= n) {
    total = total + i;
    i++;
}
// total bằng bao nhiêu?
```

Gợi ý: vòng lặp chạy với `i` = 1, 2, 3. Mỗi lượt cộng `i` vào `total`.

## Slide 4 · Ý chính 1: máy tính luôn chạy từ trên xuống, và chỉ chọn một nhánh
Với `if`, máy tính kiểm tra điều kiện từ trên xuống. Gặp điều kiện đúng đầu tiên thì chạy nhánh đó, rồi bỏ qua các nhánh còn lại.

```c
int diem = 7;
if (diem >= 9) printf("Gioi\n");
else if (diem >= 7) printf("Kha\n");
else printf("Can co gang\n");
```

Với `diem` = 7: `diem >= 9` sai, bỏ qua. `diem >= 7` đúng, in "Kha", rồi dừng. Nhánh `else` không chạy.

## Slide 5 · Ý chính 2: `if` không có `else` thì mỗi `if` độc lập
Hai câu `if` liên tiếp đều được kiểm tra. Đây là điểm khác với `else if`.

```c
int x = 10;
if (x > 5) printf("A\n");
if (x > 8) printf("B\n");
if (x > 20) printf("C\n");
```

Với `x` = 10: `A` và `B` đều được in, vì cả hai điều kiện đều đúng. `C` không in.

## Slide 6 · Ý chính 3: vòng lặp là một chu kỳ lặp lại có điều kiện dừng
`while` kiểm tra điều kiện trước mỗi lượt. Khi sai thì thoát.
`for` gom ba phần vào một dòng: khởi tạo, kiểm tra điều kiện, và bước tiến sau mỗi lượt.

Điều quan trọng nhất: phải có một thứ gì đó thay đổi để điều kiện cuối cùng sai. Nếu quên `i++` trong `while`, `i` luôn bằng 1 và vòng lặp không bao giờ dừng.

## Slide 7 · Bảng theo dõi: vòng lặp tính tổng
Theo dõi đoạn ở phần "thử đoán" (`n` = 3):

| Lượt | `i` lúc kiểm tra | `i <= n`? | `total` sau khi cộng | `i` sau khi tăng |
|---|---|---|---|---|
| 1 | 1 | đúng | 0 + 1 = 1 | 2 |
| 2 | 2 | đúng | 1 + 2 = 3 | 3 |
| 3 | 3 | đúng | 3 + 3 = 6 | 4 |
| Thoát | 4 | sai | (dừng) | |

Đáp án: `total` = 6.

## Slide 8 · Ý chính 4: `break` và `continue`
- `continue`: bỏ phần còn lại của lượt này, nhảy sang lượt sau.
- `break`: thoát hẳn khỏi vòng lặp.

Theo dõi đoạn sau, trong đó `i` chạy từ 1 đến 5:

| `i` | `i == 2`? | `i == 4`? | Kết quả |
|---|---|---|---|
| 1 | không | không | in 1 |
| 2 | đúng | | `continue`: bỏ qua, không in |
| 3 | không | không | in 3 |
| 4 | | đúng | `break`: dừng hẳn |

Kết quả: in `1` và `3`.

## Slide 9 · Ví dụ có code
```c
#include <stdio.h>

int main(void) {
    int n = 3, i = 1, total = 0;
    while (i <= n) {
        total = total + i;
        printf("i=%d total=%d\n", i, total);
        i++;
    }
    printf("ket thuc: total=%d\n", total);
    return 0;
}
```

**Kết quả khi chạy:**
```
i=1 total=1
i=2 total=3
i=3 total=6
ket thuc: total=6
```

## Slide 10 · Lỗi hay gặp
- Quên `break` trong `switch`: máy tính chạy tiếp các nhánh sau.
- Viết `if (x = 5)` thay vì `if (x == 5)`: đây là gán, không phải so sánh.
- Vòng lặp không có bước tiến: chạy mãi không dừng.
- Dùng `i` của `for` ở ngoài vòng lặp. Biến khai báo trong `for (int i = ...)` chỉ tồn tại trong vòng lặp.

## Slide 11 · Tự kiểm tra
1. Với `diem = 9`, chương trình rẽ nhánh nào? Vì sao không in "Kha"?
2. Với `x = 10` ở ví dụ `if` liên tiếp, nếu đổi thành `x = 3` thì in gì?
3. Trong bảng `break`/`continue`, vì sao số 4 không được in ra?
