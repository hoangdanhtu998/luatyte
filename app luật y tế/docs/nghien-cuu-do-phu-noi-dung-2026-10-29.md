# Nội dung luật y tế của app hiện đủ chưa?

**Ngày rà:** 29/10/2026  
**Phạm vi:** `app luật y tế/data/laws.json`, `quiz*.json`, `tf.json`, `ly_thuyet.json`; đối chiếu nguồn chính thức trên Cổng Chính phủ, Công báo, Bộ Y tế, BHXH Việt Nam.  
**Tính chất:** chỉ đọc dữ liệu app; chỉ tạo file ghi chú này; không sửa laws/quiz/theory hay file khác.

## 0. Một thay đổi dữ liệu trong lúc rà

Khi bắt đầu, dữ liệu đúng như yêu cầu: **41 văn bản, 187 câu trắc nghiệm, 23 câu đúng/sai, 14 chương lý thuyết**. Trong lúc rà, dữ liệu được bổ sung **Nghị định 90/2026/NĐ-CP** (12 câu hỏi, trong đó 8 tình huống; chương `c15`; 1 mục trong `laws.json`). Trạng thái cuối của ghi chú này là:

| Hạng mục | Đầu kỳ | Cuối kỳ |
|---|---:|---:|
| Văn bản trong `laws.json` | 41 | **42** |
| Câu trắc nghiệm | 187 | **199** |
| Câu đúng/sai | 23 | 23 |
| Chương lý thuyết | 14 | **15** |

Vì vậy, các con số **17/41**, **35/41**, **187** được giữ làm baseline để đối chiếu đúng yêu cầu; các kết luận dùng trạng thái cuối **42/199/15**. `docs/audit-noi-dung-luat-2026-10-29.md` mục 8 và `CLAUDE.md` đã cập nhật 42/199/15, nhưng các mục 1–7 của audit vẫn ghi 41/187/14 — dễ lẫn khi trích dẫn.

Hệ quả quan trọng: **xử phạt vi phạm hành chính trong y tế không còn là khoảng trống hoàn toàn**. Trọng tâm khoảng trống chuyển sang đấu thầu thuốc/trang thiết bị, bảo hiểm xã hội (ốm đau/thai sản), giao dịch điện tử/an ninh mạng, an toàn thực phẩm và nền luật hợp nhất của BHYT/Dược.

## 1. Kết luận ngắn

- **Đủ để làm gì:** một bộ ôn tập có tuyển chọn cho nhân viên y tế về khám bệnh – chữa bệnh, giấy phép hành nghề, quyền người bệnh, BHYT cơ bản, đơn thuốc, dữ liệu y tế và các luật mới 2025–2026. Có 16 câu tình huống rõ ràng (8 BHYT + 8 xử phạt) và 15 chương lý thuyết, đủ để nhập môn và ôn nhanh.
- **Chưa đủ để làm gì:** chưa đủ làm **bộ tra cứu pháp lý toàn diện**, chưa đủ cho **thi/học chuyên sâu theo điều khoản**, chưa đủ cho **quản lý bệnh viện** (đấu thầu, BHXH, an toàn thực phẩm, chất thải/kiểm soát nhiễm khuẩn) và chưa đủ để tư vấn pháp lý.
- **Con số quyết định:** 42 văn bản/199 câu; **17/42 văn bản có 0 câu trắc nghiệm trực tiếp**; **35/42 văn bản có ≤1 câu trực tiếp**; **5 văn bản không có câu trắc nghiệm nào**; **48/92 câu trực tiếp nằm ở KCB + BHYT**; **12 câu chỉ hỏi “văn bản này quy định lĩnh vực gì”**; **8 câu còn kiểm tra quy định giá đã hết hiệu lực**; **2 nền luật lớn (BHYT, Dược) chỉ có luật sửa đổi, thiếu bản hợp nhất**.
- **Ba khoảng trống tác động lớn nhất:** (1) đấu thầu thuốc/trang thiết bị y tế; (2) Luật Bảo hiểm xã hội 2024 (ốm đau/thai sản); (3) giao dịch điện tử + an ninh mạng, đi kèm việc thay nền BHYT/Dược bằng bản hợp nhất.

## 2. Phương pháp

1. **Inventory từ dữ liệu:** đọc toàn bộ `laws.json`, 5 bộ `quiz*.json`, `tf.json`, `ly_thuyet.json`; thống kê theo `cat`, `t`, `law`, `src`, `verify`.
2. **Đo liên kết trực tiếp:** một câu được coi là “liên kết trực tiếp” khi `t` trùng `id` trong `laws.json`. Với KCB, `t = kcb` gần như 1:1 với Luật KCB; với BHYT/Dược, `t = bhyt`/`duoc` là **mã chủ đề**, nên cột này gồm cả câu về thông tư hướng dẫn, không phải 1:1 với luật gốc. Cách này đo mức độ gắn câu hỏi với mục thư viện, nhưng không đo nội dung được nhắc gián tiếp trong `law`/`q`/`e`.
3. **Đo liên kết gián tiếp:** rà thủ công 44 câu `quiz_his` và các câu `quiz.json` có nhắc số hiệu văn bản; đối chiếu từng văn bản 0 câu trực tiếp để tránh kết luận “không được dạy” quá sớm.
4. **Đối chiếu pháp lý:** chỉ dùng nguồn chính thức để xác nhận sự tồn tại, ngày hiệu lực, phạm vi của văn bản còn thiếu. Các quan hệ “thay thế” không hiển thị rõ trên trang metadata được ghi rõ là suy luận/nguồn thứ cấp hoặc dẫn Điều khoản hiệu lực.
5. **Giới hạn:** ghi chú này không phải cuộc kiểm toán từng đáp án; không kết luận câu nào đúng/sai về pháp lý nếu chưa đối chiếu toàn văn. Nó tập trung vào **độ phủ, độ sâu, tính cập nhật và tính nhất quán cấu trúc**.

## 3. Hiện trạng độ phủ

### 3.1. Số lượng và phân bố

`laws.json` có 42 văn bản, chia theo nhãn `cat` của app:

| Nhãn `cat` | Số văn bản |
|---|---:|
| Dược | 10 |
| Bảo hiểm y tế | 6 |
| Khám chữa bệnh | 6 |
| Khám bệnh, chữa bệnh | 2 |
| Phòng bệnh | 6 |
| Dữ liệu y tế | 3 |
| Trang thiết bị y tế | 2 |
| Phòng chống tác hại | 2 |
| Dân số | 1 |
| An toàn thực phẩm | 1 |
| Phân quyền y tế | 1 |
| Chuyển đổi số | 1 |
| Xử phạt hành chính | 1 |

Nhãn `cat` không thuần nhất: “Khám chữa bệnh” và “Khám bệnh, chữa bệnh” là hai nhãn gần trùng; Luật Hiến, lấy, ghép mô nằm trong nhóm KCB; Thông tư 21/2023, 22/2023 (giá KCB) lại nằm trong nhóm BHYT. Vì vậy bảng dưới đây **tách thủ công** theo nội dung thực tế.

### 3.2. Bảng phủ theo nhóm nội dung

| Nhóm nội dung | Văn bản | Câu trắc nghiệm trực tiếp | Văn bản 0 câu trực tiếp | Đọc nhanh |
|---|---:|---:|---:|---|
| Khám bệnh, chữa bệnh và hành nghề | 7 | 25 | 5 | Mạnh nhất: 24 câu từ Luật KCB 15/2023, 1 câu NĐ 96/2023; 5 văn bản hướng dẫn chỉ có câu gián tiếp |
| Bảo hiểm y tế | 3 | 23 | 1 | Nhóm 23 câu: 13 câu Luật 51/2024 (5 lý thuyết + 8 tình huống), 9 câu giá/thanh toán, 1 câu NĐ 188/2025; TT 12/2026 chưa có câu |
| Dược | 10 | 14 | 4 | Nhóm 14 câu: 3 câu Luật 44/2024, 4 câu TT 26/2025, 2 câu TT 36/2025, 5 câu cho 5 văn bản mới; 4 văn bản 0 câu |
| Phòng bệnh và tiêm chủng | 6 | 6 | 2 | 4 câu HIV nằm trong bộ `quiz_his`; tiêm chủng chỉ 1 câu |
| Dữ liệu y tế | 3 | 4 | 0 | 1–2 câu/văn bản; không có an ninh mạng |
| Xử phạt hành chính | 1 | 12 | 0 | Mới thêm; 8–9 câu xoay quanh KCB, chưa phủ 6 nhóm |
| Trang thiết bị y tế | 2 | 1 | 1 | 1 câu; không có đấu thầu/kiểm soát chất lượng |
| Phòng chống tác hại | 2 | 2 | 0 | 1 câu/luật; không có tình huống |
| An toàn thực phẩm | 1 | 0 | 1 | 0 câu trắc nghiệm, 1 câu đúng/sai |
| Dân số | 1 | 2 | 0 | Hẹp, chủ yếu thai sản và giới tính thai nhi |
| Hiến, ghép mô | 1 | 1 | 0 | 1 câu |
| Phân quyền y tế | 1 | 1 | 0 | 1 câu mô tả |
| Chuyển đổi số | 1 | 1 | 0 | 1 câu mô tả |
| Giá dịch vụ và thanh toán | 3 | 0 | 3 | 0 câu trực tiếp; các câu giá cũ nằm rải ở bộ khác |

Tổng: **42 văn bản, 92 câu trực tiếp, 17 văn bản 0 câu trực tiếp**. Trong 92 câu trực tiếp, KCB (25) + BHYT (23) = **48 câu (52,2%)**; thêm 12 câu NĐ 90 thì ba nhóm lớn nhất chiếm **60/92 (65,2%)**. Đây là phân bố hợp lý cho người mới, nhưng lệch mạnh so với nhu cầu quản lý bệnh viện.

### 3.3. “17 văn bản 0 câu” — đã kiểm lại

Kết quả mapping `t` → `id`:

- **Baseline 41 văn bản:** 17 văn bản có 0 câu trực tiếp; 18 văn bản có đúng 1 câu; **35/41 văn bản có ≤1 câu**.
- **Hiện tại 42 văn bản:** vẫn 17 văn bản 0 câu trực tiếp; 18 văn bản đúng 1 câu; **35/42 văn bản có ≤1 câu**; chỉ 7 văn bản có >1 câu.
- Trong 17 văn bản 0 câu trực tiếp, **12 văn bản có ít nhất 1 câu gián tiếp** trong `quiz_his`/`quiz.json` (ví dụ Thông tư 13/2025 có 3 câu, Thông tư 26/2025 có 4 câu, Luật HIV có 4 câu).
- **5 văn bản không có bất kỳ câu trắc nghiệm nào**: Thông tư 31/2025/TT-BYT, Luật An toàn thực phẩm 55/2010/QH12, Thông tư 52/2017/TT-BYT, Thông tư 15/2026/TT-BYT, Thông tư 12/2026/TT-BTC. Trong đó Luật ATTP chỉ có 1 câu đúng/sai; 4 văn bản còn lại chỉ được nhắc trong lý thuyết.
- **3 văn bản được câu hỏi dẫn nhưng không có mục trong `laws.json`**: Luật Người khuyết tật 51/2010/QH12, Luật Giao dịch điện tử 20/2023/QH15, Luật Dược 105/2016/QH13 (luật gốc, hiện chỉ có luật sửa đổi 44/2024). Đây là lỗi cấu trúc: người học bị hỏi về văn bản không có trong thư viện.

Bảng đầy đủ 17 văn bản ở Phụ lục A.

### 3.4. Độ sâu câu hỏi, lý thuyết và đúng/sai

- **16 câu tình huống rõ ràng**: 8 câu BHYT có nhân vật/tình huống (`quiz_bhyt`) + 8 câu NĐ 90 mới; 4 câu còn lại của NĐ 90 hỏi trực tiếp về mức trần/nguyên tắc tổ chức. Các bộ còn lại chủ yếu hỏi định nghĩa, điều khoản, thời hạn; không có tình huống về quy trình cấp phép/điều kiện hành nghề, đồng thuận của người bệnh, đấu thầu, BHXH, an toàn thực phẩm, giao dịch điện tử. Từ chối cấp cứu chỉ xuất hiện ở góc xử phạt, không phải góc nghĩa vụ chuyên môn.
- **12 câu chỉ hỏi phạm vi văn bản**, ví dụ “Nghị định 96/2023 quy định chi tiết nhóm nội dung nào?”, “Thông tư 13/2026 quy định hoạt động nào?”, “Luật Chuyển đổi số 148/2025 quy định nhóm nội dung nào?”. Đây là câu kiểm tra trí nhớ về văn bản, không kiểm tra năng lực áp dụng.
- **8 câu còn kiểm tra quy định giá đã hết hiệu lực** (6 câu trong `quiz.json` + 2 câu trong `quiz_lythuyet`), dựa trên Thông tư 21/2023 và 22/2023. Audit đã đánh dấu `verify` và ghi “chờ đối chiếu”, nhưng chưa có bộ câu thay thế tương đương về giá hiện hành. Với người học, đây vẫn là nguy cơ học sai nếu chỉ đọc đáp án.
- **15 chương lý thuyết**: c10 nền tảng, c1 đọc văn bản, c2–c3 KCB/quyền người bệnh, c4–c5 BHYT/giá, c6 thuốc, c7 dữ liệu, c8 dân số, c9 Hiến pháp, c11 mốc hiệu lực, c12 khoa phòng, c13 thông tư mới, c14 cập nhật 2025–2026, c15 xử phạt. **Không có chương** cho đấu thầu, BHXH, giao dịch điện tử/an ninh mạng, an toàn thực phẩm, Luật Giá (khung chung), chất thải/kiểm soát nhiễm khuẩn.
- **23 câu đúng/sai** phủ KCB, BHYT, Dược, phòng bệnh, dân số, thuốc lá, rượu bia, ATTP, hiến mô. Không có đúng/sai cho đấu thầu, BHXH, giao dịch điện tử, an ninh mạng, trang thiết bị y tế, dữ liệu y tế.

### 3.5. Vấn đề nhất quán dữ liệu đã kiểm chứng

1. **Mâu thuẫn 40% trong mục BHYT.** `laws.json` mục `bhyt` vẫn còn dòng tóm tắt cũ: “nội trú tuyến chuyên sâu thường hưởng 40%”, trong khi câu hỏi và chương c4 đã sửa thành “nội trú trái tuyến tại cấp chuyên sâu hưởng 100% mức hưởng; ngoại trú trái tuyến 50% mức hưởng” (theo audit mục 7.1). Đây là mâu thuẫn nội bộ, không phải kết luận pháp lý mới.
2. **Nguồn của mục BHYT là nguồn thứ cấp.** `detailSource` ghi `caselaw.vn` và trong points có ghi chú “cần đối chiếu Cổng Chính phủ/Công báo”. Với mục được hỏi nhiều nhất (22 câu trực tiếp), đây là rủi ro nguồn.
3. **Nguồn chi tiết của NĐ 90 chưa chính thức.** Mục mới dùng PDF trên `viendinhduong.vn`, không thuộc nhóm nguồn chính thức; nên thay bằng PDF trên Cổng Chính phủ (đã có link ở mục 4.1) trước khi dùng làm đề thi.
4. **Nhãn `cat` bị trộn** như đã nêu: hai nhãn KCB gần trùng; giá KCB nằm trong BHYT; hiến mô nằm trong KCB. Việc lọc theo chủ đề trên UI sẽ không khớp với bảng phân tích.
5. **Audit ghi hai bộ số.** Mục 1–7 ghi 41/187/14; mục 8 ghi 42/199/15. Nên thống nhất một con số và ghi rõ “sau đợt 3”.

## 4. Khoảng trống pháp lý ưu tiên cao

### 4.1. Đấu thầu thuốc, trang thiết bị y tế — thiếu hoàn toàn

**Vì sao quan trọng:** đấu thầu là công việc thường xuyên của bệnh viện công, ảnh hưởng trực tiếp đến giá thuốc, thiết bị, quyền lựa chọn nhà thầu và tính minh bạch. Đây là mảng mà nhân viên y tế làm mua sắm/kế hoạch/tài chính cần biết, nhưng app hiện có **0 văn bản, 0 câu hỏi**; từ “đấu thầu” chỉ xuất hiện trong `tin_luat.json`, không phải nội dung học.

**Văn bản hiện hành (đã kiểm tra):**

- **Luật Đấu thầu 22/2023/QH15**, ban hành 23/06/2023, hiệu lực 01/01/2024: [Cổng Chính phủ](https://vanban.chinhphu.vn/?pageid=27160&docid=208419). Bản hợp nhất **74/VBHN-VPQH 2026** (đã gồm các lần sửa đổi 2024–2025): [PDF Công báo](https://datafiles.chinhphu.vn/cpp/files/vbpq/2026/3/74-vbhn-vpqh.pdf).
- **Nghị định 214/2025/NĐ-CP**, ban hành 04/08/2025, hiệu lực 04/08/2025, quy định chi tiết Luật Đấu thầu về lựa chọn nhà thầu: [Cổng Chính phủ](https://vanban.chinhphu.vn/?pageid=27160&docid=214821).
- **Nghị định 349/2026/NĐ-CP**, ban hành 09/09/2026, hiệu lực 09/09/2026, sửa đổi NĐ 214/2025 và NĐ 32/2019/NĐ-CP: [bài công bố trên Cổng Chính phủ](https://xaydungchinhsach.chinhphu.vn/nghi-dinh-so-349-2026-nd-cp-sua-doi-quy-dinh-ve-lua-chon-nha-thau-giao-nhiem-vu-dat-hang-dau-thau-119260910215132272.htm).
- **Nghị định 24/2024/NĐ-CP** (ban hành 27/02/2024, hiệu lực 27/02/2024) là bản chi tiết trước đó: [Cổng Chính phủ](https://vanban.chinhphu.vn/?pageid=27160&docid=209823). Các nguồn tra cứu cho biết NĐ 214/2025 thay thế NĐ 24/2024; **không nên thêm NĐ 24/2024 làm văn bản hiện hành** khi đã có NĐ 214/2025. Quan hệ thay thế này cần đối chiếu điều khoản hiệu lực trong bản PDF chính thức.
- **Thông tư chuyên ngành:** Thông tư 40/2025/TT-BYT ngày 25/10/2025 về đấu thầu thuốc tại cơ sở y tế công lập, thay Thông tư 07/2024/TT-BYT. Bộ Y tế có văn bản dẫn chiếu: [PDF Bộ Y tế](https://moh.gov.vn/resource/CustomsCMS/BO_YTE/2026/5/4/4.%20B%C3%A1o%20c%C3%A1o%20t%20ng%20k%20t%20247.pdf). Đây là nguồn dẫn chiếu, chưa phải toàn văn; cần lấy toàn văn trên Cổng Bộ Y tế/vbpl trước khi đưa vào app.

**Khuyến nghị:** thêm một chuyên đề “Đấu thầu thuốc và trang thiết bị y tế” gồm 1 mục lý thuyết (khung pháp lý, nguyên tắc, các hình thức lựa chọn nhà thầu, hồ sơ, tiêu chí, hợp đồng) và 8–12 câu tình huống (gói thầu thuốc, thiết bị, chỉ định thầu, đấu thầu qua mạng, xử lý nhà thầu vi phạm). Không nên chỉ thêm 1 câu hỏi “văn bản này quy định gì”.

### 4.2. Luật Bảo hiểm xã hội 2024 — thiếu chế độ ốm đau/thai sản

**Vì sao quan trọng:** mọi nhân viên y tế là người lao động đều có thể cần chế độ ốm đau, thai sản, tai nạn lao động – bệnh nghề nghiệp. App hiện có 4 câu về số tháng/ngày nghỉ thai sản (chủ yếu gắn với Luật Dân số 113/2025), nhưng **0 câu về điều kiện đóng, mức hưởng, thời gian nghỉ ốm đau, chế độ dưỡng sức** theo Luật BHXH.

**Văn bản hiện hành (đã kiểm tra):**

- **Luật Bảo hiểm xã hội 41/2024/QH15**, ban hành 29/06/2024, hiệu lực 01/07/2025: [Cổng Chính phủ](https://vanban.chinhphu.vn/?pageid=27160&docid=211199).
- Toàn văn trên Cổng Chính phủ có **Chương V** về BHXH bắt buộc, **Mục 1 – Chế độ ốm đau (từ Điều 42)** và **Mục 2 – Chế độ thai sản (từ Điều 50)**: [Toàn văn](https://xaydungchinhsach.chinhphu.vn/toan-van-luat-so-41-2024-qh15-bao-hiem-xa-hoi-119240723163650489.htm).

**Khuyến nghị:** thêm 6–10 câu tình huống: nghỉ ốm đau khi có giấy chứng nhận; mức hưởng và thời hạn ốm đau tối đa theo thời gian đóng; thời gian nghỉ thai sản; trợ cấp một lần khi sinh; chế độ dưỡng sức sau sinh/ốm. Các mức cụ thể lấy theo Chương V Luật BHXH 41/2024. Liên kết các câu thai sản hiện có với Luật BHXH để tránh hiểu nhầm rằng Luật Dân số là nguồn duy nhất.

### 4.3. Giao dịch điện tử và an ninh mạng — thiếu khung pháp lý cho hồ sơ số

**Vì sao quan trọng:** bệnh án điện tử, đơn thuốc điện tử, chữ ký số, lưu trữ và chia sẻ dữ liệu sức khỏe đều dựa trên Luật Giao dịch điện tử; an toàn hệ thống HIS cần khung an ninh mạng. App hiện có **1 câu `quiz_his` gán trực tiếp `law = Luật Giao dịch điện tử 20/2023`** và **1 câu khác dẫn luật này trong giải thích** (chữ ký số trong bệnh án điện tử) nhưng **không có mục trong `laws.json`**, và **0 câu về an ninh mạng**.

**Văn bản hiện hành (đã kiểm tra):**

- **Luật Giao dịch điện tử 20/2023/QH15**, ban hành 22/06/2023, hiệu lực 01/07/2024: [Cổng Chính phủ](https://vanban.chinhphu.vn/?pageid=27160&docid=208421). Bản hợp nhất **36/VBHN-VPQH 2026**: [PDF Công báo](https://datafiles.chinhphu.vn/cpp/files/vbpq/2026/3/36-vbhn-vpqh.pdf).
- **Luật An ninh mạng 116/2025/QH15**, ban hành 10/12/2025, hiệu lực 01/07/2026: [Cổng Chính phủ](https://vanban.chinhphu.vn/?classid=1&docid=216499&orggroupid=1&pageid=27160).

**Khuyến nghị:** thêm 1 chương lý thuyết ngắn “Hồ sơ y tế số” và 6–8 câu tình huống: giá trị pháp lý của chữ ký số, thời điểm ký, lưu trữ bệnh án điện tử, chia sẻ dữ liệu với cơ quan BHXH, trách nhiệm khi lộ dữ liệu, phân quyền truy cập HIS. Liên kết với Thông tư 13/2025/TT-BYT (bệnh án điện tử) đã có trong app.

### 4.4. Luật Giá 2023 và Nghị định 85/2024 — đã kiểm tra, ưu tiên trung bình

**Vì sao không xếp top 5:** Luật Giá là khung chung về giá, kê khai giá, bình ổn giá, thẩm định giá; nhưng **Điều 4 khoản 4 điểm d Luật Giá 16/2023/QH15** dẫn chiếu: “Giá dịch vụ khám bệnh, chữa bệnh được thực hiện theo quy định của pháp luật về khám bệnh, chữa bệnh”. Vì vậy, với bác sĩ, Luật Giá không phải nguồn trực tiếp quyết định giá dịch vụ KCB; nó quan trọng hơn với người làm tài chính, kế hoạch, đấu thầu, kê khai giá.

**Văn bản hiện hành (đã kiểm tra):**

- **Luật Giá 16/2023/QH15**, ban hành 19/06/2023, hiệu lực 01/07/2024: [Cổng Chính phủ](https://vanban.chinhphu.vn/?pageid=27160&docid=208367). Toàn văn PDF (Điều 4 khoản 4 điểm d): [PDF Công báo](https://datafiles.chinhphu.vn/cpp/files/vbpq/2023/7/luat16_2023.pdf).
- **Nghị định 85/2024/NĐ-CP**, ban hành 10/07/2024, hiệu lực 10/07/2024: [Cổng Chính phủ](https://vanban.chinhphu.vn/?pageid=27160&docid=210648).
- **Nghị định 128/2026/NĐ-CP**, ban hành 06/04/2026, hiệu lực 06/04/2026, sửa đổi NĐ 85/2024: [Cổng Chính phủ](https://chinhphu.vn/?pageid=27160&docid=217625).

**Khuyến nghị:** nếu app muốn phục vụ cả quản lý bệnh viện, thêm 1 mục “Khung pháp lý về giá” 3–4 câu, đặt cạnh chương c5; nhưng không dùng nó để thay thế các câu về giá dịch vụ KCB hiện hành.

### 4.5. An toàn thực phẩm — có luật nhưng gần như không được dạy

Đây không phải văn bản thiếu, mà là **khoảng trống độ sâu nghiêm trọng**:

- **Luật An toàn thực phẩm 55/2010/QH12**, ban hành 17/06/2010, hiệu lực 01/07/2011: [Cổng Chính phủ](https://vanban.chinhphu.vn/default.aspx?pageid=27160&docid=96032).
- Trong app: 1 văn bản, 3 điểm tóm tắt, **0 câu trắc nghiệm**, chỉ 1 câu đúng/sai về ngày hiệu lực. Không có câu về điều kiện cơ sở, công bố hợp quy, ghi nhãn, ngộ độc thực phẩm, trách nhiệm của bếp ăn bệnh viện/nhà thuốc.
- Với nhân viên y tế, đây là mảng sát công việc (dinh dưỡng, kiểm soát nhiễm khuẩn, nhà thuốc, cơ sở sản xuất thực phẩm bảo vệ sức khỏe). Nên thêm 8–10 câu tình huống, không chỉ 1 câu mô tả luật.

### 4.6. Các mảng khác đã kiểm tra nhưng chưa đưa vào top 5

- **Kiểm soát nhiễm khuẩn và chất thải y tế:** Thông tư 16/2018/TT-BYT (ban hành 20/07/2018, hiệu lực 01/10/2018): [Công báo](https://congbao.chinhphu.vn/van-ban/thong-tu-so-16-2018-tt-byt-27152.htm); Thông tư 20/2021/TT-BYT (ban hành 26/11/2021, hiệu lực 10/01/2022): [Cổng Chính phủ](https://vanban.chinhphu.vn/?pageid=27160&docid=204797). Cả hai đều không có trong app. **Chưa xác minh được hiệu lực hiện hành 2026** (có thông tin đang lấy ý kiến thay thế Thông tư 16/2018), nên chỉ nêu để kiểm tra, không xếp top 5.
- **Luật Người khuyết tật 51/2010/QH12** (ban hành 17/06/2010, hiệu lực 01/01/2011): [Công báo](https://congbao.chinhphu.vn/van-ban/luat-so-51-2010-qh12-3086.htm). App có 2 câu `quiz_his` nhưng không có mục trong `laws.json`. Đây là lỗi cấu trúc; nên thêm mục hoặc bỏ 2 câu.
- **Khung xử lý vi phạm hành chính:** Luật Xử lý vi phạm hành chính 15/2012/QH13: [Cổng Chính phủ](https://vanban.chinhphu.vn/?pageid=27160&docid=163070); Luật 88/2025/QH15 sửa đổi: [Toàn văn](https://xaydungchinhsach.chinhphu.vn/toan-van-luat-sua-doi-bo-sung-mot-so-dieu-cua-luat-xu-ly-vi-pham-hanh-chinh-119250629101104322.htm). NĐ 90 mới dạy mức phạt nhưng chưa dạy trình tự, thẩm quyền, thời hiệu; nếu muốn đào sâu chuyên đề xử phạt, cần thêm khung này.

## 5. Khoảng trống độ sâu

### 5.1. Nền luật BHYT và Dược: chỉ có luật sửa đổi, thiếu bản hợp nhất

Đây là khoảng trống độ sâu có tác động lớn nhất vì nó nằm ngay trong hai mảng có nhiều câu hỏi nhất.

- **BHYT:** `laws.json` mục `bhyt` là **Luật sửa đổi, bổ sung một số điều của Luật BHYT 51/2024/QH15**, hiệu lực 01/07/2025; luật gốc **25/2008/QH12** không có trong thư viện. Văn bản hợp nhất chính thức **40/VBHN-VPQH ngày 16/03/2026** đã có: [Công báo](https://congbao.chinhphu.vn/van-ban/van-ban-hop-nhat-so-40-vbhn-vpqh-469125.htm). App có 22 câu trực tiếp từ mục này, nhưng người học không thấy được cấu trúc hợp nhất; thêm vào đó, điểm tóm tắt còn dòng 40% cũ và `detailSource` là `caselaw.vn`.
- **Dược:** `laws.json` mục `duoc` là **Luật sửa đổi, bổ sung một số điều của Luật Dược 44/2024/QH15**, hiệu lực 01/07/2025; luật gốc **105/2016/QH13** không có trong thư viện. Văn bản hợp nhất chính thức **76/VBHN-VPQH 2026** đã có: [PDF Công báo](https://datafiles.chinhphu.vn/cpp/files/vbpq/2026/3/76-vbhn-vpqh.pdf). App có 9 câu trực tiếp từ mục này; cả nhóm Dược có 14 câu, nhưng 5 câu còn lại thuộc các thông tư mới.
- Hệ quả sư phạm: người học thấy “Luật Dược sửa đổi 2024” và “Luật BHYT sửa đổi 2024” nhưng không thấy luật gốc/điều khoản nền; các câu hỏi về điều kiện, phạm vi, nguyên tắc có thể không có chỗ bám trong thư viện.

**Khuyến nghị:** thay hoặc bổ sung mục `bhyt`/`duoc` bằng bản hợp nhất 40/VBHN-VPQH 2026 và 76/VBHN-VPQH 2026; giữ mục luật sửa đổi như “lịch sử” nếu cần. Đồng thời sửa dòng 40% trong `laws.json` và thay `detailSource` bằng Cổng Chính phủ/Công báo.

### 5.2. 17 văn bản 0 câu trực tiếp, 5 văn bản 0 câu trắc nghiệm

Bảng ở Phụ lục A cho thấy nhiều văn bản mới 2025–2026 chỉ có 1 câu “quy định lĩnh vực nào”. Đáng chú ý:

- Thông tư 31/2025/TT-BYT (hướng dẫn Luật Dược/NĐ 163/2025) **không có câu nào**, dù đây là văn bản hướng dẫn trực tiếp.
- Thông tư 52/2017/TT-BYT về đơn thuốc **không có câu nào**, dù chương c6 dạy đơn thuốc.
- Thông tư 15/2026/TT-BYT và Thông tư 12/2026/TT-BTC **không có câu nào**, chỉ được nhắc trong chương c14.
- Luật ATTP **không có câu trắc nghiệm nào**, chỉ 1 câu đúng/sai.

### 5.3. 12 câu chỉ kiểm tra phạm vi văn bản

Các câu này không sai, nhưng không đo được năng lực áp dụng. Ví dụ: “Nghị định 163/2025 hướng dẫn Luật Dược, tập trung vào nhóm nội dung nào?”, “Thông tư 18/2026 quản lý nhóm thuốc nào?”, “Nghị định 148/2025 phân quyền, phân cấp trong lĩnh vực nào?”. Nếu mục tiêu là ôn thi/đào tạo nhân viên, cần thay bằng câu hỏi tình huống hoặc câu hỏi về nghĩa vụ cụ thể.

### 5.4. 8 câu giá đã hết hiệu lực

6 câu trong `quiz.json` + 2 câu trong `quiz_lythuyet` vẫn dùng Thông tư 21/2023/22/2023 (hết hiệu lực từ 01/01/2025). Audit đã gắn `verify` và cảnh báo, nhưng người học vẫn có thể ghi nhớ mức 70%/30% cũ. Cần thay bằng câu hỏi theo Thông tư 21/2024/TT-BYT và nghị quyết giá của địa phương, hoặc chuyển hẳn sang mục “lịch sử” tách khỏi đề thi.

### 5.5. Tình huống chỉ tập trung ở BHYT và xử phạt

16 câu tình huống là điểm mạnh mới, nhưng chưa có tình huống cho:

- quy trình/điều kiện cấp giấy phép hành nghề, giấy phép hoạt động (NĐ 96/2023);
- nghĩa vụ cấp cứu, đồng thuận của người bệnh, người đại diện, bí mật thông tin (NĐ 90 chỉ có tình huống phạt, chưa có tình huống nghĩa vụ chuyên môn);
- kê đơn/bán thuốc kê đơn, thuốc kiểm soát đặc biệt;
- đấu thầu, BHXH, an toàn thực phẩm, giao dịch điện tử, chất thải/kiểm soát nhiễm khuẩn.

### 5.6. Lý thuyết chưa theo kịp danh mục

15 chương là khá tốt cho một app học, nhưng không có chương cho các mảng đã nêu. Chương c12 có bước “khoa dinh dưỡng và kiểm soát nhiễm khuẩn” nhưng chỉ nói cơ cấu khoa theo NĐ 96/2023, không nói nghĩa vụ kiểm soát nhiễm khuẩn/chất thải. Chương c5 nói giá dịch vụ KCB nhưng không đặt trong khung Luật Giá.

### 5.7. Chất lượng nguồn và tính nhất quán

- Mục BHYT dùng `caselaw.vn`; mục NĐ 90 dùng PDF `viendinhduong.vn`; cả hai không phải nguồn chính thức.
- `laws.json` còn dòng 40% cũ trong mục BHYT, mâu thuẫn với câu hỏi/lý thuyết đã sửa.
- 3 văn bản được câu hỏi dẫn nhưng không có mục trong `laws.json` (Người khuyết tật, Giao dịch điện tử, Luật Dược 105/2016).
- Audit mục 1–7 và mục 8 ghi hai bộ số khác nhau (41/187/14 và 42/199/15).

## 6. Verdict: đủ để làm gì, chưa đủ để làm gì

| Câu hỏi | Trả lời |
|---|---|
| **Đủ cho một health worker cần ôn nhanh?** | **Đủ một phần.** Bao quát KCB, giấy phép, quyền người bệnh, BHYT cơ bản, đơn thuốc, dữ liệu y tế, luật mới 2025–2026; có 16 câu tình huống. |
| **Đủ cho mục đích thi/hiểu toàn diện?** | **Chưa.** 42 văn bản/199 câu là bộ tuyển chọn, không phải pháp điển; 17/42 văn bản 0 câu trực tiếp, 12 câu chỉ hỏi phạm vi, 8 câu giá cũ, thiếu đấu thầu/BHXH/GDĐT/ATTP. |
| **Đủ cho quản lý bệnh viện?** | **Chưa.** Thiếu đấu thầu, BHXH, kiểm soát nhiễm khuẩn/chất thải, an toàn thực phẩm, khung giá; các mảng này đều là công việc vận hành. |
| **Đủ để tư vấn pháp lý?** | **Không.** Đây là tài liệu học, không phải ý kiến pháp lý; nhiều mục chỉ có 3–5 điểm tóm tắt và chưa đối chiếu toàn văn. |

**Kết luận thẳng:** với 42 văn bản và 199 câu, app là **bộ học nhập môn có tuyển chọn**, không phải **bộ tra cứu pháp lý toàn diện**. Ngay cả một mảng hẹp như đấu thầu thuốc đã cần 4–5 văn bản hiện hành (Luật, nghị định, nghị định sửa đổi, thông tư chuyên ngành); không thể kỳ vọng 42 văn bản phủ hết các lĩnh vực y tế.

## 7. Năm việc ưu tiên

| # | Việc | Vì sao | Nghiệm thu |
|---|---|---|---|
| 1 | **Thêm chuyên đề đấu thầu thuốc/trang thiết bị** | Khoảng trống lớn nhất cho bệnh viện; 0 văn bản, 0 câu | Có 1 mục lý thuyết + 8–12 câu tình huống; dẫn Luật Đấu thầu (bản hợp nhất), NĐ 214/2025, NĐ 349/2026, TT 40/2025; không dùng NĐ 24/2024 làm hiện hành |
| 2 | **Thêm Luật BHXH 41/2024 (ốm đau/thai sản)** | Mọi nhân viên y tế là người lao động; app mới có số tháng thai sản, chưa có điều kiện/mức hưởng | Có 6–10 câu tình huống; liên kết với 4 câu thai sản hiện có; nêu rõ Luật BHXH là nguồn chế độ |
| 3 | **Thay nền BHYT/Dược bằng bản hợp nhất** | 22 câu BHYT + 9 câu Dược trực tiếp đang dựa trên luật sửa đổi; thiếu luật gốc; còn dòng 40% cũ | Thêm 40/VBHN-VPQH 2026 và 76/VBHN-VPQH 2026; sửa dòng 40%; thay `caselaw.vn` bằng Cổng Chính phủ/Công báo; rà lại 31 câu |
| 4 | **Thêm giao dịch điện tử + an ninh mạng** | Hồ sơ bệnh án điện tử, chữ ký số, HIS; app có 2 câu dẫn Luật GDĐT nhưng không có mục | Thêm 1 chương ngắn + 6–8 câu; liên kết TT 13/2025/TT-BYT; nêu rõ giá trị chữ ký số, lưu trữ, chia sẻ dữ liệu |
| 5 | **Sửa độ sâu: ATTP + 5 văn bản 0 câu + 12 câu mô tả** | ATTP 0 câu trắc nghiệm; 5 văn bản không có câu; 12 câu chỉ hỏi phạm vi | ATTP có 8–10 câu; 5 văn bản có ít nhất 1 câu nội dung; 12 câu mô tả được thay bằng câu tình huống/áp dụng |

Nếu chỉ làm được một việc: **đấu thầu**. Nếu làm hai: **đấu thầu + BHXH**. Nếu làm ba: **thêm việc sửa nền BHYT/Dược**, vì đây là hai mảng có nhiều câu hỏi nhất và đang thiếu luật gốc.

## 8. Giới hạn của ghi chú

- Đây là nghiên cứu độ phủ/độ sâu, **không phải kiểm toán toàn bộ 199 câu**. Không kết luận câu nào đúng/sai về pháp lý nếu chưa đối chiếu toàn văn; các mâu thuẫn nêu ở mục 3.5 là mâu thuẫn dữ liệu đã đọc được, không phải kết luận pháp lý mới.
- Trạng thái văn bản chỉ đúng đến **29/10/2026**. Các quan hệ thay thế không hiển thị rõ trên trang metadata được ghi chú là cần đối chiếu điều khoản hiệu lực; một số PDF chính thức là bản scan nên không trích được toàn văn bằng công cụ.
- Thông tư 16/2018/TT-BYT và Thông tư 20/2021/TT-BYT được nêu ở mức “cần kiểm tra”, chưa xác minh hiệu lực hiện hành; không xếp top 5.
- Số liệu có thể thay đổi nếu dữ liệu được cập nhật tiếp. Ghi chú không sửa laws/quiz/theory và không commit.

## Phụ lục A — 17 văn bản 0 câu trắc nghiệm trực tiếp

“Trực tiếp” = `t` trùng `id` trong `laws.json`. “Gián tiếp” = câu hỏi khác có nhắc văn bản trong `q`/`law`/`e`/`src`. Bảng tính theo trạng thái 42 văn bản; baseline 41 văn bản cũng có đúng 17 văn bản 0 câu trực tiếp (NĐ 90 mới thêm có 12 câu, không làm thay đổi danh sách này).

| # | Văn bản | Nhóm | Trực tiếp | Gián tiếp | Lý thuyết | Ghi chú |
|---|---|---|---:|---:|---|---|
| 1 | 36/2025/TT-BYT | Dược | 0 | 2 | c11, c13 | 2 câu hỏi trong `quiz.json` |
| 2 | 25/2026/TT-BYT | KCB | 0 | 1 | c11, c13 | 1 câu về việc thay điều của TT 32/2023 |
| 3 | 26/2025/TT-BYT | Dược | 0 | 4 | c6, c11 | 4 câu về đơn thuốc |
| 4 | 22/2024/TT-BYT | BHYT/giá | 0 | 2 | c5, c11 | 2 câu thanh toán thuốc/thiết bị |
| 5 | 21/2024/TT-BYT | KCB/giá | 0 | 1 | c5, c11 | 1 câu về thẩm quyền giá |
| 6 | 22/2023/TT-BYT | BHYT/giá | 0 | 2 | c5, c11 | 2 câu lịch sử, đã hết hiệu lực |
| 7 | 21/2023/TT-BYT | BHYT/giá | 0 | 4 | c5, c11 | 4 câu lịch sử, đã hết hiệu lực |
| 8 | 49/2025/TT-BYT | KCB | 0 | 2 | c11, c13 | 2 câu về lương y |
| 9 | 44/2025/TT-BYT | TTB | 0 | 1 | c11, c13 | 1 câu về phân cấp TTB |
| 10 | 31/2025/TT-BYT | Dược | 0 | 0 | c14 | Không có câu nào |
| 11 | 55/2010/QH12 | ATTP | 0 | 0 | c11 | 0 câu trắc nghiệm; 1 câu đúng/sai |
| 12 | 64/2006/QH11 | Phòng bệnh/HIV | 0 | 4 | c7 | 4 câu trong `quiz_his` |
| 13 | 52/2017/TT-BYT | Dược | 0 | 0 | c11 | Không có câu nào |
| 14 | 32/2023/TT-BYT | KCB | 0 | 1 | c13 | 1 câu qua TT 25/2026 |
| 15 | 13/2025/TT-BYT | KCB | 0 | 3 | c13 | 3 câu trong `quiz_his` |
| 16 | 15/2026/TT-BYT | Phòng bệnh | 0 | 0 | c14 | Không có câu nào |
| 17 | 12/2026/TT-BTC | BHYT | 0 | 0 | c14 | Không có câu nào |

## Phụ lục B — Nguồn chính thức đã dùng

**Xử phạt hành chính:**

- Nghị định 90/2026/NĐ-CP: [Cổng Chính phủ](https://chinhphu.vn/?pageid=27160&docid=217386); [PDF toàn văn](https://datafiles.chinhphu.vn/cpp/files/vbpq/2026/4/90-ndcp.signed.pdf); [Công báo](https://congbao.chinhphu.vn/van-ban/nghi-dinh-so-90-2026-nd-cp-469243.htm).
- Nghị định 117/2020/NĐ-CP (bản cũ): [Cổng Chính phủ](https://vanban.chinhphu.vn/?pageid=27160&docid=201105).
- Luật Xử lý vi phạm hành chính 15/2012/QH13: [Cổng Chính phủ](https://vanban.chinhphu.vn/?pageid=27160&docid=163070).
- Luật 88/2025/QH15 sửa đổi Luật XLVPHC: [Toàn văn](https://xaydungchinhsach.chinhphu.vn/toan-van-luat-sua-doi-bo-sung-mot-so-dieu-cua-luat-xu-ly-vi-pham-hanh-chinh-119250629101104322.htm).

**Đấu thầu:**

- Luật Đấu thầu 22/2023/QH15: [Cổng Chính phủ](https://vanban.chinhphu.vn/?pageid=27160&docid=208419); [hợp nhất 74/VBHN-VPQH 2026](https://datafiles.chinhphu.vn/cpp/files/vbpq/2026/3/74-vbhn-vpqh.pdf).
- Nghị định 214/2025/NĐ-CP: [Cổng Chính phủ](https://vanban.chinhphu.vn/?pageid=27160&docid=214821); [PDF](https://datafiles.chinhphu.vn/cpp/files/vbpq/2025/8/214nd.signed.pdf).
- Nghị định 349/2026/NĐ-CP: [bài công bố](https://xaydungchinhsach.chinhphu.vn/nghi-dinh-so-349-2026-nd-cp-sua-doi-quy-dinh-ve-lua-chon-nha-thau-giao-nhiem-vu-dat-hang-dau-thau-119260910215132272.htm).
- Nghị định 24/2024/NĐ-CP (bản cũ): [Cổng Chính phủ](https://vanban.chinhphu.vn/?pageid=27160&docid=209823).
- Thông tư 07/2024/TT-BYT (bản cũ): [Cổng Chính phủ](https://chinhphu.vn/?pageid=27160&docid=210303).
- Thông tư 40/2025/TT-BYT (dẫn chiếu): [PDF Bộ Y tế](https://moh.gov.vn/resource/CustomsCMS/BO_YTE/2026/5/4/4.%20B%C3%A1o%20c%C3%A1o%20t%20ng%20k%20t%20247.pdf).

**Bảo hiểm xã hội:**

- Luật BHXH 41/2024/QH15: [Cổng Chính phủ](https://vanban.chinhphu.vn/?pageid=27160&docid=211199); [toàn văn](https://xaydungchinhsach.chinhphu.vn/toan-van-luat-so-41-2024-qh15-bao-hiem-xa-hoi-119240723163650489.htm).

**Giao dịch điện tử và an ninh mạng:**

- Luật Giao dịch điện tử 20/2023/QH15: [Cổng Chính phủ](https://vanban.chinhphu.vn/?pageid=27160&docid=208421); [hợp nhất 36/VBHN-VPQH 2026](https://datafiles.chinhphu.vn/cpp/files/vbpq/2026/3/36-vbhn-vpqh.pdf).
- Luật An ninh mạng 116/2025/QH15: [Cổng Chính phủ](https://vanban.chinhphu.vn/?classid=1&docid=216499&orggroupid=1&pageid=27160).

**Giá:**

- Luật Giá 16/2023/QH15: [Cổng Chính phủ](https://vanban.chinhphu.vn/?pageid=27160&docid=208367); [PDF toàn văn](https://datafiles.chinhphu.vn/cpp/files/vbpq/2023/7/luat16_2023.pdf).
- Nghị định 85/2024/NĐ-CP: [Cổng Chính phủ](https://vanban.chinhphu.vn/?pageid=27160&docid=210648).
- Nghị định 128/2026/NĐ-CP: [Cổng Chính phủ](https://chinhphu.vn/?pageid=27160&docid=217625).

**BHYT và Dược (bản hợp nhất):**

- Văn bản hợp nhất 40/VBHN-VPQH 2026 (BHYT): [Công báo](https://congbao.chinhphu.vn/van-ban/van-ban-hop-nhat-so-40-vbhn-vpqh-469125.htm).
- Luật BHYT 25/2008/QH12 (luật gốc): [Cổng Chính phủ](https://chinhphu.vn/default.aspx?pageid=27160&docid=81142).
- Văn bản hợp nhất 76/VBHN-VPQH 2026 (Dược): [PDF Công báo](https://datafiles.chinhphu.vn/cpp/files/vbpq/2026/3/76-vbhn-vpqh.pdf).
- Luật Dược 105/2016/QH13 (luật gốc): [Cổng Chính phủ](https://vanban.chinhphu.vn/?pageid=27160&docid=184569).
- Luật sửa đổi BHYT 51/2024/QH15: [Cổng Chính phủ](https://vanban.chinhphu.vn/?pageid=27160&docid=212479&classid=1&orggroupid=1); [toàn văn](https://xaydungchinhsach.chinhphu.vn/toan-van-luat-sua-doi-bo-sung-mot-so-dieu-cua-luat-bao-hiem-y-te-11924122017211787.htm).
- Luật sửa đổi Dược 44/2024/QH15: [Cổng Chính phủ](https://chinhphu.vn/?pageid=27160&docid=212466).

**An toàn thực phẩm, người khuyết tật, kiểm soát nhiễm khuẩn/chất thải:**

- Luật An toàn thực phẩm 55/2010/QH12: [Cổng Chính phủ](https://vanban.chinhphu.vn/default.aspx?pageid=27160&docid=96032).
- Luật Người khuyết tật 51/2010/QH12: [Công báo](https://congbao.chinhphu.vn/van-ban/luat-so-51-2010-qh12-3086.htm).
- Thông tư 16/2018/TT-BYT: [Công báo](https://congbao.chinhphu.vn/van-ban/thong-tu-so-16-2018-tt-byt-27152.htm).
- Thông tư 20/2021/TT-BYT: [Cổng Chính phủ](https://vanban.chinhphu.vn/?pageid=27160&docid=204797).

**Lưu ý về nguồn:** một số trang metadata chỉ xác nhận số hiệu/ngày ban hành/ngày hiệu lực, không hiển thị đầy đủ điều khoản. Các nhận định về quan hệ thay thế (NĐ 90 thay NĐ 117; NĐ 214 thay NĐ 24; TT 40 thay TT 07) cần đối chiếu thêm điều khoản hiệu lực trong bản PDF chính thức trước khi dùng làm căn cứ pháp lý.
