import { test, expect } from '@playwright/test';

test.describe('Smoke', () => {
  test('health endpoint trả 200 và JSON có status ok', async ({ request }) => {
    const res = await request.get('/api/health');
    expect(res.status()).toBe(200);
    expect(await res.json()).toMatchObject({ status: 'ok' });
  });

  test('trang chủ tải được, không lỗi 5xx, dưới 3 giây', async ({ page }) => {
    const started = Date.now();
    const response = await page.goto('/');
    expect(response.status()).toBeLessThan(500);
    await expect(page.getByRole('heading', { level: 1, name: 'Tổng' })).toBeVisible();
    expect(Date.now() - started).toBeLessThan(3000);
  });

  test('không có lỗi JavaScript hay lỗi console nghiêm trọng', async ({ page }) => {
    const problems = [];
    page.on('pageerror', (err) => problems.push(err.message));
    page.on('console', (msg) => {
      if (msg.type() === 'error') problems.push(msg.text());
    });
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    expect(problems).toEqual([]);
  });

  test('không có tài nguyên nào trả 4xx/5xx', async ({ page }) => {
    const failed = [];
    page.on('response', (res) => {
      if (res.status() >= 400) failed.push(`${res.status()} ${res.url()}`);
    });
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    expect(failed).toEqual([]);
  });

  test('điều hướng giữa các trang chính hoạt động', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Test case' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Test case' })).toBeVisible();
    await page.goto('/#/checklist');
    await expect(page.getByRole('heading', { level: 1, name: 'Checklist' })).toBeVisible();
  });
});
