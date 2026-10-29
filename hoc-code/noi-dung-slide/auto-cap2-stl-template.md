# STL và template

## Slide 1 · Bìa
**STL và template**


## Slide 2 · Ý chính
Thư viện chuẩn C++ (STL) cung cấp sẵn các cấu trúc dữ liệu và thuật toán. Template cho phép viết một lần, dùng cho nhiều kiểu.

## Slide 3 · vector
```cpp
#include <vector>
#include <algorithm>
std::vector<int> v = {3, 1, 4};
v.push_back(2);                 // thêm vào cuối
std::sort(v.begin(), v.end());  // 1 2 3 4
```
`size()` là số phần tử đang có. `vector` tự tăng kích thước khi cần.

## Slide 4 · map
```cpp
#include <map>
std::map<std::string, int> diem;
diem["An"] = 9;
```
Dữ liệu theo cặp khóa và giá trị, khóa được giữ theo thứ tự.

## Slide 5 · Template
```cpp
template <typename T>
T lon_hon(T a, T b) { return a > b ? a : b; }
```
Dùng được với `int`, `double`, và các kiểu khác có toán tử `>`.

## Slide 6 · Lỗi hay gặp
- Truy cập `v[i]` ngoài phạm vi: không có cảnh báo khi chạy, dùng `v.at(i)` để được báo lỗi.
- Dùng `==` để so sánh hai `char[]` thay vì `std::string`.

## Slide 7 · Tự kiểm tra
1. `vector` khác mảng thường ở điểm nào?
2. `map` lưu dữ liệu thế nào?
3. Template dùng để làm gì?
