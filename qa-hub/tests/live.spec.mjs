import { test, expect } from '@playwright/test';
import { parseReporterLine, createLiveTracker } from '../lib/live.js';

test.describe('Theo dõi bộ test đang chạy', () => {
  test('nhận diện dòng ok, x, - và bỏ qua dòng khác', () => {
    expect(parseReporterLine('  ok 12 [chromium] › tests\\functional.spec.mjs:10:3 › Chức năng › tạo test case (30ms)'))
      .toEqual({ status: 'pass', title: 'Chức năng › tạo test case' });
    expect(parseReporterLine('  x   3 [chromium] › tests\\bugs.spec.mjs:5:3 › Bug › báo bug (1.2s)'))
      .toEqual({ status: 'fail', title: 'Bug › báo bug' });
    expect(parseReporterLine('  -   4 [chromium] › tests\\a11y.spec.mjs:9:3 › chưa làm')?.status).toBe('skip');
    expect(parseReporterLine('Running 110 tests using 4 workers')).toBe(null);
    expect(parseReporterLine('')).toBe(null);
  });

  test('tracker cho biết đã xong bao nhiêu % và test nào đang/vừa chạy', () => {
    const tracker = createLiveTracker();
    tracker.start(4);
    tracker.push('  ok 1 [chromium] › tests\\a.spec.mjs:1:1 › A › một (5ms)');
    tracker.push('  x 2 [chromium] › tests\\a.spec.mjs:2:1 › A › hai (5ms)');
    const mid = tracker.snapshot();
    expect(mid.running).toBe(true);
    expect(mid.done).toBe(2);
    expect(mid.percent).toBe(50);
    expect(mid.current).toBe('A › hai');
    expect(mid.failed).toBe(1);
    tracker.finish();
    expect(tracker.snapshot().running).toBe(false);
    expect(tracker.snapshot().current).toBe(null);
  });

  test('không biết tổng số thì phần trăm là 0 và vẫn đếm được', () => {
    const tracker = createLiveTracker();
    tracker.start(0);
    tracker.push('  ok 1 [chromium] › tests\\a.spec.mjs:1:1 › A › một (5ms)');
    expect(tracker.snapshot().percent).toBe(0);
    expect(tracker.snapshot().done).toBe(1);
  });
});
