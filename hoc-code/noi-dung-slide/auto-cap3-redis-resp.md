# Giao thức RESP của Redis

## Slide 1 · Bìa
**Giao thức RESP của Redis**


## Slide 2 · Ý chính
Redis trao đổi bằng RESP. Lệnh là một mảng các chuỗi.

## Slide 3 · Các ký hiệu
- `*n`: mảng có n phần tử.
- `$n`: chuỗi dài n byte, theo sau là nội dung.

## Slide 4 · Ví dụ
`GET key` gửi đi là:
```
*2
$3
GET
$3
key
```

## Slide 5 · Lỗi hay gặp
- Đếm độ dài sai, làm lệch cả lệnh.

## Slide 6 · Tự kiểm tra
1. Ký tự `*` nghĩa là gì?
2. `$3` nghĩa là gì?
