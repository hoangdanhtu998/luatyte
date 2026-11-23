// Đồng bộ kết quả test tự động vào QA Hub đang chạy.
// Chạy sau khi npm test: node scripts/sync-results.mjs   (PORT mặc định 3000)
const port = process.env.PORT ?? '3000';
const url = `http://127.0.0.1:${port}/api/automation/sync`;

try {
  const res = await fetch(url, { method: 'POST' });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error(`Lỗi ${res.status}: ${body.error ?? 'không rõ'}`);
    process.exitCode = 1;
  } else {
    console.log(`Đã đồng bộ: ${body.matched} test case khớp trên ${body.specs} test trong báo cáo.`);
    for (const u of body.updated ?? []) console.log(`  ${u.id}: ${u.result}`);
  }
} catch (err) {
  console.error(`Không kết nối được ${url}. QA Hub đã chạy chưa? (${err.message})`);
  process.exitCode = 1;
}
