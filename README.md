# Sổ tay Luật Y tế

Hai ứng dụng chạy cạnh nhau:

- **App học** — `app luật y tế/`: site tĩnh (HTML/CSS/JS) + máy chủ Node tại cổng **4400**; proxy API tài khoản sang cổng **3200**. Dữ liệu luật, câu hỏi và lý thuyết nằm trong `app luật y tế/data/*.json`.
- **App quản lý** — `app quản lý luật y tế/`: Node 22.13+ (hoặc 24), SQLite bằng `node:sqlite`, cổng **3200**. Quản lý tài khoản, gói, sao lưu/khôi phục và xuất CSV.

## Chạy cục bộ

```bash
# Cửa sổ 1 — máy chủ tài khoản (admin)
cd "app quản lý luật y tế"
npm install
npm start          # http://localhost:3200

# Cửa sổ 2 — app học
cd "app luật y tế"
node server.mjs    # http://localhost:4400
```

Mở `http://localhost:4400/`. Khi máy chủ tài khoản tắt, app học vẫn đọc luật/quiz từ file tĩnh; đồng bộ tài khoản sẽ báo lỗi và cho thử lại.

## Kiểm tra

```bash
# Từ gốc repo: test core/contract/sync/server + security smoke
node scripts/check-local.mjs

# Thêm 58 test của app quản lý
node scripts/check-local.mjs --admin

# Riêng từng phần
cd "app luật y tế" && node --test test/swipe-core.test.mjs
cd "app luật y tế" && node --test test/content-contract.test.mjs test/sync-proxy.test.mjs test/server-resilience.test.mjs
cd "app quản lý luật y tế" && npm test
node scripts/security-smoke.mjs   # ghi .qoder/security/security-smoke.json
```

## Tài liệu

- `AGENTS.md` — quy tắc làm việc cho agent, command và ranh giới.
- `app luật y tế/CLAUDE.md` — kiến trúc, quyết định kỹ thuật của app học.
- `app quản lý luật y tế/README.md` — cấu hình, API, sao lưu/khôi phục admin.
- `app luật y tế/docs/audit-noi-dung-luat-2026-10-29.md` — kiểm toán nội dung pháp lý.
- `app luật y tế/KIEM-TRA-PHAT-HANH.md` — checklist trước phát hành.
- `app luật y tế/deploy/DEPLOY.md` — triển khai VPS/Docker.
- `docs/superpowers/plans/2026-10-29-cai-thien-app-luat-y-te.md` — kế hoạch cải thiện 50 task.

## Bảo mật

Không commit `data/secrets.env`, `data/*.db`, `data/bhyt-cases.draft.json`, thư mục giọng đọc/audio, `node_modules` hoặc `.qoder/`. Không đưa khóa, mật khẩu hay dữ liệu người dùng ra ngoài. Nội dung pháp lý mới chỉ thêm khi có nguồn; chỗ chưa đối chiếu phải đánh dấu `verify`.
