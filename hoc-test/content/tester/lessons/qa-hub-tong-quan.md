# QA Hub: một công cụ quản lý kiểm thử từ A đến Z

Bài này gom lại toàn bộ cách một tester dùng QA Hub: từ viết test case, truy vết yêu cầu, ghi bug, chạy tự động, đến biên bản bàn giao. Bạn không cần biết lập trình để học bài này.

## Sau bài này bạn làm được gì

- Giải thích QA Hub dùng để làm gì và lưu dữ liệu ở đâu.
- Đọc được trang Tổng và biết việc nào còn dở.
- Viết test case, gắn với yêu cầu, và nắm vòng duyệt của nó.
- Hiểu vòng đời của một bug và vì sao không được nhảy cóc.
- Hiểu nhóm tính năng "Auto" làm gì và giới hạn của nó.
- Đọc biên bản kết thúc và biết khi nào mới được bàn giao.

## QA Hub là gì

QA Hub là ứng dụng quản lý kiểm thử chạy trên một máy, không cần máy chủ ngoài. Nó giúp bạn:

- Viết và quản lý **test case**.
- Gắn test case với **yêu cầu** (REQ) để biết yêu cầu nào đã được kiểm.
- Ghi và theo dõi **bug** từ lúc phát hiện đến lúc đóng.
- Lập **kế hoạch test**, đánh giá **tiêu chí ra**, và viết **biên bản**.
- Chạy **bộ test tự động** và đưa kết quả vào test case.

Dữ liệu lưu trong một file SQLite trên máy (`data/runtime/qa-hub.db`), dùng module `node:sqlite` có sẵn trong Node nên không cần cài thêm. Mọi thao tác ghi đều được ghi lại trong nhật ký.

Ngoài ra QA Hub còn có trợ lý chat và trang kiểm từng model AI, dùng Ollama chạy trên máy (xem phần Model AI bên dưới).

## Trang Tổng

Trang Tổng cho bạn bức tranh chung: tỉ lệ đạt, số lỗi đang mở, tiến độ từng giai đoạn kiểm thử, trạng thái checklist, và lần chạy test gần nhất.

Đọc trang Tổng theo thứ tự này:

1. Xem các giai đoạn có "đạt" hay "một phần" chưa.
2. Xem số test case đã có kết quả so với tổng.
3. Xem tiêu chí ra còn mục nào chưa đạt.

Trang Tổng chỉ tổng hợp dữ liệu. Muốn biết vì sao một mục chưa đạt, phải mở đúng trang chi tiết.

## Phân quyền

Có bốn vai trò:

| Vai trò | Quyền chính |
|---|---|
| Admin | Toàn quyền, quản lý người dùng và cấu hình |
| QA Lead | Duyệt và khóa test case, lập kế hoạch, ký biên bản |
| Tester | Viết dữ liệu, gửi test case đi duyệt |
| Viewer | Chỉ đọc |

Mọi thao tác ghi đều có dấu vết: ai làm, làm gì, lúc nào.

## Test case

Mỗi test case có:

- **Tiêu đề, module, ưu tiên** (low, medium, high).
- **Kiểu test**: positive, negative, boundary, equivalence, state_transition, decision_table, security, và các kiểu khác.
- **Tiền điều kiện, các bước, dữ liệu, kết quả mong đợi.**
- **Yêu cầu liên quan** (REQ-xx) và **suite** (TS-xx).
- **Kiểu test**: positive, negative, boundary, equivalence, decision_table, state_transition, smoke, regression, security và các kiểu khác.

Có hai trạng thái khác nhau, đừng nhầm:

1. **Trạng thái duyệt**: nháp → chờ duyệt → đã duyệt → khóa.
2. **Kết quả chạy**: chưa chạy, pass, fail, bị chặn, không áp dụng.

Kết quả chạy phải đến từ việc chạy test thật, không ghi tay.

### Duyệt test case

1. **Gửi duyệt**: nháp → chờ duyệt.
2. **Duyệt**: chờ duyệt → đã duyệt (chỉ Admin hoặc QA Lead).
3. **Từ chối**: chờ duyệt → nháp, bắt buộc có lý do.
4. **Khóa**: đã duyệt → khóa. Test đã khóa không đổi được trạng thái.

Mẹo kiểm: test còn ở nháp mà đã có kết quả pass là dấu hiệu quy trình đang lệch. Nên duyệt hoặc ghi chú rõ.

## Truy vết yêu cầu

Truy vết trả lời ba câu hỏi:

- Yêu cầu nào đã có test case?
- Yêu cầu nào chưa có?
- Test case nào không gắn yêu cầu hợp lệ?

Độ phủ yêu cầu tính bằng phần trăm. Một yêu cầu có test case chưa chạy hoặc chưa đạt thì **chưa được tính là đã kiểm**. Đây là lỗi hay gặp: nhìn độ phủ 100% nhưng thực tế có yêu cầu không có bằng chứng nào.

## Bug và vòng đời

Mỗi bug có hai thứ khác nhau:

- **Mức độ** (critical, major, minor, trivial): tác động kỹ thuật.
- **Ưu tiên** (low, medium, high, urgent): thứ tự sửa.

Vòng đời:

```
mới → đã giao → đang xử lý → đã sửa → kiểm thử lại → đã xác nhận → đã đóng
```

Ngoài ra có từ chối, trùng, hoãn, và mở lại. Chuyển trạng thái trái luồng bị chặn. Không thể nhảy từ "mới" sang "đã đóng".

Đây là lý do có test "chuyển trạng thái trái luồng bị chặn": app phải giữ được quy trình, chứ không chỉ là đẹp.

## Kế hoạch, tiêu chí ra và biên bản

**Rủi ro** được chấm bằng khả năng (1–3) × ảnh hưởng (1–3). Từ 6 trở lên là cao. Rủi ro cao mà chưa có biện pháp giảm sẽ bị báo thiếu.

**Tiêu chí ra mặc định:**

- Tỉ lệ đạt từ 90% trên test case đã chạy.
- Không còn test case bị chặn.
- Mọi test case ưu tiên cao đều đạt.
- Không còn bug critical đang mở.
- Độ phủ yêu cầu 100%.
- Mọi test case đã được chạy.

**Biên bản kết thúc** nêu đề xuất quyết định dựa trên số liệu: chấp nhận, có điều kiện, hoặc không chấp nhận. Biên bản liệt kê bug còn mở, rủi ro còn lại, và cần chữ ký của Admin hoặc QA Lead.

Biên bản chỉ nên đưa ra khi tiêu chí ra đã đạt. Nếu còn mục chưa đạt, biên bản phải nói rõ là chưa đủ điều kiện bàn giao.

## Nhóm tính năng "Auto": đi sâu từng phần

Auto làm lại những việc một tester vẫn làm bằng tay, nhưng lặp lại đều và không quên. Hiểu từng phần để biết máy kiểm cái gì, không kiểm cái gì, và kết quả "pass" có đáng tin không.

### Vài khái niệm nền

- **Hồi quy (regression):** sửa chỗ này làm hỏng chỗ khác vốn chạy tốt. Ví dụ: sửa form đăng ký xong, nút đăng nhập bỗng không bấm được.
- **Test chập chờn (flaky):** cùng một test lúc pass lúc fail mà code không đổi. Thường do thời gian chờ, mạng hoặc dữ liệu cũ. Flaky làm người ta mất niềm tin vào cả bộ test.
- **Mã trạng thái HTTP:** 200 là trang tải được; 3xx là chuyển hướng; 404 là không tìm thấy; 5xx là lỗi phía máy chủ.
- **"404 giả":** trang không tồn tại nhưng máy chủ vẫn trả 200 và hiện một trang "không tìm thấy". Người dùng thấy như bình thường, nhưng máy tìm kiếm và công cụ kiểm tra đều bị đánh lừa.

### 1. Autorun: chạy test theo lịch

**Làm gì:** đến giờ đã đặt, máy mở bộ test Playwright. Playwright điều khiển một trình duyệt thật, bấm và nhập liệu như người dùng.

**Vì sao cần:** bạn sửa code lúc 9 giờ. Đến 9 giờ 30, máy đã chạy lại và báo "trang đăng nhập hỏng" trước khi khách gặp. Không có autorun thì phải nhớ chạy tay, và rất dễ quên.

**Đọc kết quả thế nào:**
- Đạt và lỗi: tổng quan. Lỗi mới xuất hiện sau một thay đổi là dấu hiệu hồi quy.
- Chập chờn: không phải lỗi thật, nhưng phải điều tra vì nó làm nhiễu kết quả.
- Thời gian chạy: nếu tăng dần qua các lần, app có thể đang chậm đi.

**Giới hạn:** lịch ngắn nhất là 5 phút, và tắt mặc định. Autorun chỉ kiểm được những gì đã được viết thành test. Chức năng mới chưa có test thì nó không báo gì cả.

### 2. Auto-check: kiểm link, domain và file

Trước khi chạy, hệ thống liệt kê kế hoạch kiểm để bạn biết trước sẽ kiểm gì. Đây là bước xem trước, chưa chạy thật.

**Với domain**, mỗi kiểm có một lý do:

- **Trả 2xx hoặc chuyển hướng sang HTTPS.** Trang phải mở được và truyền dữ liệu qua kênh mã hóa. HTTP thường không mã hóa, mật khẩu gửi đi có thể bị nghe lén.
- **Security headers.** Đây là các dòng cấu hình máy chủ gửi kèm trang để trình duyệt tự bảo vệ:
  - *CSP*: chỉ cho chạy script từ nguồn được phép, giảm nguy cơ XSS (mã độc được chèn vào trang).
  - *HSTS*: ép trình duyệt lần sau luôn dùng HTTPS.
  - *X-Content-Type-Options*: không để trình duyệt tự đoán sai kiểu file.
  - *X-Frame-Options*: ngăn trang bị nhúng vào trang khác. Nếu thiếu, kẻ xấu có thể nhúng trang của bạn vào khung ẩn rồi đặt một nút giả lên trên để lừa người dùng bấm (clickjacking).
  - *Referrer-Policy*: giới hạn thông tin về trang trước đó mà trình duyệt gửi đi.
- **Thời gian phản hồi dưới ngưỡng.** Trang chậm làm khách bỏ đi, dù không có lỗi nào.
- **Đường dẫn không tồn tại phải trả 404.** Máy thử một địa chỉ bịa, ví dụ `/khong-ton-tai-abc`. Nếu nhận 200 thì đó là 404 giả.
- **Trang nội bộ không có 4xx/5xx.** Máy đi qua tối đa 30 trang, cách trang chủ tối đa 2 bước link. Đây là cách bắt link gãy trước khi khách bấm phải.
- **Mỗi trang có tiêu đề và mô tả meta.** Thiếu hai thứ này, trang khó hiện đúng khi tìm kiếm hoặc khi chia sẻ.
- **Không còn lorem ipsum.** Chữ giữ chỗ lọt ra ngoài là dấu hiệu trang chưa làm xong.

**Với file**, các kiểm thường gặp:

- **Đọc được và mã hóa UTF-8.** Sai mã hóa thì tiếng Việt hiện thành chuỗi ký tự lạ.
- **Không lộ khóa hay mật khẩu.** Máy tìm chuỗi trông như khóa riêng, khóa AWS, token hoặc mật khẩu viết thẳng trong file. Nếu thứ này đã lên repo, phải đổi khóa ngay. Xóa khỏi file thôi là chưa đủ.
- **Đếm dòng báo lỗi.** Tìm các từ như error, exception, fatal, traceback, panic. Log có lỗi mà không ai đọc thì lỗi bị giấu.
- **JSON đúng cú pháp.** Thiếu một dấu phẩy là chương trình không đọc được file.
- **CSV có số cột nhất quán.** Đây là kiểm dễ bỏ sót nhất.

> Ví dụ CSV: file có 5 cột, nhưng dòng thứ 12 có 6 cột vì một tên có dấu phẩy mà không đặt trong ngoặc kép. Từ dòng 12 trở đi, mọi số đều lệch cột. Không có auto-check thì số liệu sai nhưng không ai báo.

### 3. Auto-results: ghi kết quả vào test case

**Vì sao cần:** nếu người nhập tay "pass", báo cáo có thể đẹp nhưng không đúng. Kết quả do máy ghi thì có bằng chứng: tên file spec đã chạy.

**Cơ chế:**
- Mỗi test case có trường `automationKey`, là tiêu đề của test tương ứng trong bộ Playwright. Hai bên phải khớp đúng từng chữ.
- Khi chạy xong, pass hoặc fail được ghi vào đúng test case, kèm tên file spec.
- Ghi tay bị từ chối với mã 403, nên không ai sửa được kết quả.

> Lưu ý thực tế: đổi tên một test trong Playwright mà không đổi `automationKey` thì kết quả không có chỗ để ghi. Test case vẫn hiện "chưa chạy", dù test đã chạy tốt. Đây là lỗi hay gặp khi đổi tên test.

### 4. Model-check: kiểm từng model AI

**Làm gì:** hỏi mỗi model cùng một câu, rồi ghi lại xem có trả lời không, mất bao lâu, và 200 ký tự đầu của câu trả lời.

**Tiêu chí đạt rất thấp:** chỉ cần ít nhất 10 ký tự nội dung. Một câu trả lời vô nghĩa dài 10 ký tự vẫn được tính là đạt. Đây là kiểm "còn sống", không phải kiểm "đúng".

**Đọc kết quả thế nào:**
- **Lỗi do hết 120 giây chờ:** không có nghĩa là model hỏng. Có thể model lớn đang chạy chậm vì một phần phải dùng CPU, hoặc chưa tải xong. Muốn biết chắc thì thử lại, hoặc tăng thời gian chờ.
- **Không trả lời sau nhiều phút:** model có thể đã treo. Nên kiểm lại model hoặc máy trước khi giao việc.

**Về 7 vai trò (Red Team, Bug Bounty, Code Review...):** tên vai gợi ý model được chọn để làm việc gì, nhưng model-check không kiểm vai đó. Ví dụ: một model gắn vai "Code Review" vẫn có thể qua model-check mà bỏ sót lỗi trong code. Muốn kiểm đúng vai, cần bộ câu hỏi riêng. Ví dụ đưa một đoạn code đã biết trước có lỗi, rồi xem model có chỉ ra không.

### Ghi nhớ

- Tự động là việc lặp lại đã biết cách làm. Nó không thay được việc nghĩ ra cái cần kiểm.
- Một kết quả "pass" chỉ đáng tin khi bạn biết test kiểm gì và không kiểm gì.
- Mỗi khi thấy "pass", hỏi: test này có thể pass dù app vẫn sai không? Ví dụ: trang 404 giả trả 200, hoặc model trả lời vô nghĩa vẫn đạt.

### Tự kiểm

1. Vì sao trang không tồn tại phải trả 404, không được trả 200?
2. Flaky khác hồi quy ở điểm nào?
3. Đổi tên một test có thể làm mất kết quả tự động ra sao?
4. Model đạt model-check có chứng minh nó phân tích bảo mật tốt không? Vì sao?

*Gợi ý đáp án:* (1) 200 cho trang không có thật làm máy và người dùng hiểu sai, nên lỗi bị giấu. (2) Hồi quy là sửa làm hỏng chỗ khác, còn flaky là cùng một test mà kết quả lúc đổi lúc không dù code không đổi. (3) Kết quả được ghi theo tiêu đề khớp đúng, đổi tên thì không test case nào nhận được kết quả. (4) Không. Model-check chỉ kiểm model còn trả lời được, không đo chất lượng phân tích.

## Đọc tình trạng dự án

Một ví dụ về cách đọc số liệu. Giả sử một dự án có 15 test case, 13 đã chạy đều pass, 2 chưa chạy. Dễ kết luận "gần xong", nhưng cần kiểm tiếp:

- Hai test chưa chạy có thuộc yêu cầu nào không? Nếu có, yêu cầu đó chưa có bằng chứng.
- Test chưa chạy có ưu tiên cao không? Nếu có, tiêu chí "mọi test ưu tiên cao đều đạt" chưa đúng.
- Có test nào đã có kết quả mà vẫn ở nháp không?
- Checklist có khớp với kết quả thật không? Mục "đã chạy test" mà không tick thì số liệu lệch.

Kết luận đúng là: **chưa đủ điều kiện bàn giao**, và liệt kê rõ việc còn lại.

## Chuẩn bị môi trường

QA Hub cần ba dịch vụ:

| Dịch vụ | Cổng | Vai trò |
|---|---|---|
| QA Hub | 3100 | Ứng dụng chính |
| Ollama | 11434 | Chạy model AI cục bộ |
| Open WebUI | 8080 | Giao diện chat với model |

Khởi động cả ba bằng một lệnh (chạy trong thư mục qa-hub):

```bash
.\scripts\start-all.ps1
```

Script đọc cấu hình trong `scripts/services.json` và kiểm tra từng dịch vụ bằng health check thật. Chỉ báo **OK** khi dịch vụ thực sự trả lời. Nếu một dịch vụ không lên, script báo lỗi thay vì báo OK giả.

Kết quả đúng là ba dòng `[OK]` kèm đường dẫn của từng dịch vụ.

## Đăng nhập, phân quyền và nhật ký

Khi bật đăng nhập (mặc định), mọi API đều cần phiên đăng nhập, trừ `/api/health` và `/api/auth/login`.

- Lần đầu chạy, hệ thống tạo tài khoản admin từ biến môi trường `QA_ADMIN_USER` và `QA_ADMIN_PASSWORD`. Nếu không đặt mật khẩu, hệ thống tự sinh một mật khẩu ngẫu nhiên và chỉ in ra một lần.
- Mật khẩu được băm bằng scrypt, không lưu dạng gốc. Phiên đăng nhập có hiệu lực 12 giờ.
- Mọi thao tác ghi (POST, PUT, PATCH, DELETE) được ghi vào nhật ký kiểm toán (`GET /api/audit`): ai làm, làm gì, lúc nào, trên đối tượng nào, kết quả ra sao. Nhật ký không ghi nội dung yêu cầu.

Quy tắc an toàn: mật khẩu và khóa API không đưa vào repo. Chỉ đặt qua biến môi trường.

## Trang Tổng: các giai đoạn kiểm thử

Trang Tổng theo dõi tiến độ theo giai đoạn: chuẩn bị, hiểu yêu cầu, thiết kế, môi trường, smoke, chức năng, giao diện, truy cập, hiệu năng, bảo mật, trình duyệt, hồi quy, báo cáo và các giai đoạn AI. Bạn có thể chọn dự án, chạy test ngay từ trang này và xem lần chạy gần nhất.

## Chạy bộ test tự động

Trang Tổng hoặc Test case cho phép chọn đối tượng (QA Hub hoặc một dự án khác), nhóm test và trình duyệt. Quy trình:

1. Bấm **Kiểm tra trước** để xem còn thiếu gì.
2. Bấm **Bắt đầu chạy**.

Bộ test dùng Playwright, gồm: smoke, chức năng, giao diện, bàn phím, truy cập (axe-core), hiệu năng (Lighthouse), bảo mật và sao lưu dữ liệu. Mỗi lần chạy có ảnh chụp, video và trace.

Kết quả pass của test nào được đồng bộ vào test case tương ứng. Kết quả là số đạt, số lỗi và file bằng chứng cho từng test.

## Vòng đời bug: tóm tắt để nhớ

Bug có mức độ (tác động kỹ thuật), ưu tiên (thứ tự sửa), môi trường (DEV, SIT, QA, UAT, STAGING, PROD) và nơi tìm thấy (test, uat, production). Bug có đủ bước tái hiện, kết quả mong đợi và kết quả thực tế.

Chuyển trạng thái sai bị trả lỗi 409, nên không thể nhảy từ "mới" sang "đã đóng".

## Trợ lý AI và kiểm tra model

QA Hub dùng Ollama chạy trên máy để trả lời câu hỏi. Có hai phần:

1. **Trợ lý chat**: hỏi về trạng thái app, checklist hoặc lỗi đang mở.
2. **Kiểm tra từng model** (trang Hệ thống): gửi một câu hỏi cố định tới từng model, ghi đạt hoặc lỗi, thời gian phản hồi và một đoạn trả lời mẫu.

Trả lời được coi là đạt khi có ít nhất 10 ký tự nội dung thật. Model lớn có thể chậm vì phải chạy một phần trên CPU khi VRAM không đủ.

Open WebUI (cổng 8080) là giao diện chat riêng, dùng cùng các model Ollama, có sẵn các model QA đã cấu hình sẵn system prompt và kiến thức về QA Hub.

## Pipeline CI của chính QA Hub

Trang Hệ thống chạy pipeline tự kiểm, gồm:

1. Cài đặt (npm install).
2. Kiểm cú pháp.
3. E2E, API, UI, bảo mật (Playwright).
4. Đồng bộ kết quả vào test case.
5. Trợ lý AI (đối chiếu câu trả lời với dữ liệu thật).
6. Accessibility (axe-core): không có lỗi critical hay serious.
7. Hiệu năng (Lighthouse) trên 6 trang chính.
8. Báo cáo HTML.

Kết quả là một bảng xanh/đỏ cho từng bước và một file báo cáo tổng hợp.

## Sao lưu và khôi phục

Sao lưu SQLite bằng `VACUUM INTO`, sau đó kiểm tra toàn vẹn (`integrity_check`) và các bảng bắt buộc. Khi khôi phục, bản cũ được giữ lại với đuôi `.before-restore-…` để không mất dữ liệu.

```bash
node scripts/db-backup.mjs backup
node scripts/db-backup.mjs verify <file>
node scripts/db-backup.mjs restore <file>
```

Kết quả: có thể quay lại trạng thái trước đó nếu có sự cố.

## Lộ trình và giai đoạn

Dự án đi theo bốn giai đoạn:

- **G0 Môi trường**: QA Hub, Ollama, Open WebUI.
- **G1 Nền tảng**: SQLite, đăng nhập, nhật ký kiểm toán, cấu hình, sao lưu.
- **G2 Quy trình STLC**: kế hoạch, truy vết, thiết kế, duyệt, chạy test, bug, báo cáo, biên bản. Đang làm dở.
- **G3 Kiểm thử đa tầng**: unit, integration, contract, visual, tải, bảo mật, flaky, bàn phím, đa trình duyệt, đánh giá AI.
- **G4 Vận hành**: Docker, CI/CD, giám sát, tài liệu, bản 1.0.

Mỗi giai đoạn chỉ kết thúc khi test xanh, CI xanh và có báo cáo rủi ro còn lại. Tiến độ ghi trong `CHANGELOG.md` của dự án.

## Ghi chú cho người học

- Khi thêm tính năng mới, viết test tự động trước, rồi ghi `CHANGELOG.md`.
- Các script riêng (ví dụ hoclieu.vn) không tích hợp vào lõi QA Hub.

## Tóm lại

- QA Hub gom công việc kiểm thử vào một chỗ: test case, yêu cầu, bug, kế hoạch, biên bản.
- Đọc số liệu phải đi sâu: đã chạy chưa, ưu tiên là gì, có bằng chứng không.
- Tự động giúp bạn không quên, nhưng không thay được việc suy nghĩ về rủi ro.
- Chỉ bàn giao khi tiêu chí ra đã đạt, và ghi rõ rủi ro còn lại.
