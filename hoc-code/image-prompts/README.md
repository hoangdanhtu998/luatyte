# Ảnh cho bài giảng: hướng dẫn cho Codex

Thư mục này chứa prompt để tạo ảnh minh họa cho slide. Mỗi ảnh một file riêng.

## Quy trình

1. Đọc `00-phong-cach.md` trước. Đây là phong cách chung, áp dụng cho mọi ảnh.
2. Với mỗi file `0N-ten.md`, lấy phần **Prompt** và phần **Negative prompt** đưa cho Codex để tạo ảnh.
3. Lưu ảnh đúng tên ở đường dẫn ghi trong mục **Lưu thành**. Tên file phải khớp đúng từng chữ, vì slide tìm ảnh theo tên.
4. Mở `slides/con-tro-va-bo-nho.html` bằng trình duyệt. Nếu ảnh chưa có, slide hiện ô nét đứt ghi tên ảnh cần thiếu. Khi ảnh đã đúng chỗ, ô đó tự thay bằng ảnh.

## Danh sách ảnh

| File prompt | Lưu thành | Dùng ở slide | Tỉ lệ |
|---|---|---|---|
| `01-hero-c-cpp.md` | `assets/img/hero-c-cpp.png` | 1 (trang bìa) | 4:5 |
| `02-con-tro-hop-thu.md` | `assets/img/con-tro-hop-thu.png` | 4 | 16:9 |
| `03-stack-heap.md` | `assets/img/stack-heap.png` | 6 | 16:9 |
| `04-hash-chaining.md` | `assets/img/hash-chaining.png` | 11 | 16:9 |

## Lưu ý với ảnh do AI tạo

- Ảnh không có chữ. Model tạo ảnh thường viết sai chữ, đặc biệt là tiếng Việt. Mọi nhãn ("stack", "heap", "địa chỉ") được thêm bằng HTML.
- Nếu ảnh có chữ sai hoặc chữ lạ, tạo lại với prompt đã có dòng "no text".
- Không dùng ảnh có người, logo hay thương hiệu.
