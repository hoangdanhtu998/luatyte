# Checklist kiểm thử giao diện

Dùng trước mỗi lần đẩy lên site. Mục nào đánh dấu [tự động] đã có kết quả kiểm tra; mục còn lại cần kiểm tra bằng mắt hoặc tai.

## 1. Tải trang và tài nguyên
- [ ] [tự động] Các trang chính trả về 200: index, hoc, triet-hoc, tam-quan, dao-duc, ly_thuyet, tin_luat, tham_chieu, bai-giang, slides (kèm lesson), 404.
- [ ] [tự động] Trang chủ: hàm tìm kiếm luật (LYTSearch) đã tải; có 51 mục luật.
- [ ] Không có lỗi JavaScript trong console trên mỗi trang (kiểm tra bằng DevTools).

## 2. Bố cục
- [ ] [tự động] Ở 375px không tràn ngang: index, triet-hoc, slides.
- [ ] [tự động] Ở 1440px, thẻ slide rộng khoảng 1120px và có chân slide (tên bài và số trang).
- [ ] Ở 1280px, trang bài Triết học không bị khung trợ lý che nội dung.
- [ ] Ở 463px, khung trợ lý nằm dưới đáy, không đè tiêu đề hay ô chọn giao diện.
- [ ] Thanh tab trên máy tính chia 5 cột đều, không có tab lẻ ở hàng dưới.

## 3. Màu và giao diện
- [ ] [tự động] Nền trang trắng; nút và ô tính năng màu tím nhạt.
- [ ] [tự động] Bo góc: thẻ tối đa 8px, nút và nhãn 6px.
- [ ] Logo vuông hiển thị trên tab trình duyệt và trên trang.
- [ ] Không còn chữ tương phản kém (màu chữ nhạt trên nền trắng).

## 4. Slide
- [ ] [tự động] Slide Triết học mở được; nhãn phần, tiêu đề và gạch đầu dòng hiển thị.
- [ ] [tự động] Ô "Tự chuyển slide" có mặt; tốc độ mặc định 0.9×.
- [ ] Bấm "Giọng đọc": đoạn đang đọc được tô nhạt, khung lời giảng bên dưới hiện đúng đoạn.
- [ ] Đổi người giảng: câu mở đầu đọc đúng giọng; lời dẫn đầu đoạn đổi theo người giảng.
- [ ] Bật "Tự chuyển slide": hết slide này thì sang slide sau và đọc tiếp.
- [ ] Trắc nghiệm: chọn đáp án, hiện đúng/sai và giải thích.

## 5. Trang bài
- [ ] "Nghe cả bài" đọc từ tiêu đề đến hết trang, đoạn đang đọc được làm sáng và tự cuộn theo.
- [ ] Thanh "Nghe cả bài" nằm dưới tiêu đề, không che nội dung.
- [ ] Mục lục: trên máy tính hiện ở cột trái; "Ẩn mục lục" không đè tiêu đề.

## 6. Âm thanh
- [ ] Giọng đọc vais1000 (giáo viên) nghe rõ; không có đoạn bị cắt giữa chừng.
- [ ] Đổi tốc độ giữa chừng: đoạn hiện tại đọc lại đúng tốc độ mới.
- [ ] Dừng giữa chừng rồi bấm lại: đọc tiếp đúng vị trí.

## 7. Trình duyệt và thiết bị
- [ ] Chrome và Edge trên máy tính.
- [ ] Safari trên iPhone và Chrome trên Android (kiểm tra bố cục 375px và nút bấm).
- [ ] Chế độ tối của hệ điều hành không làm chữ biến mất.

## Kết quả lần kiểm tra gần nhất
Ngày 09/11/2026, kiểm tự động trên Chrome (trình điều khiển của phiên làm việc):
- Các trang chính đều trả về 200.
- Ở 375px: index và triet-hoc không tràn ngang; slides không tràn ngang.
- Ở 1440px: thẻ slide 1120px, có chân slide.
- Chưa kiểm tra bằng mắt, chưa nghe giọng, chưa kiểm tra trên Safari và Android.
