# Kiểm thử trong Agile

Bốn góc phần tư kiểm thử Agile: ai làm, hỗ trợ đội hay phản biện sản phẩm, và kỹ thuật hay nghiệp vụ.

Bài trình chiếu đầy đủ nằm trong mục slide của bài này. Bài tập ở cuối trang.

## Nhìn bằng hình

*Hình vẽ gốc, dùng để minh họa thứ tự các bước chính của bài.*

## Sau bài này bạn làm được gì

- Nêu được các nguyên tắc Agile liên quan trực tiếp đến kiểm thử.
- Đặt được một việc kiểm thử vào đúng góc phần tư.
- Tránh các kiểu làm việc khiến tester đứng ngoài sprint.

**Thuật ngữ trong slide này:** **Agile**: Cách làm phần mềm theo các vòng ngắn, lấy phản hồi liên tục và thay đổi linh hoạt. · **Sprint**: Một vòng làm việc ngắn, thường từ một đến bốn tuần, kết thúc bằng phần việc chạy được.

## Kiểm thử nằm trong sprint, không ở cuối

Trong Agile, tester tham gia từ lúc chia nhỏ yêu cầu, làm việc cùng lập trình viên và chủ sản phẩm mỗi ngày. Kiểm thử diễn ra liên tục, không đợi đến giai đoạn cuối.

**Thuật ngữ trong slide này:** **Agile**: Cách làm phần mềm theo các vòng ngắn, lấy phản hồi liên tục và thay đổi linh hoạt.

## Những nguyên tắc Agile liên quan đến tester

| Nguyên tắc | Ý nghĩa với tester |
| --- | --- |
| 1. Giao phần mềm có giá trị sớm và liên tục | Kiểm thử phải nhanh để kịp bản giao |
| 3. Bàn giao phần mềm chạy được thường xuyên | Cần tự động hóa hồi quy để không chậm nhịp |
| 4. Nghiệp vụ và lập trình viên làm việc cùng nhau hằng ngày | Tester là cầu nối, hỏi được yêu cầu ngay |
| 6. Trao đổi trực tiếp là hiệu quả nhất | Bàn bạc sớm, không viết báo cáo dài để giải thích |
| 7. Phần mềm chạy được là thước đo tiến độ chính | Tiến độ kiểm thử đo bằng tính năng đã kiểm xong |
| 9. Kỹ thuật tốt và thiết kế tốt làm tăng khả năng thích ứng | Testability là một phần của chất lượng |
| 12. Nhóm định kỳ tự xem lại cách làm việc | Tester nêu vấn đề quy trình trong buổi retrospective |

*Nguồn: Agile Manifesto Principles (agilemanifesto.org) [đã đọc, dịch sát nghĩa].*

**Thuật ngữ trong slide này:** **Agile**: Cách làm phần mềm theo các vòng ngắn, lấy phản hồi liên tục và thay đổi linh hoạt.

## Bốn góc phần tư (Agile Testing Quadrants)

|  | Hỗ trợ đội (hướng dẫn xây) | Phản biện sản phẩm (kiểm tra xem đã đúng chưa) |
| --- | --- | --- |
| **Kỹ thuật** (công nghệ) | **Q1**: kiểm thử đơn vị, kiểm thử thành phần | **Q4**: hiệu năng, tải, bảo mật |
| **Nghiệp vụ** | **Q2**: ví dụ theo yêu cầu, kiểm thử chức năng, nguyên mẫu | **Q3**: khám phá, kiểm thử chấp nhận của người dùng |

*Nguồn: Crispin và Gregory, Agile Testing Quadrants [kiến thức chung, chưa đối chiếu PDF gốc].*

**Thuật ngữ trong slide này:** **Agile**: Cách làm phần mềm theo các vòng ngắn, lấy phản hồi liên tục và thay đổi linh hoạt. · **Góc phần tư kiểm thử (testing quadrants)**: Bốn nhóm kiểm thử xếp theo hai trục: hỗ trợ đội hay phản biện sản phẩm, và kỹ thuật hay nghiệp vụ.

## Một story đăng nhập đặt vào bốn góc

```
Story: người dùng đăng nhập bằng email

Q1 (kỹ thuật, hỗ trợ): hàm kiểm định dạng email có test đơn vị
Q2 (nghiệp vụ, hỗ trợ): ví dụ "email đúng định dạng thì vào được trang chủ"
Q3 (nghiệp vụ, phản biện): người dùng thật thử đăng nhập trên điện thoại cũ
Q4 (kỹ thuật, phản biện): 1000 lượt đăng nhập cùng lúc vẫn dưới 2 giây
```

## Viết ví dụ trước khi viết code

Ví dụ (example) là một tình huống cụ thể mà cả đội đồng ý. Ví dụ "Nhập sai mật khẩu 5 lần thì tài khoản bị khóa 15 phút" trở thành tiêu chí chấp nhận. Viết ví dụ trước giúp lập trình viên và tester hiểu cùng một điều trước khi làm.

*Kiến thức chung về phát triển theo ví dụ (example mapping); chưa đối chiếu nguồn gốc.*

## Những cách làm khiến tester đứng ngoài

- **Chờ đến cuối sprint** rồi mới kiểm: lỗi tìm ra muộn, sửa tốn kém.
- **Chỉ kiểm thủ công** mọi thứ: không kịp nhịp sprint, nên tự động hóa phần hồi quy.
- **Không hỏi về yêu cầu**: kiểm thử chỉ đúng với điều không ai nói rõ.
- **Chỉ có Q3 và Q4**: đội có phản biện nhưng thiếu Q1 và Q2 thì lỗi cơ bản vẫn lọt.

**Thuật ngữ trong slide này:** **Sprint**: Một vòng làm việc ngắn, thường từ một đến bốn tuần, kết thúc bằng phần việc chạy được.

## Phân loại hoạt động

Hoạt động "đo thời gian phản hồi khi 500 người dùng đăng nhập cùng lúc" thuộc góc phần tư nào? Vì sao? Và hoạt động "tester ngồi cạnh lập trình viên viết ví dụ cho story mới" thuộc góc nào?

## Đọc thêm: Testing in Agile

- **Agile Manifesto Principles**: http://agilemanifesto.org/principles.html
- **Agile Testing Overview** (Elizabeth Hendrickson): https://web.archive.org/web/20110614142541/http://testobsessed.com/wp-content/uploads/2011/04/AgileTestingOverview.pdf
- **Agile Test Planning with the Agile Testing Quadrants** (Lisa Crispin và Janet Gregory): http://lisacrispin.com/downloads/AdpTestPlanning.pdf
- **Quick Tools for Agile Testing**: http://agiletester.ca/wp-content/uploads/sites/26/2015/07/Agile-tips-final.pdf

*Nguồn: FreeLearningResourcesForSoftwareTesters, mục "Testing in Agile". Một số liên kết có thể không mở được; kiểm lại trước khi đọc.*

**Thuật ngữ trong slide này:** **Agile**: Cách làm phần mềm theo các vòng ngắn, lấy phản hồi liên tục và thay đổi linh hoạt. · **Góc phần tư kiểm thử (testing quadrants)**: Bốn nhóm kiểm thử xếp theo hai trục: hỗ trợ đội hay phản biện sản phẩm, và kỹ thuật hay nghiệp vụ.

## Sai ở đâu, và sửa thế nào

**Thuật ngữ trong slide này:** **Sprint**: Một vòng làm việc ngắn, thường từ một đến bốn tuần, kết thúc bằng phần việc chạy được.

## Giải thích chi tiết

**Agile**

**Sprint**

## Giải thích chi tiết

**Góc phần tư kiểm thử (testing quadrants)**

## Điều cần nhớ

- Kiểm thử bắt đầu từ đầu sprint và diễn ra liên tục.
- Phần mềm chạy được là thước đo tiến độ.
- Bốn góc phần tư giúp xếp việc kiểm thử theo mục đích, và cả bốn đều cần người.

**Thuật ngữ trong slide này:** **Sprint**: Một vòng làm việc ngắn, thường từ một đến bốn tuần, kết thúc bằng phần việc chạy được.

