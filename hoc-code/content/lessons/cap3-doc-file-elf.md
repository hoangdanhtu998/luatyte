# Đọc tiêu đề file ELF

## Ý chính
Chương trình trên Linux thường là file ELF. Bốn byte đầu luôn là `7F 45 4C 46`, tức là `\x7fELF`. Debugger và hệ điều hành dùng dấu hiệu này để nhận diện file.

## Đời thường
Giống chữ ký đầu thư: nhìn vào là biết loại thư.

## Ví dụ
Nếu bốn byte đầu là `7F 45 4C 46` thì đó là ELF.

## Lỗi hay gặp
- Nhầm chữ `E L F` với số.

## Tự kiểm tra
1. Bốn byte đầu của ELF là gì?
2. Vì sao debugger cần biết file là ELF?
