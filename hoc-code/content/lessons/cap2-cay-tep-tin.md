# Cây thư mục trong bộ nhớ (FUSE)

## Tóm tắt trong 1 phút
- Hệ thống tệp là một bảng: mỗi **đường dẫn** (như `/a/b.txt`) trỏ tới một dữ liệu.
- Muốn biết một tệp có tồn tại không, ta tra bảng đó bằng `strcmp`.
- FUSE cho phép viết hệ thống tệp chạy ở chế độ người dùng. Phần lõi vẫn là tra cứu đường dẫn.

## Ý chính
Khi bạn mở `/a/b.txt`, hệ thống tệp phải tìm đường dẫn đó trong bảng của nó. Nếu có, nó trả về dữ liệu. Nếu không, nó báo không tìm thấy.

## Ví dụ
Giả sử bảng có ba đường dẫn: `/a`, `/a/b.txt`, `/a/c`. Ta hỏi hai đường dẫn: `/a/b.txt` có không? `/x` có không?

```c
#include <stdio.h>
#include <string.h>

int main(void) {
    const char *duong_dan[] = { "/a", "/a/b.txt", "/a/c" };
    int n = sizeof duong_dan / sizeof duong_dan[0];
    const char *tim[] = { "/a/b.txt", "/x" };
    for (int j = 0; j < 2; j++) {
        int co = 0;
        for (int i = 0; i < n; i++) {
            if (strcmp(duong_dan[i], tim[j]) == 0) co = 1;
        }
        printf("%s: %s\n", tim[j], co ? "co" : "khong");
    }
    return 0;
}
```

Kết quả: `/a/b.txt` có, `/x` không.

## Lỗi hay gặp
- So sánh chuỗi bằng `==`. Phải dùng `strcmp`, vì `==` so sánh địa chỉ.

## Tự kiểm tra
1. FUSE chạy ở đâu?
2. Tra cứu đường dẫn làm gì?
3. Vì sao phải dùng `strcmp` thay vì `==`?

## Tổng kết
- Đường dẫn là khóa để tìm dữ liệu.
- Tra cứu là việc cốt lõi của hệ thống tệp.
- So sánh chuỗi bằng `strcmp`.
