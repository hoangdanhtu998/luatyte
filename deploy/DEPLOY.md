# Đưa luatyte.online lên mạng (VPS có Docker)

**Trước khi bắt đầu**
1. Thuê một VPS (Linux, tối thiểu 1 GB RAM) và ghi lại địa chỉ IP.
2. Trỏ bản ghi DNS `luatyte.online` (loại A) về IP đó. Chờ DNS cập nhật.
3. Đổi mật khẩu quản trị. Mật khẩu cũ đã từng gửi trong cuộc trò chuyện nên phải coi là lộ.

**Trên VPS**
```bash
# cài Docker (Ubuntu/Debian)
curl -fsSL https://get.docker.com | sh
# đưa mã nguồn lên (ví dụ bằng git clone hoặc scp) vào thư mục /srv/luatyte
cd /srv/luatyte/app\ luật\ y\ tế/deploy
docker compose up -d --build
docker compose logs -f
```

**Kiểm tra**
- Mở https://luatyte.online/ phải chuyển sang trang đăng nhập.
- Đăng ký một tài khoản thử, đăng nhập, rồi xem bài giảng.
- Đăng nhập tài khoản quản trị ở trang quản lý để xác nhận tài khoản mới xuất hiện.

**Lưu ý**
- Dữ liệu tài khoản nằm trong volume `admin-data`. Phải sao lưu định kỳ.
- Giọng đọc tạo theo thời gian thực (Piper) và các phần chạy trên máy Windows không hoạt động trong container. Bài giảng có giọng đọc đã tạo sẵn vẫn chạy.
- Cần kiểm tra lại toàn bộ sau khi triển khai, vì các file này chưa được chạy thử trên VPS thật.

**Healthcheck và vận hành (cập nhật 29/10/2026)**
- `docker compose ps` phải hiện `healthy` cho `admin` và `study` trước khi Caddy nhận traffic. Compose đã đặt `depends_on: condition: service_healthy`.
- Kiểm tra nhanh: `docker compose exec study node -e "fetch('http://127.0.0.1:4400/robots.txt').then(r=>process.exit(r.ok?0:1))"`.
- Sao lưu volume: `docker run --rm -v deploy_admin-data:/data -v "$PWD":/backup alpine tar czf /backup/admin-data-$(date +%F).tgz -C /data .` (chạy trong thư mục `deploy`).
- Khôi phục: dừng `admin`, giải nén bản backup vào volume, rồi `docker compose up -d admin`; thử `docker compose exec admin node src/cli.mjs restore <file> --yes` nếu dùng file SQLite.
- Trạng thái xác minh: `docker compose config` đã pass ngày 29/10/2026; chưa có VPS để chạy thật, nên healthcheck/backup runtime vẫn **unverified**.
