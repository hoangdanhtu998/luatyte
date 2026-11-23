# Chỉ số kiểm thử và báo cáo không gây hiểu sai

Một báo cáo có con số "pass rate 95%" nghe rất yên tâm. Nhưng con số đó có thể che mất một lỗi nghiêm trọng, hoặc che mất việc phần lớn ca chưa được chạy. Báo cáo tốt không đẹp, mà trung thực: cho người đọc đủ thông tin để quyết định.

Bài này dạy cách định nghĩa chỉ số, cách ghi trạng thái, và cách đưa ra khuyến nghị phát hành mà không vượt quá bằng chứng.

## Sau bài này bạn làm được gì

- Định nghĩa rõ mẫu số khi tính tỷ lệ đạt.
- Ghi trạng thái đúng: Pass, Fail, Blocked, Not Run, Not Applicable, Inconclusive.
- Giải thích vì sao độ phủ (coverage) không chứng minh sản phẩm không còn lỗi.
- Chọn khuyến nghị phát hành phù hợp với bằng chứng.

## Tỷ lệ đạt: định nghĩa mẫu số

Ví dụ 50 ca: 40 Pass, 5 Fail, 5 Blocked.

Nếu tính Pass / tổng số ca = 40 / 50 = 80%. Con số này bị kéo xuống bởi ca Blocked, và không cho biết 5 ca Blocked là gì.

Nếu tính Pass / (Pass + Fail) = 40 / 45 ≈ 88,9%. Con số này loại Blocked khỏi mẫu số, nhưng vẫn phải ghi rõ 5 ca Blocked ở ngay cạnh.

Quy tắc: luôn ghi công thức cùng con số. Đừng đưa một tỷ lệ mà người đọc phải đoán mẫu số.

## Trạng thái nào dùng khi nào

- **Pass:** kết quả thực tế khớp kết quả mong đợi, có bằng chứng.
- **Fail:** kết quả thực tế khác mong đợi, đã kiểm lại được.
- **Blocked:** không thể chạy vì điều kiện bên ngoài (môi trường hỏng, thiếu tài khoản). Ghi lý do.
- **Not Run:** chưa chạy.
- **Not Applicable:** không áp dụng cho sản phẩm này, có lý do.
- **Inconclusive:** đã chạy nhưng chưa đủ bằng chứng để kết luận.

Đừng gộp Blocked vào Pass chỉ vì "không thấy lỗi". Không chạy được không phải là đạt.

## Coverage không chứng minh gì

"Độ phủ yêu cầu 95%" nghĩa là 95% yêu cầu có ít nhất một ca. Nó không nói ca đó có đúng không, và không nói gì về các lỗi chưa biết.

Tương tự, "95% dòng code được chạy" không có nghĩa là 95% hành vi đúng. Dùng coverage để tìm chỗ chưa kiểm, không để tuyên bố chất lượng.

## Khuyến nghị phát hành

Một báo cáo nên kết thúc bằng một trong bốn trạng thái:

- **Ready for Release:** đã kiểm đủ phạm vi, không còn lỗi Critical hoặc High, bằng chứng đầy đủ.
- **Ready with Known Issues:** có lỗi đã biết, mức độ chấp nhận được, đã nêu rõ.
- **Not Ready for Release:** còn lỗi Critical, hoặc phần quan trọng chưa được kiểm.
- **Inconclusive – More Testing Required:** chưa đủ bằng chứng để kết luận.

Ví dụ: đã kiểm được 60% yêu cầu, không có lỗi Critical nào. Khuyến nghị đúng là Inconclusive, vì 40% chưa được kiểm, không phải "sẵn sàng" chỉ vì không thấy lỗi lớn.

## Ngôn ngữ báo cáo trung thực

- Viết "đã kiểm X ca, đạt Y, lỗi Z", không viết "sản phẩm ổn định".
- Nêu rõ phần chưa kiểm và lý do.
- Phân biệt "đã chạy" với "đã đọc code" hoặc "đã phân tích tĩnh".
- Đừng dùng từ "hoàn toàn" hay "không còn lỗi" khi chưa có bằng chứng.

## Tóm lại

- Ghi rõ mẫu số. Một tỷ lệ không kèm công thức là tỷ lệ dễ hiểu sai.
- Blocked và Not Run không phải là Pass.
- Coverage là công cụ tìm khoảng trống, không phải chứng nhận chất lượng.
- Chọn khuyến nghị theo bằng chứng, và nêu phần chưa kiểm.

Tham khảo: Rex Black (*Managing the Testing Process*) về báo cáo kiểm thử; Cem Kaner về đo lường trong kiểm thử. Kiểm tra lại nguồn trước khi trích dẫn.
