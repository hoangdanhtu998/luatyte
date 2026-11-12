import { test, expect } from '@playwright/test';

test.describe('API: trợ lý QA', () => {
  test('GET trả trạng thái AI và báo cáo có đủ trường', async ({ request }) => {
    const res = await request.get('/api/assistant');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(typeof body.aiEnabled).toBe('boolean');
    expect(typeof body.report.currentStage).toBe('string');
    for (const key of ['completed', 'missing', 'uncheckedChecklist', 'notRunTestCases', 'uncoveredRequirements', 'exitCriteriaUnmet']) {
      expect(Array.isArray(body.report[key]), key).toBe(true);
    }
    expect(typeof body.report.uncheckedChecklistTotal).toBe('number');
  });

  test('POST thiếu tin nhắn trả 400', async ({ request }) => {
    const res = await request.post('/api/assistant', { data: { message: '   ' } });
    expect(res.status()).toBe(400);
    expect((await res.json()).details.message).toBeTruthy();
  });

  test('POST tin nhắn quá 2000 ký tự trả 400', async ({ request }) => {
    const res = await request.post('/api/assistant', { data: { message: 'a'.repeat(2001) } });
    expect(res.status()).toBe(400);
  });

  test('POST không có key: trả báo cáo theo quy tắc, không lộ thông tin key', async ({ request }) => {
    const status = await (await request.get('/api/assistant')).json();
    const res = await request.post('/api/assistant', { data: { message: 'App đang ở giai đoạn nào?' } });
    const text = await res.text();
    if (status.aiEnabled) {
      // Có key: trả lời bằng AI, hoặc 502 nếu gọi thất bại. Không được trả 500.
      expect([200, 502]).toContain(res.status());
    } else {
      expect(res.status()).toBe(200);
      const body = JSON.parse(text);
      expect(body.aiEnabled).toBe(false);
      expect(body.reply).toContain('Giai đoạn hiện tại');
    }
    expect(text).not.toMatch(/sk-[A-Za-z0-9]/);
  });
});

test.describe('UI: trợ lý QA', () => {
  test('hiển thị báo cáo và gửi được tin nhắn', async ({ page }) => {
    await page.goto('/#/assistant');
    await expect(page.getByRole('heading', { level: 1, name: 'Trợ lý QA' })).toBeVisible();
    await expect(page.locator('#assistant-report')).toBeVisible();

    await page.getByLabel('Thông tin hoặc câu hỏi', { exact: true }).fill('Còn thiếu gì?');
    await page.getByRole('button', { name: 'Gửi' }).click();

    const log = page.getByRole('log', { name: 'Hội thoại với trợ lý' });
    await expect(log.locator('.msg-user .msg-text')).toHaveText('Còn thiếu gì?');
    await expect(log.locator('.msg-bot')).toBeVisible({ timeout: 25000 });
  });

  test('gửi rỗng hiện thông báo và không thêm tin nhắn', async ({ page }) => {
    await page.goto('/#/assistant');
    await page.getByRole('button', { name: 'Gửi' }).click();
    await expect(page.getByRole('alert').filter({ hasText: 'Nhập nội dung' })).toBeVisible();
    await expect(page.locator('.msg')).toHaveCount(0);
  });
});
