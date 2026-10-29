# Class trong C++

## Ý chính
`class` gom dữ liệu và hành vi lại thành một đối tượng. Dữ liệu được giấu (`private`) và chỉ thay đổi qua hàm công khai.

## Ví dụ
```cpp
#include <iostream>
#include <string>

class SinhVien {
public:
    SinhVien(std::string ten) : ten_(ten) {          // constructor
        std::cout << "Tao: " << ten_ << "\n";
    }
    ~SinhVien() {                                     // destructor
        std::cout << "Huy: " << ten_ << "\n";
    }
    void hienThi() const { std::cout << ten_ << "\n"; }
private:
    std::string ten_;
};

int main() {
    SinhVien sv("An");
    sv.hienThi();
}
```

## Điểm cần nhớ
- Constructor chạy khi tạo đối tượng, có tên trùng tên class, không có kiểu trả về.
- Destructor có tên `~TenClass`, chạy khi đối tượng ra khỏi phạm vi.
- `struct` và `class` khác nhau ở quyền mặc định: `struct` là `public`, `class` là `private`.

## Lỗi hay gặp
- Để dữ liệu `public` nên bên ngoài sửa tùy ý.
- Dùng `.` với con trỏ tới đối tượng; khi có con trỏ phải dùng `->`.

## Tự kiểm tra
1. Constructor có kiểu trả về không?
2. Destructor được đặt tên thế nào?
3. Đóng gói nghĩa là gì?
