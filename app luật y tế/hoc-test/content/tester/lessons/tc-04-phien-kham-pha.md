# Phiên kiểm thử khám phá có charter

Bộ ca ở bài 3 bắt được những lỗi bạn đã nghĩ ra trước. Nhưng người bệnh thật không làm theo ca kiểm thử. Họ bấm nút hai lần vì mạng chậm. Họ đặt lịch, hủy, rồi đặt lại đúng khung đó. Họ mở hai tab.

Kiểm thử khám phá là lúc bạn vừa dùng sản phẩm, vừa học về nó, vừa nghĩ ra phép thử tiếp theo dựa trên điều vừa thấy. Nó không phải bấm lung tung. Người có kinh nghiệm làm việc này có kỷ luật: có mục tiêu, có giới hạn thời gian, có ghi chép.

## Sau bài này bạn làm được gì

- Viết một charter đủ hẹp để làm trong một phiên.
- Chạy một phiên 45 phút và ghi chép để người khác lặp lại được.
- Viết phần tổng kết phiên nói rõ đã phủ gì và chưa phủ gì.

## Charter: mục tiêu của một phiên

Charter là một câu nói rõ phiên này đi tìm gì. Mẫu câu thông dụng:

> **Khám phá** [khu vực] **bằng** [cách làm, dữ liệu, công cụ] **để tìm** [loại thông tin hoặc loại rủi ro].

| Charter kém | Vì sao kém | Charter tốt |
|---|---|---|
| Kiểm thử app đặt lịch | Quá rộng, làm cả tuần không xong | Khám phá việc đặt nhiều lịch vào một khung giờ, kể cả bấm nhanh và hủy xen kẽ, để tìm lỗi về sức chứa và lịch trùng |
| Kiểm ô tuổi nhận 0 đến 120 | Đó là một ca kiểm thử, không cần khám phá | Khám phá màn Quản trị bằng dữ liệu họ tên bất thường (rất dài, ký tự đặc biệt, thẻ HTML) để tìm lỗi hiển thị |

Lấy charter từ bảng rủi ro ở bài 2: mỗi khu vực từ 6 điểm trở lên đáng một phiên.

## Phiên có giới hạn thời gian

Cách tổ chức này thường được gọi là quản lý kiểm thử theo phiên (session-based test management), do Jonathan Bach và James Bach mô tả. Ý chính:

- Một phiên dài cố định, không bị ngắt quãng. Ở bài này là 45 phút.
- Một phiên phục vụ một charter.
- Trong phiên có ghi chép. Sau phiên có tổng kết ngắn.

Giới hạn thời gian buộc bạn phải chọn. Hết 45 phút, bạn dừng, tổng kết, rồi quyết định có cần phiên nữa cho khu vực đó không.

## Ý tưởng phép thử khi bạn bí

Khi không biết thử gì tiếp, đi qua danh sách này:

1. **Lặp lại và làm nhanh.** Bấm đúp. Bấm nút lần nữa khi đang chờ. Gửi cùng một form hai lần.
2. **Gián đoạn.** Tải lại trang giữa chừng. Bấm nút Quay lại của trình duyệt rồi gửi lại.
3. **Làm ngược thứ tự.** Chọn giờ trước rồi mới đổi bác sĩ. Điền từ dưới lên.
4. **Làm rồi hoàn tác.** Đặt rồi hủy rồi đặt lại. Xác nhận rồi hủy.
5. **Dữ liệu ở mép.** Rất dài, rỗng, toàn khoảng trắng, ký tự có dấu, ký tự đặc biệt, dán từ nơi khác.
6. **Cùng một dữ liệu, nhiều nơi hiển thị.** Phí trên form, trên phiếu, ở màn Tra cứu, ở bảng Quản trị có giống nhau không?
7. **Hai nơi cùng lúc.** Mở hai tab, thao tác xen kẽ trên cùng một lịch.
8. **Đi đường khác tới cùng kết quả.** Hủy từ màn Tra cứu và hủy từ màn Quản trị có cho kết quả như nhau không?

## Ghi chép trong phiên

Ghi ngắn, theo thời gian, đủ để lặp lại:

> 09:06 Đặt lịch thứ 3 vào BS. Lan 09:00 → thành công. Ô chọn giờ vẫn cho chọn 09:00.

Mỗi dòng có: bạn làm gì, bạn thấy gì. Khi thấy điều lạ mà chưa chắc là lỗi, ghi lại và đánh dấu để hỏi, rồi đi tiếp. Đừng dừng phiên để tranh luận.

Chụp màn hình khi gặp lỗi. Ghi lại dữ liệu chính xác đã nhập. Lỗi không tái hiện lại được gần như không ai sửa.

## Tổng kết phiên

Sau phiên, viết năm dòng:

- **Đã phủ**: những gì bạn thực sự đã thử.
- **Chưa phủ**: những gì thuộc charter mà chưa kịp thử. Mục này quan trọng ngang mục trên.
- **Lỗi**: danh sách, mỗi lỗi một dòng trong sổ lỗi.
- **Câu hỏi**: điều cần hỏi BA hoặc lập trình viên.
- **Phiên sau**: charter bạn đề xuất tiếp theo.

Thêm tỷ lệ thời gian ước lượng: bao nhiêu phần cho việc kiểm thử, bao nhiêu cho điều tra và ghi lỗi, bao nhiêu cho chuẩn bị. Nếu phần chuẩn bị chiếm quá nửa phiên, môi trường thử đang có vấn đề và đó là thông tin trưởng nhóm cần biết.

## Việc cần làm

1. Mở [sổ tay](lab/so-tay.html), mục Bài 4. Viết một charter cho khu vực rủi ro cao mà bộ ca bài 3 chưa chạm tới nhiều.
2. Mở [app tập bản 1.0](lab/index.html), đặt lại dữ liệu mẫu. Hẹn giờ 45 phút.
3. Chạy phiên. Ghi chép ngay vào sổ tay trong lúc làm.
4. Viết tổng kết. Thêm mỗi lỗi tìm được vào **Sổ lỗi**.
5. Tự chấm, so với bài mẫu. Nếu còn thời gian, chạy phiên thứ hai với charter cho màn Quản trị.

## Sai lầm hay gặp

- **Không có charter.** Hết giờ không biết mình đã kiểm gì.
- **Không ghi chép.** Tìm ra lỗi nhưng không nhớ đã làm thế nào.
- **Biến phiên khám phá thành chạy lại ca cũ.** Ca cũ đã có ở bài 3. Phiên này dành cho điều chưa ai nghĩ tới.
- **Để trống mục "chưa phủ".** Người đọc sẽ hiểu là bạn đã phủ hết.

## Thuật ngữ

**Kiểm thử khám phá (exploratory testing)**: cách kiểm thử trong đó việc học về sản phẩm, thiết kế phép thử và thực hiện phép thử diễn ra cùng lúc. · **Charter**: mục tiêu ngắn gọn của một phiên khám phá. · **Phiên (session)**: khoảng thời gian cố định, không gián đoạn, dành cho một charter.

## Test toàn bộ app: trang hướng dẫn từng bước

Mở [trang hướng dẫn test](huong-dan-test.html). Trợ giảng khoanh từng chỗ trong app, giải thích lý thuyết, kỹ thuật và thuật ngữ tiếng Anh của từng bước, rồi làm mẫu để bạn xem.
