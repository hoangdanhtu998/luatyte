# Bài 1 · Biến và kiểu dữ liệu

**Mục tiêu:** hiểu biến là một hộp có tên và có kiểu. Kiểu quyết định hộp chứa được gì và chiếm bao nhiêu chỗ.

---

## Slide 1 · Bìa
**Biến và kiểu dữ liệu**
Biến là hộp có tên. Kiểu là loại đồ được phép để trong hộp.

## Slide 2 · Mục tiêu
- Khai báo và gán giá trị cho biến
- Chọn đúng kiểu cho số nguyên, số thực, ký tự
- Hiểu vì sao kiểu quan trọng

## Slide 3 · Biến là một cái hộp có tên
Hình dung: một chiếc hộp dán nhãn `tuoi`. Trong hộp có thể đặt số tuổi. Muốn đổi, anh bỏ đồ cũ và để đồ mới vào.

```c
int tuoi = 20;   // hộp tên "tuoi" chứa số 20
tuoi = 21;       // thay số 20 bằng 21
```

## Slide 4 · Khai báo: nói cho máy biết hộp chứa gì
Khai báo gồm kiểu và tên: `kieu ten;`. Máy cần biết kiểu để biết hộp to hay nhỏ.

```c
int   so_nguyen;
float so_thuc;
char  chu_cai;
```

## Slide 5 · Các kiểu cơ bản
| Kiểu | Chứa gì | Ví dụ |
|---|---|---|
| `int` | số nguyên | `-3`, `0`, `42` |
| `float` | số thực (độ chính xác thấp) | `3.14f` |
| `double` | số thực (chính xác hơn) | `3.14159` |
| `char` | một ký tự | `'A'`, `'z'` |

Gợi ý: kích thước thật phụ thuộc máy, nên dùng `sizeof` để kiểm tra.

## Slide 6 · Khởi tạo: đừng để hộp rỗng
Biến chưa gán có giá trị rác. Luôn gán giá trị ngay khi khai báo.

```c
int dem;        // nguy hiểm: giá trị không xác định
int dem = 0;    // an toàn
```

## Slide 7 · Hằng số: hộp không đổi được
Dùng `const` khi giá trị không được thay đổi, ví dụ số ngày trong tuần.

```c
const int SO_NGAY_TUAN = 7;
// SO_NGAY_TUAN = 8;   // lỗi biên dịch
```

## Slide 8 · Ví dụ thực tế
Tính tiền một đơn hàng: số lượng là `int`, đơn giá là `double`, tổng là `double`. Chọn sai kiểu có thể làm tròn sai số tiền.

```c
#include <stdio.h>

int main(void) {
    int    so_luong = 3;
    double don_gia  = 15.5;
    double tong     = so_luong * don_gia;
    printf("Tong tien: %.2f\n", tong);
    return 0;
}
```

## Slide 9 · Tự kiểm tra
1. Biến nào nên là `const`: số ngày trong tuần hay số tuổi của bạn?
2. Vì sao `int dem;` không nên dùng ngay mà không gán giá trị?
3. Số 3.5 có thể lưu trong `int` không? Vì sao?

## Slide 10 · Tổng kết
- Biến là hộp có tên, kiểu quyết định loại đồ được chứa
- Luôn gán giá trị ban đầu
- Dùng `const` cho giá trị không đổi

---

**Ghi chú người thuyết trình (đáp án slide 9):**
1. Số ngày trong tuần là `const`, vì nó không đổi. Số tuổi thay đổi theo năm nên là biến thường.
2. Vì giá trị chưa xác định. Chương trình có thể đọc ra số ngẫu nhiên.
3. Không. `int` chỉ chứa số nguyên, phần thập phân bị cắt bỏ.
