import { test, expect } from '@playwright/test';
import { redact, validateSuggestions, parseJsonArray } from '../lib/code-review.js';
import { isPrivateAddress } from '../lib/domain-scan.js';
import { safeEntryName } from '../lib/zip.js';

test.describe('Che bí mật trước khi gửi mã', () => {
  test('ẩn API key, mã AKIA và mật khẩu gán trong mã', () => {
    const text = [
      'const k = "sk-abcdefghijklmnopqrstuvwx";',
      'const aws = "AKIAABCDEFGHIJKLMNOP";',
      'password = "hunter2hunter2"',
      'const ok = "không có bí mật";',
    ].join('\n');
    const out = redact(text);
    expect(out).not.toContain('sk-abcdefghijklmnop');
    expect(out).not.toContain('AKIAABCDEFGHIJKLMNOP');
    expect(out).not.toContain('hunter2');
    expect(out).toContain('không có bí mật');
  });
});

test.describe('Lọc gợi ý AI', () => {
  const items = [{ id: 'CL-01', text: 'Đã đọc tài liệu' }, { id: 'CL-14', text: 'Đã viết test' }];
  const tree = ['README.md', 'tests/a.spec.mjs'];

  test('gợi ý "đã làm" không có file bằng chứng thật bị hạ xuống chưa làm', () => {
    const out = validateSuggestions([
      { id: 'CL-01', done: true, evidence: 'README.md', reason: 'có README' },
      { id: 'CL-14', done: true, evidence: 'không-tồn-tại.js', reason: 'bịa' },
    ], items, tree);
    expect(out[0]).toMatchObject({ id: 'CL-01', done: true, evidence: 'README.md' });
    expect(out[1]).toMatchObject({ id: 'CL-14', done: false, evidence: null });
  });

  test('mục không có trong checklist bị bỏ qua', () => {
    const out = validateSuggestions([{ id: 'CL-99', done: true, evidence: 'README.md' }], items, tree);
    expect(out).toHaveLength(0);
  });

  test('đọc được JSON trong phản hồi có chữ bao quanh', () => {
    const parsed = parseJsonArray('Kết quả:\n```json\n[{"id":"CL-01","done":true}]\n```');
    expect(parsed[0].id).toBe('CL-01');
  });
});

test.describe('Chặn địa chỉ nội bộ (SSRF)', () => {
  test('nhận diện IP nội bộ và công khai', () => {
    for (const ip of ['10.1.2.3', '127.0.0.1', '192.168.0.5', '172.20.1.1', '169.254.1.1', '::1', 'fd00::1', 'fe80::1', '::ffff:127.0.0.1']) {
      expect(isPrivateAddress(ip), ip).toBe(true);
    }
    for (const ip of ['8.8.8.8', '1.1.1.1', '2606:4700::1111']) {
      expect(isPrivateAddress(ip), ip).toBe(false);
    }
  });
});

test.describe('Đường dẫn trong zip', () => {
  test('chấp nhận đường dẫn tương đối, chặn đường dẫn trỏ ra ngoài và tuyệt đối', () => {
    expect(safeEntryName('app/src/index.js')).toBe('app/src/index.js');
    expect(safeEntryName('app\\src\\a.js')).toBe('app/src/a.js');
    expect(() => safeEntryName('../x')).toThrow();
    expect(() => safeEntryName('/etc/passwd')).toThrow();
    expect(() => safeEntryName('C:/Windows/x')).toThrow();
  });
});
