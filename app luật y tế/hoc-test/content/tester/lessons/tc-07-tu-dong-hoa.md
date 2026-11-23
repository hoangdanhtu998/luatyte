# Tự động hóa những ca đáng tự động

Bản 1.1 sắp về. Bạn sẽ phải chạy lại bảng quyết định phí, các ca biên ngày khám, các ca API. Rồi bản 1.2 lại chạy lại. Chạy tay lần thứ ba, bạn bắt đầu bỏ bớt ca, và lỗi lọt đúng ở ca bị bỏ.

Tự động hóa sinh ra để giải bài toán này. Nhưng người mới thường tự động hóa sai chỗ: viết kịch bản bấm qua giao diện cho mọi thứ, rồi dành cả tuần sửa kịch bản mỗi khi nút đổi chỗ. Quyết định quan trọng nhất là **chọn ca nào**, sau đó mới đến viết thế nào.

## Sau bài này bạn làm được gì

- Chọn ca đáng tự động hóa theo tiêu chí rõ ràng.
- Quyết định đặt một ca ở tầng nào: quy tắc, API hay giao diện.
- Đọc hiểu và chạy một file kiểm thử tự động mẫu cho app Sao Mai.
- Viết ca tự động độc lập, chạy lại được vào bất kỳ ngày nào.

## Ca nào đáng tự động hóa

Một ca đáng tự động hóa khi có đủ các điều sau:

| Tiêu chí | Câu hỏi tự kiểm |
|---|---|
| Chạy lại nhiều lần | Ca này có phải chạy ở mọi bản dựng không? |
| Kết quả mong đợi xác định | Máy có so sánh được đúng sai mà không cần người nhìn không? |
| Rủi ro cao | Nếu ca này hỏng mà không ai biết thì hậu quả thế nào? |
| Ổn định | Phần được kiểm có thay đổi liên tục không? |

Ca **không nên** tự động hóa:

- Phiên khám phá. Giá trị của nó nằm ở việc người kiểm đổi hướng theo điều vừa thấy.
- Đánh giá bằng mắt: bố cục có dễ dùng không, chữ có dễ đọc không.
- Ca chỉ chạy một lần.
- Phần giao diện đang được thiết kế lại hằng tuần.

## Đặt ca ở tầng nào

Một cách hình dung quen thuộc là kim tự tháp kiểm thử của Mike Cohn: nhiều ca ở tầng thấp, ít ca ở tầng giao diện.

| Tầng | Kiểm gì | Tốc độ | Độ bền |
|---|---|---|---|
| Quy tắc, đơn vị | Hàm tính phí, hàm kiểm ngày | Rất nhanh | Cao |
| API | Mã trạng thái, dữ liệu trả về, quyền | Nhanh | Cao |
| Giao diện | Luồng người dùng từ đầu đến cuối | Chậm | Thấp, dễ vỡ khi giao diện đổi |

Áp vào Sao Mai: bảng quyết định phí có 12 tổ hợp. Kiểm 12 lần qua giao diện nghĩa là điền form 12 lần. Kiểm qua API là 12 yêu cầu chạy trong chưa đến một giây. Chỉ giữ ở tầng giao diện những gì **chỉ giao diện mới có**: luồng đặt lịch từ đầu đến cuối, và lỗi bấm đúp.

## Bốn tính chất của một ca tự động tốt

1. **Độc lập.** Ca tự chuẩn bị dữ liệu của mình và chạy được một mình, theo thứ tự bất kỳ.
2. **Lặp lại được.** Chạy hôm nay hay ba tháng sau đều cho cùng kết quả. Với Sao Mai, điều này nghĩa là phải cố định ngày hệ thống.
3. **Một ca, một lý do không đạt.** Tên ca nói rõ nó kiểm gì. Khi nó đỏ, bạn biết ngay cái gì hỏng.
4. **Không đạt thì phải đáng tin.** Ca lúc đạt lúc không (flaky) còn tệ hơn không có ca, vì nó dạy cả nhóm bỏ qua kết quả đỏ.

## File mẫu trong dự án

Thư mục `hoc-test/lab/tests/` của repo có file `dat-lich.spec.js`, viết bằng Playwright, một công cụ tự động hóa trình duyệt mã nguồn mở. File mẫu có:

- Bước chuẩn bị chung: cố định ngày hệ thống và đặt lại dữ liệu trước mỗi ca.
- Nhóm ca tầng API, gọi thẳng `Lab.api(...)` trong trang.
- Hai ca tầng giao diện: luồng đặt lịch và bấm đúp.

Trích một ca:

```js
test('R7: người đúng 60 tuổi được giảm 20%', async ({ page }) => {
  const r = await api(page, 'POST', '/appointments', lich({ age: 60 }));
  expect(r.body.fee).toBe(120000);
});
```

Đọc ca này bạn thấy ngay: yêu cầu nào, dữ liệu gì, mong đợi con số nào. Đó là hình mẫu để viết ca của riêng bạn.

Cách chạy ghi ở đầu file. Bạn cần Node.js trên máy và chạy lệnh cài Playwright một lần. Trên bản 1.0, một số ca **sẽ không đạt**. Điều đó đúng: ca tự động đang bắt được lỗi cài sẵn. Một bộ ca tự động toàn màu xanh trên một bản có lỗi mới là điều đáng lo.

Để bạn đối chiếu: khi soạn bài, file mẫu gồm 14 ca đã được chạy thử. Trên bản 1.0 có 5 ca đạt và 9 ca không đạt. Trên bản 1.1 có 6 ca đạt và 8 ca không đạt. Nếu số của bạn khác, hãy tìm hiểu vì sao trước khi tin kết quả. Một điều đáng để ý: ca "R4: ngày thứ 30 được nhận" vẫn đạt trên bản 1.1 dù giao diện bản 1.1 từ chối ngày đó. Hãy tự giải thích vì sao sau khi làm xong bài 6 và bài 8.

## Nếu máy bạn không cài được gì

Bạn vẫn làm được phần quan trọng nhất của bài: chọn ca và lập luận. Ngoài ra, mở [app tập](lab/index.html), bấm F12, vào tab Console và gõ:

```js
Lab.api('POST', '/appointments', { name: 'Thử', phone: '0912345678', age: 60, doctor: 'mai', service: 'thuong', bhyt: false, date: Lab.plus(3), time: '10:00' })
```

Bạn vừa gọi API bằng mã. Mọi kịch bản tự động, về bản chất, là nhiều dòng như vậy cộng với phép so sánh kết quả.

## Việc cần làm

1. Mở [sổ tay](lab/so-tay.html), mục Bài 7. Từ bộ ca của bài 3 và bài 6, chọn tối đa 8 ca để tự động hóa, ghi lý do và tầng.
2. Ghi 3 ca bạn quyết định không tự động hóa và vì sao.
3. Nếu có Node.js: chạy file mẫu trên bản 1.0, ghi số ca đạt và không đạt. Viết thêm một ca của riêng bạn.
4. Tự chấm, so với bài mẫu.

## Sai lầm hay gặp

- **Tự động hóa mọi thứ qua giao diện.** Chậm, dễ vỡ, tốn công bảo trì.
- **Ca phụ thuộc nhau.** Ca 5 chỉ đạt khi ca 4 chạy trước.
- **Ca phụ thuộc ngày thật.** Đạt vào thứ Ba, không đạt vào thứ Bảy.
- **Sửa ca cho xanh thay vì báo lỗi.** Ca đỏ vì sản phẩm sai thì việc cần làm là báo lỗi.
- **Coi tự động hóa là thay thế kiểm thử.** Kịch bản chỉ kiểm lại điều bạn đã nghĩ ra. Nó không tìm ra điều mới.

## Thuật ngữ

**Kiểm thử hồi quy (regression testing)**: chạy lại ca cũ để phát hiện phần đang chạy đúng bị hỏng sau thay đổi. · **Ca khói (smoke test)**: vài ca chạy nhanh để biết bản dựng có đáng kiểm tiếp không. · **Ca chập chờn (flaky test)**: ca cho kết quả lúc đạt lúc không dù sản phẩm không đổi. · **Playwright**: công cụ mã nguồn mở để điều khiển trình duyệt bằng mã.
