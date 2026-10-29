# Cấu trúc (struct)

## Slide 1 · Bìa
**Cấu trúc (struct)**


## Slide 2 · Ý chính
Một `struct` gom nhiều biến khác kiểu thành một đơn vị. Ví dụ một sinh viên có tên (chuỗi) và tuổi (số nguyên).

## Slide 3 · Đời thường
Một tấm thẻ học sinh có họ tên, ngày sinh, lớp. Các ô trên thẻ khác nhau về loại, nhưng nằm chung trong một tấm thẻ.

## Slide 4 · Khai báo và dùng
```c
#include <stdio.h>

struct Nguoi {
    char ten[32];
    int tuoi;
};

int main(void) {
    struct Nguoi a = {"An", 20};
    a.tuoi = 21;                       // truy cập bằng dấu chấm
    printf("%s (%d)\n", a.ten, a.tuoi);
    return 0;
}
```

## Slide 5 · Con trỏ tới struct
```c
struct Nguoi *p = &a;
p->tuoi = 22;   // p->tuoi tương đương (*p).tuoi
```

## Slide 6 · Lỗi hay gặp
- Quên dấu `;` sau dấu `}` của định nghĩa struct.
- Dùng `.` với con trỏ tới struct: phải dùng `->`.
- Gán chuỗi bằng `=`: phải dùng hàm sao chép, ví dụ `snprintf`.

## Slide 7 · Tự kiểm tra
1. Dấu `.` và `->` khác nhau thế nào?
2. Vì sao không gán được chuỗi bằng `=`?
