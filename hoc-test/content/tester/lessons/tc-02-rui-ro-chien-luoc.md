# Phân tích rủi ro và kế hoạch kiểm thử một trang

Bạn có hai tuần và một mình. App có bốn màn hình, mười hai yêu cầu chức năng, một bộ API. Kiểm hết mọi tổ hợp dữ liệu là việc không thể: riêng ô tuổi đã có 121 giá trị hợp lệ, nhân với ngày, giờ, bác sĩ, loại khám, BHYT.

Câu hỏi của người mới là "kiểm cái gì?". Câu hỏi của người có kinh nghiệm là "nếu chỉ kiểm được một phần, phần nào bỏ sót sẽ gây hại nhiều nhất?".

## Sau bài này bạn làm được gì

- Lập bảng rủi ro cho một sản phẩm và chấm điểm từng khu vực.
- Dùng điểm rủi ro để quyết định kiểm gì trước, kiểm sâu đến đâu.
- Viết kế hoạch kiểm thử gói trong một trang mà trưởng nhóm đọc trong hai phút.

## Rủi ro là gì

Trong kiểm thử, rủi ro sản phẩm là khả năng phần mềm làm sai một việc và việc sai đó gây hậu quả. Cách chấm đơn giản và phổ biến:

**Điểm rủi ro = Khả năng xảy ra × Mức ảnh hưởng**

Dùng thang 1 đến 3 cho mỗi vế là đủ cho một dự án nhỏ.

| | Khả năng xảy ra | Mức ảnh hưởng |
|---|---|---|
| 3 | Logic phức tạp, nhiều điều kiện, mới viết, hay thay đổi | Mất tiền, lộ thông tin cá nhân, sai lịch khám của nhiều người |
| 2 | Logic vừa phải, có vài ranh giới | Một người bệnh bị ảnh hưởng, có cách khắc phục bằng tay |
| 1 | Đơn giản, ít thay đổi | Khó chịu nhưng vẫn dùng được, lỗi trình bày |

## Tìm rủi ro ở đâu

Đừng đi theo thứ tự màn hình. Hãy tự hỏi theo từng nhóm sau, với chính dự án Sao Mai:

1. **Tiền.** Chỗ nào tính tiền? Sai một nghìn đồng cũng là sai.
2. **Thông tin cá nhân.** Chỗ nào hiển thị họ tên, số điện thoại, lịch khám của một người? Ai xem được?
3. **Tài nguyên có giới hạn.** Khung giờ chỉ có 3 chỗ. Điều gì xảy ra ở chỗ thứ 3, thứ 4? Khi có người hủy?
4. **Ngày giờ.** Phần mềm rất hay sai ở ranh giới ngày, thứ trong tuần, đầu và cuối khoảng thời gian.
5. **Trạng thái.** Lịch đi qua nhiều trạng thái. Có đường đi nào không được phép mà vẫn đi được không?
6. **Quyền.** Ai được vào màn quản trị? Điều gì chặn người đoán mã PIN?
7. **Đường vòng.** Giao diện chặn dữ liệu sai, nhưng API phía sau có chặn không?
8. **Thiết bị và người dùng.** Người bệnh dùng điện thoại. Người lớn tuổi có thể dùng trình đọc màn hình.

Với mỗi khu vực, viết một câu: "Điều tệ nhất có thể xảy ra là …". Nếu bạn không viết được hậu quả cụ thể, bạn chưa hiểu khu vực đó.

## Từ điểm rủi ro đến cách kiểm

| Điểm | Cách đối xử |
|---|---|
| 6 đến 9 | Kiểm trước tiên. Thiết kế ca có hệ thống (biên, bảng quyết định, chuyển trạng thái), thêm một phiên khám phá, kiểm lại ở mọi bản dựng. |
| 3 đến 4 | Kiểm các ca chính và vài ca biên. Một lần cho mỗi bản phát hành. |
| 1 đến 2 | Xem lướt, hoặc chủ động không kiểm và ghi rõ là không kiểm. |

Điểm quan trọng: **quyết định không kiểm một phần là quyết định hợp lệ, miễn là bạn ghi nó ra.** Điều không chấp nhận được là bỏ sót vì không nghĩ tới.

## Kế hoạch kiểm thử một trang

Các bộ chuẩn tài liệu kiểm thử (ví dụ bộ ISO/IEC/IEEE 29119) mô tả kế hoạch kiểm thử với nhiều mục. Ở dự án nhỏ, người đọc cần sáu điều sau, gói trong một trang:

1. **Trong phạm vi**: kiểm những gì.
2. **Ngoài phạm vi**: chủ động không kiểm những gì, và vì sao.
3. **Thứ tự ưu tiên**: lấy thẳng từ bảng rủi ro.
4. **Môi trường và dữ liệu**: trình duyệt nào, dữ liệu mẫu nào, ngày hệ thống cố định ra sao.
5. **Điều kiện dừng**: khi nào bạn coi là đã kiểm đủ. Phải đo được.
6. **Rủi ro của chính kế hoạch**: điều gì bạn không kiểm được trong điều kiện hiện có.

Điều kiện dừng kém: "khi không còn lỗi". Không ai biết khi nào hết lỗi. Điều kiện dừng tốt: "đã chạy hết ca của các khu vực từ 6 điểm trở lên, không còn lỗi mức Nghiêm trọng hoặc Cao đang mở mà chưa có quyết định của người phụ trách sản phẩm".

## Việc cần làm

1. Đọc kỹ [tài liệu yêu cầu bản 1.0](lab/yeu-cau.html). Mở [app tập](lab/index.html) và đi lướt qua bốn màn hình trong 10 phút để biết nó có gì. Chưa cần tìm lỗi.
2. Mở [sổ tay](lab/so-tay.html), mục Bài 2. Lập bảng rủi ro cho ít nhất 8 khu vực.
3. Viết kế hoạch một trang.
4. Tự chấm, rồi so với bài mẫu. Chú ý khu vực nào bài mẫu chấm cao mà bạn chấm thấp, và ngược lại. Không có đáp số duy nhất, nhưng bạn phải giải thích được điểm của mình.

## Sai lầm hay gặp

- **Chấm mọi thứ đều 9 điểm.** Khi mọi thứ đều ưu tiên cao thì không có gì được ưu tiên.
- **Xếp ưu tiên theo độ dễ kiểm.** Kiểm màn hình đẹp trước vì nó dễ, để phần tính phí lại sau cùng rồi hết giờ.
- **Quên phần ngoài phạm vi.** Người đọc sẽ mặc định là bạn đã kiểm tất cả.
- **Viết kế hoạch 10 trang.** Không ai đọc, kể cả bạn sau một tuần.

## Thuật ngữ

**Kiểm thử dựa trên rủi ro (risk-based testing)**: cách tiếp cận dùng mức rủi ro để quyết định kiểm gì, theo thứ tự nào, sâu đến đâu. · **Điều kiện dừng (exit criteria)**: các điều kiện đã thỏa thuận để coi một giai đoạn kiểm thử là xong. · **Phạm vi (scope)**: ranh giới giữa phần được kiểm và phần không được kiểm.

## Test toàn bộ app: trang hướng dẫn từng bước

Mở [trang hướng dẫn test](huong-dan-test.html). Trợ giảng khoanh từng chỗ trong app, giải thích lý thuyết, kỹ thuật và thuật ngữ tiếng Anh của từng bước, rồi làm mẫu để bạn xem.
