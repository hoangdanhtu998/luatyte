# Prompt cải thiện toàn diện app Luật y tế

Dùng prompt này cho một phiên agent mới. Nó giả định agent được phép đọc/sửa project, nhưng vẫn phải giữ các guardrail về dữ liệu pháp lý, bí mật và file chủ dự án.

## Prompt

Bạn là kỹ sư trưởng của dự án **Sổ tay Luật Y tế** tại `C:\Users\SK\Documents\Luật y tế`. Hãy cải thiện app một cách toàn diện, có bằng chứng, không phá tính năng hiện có. Chủ dự án đã giao quyền quyết định chi tiết kỹ thuật; chỉ hỏi lại khi một lựa chọn làm thay đổi hành vi người dùng, phạm vi pháp lý hoặc quyền truy cập dữ liệu.

### Bối cảnh hiện tại (phải kiểm tra lại, không tin tuyệt đối)

- Repo: `C:\Users\SK\Documents\Luật y tế`, Git baseline `4493b3f`, 805 file tracked, diff sạch. `.gitignore` đã loại data DB, secrets, voices/audio, node_modules, `.qoder`.
- App học: `app luật y tế` — site tĩnh + `server.mjs` cổng 4400, proxy tài khoản sang 3200, service worker `lyt-v26`, mini-game `game.html`, 40 văn bản trong `data/laws.json`, 72 câu `quiz.json`, tổng 187 câu trắc nghiệm, 23 TF, 14 chương `ly_thuyet.json`.
- App quản lý: `app quản lý luật y tế` — Node 22.13+/24, `node:sqlite`, 58 test HTTP, backup/restore, CSV, progress sync.
- Báo cáo better-harness mới: `C:\Users\SK\Documents\Luật y tế\.qoder\better-harness-runs\20261029-1500\report.canvas.tsx`; 6 findings, chi tiết trong `findings.json` cùng thư mục.
- Audit nội dung: `app luật y tế/docs/audit-noi-dung-luat-2026-10-29.md`; mới là đợt 1, **chưa rà toàn bộ 187 câu/14 chương**.
- Môi trường test: Python Playwright chưa cài; dùng Node Playwright Chrome (`C:\Users\SK\.qoder\tmp\pw` nếu còn). LAN `http://192.168.10.247:4400` không có service worker vì HTTP; localhost mới có.

### Mục tiêu

1. Sửa các vấn đề harness có bằng chứng, không thêm finding suông.
2. Sửa các lỗi desktop đã thấy và kiểm tra mobile thật/emulation.
3. Hoàn tất audit nội dung pháp lý ở mức có thể, chỉ sửa khi có nguồn.
4. Giữ app chạy được sau từng phase; thêm test cho mọi đường có rủi ro.
5. Kết thúc bằng báo cáo ngắn: đã sửa gì, test gì, còn gì chưa xác minh.

### Thứ tự ưu tiên

**P0 — Baseline và guardrail**
- Đọc `app luật y tế/CLAUDE.md`, `app quản lý luật y tế/README.md`, `KIEM-TRA-PHAT-HANH.md`, audit report và findings.
- Chạy `npm test` trong app quản lý (58 test) và `node --test test/swipe-core.test.mjs` trong app học (10 test) trước khi sửa.
- Không đọc/commit `data/secrets.env`, `data/*.db`, `data/bhyt-cases.draft.json`, voices/audio.
- Không tự chi tiền tạo ảnh AI; không thêm thư viện ngoài nếu không cần.
- Không ghi đè `bai-giang.html`, `clinic.html`, `moi-truong-pixel.html` nếu không có yêu cầu trực tiếp; `index.html`/`game.html` được sửa khi phục vụ task.

**P1 — Sửa 6 finding harness**
1. **Root agent instructions:** thêm `AGENTS.md` ở root làm router ngắn tới `app luật y tế/CLAUDE.md` và `app quản lý luật y tế/README.md`; chỉ nêu ràng buộc luôn cần (không lộ secrets, không tự chi ảnh AI, không ghi đè file chủ). Không copy toàn bộ CLAUDE/README. Kiểm tra mọi link/path từ root.
2. **Sync thất bại im lặng:** sửa UI tiến độ để phân biệt “đang đồng bộ”, “đã lưu tài khoản”, “chưa đồng bộ + thử lại”. Giữ last-write-wins. Không đổi schema server. Thêm trạng thái/log tối thiểu để phân biệt mạng/401/CSRF.
3. **Test sync/proxy:** thêm test Node cho app học, dùng server tạm và fetch; phủ ít nhất: chưa đăng nhập, CSRF sai, snapshot hợp lệ, lỗi mạng/500. Chạy `node --test`.
4. **Test hợp đồng dữ liệu:** thêm test kiểm schema `laws.json`, `quiz.json`, `ly_thuyet.json`, `tf.json`: trường bắt buộc, ID/khóa không trùng, `a` trong phạm vi, `t` trỏ tới law tồn tại, không có câu meta lọt vào pool thường. Không kiểm “đúng pháp lý” tự động.
5. **Skill ảnh bệnh viện:** sửa `skill-hospital-assets/SKILL.md` — bỏ lệnh clone `hallmark-skills`, trỏ đúng generator/file hiện có, thêm `prompts.json` hoặc bỏ hướng dẫn sửa file không tồn tại. Kiểm tra mọi path được nhắc.
6. **Session lane rỗng:** đây là lỗi evidence tooling, không phải app. Chạy lại `harness evidence-bundle`; nếu lane vẫn 0 trong khi lead có session, ghi rõ `unavailable`/source-root mismatch, không sửa app để “làm đầy” số liệu.

**P2 — Desktop UI đã kiểm tra**
- Nav 9 tab cần ~1000px nhưng `.wrap` 920px; tab “Phân tích” bị khuất ở 1440. Sửa desktop: giảm padding/gap tab hoặc nới wrap hợp lý; kiểm tra 1280/1440.
- Dải chip chủ đề bị cuộn ngang, cắt “Phòng bệnh” dù desktop còn chỗ. Cho `.cats` wrap ở desktop; không làm vỡ mobile.
- `game.html` bản desktop vẫn ghi “vuốt phải/trái” và “Combo” dù chỉ dùng nút/phím. Sửa rule theo `mode`; bỏ combo ở desktop.
- Đồng bộ ngày hiển thị: header đang “cập nhật đến 10/2026”, footer 29/10/2026 — thống nhất một mốc.
- Kiểm tra lại bằng Playwright 1440×900 và 390×844; không tràn ngang; console không lỗi JS (503 `/api/me` khi account server tắt là môi trường, không phải lỗi UI).

**P3 — Nội dung pháp lý**
- Rà tiếp 187 câu/14 chương theo nguồn chính thống; ưu tiên câu có số hiệu, ngày hiệu lực, thời hạn, mức hưởng và văn bản mới.
- Chỉ sửa khi có nguồn; nếu chưa chắc, đánh dấu `verify` và ghi vào báo cáo, không bịa.
- Cân nhắc bổ sung các văn bản còn thiếu đã ghi trong audit: Thông tư 26/2026, 34/2026, 36/2026, Nghị định 350/2026 — chỉ thêm nếu đúng phạm vi học và có metadata xác minh.
- Nếu thêm luật/câu hỏi: cập nhật `laws.json`, `quiz.json`/`quiz_lythuyet.json`, `ly_thuyet.json` và test hợp đồng dữ liệu; không thêm câu hỏi số hiệu/ngày vào pool thường.
- Không sửa file dữ liệu bằng tay nếu có thể dùng script + validate; giữ UTF-8, JSON hợp lệ.

**P4 — Việc đang chờ quyết định**
- **Thi thử đảo đáp án:** thiết kế đã có từ 29/10 nhưng chưa triển khai. Nếu chủ dự án còn muốn, thực hiện trong `startExam`: đảo option + remap `a`, giữ ổn định trong lượt, áp dụng mọi bộ đề; test chấm đúng theo nội dung.
- **Mobile thật:** service worker/offline không hoạt động qua LAN HTTP; chỉ kiểm tra online. Không cố “sửa” bằng cách hạ bảo mật trình duyệt; nếu cần offline thật phải HTTPS.

### Quy tắc kỹ thuật

- Dùng Git hiện có; không rewrite history, không commit dữ liệu nhạy cảm. Không tự commit nếu chưa được yêu cầu.
- Không đổi API/schema server nếu không cần; nếu đổi, cập nhật test và README.
- Không thêm dependency frontend; giữ app tĩnh, service worker và offline localhost.
- Mọi thay đổi UI phải kiểm tra desktop + mobile; mọi thay đổi dữ liệu phải parse JSON và chạy test hợp đồng.
- Không dùng `any`/placeholder; không để `TODO` mới.
- Giữ file dữ liệu gốc UTF-8, 2-space JSON như hiện tại.
- Không đọc raw session/transcript, Memory body, credential folders.

### Acceptance

- `npm test` app quản lý: 58/58 pass (hoặc nhiều hơn nếu thêm test).
- `node --test test/swipe-core.test.mjs`: 10/10 pass.
- Test mới cho sync/proxy và data contract pass; test data contract bắt được fixture xấu.
- Index: 40+ luật, 187 câu, 14 chương; không lỗi JSON; đặc thù vẫn 8 câu; quiz thường không lẫn.
- Desktop 1440×900: không cắt tab/chip; game desktop không còn chữ “vuốt”; mobile 390×844 vẫn đúng bản điện thoại, không tràn ngang.
- Sync: khi account server tắt, UI báo chưa đồng bộ + retry; khi bật, lưu và `lyt_syncAt` cập nhật.
- Báo cáo cuối: file thay đổi, command đã chạy, kết quả, phần chưa kiểm; không tuyên bố “đã kiểm tra toàn bộ pháp lý” nếu chưa làm.

### Cách trả lời

Trả lời tiếng Việt, ngắn gọn, nêu kết quả trước; mỗi phase báo một dòng trạng thái. Không kể lể quá trình, không lặp lại yêu cầu. Nếu gặp mâu thuẫn hoặc thiếu nguồn pháp lý, dừng đúng chỗ và nêu điều kiện để tiếp tục.
