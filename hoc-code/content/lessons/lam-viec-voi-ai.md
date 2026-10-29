# Làm việc với AI

## Mục tiêu
- Phân biệt ba kiểu lập trình với AI
- Biết khi nào để AI làm copilot và khi nào để AI làm pilot
- Biết quy trình giao việc cho AI và cách kiểm tra kết quả

## Ý chính 1: Ba kiểu lập trình với AI
- **AI coding:** dùng AI để viết code, nhưng bạn vẫn hiểu và kiểm soát từng dòng.
- **Vibe coding:** ra lệnh cho AI rồi tin gần như toàn bộ kết quả, không đọc kỹ.
- **Agentic coding:** AI tự làm nhiều bước, tự chạy thử và sửa lỗi theo kết quả test.

## Ý chính 2: Hai vai trò của AI
- **Copilot:** AI phụ bạn, bạn lái. Dùng khi việc phức tạp hoặc bạn đang học.
- **Pilot:** AI tự lái, bạn giao việc và kiểm tra kết quả. Dùng khi việc nhỏ, rõ ràng.

## Ý chính 3: Quy trình giao việc
- Viết **mô tả việc cần làm** trước (file `docs/specs.md`), để AI biết đích đến.
- Chia thành **danh sách việc nhỏ** (file `docs/todo.md`).
- Viết một file hướng dẫn cho AI (`AGENTS.md` hoặc `CLAUDE.md`) để nó nhớ quy tắc của dự án.

## Ý chính 4: Thói quen tốt khi dùng AI
- Giao việc nhỏ, làm từng phần một.
- **Đọc lại code AI viết.** Không hiểu thì hỏi lại trước khi chấp nhận.
- Ghi lại lịch sử câu lệnh (prompt) đã dùng.

## Ý chính 5: Kiểm thử và an toàn
- Viết test để biết code đúng hay sai. Bài tập trên trang này đều có test.
- Không để mật khẩu hay API key trong code.
- Kiểm tra dữ liệu người dùng nhập vào và các thư viện bên ngoài.

## Ví dụ
AI viết hàm tính tổng `1 + 2 + ... + n` nhưng vòng lặp chạy đến `n - 1`. Nếu chỉ nhìn qua mà không thử, bạn sẽ bỏ lỡ lỗi. Cách làm đúng: đọc từng dòng, chạy với `n = 5` (phải ra 15), rồi sửa.

## Lỗi hay gặp
- Chấp nhận code vì nó "chạy được" mà không hiểu vì sao.
- Giao một việc quá lớn, rồi không biết lỗi nằm ở đâu.

## Tự kiểm tra
1. Vibe coding khác AI coding ở điểm nào?
2. Khi nào nên để AI làm pilot?
3. Vì sao phải đọc lại code AI viết?
