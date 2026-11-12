# Kiểm thử API và contract testing

Kiểm dịch vụ qua giao diện HTTP, giả lập dịch vụ chưa sẵn sàng bằng mock, và dùng contract testing để hai bên không lệch nhau khi một bên đổi.

Bài trình chiếu đầy đủ nằm trong mục slide của bài này. Bài tập ở cuối trang.

## Nhìn bằng hình

*Hình vẽ gốc, dùng để minh họa thứ tự các bước chính của bài.*

## Dịch vụ đặt hàng chờ dịch vụ kho

Nhóm bạn làm dịch vụ đặt hàng. Dịch vụ kho do nhóm khác làm và chưa xong. Bạn vẫn muốn kiểm luồng đặt hàng. Làm thế nào, và làm sao biết khi nhóm kho đổi kiểu dữ liệu thì dịch vụ của bạn sẽ hỏng?

*Kiến thức chung, viết lại bằng lời của người soạn bài.*

## API là gì khi kiểm thử

- **API** (giao diện lập trình ứng dụng): cách hai phần mềm trao đổi dữ liệu, thường qua yêu cầu HTTP.
- Mỗi yêu cầu có phương thức (GET, POST), đường dẫn, và nội dung. Mỗi phản hồi có mã trạng thái và dữ liệu.
- Kiểm API là gửi yêu cầu và kiểm mã trạng thái, cấu trúc dữ liệu, và giá trị trả về.

*Kiến thức chung, viết lại bằng lời của người soạn bài.*

## Mock server: thay dịch vụ chưa có

**Mock server** là một máy chủ giả, trả về phản hồi đã định sẵn. Dùng khi bên kia chưa sẵn sàng. Rủi ro: mock trả về dữ liệu đẹp hơn thật, nên luồng vẫn pass dù thật sự hỏng. Mỗi mock cần ghi rõ nó giả định điều gì.

*Kiến thức chung, viết lại bằng lời của người soạn bài.*

**Thuật ngữ trong slide này:** **Mock server**: Máy chủ giả trả về phản hồi định sẵn, dùng khi dịch vụ thật chưa sẵn sàng.

## Hợp đồng giữa hai bên

- **Contract testing** kiểm rằng bên tiêu thụ (consumer) và bên cung cấp (provider) vẫn đồng ý về giao diện: trường nào, kiểu gì, bắt buộc hay không.
- Bên tiêu thụ viết một mô tả về điều nó cần. Bên cung cấp chạy lại mô tả đó trên bản mới của mình.
- Nếu bên cung cấp đổi "gia" từ số sang chuỗi, contract test báo lỗi trước khi phát hành.

*Kiến thức chung, viết lại bằng lời của người soạn bài.*

**Thuật ngữ trong slide này:** **Contract testing**: Kiểm rằng hai bên của một giao diện vẫn thống nhất về trường và kiểu dữ liệu. · **Consumer và provider**: Consumer là bên tiêu thụ dữ liệu; provider là bên cung cấp dữ liệu qua giao diện.

## Một lần đổi kiểu dữ liệu

```
Consumer mong đợi: { "gia": số }
Provider bản mới trả: { "gia": "120000" }
Kết quả: contract test ĐỎ, dù luồng tích hợp chưa chạy tới đó
Sửa: provider giữ số, hoặc hai bên thống nhất đổi và cập nhật hợp đồng
```

**Thuật ngữ trong slide này:** **Consumer và provider**: Consumer là bên tiêu thụ dữ liệu; provider là bên cung cấp dữ liệu qua giao diện.

## Contract không thay được kiểm tra đầu cuối

- Contract chỉ kiểm cấu trúc và kiểu dữ liệu, không kiểm logic nghiệp vụ hay trạng thái cơ sở dữ liệu.
- Không thay thế kiểm E2E cho luồng quan trọng.
- Cần cập nhật contract khi nghiệp vụ thay đổi, không để nó cũ.

*Kiến thức chung, viết lại bằng lời của người soạn bài.*

## Viết contract cho một API

API lấy thông tin sản phẩm trả về mã, tên (chuỗi), giá (số), còn hàng (đúng/sai). Hãy viết contract ngắn gọn cho bên tiêu thụ, và liệt kê ba thay đổi ở bên cung cấp sẽ làm contract đỏ.

## Đếm lệch kiểu

Với contract gồm n trường, có bao nhiêu trường mà kiểu thực tế không khớp kiểu mong đợi? Hãy viết cách đếm bằng từng bước.

## Sai ở đâu, và sửa thế nào

## Giải thích chi tiết

**API**

**Mock server**

## Giải thích chi tiết

**Contract testing**

**Consumer và provider**

## Test toàn bộ app: trang hướng dẫn từng bước

Mở [trang hướng dẫn test](huong-dan-test.html). Trợ giảng khoanh từng chỗ trong app, giải thích lý thuyết, kỹ thuật và thuật ngữ tiếng Anh của từng bước, rồi làm mẫu để bạn xem.
