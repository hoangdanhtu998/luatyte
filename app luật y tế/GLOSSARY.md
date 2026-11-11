# Học luật y tế

App học luật y tế: ôn văn bản pháp luật, trắc nghiệm, lý thuyết theo chương, thi thử và lộ trình theo vai trò. Thuật ngữ dưới đây là cách gọi thống nhất trong dữ liệu (`data/`) và code (`js/`).

## Văn bản và trạng thái

**Văn bản pháp luật**:
Một quy định cụ thể (thông tư, nghị định, luật) có số hiệu, ngày ban hành và ngày hiệu lực. Mỗi văn bản là một mục trong `data/laws.json`.
_Avoid_: luật (khi nói về một văn bản cụ thể), tài liệu

**Trạng thái văn bản**:
Tình trạng hiệu lực của văn bản: `on` (còn hiệu lực), `amend` (đã bị sửa đổi, bổ sung), `het` (hết hiệu lực).
_Avoid_: tình trạng, tình hình

**Số hiệu**:
Mã định danh chính thức của văn bản, ví dụ "36/2025/TT-BYT".
_Avoid_: mã văn bản, số văn bản

## Câu hỏi và ngân hàng

**Câu hỏi**:
Một câu trắc nghiệm có nhiều phương án và một đáp án đúng, kèm giải thích và nguồn. Lưu trong các file `data/quiz*.json`, `tf.json`, `factpairs.json`.
_Avoid_: bài tập, item, đề (đề là tập hợp nhiều câu)

**Ngân hàng câu hỏi**:
Một file gom câu hỏi theo nhóm, ví dụ `quiz_bhyt.json` (BHYT), `quiz_his.json` (phần mềm HIS), `quiz_lythuyet.json` (câu lý thuyết).
_Avoid_: bộ câu, kho đề

**Câu verify**:
Câu hỏi chưa đối chiếu được với văn bản gốc. Vẫn hiện ở nơi học, nhưng bị loại khỏi thi thử theo chương và khỏi lộ trình theo vai.
_Avoid_: câu nháp, câu chưa duyệt

## Chương và lý thuyết

**Chương**:
Một đơn vị nội dung lý thuyết có mã (`c1`, `c2`, …) và tên, gồm các bước học theo thứ tự. Lưu trong `data/ly_thuyet.json`.
_Avoid_: bài, module, unit

**Chuyên đề**:
Nhóm câu hỏi theo một văn bản hoặc một lĩnh vực, dùng để lọc đề thi thử. Tên chuyên đề được lưu vào lượt thi và hiện ở tab Tiến độ.
_Avoid_: môn

## Vai trò và lộ trình

**Vai trò**:
Một nhóm người học theo nghề, hiện có 5 vai: Điều dưỡng, Bác sĩ, Dược sĩ, Nhân viên BHYT / kế toán, Nhân viên HIS. Lưu trong `data/lo-trinh-vai-tro.json`.
_Avoid_: nghề, persona, người dùng loại

**Lộ trình theo vai**:
Thứ tự chương và câu hỏi gợi ý cho một vai, kèm danh sách văn bản liên quan và số câu.
_Avoid_: kế hoạch học, khóa học

**Chương chuyên môn**:
Chương gắn riêng cho một vai. Chương dùng chung cho mọi vai (`c10`, `c11`) không tính vào số này.
_Avoid_: chương riêng

## Thi thử và tiến độ

**Thi thử**:
Đề luyện do app tự tạo từ ngân hàng câu hỏi. Không phải cấu trúc đề thi chính thức, nên không gọi là "sát đề thật".
_Avoid_: thi thật, đề chính thức, kỳ thi

**Đề theo chương**:
Đề thi thử được chia số câu theo tỉ lệ số câu có sẵn của từng chương. Mỗi câu chỉ thuộc một chương.
_Avoid_: đề tổng hợp

**Chương yếu**:
Trong một lượt thi, chương có từ 3 câu trở lên trong đề và chưa trả lời đúng hết. App hiện 2 chương thấp nhất.
_Avoid_: chương kém, điểm yếu

**Tiến độ**:
Tổng hợp số câu đã làm, lịch sử thi và mục tiêu hằng ngày của người học, lưu trên máy và đồng bộ khi có đăng nhập.
_Avoid_: thống kê, báo cáo

**Chế độ tĩnh**:
Chạy trên GitHub Pages không có máy chủ học. Tiến độ chỉ lưu trên máy, không có đồng bộ hay đăng nhập.
_Avoid_: offline, bản live cũ
