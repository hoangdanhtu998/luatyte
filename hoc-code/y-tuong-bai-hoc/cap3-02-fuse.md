# Viết filesystem FUSE

**Cấp 3 · Nâng cao** · Nguồn: FUSE tutorial

## Mục tiêu
Hiểu hệ thống tập tin và giao tiếp kernel qua FUSE.

## Dàn ý slide (8 trang gợi ý, kể cả bìa)
1. Bìa: Viết filesystem FUSE
2. Filesystem là gì: inode, thư mục, dữ liệu
3. FUSE: chạy filesystem ở userspace
4. Các hàm callback: getattr, readdir, read
5. Ánh xạ đường dẫn tới dữ liệu
6. Ghi file và quyền
7. Kiểm thử với một thư mục
8. Tổng kết

## Bài tập luyện (trong khu Luyện tập)
Một filesystem chỉ đọc có một file hello.txt.

## Ghi chú
- Làm slide theo chuẩn trong PHONG-CACH-SLIDE.md.
- Chỉ đưa vào app khi đã có bài đọc, bài tập có test và đã chạy thử bằng gcc.
- Trạng thái: chưa làm.
