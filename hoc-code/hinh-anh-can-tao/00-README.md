# Hình ảnh cần tạo · Học code

Thư mục này chứa đủ prompt cho mọi hình trong app. Mỗi hình một file. Mỗi file có: tên file cần lưu, kích thước, prompt tiếng Anh để dán vào công cụ tạo ảnh, và prompt phủ định (những thứ không được có).

## Cách làm
1. Mở công cụ tạo ảnh (Gemini, ChatGPT hoặc công cụ anh đang dùng).
2. Mở file `.md` của hình cần tạo, copy phần **Prompt**, dán vào. Nếu công cụ có ô "không muốn có", dán phần **Negative prompt**.
3. Lưu ảnh đúng tên ghi trong mục **Lưu thành**.
4. Mascot lưu vào `assets/mascot/`. Hình minh họa slide lưu vào `assets/img/`.
5. Nếu hình chưa có, app tự hiện khung nét đứt ghi tên file cần thiếu.

## Quy tắc chung cho mọi hình
- Không có chữ, số, nhãn trong ảnh. Chữ do app hoặc slide thêm vào.
- Không người, không logo, không watermark.
- Bảng màu: cam #F08A4B, kem #F5F2EA, navy #1C2027, xanh #2F5FB3, đỏ nâu #B8521F.
- Phong cách: minh họa phẳng, đường viền đậm đều, không chân thực, không 3D.

## Nhân vật mèo (mascot)
Xem `00-phong-cach-mascot.md` để biết phong cách chung, rồi làm theo các file `m0x-*.md`.

## Hình minh họa slide
Các hình `s0x-*.md` là bản đầy đủ. Các hình này có trong thư mục `image-prompts/` cũ, nhưng bản ở đây đã đồng bộ với bảng màu hiện tại.
