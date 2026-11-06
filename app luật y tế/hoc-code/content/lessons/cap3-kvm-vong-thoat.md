# KVM: xử lý lý do thoát khỏi máy ảo

## Ý chính
Với KVM, máy ảo chạy trực tiếp trên CPU. Khi máy ảo cần hypervisor (ví dụ ghi ra một cổng I/O), CPU **thoát** về chương trình quản lý. Chương trình đọc lý do thoát rồi xử lý, rồi tiếp tục chạy máy ảo.

## Vòng lặp (phiên bản mô phỏng)
```
while (true):
    lý_do = chạy_vCPU()
    if lý_do == IO_OUT: in ký tự
    if lý_do == HALT:   dừng
```

## Lưu ý
Bài này mô phỏng bằng danh sách lý do thoát có sẵn, vì chạy KVM thật cần Linux và /dev/kvm.

## Tự kiểm tra
1. Vì sao cần vòng lặp chạy vCPU?
2. Thoát là gì?
