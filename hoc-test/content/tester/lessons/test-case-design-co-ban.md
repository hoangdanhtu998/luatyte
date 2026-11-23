# Bài học: Thiết kế Test Case (nền tảng)

Bài này dạy bạn viết một Test Case hoàn chỉnh từ đầu. Các bài tc-03 (kỹ thuật thiết kế ca), tc-05 (báo cáo lỗi) và tc-06 (API) đi sâu hơn sau khi bạn nắm chắc nền tảng ở đây.

## Sau bài này bạn làm được gì

- Giải thích Test Case là gì và nó trả lời những câu hỏi nào.
- Điền đúng từng trường của một Test Case, và biết trường nào có thể bỏ qua.
- Phân biệt Preconditions với Test Steps, Expected Result với Actual Result.
- Đặt Priority cho Test Case đúng cách, và phân biệt với Priority của Bug.
- Từ một Test Scenario, tách ra nhiều Test Case có mục đích rõ ràng.

## 1. Test Case là gì?

**Test Case** là một trường hợp kiểm thử được viết cụ thể đến mức người khác đọc xong có thể làm lại và cho ra cùng kết quả. Một Test Case gồm: điều kiện cần có, dữ liệu dùng, các bước thực hiện, và kết quả đúng phải như thế nào.

Một Test Case trả lời bốn câu hỏi:

| Câu hỏi | Trường tương ứng |
|---|---|
| Cần chuẩn bị gì trước khi bắt đầu? | Preconditions |
| Làm thao tác nào, theo thứ tự nào? | Test Steps |
| Dùng dữ liệu gì? | Test Data |
| Kết quả đúng phải như thế nào? | Expected Result |

**Ví dụ phân biệt.** "Kiểm tra đăng nhập" là một tiêu đề, không phải Test Case. "Đăng nhập bằng tài khoản `an@test.vn` / mật khẩu đúng, sau khi đã mở trang đăng nhập, phải vào được trang chủ và hiện tên `An`" là một Test Case, vì người khác làm lại được và biết chính xác đúng là gì.

## 2. Cấu trúc một Test Case chuẩn

| Trường | Ý nghĩa | Ví dụ |
|---|---|---|
| Test Case ID | Mã định danh duy nhất, để tham chiếu trong báo cáo và bug | `TC-AUDIO-001` |
| Test Scenario | Tình huống lớn mà Test Case này thuộc về | Kiểm tra nút Audio |
| Test Case Title | Tên ngắn nói rõ đang kiểm tra cái gì | Phát âm thanh khi nhấn nút Audio |
| Requirement | Yêu cầu nghiệp vụ mà ca này kiểm chứng | Khi nhấn Audio, hệ thống phát âm đúng từ đang hiện |
| Preconditions | Điều kiện đã đúng trước khi bắt đầu | Đã mở bài học; bài học đã tải xong |
| Test Data | Dữ liệu cụ thể dùng trong ca | Từ `Apple`; file âm thanh tương ứng |
| Test Steps | Các thao tác, đánh số, mỗi bước một hành động | 1. Mở bài có từ Apple. 2. Nhấn Audio. |
| Expected Result | Kết quả đúng, viết trước khi chạy | Nút bấm được; âm thanh phát đúng từ Apple |
| Actual Result | Kết quả quan sát được khi chạy | Ghi khi đã chạy; chưa chạy thì để trống |
| Priority | Thứ tự ưu tiên chạy ca này | High |
| Status | Trạng thái hiện tại của ca | Not Run, Pass, Fail, Blocked |

**Không phải dự án nào cũng cần đủ mọi trường.** Dự án nhỏ có thể bỏ Test Scenario và Requirement nếu đã có bảng truy vết riêng. Nhưng Test Case ID, Steps, Expected Result và Status gần như luôn cần.

## 3. Ví dụ đầy đủ: nút Audio trong bài học

**Requirement:** Khi học sinh nhấn nút Audio, hệ thống phát âm thanh tương ứng với từ vựng đang hiển thị.

**TC-AUDIO-001**
- **Test Scenario:** Kiểm tra nút Audio.
- **Test Case Title:** Phát âm thanh khi nhấn nút Audio.
- **Priority:** High
- **Status:** Not Run

**Preconditions**
- Người dùng đã đăng nhập và mở được bài học.
- Bài học đã tải xong, không còn spinner.
- Thiết bị có loa hoặc tai nghe, âm lượng không bị tắt.

**Test Data**
- Từ vựng: `Apple`.
- File âm thanh tương ứng: `apple.mp3`, đã có trong bài học.

**Test Steps**
1. Mở bài học có từ `Apple`.
2. Tìm nút Audio bên cạnh từ `Apple`.
3. Nhấn nút Audio một lần.
4. Nghe và quan sát âm thanh phát ra.

**Expected Result**
- Nút Audio hiển thị và bấm được.
- Hệ thống phát âm thanh, không có thông báo lỗi.
- Nội dung âm thanh là từ `Apple`, đọc đúng.

**Actual Result:** (để trống cho đến khi chạy)

## 4. Preconditions và Test Steps: đừng nhầm

Đây là chỗ người mới hay nhầm nhất. Quy tắc đơn giản: **Preconditions là trạng thái bạn đã có sẵn; Test Steps là việc bạn làm trong lúc kiểm thử.**

| Preconditions (đã có sẵn) | Test Steps (bạn làm) |
|---|---|
| Đã đăng nhập | Nhập tài khoản và mật khẩu rồi bấm đăng nhập |
| Đã mở bài học | Mở bài học có từ Apple |
| Dữ liệu đã được chuẩn bị | Nhấn nút Audio |
| Thiết bị có âm thanh | Nghe âm thanh phát ra |

Ví dụ: "Đã đăng nhập" là Precondition. Nếu bạn phải đăng nhập ngay trong ca đó để kiểm tra, thì "đăng nhập" là một Test Step, và Precondition phải ghi rõ trạng thái bạn cần có trước bước đó (ví dụ: "có một tài khoản hợp lệ").

Nếu một Precondition không được thỏa, ca **không được tính là Fail**. Ghi Status là **Blocked** và nói rõ thiếu điều kiện nào.

## 5. Expected Result và Actual Result

- **Expected Result** là kết quả đúng, được viết **trước** khi chạy, lấy từ Requirement. Không được viết theo những gì app đang làm.
- **Actual Result** là điều bạn quan sát được khi chạy, mô tả cụ thể.

**Ví dụ.** Bạn kiểm tra nút Audio:
- Expected: Âm thanh phát đúng từ Apple.
- Actual: Nhấn nút, không có tiếng, không có thông báo.
- Kết quả: **Fail**, vì Actual khác Expected.

Quy tắc khi so sánh:
- Nếu Actual **giống** Expected: Pass.
- Nếu Actual **khác** Expected: Fail, và ghi lại đủ thông tin để người khác tái hiện.
- Nếu không chạy được vì điều kiện không thỏa: Blocked.
- Nếu ca không còn áp dụng (ví dụ tính năng đã bỏ): Not Applicable.

**Kém:** Expected "Hệ thống hoạt động tốt". **Tốt:** Expected "Hiện thông báo lỗi ở ô Tuổi, không tạo lịch mới".

## 6. Priority: của Test Case khác của Bug

| Mức | Ý nghĩa cho Test Case | Ví dụ |
|---|---|---|
| High | Phải chạy trước; lỗi ở đây chặn người dùng làm việc chính | Không mở được bài học |
| Medium | Chức năng quan trọng nhưng có đường đi thay thế | Sai màu một nút phụ |
| Low | Kiểm tra bổ sung, chạy khi còn thời gian | Khoảng cách biểu tượng lệch vài pixel |

**Lưu ý quan trọng:** Priority của **Test Case** quyết định **thứ tự chạy**. Priority của **Bug** quyết định **thứ tự sửa**. Hai trường này có mục đích khác nhau và có thể không khớp nhau: một ca Low vẫn có thể phát hiện một bug High, và ngược lại.

## 7. Một Test Scenario tạo nhiều Test Case

Scenario là tình huống lớn. Từ một Scenario, bạn tách ra nhiều Test Case, mỗi ca kiểm một khía cạnh.

**Scenario: Kiểm tra nút Audio.**

| Test Case | Nội dung | Cần đối chiếu |
|---|---|---|
| TC-AUDIO-001 | Nhấn Audio, âm thanh phát đúng từ | Requirement chính, làm trước |
| TC-AUDIO-002 | Nhấn Audio nhiều lần liên tiếp | Có chồng tiếng, có khóa nút không |
| TC-AUDIO-003 | Chuyển sang từ tiếp theo rồi nhấn Audio | Có phát đúng từ mới không |
| TC-AUDIO-004 | File âm thanh không tải được | Có thông báo lỗi, app không treo |
| TC-AUDIO-005 | Chạy trên các trình duyệt được hỗ trợ | Danh sách trình duyệt được hỗ trợ |

**Thứ tự làm việc:** TC-AUDIO-001 làm trước vì nó kiểm yêu cầu chính. Các ca 002–005 phụ thuộc vào việc 001 đã đúng, và phải đối chiếu Requirement hoặc hỏi người phụ trách về hành vi mong đợi trước khi chốt Expected Result. Đừng tự đoán hành vi rồi viết vào Expected.

## 8. Sai lầm hay gặp

- **Viết tiêu đề thay vì Test Case.** "Test nút Audio" không ai làm lại được.
- **Expected Result mơ hồ.** "Hoạt động bình thường" không phải kết quả kiểm chứng được.
- **Copy Actual vào Expected.** Khi đó ca chỉ chứng minh app giống chính nó.
- **Nhét nhiều kiểm tra vào một ca.** Ca fail rồi bạn không biết phần nào sai.
- **Bỏ Test Data.** Thiếu dữ liệu cụ thể thì hai người sẽ làm hai việc khác nhau.
- **Đặt Priority theo cảm tính** mà không gắn với rủi ro hay yêu cầu chính.

## 9. Việc cần làm

1. Chọn một tính năng bạn đã dùng, ví dụ nút tìm kiếm.
2. Viết một Scenario và ba Test Case theo đúng cấu trúc mục 2. Mỗi ca có ID, Preconditions, Test Data, Steps và Expected Result.
3. Với từng ca, tự đặt Priority và giải thích vì sao.
4. Đổi cho bạn bè đọc. Họ làm lại được không? Nếu không, ca của bạn thiếu chỗ nào?

## Thuật ngữ

**Test Case**: bộ điều kiện, dữ liệu, bước và kết quả mong đợi để kiểm một khía cạnh của phần mềm. · **Test Scenario**: tình huống lớn chứa nhiều Test Case. · **Preconditions**: trạng thái cần có trước khi bắt đầu ca. · **Test Data**: dữ liệu cụ thể dùng trong ca. · **Expected Result**: kết quả đúng, viết trước khi chạy. · **Actual Result**: kết quả quan sát được khi chạy. · **Status**: Not Run, Pass, Fail, Blocked, Not Applicable.
