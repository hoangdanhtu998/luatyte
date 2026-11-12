import { test, expect } from '@playwright/test';

const uniqueTitle = (label) => `${label} ${Date.now()} ${Math.random().toString(36).slice(2, 6)}`;

const validBug = (overrides = {}) => ({
  title: uniqueTitle('Bug vòng đời'),
  severity: 'major',
  priority: 'high',
  environment: 'QA',
  foundIn: 'test',
  ...overrides,
});

test.describe('API: kết quả test case và tham chiếu', () => {
  test('ghi kết quả tay bị từ chối 403, kết quả không đổi', async ({ request }) => {
    const findTc15 = async () => (await (await request.get('/api/testcases?q=TC-015')).json()).items.find((i) => i.id === 'TC-015');
    const before = await findTc15();
    const res = await request.patch('/api/testcases/TC-015', { data: { result: 'pass', evidence: 'Đã xem danh sách review' } });
    expect(res.status()).toBe(403);
    expect((await findTc15()).result).toBe(before.result);
  });

  test('kết quả giả do người gửi cũng bị từ chối 403', async ({ request }) => {
    const res = await request.patch('/api/testcases/TC-015', { data: { result: 'maybe' } });
    expect(res.status()).toBe(403);
  });

  test('gắn requirement không tồn tại bị từ chối', async ({ request }) => {
    const res = await request.post('/api/testcases', {
      data: { title: uniqueTitle('TC gắn REQ'), requirementId: 'REQ-99' },
    });
    expect(res.status()).toBe(400);
    expect((await res.json()).details.requirementId).toContain('REQ-99');
  });

  test('kiểu test không hợp lệ bị từ chối', async ({ request }) => {
    const res = await request.post('/api/testcases', { data: { title: uniqueTitle('TC kiểu sai'), testType: 'magic' } });
    expect(res.status()).toBe(400);
    expect((await res.json()).details.testType).toBeTruthy();
  });

  test('test case mới có kết quả mặc định Chưa chạy', async ({ request }) => {
    const res = await request.post('/api/testcases', {
      data: { title: uniqueTitle('TC mới'), requirementId: 'REQ-01', suiteId: 'TS-01', expected: 'Hiển thị trong danh sách' },
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.result).toBe('not_run');
    expect(body.requirementIds).toEqual(['REQ-01']);
  });

  test('test case lưu điều kiện tiên quyết, các bước và dữ liệu test', async ({ request }) => {
    const res = await request.post('/api/testcases', {
      data: {
        title: uniqueTitle('TC đầy đủ thiết kế'),
        preconditions: 'Đã mở trang Test case',
        steps: '1. Nhập tiêu đề\n2. Bấm Thêm',
        testData: 'Tiêu đề: Kiểm thử đăng nhập',
      },
    });
    expect(res.status()).toBe(201);
    expect(await res.json()).toMatchObject({
      preconditions: 'Đã mở trang Test case',
      steps: '1. Nhập tiêu đề\n2. Bấm Thêm',
      testData: 'Tiêu đề: Kiểm thử đăng nhập',
    });
  });
});

test.describe('API: vòng đời bug', () => {
  test('bug mới có trạng thái Mới và các trường báo lỗi đầy đủ', async ({ request }) => {
    const res = await request.post('/api/bugs', { data: validBug({ buildVersion: '1.2.0', expected: 'Lưu thành công', actual: 'Không lưu' }) });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body).toMatchObject({ status: 'new', environment: 'QA', buildVersion: '1.2.0', expected: 'Lưu thành công' });

    const withEvidence = await request.post('/api/bugs', { data: validBug({ evidence: 'Ảnh chụp màn hình lỗi, log console' }) });
    expect((await withEvidence.json()).evidence).toBe('Ảnh chụp màn hình lỗi, log console');
  });

  test('môi trường không hợp lệ bị từ chối', async ({ request }) => {
    const res = await request.post('/api/bugs', { data: validBug({ environment: 'LOCAL' }) });
    expect(res.status()).toBe(400);
    expect((await res.json()).details.environment).toBeTruthy();
  });

  test('chuyển đúng luồng tới Đã đóng và ghi thời điểm đóng', async ({ request }) => {
    const bug = await (await request.post('/api/bugs', { data: validBug() })).json();
    const steps = ['assigned', 'in_progress', 'fixed', 'retest', 'verified', 'closed'];
    let last;
    for (const status of steps) {
      const res = await request.patch(`/api/bugs/${bug.id}`, { data: { status } });
      expect(res.status(), status).toBe(200);
      last = await res.json();
    }
    expect(last.status).toBe('closed');
    expect(last.closedAt).toBeTruthy();
  });

  test('chuyển trái luồng bị chặn với 409 và trạng thái giữ nguyên', async ({ request }) => {
    const bug = await (await request.post('/api/bugs', { data: validBug() })).json();
    const res = await request.patch(`/api/bugs/${bug.id}`, { data: { status: 'closed' } });
    expect(res.status()).toBe(409);
    expect((await res.json()).details.status).toContain('assigned');

    const current = await (await request.get('/api/bugs')).json();
    expect(current.items.find((item) => item.id === bug.id).status).toBe('new');
  });

  test('bug không tồn tại trả 404 khi cập nhật', async ({ request }) => {
    const res = await request.patch('/api/bugs/BUG-999', { data: { status: 'assigned' } });
    expect(res.status()).toBe(404);
  });

  test('danh sách bug trả kèm bảng chuyển trạng thái', async ({ request }) => {
    const body = await (await request.get('/api/bugs')).json();
    expect(body.transitions.new).toEqual(['assigned', 'rejected', 'duplicate', 'deferred']);
    expect(body.transitions.closed).toEqual([]);
  });
});

test.describe('API: review, checklist, tổng kết, STLC, kế hoạch', () => {
  test('review thiếu đối tượng bị từ chối, review hợp lệ được lưu', async ({ request }) => {
    const bad = await request.post('/api/reviews', { data: { target: 'unknown', targetRef: 'SRS', findings: 'Thiếu REQ-05' } });
    expect(bad.status()).toBe(400);
    expect((await bad.json()).details.target).toBeTruthy();

    const ok = await request.post('/api/reviews', { data: { target: 'requirement', targetRef: 'SRS v1', findings: 'Thiếu tiêu chí chấp nhận cho REQ-05' } });
    expect(ok.status()).toBe(201);
    const list = await (await request.get('/api/reviews')).json();
    expect(list.items.some((item) => item.targetRef === 'SRS v1')).toBe(true);
  });

  test('checklist có đủ 36 mục STLC + 56 mục web và cập nhật được trạng thái', async ({ request }) => {
    const list = await (await request.get('/api/checklist')).json();
    expect(list.total).toBe(92);

    const res = await request.patch('/api/checklist/CL-01', { data: { done: true } });
    expect(res.status()).toBe(200);
    expect((await (await request.get('/api/checklist')).json()).done).toBeGreaterThanOrEqual(1);

    expect((await request.patch('/api/checklist/CL-01', { data: { done: 'yes' } })).status()).toBe(400);
    expect((await request.patch('/api/checklist/CL-99', { data: { done: true } })).status()).toBe(404);
  });

  test('tổng kết chưa đủ điều kiện bàn giao và có đủ 6 tiêu chí exit', async ({ request }) => {
    const s = await (await request.get('/api/summary')).json();
    expect(s.exitCriteria).toHaveLength(6);
    expect(s.readyForRelease).toBe(false);
    expect(s.requirements.total).toBe(12);
    expect(s.requirements.percent).toBe(100);
    expect(s.exitCriteria.filter((item) => !item.ok).every((item) => item.action)).toBe(true);
  });

  test('STLC có đủ 7 giai đoạn theo ISTQB', async ({ request }) => {
    const { phases } = await (await request.get('/api/stlc')).json();
    expect(phases.map((phase) => phase.name)).toEqual([
      'Phân tích yêu cầu', 'Lập kế hoạch kiểm thử', 'Thiết kế kiểm thử', 'Chuẩn bị môi trường',
      'Chuẩn bị thực thi', 'Thực thi kiểm thử', 'Hoàn tất kiểm thử',
    ]);
  });

  test('kế hoạch có scope, entry/exit criteria, cấp độ, rủi ro', async ({ request }) => {
    const plan = await (await request.get('/api/plan')).json();
    expect(plan.scope.length).toBeGreaterThan(0);
    expect(plan.entryCriteria.length).toBeGreaterThan(0);
    expect(plan.exitCriteria.length).toBeGreaterThan(0);
    expect(plan.testLevels).toHaveLength(5);
    expect(plan.risks.every((risk) => risk.likelihood * risk.impact > 0)).toBe(true);
  });
});

test.describe('UI: các trang mới', () => {
  test('trang Kế hoạch hiển thị và ghi nhận review qua form', async ({ page }) => {
    const findings = uniqueTitle('Thiếu tiêu chí cho REQ-05');
    await page.goto('/#/plan');
    await expect(page.getByRole('heading', { level: 1, name: 'Kế hoạch và review' })).toBeVisible();
    await page.getByLabel('Tên tài liệu hoặc mã').fill('Use case báo bug');
    await page.getByLabel('Ghi nhận', { exact: true }).fill(findings);
    await page.getByRole('button', { name: 'Ghi nhận review' }).click();
    await expect(page.getByRole('cell', { name: findings })).toBeVisible();
  });

  test('trang Tổng kết báo chưa đủ điều kiện bàn giao', async ({ page }) => {
    await page.goto('/#/summary');
    await expect(page.getByRole('heading', { level: 1, name: 'Tổng kết kiểm thử' })).toBeVisible();
    await expect(page.getByText('Chưa đủ điều kiện bàn giao')).toBeVisible();
    await expect(page.getByRole('table', { name: 'Exit criteria' })).toBeVisible();
  });

  test('đổi trạng thái bug trên giao diện và thấy thông báo', async ({ page, request }) => {
    const bug = await (await request.post('/api/bugs', { data: validBug({ title: uniqueTitle('Bug UI') }) })).json();
    await page.goto('/#/bugs');
    const select = page.getByRole('combobox', { name: `Trạng thái ${bug.id}` });
    await select.selectOption('assigned');
    await expect(page.getByRole('status').filter({ hasText: `${bug.id} đã chuyển sang Đã giao` })).toBeVisible();
  });

  test('form bug có đủ trường môi trường, phiên bản build và kết quả mong đợi', async ({ page }) => {
    await page.goto('/#/bugs');
    for (const label of ['Môi trường', 'Phiên bản build', 'Tìm thấy ở', 'Điều kiện tiên quyết', 'Kết quả mong đợi', 'Kết quả thực tế', 'Người xử lý', 'Ưu tiên sửa']) {
      await expect(page.getByLabel(label)).toBeVisible();
    }
  });

  test('tick checklist và trạng thái được giữ sau khi tải lại', async ({ page }) => {
    await page.goto('/#/checklist');
    const box = page.getByLabel('Đã lập Test Plan');
    await box.check();
    await expect(page.getByRole('status').filter({ hasText: 'đã xong' })).toBeVisible();
    await page.reload();
    await expect(page.getByLabel('Đã lập Test Plan')).toBeChecked();
  });
});
