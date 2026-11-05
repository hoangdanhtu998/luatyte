# Các mức kiểm thử

Kiểm thử đơn vị, tích hợp, hệ thống và chấp nhận. Mỗi mức tìm loại lỗi khác nhau.

Bài trình chiếu đầy đủ nằm trong mục slide của bài này. Bài tập ở cuối trang.

## Nhìn bằng hình

*Hình vẽ gốc, dùng để minh họa thứ tự các bước chính của bài.*

## Kiểm thử đơn vị

Kiểm thử từng hàm, cô lập nó khỏi phần còn lại. Đây là mức rẻ nhất và tìm lỗi nhanh nhất.

Ví dụ: hàm `giam_gia` ở bài trước có thể kiểm riêng, không cần giao diện hay cơ sở dữ liệu.

## Kiểm thử tích hợp

Hai hàm đều đúng riêng, nhưng ghép lại có thể sai. Ví dụ: một hàm trả giá theo đơn vị nghìn đồng, hàm kia lại cộng theo đồng.

Kiểm thử tích hợp tìm các lỗi ở chỗ giao tiếp giữa các phần.

**Thuật ngữ trong slide này:** **Kiểm thử tích hợp (integration testing)**: Kiểm khi hai hay nhiều phần của hệ thống ghép lại, xem dữ liệu có đi qua chỗ nối đúng không.

## Kiểm thử hệ thống và chấp nhận

**Hệ thống**: chạy cả chương trình như người dùng, theo các kịch bản đầy đủ.

**Chấp nhận**: người dùng hoặc khách hàng kiểm tra xem sản phẩm có đáp ứng nhu cầu thật không.

## Hình tháp kiểm thử

```
        /\
       / E2E \        ít, chậm, đắt
      /--------\
     / tích hợp \
    /------------\
   /  đơn vị      \    nhiều, nhanh, rẻ
  /----------------\
```

Nên có nhiều test đơn vị, ít test hệ thống. Test đơn vị chạy trong mili-giây, test hệ thống có thể chạy vài phút.

## Lỗi này thuộc mức nào?

(a) Hàm tính thuế đúng với mọi số, nhưng khi gọi từ màn hình thanh toán lại lấy sai biến.

(b) Trang đăng nhập cho phép đăng nhập với mật khẩu rỗng.

Bạn nghĩ mỗi lỗi thuộc mức nào?

## Kiểm tra đáp án

(a) là lỗi **tích hợp**: từng hàm đúng, ghép với màn hình thì sai. (b) là lỗi **hệ thống** hoặc **chức năng**: cần kịch bản đăng nhập đầy đủ để thấy.

## Tháp kiểm thử

Hình tháp cho thấy nên có nhiều kiểm thử đơn vị ở đáy, ít kiểm thử giao diện ở đỉnh. Lý do: kiểm thử đơn vị nhanh, rẻ, ổn định. Kiểm thử giao diện chậm và dễ vỡ hơn.

```
      /\
     / E2E \        ít, chậm, đắt
    /--------\
   / Tích hợp \     vừa
  /------------\
 / Đơn vị       \   nhiều, nhanh, rẻ
```

*Kiến thức chung, chưa đối chiếu nguồn gốc.*

**Thuật ngữ trong slide này:** **Kiểm thử đơn vị (unit testing)**: Kiểm một phần nhỏ nhất của code, như một hàm, một lớp, tách khỏi phần còn lại. Thường do lập trình viên viết.

## Kiểm thử đơn vị

- Kiểm một hàm hoặc một lớp, không cần cơ sở dữ liệu thật.
- Chạy trong mili giây, chạy được hàng nghìn ca mỗi lần build.
- Dùng khung test như JUnit, pytest, hoặc test bằng C với khung nhỏ tự viết.

*Kiến thức chung, chưa đối chiếu nguồn gốc.*

## Kiểm thử tích hợp

- Kiểm khi hai module nói chuyện: gọi hàm, đọc ghi cơ sở dữ liệu, gọi API.
- Lỗi hay nằm ở giao diện giữa các phần: đơn vị, định dạng, mã lỗi.
- Cần môi trường gần thật, và dữ liệu test được dọn sau mỗi lần chạy.

*Kiến thức chung, chưa đối chiếu nguồn gốc.*

## Kiểm thử hệ thống và chấp nhận

- **Hệ thống**: toàn bộ ứng dụng, kiểm theo yêu cầu, trên môi trường giống thật.
- **Chấp nhận**: khách hàng hoặc người đại diện xác nhận đạt yêu cầu nghiệp vụ.
- Hai loại này thường làm thủ công một phần, vì cần đánh giá của con người.

*Kiến thức chung, chưa đối chiếu nguồn gốc.*

## Một tính năng thanh toán ở bốn mức

| Mức | Kiểm gì |
| --- | --- |
| Đơn vị | Hàm tính tổng tiền có đúng với giảm giá không |
| Tích hợp | Hàm tính tiền có gọi đúng dịch vụ thuế không |
| Hệ thống | Từ giỏ hàng đến trang xác nhận đơn, trên trình duyệt thật |
| Chấp nhận | Kế toán xác nhận số liệu đối soát khớp |

## Lỗi nằm ở mức nào

Lỗi: hàm tính thuế đúng, nhưng dịch vụ đặt hàng gửi số thuế dưới dạng chuỗi có dấu phẩy. Lỗi này nên bắt ở mức nào? Vì sao kiểm thử đơn vị không bắt được?

**Thuật ngữ trong slide này:** **Kiểm thử đơn vị (unit testing)**: Kiểm một phần nhỏ nhất của code, như một hàm, một lớp, tách khỏi phần còn lại. Thường do lập trình viên viết.

## Sai ở đâu, và sửa thế nào

## Giải thích chi tiết

**Kiểm thử đơn vị (unit testing)**

**Kiểm thử tích hợp (integration testing)**

## Giải thích chi tiết

**Kiểm thử E2E (end-to-end)**

**Tháp kiểm thử (test pyramid)**

## Điều cần nhớ

- Mỗi mức kiểm thử tìm một loại lỗi.
- Nên làm nhiều test đơn vị vì rẻ và nhanh.
- Test hệ thống và chấp nhận vẫn cần, để bắt lỗi ở chỗ giao tiếp.

## Mỗi mức kiểm thử bắt một loại lỗi khác

Sai ở mức nào thì nên tìm ở mức đó, vì tìm sai mức làm mất thời gian.

- Đơn vị: sai công thức, sai điều kiện trong một hàm.
- Tích hợp: sai đơn vị giữa hai hàm, sai kiểu dữ liệu truyền qua lại.
- Hệ thống: luồng nghiệp vụ đi qua nhiều phần không khớp yêu cầu.
- Chấp nhận: đúng kỹ thuật nhưng không đáp ứng nhu cầu thật của người dùng.

## Phân loại một lỗi thanh toán

Tình huống: giỏ hàng tính đúng tổng tiền, nhưng khi thanh toán thì phí vận chuyển bị cộng hai lần.

1. Kiểm hàm tính phí vận chuyển riêng: đúng.
2. Kiểm hàm tính tổng giỏ hàng riêng: đúng.
3. Kiểm hai hàm ghép với nhau ở bước thanh toán: sai.
4. Kết luận: lỗi **tích hợp**. Cần sửa chỗ gọi hai hàm, không cần sửa từng hàm.

## Từ nhỏ đến lớn

- **Đơn vị (unit)**: một hàm hoặc một module, kiểm riêng.
- **Tích hợp (integration)**: hai hay nhiều module ghép lại có nói chuyện đúng không.
- **Hệ thống (system)**: toàn bộ ứng dụng, theo yêu cầu.
- **Chấp nhận (acceptance)**: khách hàng hoặc người dùng xác nhận đạt yêu cầu.

*Kiến thức chung, chưa đối chiếu nguồn gốc.*

## Vì sao cần nhiều mức

Lỗi rẻ nhất để sửa là lỗi được phát hiện ở mức nhỏ. Kiểm thử đơn vị nhanh và rẻ, nhưng không thấy được cách các phần ghép lại. Kiểm thử hệ thống chậm hơn, nhưng là nơi thấy được hành vi người dùng thật.

*Kiến thức chung, chưa đối chiếu nguồn gốc.*

**Thuật ngữ trong slide này:** **Kiểm thử đơn vị (unit testing)**: Kiểm một phần nhỏ nhất của code, như một hàm, một lớp, tách khỏi phần còn lại. Thường do lập trình viên viết.

## Đọc thêm: Introduction to Testing

- **Four Hour Tester** (website): tổng quan các loại kiểm thử cho người mới.
- **Whiteboard Testing** (kênh video): giải thích các mức kiểm thử bằng hình vẽ.

Nguồn: github.com/PaulWaltersDev/FreeLearningResourcesForSoftwareTesters, mục "Introduction to Testing". Tìm tên tài liệu trong repo để lấy liên kết.

