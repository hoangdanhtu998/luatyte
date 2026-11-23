# Ghép tổ hợp: pairwise và đồ thị nguyên nhân–kết quả

Một màn đặt lịch có bốn lựa chọn: loại khám, bảo hiểm, phương thức thanh toán và khung giờ. Mỗi lựa chọn có ba giá trị. Thử hết mọi tổ hợp là 3 × 3 × 3 × 3 = 81 ca. Với một màn nhỏ, con số này đã quá nhiều, còn với một hệ thống thật thì không thể làm nổi.

Vấn đề là: bạn không thể thử hết, nhưng cũng không thể chọn ngẫu nhiên. Bài này dạy hai kỹ thuật để chọn có căn cứ.

## Sau bài này bạn làm được gì

- Giải thích vì sao thử hết mọi tổ hợp thường không khả thi.
- Hiểu pairwise: phủ mọi cặp giá trị, và biết nó không bảo đảm điều gì.
- Đưa ràng buộc nghiệp vụ vào bộ ca để không tạo ca không hợp lệ.
- Dùng đồ thị nguyên nhân–kết quả để chuyển luật nghiệp vụ thành bảng quyết định.

## Pairwise: phủ mọi cặp

Pairwise nghĩa là với mọi cặp tham số, mỗi cặp giá trị xuất hiện ít nhất một lần trong bộ ca. Nghiên cứu của Kuhn và cộng sự tại NIST cho thấy phần lớn lỗi trong thực tế được kích hoạt bởi một hoặc hai tham số cùng lúc. Vì vậy phủ cặp là một điểm xuất phát hợp lý.

Với bốn tham số, mỗi tham số ba giá trị, một bộ pairwise thường chỉ cần khoảng 9 ca thay vì 81. Bạn không cần tự tính tay: các công cụ như PICT (Microsoft) hoặc allpairs sinh bộ ca cho bạn.

Nhưng pairwise **không** bảo đảm mọi lỗi được bắt. Nếu lỗi chỉ xảy ra khi ba tham số có giá trị cụ thể cùng lúc, bộ pairwise có thể bỏ sót. Vì vậy hãy dùng nó như bộ ca nền, rồi thêm ca cho các luật nghiệp vụ quan trọng.

## Ràng buộc: loại tổ hợp không hợp lệ

Một số tổ hợp không được phép tồn tại. Ví dụ: "Nếu bảo hiểm là BHYT, không được chọn thanh toán bằng thẻ quốc tế." Nếu không khai báo ràng buộc, công cụ sẽ sinh ca vô nghĩa, và kết quả "lỗi" bạn thấy có thể chỉ là ca sai.

Hãy viết ràng buộc thành quy tắc rõ ràng, rồi đưa vào công cụ. Ghi chú trong báo cáo rằng bộ ca đã loại các tổ hợp nào, và vì sao.

## Đồ thị nguyên nhân–kết quả

Khi nhiều luật cùng quyết định một kết quả, hãy làm theo các bước:

1. Liệt kê **nguyên nhân** (điều kiện đầu vào) từ yêu cầu.
2. Liệt kê **kết quả** (hành động của hệ thống).
3. Nối nguyên nhân với kết quả bằng các phép VÀ, HOẶC, PHỦ ĐỊNH.
4. Chuyển đồ thị thành bảng quyết định, mỗi cột là một quy tắc.
5. Mỗi cột thành một ca kiểm thử.

Ví dụ luật phí khám: nếu khách trên 60 tuổi **và** có thẻ BHYT, thì được giảm phí; nếu không có thẻ, phí đầy đủ. Hai nguyên nhân cho ba kết quả. Bảng quyết định có ba cột, mỗi cột một ca.

## Chọn kỹ thuật nào

| Tình huống | Kỹ thuật phù hợp |
|---|---|
| Nhiều tham số độc lập, cấu hình | Pairwise |
| Luật nghiệp vụ có điều kiện VÀ, HOẶC | Đồ thị nguyên nhân–kết quả, bảng quyết định |
| Có trạng thái và chuyển trạng thái | Sơ đồ trạng thái (bài tc-03) |

## Tóm lại

- Thử hết mọi tổ hợp thường không khả thi. Pairwise là một cách chọn có căn cứ.
- Pairwise không bảo đảm bắt được lỗi cần ba tham số trở lên cùng lúc.
- Ràng buộc phải được khai báo, nếu không bộ ca sẽ chứa ca vô nghĩa.
- Với luật có điều kiện phức tạp, đồ thị nguyên nhân–kết quả giúp bạn không bỏ sót cột nào trong bảng quyết định.

Tham khảo: D. Richard Kuhn, Raghu Kacker và Yu Lei (NIST) về phủ tổ hợp; Glenford Myers (*The Art of Software Testing*) về đồ thị nguyên nhân–kết quả. Hãy kiểm tra lại nguồn trước khi trích dẫn.
