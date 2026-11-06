# Phong cách ảnh chung

Áp dụng cho mọi ảnh trong thư mục này. Khi viết prompt, đưa đoạn "Phong cách cố định" vào cuối mỗi prompt để các ảnh đồng bộ với nhau.

## Tóm tắt phong cách

- **Thể loại:** minh họa phẳng dạng sách kỹ thuật hiện đại (flat editorial technical illustration). Không chân thực, không 3D bóng bẩy, không anime.
- **Cảm giác:** gọn, điềm tĩnh, dễ đọc, như ảnh bìa một cuốn sách lập trình tốt. Có chút ấm để không lạnh lùng.
- **Đường nét:** nét mảnh đều (khoảng 2–3 px ở ảnh 1600 px), góc bo nhẹ, không viền dày.
- **Đổ bóng:** rất nhẹ, chỉ một mức, không gradient mạnh.
- **Bố cục:** một ý chính ở giữa hoặc lệch trái, nhiều khoảng trắng, không quá 6 đối tượng chính.

## Bảng màu (bắt buộc)

| Vai trò | Mã màu | Dùng cho |
|---|---|---|
| Nền | `#f7f4ee` | nền ảnh, kem ấm |
| Xanh navy | `#1f3a5f` | khung chính, chữ kỹ thuật, đường viền |
| Xanh teal | `#2a7f80` | dữ liệu, mũi tên, điểm nhấn thứ hai |
| Vàng hổ phách | `#e0a100` | điểm nhấn quan trọng: mũi tên, con trỏ, nút đang hoạt động |
| Đỏ nâu | `#b5483a` | cảnh báo, rò rỉ, dùng sau free |
| Xám nhạt | `#c9d1de` | đường phụ, ô trống |

Không dùng màu ngoài bảng này. Không dùng gradient cầu vồng. Không dùng nền đen.

## Quy tắc chung

- Không chữ, không số, không ký hiệu trong ảnh. Nhãn do HTML thêm.
- Không người, không khuôn mặt, không bàn tay, không logo, không watermark.
- Không ảnh chụp thật, không phối cảnh 3D phức tạp.
- Tỉ lệ và độ phân giải ghi trong từng prompt. Nếu công cụ không hỗ trợ đúng kích thước, chọn tỉ lệ gần nhất và giữ nền sáng.

## Phong cách cố định (đưa nguyên văn vào cuối mỗi prompt)

> Flat editorial technical illustration, clean thin line art of uniform 2–3 px weight, rounded corners, soft single-level shadow, generous whitespace, warm off-white background #f7f4ee, palette limited to deep navy #1f3a5f, teal #2a7f80, amber #e0a100, muted brick red #b5483a and light grey-blue #c9d1de. No text, no letters, no numbers, no labels, no people, no hands, no logos, no watermark, no photorealism, no 3D rendering, no gradients, no neon, no dark background.
