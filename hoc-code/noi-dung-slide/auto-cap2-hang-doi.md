# Hàng đợi (queue)

## Slide 1 · Bìa
**Hàng đợi (queue)**


## Slide 2 · Ý chính
Hàng đợi là cấu trúc **vào trước, ra trước** (FIFO). Thêm vào cuối gọi là `enqueue`, lấy ra từ đầu gọi là `dequeue`.

## Slide 3 · Đời thường
Xếp hàng mua vé: ai đến trước được phục vụ trước.

## Slide 4 · Cài đặt bằng mảng vòng
```c
#define MAX 100
int q[MAX];
int head = 0, tail = 0;            // head: vị trí lấy ra, tail: vị trí thêm vào

void enqueue(int x) { q[tail++] = x; }     // giả định chưa đầy
int dequeue(void)   { return q[head++]; }  // giả định chưa rỗng
int empty(void)     { return head == tail; }
```

## Slide 5 · Ứng dụng
- Hàng đợi công việc trong máy tính.
- Duyệt cây theo chiều rộng (BFS).

## Slide 6 · Lỗi hay gặp
- Lấy ra khi rỗng: đọc phần tử không tồn tại.
- Nhầm với ngăn xếp: nhớ hàng đợi là FIFO, ngăn xếp là LIFO.

## Slide 7 · Tự kiểm tra
1. FIFO nghĩa là gì?
2. Ngăn xếp và hàng đợi khác nhau ở điểm nào khi lấy phần tử ra?
