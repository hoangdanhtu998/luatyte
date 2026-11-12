import { test, expect } from '@playwright/test';

// Không chạy CI thật trong bộ test (CI chạy npm install và Lighthouse). Chỉ kiểm giao diện và API đọc.
test.describe('Pipeline CI trên trang Tổng', () => {
  test('trang Tổng có khối Pipeline CI với nút Chạy CI', async ({ page }) => {
    await page.goto('/#/tong');
    await expect(page.getByRole('heading', { name: 'Pipeline CI' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Chạy CI' })).toBeVisible();
  });

  test('hiển thị đủ 7 bước của pipeline', async ({ page }) => {
    await page.goto('/#/tong');
    for (const label of ['Cài đặt', 'Kiểm cú pháp', 'E2E, API, UI, bảo mật', 'Đồng bộ kết quả vào test case', 'Accessibility (axe-core)', 'Hiệu năng (Lighthouse CI)', 'Báo cáo và xuất HTML']) {
      await expect(page.locator('.tong-item .tong-name', { hasText: label }).first()).toBeVisible();
    }
  });

  test('API tiến độ trả 200: null khi chưa chạy, hoặc có danh sách steps', async ({ request }) => {
    const res = await request.get('/api/ci/progress');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body === null || Array.isArray(body.steps)).toBe(true);
  });
});
