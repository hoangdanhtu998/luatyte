# Kiến thức kiểm thử phần mềm và QA Hub – Knowledge cho QA Expert

Tài liệu này có hai phần:
- **Phần A:** kiến thức kiểm thử phần mềm nói chung (khái niệm, kỹ thuật, công cụ, quy trình).
- **Phần B:** cách QA Hub áp dụng kiến thức đó, gồm những gì đã làm và chưa làm.

Quy tắc khi trả lời:
- Nếu câu hỏi thuộc phần A, trả lời đầy đủ, có ví dụ, và nói rõ đây là kiến thức chung.
- Nếu câu hỏi về QA Hub, chỉ nói những gì có trong phần B. Không khẳng định một tính năng tồn tại nếu phần B không ghi.
- Nếu không chắc, nói là không chắc và đề xuất cách kiểm tra. Không bịa số liệu, tên API hay kết quả test.
- Phân biệt rõ phần nào người dùng tự làm, phần nào QA Hub tự chạy, phần nào AI chỉ gợi ý.

---

# PHẦN A – KIẾN THỨC KIỂM THỬ PHẦN MỀM

## A1. Nền tảng

**Kiểm thử phần mềm là gì?**
Hoạt động tìm lỗi và đánh giá chất lượng phần mềm so với yêu cầu. Kiểm thử không chứng minh phần mềm không có lỗi. Nó chỉ cho thấy lỗi có mặt hay chưa được phát hiện trong phạm vi đã thử.

**Lỗi (defect), sai sót (mistake), sự cố (failure) khác nhau thế nào?**
- Sai sót: người viết yêu cầu, thiết kế hoặc mã sai.
- Lỗi (defect/bug): sai sót nằm trong sản phẩm.
- Sự cố (failure): hệ thống hành xử sai khi chạy.

**Kiểm thử ISTQB có 7 nguyên lý nào?**
1. Kiểm thử cho thấy có lỗi, không chứng minh không có lỗi.
2. Kiểm thử toàn bộ là không khả thi, nên phải ưu tiên.
3. Kiểm thử sớm tiết kiệm chi phí.
4. Lỗi tập trung: phần nhỏ của hệ thống thường chứa phần lớn lỗi.
5. Hiện tượng thuốc trừ sâu: cùng một bộ test lặp đi lặp lại sẽ không tìm thêm lỗi, cần cập nhật ca test.
6. Kiểm thử phụ thuộc ngữ cảnh: app thương mại, app y tế, app game cần cách test khác nhau.
7. Ngụy biện không có lỗi: không có lỗi chưa đồng nghĩa với phần mềm đúng nhu cầu người dùng.

**Verification và validation khác nhau thế nào?**
- Verification: sản phẩm có làm đúng đặc tả không ("làm đúng cách").
- Validation: sản phẩm có đáp ứng nhu cầu thật của người dùng không ("làm đúng thứ cần làm").

## A2. Vòng đời kiểm thử (STLC)

STLC là chuỗi hoạt động kiểm thử có thứ tự, gồm các giai đoạn:
1. **Phân tích yêu cầu:** đọc yêu cầu, xác định điều kiện kiểm thử, làm rõ mơ hồ, lập ma trận truy vết (RTM) nối yêu cầu với ca test.
2. **Lập kế hoạch kiểm thử (Test planning):** phạm vi, chiến lược, loại test, nhân sự, thời gian, rủi ro, tiêu chí vào (entry) và ra (exit).
3. **Thiết kế ca test:** viết kịch bản, ca test, dữ liệu test, kết quả mong đợi; chọn kỹ thuật thiết kế.
4. **Chuẩn bị môi trường:** cài đặt phiên bản cần test, cấu hình DB, tài khoản, dữ liệu, kiểm tra kết nối, smoke test.
5. **Thực thi:** chạy ca, ghi kết quả pass/fail, ghi bằng chứng, báo bug, retest, regression.
6. **Kết thúc chu trình:** tổng hợp kết quả, thống kê bug, đánh giá độ phủ, kiểm tra exit criteria, viết test summary report, lưu trữ.

**Entry criteria và exit criteria là gì?**
- Entry: điều kiện phải đạt trước khi bắt đầu test (ví dụ: build đã deploy, dữ liệu test đã seed, smoke test pass).
- Exit: điều kiện để dừng test và phát hành (ví dụ: 95% ca critical pass, không còn bug critical/major mở, mọi requirement có ít nhất một ca test).

**Test plan khác test strategy thế nào?**
- Test strategy: nguyên tắc chung cho nhiều dự án trong một tổ chức (cách tiếp cận, công cụ chuẩn).
- Test plan: kế hoạch cụ thể cho một dự án hoặc một đợt phát hành (phạm vi, lịch, nhân sự, rủi ro).

**Test scope là gì?**
Những gì sẽ được test (trang nào, luồng nào, tính năng nào) và những gì không test, kèm lý do. Scope phải được người có thẩm quyền duyệt.

## A3. Loại kiểm thử theo mục đích

- **Unit test:** kiểm từng hàm hoặc component riêng lẻ. Nhanh, do lập trình viên viết.
- **Integration test:** kiểm sự phối hợp giữa các module, API, database.
- **System test:** kiểm toàn bộ hệ thống so với yêu cầu.
- **Acceptance test (UAT):** người dùng hoặc khách hàng kiểm và chấp nhận.
- **Smoke test:** bộ test nhỏ, nhanh, kiểm xem build có chạy được các chức năng cốt lõi không. Nếu smoke fail thì dừng, không test tiếp.
- **Sanity test:** kiểm nhanh một chức năng vừa sửa để xác nhận sửa đúng, không kiểm sâu.
- **Regression test:** chạy lại ca cũ sau khi thay đổi để chắc không làm hỏng chức năng khác.
- **Retest (confirmation test):** chạy lại đúng ca đã fail để xác nhận bug đã sửa.
- **Exploratory test:** thiết kế và chạy test trong lúc thăm dò, dựa trên kinh nghiệm và mục tiêu của phiên test (session-based). Ghi lại findings ngay khi phát hiện.
- **Ad-hoc test:** test không có kế hoạch, dựa trên trực giác.
- **Alpha / Beta test:** alpha là nội bộ, beta là một nhóm người dùng thật trước khi phát hành.

## A4. Phân loại theo góc nhìn kiểm thử

- **Black box (hộp đen):** không cần biết mã bên trong. Test dựa trên đặc tả, đầu vào và đầu ra. Phù hợp cho QA, người dùng, kiểm thử hệ thống.
- **White box (hộp trắng):** dựa vào cấu trúc mã. Test nhắm vào nhánh, điều kiện, đường đi. Cần đọc code. Phù hợp cho unit và integration.
- **Grey box (hộp xám):** kết hợp: biết một phần cấu trúc (ví dụ schema DB, API contract) nhưng vẫn test từ bên ngoài.

**Ví dụ phân biệt:** một hàm kiểm tuổi `if (age >= 18 && age <= 60)`.
- Black box: thử 17, 18, 60, 61 theo đặc tả "từ 18 đến 60".
- White box: viết ca cho từng nhánh đúng và sai của từng điều kiện, và kiểm độ phủ nhánh.

## A5. Kỹ thuật thiết kế ca test

**Black box:**
- **Phân vùng tương đương (Equivalence partitioning):** chia đầu vào thành nhóm mà hệ thống xử lý giống nhau. Chọn một đại diện mỗi nhóm. Ví dụ tuổi: nhóm <18, nhóm 18–60, nhóm >60, nhóm không phải số.
- **Phân tích giá trị biên (Boundary value analysis):** thử ngay tại biên và ngay ngoài biên. Ví dụ với 18–60: 17, 18, 19, 59, 60, 61. Lỗi biên (off-by-one) rất hay gặp.
- **Bảng quyết định (Decision table):** liệt kê mọi tổ hợp điều kiện và kết quả. Phù hợp với luật nghiệp vụ nhiều điều kiện, ví dụ giảm giá phụ thuộc loại khách, số lượng, mã khuyến mãi.
- **Bảng chuyển trạng thái (State transition):** vẽ các trạng thái và sự kiện chuyển. Phải test cả chuyển hợp lệ và chuyển bị cấm. Ví dụ đơn hàng: Mới → Đã thanh toán → Đang giao → Đã giao; chuyển "Đã giao → Mới" là bị cấm.
- **Kiểm thử theo use case:** test từ luồng người dùng đầu cuối, gồm luồng chính và luồng thay thế.
- **Tổ hợp cặp (Pairwise / all-pairs):** với nhiều tham số, chọn tập tổ hợp sao cho mọi cặp giá trị của hai tham số bất kỳ xuất hiện ít nhất một lần. Giảm số ca mà vẫn bao phủ tốt. Ví dụ trình duyệt × hệ điều hành × ngôn ngữ.
- **Đoán lỗi (Error guessing):** dựa kinh nghiệm để đoán chỗ dễ lỗi: để trống, số âm, chuỗi rất dài, ký tự đặc biệt, emoji, nhập trùng, bấm hai lần.

**White box:**
- **Statement coverage:** mỗi câu lệnh được chạy ít nhất một lần.
- **Branch (decision) coverage:** mỗi nhánh đúng và sai của mỗi điều kiện được chạy ít nhất một lần.
- **Condition coverage / MC/DC:** mỗi điều kiện con đúng và sai độc lập. MC/DC dùng cho phần mềm an toàn cao.
- **Path coverage:** mọi đường đi qua hàm. Thường không khả thi với hàm có vòng lặp.

**Ghi nhớ:** độ phủ 100% không đảm bảo không có lỗi. Độ phủ chỉ cho biết phần nào chưa được chạy.

**Kiểm thử hồi quy được chọn như thế nào?**
- Chạy toàn bộ bộ hồi quy trước khi phát hành lớn.
- Chạy bộ hồi quy có chọn lọc theo thay đổi (ca liên quan đến module vừa sửa) cho bản vá nhỏ.
- Đưa vào CI các ca ổn định nhất, chạy mỗi lần commit.

## A6. Thiết kế test case và tài liệu

**Một test case tốt có những gì?**
- Mã định danh duy nhất (ví dụ TC-001).
- Tiêu đề rõ, nói được hành vi cần kiểm.
- Tiền điều kiện (preconditions).
- Dữ liệu test.
- Các bước thực hiện, cụ thể, có thể lặp lại.
- Kết quả mong đợi, nói rõ và đo được.
- Độ ưu tiên, loại test, requirement liên kết.
- Kết quả thực tế, bằng chứng (ảnh, log, video), trạng thái.

**Test scenario khác test case thế nào?**
Scenario là một tình huống cần kiểm (ví dụ "người dùng đăng nhập sai nhiều lần"). Test case là các bước cụ thể để kiểm tình huống đó. Một scenario có thể có nhiều test case.

**Test data nên như thế nào?**
- Dữ liệu giả, không dùng dữ liệu thật của người dùng.
- Dữ liệu riêng cho mỗi lần chạy, có mã duy nhất để không đụng nhau.
- Có kế hoạch dọn dữ liệu hoặc rollback sau khi chạy.
- Kiểm tra seed đúng schema và khóa ngoại trước khi chạy.

**Tiêu chuẩn đặt tên và ưu tiên?**
- Priority (độ ưu tiên): mức độ quan trọng về mặt kinh doanh, do PM/BA quyết.
- Severity (mức độ nghiêm trọng): tác động kỹ thuật của lỗi, do QA đề xuất.
- Hai thứ khác nhau: lỗi nghiêm trọng nhưng ít gặp có thể ưu tiên thấp; lỗi nhỏ ở trang chủ có thể ưu tiên cao.

## A7. Quản lý lỗi (Defect management)

**Vòng đời bug điển hình:** Mới (New) → Đã giao (Assigned) → Đang xử lý (In progress) → Đã sửa (Fixed) → Chờ retest (Retest) → Đã xác nhận (Verified) → Đã đóng (Closed). Các nhánh khác: Mở lại (Reopened), Từ chối (Rejected), Trùng (Duplicate), Hoãn (Deferred).

**Một bug report tốt cần có gì?**
- Tiêu đề ngắn, nêu hành vi lỗi.
- Môi trường, phiên bản build, trình duyệt, hệ điều hành.
- Các bước tái hiện, đánh số, cụ thể.
- Kết quả thực tế và kết quả mong đợi.
- Bằng chứng: ảnh, video, log console, log server, HAR nếu liên quan mạng.
- Mức độ nghiêm trọng và độ ưu tiên.

**Lỗi tái hiện không ổn định (flaky) thì làm gì?**
Ghi lại tần suất, điều kiện, thời gian, dữ liệu. Không bỏ qua. Thử cô lập nguyên nhân: thời gian, mạng, trạng thái cũ, dữ liệu dùng chung.

**Mật độ lỗi (defect density) là gì?**
Số lỗi chia cho kích thước (ví dụ lỗi trên 1000 dòng code hoặc trên mỗi chức năng). Dùng để so sánh các module, không dùng để chấm điểm người.

## A8. Rủi ro và ưu tiên

**Rủi ro kiểm thử được đánh giá thế nào?**
Rủi ro = mức nghiêm trọng × khả năng xảy ra. Mỗi yếu tố chấm từ 1 đến 5 hoặc 1 đến 3, nhân với nhau.
- Ví dụ: thanh toán bị sai số tiền (nghiêm trọng 5, khả năng 3) → rủi ro 15 → ưu tiên cao.
- Ví dụ: đổi màu nút phụ (nghiêm trọng 1, khả năng 2) → rủi ro 2 → ưu tiên thấp.

Phân loại: cao (≥ 12), trung bình (6–11), thấp (≤ 5). Ngưỡng do đội thống nhất và ghi lại.

**Vì sao phải ưu tiên?**
Thời gian và ngân sách có hạn. Test theo rủi ro giúp tập trung vào chỗ đáng lo nhất trước.

## A9. Các chỉ số (metrics) thường dùng

- **Tỷ lệ pass:** số ca pass / tổng số ca đã chạy. Chỉ nói đến ca đã chạy, không tính ca chưa chạy như pass.
- **Tỷ lệ phủ requirement:** số requirement có ít nhất một ca test / tổng số requirement.
- **Độ phủ code:** phần trăm dòng hoặc nhánh được chạy (công cụ: Istanbul/nyc, coverage của pytest, JaCoCo).
- **Số bug mở theo mức độ:** critical, major, minor, trivial.
- **Tỷ lệ bug phát hiện sớm (defect detection percentage):** bug phát hiện trước phát hành / tổng bug.
- **Thời gian phản hồi bug (MTTR):** từ khi phát hiện đến khi sửa xong.

**Chỉ số nào dễ gây hiểu lầm?**
- Số ca test nhiều không có nghĩa là chất lượng cao. Cần xem ca có bao phủ rủi ro không.
- Độ phủ 100% không có nghĩa là không có lỗi.
- Tỷ lệ pass cao có thể do chọn ca dễ.

## A10. Kiểm thử phi chức năng

**Hiệu năng (Performance):**
- **Load test:** hệ thống chịu tải dự kiến thế nào.
- **Stress test:** tăng tải tới khi hỏng, xem hỏng ra sao và có phục hồi không.
- **Soak/endurance test:** tải vừa phải kéo dài, tìm rò rỉ bộ nhớ.
- **Spike test:** tăng tải đột ngột.
- Công cụ: k6, JMeter, Gatling, Locust.
- Chỉ số: thời gian phản hồi p95, p99, throughput, tỷ lệ lỗi.

**Web Vitals và Lighthouse:**
- **LCP (Largest Contentful Paint):** thời gian để phần tử lớn nhất hiện. Tốt: dưới 2,5 giây.
- **CLS (Cumulative Layout Shift):** độ xê dịch bố cục khi tải. Tốt: dưới 0,1.
- **INP (Interaction to Next Paint):** độ trễ phản hồi tương tác. Tốt: dưới 200 ms. Đây là chỉ số đo từ dữ liệu thật của người dùng (field data). Lighthouse lab không đo INP trực tiếp.
- **TBT (Total Blocking Time):** tổng thời gian bị chặn trên main thread, dùng làm chỉ số thay thế cho INP trong lab. Tốt: dưới 200 ms.
- **FCP (First Contentful Paint):** lần đầu có nội dung hiện.
- **Lighthouse** là công cụ của Google: chạy audit cho hiệu năng, accessibility, SEO, best practices. Có thể chạy bằng Chrome DevTools, CLI (`npx lighthouse`), hoặc Lighthouse CI (LHCI) để chặn build khi vượt ngưỡng.
- Lab (Lighthouse) và field (dữ liệu người dùng thật, CrUX) cho kết quả khác nhau. Lab dùng để so sánh và chặn lỗi trong CI; field phản ánh trải nghiệm thật.

**Bảo mật (Security):**
- **OWASP Top 10** là danh sách rủi ro bảo mật web phổ biến. Gồm: kiểm soát truy cập hỏng, lỗi cấu hình, chuỗi cung ứng, mã hóa thất bại, injection (SQL, XSS, lệnh), thiết kế không an toàn, xác thực hỏng, toàn vẹn phần mềm và dữ liệu, ghi log thiếu, SSRF.
- **XSS:** chèn script vào trang. Thử bằng payload như `<img src=x onerror=...>` tại mọi ô nhập và tham số URL. Kiểm xem có được thoát (escape) khi hiển thị không.
- **SQL Injection:** thử ký tự `'`, `' OR '1'='1` vào ô tìm kiếm và tham số. Kết quả đúng là bị từ chối hoặc được xử lý an toàn bằng câu lệnh tham số hóa (parameterized).
- **IDOR:** đổi mã đối tượng trong URL hoặc request (ví dụ `/orders/123` → `/orders/124`) để xem dữ liệu người khác. Phải bị từ chối.
- **CSRF:** gửi yêu cầu thay đổi dữ liệu mà không có token. Phải bị từ chối.
- **Security headers:** kiểm HTTPS bắt buộc, `Content-Security-Policy`, `X-Content-Type-Options`, `X-Frame-Options` hoặc `frame-ancestors`, `Strict-Transport-Security`.
- **Lộ thông tin:** không để lộ stack trace, tên bảng, phiên bản thư viện trong lỗi.
- **Quét tự động:** OWASP ZAP, Burp Suite (bản trả phí có quét nâng cao), npm audit, pip-audit cho phụ thuộc.
- **Lưu ý pháp lý:** chỉ test bảo mật trên hệ thống mình được phép test. Không quét hệ thống của người khác khi chưa có quyền.

**Accessibility (a11y):**
- Chuẩn: WCAG 2.1 hoặc 2.2 mức AA là phổ biến nhất.
- Những điểm kiểm: tương phản chữ tối thiểu 4.5:1 (chữ lớn 3:1), mọi chức năng dùng được bằng bàn phím, thứ tự focus đúng, focus nhìn thấy được, ô nhập có nhãn, ảnh có `alt`, ngôn ngữ trang khai báo, hộp thoại đóng bằng Esc, không chỉ dùng màu để truyền thông tin.
- Công cụ tự động: axe-core (chạy được qua `@axe-core/playwright`), Lighthouse accessibility, WAVE.
- Phần tự động chỉ phát hiện được khoảng 30–40% vấn đề. Phần còn lại cần kiểm thủ công và screen reader (NVDA, VoiceOver).

**Tương thích (Compatibility):**
- Trình duyệt: Chromium (Chrome, Edge), Firefox, WebKit (Safari).
- Thiết bị: mobile và tablet, màn hình khác nhau.
- Playwright hỗ trợ cả ba engine trình duyệt và có sẵn thiết bị giả lập (`devices['iPhone 12']`).
- Mốc màn hình thường kiểm: 360, 390, 414, 768, 1024, 1280px. Kiểm phóng to 200%.

**Usability:** người dùng thật thực hiện nhiệm vụ, ghi lại chỗ vấp, thời gian hoàn thành, mức hài lòng. Không thay thế được bằng test tự động.

**Kiểm thử nội dung:** chính tả, ngữ pháp, nhất quán thuật ngữ, link không bị 404, số liệu có nguồn, đối chiếu với văn bản chính thức (nội dung pháp lý, y tế), ngày tháng và tiền tệ đúng định dạng vùng.

## A11. Kỹ thuật thăm dò và heuristic

**Heuristic kiểm thử thường dùng:**
- **Biên (boundary):** thử mép và ngay ngoài mép.
- **CRUD:** thử tạo, đọc, sửa, xóa cho mỗi loại dữ liệu, kèm kiểm quyền từng thao tác.
- **Vừa đủ (goldilocks):** thử ít, vừa, nhiều.
- **Dữ liệu xấu:** để trống, số âm, chuỗi rất dài, ký tự đặc biệt, emoji, HTML.
- **Ngắt giữa chừng:** tải lại khi đang điền form, chuyển trang rồi quay lại, mất mạng khi gửi.
- **Đối chiếu:** so với sản phẩm cùng loại hoặc với chính hệ thống ở chức năng tương tự.
- **Nhất quán:** cùng thao tác cho cùng kết quả, cùng thuật ngữ trên toàn giao diện.

**Thiên kiến nhận thức cần tránh:**
- Confirmation bias: chỉ tìm bằng chứng ủng hộ giả thuyết.
- Anchoring: bị ảnh hưởng bởi thông tin đầu tiên.
- Availability: nhớ lỗi gần nhất, bỏ qua rủi ro khác.
- Sunk cost: tiếp tục test vì đã tốn thời gian.
- Observer effect: hành vi thay đổi khi biết đang bị đo.

**Cách chống thiên kiến:** viết ca trước khi xem kết quả; đổi vai (kẻ tấn công, người dùng mới); nhờ người khác review ca; ghi giả thuyết dạng "tôi nghĩ X đúng vì Y" rồi kiểm chứng; dùng số liệu để đánh giá rủi ro.

## A12. Tự động hóa kiểm thử

**Khi nào nên tự động hóa?**
- Ca được chạy lặp đi lặp lại (smoke, regression).
- Ca ổn định, ít thay đổi.
- Ca cần chạy nhanh trong CI.
- Không nên tự động hóa: ca khám phá, ca cần phán đoán UX, ca thay đổi liên tục.

**Test pyramid:** nhiều unit test ở đáy, ít integration hơn ở giữa, ít E2E nhất ở đỉnh. E2E chậm và dễ flaky nên chỉ giữ cho luồng quan trọng nhất.

**Playwright:**
- Framework E2E đa trình duyệt (Chromium, Firefox, WebKit), có auto-wait, trace, screenshot, video.
- Cấu hình đa trình duyệt bằng `projects` trong `playwright.config.*`, dùng `devices[...]` để giả lập mobile.
- Lệnh: `npx playwright test`, `npx playwright test --project=chromium`, `npx playwright show-report`.
- Playwright không có API `page.lighthouse()`. Để chạy Lighthouse, dùng gói `lighthouse` hoặc Lighthouse CI riêng.
- Tích hợp axe: `@axe-core/playwright`, chạy `new AxeBuilder({ page }).analyze()` và kiểm `violations` theo mức nghiêm trọng.

**Lighthouse CI (LHCI):**
- Cấu hình bằng `lighthouserc.json`: URL cần đo, số lần chạy, ngưỡng assertions.
- Ngưỡng ví dụ: LCP tối đa 2500 ms, CLS tối đa 0,1, TBT tối đa 200 ms, accessibility tối thiểu 0,9.
- Lệnh: `lhci autorun --config=lighthouserc.json`.
- Assertion mức `error` làm build thất bại; mức `warn` chỉ cảnh báo.

**CI/CD:** các bước điển hình: build, lint, type check, unit test, smoke, E2E chính, accessibility, hiệu năng, bảo mật (npm audit), lưu artifact (báo cáo, ảnh, log). Smoke fail thì dừng pipeline.

**Flaky test:** giảm bằng cách chờ đúng điều kiện (không dùng sleep cố định), cô lập dữ liệu, giới hạn retry (tối đa 2–3 lần), ghi lại tần suất, sửa nguyên nhân gốc, không để flaky làm đỏ pipeline mãi.

**Mock và stub:** giả lập dịch vụ bên ngoài khi chưa sẵn sàng. Ghi rõ giả định của mock.

## A13. Công cụ thường gặp

| Mục đích | Công cụ |
|---|---|
| E2E web | Playwright, Cypress, Selenium |
| API | Postman, Newman, REST Client, Playwright API testing, Supertest |
| Hiệu năng | k6, JMeter, Gatling, Locust |
| Accessibility | axe-core, Lighthouse, WAVE, NVDA, VoiceOver |
| Performance web | Lighthouse, LHCI, WebPageTest, Chrome DevTools |
| Bảo mật | OWASP ZAP, Burp Suite, npm audit, pip-audit |
| Quản lý test | TestRail, Zephyr, Xray, Azure Test Plans, QA Hub |
| Bug tracking | Jira, Azure DevOps, GitHub Issues |
| Coverage | Istanbul/nyc, c8, pytest-cov, JaCoCo |

## A14. Giao tiếp và báo cáo

**Test summary report gồm những gì?** Phạm vi đã test và không test, môi trường, số ca theo kết quả, bug theo mức độ, rủi ro còn lại, kết luận (phát hành, phát hành có điều kiện, chưa phát hành) kèm lý do.

**Viết bug cho dev thế nào?** Ngắn, rõ, có bằng chứng, không đổ lỗi, nêu tác động đến người dùng.

**Khi PM muốn phát hành nhưng còn bug critical?** Nêu rõ rủi ro, tác động, phương án giảm thiểu. Quyết định phát hành thuộc về người có thẩm quyền, QA chỉ đưa thông tin và khuyến nghị.

---

# PHẦN B – QA HUB: CÁCH ÁP DỤNG VÀ TRẠNG THÁI

## B1. Tổng quan

QA Hub là ứng dụng web chạy trên máy để quản lý quy trình kiểm thử: yêu cầu, kế hoạch, ca test, bug, checklist, báo cáo, và chạy luồng tự động cho dự án.

**Các trang và chức năng:**
- **Tổng:** tiến độ 14 giai đoạn theo dữ liệu thật; ô chọn dự án và nút **Chạy từ A đến Z**; tiến độ bước đang chạy; danh sách dự án; checklist.
- **Dự án:** thêm dự án (domain, zip, GitHub), xem chi tiết, báo cáo in được.
- **Test case:** danh sách ca, thêm, đổi trạng thái và kết quả, lọc và tìm kiếm.
- **Lỗi tìm thấy:** thêm bug, chuyển trạng thái theo luồng.
- **Báo cáo:** tổng kết, điều kiện bàn giao (exit criteria).
- **Hỏi trợ lý:** hỏi đáp với AI; mục cấu hình AI.

## B2. Dự án và nguồn dữ liệu

- **Domain:** nhập địa chỉ, QA Hub thêm `https://`. Bắt buộc tích xác nhận có quyền kiểm thử. Không có xác nhận thì không quét.
- **Zip:** tải mã nguồn lên, giải nén và đọc mã. Có kiểm tra giới hạn kích thước và đường dẫn an toàn.
- **GitHub:** nhập đường dẫn repository, tải về và đọc mã.
- **Phạm vi quét domain:** chỉ kiểm các mục cơ bản như trang chủ tải được, không lỗi 5xx. Không phải bộ test E2E đầy đủ.

## B3. Chạy luồng

**Nút "Chạy từ A đến Z" (trang Tổng):** chọn dự án rồi bấm. Các bước theo thứ tự:
1. Quét domain (nếu có xác nhận quyền).
2. Quét virus bằng Windows Defender. Nếu phát hiện mối đe dọa, các bước sau dừng.
3. Đọc mã và tick checklist theo bằng chứng trong file.
4. Sinh ý tưởng ca test white box và black box từ mã.
5. Chạy test của dự án (`npm test`) nếu có mã và có script test. Nút này chạy ngay, bỏ qua giới hạn 24 giờ.
6. Ghi báo cáo.

**Bước nào bị bỏ qua và vì sao:**
- Dự án không có mã (domain): bỏ bước đọc mã và chạy test.
- Mã không có script `npm test`: bỏ bước test.
- Quét virus chưa sạch: không đọc mã, không chạy test.
- Đang có lượt chạy khác: chờ lượt đó xong.

**Chạy tự động theo lịch:** dự án bật "chạy test" thì QA Hub chạy test tối đa một lần mỗi 24 giờ.

**Khi nào AI đọc mã?** Chỉ khi người dùng tích "Cho AI đọc mã dự án để tự tích checklist". Mã được che bí mật (key, mật khẩu, token) trước khi gửi.

## B4. Ca white box và black box do QA Hub sinh

QA Hub đọc mã nguồn bằng quy tắc (regex), không chạy mã, không gọi AI.

**Black box:**
- Mỗi route API thành một ca: dữ liệu hợp lệ, thiếu trường, sai kiểu, không tồn tại.
- Ngưỡng số trong code (ví dụ `length > 200`) thành ca biên n-1, n, n+1.
- Ô nhập HTML thành ca: để trống, quá dài, ký tự đặc biệt.

**White box:**
- Chỗ có từ 3 điều kiện trở lên: ca độ phủ quyết định.
- Khối `catch`: ca ép lỗi và kiểm thông báo.
- Chỗ `throw`: ca kích hoạt từng lỗi.

**Giới hạn:** tối đa 40 ý tưởng mỗi lần chạy, xen kẽ black box và white box. Là gợi ý để người test xem lại. Không phải phân tích cú pháp đầy đủ.

**Ca sinh ra có chạy không?** Ở trạng thái nháp, chưa có kết quả. Người test cần xem, chạy và ghi kết quả.

## B5. Checklist

**91 mục:**
- 36 mục STLC (CL-01 đến CL-36): phân tích yêu cầu, lập kế hoạch, thiết kế, môi trường, thực thi, hoàn tất.
- 55 mục web (CL-37 đến CL-91): giao diện và responsive, truy cập, hiệu năng, bảo mật cơ bản, tương thích trình duyệt, kiểm thử nội dung, heuristic, chống thiên kiến, sau phát hành, hồi quy và CI, kết luận báo cáo.

**Ai tick checklist?**
- Bước đọc mã tự tick các mục có bằng chứng trong file (ví dụ có README, file test, thư mục tài liệu).
- Các mục giao diện, hiệu năng, bảo mật, tương thích trình duyệt QA Hub chưa tự kiểm. Người test phải tự làm rồi tick.

## B6. Test case, bug, báo cáo

- **Test case:** trường bắt buộc gồm tiêu đề (tối thiểu và tối đa ký tự), loại test (positive, negative, boundary, equivalence, decision_table, state_transition, use_case, pairwise, exploratory, regression, smoke, compatibility, performance, security, white_box, black_box), độ ưu tiên. Trạng thái: nháp, sẵn sàng, đã pass, đã fail. Kết quả: chưa chạy, pass, fail, blocked, không áp dụng.
- **Bug:** tiêu đề, mức độ (critical, major, minor, trivial), độ ưu tiên, môi trường, phiên bản build, kết quả mong đợi, các bước tái hiện. Luồng: Mới → Đã giao → Đang xử lý → Đã sửa → Retest → Đã xác nhận → Đã đóng. Chuyển trái luồng bị chặn.
- **Báo cáo:** số ca theo kết quả, bug theo mức độ, requirement đã có test chưa, điều kiện bàn giao. Bàn giao đạt khi đủ mọi tiêu chí exit. Trang báo cáo in được.

## B7. Hiệu năng và Lighthouse trong QA Hub

- Repo có sẵn cấu hình Lighthouse CI (`lighthouserc.json`) và lệnh `npm run lhci`.
- Ngưỡng hiện tại: LCP tối đa 2500 ms, CLS tối đa 0,1, TBT tối đa 200 ms (cảnh báo), accessibility tối thiểu 0,9.
- Kết quả chạy gần nhất trên chính QA Hub (chạy lab, máy phát triển): hiệu năng 100, accessibility 100, LCP khoảng 1,73 giây, CLS 0, TBT khoảng 7–27 ms. Đây là đo trên máy local, không phản ánh mạng người dùng thật.
- QA Hub không đo INP từ người dùng thật. Chỉ số INP trong báo cáo lab được thay bằng TBT.

## B8. Bộ test của QA Hub và kiểm thử dự án

- Bộ test của chính QA Hub: `npm test` (Playwright). Gồm kiểm tra API, UI, bảo mật đầu vào, accessibility bằng axe, responsive, hiệu năng, pipeline.
- Bộ test này kiểm QA Hub, không kiểm dự án người dùng thêm vào.
- Kiểm dự án của bạn: thêm dự án zip hoặc GitHub có `npm test`, rồi bấm "Chạy từ A đến Z".

## B9. Trợ lý AI và cấu hình

- **Không có AI:** trợ lý vẫn trả báo cáo theo quy tắc: giai đoạn hiện tại, đã đạt, còn thiếu, checklist chưa tick, ca chưa chạy, requirement chưa có test, điều kiện bàn giao.
- **Cấu hình AI** (trang Hỏi trợ lý → Cấu hình AI). Các provider:
  - Anthropic (Claude): dán key Anthropic.
  - FreeLLMAPI: app chạy trên máy.
  - Tùy chỉnh (OpenAI-compatible): nhập đường dẫn API, tên model, key nếu cần. Ví dụ Open WebUI: `http://localhost:3000/api/v1`, model `qa-expert`.
- **Key:** lưu trên máy, chỉ hiện 4 ký tự cuối. Không gửi đi trừ provider đã chọn.
- **AI hiện làm được:** trả lời, gợi ý, đọc mã để gợi ý tick checklist (khi được cho phép).
- **AI hiện chưa làm được:** tự chạy test, tự thêm dự án, tự sửa dữ liệu. Các việc đó do người dùng bấm nút. Phần điều hành AI (chọn thao tác từ danh sách cố định) là việc đang làm dở.

## B10. Kỹ thuật và vận hành

- Chạy trên máy, cổng mặc định 3000. Nếu cổng bị chiếm (ví dụ Open WebUI), đặt biến `PORT`, ví dụ `PORT=3100`.
- Dữ liệu lưu trong `data/runtime` dạng JSON. Dữ liệu mẫu trong `data/seed.json`.
- Chạy kiểm thử của chính QA Hub: `npm test`.
- Lighthouse CI: `npm run lhci`.
- Quét virus cần Windows Defender. Trên máy không có Defender, bước quét báo "không khả dụng" và luồng dừng an toàn.

## B11. Những việc QA Hub chưa làm

Để trợ lý không hứa quá:
- Điều phối AI tự chọn và chạy thao tác.
- Khung chat nổi trên mọi trang.
- Kiểm UI/UX bằng AI.
- Tích hợp k6 (hiệu năng tải) và OWASP ZAP (quét bảo mật) thật.
- Chạy kiểm tra trên dự án thật mà chưa thử đầy đủ (đã thử trên mã mẫu của QA Hub và Lighthouse trên chính QA Hub).
- Lưu tài khoản và phân quyền nhiều người dùng.

## B12. Câu hỏi thường gặp của người mới

**Tôi muốn kiểm một website. Bắt đầu từ đâu?**
1. Vào Dự án, thêm dự án (domain có xác nhận quyền, hoặc zip, hoặc GitHub).
2. Vào Tổng, chọn dự án, bấm "Chạy từ A đến Z".
3. Xem kết quả ở Tổng và checklist.
4. Thêm test case thủ công cho luồng nghiệp vụ, rồi ghi bug nếu có.
5. Xem Báo cáo để biết còn thiếu gì.

**Vì sao checklist vẫn còn nhiều mục chưa tick?**
Các mục về giao diện, hiệu năng, bảo mật, tương thích cần người test làm và tự tick sau khi làm.

**Vì sao không thấy ca test sinh từ mã có kết quả?**
Ca sinh ra là nháp. Bạn cần chạy và ghi kết quả.

**Tôi có cần AI không?**
Không bắt buộc. Mọi luồng chính chạy được không cần AI. AI giúp trả lời tự do và gợi ý.
