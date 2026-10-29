# Đọc tiêu đề file ELF

## Slide 1 · Bìa
**Đọc tiêu đề file ELF**


## Slide 2 · Ý chính
Chương trình trên Linux thường là file ELF. Bốn byte đầu luôn là `7F 45 4C 46`, tức là `\x7fELF`. Debugger và hệ điều hành dùng dấu hiệu này để nhận diện file.

## Slide 3 · Đời thường
Giống chữ ký đầu thư: nhìn vào là biết loại thư.

## Slide 4 · Ví dụ
Nếu bốn byte đầu là `7F 45 4C 46` thì đó là ELF.

## Slide 5 · Lỗi hay gặp
- Nhầm chữ `E L F` với số.

## Slide 6 · Tự kiểm tra
1. Bốn byte đầu của ELF là gì?
2. Vì sao debugger cần biết file là ELF?
