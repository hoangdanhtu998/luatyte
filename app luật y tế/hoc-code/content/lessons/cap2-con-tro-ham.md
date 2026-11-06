# Con trỏ hàm

## Ý chính
Hàm cũng nằm ở một địa chỉ trong bộ nhớ. Con trỏ hàm giữ địa chỉ đó, nên có thể truyền một hành vi vào hàm khác.

## Đời thường
Hãy hình dung một nhà bếp dùng chung. Người phục vụ không cần biết món ăn là gì, chỉ cần một tấm phiếu ghi cách làm. Con trỏ hàm là tấm phiếu đó.

## Khai báo
```c
int cong(int a, int b) { return a + b; }
int (*f)(int, int) = cong;   // f trỏ tới hàm cong
printf("%d\n", f(2, 3));    // 5
```

Đọc khai báo: `f` là con trỏ tới hàm nhận hai `int` và trả về `int`. Dấu `*` nằm trong ngoặc cùng `f`.

## Callback
```c
int apply(int (*op)(int, int), int a, int b) {
    return op(a, b);
}
```
Cùng một hàm `apply` có thể làm cộng, trừ, nhân tùy hàm được truyền vào.

## Lỗi hay gặp
- `int *f(int, int)` là hàm trả về con trỏ `int`, khác với con trỏ hàm. Thiếu cặp ngoặc là khác nghĩa.
- Gọi con trỏ hàm đang là `NULL` làm chương trình crash. Kiểm tra trước khi gọi.

## Tự kiểm tra
1. Con trỏ hàm lưu gì?
2. `int (*f)(int, int)` nghĩa là gì?
3. Vì sao cần callback?
