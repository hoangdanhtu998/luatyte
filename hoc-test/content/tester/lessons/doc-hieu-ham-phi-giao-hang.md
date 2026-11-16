# Đọc hiểu một hàm tính phí: phí giao đồ ăn

Bài này lấy một hàm rất ngắn: hàm tính phí giao đồ ăn của một app mẫu. Bạn không cần biết lập trình. Mục tiêu là hiểu máy đọc hàm này theo thứ tự nào, và vì sao tester phải biết điều đó để viết ca kiểm thử đúng.

## Sau bài này bạn làm được gì

- Đọc được từng dòng của một hàm có `if` và `return`.
- Hiểu vì sao thứ tự các điều kiện quan trọng.
- Tìm được các nhánh (đường đi) của hàm và viết ca để chạm từng nhánh.
- Nhận ra những giá trị biên thường bị bỏ sót.

## Hàm đang nói về cái gì

Khách đặt đồ ăn. App phải quyết định phí giao là bao nhiêu, hoặc có giao hay không. Hàm nhận ba đầu vào:

| Đầu vào | Ý nghĩa |
|---|---|
| `km` | Quãng đường từ quán đến khách, tính bằng km |
| `tong` | Tổng tiền món ăn, tính bằng đồng |
| `thanh_vien` | `1` nếu khách là thành viên, `0` nếu không |

Kết quả trả về:

| Kết quả | Nghĩa |
|---|---|
| `-1` | Không giao (quá xa) |
| `0` | Miễn phí giao |
| Số khác 0 | Phí giao phải trả |

## Đọc từng dòng

```python
def phi_ship(km, tong, thanh_vien):
    if km > 10:
        return -1
    if tong >= 300000:
        return 0
    if thanh_vien == 1 and tong >= 150000:
        return 0
    if km <= 3:
        return 15000
    return 15000 + (km - 3) * 5000
```

**Dòng 1 `def`.** Khai báo hàm tên `phi_ship` với ba đầu vào. Mỗi lần chạy, bạn đưa vào ba giá trị.

**Dòng 2 và 3 `if km > 10`, `return -1`.** Nếu quãng đường trên 10 km, hàm trả `-1` và dừng ngay. Các dòng sau không chạy.

**Dòng 4 và 5 `if tong >= 300000`, `return 0`.** Đơn từ 300.000 đồng trở lên thì miễn phí. Chỉ xét đến đây khi `km` không vượt 10.

**Dòng 6 và 7 `if thanh_vien == 1 and tong >= 150000`, `return 0`.** Thành viên mà đơn từ 150.000 đồng thì miễn phí. Chữ `and` nghĩa là cả hai điều kiện phải đúng.

**Dòng 8 và 9 `if km <= 3`, `return 15000`.** Giao gần (từ 3 km trở xuống) thì phí cố định 15.000 đồng.

**Dòng 10 `return 15000 + (km - 3) * 5000`.** Giao xa hơn 3 km: 15.000 đồng cho 3 km đầu, sau đó cứ mỗi km thêm là 5.000 đồng. Dòng này chỉ chạy khi mọi điều kiện trên đều sai.

## Thứ tự quan trọng đến mức nào

Máy đọc từ trên xuống. Khi gặp `return`, hàm dừng. Vì vậy đổi thứ tự sẽ đổi kết quả.

Ví dụ: `km = 12`, `tong = 400000`.

- Thứ tự hiện tại: `km > 10` đúng, trả `-1`. Khách không được giao dù đơn lớn.
- Nếu đặt kiểm tra tổng tiền lên trước: trả `0`, app hứa giao cho khách ở quá xa.

Đây chính là loại lỗi tester phải tìm. Hàm chạy đúng từng dòng vẫn có thể sai về nghiệp vụ nếu thứ tự sai.

## Các nhánh và cách chọn ca kiểm thử

Mỗi `if` tạo hai đường: đúng hoặc sai. Có năm nhánh cần chạm, đánh số b1 đến b5:

| Nhánh | Điều kiện đi vào | Ví dụ ca | Kết quả mong đợi |
|---|---|---|---|
| b1 | `km > 10` | km = 12, tong = 100000, thanh_vien = 0 | -1 |
| b2 | `tong >= 300000` (và km không quá 10) | km = 5, tong = 350000, thanh_vien = 0 | 0 |
| b3 | Thành viên và `tong >= 150000` | km = 5, tong = 200000, thanh_vien = 1 | 0 |
| b4 | `km <= 3` | km = 2, tong = 100000, thanh_vien = 0 | 15000 |
| b5 | Còn lại, giao xa | km = 8, tong = 100000, thanh_vien = 0 | 40000 |

Kiểm tra b5: `15000 + (8 - 3) × 5000 = 15000 + 25000 = 40000`.

Một bộ năm ca như trên là đủ chạm mọi nhánh. Nhưng chạm nhánh chưa đủ để kết luận hàm đúng.

## Giá trị biên: chỗ hay có lỗi

Lỗi thường nằm đúng ở ranh giới, nơi `>` đổi thành `>=`, hay `<` đổi thành `<=`. Thử cặp giá trị sát nhau:

| Biến | Thử giá trị | Vì sao |
|---|---|---|
| `km` | 10, 10.5 | Ranh giới của `km > 10` |
| `km` | 3, 3.5 | Ranh giới của `km <= 3` |
| `tong` | 299999, 300000 | Ranh giới miễn phí đơn lớn |
| `tong` | 149999, 150000 | Ranh giới miễn phí thành viên |

Ví dụ: `km = 10` không bị từ chối, vì điều kiện là `km > 10`. Nếu hàm đúng về nghiệp vụ là từ 10 km là không giao, thì code sai dù đọc qua vẫn ổn.

Hãy hỏi lại người viết yêu cầu: "đúng 10 km thì giao hay không?". Câu trả lời đó quyết định code đúng hay sai. Tester không tự đoán.

## Thử tay vài ca

1. `km = 3`, `tong = 100000`, `thanh_vien = 0`. Kết quả là `15000`.
2. `km = 3.5`, `tong = 100000`, `thanh_vien = 0`. Kết quả là `17500`. Vì `15000 + 0.5 × 5000`.
3. `km = 5`, `tong = 299999`, `thanh_vien = 0`. Kết quả là `25000`. Chưa đủ 300.000 để miễn phí.
4. `km = 5`, `tong = 149999`, `thanh_vien = 1`. Kết quả là `25000`. Thành viên nhưng chưa đủ 150.000.

## Tóm lại

- Đọc hàm theo thứ tự từ trên xuống, và chú ý mỗi `return` dừng hàm.
- Mỗi `if` là một nhánh. Chạm đủ nhánh, rồi thử thêm các giá trị biên.
- Khi thứ tự hoặc ranh giới chưa rõ, hỏi người viết yêu cầu trước khi kết luận.
