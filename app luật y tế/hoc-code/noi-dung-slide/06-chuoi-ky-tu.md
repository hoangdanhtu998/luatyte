# Bài 6 · Chuỗi ký tự

**Mục tiêu:** hiểu chuỗi là một dãy ký tự kết thúc bằng ký tự `'\0'`, và dùng các hàm chuỗi an toàn.

---

## Slide 1 · Bìa
**Chuỗi ký tự**
Một dãy chữ cái nằm liền nhau, và một cái dấu kết thúc vô hình.

## Slide 2 · Mục tiêu
- Biết chuỗi trong C là mảng `char` kết thúc bằng `'\0'`
- Đo độ dài chuỗi và so sánh chuỗi
- Tránh tràn bộ nhớ khi sao chép chuỗi

## Slide 3 · Chuỗi là một dãy ô chữ
Từ "Hi" gồm ba ô: `H`, `i`, và ký tự kết thúc `'\0'`.

| Ô | 0 | 1 | 2 |
|---|---|---|---|
| Ký tự | `H` | `i` | `\0` |

```c
char ten[] = "Hi";   // máy tự thêm '\0' ở cuối
```

## Slide 4 · Vì sao cần '\0'
Máy đọc chuỗi đến khi gặp `'\0'`. Thiếu nó, máy đọc tiếp qua vùng nhớ khác và in ra rác.

## Slide 5 · In và đo chuỗi
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

## Slide 6 · So sánh chuỗi: không dùng ==
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

## Slide 7 · Sao chép chuỗi an toàn
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

## Slide 8 · Ví dụ thực tế: đếm chữ cái
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

## Slide 9 · Tự kiểm tra
1. Chuỗi `"abc"` chiếm bao nhiêu ô nhớ?
2. `strlen("abc")` cho kết quả bao nhiêu?
3. Vì sao không nên dùng `==` để so sánh hai chuỗi?

## Slide 10 · Tổng kết
- Chuỗi là mảng `char` kết thúc bằng `'\0'`
- So sánh bằng `strcmp`, không bằng `==`
- Luôn kiểm tra kích thước khi sao chép

---

**Ghi chú người thuyết trình (đáp án slide 9):**
1. 4 ô: `a`, `b`, `c` và `'\0'`.
2. Kết quả là `3`. `strlen` không tính ký tự kết thúc.
3. Vì `==` so sánh địa chỉ của hai mảng, hai mảng khác nhau nên luôn không bằng nhau, dù nội dung giống hệt.
