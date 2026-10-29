# RAII và con trỏ thông minh

## Slide 1 · Bìa
**RAII và con trỏ thông minh**


## Slide 2 · Ý chính
RAII: lấy tài nguyên trong constructor, giải phóng trong destructor. Vì destructor tự chạy khi ra khỏi phạm vi, tài nguyên không bị quên.

## Slide 3 · Đời thường
Mượn sách thư viện: khi rời phòng, thủ thư tự thu lại. Anh không cần nhớ trả, vì việc trả gắn với lúc rời đi.

## Slide 4 · Ví dụ
```cpp
#include <iostream>
#include <memory>

struct Tep {
    Tep() { std::cout << "mo\n"; }
    ~Tep() { std::cout << "dong\n"; }
};

int main() {
    {
        std::unique_ptr<Tep> p = std::make_unique<Tep>();
        std::cout << "xong\n";
    }   // p ra khỏi phạm vi: tự dong
}
```
Kết quả: `mo`, `xong`, `dong`.

## Slide 5 · Các loại
- `std::unique_ptr`: một chủ sở hữu, tự giải phóng.
- `std::shared_ptr`: nhiều chủ sở hữu, giải phóng khi không còn ai dùng.

## Slide 6 · Lỗi hay gặp
- Dùng `new` và `delete` thủ công rồi quên `delete`.
- Tạo `shared_ptr` mới từ cùng một con trỏ thô nhiều lần, gây giải phóng hai lần.

## Slide 7 · Tự kiểm tra
1. RAII nghĩa là gì?
2. `unique_ptr` khác con trỏ thường ở điểm nào?
3. Vì sao RAII an toàn khi có lỗi giữa chừng?
