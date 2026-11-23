import { test, expect } from '@playwright/test';
import { newJob, setStep, summarize, percentComplete, currentStepKey } from '../lib/progress.js';

const DEFS = [
  { key: 'domain', label: 'Quét domain' },
  { key: 'code', label: 'Đọc mã và checklist' },
  { key: 'report', label: 'Ghi báo cáo' },
];

test.describe('Tiến độ lượt tự động', () => {
  test('job mới có mọi bước ở trạng thái chờ và 0%', () => {
    const job = newJob({ id: 'JOB-1', projectId: 'PRJ-001', stepDefs: DEFS, now: 'T0' });
    expect(job.steps.map((s) => s.status)).toEqual(['pending', 'pending', 'pending']);
    expect(summarize(job).percent).toBe(0);
    expect(summarize(job).current).toBe('domain');
  });

  test('bước xong hoặc bỏ qua được tính vào phần trăm, bước lỗi thì không', () => {
    let job = newJob({ id: 'JOB-2', projectId: 'PRJ-001', stepDefs: DEFS, now: 'T0' });
    job = setStep(job, 'domain', 'skipped');
    job = setStep(job, 'code', 'error', 'không đọc được mã');
    expect(percentComplete(job.steps)).toBe(33);
    job = setStep(job, 'report', 'done');
    expect(percentComplete(job.steps)).toBe(67);
  });

  test('bước hiện tại là bước đầu tiên chưa xong', () => {
    let job = newJob({ id: 'JOB-3', projectId: 'PRJ-001', stepDefs: DEFS, now: 'T0' });
    job = setStep(job, 'domain', 'done');
    job = setStep(job, 'code', 'running');
    expect(currentStepKey(job.steps)).toBe('code');
  });

  test('setStep không sửa job cũ', () => {
    const job = newJob({ id: 'JOB-4', projectId: 'PRJ-001', stepDefs: DEFS, now: 'T0' });
    setStep(job, 'domain', 'done');
    expect(job.steps[0].status).toBe('pending');
  });

  test('không có job thì tiến độ là idle', () => {
    expect(summarize(null)).toEqual({ state: 'idle', percent: 0, current: null, steps: [] });
  });
});

test.describe('API: tiến độ tự động', () => {
  test('sau khi chạy luồng, GET /api/progress báo xong 100% và bước báo cáo đã ghi', async ({ request }) => {
    const run = await request.post('/api/projects/PRJ-001/auto');
    expect(run.status()).toBe(200);
    const progress = await (await request.get('/api/progress')).json();
    expect(progress.state).toBe('done');
    expect(progress.projectId).toBe('PRJ-001');
    expect(progress.percent).toBe(100);
    expect(progress.steps.find((s) => s.key === 'report').status).toBe('done');
    expect(progress.current).toBe(null);
  });
});

test.describe('UI: bảng tiến độ bên phải', () => {
  test('hiện trên trang tổng quan và cập nhật sau khi chạy luồng', async ({ page, request }) => {
    await request.post('/api/projects/PRJ-001/auto');
    await page.goto('/#/overview');
    const panel = page.locator('#progress-panel');
    await expect(panel).toBeVisible();
    await expect(panel).toContainText('Tiến độ tự động');
    await expect(panel).toContainText('100%');
    await expect(panel.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
  });
});
