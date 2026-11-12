# Quy trình từng loại kiểm thử

Mỗi loại kiểm thử đi theo quy trình nào, làm bước nào trước, và đạt khi nào. Từng loại một, có ví dụ và lỗi hay gặp.

Bài trình chiếu đầy đủ nằm trong mục slide của bài này. Bài tập ở cuối trang.

## Nhìn bằng hình

*Hình vẽ gốc, dùng để minh họa thứ tự các bước chính của bài.*

## Mỗi loại kiểm thử có quy trình riêng

- Bài này đi qua từng loại một: làm gì trước, làm gì sau, khi nào xong.
- Mỗi loại có hai slide: quy trình từng bước, và ví dụ kèm tiêu chí đạt.
- Tên tiếng Anh để trong ngoặc, để bạn đọc được tài liệu nước ngoài.

*Kiến thức chung, viết lại bằng lời của người soạn bài.*

## Kiểm thử đơn vị (Unit testing): quy trình

1. Chọn đơn vị nhỏ nhất: một hàm hoặc một lớp.
2. Viết ca cho đầu vào hợp lệ, giá trị biên, và đầu vào sai.
3. Cô lập phụ thuộc bên ngoài bằng bản giả (stub, mock).
4. Chạy và đọc kết quả từng ca, ghi lại ca nào sai.
5. Khi code đổi, cập nhật ca có lý do, không sửa ca để cho qua.

*Kiến thức chung, viết lại bằng lời của người soạn bài.*

**Thuật ngữ trong slide này:** **Chuẩn bị, chạy, ghi nhận, đánh giá**: Bốn giai đoạn của một lần kiểm thử, làm theo đúng thứ tự.

## Kiểm thử đơn vị (Unit testing): ví dụ và tiêu chí

**Ví dụ:** Hàm kiểm năm nhuận: ca 2000 (nhuận), 1900 (không), 2024 (nhuận), 2023 (không), và năm âm (sai).

**Đạt khi:** Mọi ca đạt; các nhánh quan trọng đã được phủ; không gọi cơ sở dữ liệu thật.

**Lỗi hay gặp:** Test gọi cả cơ sở dữ liệu nên chạy chậm và hỏng ngẫu nhiên.

*Kiến thức chung, viết lại bằng lời của người soạn bài.*

**Thuật ngữ trong slide này:** **Chuẩn bị, chạy, ghi nhận, đánh giá**: Bốn giai đoạn của một lần kiểm thử, làm theo đúng thứ tự.

## Kiểm thử tích hợp (Integration testing): quy trình

1. Chọn hai hoặc nhiều module có giao tiếp với nhau.
2. Ghi rõ giao diện: tham số, kiểu dữ liệu, mã lỗi, thời gian chờ.
3. Chuẩn bị môi trường gần thật và dữ liệu riêng cho ca.
4. Chạy một luồng dữ liệu qua chỗ nối giữa các module.
5. Kiểm dữ liệu ở đầu ra và ở đích, không chỉ kiểm "không báo lỗi".
6. Dọn dữ liệu sau khi chạy.

*Kiến thức chung, viết lại bằng lời của người soạn bài.*

**Thuật ngữ trong slide này:** **Chuẩn bị, chạy, ghi nhận, đánh giá**: Bốn giai đoạn của một lần kiểm thử, làm theo đúng thứ tự.

## Kiểm thử tích hợp (Integration testing): ví dụ và tiêu chí

**Ví dụ:** Dịch vụ đặt hàng gọi dịch vụ tính thuế: kiểm tổng tiền sau thuế đúng và hóa đơn được lưu.

**Đạt khi:** Luồng dữ liệu qua mọi chỗ nối đúng; lỗi từ dịch vụ phụ được xử lý.

**Lỗi hay gặp:** Hai bên đều đúng với tài liệu của mình, nhưng định dạng ngày khác nhau.

*Kiến thức chung, viết lại bằng lời của người soạn bài.*

## Kiểm thử hệ thống (System testing): quy trình

1. Đọc yêu cầu và chọn các luồng nghiệp vụ chính.
2. Viết kịch bản từ đầu đến cuối cho từng luồng.
3. Chuẩn bị môi trường giống môi trường thật nhất có thể.
4. Chạy từng kịch bản, ghi bước và kết quả.
5. Báo lỗi có bước tái hiện và bằng chứng.
6. Tổng hợp: luồng nào đạt, luồng nào còn lỗi, rủi ro còn lại.

*Kiến thức chung, viết lại bằng lời của người soạn bài.*

**Thuật ngữ trong slide này:** **Chuẩn bị, chạy, ghi nhận, đánh giá**: Bốn giai đoạn của một lần kiểm thử, làm theo đúng thứ tự.

## Kiểm thử hệ thống (System testing): ví dụ và tiêu chí

**Ví dụ:** Mua hàng: thêm vào giỏ, thanh toán bằng thẻ thử, nhận mã đơn, đơn hiện trong lịch sử.

**Đạt khi:** Mọi luồng nghiệp vụ chính đạt; lỗi nghiêm trọng đã đóng hoặc được chấp nhận có lý do.

**Lỗi hay gặp:** Chỉ kiểm trên môi trường khác hẳn sản phẩm thật, nên lỗi cấu hình bị bỏ sót.

*Kiến thức chung, viết lại bằng lời của người soạn bài.*

## Kiểm thử giao diện (Interface testing): quy trình

1. Liệt kê mọi điểm nối: API, tệp trao đổi, hàng đợi tin nhắn.
2. Kiểm định dạng và kiểu dữ liệu ở cả hai phía.
3. Kiểm mã lỗi và thông báo khi gửi dữ liệu sai.
4. Kiểm timeout và hành vi khi thử lại.
5. Kiểm phiên bản: thay đổi phía này có làm hỏng phía kia không.

*Kiến thức chung, viết lại bằng lời của người soạn bài.*

## Kiểm thử giao diện (Interface testing): ví dụ và tiêu chí

**Ví dụ:** API đăng nhập nhận trường mật khẩu bị thiếu: kiểm mã 400 và thông báo rõ trường nào thiếu.

**Đạt khi:** Mọi dữ liệu hợp lệ và không hợp lệ đều có phản hồi đúng; không có lỗi 500 với dữ liệu người dùng gửi.

**Lỗi hay gặp:** Đổi tên một trường ở API làm hỏng ứng dụng di động cũ mà không ai biết.

*Kiến thức chung, viết lại bằng lời của người soạn bài.*

## Kiểm thử hồi quy (Regression testing): quy trình

1. Chọn bộ ca cốt lõi, ưu tiên luồng quan trọng nhất.
2. Xác định vùng bị ảnh hưởng bởi thay đổi lần này.
3. Chạy bộ ca tự động trên toàn bộ phạm vi cốt lõi.
4. Chạy thêm ca thủ công ở vùng rủi ro cao.
5. So sánh với kết quả lần trước; lỗi mới phải được ghi riêng.

*Kiến thức chung, viết lại bằng lời của người soạn bài.*

**Thuật ngữ trong slide này:** **Chuẩn bị, chạy, ghi nhận, đánh giá**: Bốn giai đoạn của một lần kiểm thử, làm theo đúng thứ tự.

## Kiểm thử hồi quy (Regression testing): ví dụ và tiêu chí

**Ví dụ:** Sửa lỗi đăng nhập: chạy lại đăng nhập, xem bài, luyện tập, và đăng xuất.

**Đạt khi:** Các luồng cốt lõi vẫn đạt như trước khi sửa; lỗi mới đã có báo cáo.

**Lỗi hay gặp:** Chỉ chạy ca của chỗ vừa sửa, bỏ qua chỗ khác bị ảnh hưởng gián tiếp.

*Kiến thức chung, viết lại bằng lời của người soạn bài.*

**Thuật ngữ trong slide này:** **Chuẩn bị, chạy, ghi nhận, đánh giá**: Bốn giai đoạn của một lần kiểm thử, làm theo đúng thứ tự.

## Kiểm thử chấp nhận người dùng (User acceptance testing, UAT): quy trình

1. Lấy tiêu chí chấp nhận đã thống nhất từ đầu dự án.
2. Chọn người dùng đại diện, không phải tester.
3. Chuẩn bị kịch bản nghiệp vụ và dữ liệu an toàn, không dùng dữ liệu thật nhạy cảm.
4. Để người dùng tự làm, tester chỉ quan sát và ghi.
5. Phân loại phản hồi: lỗi, yêu cầu mới, hiểu lầm.
6. Quyết định chấp nhận, chấp nhận có điều kiện, hoặc từ chối.

*Kiến thức chung, viết lại bằng lời của người soạn bài.*

**Thuật ngữ trong slide này:** **Chuẩn bị, chạy, ghi nhận, đánh giá**: Bốn giai đoạn của một lần kiểm thử, làm theo đúng thứ tự.

## Kiểm thử chấp nhận người dùng (User acceptance testing, UAT): ví dụ và tiêu chí

**Ví dụ:** Kế toán đối soát cuối ngày trên dữ liệu thử: số liệu khớp sổ sách.

**Đạt khi:** Người dùng xác nhận đạt mọi tiêu chí đã thống nhất, và biên bản ký xác nhận.

**Lỗi hay gặp:** Người dùng được gợi ý từng bước nên không phát hiện được chỗ khó dùng.

*Kiến thức chung, viết lại bằng lời của người soạn bài.*

## Kiểm thử tài liệu (Documentation testing): quy trình

1. Liệt kê mọi tài liệu: hướng dẫn, ghi chú phát hành, thông báo lỗi, trợ giúp trong ứng dụng.
2. Làm theo đúng từng bước tài liệu như người mới chưa biết gì.
3. So sánh kết quả với điều tài liệu nói.
4. Kiểm thuật ngữ, ảnh chụp màn hình, số phiên bản có còn đúng không.
5. Báo mỗi chỗ sai lệch kèm trang và bước cụ thể.

*Kiến thức chung, viết lại bằng lời của người soạn bài.*

## Kiểm thử tài liệu (Documentation testing): ví dụ và tiêu chí

**Ví dụ:** Hướng dẫn cài đặt ghi lệnh cũ; làm theo thì lỗi, đến khi sửa lệnh mới chạy được.

**Đạt khi:** Mọi bước trong tài liệu chính thức chạy đúng với phiên bản đang phát hành.

**Lỗi hay gặp:** Tài liệu viết cho người đã biết sản phẩm, nên người mới không đi qua được.

*Kiến thức chung, viết lại bằng lời của người soạn bài.*

**Thuật ngữ trong slide này:** **Chuẩn bị, chạy, ghi nhận, đánh giá**: Bốn giai đoạn của một lần kiểm thử, làm theo đúng thứ tự.

## Kiểm thử cài đặt (Installation testing): quy trình

1. Chuẩn bị máy sạch: đúng hệ điều hành và phiên bản cần hỗ trợ.
2. Cài theo tài liệu, ghi lại mọi cảnh báo.
3. Kiểm chương trình chạy được ngay sau cài.
4. Nâng cấp từ bản cũ: dữ liệu và cấu hình còn nguyên không.
5. Gỡ cài đặt: không để lại tệp và dịch vụ thừa.
6. Kiểm quyền: cài đặt không đòi quyền quản trị nếu không cần.

*Kiến thức chung, viết lại bằng lời của người soạn bài.*

**Thuật ngữ trong slide này:** **Chuẩn bị, chạy, ghi nhận, đánh giá**: Bốn giai đoạn của một lần kiểm thử, làm theo đúng thứ tự.

## Kiểm thử cài đặt (Installation testing): ví dụ và tiêu chí

**Ví dụ:** Cài trên Windows 10 máy sạch, nâng cấp từ phiên bản trước, rồi gỡ và kiểm thư mục còn lại.

**Đạt khi:** Cài mới, nâng cấp, và gỡ đều không mất dữ liệu và không để lại rác.

**Lỗi hay gặp:** Chỉ thử cài trên máy đã có sẵn thư viện của dev, nên lỗi phụ thuộc bị bỏ qua.

*Kiến thức chung, viết lại bằng lời của người soạn bài.*

## Kiểm thử hiệu năng (Performance testing): quy trình

1. Đặt mục tiêu bằng số: thời gian phản hồi, số người dùng đồng thời, tỉ lệ lỗi chấp nhận được.
2. Chọn kịch bản nghiệp vụ tiêu biểu và dữ liệu đủ lớn.
3. Chuẩn bị môi trường và bật giám sát: CPU, bộ nhớ, cơ sở dữ liệu.
4. Chạy tải tăng dần, không nhảy thẳng lên đỉnh.
5. Đọc phân vị 95 và tỉ lệ lỗi, không chỉ trung bình.
6. Tìm nút thắt, sửa, và chạy lại cùng kịch bản để so sánh.

*Kiến thức chung, viết lại bằng lời của người soạn bài.*

**Thuật ngữ trong slide này:** **Chuẩn bị, chạy, ghi nhận, đánh giá**: Bốn giai đoạn của một lần kiểm thử, làm theo đúng thứ tự.

## Kiểm thử hiệu năng (Performance testing): ví dụ và tiêu chí

**Ví dụ:** Trang đặt hàng: 200 người đồng thời, phân vị 95 dưới 1,5 giây, lỗi dưới 1%.

**Đạt khi:** Đạt mọi mục tiêu bằng số đã đặt ra trước; kết quả đo lặp lại được.

**Lỗi hay gặp:** So sánh hai lần đo khác môi trường hoặc khác dữ liệu, rồi kết luận sai.

*Kiến thức chung, viết lại bằng lời của người soạn bài.*

## Các kiểu tải: tải, quá tải, chịu tải, tăng vọt (Load, Stress, Endurance, Spike): quy trình

1. Load: chạy ở mức tải dự kiến trong giờ cao điểm để xem hệ thống có đạt mục tiêu.
2. Stress: tăng tải dần đến khi hỏng, để biết hỏng ở đâu và hỏng kiểu gì.
3. Endurance: chạy tải vừa trong nhiều giờ để tìm rò rỉ bộ nhớ và cạn tài nguyên.
4. Spike: tăng vọt tải trong vài giây rồi giảm, để kiểm khả năng co giãn và hồi phục.
5. Với mỗi kiểu, ghi mục tiêu và kết quả riêng.

*Kiến thức chung, viết lại bằng lời của người soạn bài.*

**Thuật ngữ trong slide này:** **Chuẩn bị, chạy, ghi nhận, đánh giá**: Bốn giai đoạn của một lần kiểm thử, làm theo đúng thứ tự.

## Các kiểu tải: tải, quá tải, chịu tải, tăng vọt (Load, Stress, Endurance, Spike): ví dụ và tiêu chí

**Ví dụ:** Load: 500 người. Stress: đến 2.000 thì bắt đầu lỗi. Endurance: 12 giờ, bộ nhớ không tăng liên tục. Spike: 50 lên 5.000 trong 10 giây rồi về lại.

**Đạt khi:** Mỗi kiểu có mục tiêu riêng và đạt; điểm gãy khi quá tải được biết trước.

**Lỗi hay gặp:** Gộp bốn kiểu thành một lần chạy, nên không biết lỗi do tải nào gây ra.

*Kiến thức chung, viết lại bằng lời của người soạn bài.*

**Thuật ngữ trong slide này:** **Chuẩn bị, chạy, ghi nhận, đánh giá**: Bốn giai đoạn của một lần kiểm thử, làm theo đúng thứ tự.

## Kiểm thử độ tin cậy (Reliability testing): quy trình

1. Xác định mục tiêu thời gian hoạt động, ví dụ 99,9% trong một tháng.
2. Chạy liên tục với tải thực tế trong nhiều ngày.
3. Tiêm sự cố có kiểm soát: mất mạng, khởi động lại dịch vụ, mất kết nối cơ sở dữ liệu.
4. Đo thời gian phục hồi sau mỗi sự cố.
5. Kiểm không mất dữ liệu đã xác nhận với người dùng.

*Kiến thức chung, viết lại bằng lời của người soạn bài.*

**Thuật ngữ trong slide này:** **Chuẩn bị, chạy, ghi nhận, đánh giá**: Bốn giai đoạn của một lần kiểm thử, làm theo đúng thứ tự.

## Kiểm thử độ tin cậy (Reliability testing): ví dụ và tiêu chí

**Ví dụ:** Tắt đột ngột dịch vụ thanh toán giữa giao dịch: hệ thống hồi phục dưới 1 phút, giao dịch không bị trừ hai lần.

**Đạt khi:** Đạt mục tiêu thời gian hoạt động; mọi sự cố đều phục hồi trong thời gian đã định.

**Lỗi hay gặp:** Chỉ đo khi hệ thống đang khỏe, không bao giờ thử sự cố thật.

*Kiến thức chung, viết lại bằng lời của người soạn bài.*

## Kiểm thử bảo mật (Security testing) và kiểm thử dễ dùng (Usability testing): quy trình

1. Bảo mật: xác định tài sản và bề mặt tấn công (form, API, quyền truy cập).
2. Bảo mật: kiểm đầu vào (SQL injection, XSS) và quyền truy cập (IDOR) trên môi trường thử được phép.
3. Bảo mật: kiểm dữ liệu nhạy cảm có được mã hóa và không lộ trong log.
4. Dễ dùng: viết tác vụ cụ thể, ví dụ "đăng ký và đặt một đơn hàng".
5. Dễ dùng: quan sát người dùng thật làm, không gợi ý, ghi chỗ dừng và chỗ nhầm.
6. Dễ dùng: đo tỉ lệ hoàn thành và thời gian, rồi xếp ưu tiên sửa.

*Kiến thức chung, viết lại bằng lời của người soạn bài.*

## Kiểm thử bảo mật (Security testing) và kiểm thử dễ dùng (Usability testing): ví dụ và tiêu chí

**Ví dụ:** Bảo mật: thử gửi yêu cầu sửa học liệu của người khác. Dễ dùng: 5 người dùng mới đăng ký trên điện thoại, 4 người xong trong 3 phút.

**Đạt khi:** Bảo mật: không có lỗ hổng mức cao còn mở. Dễ dùng: đa số người dùng mục tiêu hoàn thành tác vụ chính không cần hỏi.

**Lỗi hay gặp:** Bảo mật: thử trên hệ thống thật của người khác. Dễ dùng: hỏi ý kiến người quen thay vì người dùng thật.

*Kiến thức chung, viết lại bằng lời của người soạn bài.*

## Khi nào một loại kiểm thử được coi là đạt

```
ket_qua_dat = (so_ca_loi == 0) AND (so_loi_nghiem_trong_mo == 0)

neu ket_qua_dat:
    ghi "chấp nhận"
nguoc lai:
    ghi "chưa đạt", kèm danh sách ca lỗi và lỗi đang mở

Quy tắc thứ tự của một lần kiểm thử:
    chuan_bi  trước  chay  trước  ghi_nhan  trước  danh_gia
```

Hai điều kiện nối bằng AND: thiếu một cái là chưa đạt. Không được tính trung bình để che một lỗi nghiêm trọng.

*Kiến thức chung, viết lại bằng lời của người soạn bài.*

## Sai ở đâu, và sửa thế nào

**Thuật ngữ trong slide này:** **Điều kiện AND**: Phép nối logic: kết quả đúng chỉ khi mọi điều kiện đều đúng. Thiếu một điều kiện là sai. · **Chuẩn bị, chạy, ghi nhận, đánh giá**: Bốn giai đoạn của một lần kiểm thử, làm theo đúng thứ tự.

## Giải thích chi tiết

**Điều kiện AND**

**Chuẩn bị, chạy, ghi nhận, đánh giá**

## Điều cần nhớ

- Mỗi loại có mục tiêu và tiêu chí đạt riêng, không dùng chung một thước.
- Làm theo thứ tự: chuẩn bị, chạy, ghi nhận, đánh giá theo tiêu chí.
- Lỗi hay gặp thường là làm sai phạm vi, sai môi trường, hoặc đo sai số.

**Thuật ngữ trong slide này:** **Chuẩn bị, chạy, ghi nhận, đánh giá**: Bốn giai đoạn của một lần kiểm thử, làm theo đúng thứ tự.

