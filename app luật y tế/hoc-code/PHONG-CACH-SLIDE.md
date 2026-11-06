# Chuẩn trình bày slide · Học code

Tài liệu này rút ra từ file `Con trỏ và bộ nhớ.pptx` (17 slide) mà anh đã làm. Khi làm slide mới, làm theo đúng các mục dưới đây để các bài đồng nhất.

---

## 1. Khổ và lưới

- **Khổ:** 16:9, 12192000 × 6858000 EMU (13.33 × 7.5 inch).
- **Lề trái/phải:** 812712 EMU (~0.89 inch). Vùng nội dung rộng **10883574 EMU**.
- **Tiêu đề bắt đầu ở y = 812712** (phía trên cùng vùng nội dung).
- **Chân trang** luôn ở **y = 6238435**, cao 238610, cỡ 12, màu xám.
- **Lưới 2 cột:** cột trái x = 812712, cột phải x ≈ 6.5 triệu EMU. Khoảng cách giữa hai cột ~0.45 triệu EMU.
- **Lưới 3 cột:** mỗi cột ~3.39 triệu EMU, bắt đầu x = 812712, 4402556, 7992511.

---

## 2. Font

| Vai trò | Font | Ghi chú |
|---|---|---|
| Tiêu đề, nội dung, nhãn, chân trang | **Be Vietnam Pro** | Font theme (major và minor đều là Be Vietnam Pro). Hỗ trợ đủ dấu tiếng Việt. |
| Code, lệnh, ký hiệu kỹ thuật | **JetBrains Mono** | Chỉ dùng cho code, không dùng cho chữ thường. |

### Cỡ chữ (đơn vị: pt, trong file là sz = cỡ × 100)

| Vai trò | Cỡ | Đậm | Ví dụ |
|---|---|---|---|
| Tiêu đề bìa | **60** | Đậm | "Con trỏ và bộ nhớ" |
| Tiêu đề slide nội dung | **36** | Đậm | "Biến có địa chỉ" |
| Tiêu đề lớn (slide chỉ một câu) | 44 | Đậm | "Cấp phát mà quên free." |
| Kicker (nhãn nhỏ trên tiêu đề) | 16 | Đậm, màu cam | "LỖI 3 · RÒ RỈ BỘ NHỚ" |
| Phụ đề bìa | 20 | Thường | "Hiểu máy làm gì khi viết int *p" |
| Đoạn code lớn | 24 | Thường (JetBrains Mono) | `int x = 42;` |
| Tiêu đề thẻ/bước | 20 hoặc 18 | Đậm | "1 · Tìm chỗ trống" |
| Mô tả trong thẻ | 16 | Thường | "Máy chọn một ô nhớ chưa ai dùng" |
| Ý phụ, câu kết | 20 | Thường | "Đường thẳng, không nhảy cóc." |
| Chân trang | 12 | Thường | "Con trỏ và bộ nhớ · 04" |

Quy tắc: không dùng cỡ lẻ (13, 15, 17). Các cỡ chuẩn là 12, 14, 16, 18, 20, 22, 24, 28, 32, 36, 44, 60.

---

## 3. Màu

Có hai nền chính: **nền kem** cho slide nội dung và **nền tối** cho slide nhấn mạnh.

| Vai trò | Mã | Dùng cho |
|---|---|---|
| Nền kem | `F5F2EA` | Nền slide nội dung |
| Nền tối | `14181F` | Nền slide bìa, slide nhấn mạnh, tổng kết |
| Chữ chính trên nền kem | `1C2027` | Tiêu đề, tên bước |
| Chữ phụ trên nền kem | `4A4A45` | Mô tả, nội dung thẻ |
| Chữ chân trang trên nền kem | `6B6A63` | Chân trang |
| Chữ chính trên nền tối | `F1EDE4` | Tiêu đề, nội dung trên nền tối |
| Chữ phụ trên nền tối | `C9C4B8` | Mô tả trên nền tối |
| Chữ chân trang trên nền tối | `8F8A7F` | Chân trang trên nền tối |
| Nhấn chính (cam sáng) | `F08A4B` | Kicker và mũi tên trên nền tối |
| Nhấn chính (đỏ nâu) | `B8521F` | Vạch gạch dưới tiêu đề, kicker trên nền kem |
| Nhấn phụ (xanh) | `2F5FB3` | Câu kết, lưu ý quan trọng trên nền kem |
| Nền thẻ/khối | `232A35` | Thẻ trên nền tối |
| Nền thẻ/khối sáng | `FFFFFF` | Thẻ trên nền kem |
| Viền/đường phân cách | `E2DDD1` | Đường kẻ nhạt trên nền kem |

Không dùng màu ngoài bảng này. Các màu `F1EDE4`, `E2DDD1`, `B5B3AD` đã xuất hiện trong file và được giữ lại.

**Quy tắc đổi nền:** slide bìa, slide "đường đi tới heap", slide "rò rỉ bộ nhớ" và slide "tổng kết" dùng nền tối. Các slide còn lại dùng nền kem.

---

## 4. Thành phần

### Kicker
- Dòng nhỏ đứng trên tiêu đề, cỡ 16, đậm, viết hoa.
- Trên nền kem: màu `B8521F`. Trên nền tối: màu `F08A4B`.
- Ví dụ: "LỖI 3 · RÒ RỈ BỘ NHỚ", "C / C++ · bài 1".

### Tiêu đề
- Cỡ 36, đậm, màu chữ chính, nằm ngay dưới kicker.
- Dưới tiêu đề có một vạch ngang màu `B8521F`, dài ~3.39 triệu EMU, dày 0. Vạch dùng để nhấn mạnh, không dùng cho mọi tiêu đề.

### Thẻ (card)
- Nền `FFFFFF` (trên kem) hoặc `232A35` (trên tối), không viền.
- Tiêu đề thẻ cỡ 18–20 đậm; mô tả cỡ 16 thường.
- Mỗi thẻ có khoảng đệm trái ~254000 EMU so với mép thẻ.

### Bước đánh số
- Dạng "1 · Tên bước", số và tên cách nhau bằng " · ".
- Mỗi bước có một tiêu đề đậm (20) và một dòng mô tả (16).
- Các bước xếp ngang theo lưới 3 cột.

### Mũi tên và chuỗi
- Mũi tên "→" cỡ 22, màu `F08A4B` trên nền tối.
- Dùng để nối các khối theo thứ tự: biến → địa chỉ → con trỏ → heap → free.

### Khối code
- Font JetBrains Mono, cỡ 18–24, chữ màu `F1EDE4` trên nền tối.
- Mỗi dòng code là một hộp riêng, cao khoảng 391186 EMU, cách nhau ~416500 EMU.
- Khi thêm dòng mới, dịch các dòng phía dưới xuống và mở rộng nền tối của khối code.

### Sơ đồ bằng hình
- Ô nhà, ô nhớ, nút danh sách, ô bảng băm vẽ bằng hình chữ nhật có bo góc.
- Dùng màu nền `232A35` cho ô, viền và chữ `F1EDE4`.
- Mũi tên dùng đường thẳng hoặc chữ "→" màu `F08A4B`.

### Bảng so sánh
- Hai cột đối chiếu (ví dụ Stack/Heap), tiêu đề cột đậm, các dòng ngăn cách bằng đường kẻ mỏng.

### Chân trang
- Dòng "Tên bài · NN", cỡ 12, nằm ở cuối slide (y = 6238435).
- Số trang hai chữ số: 01, 02, …, 17.
- Slide bìa không có chân trang.

---

## 5. Cấu trúc bài và logic trình bày

Một bài 20 slide nên theo đúng trình tự này:

1. **Bìa** (nền tối): kicker "Cấp · bài", tiêu đề 60, phụ đề 20.
2. **Mục tiêu**: 3–4 ý dạng thẻ hoặc số thứ tự.
3. **Bản đồ bài** (tùy chọn): các phần của bài.
4. **Ý 1 (đời thường)**: một ví dụ, không có code dài.
5. **Ý 1 (kỹ thuật)**: code ngắn ngay cạnh giải thích.
6. Lặp lại kiểu "đời thường → kỹ thuật" cho từng khái niệm mới.
7. **Chuỗi logic** (nền tối): các khối nối bằng mũi tên.
8. **So sánh** (nếu có hai khái niệm dễ nhầm).
9. **Ứng dụng thực tế** (code hoặc sơ đồ).
10. **Cảnh báo / lỗi thường gặp** (nền tối, thẻ đỏ nâu hoặc cam).
11. **Tự kiểm tra**: 3 câu hỏi, đáp án để trong ghi chú người thuyết trình.
12. **Tổng kết** (nền tối): 4 ý cốt lõi, mỗi ý một dòng.

Nguyên tắc chung:
- Mỗi slide một ý chính. Slide dày chữ thì tách.
- Code tối đa khoảng 6 dòng trên một slide.
- Mỗi khái niệm mới phải có ví dụ đời thường trước, rồi mới đến code.
- Ghi chú người thuyết trình là nơi để đáp án và giải thích thêm, không nhét vào slide.

---

## 6. Ghi chú người thuyết trình

- Đặt trong phần notes của từng slide.
- Slide tự kiểm tra: ghi đáp án gợi ý vào notes.
- Các slide khác: ghi cách giải thích ngắn (1–3 câu) để người trình bày không phải nhớ.

---

## 7. Checklist trước khi giao slide

- [ ] Font chính là Be Vietnam Pro, code là JetBrains Mono.
- [ ] Đúng nền (kem hoặc tối) theo vai trò slide.
- [ ] Tiêu đề 36, kicker 16, chân trang 12.
- [ ] Không có màu ngoài bảng.
- [ ] Không có cỡ chữ lẻ.
- [ ] Code không tràn khỏi khối nền.
- [ ] Mọi dòng có trong ô không tràn ra ngoài khung.
- [ ] Có chân trang "Tên bài · NN" (trừ slide bìa).
- [ ] Ảnh minh họa có nhãn "minh họa" nếu số liệu là giả định.

---

## 8. Lưu ý khi áp dụng cho web

Web và slide HTML đã được đồng bộ theo bảng màu trong file này. Ánh xạ đã áp dụng:

| Cũ (web) | Mới (chuẩn) |
|---|---|
| `#1f3a5f` navy | `#1C2027` |
| `#2a4f7e` navy 2 | `#2A2F3A` |
| `#e0a100` vàng | `#F08A4B` cam |
| `#2a7f80` teal | `#2F5FB3` xanh |
| `#b5483a` đỏ nâu | `#B8521F` |
| `#f7f4ee` kem | `#F5F2EA` |
| `#1d2330` nền code | `#14181F` |

Áp dụng cho: `assets/site.css`, `index-hoccode.html`, `lesson.html`, `setup.html`, và các slide `slides/*.html`. Trang `du-an.html` vẫn dùng `assets/style.css` cũ (chưa đổi). Khi làm slide mới, dùng bảng mới.
