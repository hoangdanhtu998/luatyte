// Pre-check: server quản lý luật y tế có đang chạy không.
// exit 0 = server sống, tiếp tục chạy audit
// exit 2 = server tắt hoặc không phản hồi, bỏ qua lượt này
const url = process.env.ADMIN_URL || 'http://localhost:3200/api/admin/users';

try {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  const r = await fetch(url, {
    method: 'GET',
    signal: controller.signal,
    headers: { 'Accept': 'application/json' }
  });
  clearTimeout(timeout);

  // Server đang chạy nếu trả về bất kỳ HTTP status nào (kể cả 401 — app hoạt động, chỉ cần auth)
  if (r.status >= 200 && r.status < 600) {
    console.log(`Server đang chạy (HTTP ${r.status}). Tiếp tục kiểm tra.`);
    console.log('CINDY_PRECHECK_OK');
    process.exit(0);
  }

  console.log(`Server trả trạng thái lạ ${r.status}, bỏ qua.`);
  process.exit(2);
} catch (e) {
  if (e.name === 'AbortError') {
    console.log('Server không phản hồi trong 5s, bỏ qua lượt này.');
  } else {
    console.log(`Server không truy cập được, bỏ qua: ${e.message}`);
  }
  process.exit(2);
}
