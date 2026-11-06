# Bản đồ kiến thức C/C++ · đối chiếu với app Học code

Trạng thái:
- **Đã có bài** : có bài đọc, slide và câu hỏi trong app.
- **Có ý tưởng** : có trong `y-tuong-bai-hoc/` (dàn ý, chưa viết nội dung).
- **Thiếu** : chưa có ở đâu cả, cần thêm.

## Cấp 1 · Nền tảng (học trước)

| Chủ đề | Logic cốt lõi | Trạng thái |
|---|---|---|
| Biến, kiểu dữ liệu | int, char, float, double; kích thước; khai báo và gán | Thiếu |
| Toán tử | số học, so sánh, logic (&&, \|\|, !), tăng/giảm, gán | Thiếu |
| Điều khiển luồng | if/else, switch, while, for, break, continue | Thiếu |
| Hàm | khai báo, tham số truyền giá trị, giá trị trả về, prototype | Thiếu |
| Mảng | khai báo, duyệt, chỉ số bắt đầu từ 0, tràn mảng | Thiếu |
| Chuỗi ký tự | char[], kết thúc bằng '\0', strcpy/strlen (lỗi tràn) | Thiếu |
| Con trỏ | địa chỉ, *p, &x, con trỏ và mảng, con trỏ NULL | **Đã có bài** (Con trỏ và bộ nhớ) |
| Bộ nhớ động | malloc, free, rò rỉ, dùng sau free | **Đã có bài** (Con trỏ và bộ nhớ) |
| Cấu trúc (struct) | khai báo, truy cập bằng ., ->, struct chứa con trỏ | Có ý tưởng (danh sách liên kết trong bài con trỏ) |
| Biên dịch và gỡ lỗi | gcc, cờ -Wall, đọc lỗi biên dịch, gdb cơ bản | Thiếu |

## Cấp 2 · Lập trình thực tế

| Chủ đề | Logic cốt lõi | Trạng thái |
|---|---|---|
| Bảng băm (hash table) | hàm băm, va chạm, chaining, rehash | **Đã có bài** |
| Shell lệnh | đọc lệnh, tách tham số, fork/exec, pipe | **Đã có bài** (Shell) |
| Con trỏ hàm | khai báo, truyền hàm làm tham số (callback) | Thiếu |
| Đọc/ghi file | fopen, fclose, fgets, fprintf, kiểm tra lỗi | Thiếu |
| Đệ quy | điều kiện dừng, ví dụ giai thừa, duyệt cây | Thiếu |
| Sắp xếp và tìm kiếm | chọn, chèn, nhanh (quicksort), tìm nhị phân | Thiếu |
| Cấu trúc dữ liệu | ngăn xếp, hàng đợi, cây nhị phân | Có ý tưởng (kv-store, simple-db) |
| Lập trình hướng đối tượng (C++) | class, constructor, destructor, đóng gói | Thiếu |
| Quản lý tài nguyên RAII (C++) | con trỏ thông minh, tự giải phóng khi ra khỏi phạm vi | Thiếu |
| Template và STL (C++) | vector, map, string, iterator | Thiếu |
| Đa luồng | thread, mutex, race condition | Có ý tưởng (concurrent-servers) |

## Cấp 3 · Nâng cao và hệ thống

| Chủ đề | Logic cốt lõi | Trạng thái |
|---|---|---|
| Trình biên dịch và interpreter | lexer, parser, cây cú pháp, sinh mã | Có ý tưởng (interpreter, compiler x2, lisp) |
| Mạng | socket, TCP/IP, server nhiều kết nối | Có ý tưởng (tcp-ip, concurrent-servers, mqtt) |
| Hệ điều hành | ngắt, bộ nhớ ảo, tiến trình, system call | Có ý tưởng (os, kernel, bootloader) |
| Ảo hóa | máy ảo, KVM | Có ý tưởng (lc3-vm, kvm) |
| Đồ họa và game | vòng lặp game, sprite, raycasting, OpenGL | Có ý tưởng (sdl, breakout, minecraft, raycaster) |
| Debugger | ptrace, breakpoint, DWARF | Có ý tưởng (debugger) |

## Gợi ý thứ tự viết tiếp

1. **Cấp 1, phần thiếu:** biến và kiểu, toán tử, điều khiển luồng, hàm, mảng, chuỗi. Đây là nền để hiểu mọi bài sau, và hiện chưa có.
2. **Cấp 2, phần thiếu:** con trỏ hàm, đệ quy, đọc/ghi file, sắp xếp, ngăn xếp và hàng đợi.
3. **Riêng C++:** class và RAII, sau đó STL. Phần này thiếu hoàn toàn trong app.
4. **Cấp 3:** giữ nguyên các dàn ý có sẵn trong `y-tuong-bai-hoc/`.

## Việc còn lại cho mỗi bài mới

Mỗi bài cần đủ: bài đọc (`content/lessons/`), slide (`slides/`), câu hỏi lựa chọn có giải thích cho từng phương án (`content/quizzes/`), và nếu có thể, ví dụ code đã biên dịch bằng gcc (`content/examples/`).
