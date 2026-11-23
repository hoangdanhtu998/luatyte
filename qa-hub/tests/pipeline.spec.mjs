import { test, expect } from '@playwright/test';
import { shouldScanDomain, hasLocalCode, runProjectPipeline } from '../lib/pipeline.js';

function fakeDeps(overrides = {}) {
  const calls = { scan: [], checklist: [], report: [] };
  const deps = {
    scanDomain: async (domain) => {
      calls.scan.push(domain);
      return { checks: [{ name: 'Trang chủ tải được', ok: true }] };
    },
    saveScan: async (id, scan, homeOk) => { calls.scanSaved = { id, homeOk }; },
    exists: () => true,
    scanVirus: async () => ({ status: 'clean', detail: 'Không phát hiện mối đe dọa' }),
    collectFiles: () => ({ tree: ['package.json'], excerpts: [] }),
    suggest: async () => [{ id: 'CL-01', done: true }, { id: 'CL-02', done: false }],
    applyChecklist: async (id, suggestions, doneIds) => { calls.checklist.push(doneIds); },
    recordReport: async (id) => { calls.report.push(id); },
    ...overrides,
  };
  return { deps, calls };
}

test.describe('Luồng tự động theo dự án', () => {
  test('domain đã xác nhận quyền được quét tự động và bật bước smoke', async () => {
    const { deps, calls } = fakeDeps();
    const project = { id: 'PRJ-010', sourceType: 'domain', sourceRef: 'https://example.com', ownershipConfirmed: true };
    const outcome = await runProjectPipeline(project, deps);
    expect(calls.scan).toEqual(['https://example.com']);
    expect(calls.scanSaved).toEqual({ id: 'PRJ-010', homeOk: true });
    expect(outcome.steps.domain.ok).toBe(true);
  });

  test('domain chưa xác nhận quyền không bị quét', async () => {
    const { deps, calls } = fakeDeps();
    const project = { id: 'PRJ-011', sourceType: 'domain', sourceRef: 'https://example.com', ownershipConfirmed: false };
    const outcome = await runProjectPipeline(project, deps);
    expect(calls.scan).toEqual([]);
    expect(outcome.steps.domain.skipped).toBe(true);
  });

  test('mã nguồn có trên máy được đọc và chỉ áp dụng các mục đã có bằng chứng', async () => {
    const { deps, calls } = fakeDeps();
    const project = { id: 'PRJ-012', sourceType: 'zip', sourceRef: 'a.zip', localPath: '/tmp/x' };
    const outcome = await runProjectPipeline(project, deps);
    expect(calls.checklist).toEqual([['CL-01']]);
    expect(outcome.steps.code.applied).toBe(1);
  });

  test('mỗi lần chạy đều ghi báo cáo, kể cả khi không có gì để làm', async () => {
    const { deps, calls } = fakeDeps();
    const project = { id: 'PRJ-013', sourceType: 'manual' };
    const outcome = await runProjectPipeline(project, deps);
    expect(calls.report).toEqual(['PRJ-013']);
    expect(outcome.steps.domain.skipped).toBe(true);
    expect(outcome.steps.code.skipped).toBe(true);
  });

  test('lỗi quét domain không làm dừng cả luồng', async () => {
    const { deps, calls } = fakeDeps({ scanDomain: async () => { throw new Error('timeout'); } });
    const project = { id: 'PRJ-014', sourceType: 'domain', sourceRef: 'https://example.com', ownershipConfirmed: true };
    const outcome = await runProjectPipeline(project, deps);
    expect(outcome.steps.domain).toEqual({ ok: false, error: 'timeout' });
    expect(calls.report).toEqual(['PRJ-014']);
  });

  test('helper: chỉ quét domain đã xác nhận và chỉ đọc mã có đường dẫn tồn tại', () => {
    expect(shouldScanDomain({ sourceType: 'domain', ownershipConfirmed: true })).toBe(true);
    expect(shouldScanDomain({ sourceType: 'zip', ownershipConfirmed: true })).toBe(false);
    expect(hasLocalCode({ sourceType: 'github', localPath: '/x' }, () => true)).toBe(true);
    expect(hasLocalCode({ sourceType: 'github', localPath: '/x' }, () => false)).toBe(false);
    expect(hasLocalCode({ sourceType: 'manual', localPath: '/x' }, () => true)).toBe(false);
  });
});

test.describe('API: luồng tự động theo dự án', () => {
  test('POST /api/projects/:id/auto chạy luồng và ghi báo cáo', async ({ request }) => {
    const response = await request.post('/api/projects/PRJ-001/auto');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.projectId).toBe('PRJ-001');
    expect(body.steps.report.ok).toBe(true);
    expect(body.steps.domain.skipped).toBe(true);
    expect(body.steps.code.skipped).toBe(true);
    const project = await (await request.get('/api/projects/PRJ-001')).json();
    expect(project.project.workflow.report).toBe(true);
  });

  test('dự án không tồn tại trả 404', async ({ request }) => {
    const response = await request.post('/api/projects/PRJ-999/auto');
    expect(response.status()).toBe(404);
  });
});

test.describe('Quét virus trước khi đọc mã', () => {
  test('mã có virus thì không đọc mã và báo lỗi ở bước quét', async () => {
    const { deps, calls } = fakeDeps({
      scanVirus: async () => ({ status: 'threat', detail: 'Phát hiện mối đe dọa, đã dừng luồng' }),
    });
    const project = { id: 'PRJ-020', sourceType: 'github', sourceRef: 'x', localPath: '/tmp/x' };
    const outcome = await runProjectPipeline(project, deps);
    expect(outcome.steps.scan.status).toBe('threat');
    expect(outcome.steps.code.skipped).toBe(true);
    expect(calls.checklist).toEqual([]);
    expect(calls.report).toEqual(['PRJ-020']);
  });

  test('không có công cụ quét thì cũng không đọc mã', async () => {
    const { deps, calls } = fakeDeps({
      scanVirus: async () => ({ status: 'unavailable', detail: 'Không tìm thấy Microsoft Defender' }),
    });
    const project = { id: 'PRJ-021', sourceType: 'zip', sourceRef: 'a.zip', localPath: '/tmp/y' };
    await runProjectPipeline(project, deps);
    expect(calls.checklist).toEqual([]);
  });

  test('bước quét đứng trước bước đọc mã trong luồng', async () => {
    const order = [];
    const { deps } = fakeDeps({
      scanVirus: async () => { order.push('scan'); return { status: 'clean', detail: 'ok' }; },
      collectFiles: () => { order.push('code'); return { tree: [], excerpts: [] }; },
    });
    await runProjectPipeline({ id: 'PRJ-022', sourceType: 'github', localPath: '/tmp/z' }, deps);
    expect(order).toEqual(['scan', 'code']);
  });
});
