# Phân tích yêu cầu và phát hiện chỗ mơ hồ

Trước khi viết một ca kiểm thử nào, bạn phải biết mình đang kiểm cái gì. Nhiều lỗi không nằm trong code mà nằm ở yêu cầu: một câu nói mơ hồ, một quy tắc bị bỏ sót, hai tài liệu mâu thuẫn. Nếu không phát hiện sớm, bạn sẽ kiểm rất kỹ một thứ sai.

Bài này dạy cách đọc yêu cầu như một tester: tách loại yêu cầu, tìm từ không đo được, phân loại mức chắc chắn và truy vết yêu cầu sang ca kiểm thử.

## Sau bài này bạn làm được gì

- Phân biệt yêu cầu chức năng, phi chức năng, quy tắc nghiệp vụ và tiêu chí nghiệm thu.
- Tìm từ mơ hồ như "nhanh", "dễ dùng", "tự động" và đặt câu hỏi làm rõ có số liệu.
- Phân loại mỗi yêu cầu là đã xác nhận, giả định, chưa rõ, mâu thuẫn, thiếu hoặc ngoài phạm vi.
- Lập bảng truy vết yêu cầu (RTM) và thấy ngay yêu cầu nào chưa có ca kiểm thử.

## Bốn loại yêu cầu cần tách

| Loại | Trả lời câu hỏi | Ví dụ |
|---|---|---|
| Chức năng | Hệ thống làm gì? | Học viên nộp bài, hệ thống chấm điểm |
| Phi chức năng | Làm tốt đến mức nào? | Trang mở trong 2 giây ở 4G |
| Quy tắc nghiệp vụ | Luật nào phải được tuân thủ? | Mỗi học viên chỉ nộp một lần |
| Ràng buộc | Giới hạn nào? | Tệp đính kèm tối đa 5 MB |

Khi đọc tài liệu, hãy gạch chân từng câu rồi gắn nhãn. Một câu có thể thuộc hơn một loại.

## Từ mơ hồ: dấu hiệu phải hỏi lại

Các từ sau nghe hợp lý nhưng không kiểm được:

- nhanh, chậm, mượt
- dễ dùng, thân thiện, trực quan
- an toàn, bảo mật
- đúng, chính xác (đúng theo quy tắc nào?)
- tự động (tự động khi nào, bởi ai?)
- bình thường, thường xuyên

Ví dụ: "Trang phải tải nhanh." Câu hỏi làm rõ cần có số liệu:

- Thời gian tối đa là bao nhiêu mili giây? Đo ở p50, p95 hay p99?
- Đo ở mạng nào, thiết bị nào?
- Dùng công cụ nào để đo?

Nếu không có câu trả lời, đừng tự đặt con số rồi kết luận. Ghi thành câu hỏi làm rõ.

## Phân loại mức chắc chắn

Mỗi yêu cầu nên có một nhãn:

- **Đã xác nhận:** có văn bản do người có thẩm quyền ký hoặc duyệt.
- **Giả định:** bạn suy ra từ ngữ cảnh. Ghi rõ là giả định.
- **Chưa rõ:** có văn bản nhưng hiểu theo hai cách.
- **Mâu thuẫn:** hai nguồn nói khác nhau.
- **Thiếu:** cần có nhưng không thấy đâu.
- **Ngoài phạm vi:** đã thống nhất là không kiểm đợt này.

Quy tắc quan trọng: không chuyển giả định thành đã xác nhận. Nếu chỉ nghe trong cuộc họp, hãy ghi vào biên bản và hỏi lại để có văn bản.

## Truy vết yêu cầu: RTM

Ma trận truy vết nối yêu cầu với ca kiểm thử:

| Mã yêu cầu | Nội dung | Ca kiểm thử | Kết quả |
|---|---|---|---|
| REQ-001 | Đăng nhập | TC-001, TC-002 | Pass |
| REQ-002 | Nộp bài | TC-003 | Fail |
| REQ-003 | Lưu kết quả | (chưa có) | Thiếu độ phủ |

Dòng REQ-003 là tín hiệu cảnh báo. Bạn có hai việc: viết ca kiểm thử cho nó, hoặc ghi rủi ro nếu quyết định không kiểm đợt này.

## Đừng tin "đã sửa" khi chưa kiểm lại

Developer báo "đã sửa" là một thông tin, không phải bằng chứng. Tester phải kiểm lại độc lập: chạy lại đúng ca đã lỗi, rồi kiểm các chức năng liền kề.

## Tóm lại

- Tách yêu cầu thành loại trước khi thiết kế ca.
- Từ không đo được là dấu hiệu phải hỏi lại, không phải chi tiết nhỏ.
- Gắn nhãn mức chắc chắn. Giả định không bao giờ trở thành đã xác nhận một cách im lặng.
- Dùng RTM để thấy yêu cầu nào đang không có ca kiểm thử.

Tham khảo gợi ý: Glenford Myers (*The Art of Software Testing*), Cem Kaner, James Bach và Rex Black. Trước khi trích nguyên văn, hãy kiểm tra lại nguồn gốc.
