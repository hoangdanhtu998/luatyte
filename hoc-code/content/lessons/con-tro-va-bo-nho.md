# Con trỏ và bộ nhớ

> Mục tiêu: hiểu con trỏ là gì và `malloc`, `free` làm gì. Chỉ cần nhớ một hình ảnh: mọi thứ đều nằm ở một địa chỉ.

## Tóm tắt trong 1 phút
- Biến là một ô nhớ có địa chỉ. Con trỏ là biến giữ địa chỉ đó, giống số nhà trên lá thư.
- `&x` lấy địa chỉ của `x`. `*p` đi tới ô mà `p` trỏ tới, để đọc hoặc đổi giá trị.
- Stack tự dọn khi hàm kết thúc. Heap xin bằng `malloc` thì phải trả bằng `free`.
- Luôn kiểm tra `malloc` có trả về `NULL` không. Mỗi `malloc` cần đúng một `free`.

## 1. Biến là một ô nhớ có địa chỉ

Bộ nhớ như một con phố, mỗi ô có số nhà (địa chỉ) và nội dung bên trong (giá trị).

```c
int x = 42;
printf("Gia tri: %d\n", x);                 // 42
printf("Dia chi: %p\n", (void *)&x);        // một số như 0x7ffd...
```

## 2. Con trỏ là lá thư ghi số nhà

Con trỏ là biến mà giá trị bên trong là một địa chỉ.

```c
int x = 42;
int *p = &x;    // p giữ địa chỉ của x
*p = 7;         // đi tới ô p trỏ tới, ghi 7 vào đó
printf("%d\n", x);   // in ra 7
```

Hai dấu `*` khác nhau:
- Trong `int *p`: p là con trỏ tới `int`.
- Trong `*p = 7`: nội dung của ô mà p trỏ tới.

## 3. Stack và heap

| | Stack | Heap |
|---|---|---|
| Lưu gì | Biến cục bộ trong hàm | Vùng nhớ xin bằng `malloc` |
| Ai dọn | Tự động khi hàm kết thúc | Bạn phải tự `free` |
| Khi nào dùng | Biết kích thước lúc viết code | Kích thước chỉ biết lúc chạy |

Ví dụ: số phần tử của mảng do người dùng nhập. Mảng phải nằm trên heap:

```c
int *arr = malloc(n * sizeof(int));
```

## 4. malloc, free và kiểm tra NULL

Quy trình an toàn luôn có ba bước: xin, kiểm tra, dùng, rồi trả.

```c
int *arr = malloc(5 * sizeof(int));  // 1. xin
if (arr == NULL) {                   // 2. kiểm tra
    perror("malloc");
    return 1;
}
for (int i = 0; i < 5; i++) arr[i] = i * i;  // 3. dùng

free(arr);    // trả lại
arr = NULL;   // tránh dùng lại con trỏ cũ
```

Dùng `sizeof(int)` thay vì viết cứng `4`. Gán `arr = NULL` sau khi `free` giúp lỗi lộ ra ngay thay vì âm thầm làm hỏng dữ liệu.

## 5. Ba lỗi hay gặp

**Lỗi 1: dùng con trỏ NULL.** Ghi vào `NULL` làm chương trình crash.

```c
int *a = NULL;
*a = 1;        // crash
```

**Lỗi 2: dùng sau khi free.** Ô nhớ đã trả lại, đọc hoặc ghi là hành vi không xác định. Đây là lỗi khó bắt nhất.

```c
int *b = malloc(sizeof(int));
free(b);
*b = 2;        // sai
```

**Lỗi 3: rò rỉ bộ nhớ.** Cấp phát mà quên `free`. Chương trình ngắn thì ít ảnh hưởng, nhưng chương trình chạy lâu sẽ hết bộ nhớ.

```c
int *c = malloc(sizeof(int));
*c = 3;        // thiếu free(c): rò rỉ
```

> Mẹo: biên dịch với `-fsanitize=address` rồi chạy, công cụ sẽ báo đúng dòng lỗi.

## 6. Tự kiểm tra
1. Vì sao `&x` in ra số khác nhau trên máy khác nhau?
2. Nếu hàm trả về `&x` với `x` là biến cục bộ, chuyện gì xảy ra?
3. Khi nào bắt buộc dùng heap thay vì stack?

## Tổng kết
- Con trỏ giữ địa chỉ. `*p` đi theo địa chỉ đó.
- Heap phải `free`. Luôn kiểm tra `NULL`.
- Ba lỗi hay gặp: con trỏ NULL, dùng sau khi free, rò rỉ bộ nhớ.
