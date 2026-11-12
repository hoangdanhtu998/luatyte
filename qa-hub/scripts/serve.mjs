// Chạy server cho Lighthouse CI ở cổng riêng để không đụng app đang dùng.
process.env.PORT ??= '4174';
await import('../server.js');
