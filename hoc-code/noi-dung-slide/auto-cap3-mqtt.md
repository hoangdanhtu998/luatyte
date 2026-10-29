# Bộ lọc chủ đề MQTT

## Slide 1 · Bìa
**Bộ lọc chủ đề MQTT**


## Slide 2 · Ý chính
MQTT gửi tin theo chủ đề như `sensor/1/temp`. Người đăng ký dùng bộ lọc có ký tự đại diện:
- `+` khớp đúng một cấp.
- `#` khớp mọi cấp còn lại, đặt ở cuối.

## Slide 3 · Ví dụ
- `sensor/+/temp` khớp `sensor/1/temp`.
- `sensor/+` không khớp `sensor/1/temp`.
- `sensor/#` khớp `sensor/1/temp`.

## Slide 4 · Lỗi hay gặp
- Quên rằng `+` không khớp nhiều cấp.

## Slide 5 · Tự kiểm tra
1. `+` khớp bao nhiêu cấp?
2. `#` đặt ở đâu?
