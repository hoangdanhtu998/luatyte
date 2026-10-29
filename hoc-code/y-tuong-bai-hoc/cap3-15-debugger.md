# Viết debugger Linux (10 phần)

**Cấp 3 · Nâng cao** · Nguồn: Writing a Linux Debugger

## Mục tiêu
Hiểu cách debugger đặt breakpoint và đọc biến.

## Dàn ý slide (10 trang gợi ý, kể cả bìa)
1. Bìa: Viết debugger Linux (10 phần)
2. Debugger hoạt động thế nào
3. ptrace: điều khiển tiến trình con
4. Breakpoint bằng lệnh int3
5. Đọc và ghi thanh ghi
6. Đọc ELF và DWARF
7. Bước từng dòng (step)
8. Duyệt stack (unwinding)
9. Đọc biến cục bộ
10. Tổng kết

## Bài tập luyện (trong khu Luyện tập)
Đặt breakpoint tại một hàm và in giá trị thanh ghi khi dừng.

## Ghi chú
- Làm slide theo chuẩn trong PHONG-CACH-SLIDE.md.
- Chỉ đưa vào app khi đã có bài đọc, bài tập có test và đã chạy thử bằng gcc.
- Trạng thái: chưa làm.
