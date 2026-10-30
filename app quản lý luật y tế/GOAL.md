# GOAL — App quản lý luật y tế (admin)

## Mục tiêu
Biến app quản trị thành thứ có thể đưa lên VPS an toàn, với:
- kiểm tra cấu hình chặn sớm khi thiếu bí mật;
- có endpoint kiểm sống và header bảo mật;
- có sổ vận hành để người không phải tác giả vẫn triển khai và khôi phục được.

## Phạm vi
- `src/`, `test/`, `docs/`, `Dockerfile`, `package.json` của app này.
- Không đụng nội dung luật, giao diện học viên (`app luật y tế`), hay repo `luatyte` công khai.

## Không làm (cần chủ duyệt)
- Deploy VPS, đặt domain, cấp khóa thật, đổi mật khẩu admin.
- Push vào repo công khai `luatyte`, merge vào `main`.
- Xóa hoặc sửa `data/quan-ly.db` và bản sao lưu.

## Tiêu chí đo
| Chỉ số | Hiện tại | Mục tiêu |
|---|---|---|
| Test tự động | 58 | ≥ 64 và toàn bộ xanh |
| Health endpoint | không có | `GET /api/health` 200, không cần đăng nhập |
| Kiểm cấu hình khi khởi động | không có | production thiếu `SETTINGS_KEY` thì thoát với mã 1 |
| Header bảo mật | không có | nosniff, DENY, no-referrer, permissions-policy |
| Dockerfile | không có | có, chạy non-root, có HEALTHCHECK, chưa build |
| Sổ vận hành | README rải rác | `docs/RUNBOOK.md` có lệnh đã kiểm |

## Việc đang làm (sprint 1, nhánh `cindy/sprint-1`)
- [x] Kiểm cấu hình khi khởi động (`src/config-check.mjs`) và test
- [x] Endpoint `/api/health` và test
- [x] Header bảo mật trên mọi phản hồi và test
- [x] Dockerfile mẫu (không build)
- [x] `docs/RUNBOOK.md`
- [ ] Kiểm tra L1 (tab Sơ đồ) bằng trình duyệt thật
- [ ] Rate-limit TOTP (LYT-09) — xem xét thêm test
- [ ] CSP cho giao diện admin (cần đưa script inline ra file riêng)

## Rủi ro
- CSP chưa có vì giao diện admin còn script inline.
- Bản sao lưu nằm trên cùng máy với DB: cần bản sao lưu ra ngoài máy trước khi lên VPS.
