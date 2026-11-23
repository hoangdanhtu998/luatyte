# Kiểm thử hệ thống AI

Kiểm thử mô hình học máy và chatbot khác phần mềm thường ở đâu: kết quả không cố định, dữ liệu, độ chính xác và thiên lệch.

Bài trình chiếu đầy đủ nằm trong mục slide của bài này. Bài tập ở cuối trang.

## Nhìn bằng hình

*Hình vẽ gốc, dùng để minh họa thứ tự các bước chính của bài.*

## Đo bằng độ chính xác, không bằng đúng/sai tuyệt đối

Chuẩn bị bộ dữ liệu có đáp án. Tính tỉ lệ dự đoán đúng, và so với ngưỡng đã thống nhất, ví dụ 80%.

## Dữ liệu kiểm thử phải khác dữ liệu học

Nếu test dùng lại dữ liệu đã học, kết quả đẹp giả tạo. Tách riêng một tập để kiểm tra.

## Kiểm thử phân loại thư rác

```
Tổng thư: 10
Dự đoán đúng: 8
Độ chính xác = 8 / 10 = 80%
Ngưỡng yêu cầu: 80% → đạt
```

**Thuật ngữ trong slide này:** **Độ chính xác (accuracy)**: Tỉ lệ dự đoán đúng trên tổng số mẫu kiểm.

## Tìm thiên lệch và trường hợp biên

Thử cùng câu hỏi nhưng thay tên, giới tính, vùng miền để xem kết quả có khác không. Thử thêm câu rất dài, câu có lỗi chính tả, câu có ngôn ngữ lẫn lộn.

## Thiết kế ca cho chatbot

Liệt kê 3 nhóm ca kiểm thử cho một chatbot trả lời về giờ mở cửa cửa hàng. Gợi ý: (1) ca bình thường: hỏi giờ mở cửa ngày thường; (2) ca biên: ngày lễ, hỏi đúng giờ đóng cửa; (3) ca bất thường: câu sai chính tả, câu ngoài phạm vi như hỏi giá sản phẩm.

## Sai ở đâu, và sửa thế nào

**Thuật ngữ trong slide này:** **Thiên lệch (bias)**: Kết quả bị lệch theo một nhóm, như giới tính, vùng miền, hoặc cách hỏi.

## Giải thích chi tiết

**Độ chính xác (accuracy)**

**Thiên lệch (bias)**

## Giải thích chi tiết

**Tập dữ liệu học và tập kiểm (training vs test set)**

## Điều cần nhớ

- Đo độ chính xác trên dữ liệu chưa từng học.
- Kiểm thiên lệch và các trường hợp biên.
- Ghi lại phiên bản mô hình và dữ liệu để so sánh.

**Thuật ngữ trong slide này:** **Độ chính xác (accuracy)**: Tỉ lệ dự đoán đúng trên tổng số mẫu kiểm. · **Thiên lệch (bias)**: Kết quả bị lệch theo một nhóm, như giới tính, vùng miền, hoặc cách hỏi.

## Vì sao kết quả AI không cố định

Một mô hình có thể trả lời khác nhau cho cùng một câu hỏi, và kết quả phụ thuộc vào dữ liệu đã học.

- Không có một đáp án đúng duy nhất cho mọi câu hỏi mở.
- Thường đo bằng tỉ lệ đúng trên một bộ đáp án đã thống nhất, không đo bằng đúng hoặc sai tuyệt đối.
- Cần ghi lại phiên bản mô hình, dữ liệu kiểm và ngày chạy để so sánh được.

## Đo độ chính xác của bộ phân loại

1. Chuẩn bị 10 mẫu có đáp án đúng, không dùng dữ liệu đã dùng để huấn luyện.
2. Chạy mô hình, so từng dự đoán với đáp án.
3. Đếm 8 dự đoán đúng: độ chính xác 8/10 = 80%.
4. So với ngưỡng 80% đã thống nhất: đạt. Ghi kèm các mẫu sai để phân tích sau.

**Thuật ngữ trong slide này:** **Độ chính xác (accuracy)**: Tỉ lệ dự đoán đúng trên tổng số mẫu kiểm.

## Rò rỉ dữ liệu

Nếu dữ liệu kiểm thử đã xuất hiện trong dữ liệu học, kết quả trông đẹp giả tạo. Cần giữ một tập kiểm tra riêng, không dùng lại dữ liệu học.

*Kiến thức chung, chưa đối chiếu nguồn gốc.*

**Thuật ngữ trong slide này:** **Tập dữ liệu học và tập kiểm (training vs test set)**: Dữ liệu dùng để dạy mô hình (học) và dữ liệu riêng để kiểm (kiểm). Hai tập phải tách biệt.

## Đọc thêm: Mục mở rộng (không có mục riêng trong repo)

- Repo không có mục AI. Bài này dựa trên nguyên tắc đo độ chính xác và kiểm thử dữ liệu.

Nguồn: github.com/PaulWaltersDev/FreeLearningResourcesForSoftwareTesters, mục "Mục mở rộng (không có mục riêng trong repo)". Tìm tên tài liệu trong repo để lấy liên kết.

**Thuật ngữ trong slide này:** **Độ chính xác (accuracy)**: Tỉ lệ dự đoán đúng trên tổng số mẫu kiểm.

