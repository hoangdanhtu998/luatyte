# Đệ quy

## Ý chính
Đệ quy là hàm gọi lại chính nó để giải một bài toán nhỏ hơn. Mọi hàm đệ quy cần một **điều kiện dừng**.

## Đời thường
Muốn biết mình đứng hàng thứ mấy, anh hỏi người trước. Người đó hỏi người trước nữa, cho đến người đầu tiên biết chắc là số 1. Rồi con số được truyền ngược lại.

## Ví dụ: giai thừa
```c
int giai_thua(int n) {
    if (n <= 1) return 1;          // điều kiện dừng
    return n * giai_thua(n - 1);   // bài toán nhỏ hơn
}
```
`giai_thua(5)` = 5 × 4 × 3 × 2 × 1 = 120.

## Lỗi hay gặp
- Thiếu điều kiện dừng: mỗi lần gọi thêm một khung trên stack, cuối cùng tràn stack.
- Đối số không tiến về điều kiện dừng: ví dụ gọi `n + 1` thay vì `n - 1`.

## Đệ quy hay lặp?
Đệ quy gọn khi bài toán có cấu trúc lặp lại, như cây. Nhưng mỗi lần gọi tốn thêm bộ nhớ stack. Với vòng đếm đơn giản, vòng lặp thường tốt hơn.

## Tự kiểm tra
1. Hàm đệ quy bắt buộc phải có gì?
2. Thiếu điều kiện dừng thì sao?
3. So với vòng lặp, đệ quy có nhược điểm gì?
