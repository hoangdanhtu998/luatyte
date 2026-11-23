# Kiểm thử cơ sở dữ liệu cho tester

Người dùng chỉ nhìn thấy giao diện. Nhưng dữ liệu thật nằm trong cơ sở dữ liệu. Một màn hình hiện đúng số tiền vẫn có thể là sai nếu bản ghi trong DB lệch. Tester không cần làm DBA, nhưng phải biết đọc dữ liệu và đối soát được.

Bài này dạy ba việc: đọc dữ liệu bằng SQL cơ bản, kiểm ràng buộc, và đối soát từ giao diện xuống cơ sở dữ liệu.

## Sau bài này bạn làm được gì

- Viết truy vấn SELECT đơn giản và JOIN để kiểm quan hệ giữa các bảng.
- Kiểm ràng buộc khóa chính, khóa ngoại, duy nhất, không rỗng và kiểm tra giá trị.
- Đối soát một con số từ giao diện xuống API và xuống bảng dữ liệu.
- Làm việc an toàn với dữ liệu: không ghi vào dữ liệu thật khi chưa được phép.

## Đọc dữ liệu bằng SELECT và JOIN

Ví dụ hai bảng:

- `hoc_vien(id, ho_ten)`
- `bai_nop(id, hoc_vien_id, diem)`

Tìm học viên chưa nộp bài nào:

```sql
SELECT h.id, h.ho_ten
FROM hoc_vien h
LEFT JOIN bai_nop b ON b.hoc_vien_id = h.id
WHERE b.id IS NULL;
```

Vì sao dùng LEFT JOIN? INNER JOIN chỉ giữ các dòng có khớp ở cả hai bảng, nên sẽ bỏ mất đúng những học viên bạn cần tìm. LEFT JOIN giữ mọi học viên, và điều kiện `IS NULL` lọc ra những người không có bài nộp.

Khi viết truy vấn, luôn đếm kết quả trước: số dòng có hợp lý không? Nếu bảng có 30 học viên mà truy vấn trả 300 dòng, rất có thể bạn đã nối sai khóa.

## Ràng buộc: DB phải tự chặn lỗi

Các loại ràng buộc thường gặp:

- **Khóa chính (PRIMARY KEY):** không trùng, không rỗng.
- **Khóa ngoại (FOREIGN KEY):** không trỏ tới bản ghi không tồn tại.
- **Duy nhất (UNIQUE):** ví dụ số điện thoại không được trùng.
- **Không rỗng (NOT NULL):** trường bắt buộc.
- **Kiểm tra giá trị (CHECK):** ví dụ điểm từ 0 đến 10.

Khi kiểm một ràng buộc, hãy thử đưa dữ liệu sai vào và xem DB có từ chối không. Nếu ứng dụng chặn trước, hãy kiểm thêm trường hợp gọi API trực tiếp, vì ràng buộc phải nằm ở tầng dữ liệu, không chỉ ở giao diện.

## Đối soát: từ giao diện xuống DB

Cùng một con số đi qua nhiều tầng: giao diện, API, backend, cơ sở dữ liệu. Đối soát là so sánh con số đó ở từng tầng.

Ví dụ đơn hàng:

| Tầng | Giá trị |
|---|---|
| Giao diện | 150.000 |
| API trả về | 150.000 |
| Bảng `don_hang.tong_tien` | 150.000 |
| Tổng `chi_tiet` cộng lại | 140.000 |

Dòng cuối lệch 10.000. Đây là phát hiện, không phải kết luận về nguyên nhân. Hãy ghi lại: lệch ở đâu, con số nào, truy vấn nào đã dùng. Sau đó mới điều tra xem backend tính sai hay dữ liệu chi tiết bị thiếu.

Quy tắc: không tự sửa dữ liệu để khớp nhau. Sửa dữ liệu là việc của người có quyền, sau khi nguyên nhân đã rõ.

## An toàn khi làm việc với dữ liệu

- Ưu tiên SELECT. Chạy trên cơ sở dữ liệu thử nghiệm.
- Không UPDATE, DELETE, DROP hay TRUNCATE trên dữ liệu thật khi chưa được phép bằng văn bản.
- Truy vấn diện rộng phải có LIMIT hoặc điều kiện cụ thể.
- Không đưa dữ liệu cá nhân vào báo cáo. Che hoặc thay bằng mã giả.

## Tóm lại

- Dùng LEFT JOIN và `IS NULL` để tìm dòng không có bản ghi tương ứng.
- Ràng buộc phải nằm ở tầng dữ liệu. Thử đưa dữ liệu sai qua API để kiểm.
- Đối soát một con số qua các tầng. Lệch là phát hiện cần điều tra, không tự sửa.
- Làm việc an toàn: đọc trước, ghi chỉ khi được phép.

Tham khảo: Martin Kleppmann (*Designing Data-Intensive Applications*) về tính toàn vẹn dữ liệu; tài liệu SQL của các hệ quản trị bạn dùng. Kiểm tra lại cú pháp theo đúng hệ quản trị trước khi áp dụng.
