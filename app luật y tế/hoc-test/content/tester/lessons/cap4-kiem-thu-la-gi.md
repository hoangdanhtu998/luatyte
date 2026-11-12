# Kiểm thử phần mềm là gì

Lỗi, sai sót và sự cố khác nhau thế nào. Kiểm thử để tìm lỗi, không để chứng minh chương trình hết lỗi.

Bài trình chiếu đầy đủ nằm trong mục slide của bài này. Bài tập ở cuối trang.

## Nhìn bằng hình

*Hình vẽ gốc, dùng để minh họa thứ tự các bước chính của bài.*

## Ba khái niệm hay bị nhầm

| Khái niệm | Nghĩa | Ví dụ |
| --- | --- | --- |
| Sai sót (mistake) | Người viết code nhầm | Viết `<` thay cho `<=` |
| Lỗi (defect) | Chỗ trong code làm sai | Dòng so sánh đó nằm trong code |
| Sự cố (failure) | Người dùng thấy kết quả sai | Giảm giá thiếu 1 đồng |

Một sai sót sinh ra lỗi, lỗi chạy thì mới thành sự cố.

**Thuật ngữ trong slide này:** **Lỗi (bug, defect)**: Chỗ sản phẩm làm khác với điều đúng hoặc điều đã được yêu cầu. Lỗi là trạng thái của code hoặc của sản phẩm. · **Sai sót (mistake)**: Hành động sai của con người khi viết yêu cầu, thiết kế hoặc code. Sai sót sinh ra lỗi. · **Sự cố (failure)**: Khi hệ thống đang chạy và làm sai hoặc dừng, do một lỗi bên trong gây ra. Sự cố là điều người dùng thấy.

## Kiểm thử tìm lỗi, không chứng minh là hết lỗi

Chạy 100 ca đều đúng không có nghĩa là chương trình không còn lỗi. Có thể ca lỗi nằm ở chỗ chưa ai thử.

Vì vậy mục tiêu của kiểm thử là **tìm lỗi sớm** và **giảm rủi ro**, không phải đạt điểm tuyệt đối.

## Một hàm giảm giá

```
int giam_gia(int gia) {
    if (gia >= 100000)
        return gia - gia / 10;
    return gia;
}
```

Hàm này nhận giá gốc (đồng), trả về giá sau giảm. Từ 100000 đồng trở lên giảm 10%.

Thử với `gia = 50000`: kết quả đúng là 50000.

## Thử đoán trước khi đọc tiếp

Với `gia = 100000`, hàm trên trả về bao nhiêu? Với `gia = 99999`?

Viết đáp án ra giấy, rồi đọc trang sau.

## Kiểm tra đáp án

`gia = 100000` trả về **90000**. `gia = 99999` trả về **99999**.

Ca 100000 là ca biên, nó nằm ngay trên ngưỡng. Bài 3 sẽ nói cách chọn những ca như vậy.

## Sai ở đâu, và sửa thế nào

**Thuật ngữ trong slide này:** **Sai sót (mistake)**: Hành động sai của con người khi viết yêu cầu, thiết kế hoặc code. Sai sót sinh ra lỗi. · **Sự cố (failure)**: Khi hệ thống đang chạy và làm sai hoặc dừng, do một lỗi bên trong gây ra. Sự cố là điều người dùng thấy.

## Giải thích chi tiết

**Lỗi (bug, defect)**

**Sai sót (mistake)**

## Giải thích chi tiết

**Sự cố (failure)**

**Ca kiểm thử (test case)**

## Điều cần nhớ

- Kiểm thử so kết quả thực tế với kết quả mong đợi.
- Sai sót → lỗi → sự cố; kiểm thử tìm lỗi trước khi người dùng gặp.
- Không chạy hết mọi đầu vào được, nên phải chọn ca có chủ đích.

**Thuật ngữ trong slide này:** **Sai sót (mistake)**: Hành động sai của con người khi viết yêu cầu, thiết kế hoặc code. Sai sót sinh ra lỗi. · **Sự cố (failure)**: Khi hệ thống đang chạy và làm sai hoặc dừng, do một lỗi bên trong gây ra. Sự cố là điều người dùng thấy.

## Vì sao lỗi nhỏ có thể gây hậu quả lớn

Một lỗi trong code không tự nhiên trở thành sự cố. Nó chỉ gây hại khi có người dùng chạm đúng đường đi chứa lỗi, với dữ liệu đúng kiểu đó.

- Lỗi ở chỗ ít dùng có thể nằm yên nhiều năm.
- Lỗi ở luồng thanh toán thì ảnh hưởng tiền ngay lập tức.
- Kiểm thử giúp xếp mức độ ưu tiên: chỗ nào hỏng thì hại nhất.

**Thuật ngữ trong slide này:** **Sự cố (failure)**: Khi hệ thống đang chạy và làm sai hoặc dừng, do một lỗi bên trong gây ra. Sự cố là điều người dùng thấy.

## Tìm lỗi trong hàm giảm giá

Hàm đúng yêu cầu: từ 100000 đồng trở lên giảm 10%.

1. Đặt `gia = 100000`. Kết quả mong đợi: **90000**.
2. Đặt `gia = 99999`. Kết quả mong đợi: **99999**.
3. Nếu hàm trả về 100000 ở ca 1, đó là lỗi: điều kiện viết sai, dùng `>` thay vì `>=`.

Ghi lại: đầu vào, kết quả mong đợi, kết quả thực tế, và kết luận đạt hay không đạt.

## Kiểm thử là học nhanh

Diễn giả nói kiểm thử phần mềm là học nhanh về sản phẩm. Ông cũng nói tester phải tìm độ phức tạp nằm dưới vẻ đơn giản bề ngoài.

- Học sản phẩm: cách nó làm việc, ai dùng, dùng thế nào.
- Đặt giả thuyết về chỗ có thể hỏng, rồi kiểm chứng.
- Ghi lại điều học được để lần sau nhanh hơn.

*Nguồn: James Bach, Open Lecture on Software Testing (YouTube ILkT_HV9DVU), phụ đề tự động. Quan điểm của diễn giả, không phải chuẩn chung.*

## Thử để biết sản phẩm có thể hỏng ở đâu

Diễn giả đề nghị: "try the product to learn how it might not work". Mục tiêu không phải chứng minh sản phẩm đúng, mà tìm cách làm nó sai để học.

- Tester nên hỏi "nó có thể hỏng thế nào?" trước "nó có chạy không?".
- Mỗi lần thử nên có một lý do rõ ràng.

*Nguồn: James Bach, Open Lecture on Software Testing (YouTube ILkT_HV9DVU), phụ đề tự động. Quan điểm của diễn giả, không phải chuẩn chung.*

## Đọc thêm: Introduction to Testing

- **Open Lecture by James Bach** và **Agile Software Testing with James Bach** (video).
- **Black Box Software Testing (BBST) Foundations** (khóa học).
- **How to get started in Software Testing** (bài viết).

Nguồn: github.com/PaulWaltersDev/FreeLearningResourcesForSoftwareTesters, mục "Introduction to Testing". Tìm tên tài liệu trong repo để lấy liên kết.

