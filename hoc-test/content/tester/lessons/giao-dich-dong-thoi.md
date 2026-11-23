# Giao dịch, đồng thời và tính idempotent

Hai người cùng đặt suất khám cuối cùng trong cùng một giây. Cả hai đều thấy "Đặt thành công". Đây không phải lỗi giao diện. Đây là lỗi đồng thời: hệ thống xử lý hai yêu cầu cùng lúc mà không kiểm soát đúng thứ tự.

Loại lỗi này khó tái hiện, và rất dễ bị bỏ qua vì mọi thao tác đơn lẻ đều chạy đúng. Bài này dạy cách nghĩ về nó và cách thiết kế ca để tìm ra.

## Sau bài này bạn làm được gì

- Giải thích bốn tính chất ACID bằng ví dụ đời thường.
- Nhận ra các lỗi đồng thời thường gặp: mất cập nhật, race condition, deadlock.
- Thiết kế ca kiểm thử bấm trùng và gửi lặp để kiểm tính idempotent.
- Không kết luận "race condition" khi chưa có bằng chứng.

## ACID trong bốn câu

- **Atomicity (nguyên tử):** giao dịch hoặc làm trọn vẹn, hoặc hủy toàn bộ. Không có nửa vời.
- **Consistency (nhất quán):** sau giao dịch, dữ liệu vẫn thỏa mọi ràng buộc.
- **Isolation (cô lập):** các giao dịch chạy đồng thời không nhìn thấy trạng thái trung gian của nhau, ở mức độ cô lập đã chọn.
- **Durability (bền vững):** giao dịch đã xác nhận thì không mất khi hệ thống sập.

Ví dụ chuyển tiền: trừ tiền ở tài khoản A và cộng tiền ở tài khoản B phải cùng thành công hoặc cùng bị hủy. Nếu chỉ trừ mà không cộng, tính nguyên tử đã bị vi phạm.

## Mất cập nhật (lost update)

Hai người cùng đọc số ghế còn lại là 1. Cả hai cùng ghi lại "còn 0" sau khi bán. Kết quả: hai vé bán ra cho một ghế, và một giao dịch bị ghi đè mà không báo lỗi.

Ca kiểm thử: gửi hai yêu cầu đặt cùng một tài nguyên gần như đồng thời, rồi đếm số bản ghi được tạo và kiểm tra số ghế còn lại có khớp không.

## Bấm trùng và gửi lặp: idempotency

Một thao tác là idempotent nếu thực hiện nhiều lần cho cùng kết quả như thực hiện một lần. Đặt lịch thường không idempotent theo mặc định: mỗi lần gửi tạo thêm một lịch.

Các tình huống cần kiểm:

- Người dùng bấm "Gửi" hai lần nhanh.
- Mạng chậm, trình duyệt tự gửi lại.
- Client retry sau khi timeout, dù server đã xử lý xong.

Kết quả đúng: chỉ có một bản ghi. Nếu hệ thống có khóa idempotency, hãy kiểm: gửi cùng khóa hai lần, nhận cùng một phản hồi, và không tạo bản ghi thứ hai.

## Deadlock

Giao dịch A giữ khóa dòng 1 và chờ dòng 2. Giao dịch B giữ dòng 2 và chờ dòng 1. Cả hai chờ mãi. Hệ quản trị thường phát hiện và hủy một bên.

Ca kiểm: chạy hai thao tác cập nhật chéo nhau. Kiểm xem hệ thống có báo lỗi rõ ràng, hủy đúng một giao dịch, và không để dữ liệu ở trạng thái nửa vời không.

## Đừng kết luận khi chưa có bằng chứng

Khi thấy hành vi lạ với hai yêu cầu đồng thời, bạn chưa thể kết luận đó là race condition. Có thể là cache, retry của client, hoặc lỗi hiển thị. Việc đúng là:

1. Ghi lại thời điểm, số yêu cầu, kết quả từng yêu cầu.
2. Lặp lại thí nghiệm vài lần, vì lỗi đồng thời có tính ngẫu nhiên.
3. Thu thập log và số bản ghi trong cơ sở dữ liệu.
4. Chỉ khi có bằng chứng mới ghi "nghi ngờ race condition" với mức độ tương ứng.

## Tóm lại

- ACID mô tả những gì giao dịch phải bảo đảm. Hãy kiểm từng tính chất bằng ca cụ thể.
- Gửi trùng và bấm trùng là ca bắt buộc với mọi thao tác ghi quan trọng.
- Race condition là giả thuyết cần thử, không phải kết luận ban đầu.
- Ghi lại bằng chứng: số lần, thời điểm, số bản ghi, log.

Tham khảo: Martin Kleppmann (*Designing Data-Intensive Applications*) về giao dịch và cô lập; Jim Gray và Andreas Reuter (*Transaction Processing*) về ACID. Kiểm tra lại nguồn trước khi trích dẫn.
