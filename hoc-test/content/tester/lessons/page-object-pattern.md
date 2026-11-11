# Mẫu Page Object trong tự động hóa

Tách thông tin về trang khỏi kịch bản test, để khi giao diện đổi chỉ sửa một chỗ.

Bài trình chiếu đầy đủ nằm trong mục slide của bài này. Bài tập ở cuối trang.

## Nhìn bằng hình

*Hình vẽ gốc, dùng để minh họa thứ tự các bước chính của bài.*

## Sau bài này bạn làm được gì

- Giải thích vì sao test trực tiếp trên HTML dễ vỡ.
- Thiết kế một Page Object với giao diện theo nghiệp vụ.
- Biết khi nào không nên đặt assertion trong Page Object.

**Thuật ngữ trong slide này:** **Page Object**: Lớp bọc một trang giao diện, chứa các hàm nghiệp vụ như đăng nhập, để kịch bản không phụ thuộc HTML.

## Vấn đề: test dính vào HTML

Khi test tìm trực tiếp phần tử bằng selector, mỗi lần giao diện đổi (đổi id, đổi cấu trúc thẻ), nhiều test vỡ cùng lúc. Người sửa phải đi tìm từng chỗ dùng selector đó.

*Nguồn: Martin Fowler, Page Object [đã đọc].*

**Thuật ngữ trong slide này:** **Page Object**: Lớp bọc một trang giao diện, chứa các hàm nghiệp vụ như đăng nhập, để kịch bản không phụ thuộc HTML. · **Selector**: Chuỗi dùng để tìm một phần tử trên trang, như theo id, class hoặc đường dẫn.

## Giải pháp: bọc trang bằng một API riêng

Page Object bọc một trang (hoặc một phần của trang) bằng các hàm có tên theo nghiệp vụ. Test chỉ nói "đăng nhập với user này", còn Page Object biết phải bấm ô nào, nút nào.

**Thuật ngữ trong slide này:** **Page Object**: Lớp bọc một trang giao diện, chứa các hàm nghiệp vụ như đăng nhập, để kịch bản không phụ thuộc HTML.

## Trước và sau

```
// Trước: test biết HTML
find("#email").type("a@b.vn")
find("#pass").type("123456")
find("button.btn-primary").click()

// Sau: test nói nghiệp vụ
LoginPage.open()
  .dangNhap("a@b.vn", "123456")
```

## Thiết kế giao diện theo người dùng

| Thành phần giao diện | Hàm nên có | Ví dụ |
| --- | --- | --- |
| Ô nhập liệu | Getter và setter kiểu chuỗi | page.email = "a@b.vn" |
| Checkbox | Kiểu boolean | page.nhoDangNhap = true |
| Nút bấm | Tên hành động | page.dangNhap() |

Phép thử đơn giản: nếu đổi loại widget (ví dụ từ ô nhập sang combobox) mà giao diện của Page Object không đổi, thiết kế đã đúng.

**Thuật ngữ trong slide này:** **Page Object**: Lớp bọc một trang giao diện, chứa các hàm nghiệp vụ như đăng nhập, để kịch bản không phụ thuộc HTML.

## Không cần một Page Object cho mỗi trang

- Tạo cho các thành phần quan trọng: danh sách, từng mục trong danh sách, header, footer.
- Đừng để lộ các tầng chỉ phục vụ dựng giao diện. Mô hình hóa theo cái người dùng thấy.
- Khi điều hướng sang trang khác, hàm trả về Page Object của trang mới.

*Nguồn: Fowler [đã đọc].*

**Thuật ngữ trong slide này:** **Page Object**: Lớp bọc một trang giao diện, chứa các hàm nghiệp vụ như đăng nhập, để kịch bản không phụ thuộc HTML.

## Có nên đặt kiểm tra trong Page Object

Fowler có hai quan điểm được trình bày. Bên ủng hộ cho rằng đặt assertion giảm trùng lặp và báo lỗi rõ hơn. Bên phản đối cho rằng nó làm Page Object phình ra và trộn trách nhiệm. Fowler ưu tiên giữ assertion ngoài Page Object, và dùng thư viện assertion chung. Ngoại lệ là kiểm tra trạng thái bất biến của trang.

*Nguồn: Fowler [đã đọc].*

**Thuật ngữ trong slide này:** **Page Object**: Lớp bọc một trang giao diện, chứa các hàm nghiệp vụ như đăng nhập, để kịch bản không phụ thuộc HTML.

## Page Object có thật sự giúp không

Nghiên cứu Leotta và cộng sự (ICSTW 2013), được nhắc trong bài của Fowler, cho thấy: với bộ test dùng Page Object, ca đầu tiên tốn thêm thời gian để xây dựng, nhưng các ca sau được cập nhật nhanh hơn nhiều khi giao diện đổi.

**Thuật ngữ trong slide này:** **Page Object**: Lớp bọc một trang giao diện, chứa các hàm nghiệp vụ như đăng nhập, để kịch bản không phụ thuộc HTML.

## Những cái bẫy hay gặp

- **Bất đồng bộ**: trang đang tải thì không bấm được. Page Object nên chờ đúng điều kiện, không chờ cố định bằng số giây.
- **Logic nghiệp vụ trong UI**: nếu logic nằm quá nhiều trong giao diện, hãy chuyển nó xuống tầng dưới để test nhanh hơn.
- **DSL**: mô tả kịch bản bằng ngôn ngữ tự nhiên (như Cucumber) đặt ở trên Page Object.

*Nguồn: Fowler [đã đọc].*

**Thuật ngữ trong slide này:** **Page Object**: Lớp bọc một trang giao diện, chứa các hàm nghiệp vụ như đăng nhập, để kịch bản không phụ thuộc HTML.

## Đếm chỗ phải sửa

Có 12 ca test cùng dùng selector của nút "Thanh toán". Khi nút đổi selector: không dùng Page Object phải sửa bao nhiêu chỗ? Có Page Object thì sửa bao nhiêu chỗ? Vì sao?

**Thuật ngữ trong slide này:** **Page Object**: Lớp bọc một trang giao diện, chứa các hàm nghiệp vụ như đăng nhập, để kịch bản không phụ thuộc HTML. · **Selector**: Chuỗi dùng để tìm một phần tử trên trang, như theo id, class hoặc đường dẫn.

## Đọc thêm: Page Object và tự động hóa

- **Page Object Pattern** (Martin Fowler): https://martinfowler.com/bliki/PageObject.html
- **Screenplay Pattern** (Serenity): http://serenity-bdd.info/docs/articles/screenplay-tutorial.html
- **Selenium Documentation**: http://docs.seleniumhq.org/docs/
- **WebdriverIO** (binding Node.js): http://webdriver.io/

*Nguồn: FreeLearningResourcesForSoftwareTesters, mục "Test Automation".*

**Thuật ngữ trong slide này:** **Page Object**: Lớp bọc một trang giao diện, chứa các hàm nghiệp vụ như đăng nhập, để kịch bản không phụ thuộc HTML.

## Sai ở đâu, và sửa thế nào

**Thuật ngữ trong slide này:** **Selector**: Chuỗi dùng để tìm một phần tử trên trang, như theo id, class hoặc đường dẫn.

## Giải thích chi tiết

**Page Object**

**Selector**

## Giải thích chi tiết

**DSL (ngôn ngữ mô tả nghiệp vụ)**

## Điều cần nhớ

- Selector chỉ nằm ở một chỗ, trong Page Object.
- Giao diện của Page Object nói bằng nghiệp vụ.
- Giữ assertion ở ngoài, trừ kiểm tra trạng thái bất biến của trang.

**Thuật ngữ trong slide này:** **Page Object**: Lớp bọc một trang giao diện, chứa các hàm nghiệp vụ như đăng nhập, để kịch bản không phụ thuộc HTML. · **Selector**: Chuỗi dùng để tìm một phần tử trên trang, như theo id, class hoặc đường dẫn.


## Thực hành: tổ chức Page Object

Mở [trang thực hành](thuc-hanh.html?id=page-object-pattern) để làm bài mô phỏng ngay trên trình duyệt.
