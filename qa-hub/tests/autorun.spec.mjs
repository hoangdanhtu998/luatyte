import { test, expect } from '@playwright/test';
import { EventEmitter } from 'node:events';
import { fileURLToPath } from 'node:url';
import { createAutoRunner } from '../lib/autorun.js';

const ROOT = fileURLToPath(new URL('..', import.meta.url));

test.describe('Tự chạy bộ test (đơn vị, không gọi tiến trình thật)', () => {
  test('runNow ghi lịch sử khi tiến trình kết thúc, và không chạy chồng', () => {
    const child = new EventEmitter();
    const recorded = [];
    const runner = createAutoRunner({
      root: ROOT,
      resultsFile: '/khong-ton-tai/results.json',
      onFinish: (rec) => recorded.push(rec),
      spawnImpl: () => child,
    });

    expect(runner.runNow().started).toBe(true);
    expect(runner.runNow()).toEqual({ started: false, reason: 'Đang chạy' });
    expect(runner.status().running).toBe(true);

    child.emit('close', 0);
    expect(runner.status().running).toBe(false);
    expect(recorded).toHaveLength(1);
    expect(recorded[0].exitCode).toBe(0);
    expect(recorded[0].startedAt).toBeTruthy();
  });

  test('start và stop bật/tắt lịch, khoảng tối thiểu 5 phút', () => {
    const runner = createAutoRunner({ root: ROOT, resultsFile: '/x', spawnImpl: () => new EventEmitter() });
    expect(runner.start(1)).toBe(5);
    expect(runner.status(5).enabled).toBe(true);
    runner.stop();
    expect(runner.status(5).enabled).toBe(false);
  });
});

test.describe('API: tự chạy và giai đoạn tính từ dữ liệu thật', () => {
  test('GET /api/autorun trả trạng thái', async ({ request }) => {
    const body = await (await request.get('/api/autorun')).json();
    expect(typeof body.enabled).toBe('boolean');
    expect(typeof body.running).toBe('boolean');
  });

  test('giai đoạn 3 (môi trường) và 11 (CI) được tính từ file thật', async ({ request }) => {
    const { stages } = await (await request.get('/api/stages')).json();
    const s3 = stages.find((s) => s.id === 3);
    expect(s3.status).toBe('pass');
    const s11 = stages.find((s) => s.id === 11);
    expect(s11.note).toContain('GitHub Actions');
    const s10 = stages.find((s) => s.id === 10);
    expect(s10.note).toContain('trình duyệt');
  });
});
