# Kiểm tra trước khi phát hành: app so-y-te

Cập nhật 27/10/2026. Ghi rõ việc đã chạy thật và việc chưa chạy.

## Đã kiểm chứng (27/10/2026)
- [x] Các trang `index`, `tin_luat`, `tham_chieu`, `clinic`, `ly_thuyet`, `404` trả HTTP 200 khi phục vụ tĩnh.
- [x] `data/laws.json` đọc được (30 mục), `data/tham-chieu.json` đọc được.
- [x] Script inline của `index.html`, `tin_luat.html`, `tham_chieu.html`, `js/search.js`, `js/hospital.js` và `js/avatar.js` parse không lỗi.
- [x] Mọi file trong danh sách CORE của `sw.js` đều tồn tại.
- [x] `sitemap.xml` có đủ 5 URL, gồm `tham_chieu.html`.

## Lỗi đã biết, chưa sửa
- [x] `clinic.html` tải `./js/clinic3d.js`; file fallback 2D đã có để không 404. Chế độ 3D thật (WebGL/asset) vẫn chưa làm — fallback hiện thông báo và giữ bản đồ 4 phòng.
- [ ] Trích dẫn luật trong `data/quiz*.json`, `cbl.json`, `ly_thuyet.json` là chữ tự do, không dùng mã. Chưa kiểm tra tự động được. Cần đọc tay từng câu.
- [ ] `cbl.json` trích TT 26/2025, TT 25/2026, NĐ 102/2025 — các văn bản này chưa đối chiếu.

## Chưa làm
- [ ] Chạy trình duyệt thật (giao diện, điện thoại 320/375px, console lỗi).
- [ ] Đo Lighthouse và tối ưu `index.html` (khoảng 87 KB).
- [ ] Kiểm tra chế độ ngoại tuyến bằng trình duyệt.
- [ ] Kiểm tra contrast và điều hướng bằng bàn phím.

## Chặn, không làm trong bản này
- [ ] Tài khoản, gói cước, thanh toán: chờ quyết định và khôi phục mã nguồn nền tảng cũ.
- [ ] Điều khoản sử dụng, chính sách bảo mật, hồ sơ dữ liệu cá nhân: cần luật sư duyệt.
- [ ] Nội dung luật đầy đủ (điều khoản): cần văn bản gốc.
