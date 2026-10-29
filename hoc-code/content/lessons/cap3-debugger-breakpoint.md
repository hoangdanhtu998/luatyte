# Breakpoint: thay byte bằng 0xCC

## Ý chính
Để dừng tại một lệnh, debugger ghi byte `0xCC` (int3) vào vị trí đó, và lưu byte gốc. Khi CPU gặp `0xCC` nó dừng và báo cho debugger. Muốn chạy tiếp, debugger khôi phục byte gốc.

## Ví dụ
Byte gốc `0x55` được thay bằng `0xCC`; khi dừng xong, trả lại `0x55`.

## Lỗi hay gặp
- Quên lưu byte gốc, chương trình hỏng khi chạy tiếp.

## Tự kiểm tra
1. `0xCC` là lệnh gì?
2. Vì sao phải lưu byte gốc?
