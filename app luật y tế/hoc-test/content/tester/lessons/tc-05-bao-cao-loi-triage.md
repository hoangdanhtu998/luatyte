# Báo cáo lỗi và buổi phân loại

Sổ lỗi của bạn đang có một loạt dòng ghi vội: "phí sai", "hủy lỗi", "tra cứu có vấn đề". Bạn hiểu chúng. Lập trình viên đọc thì không.

Một lỗi chỉ được sửa khi người đọc báo cáo hiểu nó, tái hiện được nó và tin rằng nó đáng sửa. Báo cáo lỗi là sản phẩm mà tester bị đánh giá nhiều nhất, vì đó là thứ cả nhóm đọc hằng ngày.

## Sau bài này bạn làm được gì

- Viết báo cáo lỗi mà người khác tái hiện được ngay lần đầu.
- Tách mức nghiêm trọng khỏi mức ưu tiên và lập luận cho từng mức.
- Thu hẹp lỗi về điều kiện nhỏ nhất gây ra nó.
- Xếp thứ tự sửa cho một danh sách lỗi và bảo vệ được thứ tự đó.

## Sáu phần của một báo cáo lỗi

| Phần | Nội dung | Ví dụ |
|---|---|---|
| Tiêu đề | Ở đâu, làm gì, sai thế nào | [Đặt lịch] Người đúng 60 tuổi không được giảm 20% phí khám |
| Môi trường | Bản dựng, trình duyệt, dữ liệu, ngày hệ thống | Bản 1.0, Chrome, dữ liệu mẫu |
| Các bước tái hiện | Đánh số, mỗi bước một hành động, có dữ liệu cụ thể | 2. Nhập Tuổi = 60 |
| Kết quả thực tế | Điều bạn thấy, nguyên văn | Phí dự kiến 150.000đ |
| Kết quả mong đợi | Điều đáng lẽ phải thấy, kèm căn cứ | 120.000đ, theo R7 |
| Mức nghiêm trọng, mức ưu tiên | Kèm một câu lý do | Cao: thu sai tiền |

### Tiêu đề

Người ta đọc tiêu đề trong danh sách hàng chục lỗi. Tiêu đề phải đứng một mình mà vẫn hiểu.

| Kém | Tốt |
|---|---|
| Lỗi phí | [Đặt lịch] Người đúng 60 tuổi không được giảm 20% phí khám |
| Hủy không được | [Tra cứu] Lịch đã hủy vẫn chiếm chỗ trong khung giờ |
| Tra cứu có vấn đề | [Tra cứu] Nhập sai số điện thoại vẫn hiện thông tin lịch |

### Các bước tái hiện

Bắt đầu từ một trạng thái ai cũng tới được: bản dựng nào, đã đặt lại dữ liệu mẫu chưa. Mỗi bước một hành động. Ghi đúng dữ liệu đã nhập. Trước khi gửi, tự làm lại đúng theo các bước mình viết, từ đầu.

### Kết quả mong đợi phải có căn cứ

"Tôi nghĩ nên như vậy" là ý kiến. "Theo R7" là căn cứ. Khi yêu cầu không nói gì về tình huống đó, ghi rõ: "Tài liệu yêu cầu chưa quy định. Đề nghị BA xác nhận." Lúc đó bạn đang báo một lỗ hổng của yêu cầu, và việc đó cũng có giá trị.

## Thu hẹp lỗi trước khi báo

Bạn thấy phí sai khi nhập tuổi 60, khám thường, không BHYT. Trước khi báo, thử thêm vài phút:

- Tuổi 59? Tuổi 61? → Lỗi chỉ ở đúng 60 hay cả vùng?
- Khám chuyên khoa thì sao? → Lỗi phụ thuộc loại khám không?
- Phí sai chỉ trên form, hay cả trên phiếu sau khi đặt?

Ghi kết quả vào phần ghi chú. Câu "61 tuổi tính đúng, 59 tuổi tính đúng, chỉ sai ở đúng 60" giúp lập trình viên tìm ra dòng code lỗi trong một phút. Đây là điểm khác biệt rõ nhất giữa báo cáo của người mới và người có kinh nghiệm.

## Mức nghiêm trọng khác mức ưu tiên

- **Mức nghiêm trọng (severity)**: lỗi gây hại đến đâu khi nó xảy ra. Tester đề xuất.
- **Mức ưu tiên (priority)**: nên sửa sớm đến đâu. Người phụ trách sản phẩm quyết định, tester đưa ý kiến.

Hai mức này thường đi cùng nhau, nhưng không phải luôn luôn:

| Tình huống | Nghiêm trọng | Ưu tiên |
|---|---|---|
| Tra cứu sai số điện thoại vẫn ra lịch của người khác | Nghiêm trọng | Cao |
| Tên phòng khám viết sai chính tả ngay trang đầu | Thấp | Cao, vì ai cũng thấy và sửa mất một phút |
| Lỗi tính phí chỉ xảy ra với người đúng 120 tuổi khám chuyên khoa | Cao | Thấp hơn, vì gần như không gặp |

Thang mức nghiêm trọng dùng trong khóa này:

| Mức | Ý nghĩa |
|---|---|
| Nghiêm trọng | Lộ thông tin, mất dữ liệu, chức năng chính không dùng được và không có cách vòng |
| Cao | Sai tiền, sai nghiệp vụ chính, có cách vòng nhưng người dùng không tự biết |
| Trung bình | Sai ở trường hợp ít gặp hoặc có cách vòng rõ ràng |
| Thấp | Trình bày, chính tả, không ảnh hưởng kết quả |

## Buổi phân loại (triage)

Ở dự án thật, lỗi mới được đưa ra một buổi họp ngắn có tester, lập trình viên và người phụ trách sản phẩm. Mỗi lỗi nhận một quyết định: sửa trong bản này, sửa sau, không sửa, hoặc cần thêm thông tin.

Việc của tester trong buổi này:

1. Trình bày lỗi trong 30 giây: hậu quả với người dùng là gì.
2. Trả lời "tái hiện thế nào" và "xảy ra thường xuyên không".
3. Đề xuất mức, và chấp nhận khi nhóm quyết định khác. Bạn cung cấp thông tin. Quyết định phát hành thuộc về người chịu trách nhiệm sản phẩm.

Nói về sản phẩm, đừng nói về người. "Phí tính sai ở tuổi 60" thay cho "anh A viết sai điều kiện".

## Việc cần làm

1. Mở [sổ tay](lab/so-tay.html), mục **Sổ lỗi**. Chọn 3 lỗi bạn đã tìm được ở bài 3 và bài 4. Viết lại thành báo cáo đầy đủ bằng form.
2. Với mỗi lỗi, dành vài phút thu hẹp trên [app tập](lab/index.html) trước khi viết.
3. Sang mục Bài 5 của sổ tay: xếp toàn bộ lỗi trong sổ theo thứ tự nên sửa, ghi lý do.
4. Tự chấm, so với bài mẫu.

## Sai lầm hay gặp

- **Gộp hai lỗi vào một báo cáo.** Sửa được một nửa thì đóng hay mở?
- **Bước tái hiện bắt đầu từ giữa chừng.** "Vào màn quản trị rồi bấm hủy" mà không nói lịch nào, trạng thái gì.
- **Chấm mọi lỗi mức Cao** để được chú ý. Sau vài lần, không ai tin mức bạn chấm nữa.
- **Viết kèm cảm xúc.** "Lỗi quá cơ bản" không giúp ai sửa nhanh hơn.

## Thuật ngữ

**Mức nghiêm trọng (severity)**: mức độ tác động của lỗi lên hệ thống hoặc người dùng. · **Mức ưu tiên (priority)**: mức độ cần sửa sớm, xét theo nghiệp vụ. · **Phân loại lỗi (triage)**: buổi xem xét lỗi mới để quyết định xử lý. · **Tái hiện (reproduce)**: làm cho lỗi xảy ra lại bằng các bước đã ghi.

## Test toàn bộ app: trang hướng dẫn từng bước

Mở [trang hướng dẫn test](huong-dan-test.html). Trợ giảng khoanh từng chỗ trong app, giải thích lý thuyết, kỹ thuật và thuật ngữ tiếng Anh của từng bước, rồi làm mẫu để bạn xem.
