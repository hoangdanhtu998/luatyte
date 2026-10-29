# Luật y tế — Agent Guide

Đọc file này trước khi sửa code hoặc dữ liệu.

## Project map

- `app luật y tế/` — site học tĩnh + server Node tại cổng 4400; proxy tài khoản sang `http://localhost:3200`.
  - Context và quyết định: `app luật y tế/CLAUDE.md`.
  - Chạy: `cd "app luật y tế" && node server.mjs`.
  - Test game core: `cd "app luật y tế" && node --test test/swipe-core.test.mjs`.
  - Nội dung: `data/laws.json`, `data/quiz*.json`, `data/ly_thuyet.json`, `data/tf.json`.
- `app quản lý luật y tế/` — app quản lý Node 22.13+/24 + SQLite, cổng 3200.
  - Hướng dẫn đầy đủ: `app quản lý luật y tế/README.md`.
  - Test: `cd "app quản lý luật y tế" && npm test`.
  - Chạy: `cd "app quản lý luật y tế" && npm start`.

## Always

- Đọc `app luật y tế/CLAUDE.md` trước khi sửa app học; đọc README admin trước khi sửa admin.
- Kiểm tra cú pháp JS và chạy test liên quan sau mỗi thay đổi.
- Nội dung pháp lý phải có nguồn; chưa chắc thì đánh dấu `verify`, không bịa.
- Giữ dữ liệu JSON UTF-8, 2-space; parse lại sau khi sửa.

## Never

- Không đọc hoặc commit `data/secrets.env`, `data/*.db`, `data/bhyt-cases.draft.json`, voices/audio, node_modules.
- Không tự chi tiền cho tạo ảnh AI; hỏi trước khi dùng.
- Không ghi đè `bai-giang.html`, `clinic.html`, `moi-truong-pixel.html` nếu chủ dự án chưa yêu cầu trực tiếp.
- Không commit thay đổi khi chủ dự án chưa yêu cầu.

## Ask before

- Thay đổi schema/API, xóa dữ liệu, hoặc sửa file chủ dự án đánh dấu chỉnh tay.
- Đưa thêm thư viện/dependency hoặc dịch vụ ngoài.
- Bất kỳ thao tác publish/deploy/production.

## Deeper owners

- Báo cáo audit nội dung: `app luật y tế/docs/audit-noi-dung-luat-2026-10-29.md`
- Prompt cải thiện toàn diện: `docs/PROMPT-cai-thien-toan-dien-2026-10-29.md`
- Plan thực thi: `docs/superpowers/plans/2026-10-29-cai-thien-app-luat-y-te.md`
- Checklist phát hành: `app luật y tế/KIEM-TRA-PHAT-HANH.md`
