# Cải thiện toàn diện app Luật y tế — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sửa các finding harness, lỗi desktop, thiếu test và nội dung pháp lý còn mở của app Luật y tế mà không phá tính năng hiện có.

**Architecture:** Hai app độc lập nhưng dùng chung dữ liệu học: app tĩnh `app luật y tế` (cổng 4400, proxy tài khoản) và app quản lý Node/SQLite (cổng 3200). Các task P0–P5 đi từ bằng chứng hiện tại, sửa lỗi nhỏ trước, rồi test/contract, rồi audit nội dung; mỗi task phải tự đứng được và có kiểm tra.

**Tech Stack:** Vanilla HTML/CSS/JS, Node 22.13+/24, `node:sqlite` (`DatabaseSync`), `node:test`, Playwright Chrome, không thêm dependency frontend.

**Spec:** `docs/PROMPT-cai-thien-toan-dien-2026-10-29.md` · `docs/audit-noi-dung-luat-2026-10-29.md` · `.qoder/better-harness-runs/20261029-1500/findings.json`

## Global Constraints

- Git baseline `4493b3f`; không rewrite history, không commit khi chủ dự án chưa yêu cầu.
- Không đọc/commit `data/secrets.env`, `data/*.db`, `data/bhyt-cases.draft.json`, voices/audio, node_modules.
- Không tự chi tiền tạo ảnh AI; không thêm dependency frontend nếu không cần.
- Không ghi đè `bai-giang.html`, `clinic.html`, `moi-truong-pixel.html` nếu không có yêu cầu trực tiếp; riêng `index.html`/`game.html` được sửa theo task.
- Mọi thay đổi dữ liệu pháp lý phải có nguồn; chưa chắc đánh dấu `verify`, không bịa.
- Giữ JSON UTF-8, 2-space; mọi data change phải parse + test contract.
- Test hiện có: admin `npm test` 58/58; game core `node --test test/swipe-core.test.mjs` 10/10.
- UI phải kiểm desktop 1440×900, 1280×800 và mobile 390×844, 360×640.
- LAN HTTP không có service worker/offline; chỉ kiểm offline trên localhost hoặc HTTPS.

## Review Focus

1. **Sync mất dữ liệu âm thầm:** `/api/progress` lỗi/401/CSRF/offline — UI phải phân biệt lưu máy với lưu tài khoản. Owner tasks 8–10.
2. **Dữ liệu luật hỏng/tham chiếu chết:** thiếu trường, trùng khóa, `a` ngoài phạm vi, `t` không tồn tại — test contract phải chặn. Tasks 11–12, 30–42.
3. **Desktop sai mode/thứ tự:** tab/chip bị cắt, game desktop vẫn hướng dẫn vuốt — tasks 16–18, 24.
4. **Service worker trả bản cũ:** cache `lyt-v26`/data sau thay đổi — task 29, 50.
5. **Agent bỏ sót ràng buộc từ root:** không có AGENTS.md gốc — tasks 6–7.

## File Structure

- **Create:** `AGENTS.md` (root router), `test/sync-proxy.test.mjs`, `test/content-contract.test.mjs`, `docs/README.md`, plan/spec docs.
- **Modify:** `app luật y tế/index.html` (sync UI, date, nav/chips CSS), `app luật y tế/game.html` (desktop rules), `app luật y tế/site.css` (desktop nav/chips), `app luật y tế/sw.js` (cache/version), `app luật y tế/server.mjs` (error boundary), `skill-hospital-assets/SKILL.md`.
- **Content:** `data/laws.json`, `data/quiz*.json`, `data/tf.json`, `data/ly_thuyet.json` only after source verification.
- **Do not touch:** admin `data/`, credentials, `.qoder/better-harness-runs`, `ogam/`, voices.

## Tasks

### P0 — Baseline và bằng chứng

- [ ] **Task 1: Chạy baseline test hiện có.** Files: none. Steps: `cd "app quản lý luật y tế" && npm test` → 58/58; `cd "app luật y tế" && node --test test/swipe-core.test.mjs` → 10/10; ghi kết quả. Done when cả hai pass, không sửa file.
- [ ] **Task 2: Kiểm tra Git và secret boundary.** Files: `.gitignore`. Steps: `git status --short` sạch; `git ls-files | grep -Ei 'secret|\.db$|bhyt-cases|voices/|node_modules'` rỗng; `git log -1`. Done when không có file nhạy cảm tracked.
- [ ] **Task 3: Lập inventory command/owner.** Files: `CLAUDE.md`, `README.md`, `package.json`, `KIEM-TRA-PHAT-HANH.md`. Steps: liệt kê command chạy/test/restore, entrypoint, owner app học/admin; ghi path thật. Done when mỗi command có working directory và đã chạy hoặc lý do chưa chạy.
- [ ] **Task 4: Snapshot dữ liệu hiện tại.** Files: `data/*.json`. Steps: parse 16 file; đếm laws 40, quiz 72, theory 14, TF 23; kiểm không empty points/duplicate. Done when có output lưu trong phiên.
- [ ] **Task 5: Baseline giao diện.** Files: screenshots tạm. Steps: Playwright 1440×900 và 390×844 cho index/game/theory; ghi lỗi console. Done when có ảnh và danh sách lỗi (503 API là môi trường).

### P1 — Sửa 6 finding harness

- [ ] **Task 6: Tạo AGENTS.md gốc.** Files: `AGENTS.md`. Steps: router tới `app luật y tế/CLAUDE.md`, `app quản lý luật y tế/README.md`; chỉ nêu ràng buộc bí mật/chi phí ảnh/không ghi đè; không copy README. Done when file ngắn, không trùng lặp.
- [ ] **Task 7: Kiểm tra route AGENTS.** Files: `AGENTS.md`. Steps: kiểm từng path/link từ root; thử một agent đọc root tìm được app/owner. Done when mọi path tồn tại và không có route mồ côi.
- [ ] **Task 8: Sửa sync failure UI.** Files: `app luật y tế/index.html`. Steps: thêm trạng thái `chưa đồng bộ` + retry; phân biệt mạng/401/CSRF; giữ last-write-wins. Done when UI không còn nói “đang đồng bộ” khi push false.
- [ ] **Task 9: Test sync UI bằng Playwright.** Files: temp script. Steps: chạy app + account server tắt/bật; kiểm trạng thái lỗi/retry; kiểm `lyt_syncAt`. Done when cả hai trạng thái hiển thị đúng.
- [ ] **Task 10: Test tích hợp sync/proxy.** Files: `test/sync-proxy.test.mjs`. Steps: server tạm + fetch; test 401, CSRF sai, snapshot 200, lỗi mạng/500. Done when `node --test` pass và fixture lỗi bị phát hiện.
- [ ] **Task 11: Test contract dữ liệu.** Files: `test/content-contract.test.mjs`. Steps: validate schema laws/quiz/tf/ly_thuyet; uniqueness; answer range; `t` references; special set 8. Done when chạy pass trên data hiện tại.
- [ ] **Task 12: Fixture xấu cho contract.** Files: `test/content-contract.test.mjs`. Steps: thêm fixture tạm thiếu trường/trùng ID/đáp án sai; chạy test fail đúng file/record; xóa fixture. Done when test chặn được lỗi.
- [ ] **Task 13: Sửa skill ảnh.** Files: `skill-hospital-assets/SKILL.md`. Steps: bỏ clone hallmark, trỏ đúng generator; tạo `prompts.json` hoặc bỏ hướng dẫn sửa file không tồn tại. Done when mọi path được nhắc tồn tại.
- [ ] **Task 14: Validate skill path.** Files: `skill-hospital-assets/SKILL.md`, `GITHUB-SKILLS.md`. Steps: liệt kê file; kiểm installation/customization; không chạy API ngoài. Done when không còn tham chiếu chết.
- [ ] **Task 15: Chẩn đoán session lane.** Files: better-harness bundle mới. Steps: rerun `harness evidence-bundle` sau Git baseline; so selectedSessions lane với lead; nếu 0, ghi source-root mismatch, không sửa app. Done when lane có dữ liệu hoặc báo unavailable rõ.

### P2 — Desktop, mobile, UX

- [ ] **Task 16: Tab desktop không bị cắt.** Files: `app luật y tế/site.css`. Steps: media ≥900px giảm padding/gap hoặc nới wrap; kiểm 1280/1440. Done when “Phân tích” hiện đủ.
- [ ] **Task 17: Chip chủ đề wrap desktop.** Files: `site.css`. Steps: `.cats` wrap ở desktop; mobile vẫn scroll. Done when không chip nào bị khuất ở 1440.
- [ ] **Task 18: Rule game desktop.** Files: `game.html`. Steps: render rule theo `mode`; desktop chỉ nút/phím, bỏ combo; mobile giữ vuốt. Done when text khớp mode.
- [ ] **Task 19: Thống nhất ngày cập nhật.** Files: `index.html`. Steps: header/footer/AI prompt dùng 29/10/2026. Done when không còn “10/2026” lệch.
- [ ] **Task 20: Đảo đáp án thi thử (nếu owner xác nhận).** Files: `index.html`, `test` nếu tách core. Steps: shuffle option, remap `a`, giữ ổn định trong lượt. Done when mọi bộ đề đảo và chấm đúng.
- [ ] **Task 21: Test đảo đáp án.** Files: test mới. Steps: đề 10 câu chọn đúng theo nội dung → 10/10; đáp án index thay đổi. Done when test pass.
- [ ] **Task 22: Test đổi bản game.** Files: `game.html`. Steps: `?ban=dien-thoai|may-tinh`; click Đổi bản; kiểm mode/label. Done when URL/mode khớp.
- [ ] **Task 23: Test auto mobile và máy thật.** Files: none. Steps: viewport 390 không query → mobile; 1280 → desktop; nếu có điện thoại cùng LAN, mở QR `http://192.168.10.247:4400/game.html` để kiểm online; ghi rõ LAN HTTP không có SW. Done when auto mode đúng và có kết quả máy thật hoặc ghi blocked.
- [ ] **Task 24: Screenshot desktop.** Files: temp. Steps: 1280×800/1440×900 index, quiz, theory, game; check overflow. Done when ảnh không cắt ngoài viewport.
- [ ] **Task 25: Screenshot mobile.** Files: temp. Steps: 390×844/360×640 index, game; check safe area/scroll. Done when không tràn ngang.
- [ ] **Task 26: Keyboard/focus.** Files: `game.html`. Steps: ←/→ trả lời; Enter bắt đầu/chơi lại; focus ring; thẻ mới thông báo. Done when chơi bằng bàn phím được.
- [ ] **Task 27: Dark mode contrast.** Files: `site.css`, `game.html`. Steps: kiểm các panel/card/button ở dark; sửa token nếu chữ mờ. Done when text/controls đạt tương phản đọc được.
- [ ] **Task 28: Progress goal/chart.** Files: `index.html`. Steps: kiểm stepper, lưu goal, chart 0/14 ngày, sync note; mobile/desktop. Done when không lỗi layout.
- [ ] **Task 29: SW cache/version.** Files: `sw.js`. Steps: bump cache nếu data đổi; kiểm CORE file; localhost offline; LAN ghi rõ không SW. Done when cache có data mới và game mở offline localhost.

### P3 — Audit nội dung pháp lý

- [ ] **Task 30: Audit metadata 40 văn bản.** Files: `data/laws.json`, audit report. Steps: đối chiếu số hiệu/ngày/trạng thái với nguồn; ghi lỗi. Done when mọi mục có nguồn hoặc `verify`.
- [ ] **Task 31: Audit `quiz.json` 72 câu.** Files: `data/quiz.json`. Steps: rà đáp án/giải thích/căn cứ; ưu tiên số/ngày/thời hạn. Done when có danh sách lỗi + sửa đã xác minh.
- [ ] **Task 32: Audit `quiz_nentang` 15.** Files: data. Steps: same. Done when pass/lỗi có nguồn.
- [ ] **Task 33: Audit `quiz_his` 44.** Files: data. Steps: same, ưu tiên HIS. Done.
- [ ] **Task 34: Audit `quiz_lythuyet` 48.** Files: data. Steps: same. Done.
- [ ] **Task 35: Audit `quiz_bhyt` 8.** Files: data. Steps: same. Done.
- [ ] **Task 36: Audit TF 23.** Files: `data/tf.json`. Steps: same, câu Đúng/Sai. Done.
- [ ] **Task 37: Audit 14 chương lý thuyết.** Files: `data/ly_thuyet.json`. Steps: rà nguồn/verify; c14 mới. Done when có danh sách sửa.
- [ ] **Task 38: Quyết định văn bản còn thiếu.** Files: audit report. Steps: TT26/2026, TT34/2026, TT36/2026, NĐ350/2026; thêm nếu đúng phạm vi+metadata. Done when có quyết định/thêm hoặc lý do bỏ.
- [ ] **Task 39: Gắn citation/verify.** Files: law/quiz/theory. Steps: thêm `src/nguon` cho mục mới; `verify` cho chưa chắc. Done when UI hiển thị cảnh báo chờ đối chiếu.
- [ ] **Task 40: Câu hỏi cho văn bản mới (nếu thêm).** Files: quiz/data. Steps: mỗi văn bản 1 câu nội dung, không số hiệu/ngày; chạy contract. Done when câu mới vào pool thường, không vào meta.
- [ ] **Task 41: Rà chương c14.** Files: `ly_thuyet.json`. Steps: đối chiếu 6 bước với nguồn; sửa từ ngữ không chắc. Done when 6 bước có nguồn.
- [ ] **Task 42: Regression bộ đặc thù.** Files: `index.html`, data. Steps: meta vẫn 8; regular không lẫn; exam 40 câu không lẫn. Done when test/UI pass.

### P4 — Ổn định, vận hành

- [ ] **Task 43: Error boundary server học.** Files: `app luật y tế/server.mjs`. Steps: bọc handler async; bắt URL/malformed; log lỗi; test request `%`. Done when server không chết vì URL xấu.
- [ ] **Task 44: Sửa `clinic3d.js` hoặc ẩn 3D (cần owner duyệt file tay).** Files: `clinic.html`, `js/`. Steps: thêm asset hoặc fallback thông báo; test mở Phòng 3D. Done when không import 404.
- [ ] **Task 45: Local check script.** Files: `package.json` (app học/admin) hoặc script. Steps: lệnh chạy test core + contract + security; không dependency. Done when một lệnh chạy được.
- [ ] **Task 46: Security smoke.** Files: `scripts/security-smoke.mjs`. Steps: chạy với server test; lưu artifact ngoài `data/`; ghi kết quả. Done when có output thật, không chỉ prose.
- [ ] **Task 47: Deploy doc/VPS.** Files: `deploy/DEPLOY.md`, compose. Steps: kiểm healthcheck/volume; chạy thử nếu có VPS; nếu không, đánh dấu unverified. Done when có trạng thái thật.

### P5 — Tài liệu và đóng gói

- [ ] **Task 48: Root README.** Files: `README.md`. Steps: mô tả 2 app, command, port, link docs; không copy secrets. Done when người mới chạy được.
- [ ] **Task 49: Đồng bộ docs.** Files: `CLAUDE.md`, `README.md`, audit, plan. Steps: cập nhật quyết định/known gaps; xóa stale. Done when docs khớp code/data.
- [ ] **Task 50: Regression cuối.** Files: all. Steps: `npm test` 58+, core 10, contract, Playwright desktop/mobile, sync E2E, offline localhost, git status. Done when tất cả pass hoặc ghi rõ blocked.

## Execution Rules

- Làm theo thứ tự P0 → P1 → P2 → P3 → P4 → P5; task có dependency rõ mới chạy.
- Mỗi task chỉ nhận một deliverable; không gộp audit nội dung với sửa UI.
- Với task nội dung, "done" có thể là báo cáo lỗi có nguồn, không bắt buộc sửa nếu chưa xác minh.
- Commit chỉ khi chủ dự án yêu cầu; nếu không, để working tree và báo diff.
- Nếu task 20 (đảo đáp án) chưa được chủ dự án xác nhận lại, dừng task đó và tiếp tục phần khác.
- Nếu gặp mâu thuẫn nguồn pháp lý hoặc file chủ dự án bị chặn, dừng đúng task, nêu path và điều kiện tiếp tục.

## Review Focus Tests

- Task 9/10 phải thất bại khi `/api/me` 401, CSRF sai, `/api/progress` 500.
- Task 11/12 phải thất bại khi laws thiếu `eff`, quiz trùng `q`, `a` ngoài `o`, `t` không có law.
- Task 16/17/24 phải kiểm nav clientWidth >= scrollWidth hoặc tab “Phân tích” visible ở 1280/1440.
- Task 29 phải kiểm cache `lyt-v27` (nếu bump) có `data/laws.json` mới và offline localhost mở được.
- Task 6/7 phải kiểm agent từ root resolve được CLAUDE/README và không có path chết.

## Trạng thái thực thi (29/10/2026)

- Đã chạy P0–P5 theo thứ tự; bằng chứng từng task nằm trong `.qoder/sdd/2026-10-29-cai-thien-app-luat-y-te/progress.md` (không commit).
- P1: 6 finding Harness đã xử lý; report mới ở `.qoder/better-harness-runs/20261029-1500/report.canvas.tsx`; session lane báo 0 eligible sessions do lệch workspace label, không sửa app.
- P2: tab/chip desktop, rule game theo mode, ngày 29/10/2026, đảo đáp án thi thử, keyboard, dark contrast, goal revert, SW v30 + offline localhost đều đã kiểm.
- P3: audit đợt 2 trong `app luật y tế/docs/audit-noi-dung-luat-2026-10-29.md`; sửa BHYT trái tuyến và thay Thông tư 21/2024; 8 câu giá cũ giữ làm lịch sử có cảnh báo.
- P4: error boundary server, fallback clinic3d, `scripts/check-local.mjs`, `scripts/security-smoke.mjs` (8/8), compose config pass; runtime VPS chưa chạy.
- P5: root README, đồng bộ docs, regression cuối.
- Blocked/unverified: Task 23 không có điện thoại thật; Task 47 chưa có VPS. Không có task nào bị bỏ qua mà không ghi lý do.

## Follow-up 29/10/2026 — chuyên đề xử phạt hành chính
- Đã thêm Nghị định 90/2026/NĐ-CP (thay NĐ117/2020 từ 15/05/2026), 12 câu tình huống và chương lý thuyết c15; tổng 42 văn bản / 199 câu / 15 chương.
- Đã kiểm contract, UI quiz/thi thử, mobile/desktop, offline và security smoke; chi tiết trong `app luật y tế/docs/audit-noi-dung-luat-2026-10-29.md` mục 8.
