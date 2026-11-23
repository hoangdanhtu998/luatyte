# Báo cáo kết thúc và khuyến nghị phát hành

Sáng thứ Sáu, người phụ trách sản phẩm hỏi bạn một câu: "Bản 1.1 phát hành được chưa?"

Chị ấy không có thời gian đọc 25 báo cáo lỗi và 60 ca kiểm thử. Chị cần một câu trả lời, lý do của nó, và những gì chị phải chấp nhận nếu quyết định khác với khuyến nghị của bạn.

Mọi việc bạn làm trong chín bài trước dồn về trang giấy này. Viết được nó rõ ràng, trung thực, đúng trọng tâm là kỹ năng phân biệt người chạy ca kiểm thử với người mà cả nhóm tin khi cần quyết định.

## Sau bài này bạn làm được gì

- Viết báo cáo kết thúc kiểm thử gói trong một trang.
- Đưa khuyến nghị phát hành rõ ràng, có căn cứ.
- Trình bày phần chưa kiểm và rủi ro còn lại một cách trung thực.
- Chọn số liệu có ý nghĩa, tránh số liệu gây hiểu sai.

## Vai của tester trong quyết định phát hành

Tester **không** quyết định phát hành. Người chịu trách nhiệm sản phẩm quyết định, vì họ cân cả những điều bạn không thấy: hợp đồng, hạn chót, chi phí của việc trễ.

Việc của bạn là cung cấp thông tin đủ tốt để quyết định đó được đưa ra khi đã biết rõ rủi ro. Nếu chị ấy quyết định phát hành dù còn lỗi, và đã biết rõ lỗi gì, bạn đã làm xong việc. Nếu chị ấy phát hành vì báo cáo của bạn mơ hồ, bạn chưa làm xong.

## Cấu trúc một trang

### 1. Kết luận, viết đầu tiên

Một trong ba câu:

- **Phát hành được.** Không còn lỗi chặn. Rủi ro còn lại: …
- **Phát hành có điều kiện.** Được, nếu chấp nhận hoặc xử lý được các điểm sau: …
- **Chưa nên phát hành.** Vì: …

Kèm một hoặc hai lý do mạnh nhất. Người đọc dừng ở đây vẫn phải nắm được ý chính.

Tránh câu nước đôi kiểu "nhìn chung khá ổn nhưng vẫn còn một số vấn đề cần lưu ý". Câu đó không giúp ai quyết định.

### 2. Đã kiểm gì

Vài gạch đầu dòng, theo khu vực và cách kiểm: ca có hệ thống cho yêu cầu nào, bao nhiêu phiên khám phá, API, kiểm lại và hồi quy, kiểm nhanh phi chức năng.

### 3. Chưa kiểm gì và rủi ro còn lại

Đây là phần người mới bỏ và người có kinh nghiệm viết kỹ nhất. Mỗi dòng có: cái gì chưa kiểm, vì sao, hậu quả có thể có.

> Chưa kiểm nhiều người đặt cùng một khung giờ cùng lúc, vì môi trường thử chỉ có một người dùng. Rủi ro: vượt sức chứa khi phòng khám đông.

Viết phần này không làm bạn trông kém đi. Nó cho thấy bạn biết giới hạn của công việc mình đã làm. Điều làm mất uy tín là nói "đã kiểm hết" rồi lỗi xuất hiện ở đúng chỗ chưa kiểm.

### 4. Số liệu

Chỉ đưa số trả lời được một câu hỏi của người đọc.

| Số liệu | Trả lời câu hỏi |
|---|---|
| Lỗi đang mở, chia theo mức nghiêm trọng | Còn bao nhiêu vấn đề, nặng đến đâu? |
| Lỗi đã đóng sau khi kiểm lại, lỗi bị mở lại | Chất lượng của các lần sửa ra sao? |
| Lỗi mới xuất hiện ở bản này | Bản này có ổn định hơn bản trước không? |
| Ca đã chạy, đạt, không đạt, theo khu vực rủi ro | Phần quan trọng đã được phủ chưa? |

Số liệu dễ gây hiểu sai:

- **"Đạt 95% số ca"** không nói gì nếu 5% không đạt là phần tính tiền.
- **Tổng số lỗi tìm được** không phải thước đo chất lượng sản phẩm, cũng không phải thước đo tester.
- **Số ca đã viết** không nói lên độ phủ.

### 5. Lỗi chặn phát hành

Một bảng ngắn: lỗi nào, vì sao chặn. Lý do phải là hậu quả với người bệnh hoặc phòng khám, không phải "vì mức Cao".

| Lý do yếu | Lý do mạnh |
|---|---|
| Lỗi mức nghiêm trọng Cao | Người đúng 60 tuổi bị thu thừa 30.000đ mỗi lượt khám thường |
| Vi phạm R6 | Bác sĩ có thể bị xếp 4 người bệnh trong một khung 30 phút |

### 6. Điều kiện để phát hành

Nếu khuyến nghị của bạn là chưa, hãy nói rõ cần gì để thành được: sửa những lỗi nào, sau đó bạn cần chạy lại những gì, mất bao lâu. Người đọc cần biết đường đi tiếp, không chỉ biết đang tắc.

## Giọng văn

- **Nói về sản phẩm.** "Bản 1.1 tính sai phí cho trẻ dưới 6 tuổi", không phải "đội phát triển lại làm hỏng phần phí".
- **Phân biệt điều đã thấy và điều suy đoán.** "Ngày thứ 30 bị từ chối trên 1.1, được nhận trên 1.0" là điều đã thấy. "Có vẻ do lần sửa F2" là suy đoán, ghi rõ là suy đoán.
- **Không phóng đại, không nói giảm.** Lỗi lộ thông tin thì gọi là lộ thông tin.
- **Ngắn.** Một trang. Chi tiết nằm ở sổ lỗi và bộ ca, báo cáo chỉ dẫn tới.

## Việc cần làm

1. Mở [sổ tay](lab/so-tay.html). Đếm lại từ **Sổ lỗi** và các bảng ca của bạn để có số liệu thật.
2. Vào mục Bài 10. Viết báo cáo kết thúc cho bản 1.1, tối đa một trang.
3. Tự chấm theo tiêu chí, so với bài mẫu.
4. Bây giờ mới vào mục **Đối chiếu đáp án** của sổ tay. Mở đáp án, đánh dấu những lỗi bạn đã tự tìm ra ở bản 1.0 và 1.1.
5. Với mỗi lỗi mức Nghiêm trọng hoặc Cao bị bỏ sót, đọc cột "Kỹ thuật tìm ra" rồi quay lại bổ sung ca còn thiếu vào bộ ca của bạn. Việc xem lại này là bài học quan trọng nhất của cả khóa.
6. Bấm **Xuất toàn bộ sổ tay** để lưu sản phẩm của bạn. Bộ tài liệu này là thứ bạn có thể đưa ra khi nói về kinh nghiệm kiểm thử của mình.

## Sau khóa này, còn thiếu gì để thành senior

Nói thẳng: một khóa học không biến ai thành tester cấp cao. Bạn vừa đi đủ một vòng công việc trên một sản phẩm nhỏ, một mình, không có áp lực thật. Chức danh senior đến từ việc lặp lại vòng này nhiều lần trên sản phẩm thật, với những thứ mà bài tập không tạo ra được:

- Hệ thống lớn, nhiều dịch vụ, dữ liệu thật và lộn xộn.
- Làm việc với lập trình viên, BA và người phụ trách sản phẩm có ý kiến khác bạn.
- Hạn chót thật, và việc phải chọn bỏ cái gì.
- Sự cố trên môi trường thật và việc truy nguyên nhân sau đó.
- Hướng dẫn người khác và xây quy trình cho cả nhóm.

Điều khóa này cho bạn là cách làm việc đúng ngay từ đầu: hỏi lại yêu cầu, chọn theo rủi ro, thiết kế ca có phương pháp, báo cáo để người khác hành động được, và trung thực về điều mình chưa kiểm. Bước tiếp theo hợp lý là áp đúng mười bước này lên một sản phẩm thật: một dự án mã nguồn mở, hoặc sản phẩm ở nơi bạn làm việc.

## Sai lầm hay gặp

- **Kết luận nằm ở cuối**, sau ba trang mô tả.
- **Không dám kết luận.** Liệt kê lỗi rồi để người đọc tự đoán.
- **Giấu phần chưa kiểm.**
- **Dùng tỷ lệ ca đạt làm bằng chứng chất lượng.**
- **Coi quyết định phát hành trái ý mình là thất bại.** Nếu thông tin bạn đưa đã rõ, bạn đã làm đúng việc.

## Thuật ngữ

**Báo cáo kết thúc kiểm thử (test completion report, test summary report)**: tài liệu tóm tắt việc kiểm thử đã làm và kết quả, dùng cho quyết định phát hành. · **Lỗi chặn phát hành (release blocker)**: lỗi mà nhóm thống nhất phải xử lý trước khi phát hành. · **Rủi ro còn lại (residual risk)**: rủi ro vẫn tồn tại sau khi đã kiểm thử và sửa lỗi.
