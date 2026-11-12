# QA Hub

Dashboard kiểm thử web chạy thật: quản lý test case, bug, và checklist 14 giai đoạn
theo workflow kiểm thử web. Không có dependency runtime, chỉ dùng Node.js và
Playwright cho test.

## Chạy app

```bash
npm install
npm start
```

Mở http://127.0.0.1:3000 (đổi bằng biến môi trường `PORT`).

## Chạy test

```bash
npm test
```

Lệnh này khởi động server trên cổng 4173 với dữ liệu reset từ seed, chạy Playwright
trên Chromium, và ghi báo cáo vào `results/playwright-results.json` và `playwright-report/`.
Sau đó mở trang **Checklist 14 giai đoạn** để xem trạng thái từng giai đoạn lấy từ báo cáo.

Xem báo cáo HTML: `npm run test:report`.

## Cấu trúc

| Đường dẫn | Nội dung |
|-----------|----------|
| `server.js` | HTTP server, API, phục vụ file tĩnh, header bảo mật |
| `lib/store.js` | Lưu dữ liệu vào file JSON, ghi nguyên tử |
| `lib/validate.js` | Kiểm tra đầu vào cho test case và bug |
| `lib/metrics.js` | 14 giai đoạn, thống kê, đọc báo cáo Playwright |
| `public/` | Giao diện (HTML, CSS, JS thuần) |
| `tests/` | smoke, functional, responsive, a11y, performance, security |
| `data/seed.json` | Dữ liệu ban đầu (giả) |
| `.github/workflows/ci.yml` | CI chạy `npm test` và lưu báo cáo |

## API

| Method | Đường dẫn | Ghi chú |
|--------|-----------|---------|
| GET | `/api/health` | Kiểm tra sống |
| GET | `/api/stats` | Thống kê test case, bug, E2E |
| GET | `/api/stages` | Trạng thái 14 giai đoạn |
| GET | `/api/testcases?status=&priority=&q=` | Lọc và tìm kiếm |
| POST | `/api/testcases` | Body JSON: `title`, `module`, `priority`. Trả 400 kèm `details` nếu sai |
| PATCH | `/api/testcases/:id` | Body JSON: `status` |
| GET, POST | `/api/bugs` | Body JSON: `title`, `severity`, `steps` |

## Phạm vi hiện tại và giới hạn

- Chỉ chạy Chromium. Firefox và WebKit chưa được cấu hình.
- Dữ liệu lưu trong file JSON, không phù hợp cho nhiều người dùng đồng thời.
- Không có đăng nhập, không có CSRF token. Chỉ phù hợp chạy cục bộ.
- Các giai đoạn 0–3, 10, 11 và 13 ghi tay trong `lib/metrics.js`, không tự động.
