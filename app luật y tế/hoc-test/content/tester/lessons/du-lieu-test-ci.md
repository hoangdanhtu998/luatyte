# Dữ liệu test, CI và kiểm thử của test

Vì sao test chạy đỏ rồi xanh khi chạy lại; cách cách ly và dọn dữ liệu; và kiểm thử của test bằng mutation testing, cùng ý tưởng chaos engineering.

Bài trình chiếu đầy đủ nằm trong mục slide của bài này. Bài tập ở cuối trang.

## Nhìn bằng hình

*Hình vẽ gốc, dùng để minh họa thứ tự các bước chính của bài.*

## Test lúc đỏ lúc xanh

Một ca đăng ký chạy đỏ, bạn chạy lại thì xanh, không ai đổi code. Nguyên nhân thường nằm ở dữ liệu dùng chung giữa các lần chạy, hoặc môi trường không sạch.

*Kiến thức chung, viết lại bằng lời của người soạn bài.*

## Mỗi lần chạy có dữ liệu riêng

- Mỗi ca tạo dữ liệu có mã duy nhất, như email gắn thời gian hoặc số ngẫu nhiên.
- Mỗi lần chạy CI có không gian dữ liệu riêng, nên hai lần chạy song song không đụng nhau.
- Dọn dữ liệu sau khi xong, hoặc chạy trong một giao dịch (transaction) rồi hủy (rollback).

*Kiến thức chung, viết lại bằng lời của người soạn bài.*

**Thuật ngữ trong slide này:** **Rollback**: Hủy các thay đổi đã làm trong một giao dịch, đưa dữ liệu về trạng thái ban đầu.

## Che dữ liệu nhạy cảm trước

- Không đưa dữ liệu thật của khách vào môi trường test. Nếu cần, che (mask) hoặc tạo dữ liệu giả (synthetic).
- Che dữ liệu là một bước riêng, chạy trước khi nạp vào môi trường test.
- Kiểm seed (dữ liệu nạp ban đầu) trước khi test chạy: đúng schema, khóa ngoại không bị thiếu.

*Kiến thức chung, viết lại bằng lời của người soạn bài.*

## Môi trường tái tạo được

Dùng cấu hình như mã (infrastructure as code), ví dụ Docker Compose, để ai cũng dựng được cùng một môi trường. Môi trường dùng chung lâu ngày thường bị trôi (drift): ai đó đổi một thứ mà không ghi lại.

*Kiến thức chung, viết lại bằng lời của người soạn bài.*

## Mutation testing: test có đủ mạnh không

- Công cụ cố ý sửa code một chỗ, như đảo điều kiện hoặc xóa một câu lệnh. Mỗi bản sửa gọi là một **mutant**.
- Chạy bộ test. Nếu test bắt được (ít nhất một ca đỏ), mutant bị **diệt** (killed). Nếu mọi ca vẫn xanh, mutant còn sống (survived), tức test còn yếu.
- **Mutation score** = số mutant bị diệt chia tổng số mutant, nhân 100.

*Kiến thức chung, viết lại bằng lời của người soạn bài.*

**Thuật ngữ trong slide này:** **Mutant**: Một bản code đã bị sửa có chủ đích, để xem test có phát hiện được không. · **Mutation score**: Tỉ lệ mutant bị test bắt được, tính bằng số diệt chia tổng số mutant nhân 100.

## Chaos engineering: gây lỗi có kiểm soát

- Cố ý làm hỏng một phần: tăng độ trễ, tắt một dịch vụ, cạn bộ nhớ.
- Bắt đầu nhỏ: một thành phần, một khoảng thời gian ngắn.
- Giới hạn **phạm vi ảnh hưởng** (blast radius) để lỗi không làm hại người dùng thật.

*Kiến thức chung, viết lại bằng lời của người soạn bài.*

## Thiết kế cách cách ly dữ liệu

Một bộ test tạo đơn hàng dùng chung tài khoản "test01". Hãy đề xuất hai cách để mỗi lần chạy có dữ liệu riêng, và nêu một rủi ro của mỗi cách.

## Tính mutation score

Có 10 mutant, test diệt được 8. Mutation score là bao nhiêu? Nếu score thấp, nên làm gì trước: thêm ca test hay sửa mutant?

**Thuật ngữ trong slide này:** **Mutant**: Một bản code đã bị sửa có chủ đích, để xem test có phát hiện được không. · **Mutation score**: Tỉ lệ mutant bị test bắt được, tính bằng số diệt chia tổng số mutant nhân 100.

## Sai ở đâu, và sửa thế nào

**Thuật ngữ trong slide này:** **Mutation score**: Tỉ lệ mutant bị test bắt được, tính bằng số diệt chia tổng số mutant nhân 100.

## Giải thích chi tiết

**Cách ly dữ liệu (test isolation)**

**Rollback**

## Giải thích chi tiết

**Mutant**

**Mutation score**

## Giải thích chi tiết

**Chaos engineering**

