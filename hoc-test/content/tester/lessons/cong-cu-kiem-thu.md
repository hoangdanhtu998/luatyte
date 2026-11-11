# Chọn công cụ kiểm thử

Công cụ theo mục đích: quản lý ca, theo dõi lỗi, tự động hóa, hiệu năng, bảo mật. Học khái niệm trước khi học công cụ.

Bài trình chiếu đầy đủ nằm trong mục slide của bài này. Bài tập ở cuối trang.

## Nhìn bằng hình

*Hình vẽ gốc, dùng để minh họa thứ tự các bước chính của bài.*

## Sau bài này bạn làm được gì

- Chọn công cụ theo vấn đề, không theo xu hướng tuyển dụng.
- Biết các nhóm công cụ tester thường dùng và việc gì mỗi nhóm giải quyết.
- Lập được thứ tự học công cụ cho bản thân.

## Vấn đề trước, công cụ sau

Mark Winteringham đưa ra nguyên tắc "problem first, tools second". Trước khi học một công cụ, hãy hỏi vì sao cần nó. Dùng sai công cụ có thể làm chậm việc hoặc cho thông tin sai.

*Nguồn: Mark Winteringham, "What Tools Should I Learn?" (Ministry of Testing) [đã đọc].*

## Công cụ tư duy quan trọng nhất

Theo bài này, công cụ tư duy (heuristic) là quan trọng nhất, ví dụ Rule of Thumb, CRUD, Goldilocks. Chúng không cần cài đặt, nhưng giúp chọn ca kiểm thử. Nên học tư duy trước, rồi mới học công cụ phần mềm.

*Nguồn: [đã đọc].*

## Các nhóm công cụ tester thường dùng

| Nhóm | Việc giải quyết | Ví dụ trong bài |
| --- | --- | --- |
| Tư duy (heuristic) | Chọn ý tưởng kiểm thử | Rule of Thumb, CRUD, Goldilocks |
| Ghi chép và báo cáo | Lập sơ đồ, ghi lại lỗi | XMind, MindMup, Draw.io, Rapid Reporter |
| Tạo dữ liệu test | Sinh dữ liệu đầu vào, gửi yêu cầu HTTP | SQL, Big List of Naughty Strings, Postman, curl, JMeter |
| Thu thập thông tin | Xem gói tin và nhật ký hệ thống | Burp Suite, Fiddler, Charles, grep, tail, Developer Tools |
| Tự động hóa và lập trình | Viết script, hiểu code để review rủi ro | Học lập trình, hoặc làm việc với developer |

*Nguồn: [đã đọc]. Tên công cụ lấy từ bài gốc, chưa kiểm tra còn được bảo trì hay không.*

## Chọn công cụ cho một vấn đề cụ thể

```
Vấn đề: API đặt hàng trả về sai khi số lượng âm
Cần: gửi yêu cầu với nhiều giá trị đầu vào, xem phản hồi
→ Nhóm: tạo dữ liệu test + HTTP client
→ Công cụ: Postman hoặc curl, kèm danh sách giá trị biên
Không cần: công cụ tải, vì chưa có vấn đề hiệu năng
```

## Đừng chạy theo danh sách công cụ

- **Học theo việc tuyển dụng**: công cụ hot nhất chưa chắc giải được vấn đề của bạn.
- **Học công cụ trước khi hiểu khái niệm**: không biết vì sao cần kiểm tra thì công cụ chỉ là nút bấm.
- **Tin mọi kết quả từ công cụ**: công cụ báo "đạt" vẫn có thể bỏ sót lỗi, xem bài về thiên kiến tự động hóa.

## Một lộ trình gợi ý

1. Tư duy kiểm thử và heuristic trước.
2. Một công cụ ghi chép và một công cụ gửi yêu cầu HTTP (ví dụ Postman).
3. Trình duyệt Developer Tools, để hiểu mạng và giao diện.
4. Một công cụ tự động hóa theo nhu cầu của dự án.
5. Lập trình cơ bản, khi cần viết script hoặc đọc code.

*Thứ tự này là gợi ý của người soạn bài, [kiến thức chung]. Bài nguồn không đưa lộ trình cụ thể.*

## Chọn công cụ

Đội bạn phải kiểm một trang web có form đăng ký và cần biết gửi dữ liệu xấu có làm server lỗi không. Chọn nhóm công cụ nào, và vì sao không cần công cụ tải?

## Đọc thêm: công cụ kiểm thử

- **What Testing Tools should I Learn** (Mark Winteringham, Ministry of Testing): https://www.ministryoftesting.com/lessons/what-tools-should-i-learn
- **Top Test Management Tools**: https://artoftesting.com/test-management-tools
- **Investing in Testing - The Importance of the Right Technique** (Rex Black, PDF): http://rbcs-us.com/site/assets/files/1358/investingintesting_theimportance.pdf

*Nguồn: FreeLearningResourcesForSoftwareTesters, mục "Testing Tools and Techniques".*

**Thuật ngữ trong slide này:** **Công cụ quản lý ca (test management)**: Phần mềm lưu ca kiểm thử, kết quả, tiến độ và liên kết với yêu cầu.

## Sai ở đâu, và sửa thế nào

## Giải thích chi tiết

**Công cụ quản lý ca (test management)**

**Theo dõi lỗi (bug tracker)**

## Giải thích chi tiết

**Proxy (công cụ bắt gói tin)**

## Điều cần nhớ

- Vấn đề trước, công cụ sau.
- Công cụ tư duy quan trọng hơn công cụ phần mềm.
- Công cụ không thay được việc hiểu điều đang kiểm.


## Thực hành: chọn công cụ theo vấn đề

Mở [trang thực hành](thuc-hanh.html?id=cong-cu-kiem-thu) để làm bài mô phỏng ngay trên trình duyệt.
