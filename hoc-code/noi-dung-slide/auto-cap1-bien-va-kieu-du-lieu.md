# Biến và kiểu dữ liệu

## Slide 1 · Bìa
**Biến và kiểu dữ liệu**


## Slide 2 · Mục tiêu
- Hiểu biến là một ô nhớ có tên, chứa một giá trị
- Biết gán giá trị và đọc giá trị của biến
- Theo dõi được giá trị của biến qua từng dòng lệnh

## Slide 3 · Trước khi đọc: thử đoán
Đoạn sau chạy xong thì `a` và `b` bằng bao nhiêu?

```
a = 5
b = a
a = 7
```

Viết đáp án ra giấy trước, rồi đọc tiếp. Đây là cách học chính của bài này: đoán, rồi kiểm tra bằng cách theo dõi từng bước.

## Slide 4 · Ý chính 1: biến là một ô nhớ có tên
Hình dung một dãy hộp có nhãn. Mỗi hộp có một nhãn (tên biến) và một thứ bên trong (giá trị). Gán `a = 5` nghĩa là: lấy hộp tên `a`, bỏ số 5 vào.

## Slide 5 · Ý chính 2: gán là sao chép giá trị, không phải nối hai hộp
Dòng `b = a` nghĩa là: lấy giá trị đang có trong `a` (lúc đó là 5) và chép sang `b`. Sau đó `b` có riêng số 5 của nó. Đổi `a` về sau không làm đổi `b`.

## Slide 6 · Bảng theo dõi
Đây là cách để nhìn thấy máy tính làm gì ở từng dòng. Mỗi dòng lệnh là một hàng, mỗi cột là một biến.

| Dòng lệnh | `a` | `b` |
|---|---|---|
| `a = 5` | 5 | (chưa có) |
| `b = a` | 5 | 5 |
| `a = 7` | 7 | 5 |

Đáp án của phần đoán ở trên: `a = 7`, `b = 5`.

## Slide 7 · Ý chính 3: kiểu dữ liệu là loại hộp
Mỗi biến có kiểu, cho máy biết hộp chứa loại gì và chiếm bao nhiêu chỗ:
- `int`: số nguyên, ví dụ `7`, `-3`
- `double`: số thực, ví dụ `3.5`
- `char`: một ký tự, ví dụ `'A'`

Kiểu quyết định phép tính làm như thế nào. Bài sau về toán tử sẽ thấy rõ điều này.

## Slide 8 · Ví dụ có code
Chương trình này làm đúng theo bảng trên:

```c
#include <stdio.h>

int main(void) {
    int a = 5;
    int b = a;      // chép giá trị của a sang b
    a = 7;          // đổi a, b không đổi
    printf("a=%d b=%d\n", a, b);
    return 0;
}
```

**Kết quả khi chạy:**
```
a=7 b=5
```

## Slide 9 · Lỗi hay gặp
- Nghĩ rằng `b = a` làm `b` và `a` "dính" với nhau. Thực tế chỉ chép một lần.
- Dùng biến trước khi gán giá trị. Giá trị lúc đó là rác, không đoán được.
- Quên kiểu: `int tuoi = 20.5;` sẽ mất phần thập phân.

## Slide 10 · Tự kiểm tra
1. Sau `x = 3` rồi `y = x` rồi `x = 9`, thì `y` bằng bao nhiêu? Vì sao?
2. Điền bảng theo dõi cho đoạn: `p = 2`, `q = 4`, `p = q`. `p` và `q` bằng bao nhiêu?
3. Vì sao `int` không thể lưu `3.5`?
