# Viết bộ cấp phát bộ nhớ (allocator)

**Cấp 1 · Làm quen** · Nguồn: Memory Allocators 101

## Mục tiêu
Hiểu malloc/free làm gì bên dưới: quản lý vùng nhớ trống, tách và gộp khối.

## Dàn ý slide (9 trang gợi ý, kể cả bìa)
1. Bìa: Viết bộ cấp phát bộ nhớ (allocator)
2. Vì sao cần tự viết allocator
3. Vùng nhớ như một dãy khối có kích thước
4. Khối trống và khối đang dùng (header chứa kích thước)
5. Cấp phát kiểu first-fit
6. Trả lại bộ nhớ và gộp khối liền kề
7. Phân mảnh: vì sao bộ nhớ còn nhưng không dùng được
8. Kiểm thử: cấp, trả, cấp lại
9. Tổng kết và so sánh với malloc thật

## Bài tập luyện (trong khu Luyện tập)
Viết my_malloc/my_free dùng một mảng tĩnh 64KB; in trạng thái các khối sau mỗi thao tác.

## Ghi chú
- Làm slide theo chuẩn trong PHONG-CACH-SLIDE.md.
- Chỉ đưa vào app khi đã có bài đọc, bài tập có test và đã chạy thử bằng gcc.
- Trạng thái: chưa làm.
