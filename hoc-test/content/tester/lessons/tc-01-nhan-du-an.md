# Nhận dự án: đọc yêu cầu và hỏi lại

Sáng thứ Hai, trưởng nhóm gửi bạn một file: "Phòng khám Sao Mai sắp ra tính năng đặt lịch khám trực tuyến. Hai tuần nữa phát hành. Em nhận phần kiểm thử nhé." Kèm theo là một trang yêu cầu viết vội. App chưa có bản nào để bấm thử.

Người mới thường ngồi chờ có app rồi mới bắt đầu. Người có kinh nghiệm bắt đầu ngay từ trang yêu cầu, vì lỗi rẻ nhất để sửa là lỗi chưa kịp viết thành code.

Từ bài này đến bài 10, bạn làm việc trên một dự án duy nhất. Mỗi bài có một sản phẩm phải nộp vào [sổ tay kiểm thử](lab/so-tay.html), giống việc thật.

## Sau bài này bạn làm được gì

- Đọc một bản yêu cầu và chỉ ra chỗ hai người có thể hiểu khác nhau.
- Viết câu hỏi làm rõ mà người phụ trách nghiệp vụ trả lời được bằng một quyết định.
- Biết vì sao câu trả lời phải được ghi lại thành văn bản.

## Bản nháp yêu cầu bạn nhận được

Đây là nguyên văn trang yêu cầu ban đầu. Hãy đọc chậm.

> **Đặt lịch khám trực tuyến, bản nháp**
>
> 1. Người bệnh nhập họ tên, số điện thoại hợp lệ và tuổi. Tên không được quá ngắn hoặc quá dài.
> 2. Trẻ em cần có người giám hộ.
> 3. Người bệnh chọn bác sĩ, ngày và giờ khám. Chỉ được đặt trước tối đa một tháng. Phòng khám nghỉ cuối tuần.
> 4. Giờ khám từ 8 giờ sáng đến 5 giờ chiều, mỗi lượt 30 phút, nghỉ trưa từ 11:30 đến 13:00.
> 5. Mỗi khung giờ nhận tối đa 3 người.
> 6. Phí khám thường 150.000đ, chuyên khoa 300.000đ. Trẻ nhỏ được miễn phí. Người cao tuổi được giảm giá. Có BHYT được giảm thêm.
> 7. Đặt xong người bệnh nhận mã lịch. Người bệnh có thể tra cứu bằng mã lịch và có thể hủy lịch.
> 8. Nhân viên phòng khám đăng nhập để xác nhận lịch.

## Vì sao bản nháp này chưa kiểm thử được

Một yêu cầu kiểm thử được khi bạn viết ra được dữ liệu vào và kết quả mong đợi mà không phải đoán. Thử với câu 2: "Trẻ em cần có người giám hộ". Bạn sẽ nhập tuổi bao nhiêu để kiểm? 12? 15? 16? 18? Mỗi người trong nhóm có thể nghĩ một con số khác nhau, và lập trình viên cũng tự chọn một con số khi viết code.

Các dấu hiệu của yêu cầu mơ hồ:

| Dấu hiệu | Ví dụ trong bản nháp | Câu cần hỏi |
|---|---|---|
| Tính từ không có số đo | "quá ngắn", "quá dài", "cao tuổi", "trẻ nhỏ" | Con số cụ thể là bao nhiêu? |
| Ranh giới không rõ thuộc bên nào | "đến 5 giờ chiều", "tối đa một tháng" | Giá trị ở đúng ranh giới thì nhận hay từ chối? |
| Từ có nhiều nghĩa | "cuối tuần", "một tháng", "hợp lệ" | Bạn đang dùng nghĩa nào? |
| Hai quy tắc cùng đúng | giảm theo tuổi và giảm BHYT | Áp dụng cái nào trước? Kết quả có được âm không? |
| Thiếu trường hợp ngược lại | "có thể hủy lịch" | Khi nào thì không hủy được? |
| Thiếu ai được làm gì | "tra cứu bằng mã lịch" | Người có mã lịch của người khác thì sao? |

## Cách viết một câu hỏi tốt

Câu hỏi kém: "Phần giảm giá chạy thế nào ạ?" Người nhận phải viết cả một đoạn văn để trả lời, và đoạn văn đó lại mơ hồ tiếp.

Câu hỏi tốt đưa ra một tình huống cụ thể và các phương án để chọn:

> Người bệnh đúng 60 tuổi, khám thường, có BHYT. Phí là: (a) 150.000 × 80% − 50.000 = 70.000đ, hay (b) (150.000 − 50.000) × 80% = 80.000đ, hay (c) chỉ được chọn một trong hai ưu đãi?

Ba điều làm nên câu hỏi tốt:

1. **Dữ liệu cụ thể.** Có con số, có ngày, có trạng thái.
2. **Có phương án.** Người trả lời chỉ cần chọn.
3. **Chạm vào ranh giới.** Hỏi đúng giá trị nằm ở mép, vì đó là nơi lập trình viên dễ viết nhầm nhất.

## Ghi lại câu trả lời

Câu trả lời nói miệng trong buổi họp sẽ bị quên sau một tuần. Tester có kinh nghiệm luôn chốt lại bằng văn bản: cập nhật vào tài liệu yêu cầu, hoặc gửi biên bản làm rõ để mọi người xác nhận. Khi có tranh cãi "đây là lỗi hay là tính năng", văn bản đó là căn cứ.

Trong dự án này, kết quả buổi làm rõ đã được ghi thành [tài liệu yêu cầu bản 1.0](lab/yeu-cau.html). Từ bài 2 trở đi, bạn kiểm thử theo tài liệu đó.

## Việc cần làm

1. **Chưa mở tài liệu yêu cầu bản 1.0.** Chỉ đọc bản nháp ở trên.
2. Mở [sổ tay kiểm thử](lab/so-tay.html), mục Bài 1. Viết ít nhất 8 câu hỏi làm rõ.
3. Tự chấm theo tiêu chí trong sổ tay.
4. Mở [tài liệu yêu cầu bản 1.0](lab/yeu-cau.html) và so: câu hỏi nào của bạn đã được trả lời? Điều gì tài liệu chốt mà bạn chưa nghĩ tới?
5. Cuối cùng mới mở bài mẫu trong sổ tay.

## Sai lầm hay gặp

- **Tự đoán rồi kiểm theo điều mình đoán.** Bạn đoán "trẻ em là dưới 18", lập trình viên đoán "dưới 16". App chạy đúng ý lập trình viên, bạn báo lỗi, hai bên cãi nhau. Lỗi thật nằm ở yêu cầu.
- **Hỏi quá chung.** "Anh chị giải thích thêm phần phí được không?" không giúp ai.
- **Chỉ hỏi về trường hợp đúng.** Phần lớn lỗi nằm ở trường hợp bị từ chối, bị giới hạn, bị hủy.
- **Không ghi lại câu trả lời.**

## Thuật ngữ

**Yêu cầu kiểm thử được (testable requirement)**: yêu cầu đủ rõ để viết được ca kiểm thử có kết quả mong đợi xác định. · **Kiểm thử tĩnh (static testing)**: tìm lỗi bằng cách xem xét tài liệu hoặc mã nguồn mà không chạy phần mềm. Rà soát yêu cầu là một dạng kiểm thử tĩnh. · **BA (business analyst)**: người phụ trách phân tích nghiệp vụ, thường là người trả lời câu hỏi về yêu cầu.
