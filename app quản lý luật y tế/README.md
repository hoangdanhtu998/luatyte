# App quản lý luật y tế

Ứng dụng quản lý (admin) cho app luật y tế. Đã làm **Phase 1 đến Phase 7**: đăng nhập và bảo mật, quản lý user, gói cước và thanh toán (thử nghiệm), email, vận hành, nội dung luật, báo cáo tài chính; kèm khôi phục sao lưu, xuất CSV và đồng bộ tiến độ học.

Công nghệ: Node.js 22.13 trở lên (đã kiểm tra trên Node 24), SQLite (`node:sqlite`), không cần thư viện ngoài.

## Chạy thử

```
npm test                                      # 58 test, chia theo phase
ADMIN_PASSWORD='mat-khau-it-nhat-10-ky-tu' npm run create-admin -- email@vidu.com
npm start                                     # http://localhost:3200
npm run restore -- data/backups/quan-ly-2026-06-01.db --yes   # dừng server trước khi khôi phục
```

### Biến môi trường

| Biến | Mặc định | Ý nghĩa |
|---|---|---|
| `PORT` | 3200 | Cổng HTTP |
| `DB_PATH` | `./data/quan-ly.db` | File SQLite |
| `ALLOW_REGISTRATION` | `true` | Đặt `false` để tắt đăng ký |
| `SETTINGS_KEY` | (không có) | 64 ký tự hex. Bắt buộc để lưu mật khẩu SMTP. Không đưa lên git |
| `PAYMENT_SECRET` | (không có) | Ít nhất 16 ký tự. Bật cổng thanh toán thử nghiệm. Không đưa lên git |
| `ALLOWED_ORIGINS` | (rỗng) | Các origin trình duyệt được gọi API, cách nhau bằng dấu phẩy |
| `BACKUP_DIR` | `./data/backups` | Nơi lưu bản sao lưu |
| `FX_VND_PER_USD` | 26000 | Tỷ giá quy đổi chi phí AI sang VND |

Tạo `SETTINGS_KEY` ngẫu nhiên: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

## Đã làm

### Phase 1: nền tảng và tài khoản
- **Giới hạn đăng nhập:** 5 lần sai mỗi IP, 3 lần sai mỗi email, trong 15 phút. Chỉ đếm lần sai. Lưu trong bộ nhớ, chỉ đúng khi chạy một tiến trình.
- **TOTP cho admin:** RFC 6238, 6 số, bước 30 giây. Mã đã dùng không dùng lại được.
- **Quản lý user:** tìm, lọc, khóa/mở khóa, đổi vai trò, đặt lại mật khẩu. Admin không tự khóa hay tự hạ quyền.
- **Lịch sử đồng ý:** đăng ký ghi phiên bản điều khoản, IP và thời điểm.

### Phase 2: gói cước và thanh toán
- Gói cước: tạo, sửa, xóa mềm. `durationDays = -1` là gói trọn đời. Người dùng chỉ thấy gói đang công khai (`GET /api/plans`).
- Mã giảm giá: theo phần trăm hoặc số tiền cố định; giới hạn số lần dùng, hạn dùng, và gắn với gói. Áp mã qua `POST /api/payments/apply-discount`.
- Thanh toán: `POST /api/payments/create` tạo đơn; `POST /api/payments/callback/sandbox` nhận kết quả. Callback phải có chữ ký HMAC-SHA256, số tiền khớp đơn, và xử lý lặp lại an toàn.
- Gia hạn: cộng thêm từ ngày hết hạn hiện tại. Gói trọn đời không có ngày hết hạn.
- Nhắc gia hạn trước 7 ngày, mỗi gói chỉ nhắc một lần.
- **Chưa có:** cổng thanh toán thật (VNPay, ZaloPay). Cần thông tin merchant.

### Phase 3: email
- Cấu hình SMTP: mật khẩu được mã hóa AES-256-GCM khi lưu, API không bao giờ trả về mật khẩu.
- Hàng đợi email: thử lại sau 1 giờ, 6 giờ, 24 giờ; tối đa 4 lần. Admin xem danh sách và bấm thử lại.
- Mẫu thư: xác minh email, quên mật khẩu, hóa đơn, nhắc gia hạn. Thiếu biến sẽ báo lỗi `MISSING_VARIABLE`.
- **Chưa có:** gửi thư thật. Hiện chỉ ghi vào `data/outbox.log`. Kết quả gửi thử ghi rõ "chưa gửi tới hộp thư". Cần cấu hình SMTP thật.

### Phase 4: bảo mật và nhật ký
- Nhật ký đăng nhập (thành công và thất bại, kèm IP và lý do), lọc theo user, IP, thời gian.
- Nhật ký thao tác admin: ghi giá trị cũ và mới, không ghi mật khẩu.
- CSRF: mỗi phiên có token riêng, gửi qua header `X-CSRF-Token`. Thiếu hoặc sai trả 403.
- CORS: chỉ cho origin trong `ALLOWED_ORIGINS`.
- Chỉ nhận JSON khi ghi dữ liệu (sai kiểu trả 415).

### Phase 5: vận hành
- Tổng quan: số user, user mới hôm nay, doanh thu hôm nay và trong tháng, trạng thái hàng đợi email, cảnh báo đang mở.
- Cảnh báo lỗi: hơn 5 lỗi máy chủ trong 5 phút thì tạo một cảnh báo; không tạo trùng khi cảnh báo còn mở.
- Sao lưu: `VACUUM INTO`, giữ 7 bản mới nhất. Chạy tự động lúc 2:00 và có nút chạy tay.
- Khôi phục: `npm run restore -- <file> --yes`. Kiểm tra header SQLite, `PRAGMA integrity_check` và các bảng bắt buộc; từ chối nếu thiếu `--yes` hoặc file trùng DB đích. Trước khi ghi đè, giữ bản an toàn `${DB_PATH}.truoc-khoi-phuc-<thời-điểm>`. Phải dừng server trước khi khôi phục.
- Xuất CSV: `GET /api/admin/users.csv` (theo bộ lọc hiện tại) và `GET /api/admin/reports/revenue.csv?groupBy=...&from=...&to=...` (có dòng tổng). UTF-8 BOM, thoát dấu phẩy/ngoặc kép theo RFC 4180.

### Phase 6: nội dung và pháp lý
- Danh mục và điều luật: sửa nội dung sẽ tự bỏ đánh dấu "đã đối chiếu".
- Tin tức, xuất toàn bộ nội dung luật (JSON).
- Trang điều khoản và chính sách bảo mật: `GET /api/legal/terms`, `GET /api/legal/privacy` (công khai).
- Xuất dữ liệu cá nhân: `GET /api/me/export` (JSON).
- Xóa tài khoản: `DELETE /api/me/data`. Email và tên được ẩn danh, phiên và đồng ý bị xóa, đơn hàng được giữ cho kế toán.
- **Chưa có:** nội dung điều khoản thật. Cần luật sư duyệt. Xuất ZIP.

### Phase 7: báo cáo tài chính
- Doanh thu theo ngày, tháng, gói, hoặc cổng thanh toán: `GET /api/admin/reports/revenue?groupBy=day&from=...&to=...`.
- Chi phí cố định hoặc biến đổi, chia đều theo ngày trong kỳ.
- Báo cáo lợi nhuận: `GET /api/admin/reports/profit`.
- Cảnh báo lỗ: báo khi 30 ngày liên tiếp có chi phí mà không có doanh thu.
- Chi phí AI: ghi nhận lượt dùng (`POST /api/admin/ai-usage`), báo cáo quy đổi VND (`GET /api/admin/reports/ai-cost`).
- **Chưa có:** đồng bộ chi phí từ tài khoản OpenAI. Cần API key.

### Đồng bộ tiến độ học
- `GET /api/progress` và `PUT /api/progress` (cần đăng nhập; PUT cần CSRF) lưu ảnh chụp các khóa `lyt_*` của app luật y tế vào bảng `user_progress`, mỗi tài khoản một bản ghi.
- Giới hạn: tối đa 400 khóa, 60.000 ký tự mỗi giá trị, 180.000 ký tự tổng; giá trị phải là chuỗi JSON.
- Quy tắc đồng bộ phía client: lần đầu đăng nhập trên máy mới lấy dữ liệu máy chủ làm gốc rồi phủ dữ liệu đang có trên máy; các lần sau so sánh `updatedAt`, bản mới hơn thắng (last-write-wins toàn bộ ảnh chụp). Xung đột giữa hai thiết bị cùng lúc có thể ghi đè lẫn nhau.

## Chưa làm / cần quyết định
- Gửi email thật (cần SMTP).
- Cổng thanh toán thật (cần merchant).
- Nội dung điều khoản và chính sách (cần luật sư duyệt).
- Đồng bộ chi phí OpenAI.
- Giao diện admin mới có Phase 1. Các phase sau dùng qua API.

## Lưu ý bảo mật
- Chưa đưa lên mạng. Trước khi triển khai cần HTTPS, cookie `Secure`, và giới hạn đăng nhập ở tầng proxy nếu chạy nhiều tiến trình.
- Thư mục `data/` chứa DB, bản sao lưu và `outbox.log`. Không đưa lên git.
- `SETTINGS_KEY` và `PAYMENT_SECRET` chỉ đặt qua biến môi trường.
- Mật khẩu admin đã từng được gửi trong khung chat. Hãy đổi mật khẩu đó.
