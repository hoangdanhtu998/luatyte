# Ngăn xếp (stack)

## Ý chính
Ngăn xếp là cấu trúc **vào sau, ra trước** (LIFO). Thêm vào gọi là `push`, lấy ra gọi là `pop`.

## Đời thường
Chồng đĩa: đặt đĩa mới lên trên, và lấy đĩa trên cùng ra trước.

## Cài đặt bằng mảng
```c
#define MAX 100
int st[MAX];
int top = 0;                       // số phần tử hiện có

void push(int x) { st[top++] = x; }
int pop(void)    { return st[--top]; }
int empty(void)  { return top == 0; }
```

## Ứng dụng
- Lời gọi hàm: máy lưu địa chỉ quay về trên stack.
- Kiểm tra ngoặc đúng: gặp ngoặc mở thì push, gặp ngoặc đóng thì pop và so khớp.

## Lỗi hay gặp
- `pop` khi ngăn xếp rỗng: đọc ra ngoài mảng. Luôn kiểm tra `empty()` trước.
- `push` khi đầy: ghi ra ngoài mảng. Cần kiểm tra `top < MAX`.

## Tự kiểm tra
1. Ngăn xếp là LIFO nghĩa là gì?
2. Vì sao phải kiểm tra rỗng trước khi `pop`?
