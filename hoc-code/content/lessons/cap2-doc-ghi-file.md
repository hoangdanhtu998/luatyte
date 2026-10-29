# Đọc và ghi file

## Ý chính
Muốn lưu dữ liệu sau khi tắt chương trình, cần ghi xuống file. Quy trình luôn là: mở, dùng, đóng.

## Các chế độ mở
| Mode | Nghĩa |
|---|---|
| `"r"` | đọc |
| `"w"` | ghi, xóa nội dung cũ |
| `"a"` | ghi thêm vào cuối |

## Ví dụ ghi và đọc
```c
#include <stdio.h>

int main(void) {
    FILE *f = fopen("so.txt", "w");
    if (f == NULL) return 1;          // luôn kiểm tra
    for (int i = 1; i <= 3; i++) fprintf(f, "%d\n", i);
    fclose(f);

    f = fopen("so.txt", "r");
    if (f == NULL) return 1;
    char dong[64];
    while (fgets(dong, sizeof dong, f) != NULL) printf("%s", dong);
    fclose(f);
    return 0;
}
```

## Lỗi hay gặp
- Không kiểm tra `fopen` trả về `NULL` rồi vẫn dùng.
- Quên `fclose`: dữ liệu có thể chưa xuống đĩa, và tài nguyên không được trả.
- Dùng con trỏ `FILE` sau khi đã `fclose`.

## Tự kiểm tra
1. `fopen` trả về `NULL` khi nào?
2. Mode `"w"` làm gì với file cũ?
3. Vì sao phải `fclose`?
