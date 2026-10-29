# LLVM: sinh mã trung gian

## Ý chính
LLVM là bộ công cụ biên dịch dùng một dạng trung gian (IR) độc lập với máy. Trình biên dịch của bạn chỉ cần sinh IR, LLVM lo phần tối ưu và sinh mã máy.

## Ví dụ
Phép cộng hai số nguyên 32 bit trong IR: `%r = add i32 %a, %b`.

## Tự kiểm tra
1. IR khác mã máy ở điểm nào?
2. Vì sao dùng IR chung?
