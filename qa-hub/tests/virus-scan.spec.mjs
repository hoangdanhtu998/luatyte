import { test, expect } from '@playwright/test';
import { findDefenderCli, scanForThreats } from '../lib/virus-scan.js';

test.describe('Quét virus bằng Microsoft Defender', () => {
  test('tìm thấy MpCmdRun.exe ở đường dẫn chuẩn', () => {
    const cli = findDefenderCli((p) => p.endsWith('MpCmdRun.exe'));
    expect(cli.endsWith('MpCmdRun.exe')).toBe(true);
  });

  test('không có Defender thì trả null', () => {
    expect(findDefenderCli(() => false, () => [])).toBe(null);
  });

  test('mã thoát 0 là sạch', async () => {
    const result = await scanForThreats('/tmp/x', {
      cli: 'MpCmdRun.exe',
      execFileImpl: (cmd, args, opts, cb) => cb(null, 'ok', ''),
    });
    expect(result.status).toBe('clean');
  });

  test('mã thoát 2 là có mối đe dọa', async () => {
    const result = await scanForThreats('/tmp/x', {
      cli: 'MpCmdRun.exe',
      execFileImpl: (cmd, args, opts, cb) => cb(Object.assign(new Error('x'), { code: 2 }), 'threat', ''),
    });
    expect(result.status).toBe('threat');
  });

  test('mã thoát khác là lỗi, không coi là sạch', async () => {
    const result = await scanForThreats('/tmp/x', {
      cli: 'MpCmdRun.exe',
      execFileImpl: (cmd, args, opts, cb) => cb(Object.assign(new Error('x'), { code: 1 }), 'loi', ''),
    });
    expect(result.status).toBe('error');
  });

  test('không có CLI thì báo unavailable', async () => {
    const result = await scanForThreats('/tmp/x', { cli: null });
    expect(result.status).toBe('unavailable');
  });
});
