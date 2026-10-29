# Trạng thái 6 finding better-harness — 29/10/2026

Nguồn finding: `.qoder/better-harness-runs/20261029-1500/findings.json`. Lượt này chỉ sửa code/test/tài liệu; **không sửa nội dung câu hỏi/luật trong `data/*.json`**.

| Finding | Trạng thái | Bằng chứng |
|---|---|---|
| `root-agent-instructions-missing` | Đã sửa | `AGENTS.md` ở root route tới CLAUDE/README; 11 path được kiểm đều tồn tại. |
| `sync-failure-invisible` | Đã sửa | Playwright `sync-guard-check`: pull lỗi → 0 PUT, nút “Thử lại”; retry thành công → có `lyt_syncAt`; 401/500 hiện đúng lỗi; account 503 hiện lỗi kết nối thay vì “chưa đăng nhập”. |
| `sync-path-no-test` | Đã sửa | `test/sync-proxy.test.mjs`: 5 test (401, x-forwarded-for, CSRF 403, snapshot 200, ACCOUNTS_UNAVAILABLE 503), chạy bằng `node --test`. |
| `legal-data-no-gate` | Đã sửa | `test/content-contract.test.mjs`: 3 test; bổ sung cổng `t` phải trỏ tới law id hoặc chủ đề chung; fixture `t=khong_ton_tai`, thiếu `so`, trùng câu, đáp án ngoài phạm vi đều bị bắt. |
| `hospital-skill-wrong-install` | Đã sửa | `skill-hospital-assets/SKILL.md` không còn clone hallmark; mọi file được nhắc tồn tại; hai generator qua `node --check`. |
| `session-lane-empty` | Không sửa app — đánh dấu unavailable | Bundle `20261029-1500-evidence`: session lane `available` nhưng 0 eligible/0 selected, workspace label `Luật-y-tế`; lead cùng bundle phân tích 3 session, 313 episode. Rerun `20261029-p0p1-evidence` (normal, 29/09–29/10): lane và lead đều 0 session/0 episode; source roots 2/6. Đây là lệch source-root/workspace của evidence tooling, không phải lỗi app. |

## Kiểm tra baseline và sau sửa

- Baseline trước sửa: app quản lý `58/58`; app học core `10/10`; contract + sync-proxy + server-resilience `10/10`.
- Sau sửa: contract `3/3`, sync-proxy `5/5`, server-resilience `2/2`, core `10/10`; app quản lý không đổi `58/58`.

## Việc chuyển phiên nội dung pháp lý

Ghi chú `app luật y tế/docs/nghien-cuu-do-phu-noi-dung-2026-10-29.md` phát hiện `laws.json` mục `bhyt` vẫn còn dòng tóm tắt 40% trái với quiz/lý thuyết đã sửa. Lượt này **không sửa** `data/*.json` theo yêu cầu; chuyển cho phiên rà soát pháp lý xử lý cùng danh sách sửa.
