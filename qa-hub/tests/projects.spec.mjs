import { test, expect } from '@playwright/test';

const uniq = (label) => `${label} ${Date.now()}${Math.floor(Math.random() * 1000)}`;

test.describe('API: dự án', () => {
  test('tạo dự án GitHub hợp lệ, bước nguồn được đánh dấu', async ({ request }) => {
    const res = await request.post('/api/projects', {
      data: { name: uniq('Repo mẫu'), sourceType: 'github', sourceRef: 'https://github.com/octocat/Hello-World' },
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.id).toMatch(/^PRJ-\d{3}$/);
    expect(body.workflow.source).toBe(true);
    expect(body.workflow.install).toBe(false);
  });

  test('link GitHub sai định dạng bị từ chối', async ({ request }) => {
    const res = await request.post('/api/projects', {
      data: { name: uniq('Repo sai'), sourceType: 'github', sourceRef: 'http://github.com/a' },
    });
    expect(res.status()).toBe(400);
    expect((await res.json()).details.sourceRef).toBeTruthy();
  });

  test('domain không có xác nhận quyền kiểm thử bị từ chối', async ({ request }) => {
    const res = await request.post('/api/projects', {
      data: { name: uniq('Site'), sourceType: 'domain', sourceRef: 'https://example.com' },
    });
    expect(res.status()).toBe(400);
    expect((await res.json()).details.ownershipConfirmed).toBeTruthy();
  });

  test('bước cài đặt của dự án bên ngoài cần xác nhận (409 nếu chưa)', async ({ request }) => {
    const project = await (await request.post('/api/projects', {
      data: { name: uniq('Repo cần xác nhận'), sourceType: 'github', sourceRef: 'https://github.com/octocat/Hello-World' },
    })).json();

    const blocked = await request.patch(`/api/projects/${project.id}/workflow/install`, { data: { done: true } });
    expect(blocked.status()).toBe(409);

    const ok = await request.patch(`/api/projects/${project.id}/workflow/install`, { data: { done: true, confirmed: true } });
    expect(ok.status()).toBe(200);
    expect((await ok.json()).workflow.install).toBe(true);
  });

  test('test case và bug được gắn đúng dự án', async ({ request }) => {
    const project = await (await request.post('/api/projects', {
      data: { name: uniq('Dự án riêng'), sourceType: 'manual' },
    })).json();
    const title = uniq('TC thuộc dự án riêng');
    const created = await request.post('/api/testcases', { data: { title, projectId: project.id } });
    expect(created.status()).toBe(201);

    const scoped = await (await request.get(`/api/testcases?projectId=${project.id}`)).json();
    expect(scoped.items.map((i) => i.title)).toContain(title);

    const defaults = await (await request.get('/api/testcases')).json();
    expect(defaults.items.map((i) => i.title)).not.toContain(title);

    const bug = await request.post('/api/bugs', { data: { title: uniq('Bug dự án riêng'), severity: 'minor', projectId: project.id } });
    expect(bug.status()).toBe(201);
    expect((await bug.json()).projectId).toBe(project.id);
  });

  test('projectId không tồn tại bị từ chối', async ({ request }) => {
    const res = await request.post('/api/testcases', { data: { title: uniq('TC lạc dự án'), projectId: 'PRJ-999' } });
    expect(res.status()).toBe(400);
    expect((await res.json()).details.projectId).toBeTruthy();
  });

  test('ghi lần chạy vào lịch sử và báo cáo có đủ dữ liệu', async ({ request }) => {
    const project = await (await request.post('/api/projects', {
      data: { name: uniq('Dự án có lịch sử'), sourceType: 'manual' },
    })).json();
    const run = await request.post(`/api/projects/${project.id}/runs`, { data: { note: 'Lần chạy thử' } });
    expect(run.status()).toBe(201);
    expect((await run.json()).snapshot.total).toBe(0);

    const report = await (await request.get(`/api/projects/${project.id}/report`)).json();
    expect(report.runs).toHaveLength(1);
    expect(report.steps.map((s) => s.key)).toEqual(['source', 'clone', 'install', 'smoke', 'tests', 'report']);
    expect(report.steps.find((s) => s.key === 'report').done).toBe(true);
    expect(report.summary.execution.total).toBe(0);
  });

  test('lấy mã nguồn chỉ áp dụng cho dự án GitHub', async ({ request }) => {
    const project = await (await request.post('/api/projects', {
      data: { name: uniq('Dự án nhập tay'), sourceType: 'manual' },
    })).json();
    const res = await request.post(`/api/projects/${project.id}/clone`);
    expect(res.status()).toBe(400);
  });

  test('dự án không tồn tại trả 404', async ({ request }) => {
    expect((await request.get('/api/projects/PRJ-999')).status()).toBe(404);
    expect((await request.get('/api/projects/PRJ-999/report')).status()).toBe(404);
  });
});

test.describe('UI: dự án', () => {
  test('tạo dự án trên giao diện rồi mở trang chi tiết', async ({ page }) => {
    const name = uniq('Dự án UI');
    await page.goto('/#/projects');
    await page.getByLabel('Tên dự án').fill(name);
    await page.getByRole('button', { name: 'Thêm dự án' }).click();
    await expect(page.getByRole('heading', { level: 1, name })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: 'Lịch sử' })).toBeVisible();
  });

  test('trang báo cáo in được có các mục 1 đến 7', async ({ page }) => {
    await page.goto('/#/projects/PRJ-001/report');
    await expect(page.getByRole('heading', { level: 1, name: /Báo cáo kiểm thử/ })).toBeVisible();
    for (const section of ['1. Thông tin chung', '3. Kết quả test case', '5. Lỗi phát hiện thêm', '7. Kết luận']) {
      await expect(page.getByRole('heading', { level: 2, name: section })).toBeVisible();
    }
    await expect(page.getByRole('button', { name: 'In báo cáo' })).toBeVisible();
  });
});
