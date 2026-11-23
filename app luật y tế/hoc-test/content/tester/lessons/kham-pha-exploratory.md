# Kiểm thử khám phá

Học, thiết kế và chạy kiểm thử cùng lúc. Dùng mục tiêu (charter) và phiên làm việc có thời lượng.

Bài trình chiếu đầy đủ nằm trong mục slide của bài này. Bài tập ở cuối trang.

## Nhìn bằng hình

*Hình vẽ gốc, dùng để minh họa thứ tự các bước chính của bài.*

## Sau bài này bạn làm được gì

- Nói được kiểm thử khám phá khác kiểm thử theo kịch bản ở đâu.
- Viết được một charter (bản điều lệ) cho một phiên kiểm thử.
- Ghi chép và báo cáo một phiên đủ để người khác tái hiện lỗi.

**Thuật ngữ trong slide này:** **Kiểm thử khám phá (exploratory testing)**: Vừa học sản phẩm vừa kiểm thử, không theo kịch bản cố định nhưng có mục tiêu rõ. · **Charter (điều lệ phiên)**: Một câu mô tả mục tiêu và phạm vi của một phiên khám phá. Không ghi trước lỗi cần tìm.

## Khám phá là gì

Kiểm thử khám phá (exploratory testing) là khám phá hệ thống như một người dùng thực tế, không chỉ chạy kịch bản định sẵn. Tester dùng kiến thức, kinh nghiệm và trực giác để tìm lỗi mà các ca đã viết chưa nghĩ tới.

*Nguồn: GOV.UK Service Manual, mục Exploratory testing [đã đọc].*

**Thuật ngữ trong slide này:** **Kiểm thử khám phá (exploratory testing)**: Vừa học sản phẩm vừa kiểm thử, không theo kịch bản cố định nhưng có mục tiêu rõ.

## Khác với tự động hóa ở chỗ nào

| Tiêu chí | Kiểm thử theo kịch bản / tự động | Kiểm thử khám phá |
| --- | --- | --- |
| Câu hỏi chính | Kịch bản đã viết có chạy đúng không? | Có lỗi nào chưa ai nghĩ tới không? |
| Khi nào giỏi | Lặp lại, hồi quy, số lượng lớn | Tính năng mới, hệ thống phức tạp, rủi ro chưa rõ |
| Kết quả điển hình | Đạt/không đạt theo ca | Lỗi mới, câu hỏi về sản phẩm, rủi ro mới |

Sau khi khám phá tìm được lỗi, có thể viết ca tự động để lỗi không quay lại.

**Thuật ngữ trong slide này:** **Kiểm thử khám phá (exploratory testing)**: Vừa học sản phẩm vừa kiểm thử, không theo kịch bản cố định nhưng có mục tiêu rõ.

## Khi nào nên làm và ai làm được

- **Khi nào**: khi hệ thống đã đủ chức năng để tương tác có ý nghĩa, ví dụ trước bản beta hoặc trước khi ra mắt tính năng lớn.
- **Ai**: lý tưởng là tester có kinh nghiệm. Người có kỹ năng kiểm thử phù hợp như phân tích nghiệp vụ hay quản lý sản phẩm cũng làm tốt.

*Nguồn: GOV.UK [đã đọc].*

## Charter, mind map, timeboxing

| Kỹ thuật | Làm gì | Mẹo |
| --- | --- | --- |
| Charter (bản điều lệ) | Ghi phạm vi, mục tiêu, người làm, thời gian, môi trường, dữ liệu. Không ghi trước lỗi cần tìm. | Một câu mục tiêu là đủ, ví dụ "khám phá giỏ hàng khi đổi số lượng nhanh" |
| Mind map (sơ đồ tư duy) | Ghi nhanh các nhánh ý tưởng, không theo thứ tự tuyến tính | Vẽ ngay khi đang thử, không chờ đến cuối |
| Timeboxing (giới hạn thời gian) | Chia phiên thành khung thời gian cố định, dừng để nhìn lại kết quả | Khoảng 60 đến 90 phút mỗi phiên |

*Nguồn: GOV.UK [đã đọc].*

**Thuật ngữ trong slide này:** **Charter (điều lệ phiên)**: Một câu mô tả mục tiêu và phạm vi của một phiên khám phá. Không ghi trước lỗi cần tìm. · **Timeboxing (giới hạn thời gian)**: Đặt khung thời gian cố định cho một việc, khi hết giờ thì dừng và nhìn lại.

## Viết một charter trọn vẹn

```
Charter: Khám phá giỏ hàng khi đổi số lượng nhanh
Phạm vi: trang giỏ hàng, 3 sản phẩm có giá khác nhau
Người làm: Minh (tester)
Thời gian: 60 phút, timebox
Môi trường: Chrome, điện thoại 390px
Dữ liệu: tài khoản có 2 địa chỉ, giỏ rỗng ban đầu
Không bao gồm: thanh toán (có phiên riêng)
```

**Thuật ngữ trong slide này:** **Charter (điều lệ phiên)**: Một câu mô tả mục tiêu và phạm vi của một phiên khám phá. Không ghi trước lỗi cần tìm.

## Ghi gì trong lúc làm

- Quan sát: điều đã thấy, kể cả điều trông bình thường.
- Câu hỏi: điều chưa hiểu, cần hỏi chủ sản phẩm.
- Bằng chứng: ảnh chụp màn hình, log, bước tái hiện.
- Ý tưởng kiểm thử tiếp theo, để làm ở phiên sau.

## Một phiên 60 phút (dòng thời gian)

```
0-15 phút: thêm, bớt, đổi số lượng liên tục
  → ghi: số lượng âm có bị chặn không?
15-35 phút: tải lại trang giữa lúc đang đổi số lượng
  → thấy: tổng tiền không khớp sau khi tải lại (bằng chứng: ảnh)
35-50 phút: thử với hai tab cùng giỏ hàng
50-60 phút: viết báo cáo phiên, tạo bước tái hiện cho lỗi
```

## Một báo cáo phiên cần có gì

- Charter và phạm vi đã thực hiện.
- Lỗi tìm được, kèm bước tái hiện và bằng chứng.
- Danh sách câu hỏi và rủi ro chưa giải quyết.
- Thời gian đã dùng: thử nghiệm, điều tra lỗi, chuẩn bị.

*Nguồn: GOV.UK [đã đọc].*

**Thuật ngữ trong slide này:** **Charter (điều lệ phiên)**: Một câu mô tả mục tiêu và phạm vi của một phiên khám phá. Không ghi trước lỗi cần tìm.

## Lỗi thường gặp với khám phá

- **Tưởng là ngẫu nhiên**: khám phá có mục tiêu và ghi chép, không phải thử bừa.
- **Charter quá rộng**: "kiểm thử toàn bộ hệ thống" không tập trung được. Hãy thu nhỏ phạm vi.
- **Không ghi chép**: lỗi tìm được mà không có bước tái hiện thì đội không sửa được.
- **Phiên quá dài**: sau khoảng 90 phút, chất lượng quan sát giảm. Hãy nghỉ và chia phiên.

**Thuật ngữ trong slide này:** **Charter (điều lệ phiên)**: Một câu mô tả mục tiêu và phạm vi của một phiên khám phá. Không ghi trước lỗi cần tìm.

## Viết một charter

Viết charter cho việc khám phá chức năng tìm kiếm sản phẩm trong 45 phút. Charter phải có phạm vi, người làm, môi trường và dữ liệu. Đừng ghi lỗi cần tìm.

**Thuật ngữ trong slide này:** **Charter (điều lệ phiên)**: Một câu mô tả mục tiêu và phạm vi của một phiên khám phá. Không ghi trước lỗi cần tìm.

## Đọc thêm: Exploratory Testing

- **What is Exploratory Testing** (James Bach): http://www.satisfice.com/articles/what_is_et.shtml
- **Session Based Test Management** (Jon Bach): http://www.satisfice.com/articles/sbtm.pdf
- **Exploratory Testing** (gov.uk): https://www.gov.uk/service-manual/technology/exploratory-testing
- **Test Heuristics Cheat Sheet** (Elizabeth Hendrickson): https://web.archive.org/web/20150403174402/http://testobsessed.com/wp-content/uploads/2011/04/testheuristicscheatsheetv1.pdf

*Nguồn: FreeLearningResourcesForSoftwareTesters, mục "Exploratory Testing". Một số liên kết gốc không mở được khi soạn bài; kiểm lại trước khi đọc.*

**Thuật ngữ trong slide này:** **Kiểm thử khám phá (exploratory testing)**: Vừa học sản phẩm vừa kiểm thử, không theo kịch bản cố định nhưng có mục tiêu rõ.

## Sai ở đâu, và sửa thế nào

**Thuật ngữ trong slide này:** **Charter (điều lệ phiên)**: Một câu mô tả mục tiêu và phạm vi của một phiên khám phá. Không ghi trước lỗi cần tìm.

## Giải thích chi tiết

**Kiểm thử khám phá (exploratory testing)**

**Charter (điều lệ phiên)**

## Giải thích chi tiết

**Timeboxing (giới hạn thời gian)**

## Điều cần nhớ

- Khám phá là học và kiểm thử cùng lúc, có mục tiêu và có ghi chép.
- Charter giới hạn phạm vi, không quy định lỗi.
- Phiên 60 đến 90 phút, báo cáo đủ bước tái hiện.

**Thuật ngữ trong slide này:** **Charter (điều lệ phiên)**: Một câu mô tả mục tiêu và phạm vi của một phiên khám phá. Không ghi trước lỗi cần tìm.


## Thực hành: khám phá hay theo kịch bản

Mở [trang thực hành](thuc-hanh.html?id=kham-pha-exploratory) để làm bài mô phỏng ngay trên trình duyệt.
