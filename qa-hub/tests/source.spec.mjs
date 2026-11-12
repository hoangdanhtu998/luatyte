import { test, expect } from '@playwright/test';
import { crc32 } from 'node:zlib';
import { existsSync } from 'node:fs';
import path from 'node:path';

const uniq = (label) => `${label} ${Date.now()}${Math.floor(Math.random() * 1000)}`;

// Tạo file zip không nén (store) để test không cần công cụ ngoài.
function buildZip(entries) {
  const locals = [];
  const centrals = [];
  let pos = 0;
  for (const { name, data } of entries) {
    const nameBuf = Buffer.from(name, 'utf8');
    const crc = crc32(data);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(data.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(nameBuf.length, 26);
    locals.push(local, nameBuf, data);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(data.length, 20);
    central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(nameBuf.length, 28);
    central.writeUInt32LE(pos, 42);
    centrals.push(central, nameBuf);
    pos += local.length + nameBuf.length + data.length;
  }
  const body = Buffer.concat(locals);
  const cd = Buffer.concat(centrals);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(entries.length, 8);
  eocd.writeUInt16LE(entries.length, 10);
  eocd.writeUInt32LE(cd.length, 12);
  eocd.writeUInt32LE(body.length, 16);
  return Buffer.concat([body, cd, eocd]);
}

const SAMPLE = buildZip([
  { name: 'demo/README.md', data: Buffer.from('# Demo\nDự án mẫu để kiểm thử.') },
  { name: 'demo/package.json', data: Buffer.from('{"name":"demo","scripts":{"test":"node --test"}}') },
  { name: 'demo/tests/login.spec.mjs', data: Buffer.from("import { test } from '@playwright/test';\ntest('x', () => {});") },
]);

async function createZipProject(request) {
  const res = await request.post('/api/projects', { data: { name: uniq('Dự án zip'), sourceType: 'zip' } });
  return (await res.json()).id;
}

async function upload(request, id, buffer, fileName = 'demo.zip') {
  return request.post(`/api/projects/${id}/upload`, {
    headers: { 'Content-Type': 'application/zip', 'X-File-Name': encodeURIComponent(fileName) },
    data: buffer,
  });
}

test.describe('Upload file zip', () => {
  test('upload zip hợp lệ: giải nén, đánh dấu bước lấy mã và ghi tên file', async ({ request }) => {
    const id = await createZipProject(request);
    const res = await upload(request, id, SAMPLE, 'Demo Project.zip');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.workflow.clone).toBe(true);
    expect(body.sourceRef).toBe('Demo_Project.zip');
    expect(body.localPath).toContain(id);
  });

  test('file .env trong zip không được giải nén lên máy chủ', async ({ request }) => {
    const id = await createZipProject(request);
    const withEnv = buildZip([
      { name: 'app/README.md', data: Buffer.from('# App') },
      { name: 'app/.env', data: Buffer.from('API_KEY=sk-abcdefghijklmnopqrstuv') },
    ]);
    const uploaded = await upload(request, id, withEnv);
    expect(uploaded.status()).toBe(200);
    const { localPath } = await uploaded.json();
    expect(existsSync(path.join(localPath, 'app', 'README.md'))).toBe(true);
    expect(existsSync(path.join(localPath, 'app', '.env'))).toBe(false);
  });

  test('zip có đường dẫn trỏ ra ngoài (zip slip) bị từ chối', async ({ request }) => {
    const id = await createZipProject(request);
    const evil = buildZip([{ name: '../evil.txt', data: Buffer.from('x') }]);
    const res = await upload(request, id, evil);
    expect(res.status()).toBe(400);
    expect((await res.json()).error).toContain('trỏ ra ngoài');
  });

  test('upload vào dự án không phải zip bị từ chối', async ({ request }) => {
    const created = await (await request.post('/api/projects', {
      data: { name: uniq('Dự án nhập tay'), sourceType: 'manual' },
    })).json();
    const res = await upload(request, created.id, SAMPLE);
    expect(res.status()).toBe(400);
  });

  test('file không phải zip hợp lệ bị từ chối', async ({ request }) => {
    const id = await createZipProject(request);
    const res = await upload(request, id, Buffer.from('không phải zip'));
    expect(res.status()).toBe(400);
  });
});

test.describe('AI đọc mã và checklist theo dự án', () => {
  test('gợi ý luật có bằng chứng là file thật, áp dụng ghi vào checklist của dự án', async ({ request }) => {
    const id = await createZipProject(request);
    expect((await upload(request, id, SAMPLE)).status()).toBe(200);

    const review = await request.post(`/api/projects/${id}/ai-review`, { data: { consent: true } });
    // Có API key trên máy: server yêu cầu đồng ý gửi mã. Không có key: chạy luật dự phòng.
    if (review.status() === 400) {
      expect((await review.json()).details.consent).toBeTruthy();
      return;
    }
    expect(review.status()).toBe(200);
    const body = await review.json();
    expect(['rules', 'ai']).toContain(body.checklistAi.mode);
    for (const s of body.checklistAi.suggestions.filter((x) => x.done)) {
      expect(s.evidence).toBeTruthy();
      expect(s.evidence.length).toBeGreaterThan(0);
    }

    const ids = body.checklistAi.suggestions.filter((x) => x.done).map((x) => x.id);
    if (ids.length > 0) {
      const applied = await request.post(`/api/projects/${id}/ai-review/apply`, { data: { ids } });
      expect(applied.status()).toBe(200);
      const list = await (await request.get(`/api/projects/${id}/checklist`)).json();
      expect(list.done).toBe(ids.length);
    }
  });

  test('tick checklist của dự án không ảnh hưởng dự án khác', async ({ request }) => {
    const a = await createZipProject(request);
    const b = await createZipProject(request);
    const res = await request.patch(`/api/projects/${a}/checklist/CL-05`, { data: { done: true } });
    expect(res.status()).toBe(200);
    const listA = await (await request.get(`/api/projects/${a}/checklist`)).json();
    const listB = await (await request.get(`/api/projects/${b}/checklist`)).json();
    expect(listA.items.find((i) => i.id === 'CL-05').done).toBe(true);
    expect(listB.items.find((i) => i.id === 'CL-05').done).toBe(false);
  });

  test('ai-review không có mã nguồn trả 409', async ({ request }) => {
    const id = await createZipProject(request);
    const res = await request.post(`/api/projects/${id}/ai-review`, { data: { consent: true } });
    expect([409, 400]).toContain(res.status());
  });
});

test.describe('Quét domain', () => {
  test('không quét địa chỉ nội bộ (127.0.0.1) dù đã xác nhận quyền', async ({ request }) => {
    const created = await request.post('/api/projects', {
      data: { name: uniq('Site nội bộ'), sourceType: 'domain', sourceRef: 'https://127.0.0.1', ownershipConfirmed: true },
    });
    expect(created.status()).toBe(201);
    const id = (await created.json()).id;
    const res = await request.post(`/api/projects/${id}/scan`);
    expect(res.status()).toBe(400);
    expect((await res.json()).error).toContain('nội bộ');
  });

  test('chỉ quét dự án domain, dự án khác bị từ chối', async ({ request }) => {
    const id = await createZipProject(request);
    expect((await request.post(`/api/projects/${id}/scan`)).status()).toBe(400);
  });
});

test.describe('Phạm vi theo dự án', () => {
  test('tổng kết và trợ lý đọc đúng dự án được chọn', async ({ request }) => {
    const id = await createZipProject(request);
    const summary = await (await request.get(`/api/summary?projectId=${id}`)).json();
    expect(summary.execution.total).toBe(0);

    const stlc = await (await request.get(`/api/stlc?projectId=${id}`)).json();
    expect(stlc.projectId).toBe(id);
    expect(stlc.phases).toHaveLength(7);

    const assistant = await (await request.get(`/api/assistant?projectId=${id}`)).json();
    expect(assistant.projectId).toBe(id);
  });

  test('projectId không tồn tại trên tổng kết bị từ chối', async ({ request }) => {
    expect((await request.get('/api/summary?projectId=PRJ-999')).status()).toBe(400);
  });
});

test.describe('UI: trang dự án nguồn zip và domain', () => {
  test('trang dự án zip có nút upload', async ({ page, request }) => {
    const id = await createZipProject(request);
    await page.goto(`/#/projects/${id}`);
    await expect(page.getByRole('button', { name: 'Upload và giải nén' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'AI đọc mã và gợi ý' })).toBeVisible();
  });
});
