# Kiểm thử ứng dụng di động

Thiết bị và hệ điều hành đa dạng, mạng yếu, ngắt cuộc gọi và xoay màn hình. Công cụ Espresso và XCUITest.

Bài trình chiếu đầy đủ nằm trong mục slide của bài này. Bài tập ở cuối trang.

## Nhìn bằng hình

*Hình vẽ gốc, dùng để minh họa thứ tự các bước chính của bài.*

## Sau bài này bạn làm được gì

- Nêu những khác biệt khiến kiểm thử di động khó hơn web.
- Lập ma trận thiết bị cho một ứng dụng.
- Biết công cụ tự động cho Android và iOS trong repo.

**Thuật ngữ trong slide này:** **Ma trận thiết bị (device matrix)**: Bảng liệt kê các máy và hệ điều hành sẽ kiểm, kèm lý do chọn từng máy.

## Di động khác web ở đâu

- **Thiết bị**: nhiều máy, nhiều kích thước màn hình, nhiều phiên bản hệ điều hành.
- **Mạng**: hay chuyển từ Wi-Fi sang 4G, hoặc mất sóng.
- **Ngắt quãng**: cuộc gọi, thông báo, chuyển ứng dụng, khóa màn hình.
- **Tài nguyên**: pin yếu, bộ nhớ ít, máy nóng.

*Kiến thức chung về kiểm thử di động [kiến thức chung].*

**Thuật ngữ trong slide này:** **Ngắt quãng (interruption)**: App bị gián đoạn bởi cuộc gọi, thông báo, chuyển ứng dụng, hoặc mất mạng.

## Ma trận thiết bị

Không thể thử hết mọi máy. Chọn một nhóm đại diện: một máy Android phổ biến, một máy iOS phổ biến, một máy màn hình nhỏ, và một bản hệ điều hành cũ còn nhiều người dùng. Ghi lý do chọn mỗi máy.

## Mất mạng giữa lúc thanh toán

```
1. Mở giỏ hàng, bấm Thanh toán
2. Tắt Wi-Fi và dữ liệu di động đúng lúc bấm
3. Kỳ vọng: thông báo mất mạng rõ ràng
4. Bật mạng lại, bấm thử lại
Kỳ vọng: không bị trừ tiền hai lần, giỏ hàng còn nguyên
```

## Những ca nên có

- Xoay màn hình khi đang nhập dữ liệu: dữ liệu còn không?
- Nhận cuộc gọi giữa lúc đang làm: ứng dụng có quay lại đúng chỗ không?
- Đưa ứng dụng xuống nền rồi mở lại sau vài phút.
- Khóa và mở màn hình khi đang tải.

*Kiến thức chung [kiến thức chung].*

## Android và iOS

| Nền tảng | Công cụ trong repo | Việc làm |
| --- | --- | --- |
| Android | Espresso (hai bài viết của Novoda) | Kiểm thử giao diện trên máy hoặc giả lập |
| iOS | XCUITest (một bài viết) | Kiểm thử giao diện bằng Xcode |
| Đa nền tảng | Appium | Một bộ ca cho cả hai, dùng driver riêng cho từng nền tảng |

*Tên công cụ lấy từ repo và bài tổng quan. Chưa đọc được bài Espresso của Novoda khi soạn bài này.*

## Ma trận cho một app thanh toán

| Thiết bị | Hệ điều hành | Lý do chọn |
| --- | --- | --- |
| Máy Android giá trung bình | Android bản hiện tại | Nhiều người dùng ở Việt Nam |
| iPhone | iOS bản hiện tại | Trình duyệt và giao diện khác |
| Máy màn hình nhỏ | Android bản cũ | Kiểm bố cục và chữ bị cắt |

## Ca nào cần máy thật

Trong các ca trên, ca nào giả lập không đủ? Gợi ý: pin yếu, cuộc gọi thật, mạng thật.

## Đọc thêm: kiểm thử di động

- **Espresso** (Android): hai bài viết của Novoda trong repo.
- **XCUITest** (iOS): bài viết trong repo.

*Nguồn: FreeLearningResourcesForSoftwareTesters, mục "Mobile Testing". Liên kết gốc nằm trong repo, chưa kiểm lại khi soạn bài.*

## Sai ở đâu, và sửa thế nào

**Thuật ngữ trong slide này:** **Ma trận thiết bị (device matrix)**: Bảng liệt kê các máy và hệ điều hành sẽ kiểm, kèm lý do chọn từng máy.

## Giải thích chi tiết

**Ma trận thiết bị (device matrix)**

**Simulator / emulator**

## Giải thích chi tiết

**Ngắt quãng (interruption)**

## Điều cần nhớ

- Kiểm cả hai nền tảng, không chỉ một.
- Kiểm mạng, xoay màn hình và bị ngắt giữa chừng.
- Chọn ma trận thiết bị có lý do, ghi lại lý do đó.

**Thuật ngữ trong slide này:** **Ma trận thiết bị (device matrix)**: Bảng liệt kê các máy và hệ điều hành sẽ kiểm, kèm lý do chọn từng máy.

