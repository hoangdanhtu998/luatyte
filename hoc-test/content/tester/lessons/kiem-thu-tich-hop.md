# Kiểm thử tích hợp và lỗi lan truyền

Mỗi thành phần có thể chạy đúng khi kiểm riêng. Lỗi thường xuất hiện ở chỗ hai thành phần gặp nhau: một dịch vụ trả về định dạng khác, một yêu cầu bị chậm, một phản hồi lỗi không được xử lý.

Kiểm thử tích hợp tập trung vào các mối nối đó, và đặc biệt là lỗi đi qua mối nối: lỗi lan truyền như thế nào, và người dùng thấy gì.

## Sau bài này bạn làm được gì

- Xác định các mối nối cần kiểm trong một luồng nghiệp vụ.
- Thiết kế ca cho lỗi: timeout, lỗi một phần, phản hồi không đúng định dạng.
- Quyết định khi nào dùng giả lập (stub, mock) và khi nào phải dùng dịch vụ thật.
- Kiểm cách giao diện hiển thị lỗi từ phía sau.

## Vẽ luồng và đánh dấu các mối nối

Ví dụ đặt lịch khám có thanh toán:

1. Giao diện gửi yêu cầu đặt lịch đến API.
2. API kiểm lịch trống trong cơ sở dữ liệu.
3. API gọi dịch vụ thanh toán.
4. API ghi đơn và trả kết quả về giao diện.

Có ba mối nối quan trọng: giao diện–API, API–dịch vụ thanh toán, API–cơ sở dữ liệu. Mỗi mối nối cần ít nhất một ca thành công và một ca thất bại.

## Lỗi một phần

Lỗi nguy hiểm nhất là lỗi một phần: một bước thành công, bước sau thất bại. Ví dụ dịch vụ thanh toán bị timeout, nhưng thực ra đã trừ tiền. Nếu hệ thống ghi "chưa thanh toán" và cho đặt lại, khách bị trừ hai lần.

Ca kiểm:

- Mô phỏng timeout ở bước thanh toán.
- Kiểm trạng thái đơn hàng sau timeout: có nhất quán với việc tiền đã trừ hay chưa?
- Kiểm có cơ chế đối soát hoặc truy vấn lại trạng thái giao dịch không.

Kết quả đúng không phải là "luôn thành công", mà là "trạng thái luôn có thể giải thích được và không tự mâu thuẫn".

## Retry: an toàn hay nguy hiểm?

Retry giúp vượt qua lỗi tạm thời. Nhưng retry một thao tác không idempotent có thể tạo hai giao dịch. Trước khi chấp nhận một chính sách retry, hãy hỏi:

- Thao tác này có idempotent không?
- Có khóa chống trùng ở phía nhận không?
- Số lần retry và khoảng chờ có giới hạn không?

## Stub và mock: khi nào dùng

- Dùng giả lập khi dịch vụ bên ngoài chưa sẵn sàng hoặc không có môi trường thử. Nó giúp kiểm logic của bạn.
- Nhưng giả lập không chứng minh được hợp đồng thật. Sau đó phải có ít nhất một đợt kiểm với dịch vụ thật, hoặc sandbox của nhà cung cấp.

Ghi rõ trong báo cáo ca nào dùng giả lập, để người đọc không hiểu nhầm là đã kiểm với dịch vụ thật.

## Lỗi hiển thị ra người dùng

Khi backend trả lỗi 500, giao diện nên:

- Thông báo đủ rõ để người dùng biết chuyện gì xảy ra ở mức nghiệp vụ.
- Không lộ stack trace, tên bảng, hay chi tiết nội bộ.
- Cho phép thử lại hoặc hướng dẫn liên hệ, không để màn hình trắng.

## Tóm lại

- Kiểm mối nối, không chỉ kiểm từng thành phần riêng.
- Lỗi một phần cần ca riêng, vì trạng thái có thể mâu thuẫn.
- Retry chỉ an toàn khi thao tác idempotent hoặc có khóa chống trùng.
- Giả lập hữu ích nhưng không thay được kiểm với dịch vụ thật.

Tham khảo: Martin Fowler (bài viết về test pyramid và test tích hợp); Michael Nygard (*Release It!*) về các mẫu xử lý lỗi trong hệ thống phân tán. Kiểm tra lại nguồn trước khi trích dẫn.
