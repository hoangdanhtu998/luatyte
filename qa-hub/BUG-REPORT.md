# Báo cáo lỗi – QA Hub (kiểm thử thăm dò)

- Môi trường: local, `http://127.0.0.1:3000`, APP_ENV = QA
- Phiên bản build: 1.0.0
- Phạm vi: API `/api/testcases`, `/api/bugs`, `/api/summary`, `/api/stlc`, body/Content-Type; lớp validate
- Trình duyệt: không áp dụng (kiểm tra qua HTTP trực tiếp)

---

## BUG-01 – Độ dài tiêu đề tính sai với ký tự ngoài BMP (emoji)

| Trường | Nội dung |
|---|---|
| Module | Test case (validate) và Module |
| Mức độ (Severity) | Minor |
| Ưu tiên sửa (Priority) | Medium |
| Điều kiện tiên quyết | App đang chạy |
| Các bước tái hiện | 1. `POST /api/testcases` với `title` = 150 emoji `😀` (150 ký tự, 300 đơn vị UTF-16)<br>2. Quan sát phản hồi |
| Kết quả mong đợi | HTTP 201. Tiêu đề 150 ký tự nằm trong giới hạn 200 |
| Kết quả thực tế | HTTP 400: `"Tiêu đề tối đa 200 ký tự"`. Tương tự, `module` gồm 40 emoji bị từ chối (giới hạn 50) |
| Nguyên nhân dự đoán | `validate.js` dùng `String.length` (đếm đơn vị UTF-16), không đếm code point |
| Bằng chứng | Phản hồi 400 ở bước 2 |

## BUG-02 – PATCH test case nhận cả `status` và `result` nhưng bỏ qua `status`

| Trường | Nội dung |
|---|---|
| Module | API test case (`PATCH /api/testcases/:id`) |
| Mức độ | Major |
| Ưu tiên sửa | High |
| Điều kiện tiên quyết | Có test case ở trạng thái `draft` |
| Các bước tái hiện | 1. Tạo test case, trạng thái mặc định `draft`<br>2. `PATCH /api/testcases/TC-xxx` với body `{"status":"ready","result":"pass"}`<br>3. Gọi `GET /api/testcases?q=TC-xxx` |
| Kết quả mong đợi | Hoặc cập nhật cả hai trường, hoặc trả 400 vì body mơ hồ. Không được trả 200 rồi bỏ qua một phần |
| Kết quả thực tế | HTTP 200, `result` = `pass` nhưng `status` vẫn là `draft`. Không có cảnh báo nào. Gửi riêng `{"status":"ready"}` thì cập nhật đúng |
| Nguyên nhân dự đoán | `updateTestCase` trong `server.js`: nhánh `if (body.result !== undefined)` return sớm, không xử lý `status` |

## BUG-03 – Body quá lớn: client có thể nhận ECONNRESET thay vì phản hồi 413

| Trường | Nội dung |
|---|---|
| Module | Server, đọc body (`readJsonBody`) |
| Mức độ | Minor |
| Ưu tiên sửa | Low |
| Các bước tái hiện | 1. Gửi `POST /api/testcases` với body 200 KB, `Content-Type: application/json`<br>2. Lặp lại vài lần liên tiếp trên cùng một kết nối keep-alive |
| Kết quả mong đợi | Luôn nhận HTTP 413 với JSON lỗi rõ ràng |
| Kết quả thực tế | Lần đầu nhận 413 đúng. Ở lần thử thứ hai, client báo `ECONNRESET`, không nhận được phản hồi. Các request sau vẫn bình thường (health trả 200) |
| Nguyên nhân dự đoán | Server trả 413 khi đã đọc một phần body, không drain hoặc đóng kết nối đúng cách |
| Ghi chú | Tái hiện không ổn định (1/2 lần). Cần thêm lần chạy để xác nhận |

## BUG-04 – Giai đoạn "Lập kế hoạch kiểm thử" luôn hiển thị Đạt

| Trường | Nội dung |
|---|---|
| Module | Tổng kết STLC (`lib/summary.js`, `buildStlc`) |
| Mức độ | Minor (báo cáo sai) |
| Ưu tiên sửa | Medium |
| Các bước tái hiện | 1. Xoá hoặc đổi tên `data/plan.json` rồi khởi động lại server<br>2. `GET /api/stlc` |
| Kết quả mong đợi | Giai đoạn 2 không còn `pass` khi không có kế hoạch |
| Kết quả thực tế | Trạng thái hard-code `'pass'` (dòng 135), không kiểm tra dữ liệu kế hoạch |
| Ghi chú | Đã xác nhận bằng đọc mã và `GET /api/stlc`. Chưa thử xoá file plan thực tế |

## BUG-05 – Body rỗng không kèm Content-Type trả 415 thay vì 400 (cần xác nhận)

| Trường | Nội dung |
|---|---|
| Module | Server, kiểm tra Content-Type |
| Mức độ | Trivial |
| Ưu tiên sửa | Low |
| Các bước tái hiện | `POST /api/testcases` không có body và không có header Content-Type |
| Kết quả thực tế | HTTP 415 `"Content-Type phải là application/json"` |
| Ghi chú | Có thể là hành vi chấp nhận được. Cần thống nhất quy ước với nhóm trước khi coi là lỗi |

---

## Các ca đã kiểm tra và đạt (không phải lỗi)

- Tiêu đề 201 ký tự bị từ chối; tiêu đề chỉ có khoảng trắng bị từ chối
- Tìm kiếm không phân biệt hoa thường (`q=XSS` tìm được `TC-010`)
- Lọc `priority=high` chỉ trả về ưu tiên high
- Bug mới `new` không thể chuyển thẳng sang `closed` (409)
- `/api/health` trả `status: "ok"`
- Content-Type `text/plain` bị từ chối (415)
- Body là mảng, body `null` trả 400
- Body 200 KB trả 413 ở lần đầu

## Khoảng trống chức năng (không phải lỗi, ghi nhận)

- Giao diện chưa có ô để gán người xử lý cho bug đã tạo; chỉ gán được qua API `PATCH /api/bugs/:id` với trường `assignee`.
