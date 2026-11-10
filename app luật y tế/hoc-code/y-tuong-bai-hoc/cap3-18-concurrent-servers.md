# Viết server đồng thời (6 phần)

**Cấp 3 · Nâng cao** · Nguồn: Concurrent servers (Eli Bendersky)

## Mục tiêu
So sánh các cách phục vụ nhiều kết nối cùng lúc.

## Dàn ý slide (8 trang gợi ý, kể cả bìa)
1. Bìa: Viết server đồng thời (6 phần)
2. Server phục vụ nhiều client: vấn đề
3. Mỗi kết nối một thread
4. Event-driven với select/epoll
5. Thư viện libuv
6. Nghiên cứu: Redis dùng event loop
7. Callback, promise và async
8. Tổng kết

## Bài tập luyện (trong khu Luyện tập)
Viết echo server theo hai cách (thread và epoll), so sánh số kết nối.

## Ghi chú
- Làm slide theo chuẩn trong PHONG-CACH-SLIDE.md.
- Chỉ đưa vào app khi đã có bài đọc, bài tập có test và đã chạy thử bằng gcc.
- Trạng thái: chưa làm.
