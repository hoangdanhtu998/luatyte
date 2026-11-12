import { test, expect } from '@playwright/test';

const uniqueTitle = (label) => `${label} ${Date.now()} ${Math.random().toString(36).slice(2, 6)}`;

test.describe('Chức năng: Test case', () => {
  test('tạo test case hợp lệ và thấy trong danh sách', async ({ page }) => {
    const title = uniqueTitle('Kiểm thử đăng nhập');
    await page.goto('/#/testcases');
    await page.getByLabel('Tiêu đề').fill(title);
    await page.getByLabel('Module').fill('Auth');
    await page.getByLabel('Ưu tiên').selectOption('high');
    await page.getByRole('button', { name: 'Thêm test case' }).click();

    await expect(page.getByRole('status').filter({ hasText: 'Đã thêm TC-' })).toBeVisible();
    await expect(page.getByRole('cell', { name: title })).toBeVisible();
  });

  test('tiêu đề rỗng bị từ chối, hiện lỗi và không tạo mới', async ({ page }) => {
    await page.goto('/#/testcases');
    const before = await page.request.get('/api/testcases');
    const countBefore = (await before.json()).total;

    await page.getByRole('button', { name: 'Thêm test case' }).click();

    await expect(page.getByRole('alert').filter({ hasText: 'Vui lòng sửa' })).toBeVisible();
    await expect(page.getByLabel('Tiêu đề')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('#tc-title-error')).toHaveText('Tiêu đề cần ít nhất 3 ký tự');

    const after = await page.request.get('/api/testcases');
    expect((await after.json()).total).toBe(countBefore);
  });

  test('tiêu đề trên 200 ký tự bị từ chối', async ({ page }) => {
    await page.goto('/#/testcases');
    await page.getByLabel('Tiêu đề').fill('a'.repeat(201));
    await page.getByRole('button', { name: 'Thêm test case' }).click();
    await expect(page.locator('#tc-title-error')).toHaveText('Tiêu đề tối đa 200 ký tự');
  });

  test('lọc theo trạng thái chỉ hiện đúng các test case có trạng thái đó', async ({ page }) => {
    await page.goto('/#/testcases');
    await page.getByLabel('Lọc theo trạng thái').selectOption('draft');

    const rows = page.locator('#tc-table tbody tr');
    await expect(rows.first()).toBeVisible();
    const count = await rows.count();
    for (let i = 0; i < count; i += 1) {
      await expect(rows.nth(i).getByRole('combobox', { name: /^Trạng thái TC-/ })).toHaveValue('draft');
    }
  });

  test('tìm kiếm theo từ khóa lọc được danh sách', async ({ page }) => {
    await page.goto('/#/testcases');
    await page.getByLabel('Tìm kiếm').fill('XSS');
    await expect(page.getByRole('cell', { name: /Payload XSS/ })).toBeVisible();
    await expect(page.getByRole('cell', { name: /Health endpoint/ })).toHaveCount(0);
  });

  test('đổi trạng thái test case và dữ liệu được lưu sau khi tải lại', async ({ page }) => {
    await page.goto('/#/testcases');
    const select = page.getByRole('combobox', { name: 'Trạng thái TC-008' });
    await select.selectOption('ready');
    await expect(page.getByRole('status').filter({ hasText: 'TC-008 đã đổi sang Sẵn sàng' })).toBeVisible();

    await page.reload();
    await expect(page.getByRole('combobox', { name: 'Trạng thái TC-008' })).toHaveValue('ready');
  });
});

test.describe('Chức năng: Bug', () => {
  test('báo bug hợp lệ và thấy trong danh sách', async ({ page }) => {
    const title = uniqueTitle('Bug nút lưu');
    await page.goto('/#/bugs');
    await page.getByLabel('Tiêu đề bug').fill(title);
    await page.getByLabel('Mức độ').selectOption('critical');
    await page.getByLabel('Các bước tái hiện').fill('1. Mở form\n2. Bấm Lưu');
    await page.getByRole('button', { name: 'Báo bug' }).click();

    await expect(page.getByRole('cell', { name: title })).toBeVisible();
  });

  test('tiêu đề bug quá ngắn bị từ chối', async ({ page }) => {
    await page.goto('/#/bugs');
    await page.getByLabel('Tiêu đề bug').fill('ab');
    await page.getByRole('button', { name: 'Báo bug' }).click();
    await expect(page.locator('#bug-title-error')).toHaveText('Tiêu đề bug cần ít nhất 5 ký tự');
  });
});

test.describe('Luồng ngắt giữa chừng', () => {
  test('dữ liệu đã lưu còn nguyên sau khi tải lại trang', async ({ page }) => {
    const title = uniqueTitle('Ngắt giữa chừng');
    await page.goto('/#/testcases');
    await page.getByLabel('Tiêu đề').fill(title);
    await page.getByRole('button', { name: 'Thêm test case' }).click();
    await expect(page.getByRole('cell', { name: title })).toBeVisible();

    await page.reload();
    await expect(page.getByRole('cell', { name: title })).toBeVisible();
  });
});
