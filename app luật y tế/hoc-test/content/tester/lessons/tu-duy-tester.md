# Tư duy tester

Tester đặt câu hỏi thay vì chỉ xác nhận điều mong đợi. Nhận ra các thiên kiến làm bỏ sót lỗi.

Bài trình chiếu đầy đủ nằm trong mục slide của bài này. Bài tập ở cuối trang.

## Nhìn bằng hình

*Hình vẽ gốc, dùng để minh họa thứ tự các bước chính của bài.*

## Sau bài này bạn làm được gì

- Giải thích vì sao tester cần đặt câu hỏi thay vì chỉ xác nhận.
- Nhận ra 8 thiên kiến nhận thức hay gặp khi kiểm thử.
- Áp dụng một cách chống thiên kiến: viết danh sách ca trước khi chạy.

## Tester là người đặt câu hỏi

Lập trình viên thường hỏi: "Code có chạy không?". Tester hỏi: "Có cách nào làm nó sai không? Ai sẽ bị ảnh hưởng nếu nó sai?". Cùng một tính năng, hai câu hỏi dẫn tới hai bộ ca hoàn toàn khác.

- Chức năng này phải làm gì, với ai, trong hoàn cảnh nào?
- Điều gì xảy ra khi đầu vào trống, quá dài, sai kiểu, hoặc có ký tự lạ?
- Điều gì xảy ra khi người dùng làm việc theo thứ tự không ngờ tới?

## Thiên kiến nhận thức là gì

Thiên kiến nhận thức (cognitive bias) là lối suy nghĩ lệch có hệ thống, xuất hiện mà người mắc không tự biết. Tester không miễn nhiễm. Thiên kiến làm ta chọn ca dễ, bỏ qua ca khó, và tin kết quả đẹp hơn mức thật.

*Nguồn: danh sách thiên kiến trên Wikipedia (List of Cognitive Biases) [đã đọc].*

## Xác nhận, neo, sẵn có, sống sót

| Thiên kiến | Định nghĩa ngắn | Ví dụ trong kiểm thử | Cách chống |
| --- | --- | --- | --- |
| Xác nhận (confirmation) | Chỉ tìm và tin thông tin củng cố điều đã tin | Tin module thanh toán ổn, chỉ chạy ca thành công | Viết ca làm hệ thống sai trước |
| Neo (anchoring) | Phụ thuộc quá mức vào thông tin đầu tiên | Lỗi được đánh giá "nhỏ" theo báo cáo đầu, dù tác động lớn | Đánh giá lại mức độ sau khi điều tra |
| Sẵn có (availability) | Đánh giá cao rủi ro dễ nhớ, mới xảy ra | Vừa có sự cố bảo mật nên chỉ kiểm bảo mật, bỏ hiệu năng | Lập bảng rủi ro theo dữ liệu, không theo trí nhớ |
| Sống sót (survivorship) | Chỉ nhìn thứ còn lại sau một quá trình lọc | Chỉ phân tích build qua được hồi quy, bỏ qua build bị loại | Hỏi: dữ liệu nào đã bị loại khỏi tầm nhìn? |

## Lập kế hoạch, Dunning-Kruger, tự động, kỳ vọng

| Thiên kiến | Định nghĩa ngắn | Ví dụ trong kiểm thử | Cách chống |
| --- | --- | --- | --- |
| Ngụy biện lập kế hoạch (planning fallacy) | Đánh giá thấp thời gian cần để xong việc | Ước 2 ngày viết bộ test tự động, thực tế gấp ba | Lấy thời gian thực của việc tương tự làm mốc |
| Dunning-Kruger | Người mới đánh giá cao, chuyên gia đánh giá thấp năng lực | Tester mới tự tin làm bảo mật mà không hỏi ai | Ghép cặp, nhờ review chéo |
| Thiên kiến tự động (automation bias) | Tin máy quá mức, bỏ qua dấu hiệu sai | Công cụ báo pass cho trang lỗi hiển thị, không ai mở xem | Kiểm thủ công một mẫu sau khi tự động chạy |
| Kỳ vọng của người quan sát | Kỳ vọng khiến ta đo và ghi nhận theo hướng mong muốn | Kỳ vọng build mới nhanh hơn, đo trong điều kiện thuận lợi | Đo theo kịch bản cố định, ghi đủ điều kiện |

## Trang đăng nhập: viết ca trước khi chạy

```
Nhóm ca bắt buộc (viết TRƯỚC khi thử):
1. Đường đi đúng: email đúng, mật khẩu đúng
2. Đường đi sai: mật khẩu sai, email không có @
3. Giá trị biên: mật khẩu đúng 8 ký tự và 7 ký tự
4. Trường trống: để trống từng ô một
5. Trạng thái: đăng nhập rồi bấm Back
6. Lỗi lặp: nhập sai 5 lần liên tiếp
Chỉ sau khi có danh sách này mới chạy và ghi kết quả.
```

**Thuật ngữ trong slide này:** **Giá trị biên (boundary value)**: Các giá trị nằm ở mép của một khoảng hoặc điều kiện, nơi lỗi hay xảy ra vì lập trình viên dễ nhầm < với <=.

## Năm việc làm để giảm thiên kiến

1. Viết danh sách ca trước khi xem kết quả, rồi đối chiếu.
2. Đổi vai: thử làm kẻ tấn công, hoặc người dùng mới chưa từng dùng.
3. Nhờ một người khác đọc danh sách ca và thêm ca họ nghĩ là thiếu.
4. Ghi giả thuyết: "Tôi nghĩ X sẽ đúng vì Y". Sau đó kiểm chứng X.
5. Dùng số liệu cho đánh giá rủi ro, không dùng cảm giác hay lỗi gần nhất.

## Nêu hai ca bạn sẽ thử thêm

Một đội báo "form đăng ký đã kiểm xong, 20 ca đều đạt". Tất cả 20 ca đều là đường đi đúng. Hãy nêu ít nhất hai ca lỗi hoặc biên mà đội chưa thử, và thiên kiến nào giải thích việc bỏ sót đó.

## Cách nghĩ của tester theo Bach

- **Đừng hỏi "cần bao nhiêu ca".** Đó là câu hỏi về cách đếm, không về chất lượng. Câu hỏi có ích: "nên kiểm thử cái này thế nào?".
- **Mục đích là tìm cách làm sản phẩm sai.** Thử để học điều nó có thể làm sai, không thử để chứng minh nó đúng.
- **Hoài nghi nghề nghiệp** (professional skepticism): nghe điều người khác nói, rồi kiểm chứng. Tôn trọng lời họ, nhưng không tin ngay.
- **Kiểm thử là học nhanh** (rapid learning): mỗi sản phẩm mới là một bài toán mới để học.

*Nguồn: James Bach, Open Lecture on Software Testing (YouTube ILkT_HV9DVU). Đây là bản tóm tắt bằng lời của người soạn bài, dựa trên phụ đề tự động; phần được đọc khoảng hai phần ba đầu bài giảng.*

## Sơ đồ luồng: học cách đọc một mô hình

- **Phủ quyết định** (decision coverage): mỗi nhánh đúng và sai đều được đi qua ít nhất một lần.
- **Giá trị biên** (boundary value): với điều kiện *a < 70*, các ca quan trọng là 69 và 70. Ca 71 hầu như không thêm gì.
- **Mô hình có thể sai**: trong bài giảng, sơ đồ viết *<* trong khi code là *&le;*. Tester phải so sơ đồ với hệ thống thật.
- **Đường đi bị thiếu**: nếu đầu vào có thể không phải số, sơ đồ thiếu một nhánh. Nhưng nếu một bộ lọc phía trước đảm bảo đầu vào luôn là số trong khoảng cho phép, nhánh đó không xảy ra. Phải kiểm chứng điều đó.
- **Mỗi hộp là một sự trừu tượng** (abstraction): hỏi bên trong hộp thực sự làm gì. "Lưu" có thể là gửi một bản ghi qua mạng, không phải lưu một bit.

*Nguồn: James Bach, Open Lecture on Software Testing (YouTube ILkT_HV9DVU). Đây là bản tóm tắt bằng lời của người soạn bài, dựa trên phụ đề tự động; phần được đọc khoảng hai phần ba đầu bài giảng.*

**Thuật ngữ trong slide này:** **Phủ quyết định (decision coverage)**: Mức độ phủ mà mỗi điều kiện rẽ nhánh (if, else) đã đi qua cả kết quả đúng và sai ít nhất một lần. · **Giá trị biên (boundary value)**: Các giá trị nằm ở mép của một khoảng hoặc điều kiện, nơi lỗi hay xảy ra vì lập trình viên dễ nhầm < với <=. · **Sự trừu tượng (abstraction)**: Cách biểu diễn một thứ phức tạp bằng một hình đơn giản, ẩn chi tiết bên trong. Một hộp trong sơ đồ là một sự trừu tượng.

## Bối cảnh, yêu cầu và ba "thế giới"

- **Bối cảnh** (context): trước khi kiểm, hỏi sản phẩm làm gì, chạy trong hệ thống nào, ai dùng, lỗi thì ai bị ảnh hưởng. Bài giảng dùng ví dụ một hệ thống phòng thủ chạy trên nhiều bộ xử lý.
- **Yêu cầu chưa viết ra** (unwritten requirement): ví dụ thiết bị y tế có dải điện áp 100 đến 250 VAC. Kiểm ở 90 V chỉ để xác nhận nó không chạy là ít giá trị. Điều đáng hỏi là: khi ra ngoài dải, nó hỏng an toàn hay gây nguy hiểm?
- **Ba thế giới**: thế giới được mô tả (tài liệu), thế giới dự định (ý đồ của người làm), và thế giới thực tế (hệ thống đang chạy). Tester so cả ba, không chỉ tài liệu.
- **Đừng bịa yêu cầu**: kiểm yêu cầu ngầm (an toàn, không mất dữ liệu) khác với tự tạo yêu cầu không có căn cứ.

*Nguồn: James Bach, Open Lecture on Software Testing (YouTube ILkT_HV9DVU). Đây là bản tóm tắt bằng lời của người soạn bài, dựa trên phụ đề tự động; phần được đọc khoảng hai phần ba đầu bài giảng.*

**Thuật ngữ trong slide này:** **Yêu cầu chưa viết ra (unwritten requirement)**: Điều người dùng hiển nhiên mong đợi nhưng không ai ghi vào tài liệu, ví dụ không gây nguy hiểm, không mất dữ liệu.

## Khám phá, ghi lại và kể chuyện kiểm thử

- **Tập trung và nới lỏng** (focus, defocus): lúc cần nhìn kỹ một chỗ, lúc cần bỏ ra để nhìn rộng hơn.
- **Theo dấu hiệu lạ** (follow-up testing, branching, backtracking): thấy một điều bất thường nhỏ, thì đào sâu để xem nó có dẫn tới lỗi lớn không. Bài giảng kể một ví dụ mà một lỗi nhỏ về thông báo dẫn tới lỗ hổng nghiêm trọng.
- **Heuristic, không phải best practice**: heuristic là cách giải dễ sai nhưng hữu ích trong bối cảnh cụ thể. Không có "cách đúng duy nhất".
- **Kể chuyện có bằng chứng**: ghi lại việc đã làm bằng thuật ngữ rõ ràng, để người khác hiểu và tái hiện. Điều tưởng như chơi đùa phải được trình bày như một báo cáo kiểm thử.
- **Làm việc với người khác**: không cần biết mọi kỹ năng. Biết cách nhờ người có kỹ năng, và học dần những gì cần. Đó là hành vi nghề nghiệp, không phải gian lận.

*Nguồn: James Bach, Open Lecture on Software Testing (YouTube ILkT_HV9DVU). Đây là bản tóm tắt bằng lời của người soạn bài, dựa trên phụ đề tự động; phần được đọc khoảng hai phần ba đầu bài giảng.*

**Thuật ngữ trong slide này:** **Heuristic**: Cách làm hoặc quy tắc kinh nghiệm để tìm việc cần làm nhanh, không đảm bảo đúng. Xem slide chi tiết trong bài.

## Kiểm thử thường không được viết ra

- **Phần lớn kiểm thử là khám phá** (exploratory testing) và không được ghi lại. Chỉ một phần nhỏ thành tài liệu.
- **Viết mọi ca trước khi chạy làm kiểm thử đắt đỏ**, và khiến tester làm ít ca, ít kiểu kiểm thử hơn. Bài toán là làm sao giảm chi phí tài liệu, mà vẫn giữ kỹ năng.
- **Học theo kiểu lái xe**: người học lái không đọc từng dòng hướng dẫn. Họ được huấn luyện để tự phán đoán. Kiểm thử cũng vậy.
- **Học nhanh từ lĩnh vực khác**: bài giảng kể việc tìm ý tưởng từ toán và vật lý (ví dụ thuật toán tối ưu hóa ngẫu nhiên "simulated annealing") rồi áp dụng vào kiểm thử ngẫu nhiên có điều chỉnh dần.
- **Đếm ca kiểm thử** giống đếm kỳ lân trong phòng ngủ: kết quả tùy vào định nghĩa. Ca kiểm thử không độc lập, không hoán đổi được.

*Nguồn: James Bach, Open Lecture on Software Testing (YouTube ILkT_HV9DVU), phần sau. Tóm tắt bằng lời của người soạn bài, không trích nguyên văn.*

## Checking và testing khác nhau thế nào

- **Checking**: máy kiểm tra điều đã biết, theo kịch bản. Máy không phán đoán, không học thêm.
- **Testing**: con người vừa kiểm vừa để ý điều bất thường, rồi thay đổi cách kiểm. Bài giảng gọi đây là phần việc không thể tự động hóa hoàn toàn.
- **Ví dụ trong bài**: một công cụ đọc biểu đồ hiệu năng chỉ báo khi hiệu năng xấu đi, không báo khi tốt lên bất thường. Một đợt chạy nhanh gấp ba lần lẽ ra là dấu hiệu lỗi đo, nhưng không ai được báo, và lỗi thật bị bỏ sót.
- **Tự động hóa để hỗ trợ kiểm thử**, không phải thay thế tester. Gọi đúng tên giúp không nhầm lẫn: nên gọi phần máy làm là checking, phần con người làm là testing.
- **Uy tín và cam kết**: tester cần xây uy tín trong đội, nói rõ về việc kiểm thử, làm việc thật, không làm giả tài liệu vô ích, và hỗ trợ lập trình viên. Bài giảng nhắc đến việc tester đưa ra một danh sách cam kết với đội phát triển.

*Nguồn: James Bach, Open Lecture on Software Testing (YouTube ILkT_HV9DVU), phần sau. Tóm tắt bằng lời của người soạn bài, không trích nguyên văn.*

## Heuristic là gì

**Heuristic** là một cách làm hoặc một quy tắc rút từ kinh nghiệm, dùng để tìm việc cần làm nhanh khi không có công thức chắc chắn. Nó không cho đáp án đúng tuyệt đối, chỉ gợi ý nơi nên nhìn.

| Loại | Đảm bảo gì | Ví dụ |
| --- | --- | --- |
| Thuật toán (algorithm) | Đúng cho mọi đầu vào trong phạm vi, nếu làm đúng từng bước | Công thức tính năm nhuận |
| Heuristic | Không đảm bảo. Thường nhanh, đủ tốt, và dễ sai ở tình huống lạ | Thử giá trị ở mép khoảng để tìm lỗi |
| Best practice | Tuyên bố là đúng cho mọi bối cảnh. Bài giảng James Bach phản đối cách nghĩ này | Luôn viết ca trước khi test |

Vì không đảm bảo đúng, tester phải tự hỏi: heuristic này đang gợi ý điều gì, và có chỗ nào nó không áp dụng được?

## Cách dùng một heuristic

1. **Chọn** heuristic phù hợp với loại sản phẩm và rủi ro đang kiểm.
2. **Áp dụng** và ghi lại đã thử gì, kết quả ra sao.
3. **Đọc kết quả**: nếu thấy lỗi, đào sâu. Nếu không thấy, không kết luận là không có lỗi.
4. **Đổi** sang heuristic khác khi đã cạn ý tưởng, vì mỗi cái nhìn một hướng khác nhau.
5. **Ghi giới hạn**: heuristic nào có thể bỏ sót gì ở sản phẩm này.

Bài giảng James Bach gọi heuristic là cách giải dễ sai nhưng hữu ích trong bối cảnh cụ thể. Ví dụ trong bài là một "dấu hiệu nhỏ có thể báo một vấn đề lớn hơn": tester thấy một thông báo lạ và đào sâu, thì thấy lỗi nghiêm trọng hơn nhiều.

## Các heuristic phổ biến và cách dùng

| Heuristic | Quy tắc | Ví dụ áp dụng | Giới hạn |
| --- | --- | --- | --- |
| Biên (boundary) | Thử đúng mép, và ngay trên, ngay dưới mép | Tuổi 18 đến 60: thử 17, 18, 60, 61 | Không bắt được lỗi ở giữa khoảng |
| CRUD | Thử tạo, đọc, sửa, xóa cho mỗi loại dữ liệu | Sản phẩm: thêm, xem, đổi giá, xóa | Không bao quát luồng nghiệp vụ dài |
| Vừa đủ (Goldilocks) | Thử quá ít, quá nhiều, và vừa phải | Số lượng đặt hàng: 0, 1000, 5 | Chọn mức "quá nhiều" tùy bối cảnh |
| Dữ liệu xấu | Để trống, số âm, chuỗi rất dài, ký tự lạ | Ô tên: để trống, 500 ký tự, emoji | Không biết trước đầu vào nào sẽ xấu |
| Ngắt giữa chừng | Làm dở rồi thoát, quay lại, hoặc mất mạng | Đang điền form thì tải lại trang | Không phải lỗi nào cũng hiện ngay |
| Đối chiếu sản phẩm cùng loại | Xem cách sản phẩm tương tự xử lý việc này | So với trang thanh toán của ứng dụng khác | Sản phẩm khác có thể cũng sai |
| Nhất quán | Cùng thao tác, cùng kết quả; cùng ngôn ngữ và kiểu hiển thị | Nút "Lưu" ở trang này và trang khác | Đôi khi nhất quán nhưng vẫn sai |

*Các quy tắc trên do người soạn bài tổng hợp từ kinh nghiệm kiểm thử thông thường, viết lại bằng lời của mình.*

## Vì sao heuristic hữu ích

- **Lỗi tập trung ở chỗ có quy luật.** Biên, giá trị rỗng, số âm, chuỗi quá dài là những chỗ lập trình viên hay quên. Thử đúng các chỗ đó có khả năng bắt lỗi cao hơn thử ngẫu nhiên.
- **Thu hẹp không gian tìm kiếm.** Không thể thử mọi đầu vào. Heuristic chọn ra một nhóm đại diện có khả năng cao chứa lỗi.
- **Nhanh và dễ truyền lại.** Một quy tắc ngắn có thể dùng ngay, và người khác học được mà không cần cả khóa.
- **Thích ứng khi chưa có đặc tả.** Khi tài liệu thiếu, heuristic vẫn cho một điểm xuất phát có lý do.

**Giới hạn:** không đảm bảo. Heuristic có thể bỏ sót lỗi ở chỗ không theo quy luật quen thuộc. Vì vậy phải kết hợp với kỹ thuật có đảm bảo hơn (phân vùng, bảng quyết định) và ghi lại kết quả để đánh giá heuristic đó có đáng dùng không.

*Các ý trên do người soạn bài viết từ kinh nghiệm kiểm thử thông thường.*

## Áp dụng heuristic biên cho ô "tuổi"

1. **Nhận diện khoảng:** tuổi hợp lệ là từ 18 đến 60.
2. **Xác định mép:** 18 và 60.
3. **Chọn ca ở mép và sát mép:** 17, 18, 60, 61.
4. **Ghi kỳ vọng trước khi chạy:** 17 bị từ chối, 18 và 60 được nhận, 61 bị từ chối.
5. **Chạy và đối chiếu:** nếu 60 bị từ chối, nghi ngờ điều kiện viết sai thành nhỏ hơn 60 thay vì nhỏ hơn hoặc bằng 60. Ghi lại như một lỗi có bước tái hiện.
6. **Đổi heuristic khi cạn ý:** sang dữ liệu xấu: để trống, chữ "abc", -5, 1000.

Ví dụ này cho thấy heuristic là một chuỗi bước có thể làm lại, không phải một ý chung chung. Mỗi bước có đầu ra kiểm được.

## Câu hỏi để ôn

1. Vì sao "cần bao nhiêu ca" là câu hỏi ít giá trị? Câu hỏi nào tốt hơn?
2. Với điều kiện *a < 70*, hai ca nào cho biên? Vì sao sơ đồ có thể khác code?
3. Khi nào thiếu một nhánh đầu vào không phải số là vấn đề, và khi nào không?
4. Yêu cầu chưa viết ra là gì? Cho một ví dụ trong ứng dụng bạn biết.
5. Ba thế giới là gì? Tài liệu nằm ở thế giới nào?
6. Vì sao tester ghi lại việc làm như một câu chuyện có bằng chứng?

*Thuật ngữ tiếng Anh: decision coverage, boundary value, abstraction, professional skepticism, rapid learning, unwritten requirement, context, heuristic, focus, defocus, follow-up testing, backtracking.*

**Thuật ngữ trong slide này:** **Phủ quyết định (decision coverage)**: Mức độ phủ mà mỗi điều kiện rẽ nhánh (if, else) đã đi qua cả kết quả đúng và sai ít nhất một lần. · **Giá trị biên (boundary value)**: Các giá trị nằm ở mép của một khoảng hoặc điều kiện, nơi lỗi hay xảy ra vì lập trình viên dễ nhầm < với <=. · **Sự trừu tượng (abstraction)**: Cách biểu diễn một thứ phức tạp bằng một hình đơn giản, ẩn chi tiết bên trong. Một hộp trong sơ đồ là một sự trừu tượng. · **Heuristic**: Cách làm hoặc quy tắc kinh nghiệm để tìm việc cần làm nhanh, không đảm bảo đúng. Xem slide chi tiết trong bài. · **Yêu cầu chưa viết ra (unwritten requirement)**: Điều người dùng hiển nhiên mong đợi nhưng không ai ghi vào tài liệu, ví dụ không gây nguy hiểm, không mất dữ liệu.

## Thực hành: chia vùng với ô Tuổi

Đọc xong phần lý thuyết, mở [trang thực hành](thuc-hanh.html?id=phan-vung-tuoi). Bên trái là app test, bên phải là trợ giảng. Bấm **Chạy demo** để xem mẫu trước, rồi tự làm 5 bài.

## Đọc thêm: The Testing Mindset

- **List of Cognitive Biases** (Wikipedia): https://en.wikipedia.org/wiki/List_of_cognitive_biases
- **Agile Testing Mindset and the Role of the Agile Tester**: http://www.testingexcellence.com/agile-testing-mindset-tester-role-agile-team/
- **Propositional Logic** (Kevin deLaPlante, video): https://www.youtube.com/watch?v=qV4htTfow-E
- **Philosophy for Beginners** (Marianne Talbot, Oxford, playlist): https://www.youtube.com/playlist?list=PLbgBhYAnXCnnzuBmY8O9RCXQZV_y7mbo6

*Nguồn: FreeLearningResourcesForSoftwareTesters, mục "The Testing Mindset".*

## Sai ở đâu, và sửa thế nào

## Giải thích chi tiết

**Phủ quyết định (decision coverage)**

**Giá trị biên (boundary value)**

## Giải thích chi tiết

**Sự trừu tượng (abstraction)**

**Heuristic**

## Giải thích chi tiết

**Yêu cầu chưa viết ra (unwritten requirement)**

## Điều cần nhớ

- Tester đặt câu hỏi, không chỉ xác nhận điều mong đợi.
- Thiên kiến xảy ra với mọi người, nên cần quy trình để chống, không dựa vào ý chí.
- Viết ca trước, đổi vai, nhờ người khác xem, và ghi rõ giả thuyết.

