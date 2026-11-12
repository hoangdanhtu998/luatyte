import { test, expect } from '@playwright/test';

test('API /api/testcases phản hồi dưới 300 ms', async ({ request }) => {
  const started = Date.now();
  const res = await request.get('/api/testcases');
  const elapsed = Date.now() - started;
  expect(res.status()).toBe(200);
  expect(elapsed).toBeLessThan(300);
});

test('20 yêu cầu song song đều thành công', async ({ request }) => {
  const responses = await Promise.all(
    Array.from({ length: 20 }, () => request.get('/api/stats')),
  );
  for (const res of responses) {
    expect(res.status()).toBe(200);
  }
});

test('navigation timing: DOMContentLoaded dưới 2 giây và FCP dưới 1.5 giây', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  const metrics = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0];
    const fcp = performance.getEntriesByName('first-contentful-paint')[0];
    return { dcl: nav.domContentLoadedEventEnd, fcp: fcp ? fcp.startTime : null };
  });
  expect(metrics.dcl).toBeLessThan(2000);
  expect(metrics.fcp).not.toBeNull();
  expect(metrics.fcp).toBeLessThan(1500);
});

// Ngân sách theo quy tắc web: JS trang ứng dụng < 300 KB gzip, CSS < 50 KB gzip.
test('ngân sách tài nguyên: JS < 300 KB gzip, CSS < 50 KB gzip', async ({ request }) => {
  const { gzipSync } = await import('node:zlib');
  const budgets = { '/app.js': 300 * 1024, '/styles.css': 50 * 1024 };
  for (const [file, limit] of Object.entries(budgets)) {
    const res = await request.get(file);
    expect(res.status()).toBe(200);
    const gzipped = gzipSync(await res.body()).length;
    expect(gzipped, file).toBeLessThan(limit);
  }
});
