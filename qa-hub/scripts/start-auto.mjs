// Khởi động app và bật tự chạy bộ test theo lịch (mặc định mỗi 60 phút).
// Đổi lịch: AUTO_TEST_MINUTES=30 npm run start:auto (Windows: đặt biến trước khi chạy).
process.env.AUTO_TEST_MINUTES ??= '60';
await import('../server.js');
