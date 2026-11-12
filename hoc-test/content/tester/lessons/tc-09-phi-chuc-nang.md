# Bảo mật cơ bản, khả năng truy cập và màn hình nhỏ

Mọi ca bạn chạy đến giờ đều hỏi: app có làm đúng việc không? Còn một nhóm câu hỏi khác: app có an toàn không, người khiếm thị có dùng được không, trên điện thoại có bấm được không. Tài liệu yêu cầu của Sao Mai gọi đó là N1, N2, N3, cùng với quy định khóa đăng nhập ở R11.

Một tester chức năng không cần là chuyên gia bảo mật hay chuyên gia về khả năng truy cập. Nhưng người có kinh nghiệm luôn chạy một lượt kiểm nhanh các mặt này, vì phần lớn lỗi phổ biến lộ ra chỉ sau vài phút thử đúng cách.

## Sau bài này bạn làm được gì

- Kiểm nhanh việc dữ liệu người dùng nhập có bị hiểu thành mã hay không.
- Kiểm cơ chế chống dò mật khẩu.
- Kiểm nhãn ô nhập và việc dùng bằng bàn phím.
- Kiểm giao diện ở màn hình 375px bằng công cụ của trình duyệt.
- Biết lúc nào cần gọi chuyên gia.

## Dữ liệu nhập phải hiển thị thành chữ thuần (N1)

Ô họ tên nhận chữ. Nhưng điều gì xảy ra nếu ai đó nhập vào đó một đoạn mã HTML? Nếu ứng dụng chèn nguyên chuỗi đó vào trang mà không mã hóa, trình duyệt sẽ hiểu nó là mã. Đây là gốc của nhóm lỗi chèn mã phía trình duyệt (cross-site scripting, XSS): kẻ xấu nhập mã vào một ô, mã đó chạy trên máy người khác khi họ mở trang. Với Sao Mai, "người khác" là nhân viên quản trị đang đăng nhập.

Cách kiểm an toàn, không cần chạy mã thật:

1. Đặt lịch với họ tên là `<h1>Hoa</h1>` hoặc `<b>Hoa</b>`.
2. Tìm **mọi nơi** tên đó được hiển thị: phiếu sau khi đặt, màn Tra cứu, bảng Quản trị.
3. Ở mỗi nơi, xem bạn thấy gì:
   - Thấy nguyên chuỗi `<h1>Hoa</h1>` → đúng, dữ liệu được hiển thị thành chữ thuần.
   - Thấy chữ Hoa to lên hoặc đậm lên → sai, dữ liệu đã bị hiểu thành HTML.

Thẻ định dạng vô hại là đủ để chứng minh lỗi. Bạn không cần, và không nên, thử mã chạy được trên hệ thống mà bạn không được phép kiểm thử bảo mật.

**Về app tập:** để an toàn cho người học, app tập đã chặn việc chạy mã ở chỗ có lỗi này. Bạn vẫn quan sát được dấu hiệu qua thẻ định dạng. Khi báo lỗi, hãy ghi mức Cao và giải thích rằng trên hệ thống thật, chỗ hiển thị thiếu mã hóa thường dẫn tới XSS lưu trữ.

Điểm cần nhớ: một nơi hiển thị đúng không nói gì về nơi khác. Mỗi màn hình có thể do một người viết, theo một cách khác nhau.

## Chống dò mã PIN (R11)

R11 nói: sai 5 lần liên tiếp thì khóa đăng nhập 1 phút. Các ca cần chạy:

| Ca | Mong đợi |
|---|---|
| Sai 4 lần, lần thứ 5 đúng | Đăng nhập được |
| Sai 5 lần, lần thứ 6 đúng (trong vòng 1 phút) | Bị từ chối, có thông báo đang khóa |
| Sai 5 lần, chờ hơn 1 phút, nhập đúng | Đăng nhập được |
| Sai 3 lần, đúng 1 lần, đăng xuất, sai 3 lần | Chưa bị khóa, vì bộ đếm phải về 0 sau lần đúng |

Dòng cuối là thứ người mới hay quên: bộ đếm có được đặt lại đúng lúc không?

## Nhãn ô nhập và bàn phím (N2)

Người dùng trình đọc màn hình không nhìn thấy chữ gợi ý mờ trong ô. Họ nghe tên của ô. Tên đó đến từ nhãn được gắn với ô bằng mã. Bộ hướng dẫn WCAG của W3C yêu cầu mỗi ô nhập có nhãn hoặc chỉ dẫn, và tên của ô phải được chương trình xác định được.

Ba cách kiểm, từ nhanh đến kỹ:

1. **Bấm vào chữ nhãn.** Nếu nhãn được gắn đúng, con trỏ nhảy vào ô. Ô nào không có chữ nhãn để bấm, chỉ có chữ mờ bên trong, là ô đáng nghi.
2. **Xem tên của ô trong DevTools.** Bấm F12, chọn ô nhập ở tab Elements, mở tab Accessibility. Mục Name phải có nội dung.
3. **Dùng trình đọc màn hình thật** (NVDA trên Windows, VoiceOver trên máy Apple). Đây là cách chắc nhất, cần thời gian làm quen.

Kiểm bàn phím: bỏ chuột ra. Dùng Tab để đi qua toàn bộ form, Shift + Tab để đi lùi, Enter để gửi. Bạn phải luôn thấy ô nào đang được chọn (viền focus), thứ tự đi phải hợp lý, và không bị kẹt ở đâu.

## Màn hình nhỏ (N3)

Người bệnh đặt lịch bằng điện thoại. Kiểm nhanh không cần điện thoại thật:

1. Bấm F12, bật chế độ thiết bị (biểu tượng điện thoại, hoặc Ctrl + Shift + M).
2. Đặt chiều rộng 375px.
3. Mở **từng màn**: Đặt lịch, Tra cứu, Quản trị, API.
4. Ở mỗi màn, tự hỏi: có nội dung nào bị cắt không? Có nút nào không bấm tới được không? Trang có bị cuộn ngang không? Bảng rộng có cuộn được bên trong nó không?

Màn dành cho nhân viên (Quản trị) hay bị bỏ quên khi làm giao diện điện thoại. Kiểm nó kỹ hơn các màn khác.

Chế độ thiết bị của trình duyệt chỉ mô phỏng kích thước. Nó không thay được việc thử trên điện thoại thật trước khi phát hành. Ghi điều này vào mục "chưa kiểm" nếu bạn chưa làm.

## Khi nào gọi chuyên gia

Lượt kiểm nhanh này bắt được lỗi phổ biến. Nó không chứng minh hệ thống an toàn hay đạt chuẩn truy cập. Trong báo cáo, hãy viết đúng mức: "đã kiểm nhanh N1, N2, N3 theo danh sách sau", không viết "đã kiểm thử bảo mật". Với hệ thống giữ dữ liệu sức khỏe, đề nghị một đợt đánh giá bảo mật do người có chuyên môn thực hiện là khuyến nghị hợp lý.

## Việc cần làm

1. Mở [sổ tay](lab/so-tay.html), mục Bài 9. Dùng khung mẫu năm dòng.
2. Mở [app tập bản 1.0](lab/index.html), đặt lại dữ liệu mẫu. Chạy lần lượt năm mục kiểm.
3. Ghi cách bạn kiểm và kết quả. Thêm lỗi vào **Sổ lỗi**.
4. Tự chấm, so với bài mẫu.

## Sai lầm hay gặp

- **Kiểm một nơi hiển thị rồi kết luận.** Lỗi thường nằm ở màn ít người nhìn.
- **Thử mã chạy được trên hệ thống thật khi chưa được phép.** Việc đó có thể vi phạm quy định và pháp luật. Thẻ định dạng là đủ.
- **Chỉ kiểm màn của khách hàng trên điện thoại.**
- **Viết "đã kiểm bảo mật" sau 20 phút thử.**

## Thuật ngữ

**XSS (cross-site scripting)**: lỗi cho phép mã do người dùng nhập được chạy trong trình duyệt của người khác. · **Khả năng truy cập (accessibility)**: mức độ người khuyết tật dùng được sản phẩm. · **WCAG**: bộ hướng dẫn về khả năng truy cập nội dung web của W3C. · **Yêu cầu phi chức năng (non-functional requirement)**: yêu cầu về cách hệ thống hoạt động (an toàn, dễ dùng, nhanh), khác với việc nó làm gì.

## Test toàn bộ app: trang hướng dẫn từng bước

Mở [trang hướng dẫn test](huong-dan-test.html). Trợ giảng khoanh từng chỗ trong app, giải thích lý thuyết, kỹ thuật và thuật ngữ tiếng Anh của từng bước, rồi làm mẫu để bạn xem.
