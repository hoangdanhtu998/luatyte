# Thiết kế ca kiểm thử: phân vùng và giá trị biên

Một ca kiểm thử gồm đầu vào, kết quả mong đợi. Chia đầu vào thành vùng, rồi thử các giá trị ở ranh giới.

Bài trình chiếu đầy đủ nằm trong mục slide của bài này. Bài tập ở cuối trang.

## Nhìn bằng hình

*Hình vẽ gốc, dùng để minh họa thứ tự các bước chính của bài.*

## Phân vùng tương đương

Chia đầu vào thành các vùng mà chương trình xử lý giống nhau. Chỉ cần thử một giá trị đại diện cho mỗi vùng.

Ví dụ điểm thi từ 0 đến 10: vùng *không hợp lệ dưới 0*, vùng *0 đến 10*, vùng *không hợp lệ trên 10*.

## Giá trị biên

Lỗi hay nằm ở ranh giới giữa hai vùng. Với vùng 0 đến 10, nên thử: `-1, 0, 1, 9, 10, 11`.

Người viết code hay nhầm `<` với `<=`, nên giá trị biên rất đáng thử.

**Thuật ngữ trong slide này:** **Giá trị biên (boundary value)**: Các giá trị nằm ở mép của một khoảng hoặc điều kiện, nơi lỗi hay xảy ra vì lập trình viên dễ nhầm < với <=.

## Xếp loại theo điểm

```
0 - 4: kém
5 - 6: trung bình
7 - 8: khá
9 - 10: giỏi
ngoài 0..10: không hợp lệ
```

Các ca nên có: `-1, 0, 4, 5, 6, 7, 8, 9, 10, 11`. Mỗi ngưỡng được thử ở cả hai phía.

## Chọn ca kiểm thử

Hàm kiểm tra tuổi hợp lệ để đăng ký (từ 13 đến 100 tuổi). Hãy liệt kê ít nhất 6 giá trị đầu vào, gồm các vùng và các giá trị biên.

**Thuật ngữ trong slide này:** **Giá trị biên (boundary value)**: Các giá trị nằm ở mép của một khoảng hoặc điều kiện, nơi lỗi hay xảy ra vì lập trình viên dễ nhầm < với <=.

## Gợi ý đáp án

Gợi ý: `12, 13, 14, 99, 100, 101`. Vùng hợp lệ là 13..100, vùng không hợp lệ là dưới 13 và trên 100.

## Sai ở đâu, và sửa thế nào

## Giải thích chi tiết

**Phân vùng tương đương (equivalence partition)**

**Giá trị biên (boundary value)**

## Giải thích chi tiết

**Phủ điều kiện (condition coverage)**

**Phủ quyết định (decision coverage)**

## Điều cần nhớ

- Chia đầu vào thành vùng, thử một giá trị mỗi vùng.
- Thử kỹ các giá trị biên: trước, tại và sau ngưỡng.
- Mỗi ca phải có kết quả mong đợi rõ ràng.

**Thuật ngữ trong slide này:** **Giá trị biên (boundary value)**: Các giá trị nằm ở mép của một khoảng hoặc điều kiện, nơi lỗi hay xảy ra vì lập trình viên dễ nhầm < với <=.

## Cách chọn đầu vào có chủ đích

Mục tiêu là phủ được nhiều vùng xử lý nhất với số ca ít nhất.

- Xác định mọi điều kiện trong yêu cầu (ví dụ dưới 0, từ 0 đến 10, trên 10).
- Mỗi điều kiện tạo ra một vùng. Chọn một đại diện cho mỗi vùng.
- Tại mỗi ngưỡng, thử giá trị ngay trước, đúng tại và ngay sau ngưỡng.
- Thêm giá trị không hợp lệ: chữ thay cho số, để trống, số âm lớn.

## Thiết kế ca cho ô nhập số lượng mua

Yêu cầu: số lượng mua từ 1 đến 20.

1. Vùng: nhỏ hơn 1 (không hợp lệ), từ 1 đến 20 (hợp lệ), lớn hơn 20 (không hợp lệ).
2. Ca biên: 0, 1, 20, 21.
3. Ca không hợp lệ khác: để trống, nhập chữ "abc".
4. Kết quả mong đợi: 0 và 21 bị từ chối, 1 và 20 được chấp nhận, trống và chữ bị báo lỗi.

## Giá trị biên: ví dụ với ngưỡng 70

Diễn giả lấy một điều kiện a < 70 làm ví dụ. Hai ca a = 69 và a = 70 đã bao phủ cả hai nhánh, và kiểm được giá trị biên. Ba ca (dưới, bằng, trên 70) cũng đúng, nhưng ca thứ ba phải có lý do rõ ràng.

- Điều kiện a < 70: biên nằm ở 69 và 70.
- Kiểm nhánh Đúng và Sai, và đúng điểm biên.
- Điều kiện so sánh đúng hay sai (< hay <=) cần đọc code, không đoán từ sơ đồ.

*Nguồn: James Bach, Open Lecture on Software Testing (YouTube ILkT_HV9DVU), phụ đề tự động. Quan điểm của diễn giả, không phải chuẩn chung.*

## Đầu vào không phải số: có cần ca riêng không?

Nếu hàm nhận chữ thay vì số, có thể đi vào một đường đi thứ ba. Diễn giả nói: nếu biết đầu vào luôn nằm trong 0 đến 255 (ví dụ do bộ lọc trước đó), thì không cần ca này, nhưng phải kiểm chứng điều đó.

- Hỏi: đầu vào có thể là gì trong thực tế?
- Nếu có bộ lọc phía trước, kiểm bộ lọc có đúng không.
- Đừng thêm ca chỉ vì có thể, hãy thêm ca vì có lý do.

*Nguồn: James Bach, Open Lecture on Software Testing (YouTube ILkT_HV9DVU), phụ đề tự động. Quan điểm của diễn giả, không phải chuẩn chung.*

## Đọc thêm: Test Design and Execution

- **Test Design Techniques** (video).
- **Scenario Testing** (PDF).
- **Test Matrices** (bài viết).

Nguồn: github.com/PaulWaltersDev/FreeLearningResourcesForSoftwareTesters, mục "Test Design and Execution". Tìm tên tài liệu trong repo để lấy liên kết.

