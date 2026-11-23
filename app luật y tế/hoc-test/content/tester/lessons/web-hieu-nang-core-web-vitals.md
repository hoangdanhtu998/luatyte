# Web: hiệu năng và chỉ số Core Web Vitals

Đo tốc độ tải và độ ổn định của trang theo ba chỉ số được Google dùng, và cách đọc kết quả.

Bài trình chiếu đầy đủ nằm trong mục slide của bài này. Bài tập ở cuối trang.

## Nhìn bằng hình

*Hình vẽ gốc, dùng để minh họa thứ tự các bước chính của bài.*

## Ba chỉ số

| Chỉ số | Đo cái gì | Mức tốt |
| --- | --- | --- |
| LCP | Nội dung lớn nhất hiện ra sau bao lâu | Dưới 2,5 giây |
| INP | Thời gian phản hồi khi người dùng bấm | Dưới 200 ms |
| CLS | Mức độ bố cục bị nhảy | Dưới 0,1 |

## Đo ở đâu

Đo trên thiết bị và mạng giống người dùng thật, ví dụ điện thoại 4G. Đo nhiều lần và lấy giá trị ở phân vị thứ 75 của các lượt tải, không lấy một lần duy nhất. INP thay thế FID làm chỉ số tương tác từ 12/03/2024.

**Thuật ngữ trong slide này:** **Phân vị 75 (p75)**: Ngưỡng mà 75% lượt tải nhanh hơn. Dùng để đánh giá trải nghiệm chung của nhiều lượt.

## Đọc kết quả

```
LCP: 1,8 s → tốt
INP: 340 ms → cần cải thiện (kiểm xử lý JavaScript khi bấm)
CLS: 0,05 → tốt
```

## Công cụ đo

Lighthouse, PageSpeed Insights và báo cáo trong trình duyệt có thể đo các chỉ số này. Nên đặt ngưỡng trong quy trình CI để phát hiện trang bị chậm đi sau mỗi lần thay đổi.

## Sai ở đâu, và sửa thế nào

**Thuật ngữ trong slide này:** **Phân vị 75 (p75)**: Ngưỡng mà 75% lượt tải nhanh hơn. Dùng để đánh giá trải nghiệm chung của nhiều lượt.

## Giải thích chi tiết

**LCP (Largest Contentful Paint)**

**INP (Interaction to Next Paint)**

## Giải thích chi tiết

**CLS (Cumulative Layout Shift)**

**Phân vị 75 (p75)**

## Điều cần nhớ

- Ba chỉ số: LCP, INP, CLS.
- Đo nhiều lần trên thiết bị thật, đặt ngưỡng và theo dõi qua thời gian.

## Vì sao đo ở phân vị 75

Mỗi lượt tải có một kết quả khác nhau. Phân vị 75 nghĩa là 75% lượt tải nhanh hơn hoặc bằng mức này.

- Một lần đo không đủ để kết luận.
- Đo trên thiết bị yếu và mạng chậm để thấy trường hợp xấu.
- Đặt ngưỡng trong CI để phát hiện trang chậm đi sau thay đổi.

**Thuật ngữ trong slide này:** **Phân vị 75 (p75)**: Ngưỡng mà 75% lượt tải nhanh hơn. Dùng để đánh giá trải nghiệm chung của nhiều lượt.

## Đánh giá một trang với ba lượt đo

1. Đo 3 lượt, LCP lần lượt là 1800, 2400, 3100 ms.
2. Sắp xếp: 1800, 2400, 3100. Với 3 mẫu, phân vị 75 theo cách lấy hạng (làm tròn lên 0,75 × 3 = 2,25 → hạng 3) là 3100 ms.
3. Kết luận: cần cải thiện. Xem lại ảnh hoặc font tải chậm.

**Thuật ngữ trong slide này:** **Phân vị 75 (p75)**: Ngưỡng mà 75% lượt tải nhanh hơn. Dùng để đánh giá trải nghiệm chung của nhiều lượt.

## Đạt khi cả ba chỉ số đều đạt

Theo web.dev, một trang được coi là đạt khi cả LCP, INP và CLS đều đạt ngưỡng ở phân vị 75 của các lượt truy cập. Tách riêng máy tính và điện thoại khi đo.

- LCP tốt: trong 2,5 giây.
- INP tốt: 200 mili giây trở xuống.
- CLS tốt: 0,1 trở xuống.

*Nguồn: web.dev, Core Web Vitals [đã đọc].*

**Thuật ngữ trong slide này:** **Phân vị 75 (p75)**: Ngưỡng mà 75% lượt tải nhanh hơn. Dùng để đánh giá trải nghiệm chung của nhiều lượt.

## Đọc thêm: Mục mở rộng (liên quan Test Automation)

- Repo không có mục riêng về hiệu năng web. Tham khảo tài liệu công cụ trong mục Test Automation.

Nguồn: github.com/PaulWaltersDev/FreeLearningResourcesForSoftwareTesters, mục "Mục mở rộng (liên quan Test Automation)". Tìm tên tài liệu trong repo để lấy liên kết.

