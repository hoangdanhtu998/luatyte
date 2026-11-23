// Chạy server cho Lighthouse CI ở cổng riêng để không đụng app đang dùng.
// Không dùng PORT kế thừa từ tiến trình cha (ví dụ server đang chạy ở 3100), luôn 4174 trừ khi đặt LHCI_PORT.
process.env.PORT = process.env.LHCI_PORT ?? '4174';
await import('../server.js');
