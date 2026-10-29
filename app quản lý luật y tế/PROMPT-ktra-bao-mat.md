Kiểm tra bảo mật trang quản lý luật y tế đang chạy tại http://localhost:3200.

## BƯỚC 1: Đọc skill hướng dẫn
Đọc hai file sau và dùng chế độ guidance mode (không chạy full audit, không tạo file báo cáo):
- C:\Users\SK\AppData\Roaming\CindyGlobal\owners\66e3b7b212ea4fe5cae3\bots\cindy-default\skills\cloudflare-security-audit\SKILL.md
- C:\Users\SK\AppData\Roaming\CindyGlobal\owners\66e3b7b212ea4fe5cae3\bots\cindy-default\skills\security-audit\SKILL.md

## BƯỚC 2: Đọc báo cáo trước
Đọc file markdown mới nhất trong:
C:\Users\SK\Documents\Luật y tế\app quản lý luật y tế\data\security-reports\

Tên file: security-YYYY-MM-DDTHH-mm-ss-sssZ.md
Ghi nhận các mục ĐẠT (✓) và CHƯA ĐẠT (✗) để so sánh.

## BƯỚC 3: Kiểm tra thực tế (chỉ đọc, không sửa mã)

### 3a. Security headers — 4 mục còn thiếu (ưu tiên cao)
curl -sI http://localhost:3200/
Kiểm tra 4 header sau có mặt với giá trị đúng không:
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY hoặc SAMEORIGIN
- Content-Security-Policy: (có giá trị, không rỗng)
- Referrer-Policy: no-referrer|same-origin|strict-origin-when-cross-origin

Nếu báo cáo cũ đã test và ĐẠT → bỏ qua. Nếu CHƯA ĐẠT hoặc chưa test → ghi rõ header nào còn thiếu.

### 3b. Authentication — route admin chặn khi chưa đăng nhập
(Chỉ test route MỚI so với báo cáo cũ; bỏ qua route đã test và ĐẠT)
- GET http://localhost:3200/api/admin/users (không cookie) → 401
- GET http://localhost:3200/api/admin/overview (không cookie) → 401
- GET http://localhost:3200/api/admin/audit-logs (không cookie) → 401

### 3c. CSRF protection
Code hiện tại có kiểm tra X-CSRF-Token cho write requests khi đã có session hợp lệ.
- Request POST đến admin route mà không có session → 401 (chưa auth, CSRF chưa được kiểm)
- Request POST đến admin route có session hợp lệ nhưng thiếu/sai X-CSRF-Token → 403 CSRF_INVALID

Nếu DB local chưa có user admin để test: ghi "Bỏ qua — cần user admin có session hợp lệ để test CSRF thực tế"

### 3d. CORS — từ chối origin lạ
curl -s -D- -o /dev/null -X GET http://localhost:3200/api/admin/users \
  -H "Origin: http://evil.example.com"
→ Phải trả 401 và KHÔNG có header Access-Control-Allow-Origin trong response.

### 3e. Cookie an toàn
Kiểm tra set-cookie trong response đăng nhập thành công:
- HttpOnly: có mặt
- SameSite: Lax hoặc Strict (không được None)
- Path: /
- Max-Age: có (không phải session cookie)

Nếu chưa đăng nhập được: bỏ qua và ghi chú.

### 3f. Error handling — không lộ stack trace
curl -s http://localhost:3200/api/nonexistent-route-xyz
→ Response chỉ có {"error":{"code":"...","message":"..."}}.
Không có trường "stack", "trace", "at ", hoặc đường dẫn file.

### 3g. Rate limiting — kiểm tra config vs thực tế
⚠️ Mục này báo cáo cũ chưa test.

Code hiện tại trong app.mjs:
- ipLimiter: max 5, windowMs 15 phút
- emailLimiter: max 3, windowMs 15 phút
- Comment nói: "IP tối đa 5 lần sai, email tối đa 3 lần sai"

Kiểm tra thực tế:
1. Gửi 6 request đăng nhập sai với CÙNG email (kiểm tra email limiter):
   for i in 1 2 3 4 5 6; do
     curl -s -w "Request $i: %{http_code}\n" -X POST http://localhost:3200/api/auth/login \
       -H "Content-Type: application/json" \
       -d '{"email":"rate-limit-check@example.com","password":"wrongpass123"}'
   done

2. Gửi 7 request đăng nhập sai với KHÁC email, cùng IP (kiểm tra IP limiter):
   for i in 1 2 3 4 5 6 7; do
     curl -s -w "Request $i: %{http_code}\n" -X POST http://localhost:3200/api/auth/login \
       -H "Content-Type: application/json" \
       -d "{\"email\":\"rate-ip-check${i}@example.com\",\"password\":\"wrongpass123\"}"
   done

Phân tích:
- Nếu email limiter chặn sau 3 lần → đúng theo code (max=3)
- Nếu IP limiter chặn sau 5 lần → đúng theo code (max=5)
- Nếu email limiter chặn TRƯỚC IP limiter (sau 3 thay vì 5) → ghi nhận đây là hành vi đúng nhưng comment có thể gây hiểu lầm

## RÀNG BUỘC
- Chỉ đọc và kiểm tra bằng curl. Không sửa mã nguồn. Không ghi vào thư mục dự án.
- Tối đa 30 requests. Không gửi lượng request lớn.
- Không đụng vào dịch vụ bên ngoài localhost.
- Không thử khai thác, không brute-force, không chiếm quyền.
- Nếu bị rate limit trong lúc test, dừng và ghi rõ "Bị rate limit — cần đợi 15 phút hoặc restart server để reset".

## KẾT QUẢ TRẢ VỀ
Mỗi mục kiểm tra:
1. [Tên mục]
   - Lệnh: <curl command exact>
   - Kết quả: <status code, headers, body>
   - Đánh giá: ĐẠT / CHƯA ĐẠT / BỎ QUA (với lý do)

Tóm tắt cuối:
- Tổng: X ĐẠT / Y CHƯA ĐẠT / Z BỎ QUA
- So với báo cáo trước: đã khắc phục / vẫn còn / mới phát hiện
- Nếu có mục CHƯA ĐẠT mới: liệt kê cụ thể

Nếu tất cả ĐẠT và không có thay đổi: "Không có thay đổi bảo mật so với lần trước."
