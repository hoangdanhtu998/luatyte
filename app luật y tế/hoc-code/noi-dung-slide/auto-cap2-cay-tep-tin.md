# Cây thư mục trong bộ nhớ (FUSE)

## Slide 1 · Bìa
**Cây thư mục trong bộ nhớ (FUSE)**


## Slide 2 · Ý chính
Hệ thống tệp ánh xạ đường dẫn như `/a/b.txt` tới dữ liệu. FUSE cho phép viết hệ thống tệp ở chế độ người dùng; phần lõi là tra cứu đường dẫn.

## Slide 3 · Ví dụ
Lưu danh sách đường dẫn đầy đủ, rồi kiểm tra một đường dẫn có tồn tại không.

## Slide 4 · Lỗi hay gặp
- So sánh chuỗi sai (quên `strcmp`).

## Slide 5 · Tự kiểm tra
1. FUSE chạy ở đâu?
2. Tra cứu đường dẫn làm gì?
