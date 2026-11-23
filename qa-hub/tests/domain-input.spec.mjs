import { test, expect } from '@playwright/test';
import { normalizeDomainRef, validateProject } from '../lib/projects.js';

test.describe('Nhập domain không cần https', () => {
  test('tự thêm https:// khi người dùng chỉ nhập tên miền', () => {
    expect(normalizeDomainRef('luatyte.online')).toBe('https://luatyte.online');
    expect(normalizeDomainRef('  luatyte.online  ')).toBe('https://luatyte.online');
  });

  test('http:// được đưa về https://, https:// giữ nguyên', () => {
    expect(normalizeDomainRef('http://luatyte.online/')).toBe('https://luatyte.online/');
    expect(normalizeDomainRef('https://luatyte.online')).toBe('https://luatyte.online');
  });

  test('dự án domain lưu đúng dạng https và vẫn cần xác nhận quyền', () => {
    const ok = validateProject({ name: 'Luật y tế', sourceType: 'domain', sourceRef: 'luatyte.online', ownershipConfirmed: true });
    expect(ok.ok).toBe(true);
    expect(ok.value.sourceRef).toBe('https://luatyte.online');
    const noOwner = validateProject({ name: 'Luật y tế', sourceType: 'domain', sourceRef: 'luatyte.online', ownershipConfirmed: false });
    expect(noOwner.ok).toBe(false);
  });

  test('tên miền sai vẫn bị từ chối', () => {
    const bad = validateProject({ name: 'Sai', sourceType: 'domain', sourceRef: 'localhost', ownershipConfirmed: true });
    expect(bad.ok).toBe(false);
    expect(bad.errors.sourceRef).toContain('luatyte.online');
  });
});
