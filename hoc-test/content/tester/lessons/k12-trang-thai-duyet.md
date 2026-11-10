# K12: kiểm thử quy trình duyệt và phiên bản

Học liệu đi qua nháp, chờ duyệt, đã duyệt, yêu cầu sửa và bị chặn. Mỗi lần sửa tạo phiên bản mới. Kiểm thử các chuyển trạng thái.

Bài trình chiếu đầy đủ nằm trong mục slide của bài này. Bài tập ở cuối trang.

## Nhìn bằng hình

*Hình vẽ gốc, dùng để minh họa thứ tự các bước chính của bài.*

## Giáo viên sửa bài đang dùng

Một bài đã được duyệt đang có học sinh luyện tập. Tác giả sửa lỗi chính tả. Câu hỏi của tester: học sinh có bị đổi nội dung giữa buổi học không? Bản nào đang hiển thị?

*Nguồn: Thư viện Học liệu K12 (README và backend/tests của repo), đã đọc. README: "Mỗi lần sửa tạo một phiên bản mới. Học sinh và giáo viên luôn thấy bản đã duyệt."*

**Thuật ngữ trong slide này:** **Phiên bản (version)**: Bản ghi nội dung tại một thời điểm, để có thể quay lại hoặc so sánh.

## Sơ đồ chuyển trạng thái

```
        sửa / tạo
  [Nháp] ───────────────┐
    │ gửi duyệt            │
    ▼                      │
  [Chờ duyệt] ──duyệt──▶ [Đã duyệt] ──sửa──▶ (bản mới, vẫn hiển thị bản cũ)
    │  ▲                   
    │  └─ sửa lại ─[Yêu cầu sửa]
    └──── yêu cầu sửa ──▶ [Yêu cầu sửa]
  [Chờ duyệt] ──chặn──▶ [Bị chặn] ──gỡ chặn──▶ [Đã duyệt]
```

*Sơ đồ là cách tôi tóm tắt từ mô tả trong README. Kiểm lại trên app thật trước khi dùng làm đặc tả.*

## Chuyển nào hợp lệ

| Từ | Sang | Hợp lệ? | Ghi chú |
| --- | --- | --- | --- |
| Nháp | Chờ duyệt | Có | Tác giả gửi duyệt |
| Chờ duyệt | Đã duyệt | Có | Quản trị nội dung duyệt |
| Chờ duyệt | Yêu cầu sửa | Có | Quản trị nội dung yêu cầu sửa |
| Yêu cầu sửa | Chờ duyệt | Có | Tác giả gửi lại |
| Đã duyệt | Nháp | Có | Sửa tạo bản mới, bản duyệt vẫn hiển thị |
| Nháp | Đã duyệt | Không | Không được bỏ qua bước duyệt |
| Học sinh | Bất kỳ | Không | Học sinh không đổi trạng thái |

**Thuật ngữ trong slide này:** **Trạng thái (state)**: Tình trạng hiện tại của một đối tượng, quyết định nó phản ứng thế nào với sự kiện.

## Ca bỏ qua duyệt

Thử đưa một học liệu từ Nháp thẳng sang Đã duyệt bằng cách gọi API trực tiếp. Kỳ vọng: bị từ chối, và bản đang hiển thị cho học sinh không đổi.

## Kiểm bản đang hiển thị

```
Trước: bản v3 đã duyệt, học sinh thấy v3
Tác giả sửa thành v4 (nháp)
Kiểm: học sinh vẫn thấy v3
Quản trị duyệt v4
Kiểm: học sinh thấy v4, lịch sử còn v3
```

*Nguồn: Thư viện Học liệu K12 (README và backend/tests của repo), đã đọc. Đây là các ca suy ra từ mô tả phiên bản trong README.*

**Thuật ngữ trong slide này:** **Phiên bản (version)**: Bản ghi nội dung tại một thời điểm, để có thể quay lại hoặc so sánh.

## Test có trong repo

- **test_roles_and_workflow**: kiểm vai trò đi cùng quy trình duyệt.
- **test_ai_edit**: sửa bằng AI có tạo phiên bản mới, không ghi đè bản đã duyệt.

*Nguồn: Thư viện Học liệu K12 (README và backend/tests của repo), đã đọc. Tên test lấy từ backend/tests/test_api.py. Nội dung chi tiết từng test chưa đọc hết.*

**Thuật ngữ trong slide này:** **Phiên bản (version)**: Bản ghi nội dung tại một thời điểm, để có thể quay lại hoặc so sánh.

## Sai ở đâu, và sửa thế nào

**Thuật ngữ trong slide này:** **Trạng thái (state)**: Tình trạng hiện tại của một đối tượng, quyết định nó phản ứng thế nào với sự kiện. · **Phiên bản (version)**: Bản ghi nội dung tại một thời điểm, để có thể quay lại hoặc so sánh.

## Giải thích chi tiết

**Trạng thái (state)**

**Chuyển trạng thái (transition)**

## Giải thích chi tiết

**Phiên bản (version)**

## Điều cần nhớ

- Kiểm cả chuyển hợp lệ lẫn chuyển bị cấm.
- Kiểm bản nào đang hiển thị sau mỗi thao tác.
- Lịch sử phiên bản không được mất.

**Thuật ngữ trong slide này:** **Phiên bản (version)**: Bản ghi nội dung tại một thời điểm, để có thể quay lại hoặc so sánh.

