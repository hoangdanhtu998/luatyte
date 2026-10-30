# Sổ vận hành: quản lý luật y tế

Dành cho người vận hành. Mục 1–5 đã được kiểm trên máy phát triển (Node 24, Windows). Mục 6 (Docker) **chưa kiểm** vì chưa build image.

## 1. Chạy trên máy

```bash
npm test                 # 64 test
ADMIN_PASSWORD='mat-khau-it-nhat-10-ky-tu' npm run create-admin -- email@vidu.com
npm start                # http://localhost:3200
```

Kiểm tra sống: `curl http://localhost:3200/api/health` trả `{"ok":true,"db":"ok",...}`.

## 2. Biến môi trường bắt buộc ở production

| Biến | Yêu cầu |
|---|---|
| `NODE_ENV` | `production` để bật kiểm tra nghiêm ngặt |
| `SETTINGS_KEY` | 64 ký tự hex. Thiếu thì máy chủ **không khởi động** ở production |
| `PAYMENT_SECRET` | Nếu đặt thì ít nhất 16 ký tự |
| `ALLOW_REGISTRATION` | `false` nếu chỉ admin tạo tài khoản |
| `TRUST_PROXY` | `true` khi đứng sau reverse proxy |
| `ALLOWED_ORIGINS` | Chỉ các origin trình duyệt được gọi API |

Tạo khóa ngẫu nhiên:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Không ghi khóa vào git. Đã có `data/` trong `.gitignore`.

## 3. Sao lưu và khôi phục

- Máy chủ tự sao lưu lúc 2:00 vào `BACKUP_DIR` (mặc định `./data/backups`), giữ 7 bản mới nhất.
- Khôi phục: **dừng server trước**, rồi chạy:

```bash
npm run restore -- data/backups/quan-ly-YYYY-MM-DD.db --yes
```

Lệnh này kiểm tra bản sao trước khi ghi đè, và giữ một bản an toàn của DB hiện tại.

## 4. Xoay khóa

1. Tạo `SETTINGS_KEY` mới.
2. Các bí mật đã mã hóa (mật khẩu SMTP) phải được nhập lại từ màn Email, vì khóa cũ không giải mã được nữa.
3. Khởi động lại server và kiểm `/api/health`.

## 5. Dừng khẩn cấp

- Dừng tiến trình Node, hoặc `docker stop` nếu chạy container.
- Không xóa `data/quan-ly.db` khi chưa có bản sao lưu đã kiểm.

## 6. Docker (mẫu, chưa triển khai)

```bash
docker build -t luat-quan-ly .
docker run -d -p 3200:3200 \
  -e SETTINGS_KEY=... -e PAYMENT_SECRET=... -e TRUST_PROXY=true \
  -v luat-data:/app/data luat-quan-ly
```

Triển khai lên VPS, đặt domain và HTTPS cần chủ cung cấp IP, domain, DNS (xem CA-3 trong sổ điều phối).
