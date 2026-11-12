import { test, expect } from '@playwright/test';
import { validateTestCase } from '../lib/validate.js';
import { buildStlc } from '../lib/summary.js';

// BUG-003: độ dài tính theo ký tự (code point), không theo UTF-16.
test.describe('BUG-003: đếm độ dài tiêu đề có emoji', () => {
  test('tiêu đề 150 emoji (300 đơn vị UTF-16) được chấp nhận', () => {
    const result = validateTestCase({ title: '😀'.repeat(150), module: 'Chung' });
    expect(result.ok).toBe(true);
  });

  test('tiêu đề 201 emoji bị từ chối', () => {
    const result = validateTestCase({ title: '😀'.repeat(201), module: 'Chung' });
    expect(result.ok).toBe(false);
    expect(result.errors.title).toContain('200');
  });

  test('module 40 emoji (giới hạn 50 ký tự) được chấp nhận', () => {
    const result = validateTestCase({ title: 'Tiêu đề bình thường', module: '😀'.repeat(40) });
    expect(result.ok).toBe(true);
  });
});

// BUG-006: giai đoạn 2 (lập kế hoạch) phải phụ thuộc vào kế hoạch có thật.
test.describe('BUG-006: giai đoạn 2 STLC phụ thuộc kế hoạch thật', () => {
  const emptyInput = {
    testcases: [],
    requirements: [],
    suites: [],
    checklist: [],
    summary: { requirements: { covered: 0 }, exitCriteria: [], readyForRelease: false },
  };

  test('không có kế hoạch thì giai đoạn 2 không được báo pass', () => {
    const phases = buildStlc({ ...emptyInput, planReady: false });
    expect(phases.find((p) => p.id === 2).status).not.toBe('pass');
  });

  test('có kế hoạch thì giai đoạn 2 báo pass', () => {
    const phases = buildStlc({ ...emptyInput, planReady: true });
    expect(phases.find((p) => p.id === 2).status).toBe('pass');
  });
});

// BUG-004: PATCH gửi cả status và result phải cập nhật cả hai.
test.describe('BUG-004: PATCH test case gửi cả status và result', () => {
  test('cập nhật đồng thời status và result', async ({ request }) => {
    const created = await (await request.post('/api/testcases', {
      data: { title: 'PATCH status và result', module: 'Chung' },
    })).json();

    const response = await request.patch(`/api/testcases/${created.id}`, {
      data: { result: 'pass', status: 'passed', evidence: 'ảnh chụp' },
    });
    expect(response.status()).toBe(200);
    const updated = await response.json();
    expect(updated.result).toBe('pass');
    expect(updated.status).toBe('passed');
  });

  test('status không hợp lệ kèm result bị từ chối', async ({ request }) => {
    const created = await (await request.post('/api/testcases', {
      data: { title: 'PATCH status sai', module: 'Chung' },
    })).json();

    const response = await request.patch(`/api/testcases/${created.id}`, {
      data: { result: 'pass', status: 'sai' },
    });
    expect(response.status()).toBe(400);
  });
});
