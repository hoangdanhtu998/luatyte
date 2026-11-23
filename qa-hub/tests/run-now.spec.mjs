import { test, expect } from '@playwright/test';
import { runProjectPipeline } from '../lib/pipeline.js';

function depsWith(overrides = {}) {
  const calls = { tests: [], recorded: [] };
  const deps = {
    scanDomain: async () => ({ checks: [] }),
    saveScan: async () => {},
    exists: () => true,
    scanVirus: async () => ({ status: 'clean', detail: 'ok' }),
    collectFiles: () => ({ tree: ['package.json'], excerpts: [] }),
    suggest: async () => [],
    applyChecklist: async () => {},
    recordReport: async () => {},
    runTests: async (dir) => { calls.tests.push(dir); return { status: 'pass', detail: 'ok' }; },
    recordTests: async (id, status) => { calls.recorded.push({ id, status }); },
    ...overrides,
  };
  return { deps, calls };
}

// Dự án đã test gần đây và chưa bật tự động: bình thường sẽ bỏ qua bước test.
const recentProject = {
  id: 'PRJ-030',
  sourceType: 'zip',
  sourceRef: 'a.zip',
  localPath: '/tmp/a',
  autoTests: false,
  testedAt: new Date().toISOString(),
};

test.describe('Nút "Chạy từ A đến Z"', () => {
  test('không ép thì bỏ qua test khi dự án chưa bật tự động', async () => {
    const { deps, calls } = depsWith();
    const outcome = await runProjectPipeline(recentProject, deps);
    expect(calls.tests).toEqual([]);
    expect(outcome.steps.tests.skipped).toBe(true);
  });

  test('force chạy test ngay, bỏ qua cờ tự động và hạn 24 giờ', async () => {
    const { deps, calls } = depsWith();
    const outcome = await runProjectPipeline(recentProject, deps, { force: true });
    expect(calls.tests).toEqual(['/tmp/a']);
    expect(calls.recorded).toEqual([{ id: 'PRJ-030', status: 'pass' }]);
    expect(outcome.steps.tests.status).toBe('pass');
  });

  test('force vẫn dừng test nếu quét virus không sạch', async () => {
    const { deps, calls } = depsWith({
      scanVirus: async () => ({ status: 'threat', detail: 'Phát hiện mối đe dọa' }),
    });
    await runProjectPipeline(recentProject, deps, { force: true });
    expect(calls.tests).toEqual([]);
  });
});

test('trang Tổng có ô chọn dự án và nút Chạy từ A đến Z', async ({ page }) => {
  await page.goto('/#/tong');
  await expect(page.getByRole('heading', { name: 'Chạy dự án từ A đến Z' })).toBeVisible();
  await expect(page.getByLabel('Chọn dự án để chạy')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Chạy từ A đến Z' })).toBeVisible();
});
