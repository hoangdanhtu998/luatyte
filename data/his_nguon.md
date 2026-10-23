# Nguồn pháp lý cho bộ câu hỏi HIS

Viết cho: người làm sản phẩm HIS và đội nội dung, cần kiểm chứng các mục đánh dấu trước khi dùng.

File câu hỏi: `data/quiz_his.json` (46 câu, định dạng giống `quiz.json` cộng thêm `law`, `src`). Trường `verify: true` = nguồn chỉ là tóm tắt báo chí, hoặc số liệu/số điều khoản chưa đối chiếu được với văn bản trong thư mục (10 câu).

## Đã đối chiếu với văn bản hợp nhất có trong thư mục

| Văn bản | Các điều đã dùng |
|---|---|
| Luật KCB 15/2023 | 7, 9-10, 13, 27, 34, 50, 63, 69, 80, 104, 112, 120 |
| Luật BHYT (sửa bởi 51/2024) | 2, 14, 16, 17, 21, 22, 26, 28, 48b |
| Luật Dược 44/2024 (sửa Luật Dược 105/2016) | 6, 42, 74 |
| Luật Dân số 113/2025 | 5, 6, 14, 15, 29 |
| Luật phòng chống HIV/AIDS 71/2020 | 4, 27, 29, 30 |
| Luật phòng chống tác hại thuốc lá 09/2012 | 11 |
| Luật Người khuyết tật 51/2010 | 3, 14 |
| Luật phòng, chống bệnh truyền nhiễm 03/2007 (hợp nhất, ghi chú bị bãi bỏ) | ghi chú |
| Luật ATTP 55/2010, Luật Bảo vệ sức khỏe nhân dân 21-LCT/HĐNN8 | chưa dùng câu hỏi nào |

## Chỉ có tóm tắt báo chí, cần đối chiếu (đánh dấu verify)

- Luật Phòng bệnh 114/2025: hiệu lực 01/07/2026 (theo các nguồn tìm kiếm). Chưa đọc toàn văn.
- Thông tư 13/2025/TT-BYT (hồ sơ bệnh án điện tử): hiệu lực 21/07/2025. Hạn bệnh viện 30/09/2025 và hạn cơ sở khác 31/12/2026 lấy từ báo. Có nguồn ghi mốc khác, cần kiểm lại.
- Luật Bảo vệ dữ liệu cá nhân 91/2025: hiệu lực 01/01/2026, dữ liệu sức khỏe là dữ liệu nhạy cảm. Nghị định 356/2025/NĐ-CP hướng dẫn, thay Nghị định 13.
- Luật Giao dịch điện tử 2023: hiệu lực 01/07/2024. Điều 22 (chữ ký số) và Điều 23 (giá trị pháp lý). Nghị định 23/2025 hướng dẫn chương II.
- Luật Dữ liệu 60/2024: hiệu lực 01/07/2025. Nguồn ghi trạng thái không thống nhất, chưa có điều khoản về CSDL y tế.

## Còn thiếu, nên bổ sung

1. Thông tư 32/2023/TT-BYT (hướng dẫn Luật KCB, hồ sơ bệnh án). Chưa đọc.
2. Thông tư 26/2025/TT-BYT (đơn thuốc, kê đơn ngoại trú 30 ngày, 90 ngày). Các nguồn chưa thống nhất về hạn đơn điện tử: 01/10/2025 cho bệnh viện, 01/01/2026 cho cơ sở khác.
3. Nghị định 96/2023/NĐ-CP (hướng dẫn Luật KCB).
4. Luật An toàn thông tin mạng và Luật An ninh mạng: chưa tìm.
5. Quy định về liên thông, giám định, thanh toán BHYT điện tử (Nghị định hướng dẫn Luật BHYT sửa 51/2024; Nghị định 188/2025 đã thấy nhắc nhưng chưa đọc).
6. Luật Khám bệnh 2023 điều 9: quyền thông tin giá dịch vụ, cần xác minh thêm.

## Lưu ý khi dùng

- Câu về mức hưởng 100% "đủ 5 năm" đã bỏ hết con số; con số ngưỡng cụ thể chưa được xác nhận nên không đưa vào câu hỏi.
- Các câu có `verify: true` do số liệu hoặc số điều khoản chưa đối chiếu được: mức lương tối đa 20 lần mức tham chiếu, mã số BHYT duy nhất, 05 ngày làm việc cấp thẻ, 60 ngày trốn đóng, 20 nhận định, đình chỉ hành nghề liên quan giới tính thai nhi.
- Số điều khoản (`src`) của các câu còn lại lấy từ văn bản đã đọc trong phiên trước. Trước khi đưa vào sản phẩm, người đối chiếu nên kiểm tra lại từng `src` với văn bản gốc.
- Dữ liệu người bệnh là dữ liệu nhạy cảm. Mọi câu về bảo mật cần đối chiếu Luật Bảo vệ dữ liệu cá nhân 2025 khi đã đọc được toàn văn.
- Câu đơn thuốc điện tử chưa đưa vào bộ chính thức vì nguồn mâu thuẫn về hạn.

## Quy tắc khi văn bản trùng nội dung

Khi hai văn bản cùng điều chỉnh một nội dung mà đáp án khác nhau, áp dụng văn bản có ngày ban hành hoặc hiệu lực mới hơn. Văn bản cũ bị thay thế được ghi chú, không dùng làm đáp án.

Xung đột đã thấy:
- `quiz.json`, câu "Bệnh truyền nhiễm được phân thành mấy nhóm?" (đáp án 3 nhóm A, B, C): theo Luật 03/2007. Luật 114/2025 thay thế từ 01/07/2026, nên cần đối chiếu cách phân nhóm mới trước khi giữ đáp án này.
- Các câu về BHYT và Dược đã đối chiếu với bản sửa đổi mới nhất (51/2024, 44/2024), không có xung đột.
