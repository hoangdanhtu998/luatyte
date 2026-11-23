import { test, expect } from '@playwright/test';

test.describe('Header bảo mật', () => {
  test('trang chủ có CSP, nosniff, X-Frame-Options, Referrer-Policy', async ({ request }) => {
    const res = await request.get('/');
    const headers = res.headers();
    expect(headers['content-security-policy']).toContain("default-src 'self'");
    expect(headers['content-security-policy']).toContain("frame-ancestors 'none'");
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['x-frame-options']).toBe('DENY');
    expect(headers['referrer-policy']).toBe('no-referrer');
  });

  test('API không cache dữ liệu (Cache-Control: no-store)', async ({ request }) => {
    const res = await request.get('/api/stats');
    expect(res.headers()['cache-control']).toBe('no-store');
  });
});

test.describe('Xác thực đầu vào API', () => {
  test('JSON sai cú pháp trả 400', async ({ request }) => {
    const res = await request.post('/api/testcases', {
      headers: { 'Content-Type': 'application/json' },
      data: Buffer.from('{"title": '),
    });
    expect(res.status()).toBe(400);
    expect((await res.json()).error).toBe('JSON không hợp lệ');
  });

  test('gửi sai Content-Type trả 415', async ({ request }) => {
    const res = await request.post('/api/testcases', {
      headers: { 'Content-Type': 'text/plain' },
      data: 'hello',
    });
    expect(res.status()).toBe(415);
  });

  test('tiêu đề không hợp lệ trả 400 kèm chi tiết theo trường', async ({ request }) => {
    const res = await request.post('/api/testcases', { data: { title: '' } });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.details.title).toBeTruthy();
  });

  test('mức độ bug không hợp lệ bị từ chối', async ({ request }) => {
    const res = await request.post('/api/bugs', { data: { title: 'Bug thử nghiệm', severity: 'blocker' } });
    expect(res.status()).toBe(400);
    expect((await res.json()).details.severity).toBeTruthy();
  });

  test('PATCH với trạng thái lạ bị từ chối', async ({ request }) => {
    const res = await request.patch('/api/testcases/TC-001', { data: { status: 'deleted' } });
    expect(res.status()).toBe(400);
  });

  test('PATCH test case không tồn tại trả 404', async ({ request }) => {
    const res = await request.patch('/api/testcases/TC-999', { data: { status: 'ready' } });
    expect(res.status()).toBe(404);
  });

  test('lọc với status không hợp lệ trả 400', async ({ request }) => {
    const res = await request.get('/api/testcases?status=bogus');
    expect(res.status()).toBe(400);
  });
});

test.describe('Phương thức và đường dẫn', () => {
  test('API lạ trả 404 dạng JSON', async ({ request }) => {
    const res = await request.get('/api/khong-co');
    expect(res.status()).toBe(404);
    expect(res.headers()['content-type']).toContain('application/json');
  });

  test('sai method trả 405 kèm header Allow', async ({ request }) => {
    const res = await request.patch('/api/health');
    expect(res.status()).toBe(405);
    expect(res.headers()['allow']).toBe('GET');
  });

  test('không đọc được file ngoài thư mục public (path traversal)', async ({ request }) => {
    for (const path of ['/..%2Fserver.js', '/%2e%2e/package.json', '/..%5Cpackage.json']) {
      const res = await request.get(path);
      expect(res.status(), path).not.toBe(200);
      expect(await res.text(), path).not.toContain('"qa-hub"');
    }
  });
});

test.describe('XSS', () => {
  test('payload script trong tiêu đề được lưu nhưng hiển thị dạng chữ, không thực thi', async ({ page }) => {
    const payload = `<img src=x onerror="window.__xss=1">Payload ${Date.now()}`;
    let dialogFired = false;
    page.on('dialog', async (dialog) => {
      dialogFired = true;
      await dialog.dismiss();
    });

    await page.goto('/#/testcases');
    await page.getByLabel('Tiêu đề').fill(payload);
    await page.getByRole('button', { name: 'Thêm test case' }).click();

    const cell = page.getByRole('cell', { name: payload });
    await expect(cell).toBeVisible();
    expect(await page.evaluate(() => window.__xss)).toBeUndefined();
    expect(await cell.locator('img').count()).toBe(0);
    expect(dialogFired).toBe(false);
  });
});
