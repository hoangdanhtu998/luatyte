# Chuỗi ký tự

## Tóm tắt trong 1 phút
- Chuỗi trong C là mảng `char`, kết thúc bằng ký tự `'\0'`.
- Đo độ dài bằng `strlen`, không tính `'\0'`.
- So sánh nội dung bằng `strcmp`, không dùng `==`.
- Sao chép phải kiểm tra kích thước, dùng `snprintf`.

## Mục tiêu
- Biết chuỗi trong C là mảng `char` kết thúc bằng `'\0'`
- Đo độ dài chuỗi và so sánh chuỗi
- Tránh tràn bộ nhớ khi sao chép chuỗi

## Chuỗi là một dãy ô chữ
Từ "Hi" gồm ba ô: `H`, `i`, và ký tự kết thúc `'\0'`.

| Ô | 0 | 1 | 2 |
|---|---|---|---|
| Ký tự | `H` | `i` | `\0` |

```c
char ten[] = "Hi";   // máy tự thêm '\0' ở cuối
```

## Vì sao cần '\0'
Máy đọc chuỗi đến khi gặp `'\0'`. Thiếu nó, máy đọc tiếp qua vùng nhớ khác và in ra rác.

## In và đo chuỗi
```c
#include <stdio.h>
#include <string.h>

int main(void) {
    char ten[] = "Minh";
    printf("%s\n", ten);            // Minh
    printf("%zu\n", strlen(ten));   // 4, không tính '\0'
    return 0;
}
```

## So sánh chuỗi: không dùng ==
`==` so sánh địa chỉ, không so sánh nội dung. Dùng `strcmp`, trả về `0` khi hai chuỗi giống nhau.

```c
#include <stdio.h>
#include <string.h>

int main(void) {
    char a[] = "cho";
    char b[] = "cho";
    if (strcmp(a, b) == 0) printf("Giong nhau\n");
    return 0;
}
```

## Sao chép chuỗi an toàn
`strcpy` không kiểm tra độ dài, nên dễ tràn. Dùng `snprintf` hoặc `strncpy` và luôn kiểm tra kích thước đích.

```c
#include <stdio.h>

int main(void) {
    char dich[16];
    snprintf(dich, sizeof dich, "%s", "Xin chao ca lop");
    printf("%s\n", dich);   // vừa khít 16 ô, không tràn
    return 0;
}
```

## Ví dụ thực tế: đếm chữ cái
```c
#include <stdio.h>

int main(void) {
    char s[] = "lap trinh C";
    int chu = 0;
    for (int i = 0; s[i] != '\0'; i++) {
        if (s[i] != ' ') chu++;
    }
    printf("So ky tu (khong tinh khoang trang): %d\n", chu);   // 9
    return 0;
}
```

## Tự kiểm tra
1. Chuỗi `"abc"` chiếm bao nhiêu ô nhớ?
2. `strlen("abc")` cho kết quả bao nhiêu?
3. Vì sao không nên dùng `==` để so sánh hai chuỗi?

## Tổng kết
- Chuỗi là mảng `char` kết thúc bằng `'\0'`
- So sánh bằng `strcmp`, không bằng `==`
- Luôn kiểm tra kích thước khi sao chép

