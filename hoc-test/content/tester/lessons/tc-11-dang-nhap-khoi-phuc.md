# Đăng nhập, quên mật khẩu và phân trang trong Sao Mai

Bài 10 tập trung vào báo cáo. Bài này bổ sung những phần của app Sao Mai mà các bài trước chưa dạy: đăng nhập bệnh nhân, khôi phục mật khẩu, đổi mật khẩu, trang "Lịch của tôi" và phân trang ở màn hình quản trị. Đây là các chức năng hay có lỗi, vì chúng có nhiều điều kiện và nhiều đường đi.

## Sau bài này bạn làm được gì

- Mô tả đúng luật của đăng nhập, khóa tạm thời và khôi phục mật khẩu.
- Phân biệt "đổi mật khẩu" (đang đăng nhập) với "quên mật khẩu" (không nhớ mật khẩu).
- Viết ca kiểm thử cho các ranh giới: 8 ký tự, 3 lần nhập mã sai, 5 lần đăng nhập sai.
- Kiểm tra phân trang và tìm kiếm không làm mất hoặc lặp dòng.

## Đăng nhập bệnh nhân

Số điện thoại phải gồm đúng 10 chữ số và bắt đầu bằng số 0. Nếu không đúng định dạng, app báo lỗi ngay bên dưới ô nhập, chưa kiểm tra mật khẩu.

Nếu nhập sai mật khẩu liên tiếp đến đủ **5 lần** thì số điện thoại đó bị khóa đăng nhập **1 phút**. Trong lúc khóa, ngay cả mật khẩu đúng cũng không vào được. Đăng nhập đúng một lần thì bộ đếm sai được xóa.

Đây là ca hay bị bỏ sót:
- Sai 4 lần, rồi đúng: vào được, và bộ đếm về 0.
- Sai 5 lần: bị khóa. Sau khi hết 1 phút thì nhập đúng mới vào được.

Khóa theo số điện thoại chứ không theo trình duyệt. Hãy hỏi người viết yêu cầu nếu bạn chưa rõ điều này.

## Quên mật khẩu

Luồng có hai bước:

1. Nhập số điện thoại rồi bấm "Gửi mã". App không gửi tin nhắn thật. Mã xác nhận hiện ngay trong app, vì đây là app tập.
2. Nhập mã, rồi nhập mật khẩu mới và bấm "Đặt mật khẩu mới".

Luật cần kiểm:
- Mã hết hạn sau **10 phút**. Nhập mã khi đã hết hạn thì báo phải yêu cầu mã mới.
- Nhập sai mã **3 lần** thì mã bị hủy. Phải bấm "Gửi mã" lại để có mã mới.
- Mật khẩu mới phải có **ít nhất 8 ký tự**.
- Số điện thoại chưa có tài khoản thì báo "không tìm thấy", không tạo tài khoản mới.

Một điểm kiểm thử quan trọng: sau khi đặt lại thành công, mã cũ phải không dùng được nữa. Nếu mã cũ vẫn chạy được thì đó là lỗi bảo mật, không chỉ là lỗi giao diện.

## Đổi mật khẩu

Đổi mật khẩu khác quên mật khẩu ở chỗ bạn đang đăng nhập và biết mật khẩu cũ. Màn hình yêu cầu:
- Mật khẩu hiện tại phải đúng. Sai thì báo lỗi ở ô mật khẩu cũ.
- Mật khẩu mới ít nhất 8 ký tự.
- Mật khẩu mới phải khác mật khẩu cũ.

Ca dễ thiếu: nhập đúng mật khẩu cũ, mật khẩu mới 8 ký tự giống hệt mật khẩu cũ. App phải từ chối.

## Lịch của tôi

Trang này chỉ hiện lịch của số điện thoại đang đăng nhập. Đây là kiểm thử phân quyền ở mức đơn giản: người A không được thấy lịch của người B, dù biết mã lịch của người B.

Khi kiểm, hãy thử hai tài khoản và so sánh hai danh sách. Đừng chỉ nhìn một tài khoản rồi kết luận.

## Phân trang ở màn hình quản trị

Mỗi trang hiện **5 lịch**. Có nút "Trước" và "Sau". Khi lọc theo trạng thái hoặc tìm theo mã, họ tên, số điện thoại thì số trang đổi theo kết quả lọc.

Các ca cần thử:
- Trang đầu: nút "Trước" không làm gì, không báo lỗi.
- Trang cuối: nút "Sau" không làm gì.
- Đúng 5 lịch thì có 1 trang. Có 6 lịch thì có 2 trang, trang 2 chỉ có 1 dòng.
- Lọc xong rồi đổi trang: dòng hiện ra phải thuộc kết quả lọc, không lẫn dòng đã bị lọc đi.
- Không có kết quả nào: phải hiện thông báo trống, không hiện trang "1/0".

Lỗi phân trang thường không lộ ra khi dữ liệu ít. Hãy tạo đủ dữ liệu để có ít nhất 3 trang rồi mới kết luận.

## Lỗi và ngưỡng: đừng đoán

Các con số trong bài (5 lần, 1 phút, 10 phút, 3 lần, 8 ký tự) là luật của app tập. Ngoài đời, ngưỡng do người phụ trách sản phẩm và bảo mật quyết định. Khi gặp ngưỡng mới, bạn hỏi lại đúng câu: "Sai bao nhiêu lần thì khóa, khóa bao lâu?" Đừng tự đặt con số rồi kết luận app sai.

## Tóm lại

- Đăng nhập: khóa 1 phút sau 5 lần sai, đúng một lần thì reset bộ đếm.
- Quên mật khẩu: mã 10 phút, sai 3 lần thì hủy, mật khẩu mới từ 8 ký tự.
- Đổi mật khẩu: cần mật khẩu cũ, mật khẩu mới khác mật khẩu cũ.
- Phân trang: 5 dòng mỗi trang, kiểm cả trang đầu, trang cuối và lúc lọc.
- Mở app tập bằng nút "Mở app tập" ở đầu bài để tự thử từng luật trên.
