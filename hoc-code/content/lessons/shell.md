# Shell (Lệnh cơ bản)

**Cấp 1 · Bài 3 · 45 phút**

---

## Tóm tắt trong 1 phút
- Shell là chương trình nhận lệnh gõ bằng chữ rồi chạy. Lệnh thường có dạng: tên lệnh, tùy chọn, tham số.
- Đường dẫn tuyệt đối bắt đầu từ thư mục gốc `/`. Đường dẫn tương đối tính từ thư mục hiện tại.
- Lệnh hay dùng: `ls` xem file, `cd` đổi thư mục, `cp`, `mv`, `rm` sao chép, di chuyển, xóa, `grep` tìm chữ.
- Dấu `|` (pipe) đưa kết quả của lệnh này làm đầu vào cho lệnh kia.
- Biến môi trường như `PATH` cho shell biết tìm lệnh ở đâu. `for`, `while`, `if` dùng để lặp và rẽ nhánh.
- Bài này dùng bash, chạy trong Linux hoặc WSL. Không chạy trực tiếp trên trang này.

## 1. Shell là gì?

Shell là chương trình (command-line interpreter) nhận lệnh từ người dùng, gọi hệ thống để thực thi, và trả về kết quả. Mỗi hệ điều hành có shell riêng:
- **Linux/macOS:** Bash (default), Zsh, Fish
- **Windows:** PowerShell, CMD

---

## 2. Cấu trúc lệnh cơ bản

```
command [option] [argument]...
```

Ví dụ:
- `ls` — liệt kê file trong thư mục hiện tại
- `ls -l` — liệt kê chi tiết (long format)
- `ls -l /home` — liệt kê chi tiết trong thư mục /home
- `cd Documents` — thay đổi thư mục hiện tại
- `pwd` — in ra đường dẫn thư mục hiện tại

---

## 3. Quan trọng: Path (Đường dẫn)

### Absolute path (Đường dẫn tuyệt đối)
Bắt đầu từ gốc (`/` trên Linux/macOS, `C:\` trên Windows).
Ví dụ: `/home/user/Documents/file.txt` hoặc `C:\Users\Admin\file.txt`

### Relative path (Đường dẫn tương đối)
Tính từ thư mục hiện tại (working directory).
Ví dụ:
- `./file.txt` — file trong thư mục hiện tại
- `../file.txt` — file một cấp trên
- `subdir/file.txt` — file trong thư mục con

---

## 4. Các lệnh hữu ích

### Xem file/directory
| Lệnh | Mô tả |
|------|-------|
| `ls` | Liệt kê file/directory |
| `ls -l` | Chi tiết (permissions, owner, size, time) |
| `ls -a` | Hiển thị file ẩn (bắt đầu bằng `.`) |
| `tree` | Hiển thị cấu trúc cây thư mục (cần cài) |

### Điều hướng
| Lệnh | Mô tả |
|------|-------|
| `cd <path>` | Thay đổi directory |
| `cd` | Quay về home directory |
| `cd ..` | Lùi lên thư mục trên cùng |
| `cd ~` | về thư mục người dùng |
| `pwd` | In ra thư mục hiện tại |

### Tạo/xoá/duyệt file
| Lệnh | Mô tả |
|------|-------|
| `touch file.txt` | Tạo file rỗng (hoặc cập nhật thời gian) |
| `mkdir ten_thu_muc` | Tạo thư mục mới |
| `rm file.txt` | Xóa file |
| `rm -r ten_thu_muc` | Xóa thư mục (rộng rãi) |
| `rm -rf ten_thu_muc` | Xóa mạnh (không hỏi xác nhận) |
| `cp file1 file2` | Sao chép file |
| `mv file1 file2` | Đổi tên/file (move) |
| `cat file.txt` | In nội dung file ra màn hình |
| `more file.txt` | In một trang một trang (bấm phím space để chuyển) |
| `head -n 10 file.txt` | In 10 dòng đầu tiên |
| `tail -n 10 file.txt` | In 10 dòng cuối cùng |

### Phân quyền
| Lệnh | Mô tả |
|------|-------|
| `chmod +x file.sh` | Cho phép thực thi file (thêm quyền x) |
| `chmod 755 file.sh` | Thiết lập quyền rwxr-xr-x |
| `chown user:group file` | Thay đổi chủ/group |

---

## 5. Chaining lệnh (Pipe `|`)

Pipe nối kết quả lệnh bên trái làm đầu vào lệnh bên phải.

```bash
ls -l | grep ".txt"     # Liệt kê file, chỉ lấy những file .txt
ps aux | grep chrome     # Xem process chrome
ls *.txt | wc -l         # Đếm số file .txt
```

---

## 6. Biến môi trường (Environment Variables)

### Xem
```bash
echo $HOME           # Thư mục người dùng
echo $PATH           # Đường tìm kiếm lệnh
echo $USER           # Tên người dùng
echo $SHELL          # Shell đang dùng
```

### Thêm PATH tạm thời
```bash
export PATH=$PATH:/c/winlibs/mingw64/bin  # Thêm gcc vào PATH
```

### Biến cục bộ
```bash
name="Cindy"
echo $name          # In ra Cindy
unset name          # Xóa biến
```

---

## 7. Vòng lặp và Điều kiện

### Vòng lặp `for`
```bash
for i in 1 2 3 4 5; do
    echo "Số: $i"
done
```

### Vòng lặp `for` với range
```bash
for i in {1..5}; do
    echo "i = $i"
done
```

### Vòng lặp `while`
```bash
count=1
while [ $count -le 5 ]; do
    echo "Count: $count"
    count=$((count + 1))
done
```

### Điều kiện `if`
```bash
if [ "$1" == "hello" ]; then
    echo "Chào bạn!"
else
    echo "Không phải chào"
fi
```

### So sánh số
```bash
if [ 5 -gt 3 ]; then
    echo "5 lớn hơn 3"
fi
# -gt: lớn hơn, -lt: nhỏ hơn, -eq: bằng, -ne: khác
```

---

## 8. Chuyển hướng đầu vào và đầu ra

### Đầu vào
```bash
command < file.txt     # Lệnh đọc input từ file
```

### Đầu ra
```bash
command > file.txt     # Ghi đè file (truncate)
command >> file.txt    # Thêm vào file (append)
```

### Ví dụ: Đếm từ trong file
```bash
grep -oE "[[:alnum:]]+" file.txt | sort | uniq -c | sort -rn
```

---

## 9. Ví dụ thực tế: Sắp xếp file lớn

```bash
# Tìm tất cả file .log lớn hơn 1MB, sắp xếp theo size, in ra 5 file to nhất
find . -type f -name "*.log" -size +1M -exec ls -l {} \; | sort -k5 -n | head -5
```

---

## 10. Tóm tắt lệnh quan trọng

| Lệnh | Mô tả |
|------|-------|
| `ls` | Liệt kê |
| `cd` | Thay đổi thư mục |
| `pwd` | Đường dẫn hiện tại |
| `touch` | Tạo file |
| `mkdir` | Tạo thư mục |
| `rm` | Xóa |
| `cp` | Sao chép |
| `mv` | Đổi tên/nhảy |
| `cat` | In file |
| `head/tail` | Đầu/cập cuối |
| `grep` | Tìm kiếm |
| `wc` | Đếm dòng/từ/chữ |
| `find` | Tìm file |
| `chmod` | Phân quyền |
| `export` | Thêm PATH |
| `for/while/if` | Vòng lặp/câu điều kiện |

---

## 11. Tài liệu tham khảo

- `man <lệnh>` — xem manual page (ví dụ: `man ls`)
- `--help` — ví dụ: `ls --help`
- TLPD (The Linux Programming Dev) hoặc tài liệu chuẩn hệ điều hành của chính hệ điều hành bạn đang dùng

---

## 12. Bài tập thực hành

**Bài 1:** Dùng `ls -l` để liệt kê file trong thư mục hiện tại, sau đó dùng `ls -l | head -n 10` để xem 10 dòng đầu tiên.

**Bài 2:** Tạo thư mục `test_dir`, tạo file `test.txt` bên trong bằng `touch`, in nội dung file bằng `cat`, sau đó xóa bằng `rm -r test_dir`.

**Bài 3:** Sử dụng pipe `ls *.txt | wc -l` đếm số file `.txt` trong thư mục hiện tại. Thử thay `*.txt` bằng `*.py` và `*.md`.

**Bài 4:** Viết script `tinhtoan.sh` thực hiện:
- Nhận 2 số làm argument (`$1`, `$2`)
- In ra tổng, hiệu, tích, thương
- Chạy script: `./tinhtoan.sh 5 3`

**Bài 5:** Sử dụng `find . -name "*.md" -type f` tìm tất cả file markdown, sau đó dùng `head -3` in ra 3 dòng đầu tiên của mỗi file.