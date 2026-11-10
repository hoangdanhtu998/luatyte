# JIT: sinh mã máy

## Ý chính
Trình JIT sinh mã máy lúc chương trình đang chạy. Bài này chỉ làm phần sinh byte: hàm `return n;` trên x86-64 có thể là `B8 imm32` (mov eax, imm32) rồi `C3` (ret).

## Ví dụ
Với n = 5, mã là `B8 05 00 00 00 C3`.

## Lưu ý
Chạy được mã này cần cấp bộ nhớ có quyền thực thi (mmap hoặc VirtualAlloc). Bài này chỉ tập trung vào việc sinh byte.

## Tự kiểm tra
1. `C3` là lệnh gì?
2. Vì sao số 5 được ghi theo thứ tự byte ngược (little-endian)?
