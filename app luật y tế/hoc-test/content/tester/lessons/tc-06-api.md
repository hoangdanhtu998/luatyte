# Kiểm thử API phía sau giao diện

Form đặt lịch báo lỗi khi bạn nhập tuổi 121. Tốt. Nhưng form chỉ là một trong nhiều cách gửi dữ liệu đến hệ thống. Ứng dụng điện thoại, đối tác tích hợp, hay một người tò mò mở công cụ lập trình của trình duyệt đều có thể gửi yêu cầu thẳng tới API mà không đi qua form.

Nếu việc kiểm tra dữ liệu chỉ nằm ở giao diện, mọi quy tắc bạn vừa kiểm ở bài 3 đều có thể bị vượt qua. Tester có kinh nghiệm luôn hỏi: quy tắc này được kiểm ở đâu, giao diện hay máy chủ?

## Sau bài này bạn làm được gì

- Đọc một bảng mô tả API và rút ra ca kiểm thử.
- Gửi yêu cầu, đọc mã trạng thái và thân phản hồi.
- Thiết kế ca dữ liệu sai gửi thẳng vào API.
- Kiểm quyền xem và sửa dữ liệu qua API.

## API của Sao Mai

Mô tả đầy đủ nằm ở [tài liệu yêu cầu, mục 4](lab/yeu-cau.html). Tóm tắt:

| Yêu cầu | Việc nó làm |
|---|---|
| `GET /slots?doctor=…&date=…` | Xem các khung giờ của một bác sĩ trong một ngày |
| `POST /appointments` | Tạo lịch mới từ thân JSON |
| `GET /appointments/{mã}?phone=…` | Xem một lịch |
| `DELETE /appointments/{mã}?phone=…` | Hủy một lịch |

**Về app tập:** API ở đây là bản mô phỏng chạy trong trình duyệt để khóa học dùng được mà không cần cài máy chủ. Bạn gửi yêu cầu ở mục **API** của [app tập](lab/index.html). Cách nghĩ và cách thiết kế ca giống hệt khi làm với API thật. Trên dự án thật, bạn gửi yêu cầu bằng công cụ như Postman, curl hoặc bằng mã kiểm thử, và có thêm những thứ bản mô phỏng không có: tiêu đề yêu cầu, xác thực, độ trễ mạng.

## Mã trạng thái cần thuộc

| Mã | Nghĩa | Ở Sao Mai |
|---|---|---|
| 200 | Thành công | Xem lịch, xem khung giờ, hủy lịch |
| 201 | Đã tạo mới | Tạo lịch thành công |
| 400 | Yêu cầu sai | Dữ liệu vi phạm R1 đến R5, thiếu tham số |
| 404 | Không tìm thấy | Sai mã lịch hoặc sai số điện thoại |
| 405 | Phương thức không được phép | Ví dụ `PUT` lên `/slots` |
| 409 | Xung đột với trạng thái hiện tại | Khung giờ đã đủ, lịch không hủy được |

Mã trạng thái là một phần của hợp đồng giữa API và bên gọi. Bên gọi viết code dựa vào mã đó. API trả 200 cho một việc thất bại thì bên gọi sẽ tưởng là thành công.

## Bốn nhóm ca cho mỗi đường dẫn

### 1. Ca hợp lệ

Gửi yêu cầu đúng, kiểm mã trạng thái **và** nội dung phản hồi. Với `POST`, kiểm thêm là lịch đã thực sự được tạo: gọi `GET` với mã vừa nhận, hoặc xem ở màn Quản trị.

### 2. Ca dữ liệu sai

Đây là nhóm quan trọng nhất. Lấy lại các ca không hợp lệ của bài 3 và gửi thẳng vào `POST /appointments`:

- Tuổi âm, tuổi 121, tuổi là chữ.
- Thiếu hẳn trường `phone`. Trường `name` là chuỗi rỗng.
- Ngày là Chủ nhật. Ngày hôm qua. Giờ `12:00`.
- Bác sĩ không tồn tại.
- Thân yêu cầu không phải JSON hợp lệ.

Mong đợi: `400`, và **không có lịch nào được tạo**. Luôn kiểm vế thứ hai.

### 3. Ca về quyền

API trả dữ liệu cá nhân, nên phải hỏi: ai được xem cái gì?

- Xem lịch `SM-100001` với số điện thoại của người khác.
- Hủy lịch `SM-100001` với số điện thoại của người khác.
- Xem lịch mà không gửi tham số `phone`.

Mong đợi: `404` trong cả ba trường hợp. Trả `404` thay cho "sai số điện thoại" để người dò không biết mã lịch đó có tồn tại hay không.

### 4. Ca về trạng thái và tài nguyên không tồn tại

- Hủy một mã lịch không tồn tại.
- Hủy một lịch đã ở trạng thái Đã khám.
- Hủy một lịch hai lần liên tiếp.
- Tạo lịch vào khung giờ đã đủ 3 lịch.
- Gửi phương thức không được hỗ trợ.

## Chuẩn bị dữ liệu cho ca API

Mỗi ca nên tự đứng được. Ca "khung giờ đã đủ trả 409" cần một khung đã có 3 lịch. Đừng dựa vào dữ liệu do ca trước để lại. Cách làm: bấm **Đặt lại dữ liệu mẫu**, rồi tự tạo đủ số lịch cần thiết ngay đầu ca.

Dữ liệu mẫu có sẵn 5 lịch với mã từ `SM-100001` đến `SM-100005`. Số điện thoại tương ứng ghi trong tài liệu yêu cầu, mục 5.

## Việc cần làm

1. Mở [sổ tay](lab/so-tay.html), mục Bài 6. Lập bảng ca cho bốn đường dẫn, đủ bốn nhóm.
2. Mở [app tập bản 1.0](lab/index.html), vào mục **API**. Đặt lại dữ liệu mẫu.
3. Chạy từng ca. Ghi mã trạng thái thực tế. Sau mỗi `POST` và `DELETE`, kiểm lại dữ liệu ở màn Quản trị (mã PIN trong tài liệu yêu cầu).
4. Ghi lỗi tìm được vào **Sổ lỗi**.
5. Tự chấm, so với bài mẫu.

## Sai lầm hay gặp

- **Chỉ nhìn mã trạng thái.** API trả `400` nhưng vẫn lặng lẽ tạo lịch là lỗi nặng, và bạn chỉ thấy nếu kiểm lại dữ liệu.
- **Chỉ kiểm ca hợp lệ.** Ca hợp lệ thì giao diện đã kiểm giúp rồi.
- **Tin rằng "giao diện chặn rồi".** Giao diện là lớp tiện lợi cho người dùng. Lớp bảo vệ phải nằm ở máy chủ.
- **Dùng lại dữ liệu bẩn.** Ca sau không đạt vì ca trước đã làm đầy khung giờ.

## Thuật ngữ

**API**: giao diện để chương trình này gọi chương trình khác. · **Mã trạng thái (status code)**: số ba chữ số cho biết kết quả xử lý một yêu cầu HTTP. · **Thân yêu cầu (request body)**: dữ liệu gửi kèm yêu cầu, ở đây là JSON. · **Kiểm thử phủ định (negative testing)**: kiểm cách hệ thống xử lý dữ liệu và thao tác không hợp lệ.

## Test toàn bộ app: trang hướng dẫn từng bước

Mở [trang hướng dẫn test](huong-dan-test.html). Trợ giảng khoanh từng chỗ trong app, giải thích lý thuyết, kỹ thuật và thuật ngữ tiếng Anh của từng bước, rồi làm mẫu để bạn xem.
