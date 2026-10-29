# Viết interpreter

## Slide 1 · Bìa
**Viết interpreter**


## Slide 2 · Ý chính
Interpreter đọc code và thực thi ngay. Ba phần chính: lexer (văn bản thành token), parser (token thành cấu trúc), và đánh giá (tính kết quả).

## Slide 3 · Ví dụ
Biểu thức `1 + 2 * 3`:
1. Lexer: `1`, `+`, `2`, `*`, `3`.
2. Parser: `*` có ưu tiên cao hơn, nên thành `1 + (2 * 3)`.
3. Đánh giá: 2*3 = 6, rồi 1+6 = 7.

## Slide 4 · Lỗi hay gặp
- Quên ưu tiên toán tử, tính sai thứ tự.
- Không báo lỗi khi biểu thức sai cú pháp.

## Slide 5 · Tự kiểm tra
1. Lexer làm gì đầu tiên?
2. Vì sao cần ưu tiên toán tử?
