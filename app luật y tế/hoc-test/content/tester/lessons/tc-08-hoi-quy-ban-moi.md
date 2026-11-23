# Bản 1.1: kiểm lại lỗi đã sửa và hồi quy

Chiều thứ Năm, đội phát triển nhắn: "Bản 1.1 lên rồi, sửa 6 lỗi em báo. Em xác nhận giúp để mai phát hành." Kèm một danh sách sáu dòng.

Người mới mở từng lỗi, thử đúng các bước cũ, thấy không còn lỗi, đóng lại. Xong trong một giờ.

Người có kinh nghiệm biết hai điều. Một: "đã sửa" là lời khai, chưa phải bằng chứng. Hai: mỗi lần sửa code là một lần có thể làm hỏng thứ đang chạy đúng. Việc tìm cái bị hỏng theo mới là phần khó.

## Sau bài này bạn làm được gì

- Kiểm lại một lỗi đã sửa cho đủ, không chỉ lặp đúng bước cũ.
- Chọn bộ ca hồi quy dựa trên phần code bị đụng tới.
- Phân biệt lỗi chưa sửa xong, lỗi cũ chưa nằm trong danh sách sửa, và lỗi mới do lần sửa gây ra.
- Báo kết quả kiểm lại rõ ràng: đóng hay mở lại, kèm bằng chứng.

## Hai việc khác nhau

| | Kiểm lại lỗi đã sửa (retest, confirmation testing) | Kiểm thử hồi quy (regression testing) |
|---|---|---|
| Câu hỏi | Lỗi này đã thực sự hết chưa? | Lần sửa có làm hỏng thứ khác không? |
| Chạy gì | Ca đã phát hiện lỗi, cộng các biến thể quanh nó | Ca đang đạt ở bản trước, thuộc vùng liên quan |
| Kết quả | Đóng, hoặc mở lại | Lỗi mới, hoặc không có gì |

## Kiểm lại cho đủ

Lấy mục F1 trong [ghi chú phát hành](lab/yeu-cau.html): "Tuổi 120 bị từ chối."

Kiểm lại kém: nhập 120, thấy được nhận, đóng lỗi.

Kiểm lại đủ:

1. Nhập 120 → được nhận. Đó là điều được báo sửa.
2. Nhập 121 → vẫn bị từ chối. Lập trình viên có thể đã sửa bằng cách nới điều kiện quá tay.
3. Nhập 119 và 0 → vẫn được nhận.
4. Gửi tuổi 120 qua API → kết quả như giao diện.

Nguyên tắc: **khi một ranh giới được sửa, kiểm lại cả hai phía của ranh giới đó và ranh giới đối diện.**

Một mục chỉ được đóng khi bạn tự chạy và thấy đúng. Nếu vẫn lỗi, mở lại kèm bằng chứng mới: bản dựng nào, bước nào, kết quả gì. Đừng chỉ ghi "vẫn lỗi".

## Chọn ca hồi quy

Không ai chạy lại toàn bộ mọi ca cho mỗi bản. Chọn theo ba vòng:

1. **Vòng trong: chính chức năng vừa sửa.** Sửa phần phí thì chạy lại toàn bộ bảng quyết định phí, không riêng dòng từng lỗi.
2. **Vòng giữa: chức năng dùng chung dữ liệu hoặc code.** Sửa kiểm tra ngày khám thì chạy lại mọi ca biên của ngày: hôm nay, +1, +30, +31, từng thứ trong tuần.
3. **Vòng ngoài: các ca khói của luồng chính.** Đặt lịch, tra cứu, hủy, xác nhận. Vài ca thôi, để chắc bản dựng không vỡ ở chỗ lớn.

Áp vào ghi chú phát hành 1.1:

| Mục được báo sửa | Vùng cần hồi quy |
|---|---|
| F1 tuổi 120 | Mọi biên của tuổi, ngưỡng người giám hộ |
| F2 Thứ bảy, Chủ nhật | Mọi biên của ngày khám, từng thứ trong tuần |
| F3 lịch thứ 4 | Sức chứa, hủy rồi đặt lại |
| F4 phí âm | Toàn bộ bảng quyết định phí |
| F5 tra cứu sai số điện thoại | Tra cứu đúng và sai, cả giao diện lẫn API, hủy lịch |
| F6 bấm đúp | Đặt lịch bình thường, bấm đúp, bấm lại khi đang gửi |

Đây là lúc bộ ca viết cẩn thận ở bài 3 và bài 6 trả công. Nếu bạn đã tự động hóa một phần ở bài 7, bạn chạy lại chúng trong vài giây.

## Ba loại kết quả không đạt trên bản mới

Khi một ca không đạt trên 1.1, hãy xác định nó thuộc loại nào, vì cách báo khác nhau:

| Loại | Dấu hiệu | Cách báo |
|---|---|---|
| Sửa chưa xong | Nằm trong danh sách F1 đến F6, vẫn tái hiện được | Mở lại lỗi cũ, kèm bằng chứng trên 1.1 |
| Lỗi cũ chưa được sửa | Có ở 1.0, không nằm trong danh sách sửa | Giữ nguyên lỗi cũ, ghi chú "vẫn còn ở 1.1" |
| Lỗi hồi quy | Bản 1.0 chạy đúng, bản 1.1 sai | Lỗi mới, ghi rõ "1.0 không có lỗi này", nêu mục sửa mà bạn nghi là nguyên nhân |

Để phân loại, bạn cần chạy cùng một ca trên cả hai bản. App tập có liên kết **Chuyển sang bản …** ở chân trang để làm việc đó. Trên dự án thật, hãy giữ lại một môi trường chạy bản trước cho đúng mục đích này.

Lỗi hồi quy thường được ưu tiên cao: người dùng đang dùng tính năng đó bình thường, bản mới làm họ mất nó.

## Việc cần làm

1. Đọc mục 6 của [tài liệu yêu cầu](lab/yeu-cau.html): ghi chú phát hành bản 1.1.
2. Mở [app tập bản 1.1](lab/index.html?build=1.1). Đặt lại dữ liệu mẫu, cố định ngày hệ thống giống lúc bạn kiểm bản 1.0.
3. Mở [sổ tay](lab/so-tay.html), mục Bài 8. Kiểm lại từng mục F1 đến F6, ghi ca đã chạy và kết luận.
4. Chạy bộ ca hồi quy theo bảng ở trên. Với mỗi ca không đạt, chạy lại trên bản 1.0 để phân loại.
5. Ghi lỗi mới vào **Sổ lỗi**, sửa ô môi trường thành "Bản 1.1".
6. Tự chấm, so với bài mẫu.

## Sai lầm hay gặp

- **Đóng lỗi vì lập trình viên nói đã sửa.**
- **Chỉ lặp đúng bước cũ.** Lỗi biến mất ở đúng dữ liệu đó, vẫn còn ở dữ liệu bên cạnh.
- **Bỏ hồi quy vì gấp.** Lần sửa vội trước ngày phát hành chính là lần dễ gây lỗi mới nhất.
- **Báo lỗi hồi quy như lỗi thường.** Thiếu câu "bản trước chạy đúng", nhóm sẽ xếp nó sai ưu tiên.

## Thuật ngữ

**Kiểm thử xác nhận (confirmation testing, retest)**: chạy lại để xác nhận một lỗi đã được sửa. · **Kiểm thử hồi quy (regression testing)**: kiểm để phát hiện phần không được chủ ý thay đổi bị ảnh hưởng. · **Lỗi hồi quy (regression)**: chức năng từng chạy đúng bị hỏng ở bản mới. · **Ghi chú phát hành (release notes)**: danh sách thay đổi của một bản dựng.
