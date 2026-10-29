# Giao thức RESP của Redis

## Ý chính
Redis trao đổi bằng RESP. Lệnh là một mảng các chuỗi.

## Các ký hiệu
- `*n`: mảng có n phần tử.
- `$n`: chuỗi dài n byte, theo sau là nội dung.

## Ví dụ
`GET key` gửi đi là:
```
*2
$3
GET
$3
key
```

## Lỗi hay gặp
- Đếm độ dài sai, làm lệch cả lệnh.

## Tự kiểm tra
1. Ký tự `*` nghĩa là gì?
2. `$3` nghĩa là gì?
