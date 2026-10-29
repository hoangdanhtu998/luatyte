# Trình biên dịch: biểu thức sang RPN

## Ý chính
Trình biên dịch phải hiểu thứ tự tính. Một cách đơn giản là đổi biểu thức thường (`1 + 2 * 3`) sang dạng hậu tố (RPN: `1 2 3 * +`), rồi máy chỉ cần đọc từ trái sang phải.

## Đời thường
Đặt món ăn theo thứ tự nấu: phải làm phần trong ngoặc trước, rồi đến nhân, rồi đến cộng.

## Thuật toán (shunting-yard)
- Số thì in ra ngay.
- Toán tử thì đẩy vào ngăn xếp, nhưng trước đó lấy ra các toán tử có ưu tiên cao hơn hoặc bằng.
- Dấu `(` thì đẩy vào; `)` thì lấy ra đến khi gặp `(`.

## Ví dụ
`1 + 2 * 3` → `1 2 3 * +`.

## Lỗi hay gặp
- Quên ưu tiên của `*` so với `+`.
- Bỏ qua ngoặc.

## Tự kiểm tra
1. Vì sao RPN dễ tính hơn biểu thức thường?
2. `2 * (3 + 4)` đổi sang RPN là gì?
