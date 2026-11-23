// Dữ liệu của sổ tay kiểm thử: đề bài, khung mẫu, tiêu chí tự chấm, bài mẫu và đáp án lỗi cài sẵn.
// File này chứa đáp án. App tập (core.js, ui.js) không đọc file này.
window.SoTayData = {
  lessons: [
    {
      id: 'tc-01-nhan-du-an',
      title: 'Bài 1 · Câu hỏi làm rõ yêu cầu',
      task: 'Đọc bản nháp yêu cầu trong bài 1. Viết ít nhất 8 câu hỏi gửi người phụ trách nghiệp vụ. Mỗi câu chỉ ra chỗ mơ hồ và đưa ví dụ cụ thể khiến hai người có thể hiểu khác nhau.',
      template: `| # | Câu trong bản nháp | Mơ hồ ở đâu | Ví dụ gây hiểu khác nhau | Câu hỏi gửi BA |
|---|---|---|---|---|
| 1 |  |  |  |  |
| 2 |  |  |  |  |`,
      rubric: [
        'Có ít nhất 8 câu hỏi, mỗi câu gắn với một câu cụ thể trong bản nháp.',
        'Có câu hỏi về giá trị ở đúng ranh giới (ví dụ: đúng 16 tuổi, đúng 60 tuổi, ngày thứ 30).',
        'Có câu hỏi về thứ tự áp dụng khi hai quy tắc phí cùng đúng.',
        'Có câu hỏi về việc lịch đã hủy có trả lại chỗ hay không.',
        'Mỗi câu hỏi trả lời được bằng một quyết định rõ, không phải câu hỏi mở kiểu "phần này chạy thế nào?".',
      ],
      sample: `1. "Tên không được quá ngắn hoặc quá dài": ngắn nhất và dài nhất là bao nhiêu ký tự? Khoảng trắng ở đầu và cuối có tính không? Tên chỉ gồm khoảng trắng có hợp lệ không?
2. "Số điện thoại hợp lệ": đúng 10 chữ số hay chấp nhận cả 11? Có nhận dạng +84 không?
3. "Trẻ em cần người giám hộ": trẻ em là dưới bao nhiêu tuổi? Người đúng 16 tuổi có cần không?
4. "Đặt trước tối đa một tháng": một tháng là 30 ngày hay tính theo tháng lịch? Ngày thứ 30 có nhận không? Có đặt được cho ngay hôm nay không?
5. "Nghỉ cuối tuần": nghỉ cả Thứ bảy và Chủ nhật hay chỉ Chủ nhật?
6. "Nghỉ trưa từ 11:30 đến 13:00": khung 11:30 có nhận không? Khung 13:00 có nhận không?
7. "Mỗi khung giờ nhận tối đa 3 người": tính theo từng bác sĩ hay cả phòng khám? Lịch đã hủy có trả lại chỗ không?
8. "Người cao tuổi được giảm giá": từ bao nhiêu tuổi, giảm bao nhiêu? Người đúng 60 tuổi có được giảm không?
9. "Có BHYT được giảm thêm": trừ trước hay sau khi giảm theo tuổi? Trẻ được miễn phí mà có BHYT thì phí là 0đ hay âm?
10. "Người bệnh có thể hủy lịch": hủy được ở trạng thái nào? Đã khám rồi có hủy được không? Sát giờ khám có hủy được không?
11. "Tra cứu bằng mã lịch": chỉ cần mã lịch thì ai có mã cũng xem được thông tin người khác. Có cần thêm số điện thoại không?
12. Bấm Đặt lịch hai lần liên tiếp thì hệ thống tạo một hay hai lịch?`,
    },
    {
      id: 'tc-02-rui-ro-chien-luoc',
      title: 'Bài 2 · Bảng rủi ro và kế hoạch kiểm thử một trang',
      task: 'Lập bảng rủi ro cho ít nhất 8 khu vực của app (khả năng xảy ra × mức ảnh hưởng, thang 1 đến 3). Từ đó viết kế hoạch một trang: phạm vi, thứ tự ưu tiên, cách kiểm, điều kiện dừng.',
      template: `## Bảng rủi ro
| Khu vực | Điều tệ nhất có thể xảy ra | Khả năng (1-3) | Ảnh hưởng (1-3) | Điểm | Cách kiểm |
|---|---|---|---|---|---|
|  |  |  |  |  |  |

## Kế hoạch một trang
- Trong phạm vi:
- Ngoài phạm vi:
- Thứ tự ưu tiên:
- Môi trường và dữ liệu:
- Điều kiện dừng kiểm thử:
- Rủi ro của chính kế hoạch này:`,
      rubric: [
        'Có ít nhất 8 khu vực, mỗi khu vực ghi rõ hậu quả cụ thể với người bệnh hoặc phòng khám.',
        'Phí khám, lộ thông tin khi tra cứu và sức chứa khung giờ nằm trong nhóm điểm cao nhất.',
        'Thứ tự kiểm đi từ điểm rủi ro cao xuống thấp, không đi theo thứ tự màn hình.',
        'Ghi rõ phần ngoài phạm vi (thanh toán, tin nhắn nhắc lịch).',
        'Điều kiện dừng đo được, ví dụ: chạy hết ca ưu tiên cao và không còn lỗi mức Nghiêm trọng hoặc Cao đang mở.',
      ],
      sample: `## Bảng rủi ro (rút gọn)
| Khu vực | Điều tệ nhất | Khả năng | Ảnh hưởng | Điểm | Cách kiểm |
|---|---|---|---|---|---|
| Tra cứu lịch | Người lạ xem được thông tin người bệnh | 2 | 3 | 6 | Ca phủ định: sai SĐT, sai mã, qua cả giao diện và API |
| Phí khám | Thu sai tiền, hiện số âm | 3 | 3 | 9 | Bảng quyết định tuổi × loại khám × BHYT, thử đúng biên 6 và 60 |
| Sức chứa khung giờ | Bác sĩ bị xếp quá 3 người một khung | 2 | 3 | 6 | Biên 3 và 4, kết hợp hủy lịch |
| Ngày và giờ khám | Nhận lịch vào ngày nghỉ, giờ nghỉ | 3 | 2 | 6 | Biên ngày (hôm nay, +1, +30, +31), từng thứ trong tuần, khung quanh giờ trưa |
| Trạng thái lịch | Hủy được lịch đã khám, sai sổ sách | 2 | 3 | 6 | Sơ đồ chuyển trạng thái, thử cả chuyển không hợp lệ |
| Đặt trùng | Bấm hai lần tạo hai lịch | 2 | 2 | 4 | Bấm đúp, bấm lại khi đang gửi |
| Quản trị | Dò được PIN vì không khóa | 2 | 3 | 6 | Sai 5 lần liên tiếp, lần thứ 6 |
| Dữ liệu nhập | Tên chứa mã HTML làm vỡ bảng quản trị | 2 | 3 | 6 | Nhập thẻ HTML vào họ tên rồi xem ở mọi nơi hiển thị |
| API | Bỏ qua kiểm tra của giao diện | 3 | 3 | 9 | Gửi dữ liệu sai thẳng vào API |
| Giao diện nhỏ, trình đọc màn hình | Không dùng được trên điện thoại | 2 | 2 | 4 | 375px, kiểm nhãn ô nhập |

## Kế hoạch một trang
- Trong phạm vi: đặt lịch, tra cứu, hủy, quản trị, API, R1 đến R12, N1 đến N3.
- Ngoài phạm vi: thanh toán trực tuyến, tin nhắn nhắc lịch, tải nhiều người dùng cùng lúc.
- Thứ tự: phí và API (9 điểm) → tra cứu, sức chứa, ngày giờ, trạng thái, quản trị, dữ liệu nhập (6 điểm) → đặt trùng, giao diện nhỏ (4 điểm).
- Môi trường: Chrome bản mới trên máy tính, giả lập 375px. Cố định "Ngày hệ thống" để ca về ngày chạy lại được. Đặt lại dữ liệu mẫu trước mỗi phiên.
- Điều kiện dừng: đã chạy hết ca ưu tiên cao, mọi lỗi Nghiêm trọng và Cao đã có báo cáo, đã có một phiên khám phá cho mỗi khu vực 6 điểm trở lên.
- Rủi ro của kế hoạch: API là bản mô phỏng nên chưa kiểm được mạng chậm và nhiều người đặt cùng lúc.`,
    },
    {
      id: 'tc-03-thiet-ke-ca',
      title: 'Bài 3 · Bộ ca kiểm thử',
      task: 'Viết ca kiểm thử cho R3 (tuổi, người giám hộ), R4 (ngày khám), R7 (phí, dùng bảng quyết định) và R9 (trạng thái, dùng sơ đồ chuyển trạng thái). Mỗi ca có dữ liệu cụ thể và kết quả mong đợi lấy từ tài liệu yêu cầu.',
      template: `## Ca biên
| Mã ca | Yêu cầu | Dữ liệu vào | Kết quả mong đợi | Kết quả thực tế | Đạt? |
|---|---|---|---|---|---|
| TC-01 | R3 |  |  |  |  |

## Bảng quyết định phí (R7)
| # | Tuổi | Loại khám | BHYT | Phí mong đợi |
|---|---|---|---|---|
| 1 |  |  |  |  |

## Chuyển trạng thái (R9)
| # | Trạng thái đầu | Hành động | Mong đợi |
|---|---|---|---|
| 1 |  |  |  |`,
      rubric: [
        'Mỗi ngưỡng số được thử ở cả hai phía: tuổi 15 và 16, 59 và 60, 5 và 6, 120 và 121.',
        'Ngày khám có đủ: hôm nay, ngày mai, ngày thứ 30, ngày thứ 31, một Thứ bảy, một Chủ nhật.',
        'Bảng quyết định phí có tổ hợp trẻ dưới 6 tuổi kèm BHYT và người từ 60 tuổi kèm BHYT.',
        'Phần trạng thái có cả chuyển không hợp lệ: hủy lịch Đã khám, hủy lịch Đã hủy.',
        'Kết quả mong đợi là con số hoặc thông báo cụ thể, không ghi "hoạt động đúng".',
        'Đã chạy các ca trên bản 1.0 và ghi kết quả thực tế.',
      ],
      sample: `## Ca biên (trích)
| Mã ca | Yêu cầu | Dữ liệu vào | Kết quả mong đợi |
|---|---|---|---|
| TC-01 | R3 | Tuổi 120 | Nhận |
| TC-02 | R3 | Tuổi 121 | Báo lỗi tuổi |
| TC-03 | R3 | Tuổi 15, không có người giám hộ | Báo lỗi cần người giám hộ |
| TC-04 | R3 | Tuổi 16, không có người giám hộ | Nhận |
| TC-05 | R4 | Ngày = hôm nay | Báo lỗi ngày |
| TC-06 | R4 | Ngày = hôm nay + 1 (không phải Chủ nhật) | Nhận |
| TC-07 | R4 | Ngày = hôm nay + 30 (không phải Chủ nhật) | Nhận |
| TC-08 | R4 | Ngày = hôm nay + 31 | Báo lỗi ngày |
| TC-09 | R4 | Một Thứ bảy trong 30 ngày tới | Nhận |
| TC-10 | R4 | Một Chủ nhật trong 30 ngày tới | Báo lỗi nghỉ Chủ nhật |

Mẹo: đặt "Ngày hệ thống" về một ngày cố định để hôm nay + 30 không rơi vào Chủ nhật.

## Bảng quyết định phí (R7)
| # | Tuổi | Loại khám | BHYT | Cách tính | Phí mong đợi |
|---|---|---|---|---|---|
| 1 | 5 | Thường | Không | Miễn phí | 0đ |
| 2 | 5 | Thường | Có | Miễn phí, trừ BHYT, không âm | 0đ |
| 3 | 6 | Thường | Không | Giá gốc | 150.000đ |
| 4 | 30 | Thường | Có | 150.000 - 50.000 | 100.000đ |
| 5 | 59 | Thường | Không | Giá gốc | 150.000đ |
| 6 | 60 | Thường | Không | 150.000 × 80% | 120.000đ |
| 7 | 60 | Thường | Có | 120.000 - 50.000 | 70.000đ |
| 8 | 30 | Chuyên khoa | Không | Giá gốc | 300.000đ |
| 9 | 70 | Chuyên khoa | Có | 300.000 × 80% - 50.000 | 190.000đ |
| 10 | 5 | Chuyên khoa | Có | Miễn phí, không âm | 0đ |

## Chuyển trạng thái (R9)
| # | Trạng thái đầu | Hành động | Mong đợi |
|---|---|---|---|
| 1 | Chờ xác nhận | Quản trị xác nhận | Đã xác nhận |
| 2 | Đã xác nhận | Quản trị ghi đã khám | Đã khám |
| 3 | Chờ xác nhận, ngày tương lai | Người bệnh hủy | Đã hủy |
| 4 | Đã xác nhận, ngày tương lai | Người bệnh hủy | Đã hủy |
| 5 | Đã khám | Tìm nút hủy ở Tra cứu và Quản trị | Không có nút hủy |
| 6 | Đã hủy | Tìm nút hủy | Không có nút hủy |
| 7 | Đã hủy | Xem lại khung giờ đó ở màn Đặt lịch | Số chỗ còn tăng lên 1 |`,
    },
    {
      id: 'tc-04-phien-kham-pha',
      title: 'Bài 4 · Phiên kiểm thử khám phá',
      task: 'Viết một charter, chạy một phiên 45 phút trên bản 1.0, ghi chép trong lúc làm. Kết thúc phiên viết phần tổng kết: đã phủ gì, chưa phủ gì, lỗi và câu hỏi.',
      template: `## Charter
Khám phá [khu vực] bằng [cách làm, dữ liệu, công cụ] để tìm [loại thông tin, loại rủi ro].

## Ghi chép phiên
- Thời gian bắt đầu:
- Bản dựng, trình duyệt, ngày hệ thống:
- Ghi chép theo thời gian (việc đã thử → điều quan sát được):

## Tổng kết
- Đã phủ:
- Chưa phủ:
- Lỗi tìm được (mã trong sổ lỗi):
- Câu hỏi cần hỏi lại:
- Ý tưởng cho phiên sau:
- Tỷ lệ thời gian: kiểm thử ..% · điều tra và ghi lỗi ..% · chuẩn bị ..%`,
      rubric: [
        'Charter nêu đủ ba phần: khu vực, cách làm, loại rủi ro muốn tìm.',
        'Ghi chép đủ chi tiết để người khác lặp lại được điều bạn đã làm.',
        'Có thử điều nằm ngoài kịch bản thông thường: bấm đúp, quay lại rồi gửi lại, dán dữ liệu lạ, đổi dữ liệu giữa chừng.',
        'Phần "chưa phủ" được ghi thật, không để trống.',
        'Mỗi lỗi tìm được đã có một dòng trong sổ lỗi.',
      ],
      sample: `## Charter
Khám phá luồng đặt lịch và hủy lịch bằng cách đặt nhiều lịch vào cùng một khung giờ, bấm nhanh và hủy xen kẽ, để tìm lỗi về sức chứa khung giờ và lịch bị tạo trùng.

## Ghi chép phiên (trích)
- 09:00 Bản 1.0, Chrome, ngày hệ thống cố định. Đã đặt lại dữ liệu mẫu.
- 09:03 BS. Lan, hôm nay + 2, 09:00 đang có 2 lịch mẫu. Ô chọn giờ ghi "còn 1 chỗ".
- 09:06 Đặt lịch thứ 3 → thành công. Ô chọn giờ vẫn cho chọn 09:00, ghi "còn 0 chỗ". Lạ: đã đủ 3 mà chưa khóa.
- 09:08 Đặt lịch thứ 4 → thành công. LỖI: vượt quá 3 lịch (R6).
- 09:15 Khung 10:00 trống. Bấm Đặt lịch hai lần thật nhanh → vào Quản trị thấy 2 lịch giống hệt, mã khác nhau. LỖI (R8).
- 09:24 Hủy một lịch ở khung đã đầy rồi quay lại Đặt lịch → khung vẫn ghi đã đủ. LỖI: lịch hủy không trả chỗ (R6).
- 09:31 Đổi bác sĩ sau khi chọn giờ → danh sách giờ nạp lại, giờ đang chọn được giữ. Không thấy bất thường.

## Tổng kết
- Đã phủ: sức chứa, bấm đúp, hủy rồi đặt lại, đổi bác sĩ giữa chừng.
- Chưa phủ: hai tab cùng đặt một khung, hủy từ phía quản trị, dùng trên điện thoại.
- Lỗi: 3 (vượt sức chứa, tạo trùng, hủy không trả chỗ).
- Câu hỏi: khi khung còn 0 chỗ, ô chọn giờ nên ẩn hay làm mờ khung đó?
- Phiên sau: charter riêng cho trạng thái lịch qua màn Quản trị.
- Thời gian: kiểm thử 60% · điều tra và ghi lỗi 30% · chuẩn bị 10%.`,
    },
    {
      id: 'tc-05-bao-cao-loi-triage',
      title: 'Bài 5 · Báo cáo lỗi và phân loại',
      task: 'Chọn 3 lỗi bạn đã tìm được, viết báo cáo đầy đủ trong mục Sổ lỗi. Sau đó xếp toàn bộ lỗi trong sổ theo thứ tự nên sửa trước và ghi lý do.',
      template: `## Thứ tự nên sửa
| Hạng | Mã lỗi | Mức nghiêm trọng | Mức ưu tiên | Lý do xếp hạng |
|---|---|---|---|---|
| 1 |  |  |  |  |

## Lỗi tôi đề nghị chưa sửa trong bản này, và vì sao
- `,
      rubric: [
        'Tiêu đề mỗi lỗi nói được: ở đâu, làm gì, sai thế nào. Đọc tiêu đề là hình dung được lỗi.',
        'Các bước tái hiện bắt đầu từ trạng thái rõ ràng (bản dựng, dữ liệu mẫu, ngày hệ thống) và người khác làm theo được.',
        'Kết quả mong đợi dẫn mã yêu cầu (ví dụ R7).',
        'Mức nghiêm trọng và mức ưu tiên được ghi riêng, có lý do.',
        'Mỗi báo cáo chỉ nói về một lỗi.',
        'Bảng xếp hạng đặt lỗi lộ thông tin và lỗi sai tiền lên trên lỗi trình bày.',
      ],
      sample: `### Báo cáo mẫu
**Tiêu đề:** [Đặt lịch] Người đúng 60 tuổi không được giảm 20% phí khám

**Môi trường:** Bản 1.0, Chrome trên Windows, dữ liệu mẫu, ngày hệ thống cố định.

**Các bước:**
1. Mở màn Đặt lịch.
2. Nhập Tuổi = 60, Loại khám = Khám thường, không chọn BHYT.
3. Xem dòng "Phí dự kiến".

**Kết quả thực tế:** Phí dự kiến 150.000đ. Đặt lịch xong, phiếu cũng ghi 150.000đ.

**Kết quả mong đợi:** 120.000đ. Theo R7, người từ đủ 60 tuổi được giảm 20%.

**Ghi chú thêm:** Tuổi 61 ra 120.000đ (đúng). Tuổi 59 ra 150.000đ (đúng). Lỗi chỉ xảy ra ở đúng 60 tuổi, có vẻ điều kiện so sánh dùng "lớn hơn" thay cho "lớn hơn hoặc bằng".

**Mức nghiêm trọng:** Cao. Thu sai tiền của người bệnh.
**Mức ưu tiên:** Cao. Ảnh hưởng mọi người bệnh đúng 60 tuổi, cách sửa nhỏ.

### Thứ tự nên sửa (gợi ý)
1. Tra cứu sai số điện thoại vẫn ra lịch: lộ thông tin người bệnh.
2. API nhận dữ liệu không hợp lệ: mọi kiểm tra ở giao diện bị vô hiệu.
3. Các lỗi phí (đúng 60 tuổi, phí âm): sai tiền.
4. Vượt sức chứa, hủy không trả chỗ, tạo trùng lịch: sai lịch làm việc của bác sĩ.
5. Sai ngày nghỉ, đặt được hôm nay, hủy được lịch đã khám, không khóa PIN, tên chứa HTML.
6. Các lỗi biên của họ tên, số điện thoại, tuổi, khung 11:30.
7. Nhãn ô nhập, bảng quản trị trên màn nhỏ, mã trạng thái API, định dạng tiền.

Đề nghị chưa sửa trong bản này: định dạng tiền ở màn Tra cứu và mã 200 thay cho 201. Hai lỗi này không làm sai nghiệp vụ, có thể gom vào bản sau.`,
    },
    {
      id: 'tc-06-api',
      title: 'Bài 6 · Kiểm thử API',
      task: 'Lập bảng ca cho bốn đường dẫn API: ca hợp lệ, ca dữ liệu sai, ca sai phương thức, ca kiểm quyền xem. Chạy trên bản 1.0 bằng mục API của app và ghi mã trạng thái thực tế.',
      template: `| # | Yêu cầu | Thân hoặc tham số | Mã mong đợi | Mã thực tế | Ghi chú |
|---|---|---|---|---|---|
| 1 | GET /slots |  | 200 |  |  |`,
      rubric: [
        'Mỗi đường dẫn có ít nhất một ca hợp lệ và hai ca không hợp lệ.',
        'Có ca gửi thẳng vào API dữ liệu mà giao diện chặn (tuổi âm, thiếu số điện thoại, ngày Chủ nhật).',
        'Có ca xem và hủy lịch của người khác bằng số điện thoại sai.',
        'Có ca thao tác trên mã lịch không tồn tại.',
        'Sau mỗi ca POST hoặc DELETE có kiểm lại trạng thái dữ liệu, không chỉ nhìn mã trả về.',
      ],
      sample: `| # | Yêu cầu | Thân hoặc tham số | Mong đợi | Ghi chú |
|---|---|---|---|---|
| 1 | GET /slots?doctor=lan&date=(hôm nay + 2) | | 200, khung 09:00 có booked = 2 | So với dữ liệu mẫu |
| 2 | GET /slots?doctor=abc&date=(hôm nay + 2) | | 400 | Bác sĩ không tồn tại |
| 3 | GET /slots?doctor=lan | | 400 | Thiếu date |
| 4 | POST /appointments | Thân hợp lệ | 201, có mã SM- | Kiểm lại bằng GET |
| 5 | POST /appointments | age = -5 | 400 | Giao diện chặn, API cũng phải chặn |
| 6 | POST /appointments | Bỏ trường phone | 400 | |
| 7 | POST /appointments | date là Chủ nhật | 400 | |
| 8 | POST /appointments | time = "12:00" | 400 | Giờ nghỉ trưa |
| 9 | POST /appointments | Khung đã đủ 3 lịch | 409 | Chuẩn bị dữ liệu trước |
| 10 | GET /appointments/SM-100001?phone=0901000001 | | 200 | |
| 11 | GET /appointments/SM-100001?phone=0999999999 | | 404 | Không được lộ thông tin |
| 12 | GET /appointments/SM-999999?phone=0901000001 | | 404 | |
| 13 | DELETE /appointments/SM-100001?phone=0901000001 | | 200, trạng thái Đã hủy | Kiểm lại bằng GET |
| 14 | DELETE /appointments/SM-999999?phone=0901000001 | | 404 | |
| 15 | DELETE /appointments/SM-100004?phone=0901000004 | | 409 | Lịch đã khám |
| 16 | PUT /appointments/SM-100001 | | 405 | |

Nguyên tắc: kiểm tra dữ liệu phải nằm ở phía máy chủ. Giao diện chặn rồi vẫn phải gửi thẳng dữ liệu sai vào API.`,
    },
    {
      id: 'tc-07-tu-dong-hoa',
      title: 'Bài 7 · Chọn ca để tự động hóa',
      task: 'Từ bộ ca của bài 3 và bài 6, chọn tối đa 8 ca đáng tự động hóa nhất và ghi lý do. Ghi thêm 3 ca bạn quyết định không tự động hóa và vì sao. Nếu máy có Node.js, chạy file mẫu trong lab/tests rồi viết thêm một ca của riêng bạn.',
      template: `## Ca chọn tự động hóa
| # | Ca | Lý do đáng tự động | Tầng (giao diện hay lõi/API) |
|---|---|---|---|
| 1 |  |  |  |

## Ca không tự động hóa
| # | Ca | Lý do |
|---|---|---|
| 1 |  |  |

## Kết quả chạy file mẫu (nếu chạy được)
- Số ca đạt, không đạt:
- Ca tôi viết thêm:`,
      rubric: [
        'Ca được chọn là ca phải chạy lại nhiều lần và có kết quả mong đợi rõ ràng (phí, biên, sức chứa).',
        'Phần lớn ca được đặt ở tầng thấp (API hoặc quy tắc), chỉ vài ca đi qua giao diện.',
        'Ca dùng ngày tháng có cố định ngày hệ thống.',
        'Mỗi ca tự chuẩn bị dữ liệu của mình, không phụ thuộc ca chạy trước.',
        'Có nêu ca không nên tự động hóa: khám phá, đánh giá bố cục bằng mắt, ca chỉ chạy một lần.',
      ],
      sample: `## Ca chọn tự động hóa
| # | Ca | Lý do | Tầng |
|---|---|---|---|
| 1 | Bảng quyết định phí, 10 tổ hợp | Quy tắc tiền, dễ hỏng khi sửa, kết quả là con số | API |
| 2 | Biên tuổi 120, 121 và 15, 16 | Lỗi biên hay quay lại | API |
| 3 | Biên ngày: hôm nay, +1, +30, +31, Thứ bảy, Chủ nhật | Phụ thuộc ngày, người kiểm tay dễ nhầm | API, cố định ngày hệ thống |
| 4 | Sức chứa: lịch thứ 3 nhận, lịch thứ 4 trả 409 | Quy tắc lõi của lịch khám | API |
| 5 | Hủy lịch trả lại chỗ | Liên quan hai quy tắc, đã từng lỗi | API |
| 6 | Tra cứu sai số điện thoại trả 404 | Rủi ro lộ thông tin, phải kiểm ở mọi bản | API |
| 7 | Đặt lịch thành công từ đầu đến cuối trên giao diện | Luồng chính, một ca khói | Giao diện |
| 8 | Bấm đúp nút Đặt lịch chỉ tạo một lịch | Chỉ tái hiện được trên giao diện | Giao diện |

## Ca không tự động hóa
| # | Ca | Lý do |
|---|---|---|
| 1 | Phiên khám phá | Giá trị nằm ở việc người kiểm đổi hướng theo điều vừa thấy |
| 2 | Đánh giá bố cục ở 375px có dễ dùng không | Cần mắt người, máy chỉ kiểm được tràn ngang |
| 3 | Kiểm một lần nội dung ghi chú phát hành | Chạy một lần, tự động hóa không hoàn vốn |`,
    },
    {
      id: 'tc-08-hoi-quy-ban-moi',
      title: 'Bài 8 · Kiểm lại lỗi đã sửa và hồi quy trên bản 1.1',
      task: 'Đọc ghi chú phát hành bản 1.1 trong tài liệu yêu cầu. Kiểm lại từng mục F1 đến F6. Chọn và chạy bộ ca hồi quy cho phần liên quan. Ghi kết quả vào bảng.',
      template: `## Kiểm lại lỗi đã sửa
| Mục | Ca đã chạy | Kết quả trên 1.1 | Kết luận (Đóng hay Mở lại) |
|---|---|---|---|
| F1 |  |  |  |

## Hồi quy
| Khu vực bị ảnh hưởng bởi lần sửa | Ca đã chạy lại | Kết quả |
|---|---|---|
|  |  |  |

## Lỗi mới phát hiện trên 1.1
- `,
      rubric: [
        'Mỗi mục F1 đến F6 có ca cụ thể đã chạy, không ghi "đã kiểm, ổn".',
        'Có mục bị mở lại kèm bằng chứng.',
        'Phần hồi quy chọn theo khu vực liên quan đến chỗ đã sửa: phí, ngày khám, sức chứa, tra cứu.',
        'Đã chạy lại các ca biên của ngày khám và bảng quyết định phí trên 1.1.',
        'Lỗi mới trên 1.1 được ghi vào sổ lỗi, có ghi rõ "bản 1.0 không có lỗi này".',
      ],
      sample: `## Kiểm lại lỗi đã sửa
| Mục | Ca đã chạy | Kết quả trên 1.1 | Kết luận |
|---|---|---|---|
| F1 | Tuổi 120 và 121 | 120 nhận, 121 báo lỗi | Đóng |
| F2 | Một Thứ bảy và một Chủ nhật | Thứ bảy nhận, Chủ nhật báo lỗi | Đóng |
| F3 | Đặt lịch thứ 3 và thứ 4 vào một khung | Thứ 3 nhận, thứ 4 bị chặn | Đóng |
| F4 | Trẻ 5 tuổi có BHYT | Không còn số âm, nhưng xem phần lỗi mới | Đóng mục phí âm |
| F5 | Tra cứu SM-100001 với SĐT sai, qua giao diện và API | Báo không tìm thấy, API trả 404 | Đóng |
| F6 | Bấm đúp nút Đặt lịch | Vẫn tạo 2 lịch | Mở lại |

## Hồi quy
| Khu vực | Ca đã chạy lại | Kết quả |
|---|---|---|
| Phí (liên quan F4) | Toàn bộ bảng quyết định phí | Trẻ 5 tuổi: 150.000đ thay vì 0đ. Lỗi mới. |
| Ngày khám (liên quan F2) | Hôm nay, +1, +30, +31 | Ngày +30 bị từ chối. Lỗi mới. |
| Sức chứa (liên quan F3) | Hủy rồi đặt lại | Lịch hủy vẫn chiếm chỗ. Lỗi cũ, chưa nằm trong danh sách sửa. |
| Tra cứu (liên quan F5) | Đúng cả hai, sai mã | Đúng |

## Lỗi mới trên 1.1
- Trẻ dưới 6 tuổi bị tính phí đầy đủ. Bản 1.0 tính 0đ. Nghi do lần sửa F4.
- Ngày thứ 30 bị từ chối. Bản 1.0 nhận. Nghi do lần sửa F2.`,
    },
    {
      id: 'tc-09-phi-chuc-nang',
      title: 'Bài 9 · Bảo mật cơ bản, khả năng truy cập, màn hình nhỏ',
      task: 'Chạy danh sách kiểm nhanh cho N1, N2, N3 và R11 trên bản 1.0. Ghi phát hiện kèm cách bạn kiểm.',
      template: `| # | Điều cần kiểm | Cách kiểm | Kết quả | Mã lỗi (nếu có) |
|---|---|---|---|---|
| 1 | Dữ liệu nhập hiển thị dạng chữ thuần (N1) |  |  |  |
| 2 | Khóa đăng nhập quản trị (R11) |  |  |  |
| 3 | Nhãn của ô nhập (N2) |  |  |  |
| 4 | Dùng được bằng bàn phím |  |  |  |
| 5 | Màn 375px (N3) |  |  |  |`,
      rubric: [
        'Đã nhập thẻ HTML vào họ tên và xem ở mọi nơi tên được hiển thị: phiếu, tra cứu, bảng quản trị.',
        'Đã thử sai PIN đủ 5 lần và lần thứ 6.',
        'Đã kiểm nhãn từng ô nhập bằng công cụ của trình duyệt hoặc bằng cách bấm vào chữ nhãn.',
        'Đã đi hết form bằng phím Tab và gửi bằng Enter.',
        'Đã xem cả bốn màn ở 375px, kể cả bảng quản trị.',
      ],
      sample: `| # | Điều cần kiểm | Cách kiểm | Kết quả |
|---|---|---|---|
| 1 | N1 | Đặt lịch với họ tên là <h1>Hoa</h1>. Xem phiếu, màn Tra cứu, bảng Quản trị | Phiếu và Tra cứu hiện đúng chuỗi đã nhập. Bảng Quản trị hiện chữ Hoa cỡ lớn: tên bị hiểu thành HTML. LỖI |
| 2 | R11 | Nhập PIN sai 5 lần, thử lần thứ 6, rồi nhập PIN đúng | Không lần nào bị khóa. LỖI |
| 3 | N2 | Bấm vào chữ nhãn từng ô xem con trỏ có nhảy vào ô. Mở DevTools, tab Accessibility, xem tên của ô | Ô số điện thoại không có nhãn, chỉ có chữ gợi ý mờ trong ô. LỖI |
| 4 | Bàn phím | Tab qua toàn bộ form, Enter để gửi | Đi được hết, thấy viền focus. Đạt |
| 5 | N3 | DevTools, chế độ thiết bị, rộng 375px. Mở cả bốn màn | Bảng Quản trị bị cắt bên phải, không cuộn ngang được, không bấm được nút thao tác. LỖI |

Ghi chú về N1: app tập đã chặn việc chạy mã để an toàn cho người học. Trên hệ thống thật, chỗ hiển thị thiếu mã hóa như vậy thường dẫn tới lỗi XSS lưu trữ, nên xếp mức Cao.`,
    },
    {
      id: 'tc-10-bao-cao-phat-hanh',
      title: 'Bài 10 · Báo cáo kết thúc và khuyến nghị phát hành',
      task: 'Viết báo cáo kết thúc kiểm thử cho bản 1.1, dài tối đa một trang, gửi người quyết định phát hành. Kết luận rõ: phát hành, phát hành có điều kiện, hay chưa phát hành.',
      template: `## Kết luận (viết phần này trước)
Khuyến nghị:
Lý do chính:

## Đã kiểm gì
-

## Chưa kiểm gì và rủi ro còn lại
-

## Số liệu
| Chỉ số | Giá trị |
|---|---|
| Ca đã chạy / đạt / không đạt |  |
| Lỗi đang mở theo mức nghiêm trọng |  |
| Lỗi đã đóng sau khi kiểm lại |  |
| Lỗi mở lại |  |

## Lỗi chặn phát hành
| Mã | Tiêu đề | Vì sao chặn |
|---|---|---|

## Điều kiện để phát hành`,
      rubric: [
        'Kết luận nằm ngay đầu, một câu, không nước đôi.',
        'Mỗi lỗi chặn phát hành có lý do bằng hậu quả với người bệnh hoặc phòng khám.',
        'Có mục "chưa kiểm gì" ghi thật.',
        'Số liệu lấy từ sổ lỗi và bộ ca của chính bạn, không ước lượng.',
        'Điều kiện phát hành cụ thể đến mức đội phát triển biết phải làm gì.',
        'Giọng văn trung tính, nói về sản phẩm, không trách người.',
      ],
      sample: `## Kết luận
Khuyến nghị: chưa phát hành bản 1.1.
Lý do chính: bản 1.1 thu phí đầy đủ với trẻ dưới 6 tuổi (yêu cầu là miễn phí), và API vẫn nhận dữ liệu không hợp lệ.

## Đã kiểm gì
- Toàn bộ ca biên và bảng quyết định cho R1 đến R9 trên giao diện.
- 16 ca API cho bốn đường dẫn.
- Kiểm lại 6 mục trong ghi chú phát hành, hồi quy bốn khu vực liên quan.
- Hai phiên khám phá 45 phút: luồng đặt và hủy, màn quản trị.
- Kiểm nhanh N1, N2, N3 và khóa PIN.

## Chưa kiểm gì và rủi ro còn lại
- Nhiều người đặt cùng một khung giờ cùng lúc: chưa kiểm được trên bản mô phỏng.
- Chỉ kiểm trên Chrome. Chưa kiểm Safari và điện thoại thật.
- Chưa kiểm trình đọc màn hình thật, mới kiểm nhãn ô nhập.

## Số liệu (ví dụ, hãy thay bằng số của bạn)
| Chỉ số | Giá trị |
|---|---|
| Lỗi đã đóng sau khi kiểm lại | 5 (F1 đến F5) |
| Lỗi mở lại | 1 (F6, tạo trùng lịch) |
| Lỗi mới trên 1.1 | 2 (phí trẻ dưới 6 tuổi, ngày thứ 30) |

## Lỗi chặn phát hành
| Tiêu đề | Vì sao chặn |
|---|---|
| Trẻ dưới 6 tuổi bị tính phí đầy đủ | Thu sai tiền, trái R7, bản 1.0 không có lỗi này |
| API nhận dữ liệu không hợp lệ | Tạo được lịch tuổi âm, thiếu số điện thoại. Mọi kiểm tra ở giao diện bị vô hiệu |
| Người đúng 60 tuổi không được giảm phí | Thu sai tiền |
| Lịch đã hủy vẫn chiếm chỗ | Khung giờ báo đầy trong khi còn trống, mất lượt khám |
| Tên chứa HTML hiển thị sai ở bảng quản trị | Nguy cơ chèn mã trên hệ thống thật |
| Không khóa đăng nhập sau 5 lần sai PIN | Dò được PIN quản trị |

## Điều kiện để phát hành
1. Sửa 6 lỗi chặn ở trên và lỗi tạo trùng lịch (F6).
2. Chạy lại bảng quyết định phí, ca biên ngày khám và 16 ca API trên bản mới.
3. Các lỗi mức Thấp (định dạng tiền, mã 201) được phép chuyển sang bản sau nếu người phụ trách sản phẩm đồng ý.`,
    },
  ],

  // Đáp án: các sai lệch cài sẵn. builds = bản dựng có lỗi này.
  bugs: [
    { id: 'L01', builds: ['1.0', '1.1'], area: 'Đặt lịch', req: 'R1', sev: 'Thấp', title: 'Họ tên 1 ký tự vẫn được nhận', how: 'Giá trị biên: thử tên 1 ký tự và 2 ký tự.' },
    { id: 'L02', builds: ['1.0', '1.1'], area: 'Đặt lịch', req: 'R1', sev: 'Trung bình', title: 'Họ tên chỉ gồm khoảng trắng vẫn được nhận', how: 'Phân vùng không hợp lệ: nhập ba dấu cách.' },
    { id: 'L03', builds: ['1.0', '1.1'], area: 'Đặt lịch', req: 'R2', sev: 'Trung bình', title: 'Số điện thoại 11 chữ số vẫn được nhận', how: 'Giá trị biên độ dài: 9, 10, 11 chữ số.' },
    { id: 'L04', builds: ['1.0'], area: 'Đặt lịch', req: 'R3', sev: 'Trung bình', title: 'Tuổi 120 bị từ chối', how: 'Giá trị biên trên: 120 và 121.' },
    { id: 'L05', builds: ['1.0', '1.1'], area: 'Đặt lịch', req: 'R3', sev: 'Trung bình', title: 'Người đúng 16 tuổi vẫn bị đòi tên người giám hộ', how: 'Giá trị biên: 15 và 16 tuổi, để trống người giám hộ.' },
    { id: 'L06', builds: ['1.0', '1.1'], area: 'Đặt lịch', req: 'R4', sev: 'Cao', title: 'Đặt được lịch cho ngay hôm nay', how: 'Giá trị biên ngày: hôm nay và ngày mai.' },
    { id: 'L07', builds: ['1.0'], area: 'Đặt lịch', req: 'R4', sev: 'Cao', title: 'Chủ nhật vẫn đặt được, Thứ bảy bị chặn', how: 'Phân vùng theo thứ trong tuần: thử một Thứ bảy và một Chủ nhật.' },
    { id: 'L08', builds: ['1.0', '1.1'], area: 'Đặt lịch', req: 'R5', sev: 'Trung bình', title: 'Có khung 11:30 trong giờ nghỉ trưa', how: 'Giá trị biên quanh giờ nghỉ: 11:00, 11:30, 12:30, 13:00.' },
    { id: 'L09', builds: ['1.0'], area: 'Đặt lịch', req: 'R6', sev: 'Cao', title: 'Một khung giờ nhận được lịch thứ 4', how: 'Giá trị biên sức chứa: lịch thứ 3 và thứ 4.' },
    { id: 'L10', builds: ['1.0', '1.1'], area: 'Phí', req: 'R7', sev: 'Cao', title: 'Người đúng 60 tuổi không được giảm 20%', how: 'Giá trị biên trong bảng quyết định phí: 59, 60, 61 tuổi.' },
    { id: 'L11', builds: ['1.0'], area: 'Phí', req: 'R7', sev: 'Cao', title: 'Trẻ dưới 6 tuổi có BHYT: phí hiện -50.000đ', how: 'Bảng quyết định: tổ hợp miễn phí kèm BHYT.' },
    { id: 'L12', builds: ['1.0', '1.1'], area: 'Tra cứu', req: 'R12', sev: 'Thấp', title: 'Phí ở màn Tra cứu thiếu dấu chấm hàng nghìn', how: 'So cùng một dữ liệu ở các màn khác nhau: phiếu đặt lịch, Tra cứu, Quản trị.' },
    { id: 'L13', builds: ['1.0', '1.1'], area: 'Trạng thái', req: 'R9', sev: 'Cao', title: 'Lịch Đã khám (ngày khám ở tương lai) vẫn hủy được', how: 'Chuyển trạng thái không hợp lệ: đặt lịch, quản trị xác nhận, ghi đã khám, rồi tìm nút hủy.' },
    { id: 'L14', builds: ['1.0', '1.1'], area: 'Trạng thái', req: 'R6', sev: 'Cao', title: 'Lịch đã hủy vẫn chiếm chỗ trong khung giờ', how: 'Kết hợp hai quy tắc: làm đầy khung, hủy một lịch, đặt lại.' },
    { id: 'L15', builds: ['1.0'], area: 'Tra cứu', req: 'R10', sev: 'Nghiêm trọng', title: 'Tra cứu sai số điện thoại vẫn hiện thông tin lịch', how: 'Ca phủ định: đúng mã, sai số điện thoại. Kiểm cả giao diện và API.' },
    { id: 'L16', builds: ['1.0', '1.1'], area: 'Quản trị', req: 'N1', sev: 'Cao', title: 'Họ tên chứa thẻ HTML bị hiển thị thành định dạng ở bảng quản trị', how: 'Nhập <h1>Hoa</h1> vào họ tên rồi xem mọi nơi hiển thị tên.' },
    { id: 'L17', builds: ['1.0', '1.1'], area: 'Đặt lịch', req: 'R8', sev: 'Cao', title: 'Bấm Đặt lịch hai lần nhanh tạo hai lịch (bản 1.1 báo đã sửa nhưng vẫn còn)', how: 'Khám phá: bấm đúp trong lúc đang gửi. Trên 1.1 đây là mục F6 phải mở lại.' },
    { id: 'L18', builds: ['1.0', '1.1'], area: 'Truy cập', req: 'N2', sev: 'Trung bình', title: 'Ô số điện thoại không có nhãn', how: 'Bấm vào chữ nhãn, hoặc xem tên của ô trong tab Accessibility của DevTools.' },
    { id: 'L19', builds: ['1.0', '1.1'], area: 'Màn hình nhỏ', req: 'N3', sev: 'Trung bình', title: 'Ở 375px bảng quản trị bị cắt, không cuộn ngang được', how: 'Chế độ thiết bị trong DevTools, rộng 375px, mở màn Quản trị.' },
    { id: 'L20', builds: ['1.0', '1.1'], area: 'Quản trị', req: 'R11', sev: 'Cao', title: 'Sai PIN 5 lần không bị khóa', how: 'Nhập sai 5 lần liên tiếp rồi thử lần thứ 6.' },
    { id: 'A1', builds: ['1.0', '1.1'], area: 'API', req: 'Mục 4', sev: 'Nghiêm trọng', title: 'POST /appointments nhận dữ liệu không hợp lệ (tuổi âm, thiếu số điện thoại)', how: 'Gửi thẳng vào API dữ liệu mà giao diện chặn.' },
    { id: 'A2', builds: ['1.0', '1.1'], area: 'API', req: 'Mục 4', sev: 'Trung bình', title: 'DELETE mã lịch không tồn tại trả 200 thay vì 404', how: 'Thao tác trên tài nguyên không tồn tại.' },
    { id: 'A3', builds: ['1.0', '1.1'], area: 'API', req: 'Mục 4', sev: 'Thấp', title: 'POST thành công trả 200 thay vì 201', how: 'So mã trạng thái với tài liệu API.' },
    { id: 'L21', builds: ['1.1'], area: 'Phí', req: 'R7', sev: 'Cao', title: 'Hồi quy: trẻ dưới 6 tuổi bị tính phí đầy đủ', how: 'Chạy lại toàn bộ bảng quyết định phí sau lần sửa F4.' },
    { id: 'L22', builds: ['1.1'], area: 'Đặt lịch', req: 'R4', sev: 'Trung bình', title: 'Hồi quy: ngày thứ 30 bị từ chối', how: 'Chạy lại ca biên ngày khám sau lần sửa F2.' },
  ],
};
