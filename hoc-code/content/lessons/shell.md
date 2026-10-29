# Shell (Lệnh cơ bản)

**Cấp 1 · Bài 3 · 45 phút**

---

## Tóm tắt trong 1 phút
- Shell nhận lệnh gõ bằng chữ rồi chạy. Lệnh có dạng: tên lệnh, tùy chọn, tham số.
- Đường dẫn `/` là gốc. `./` và `../` là đường dẫn tương đối.
- `|` (pipe) đưa kết quả lệnh này làm đầu vào lệnh kia.
- Bài này dùng bash. Chạy trên Linux, WSL hoặc Git Bash.

---

## Bước 1: Cấu trúc một lệnh

```
lệnh  [tùy chọn]  [tham số]
```

- `ls` liệt kê file.
- `ls -l` liệt kê chi tiết: quyền, kích thước, thời gian.

---

## Bước 2: Đường dẫn

- **Tuyệt đối** bắt đầu bằng `/`: `/home/user/file.txt`.
- **Tương đối** tính từ thư mục hiện tại: `file.txt`, `./file.txt`, `../file.txt`.

`pwd` in thư mục hiện tại. `cd` đổi thư mục.

---

## Bước 3: Tạo, xem, xóa

| Lệnh | Việc làm |
|---|---|
| `touch a.txt` | Tạo file rỗng |
| `mkdir thu_muc` | Tạo thư mục |
| `cat a.txt` | In nội dung file |
| `cp a.txt b.txt` | Sao chép |
| `mv a.txt b.txt` | Đổi tên hoặc di chuyển |
| `rm a.txt` | Xóa file |
| `rm -r thu_muc` | Xóa thư mục và mọi thứ trong đó |

`rm` xóa là mất luôn, không có thùng rác. Xem kỹ đường dẫn trước khi chạy.

---

## Bước 4: Pipe

```bash
ls -l | head -n 3       # chỉ hiện 3 dòng đầu
ls *.txt | wc -l        # đếm số file .txt
```

Kết quả của lệnh bên trái thành đầu vào của lệnh bên phải.

---

## Bước 5: Chuyển hướng

```bash
echo "xin chao" > out.txt    # ghi đè file
echo "them" >> out.txt       # thêm vào cuối file
cat out.txt
```

Kết quả:

```
xin chao
them
```

---

## Bước 6: Biến và PATH

```bash
name="Cindy"
echo $name          # In: Cindy
echo $PATH          # các thư mục shell tìm lệnh
```

`PATH` là danh sách thư mục shell tìm lệnh. Muốn thêm thư mục, dùng `export PATH=$PATH:/duong/dan`.

---

## Bước 7: Vòng lặp và điều kiện

```bash
for i in 1 2 3; do
  echo "So: $i"
done

n=1
while [ $n -le 2 ]; do
  echo "n=$n"
  n=$((n + 1))
done

if [ 5 -gt 3 ]; then
  echo "5 lon hon 3"
fi
```

Kết quả:

```
So: 1
So: 2
So: 3
n=1
n=2
5 lon hon 3
```

Số so sánh: `-gt` lớn hơn, `-lt` nhỏ hơn, `-eq` bằng, `-ne` khác.

---

## Bước 8: Đếm và sắp xếp

```bash
printf 'b\na\nb\n' | sort | uniq -c
```

Kết quả:

```
      1 a
      2 b
```

`sort` sắp xếp, `uniq -c` đếm số lần xuất hiện của mỗi dòng.

---

## Lỗi hay gặp

1. Viết `rm -rf` mà không xem đường dẫn.
2. Dùng `>` khi muốn thêm vào file: `>` ghi đè, `>>` thêm vào.
3. Quên dấu cách trong điều kiện: `[ $n -le 2 ]` phải có dấu cách quanh ngoặc.

---

## Tự kiểm tra
1. Lệnh nào đếm số dòng?
2. `>` và `>>` khác nhau ở điểm nào?
3. Vì sao `rm -r` cần cẩn thận?

## Tổng kết
- Lệnh = tên + tùy chọn + tham số.
- Pipe `|` nối kết quả giữa các lệnh.
- Kiểm tra đường dẫn trước khi xóa.
