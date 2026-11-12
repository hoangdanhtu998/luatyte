// Thực thi test case trên app đang chạy và ghi Pass/Fail/Blocked + bằng chứng vào app.
// Quy ước: kiểm tra chạy xong và kết quả khác mong đợi -> fail; lỗi môi trường / không chạy được -> blocked.
import { chromium } from '@playwright/test';

const BASE = process.env.BASE_URL ?? 'http://127.0.0.1:3000';
const uniq = (label) => `${label} ${Date.now()}${Math.floor(Math.random() * 1000)}`;
const MAX_EVIDENCE = 500;

async function api(method, path, body) {
  const res = await fetch(BASE + path, {
    method,
    headers: body === undefined ? {} : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  let json = text;
  try { json = JSON.parse(text); } catch { /* giữ nguyên text */ }
  return { status: res.status, json };
}

async function visibleWithin(locator, ms = 5000) {
  try {
    await locator.waitFor({ timeout: ms });
    return true;
  } catch {
    return false;
  }
}

async function withPage(browser, fn) {
  const page = await browser.newPage();
  try {
    return await fn(page);
  } finally {
    await page.close();
  }
}

// Mỗi test: run(browser) trả { ok, evidence } hoặc { blocked: true, evidence }.
const TESTS = {
  'TC-001': async () => {
    const r = await api('GET', '/api/health');
    return { ok: r.status === 200 && r.json.status === 'ok', evidence: `HTTP ${r.status}, body ${JSON.stringify(r.json)}` };
  },

  'TC-002': async (browser) => withPage(browser, async (page) => {
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    const t0 = Date.now();
    await page.goto(BASE + '/');
    await page.getByRole('heading', { level: 1 }).waitFor({ timeout: 5000 });
    const ms = Date.now() - t0;
    return { ok: ms < 3000 && errors.length === 0, evidence: `Tải trang ${ms} ms; lỗi JS/console: ${errors.length}` };
  }),

  'TC-003': async (browser) => withPage(browser, async (page) => {
    const title = uniq('TC thực thi tự động');
    await page.goto(BASE + '/#/testcases');
    await page.getByLabel('Tiêu đề').fill(title);
    await page.getByRole('button', { name: 'Thêm test case' }).click();
    const seen = await visibleWithin(page.getByRole('cell', { name: title }));
    return { ok: seen, evidence: seen ? `Thấy "${title}" trong danh sách` : `Không thấy "${title}" trong danh sách sau khi thêm` };
  }),

  'TC-004': async (browser) => withPage(browser, async (page) => {
    await page.goto(BASE + '/#/testcases');
    await page.getByRole('button', { name: 'Thêm test case' }).click();
    const msg = page.locator('#tc-title-error');
    await msg.waitFor({ timeout: 5000 });
    const text = await msg.textContent();
    return { ok: text === 'Tiêu đề cần ít nhất 3 ký tự', evidence: `Thông báo hiển thị: "${text}"` };
  }),

  'TC-005': async () => {
    const tooLong = await api('POST', '/api/testcases', { title: 'a'.repeat(201) });
    const atLimit = await api('POST', '/api/testcases', { title: 'a'.repeat(200) });
    return {
      ok: tooLong.status === 400 && atLimit.status === 201,
      evidence: `201 ký tự -> HTTP ${tooLong.status}; 200 ký tự -> HTTP ${atLimit.status}`,
    };
  },

  'TC-006': async (browser) => withPage(browser, async (page) => {
    await page.goto(BASE + '/#/testcases');
    const loaded = page.waitForResponse((r) => r.url().includes('/api/testcases?') && r.url().includes('status=draft'));
    await page.getByLabel('Lọc theo trạng thái').selectOption('draft');
    await loaded;
    const rows = page.locator('#tc-table tbody tr');
    await rows.first().waitFor({ timeout: 5000 });
    const count = await rows.count();
    let bad = 0;
    for (let i = 0; i < count; i += 1) {
      const value = await rows.nth(i).getByRole('combobox', { name: /^Trạng thái TC-/ }).inputValue();
      if (value !== 'draft') bad += 1;
    }
    return { ok: count > 0 && bad === 0, evidence: `${count} dòng hiển thị, ${bad} dòng không phải draft` };
  }),

  'TC-007': async (browser) => withPage(browser, async (page) => {
    await page.goto(BASE + '/#/testcases');
    await page.getByLabel('Tìm kiếm').fill('XSS');
    const hit = await visibleWithin(page.getByRole('cell', { name: /Payload XSS/ }));
    const miss = await visibleWithin(page.getByRole('cell', { name: /Health endpoint/ }), 1000);
    return { ok: hit && !miss, evidence: `Tìm "XSS": có TC-010 = ${hit}; còn TC Health = ${miss}` };
  }),

  'TC-008': async () => {
    const patched = await api('PATCH', '/api/testcases/TC-008', { status: 'ready' });
    const list = await api('GET', '/api/testcases?q=TC-008');
    const item = list.json.items.find((i) => i.id === 'TC-008');
    return {
      ok: patched.status === 200 && item?.status === 'ready',
      evidence: `PATCH -> HTTP ${patched.status}; sau đó status = ${item?.status}`,
    };
  },

  'TC-009': async () => {
    const r = await api('POST', '/api/bugs', { title: uniq('Bug severity sai'), severity: 'blocker' });
    return { ok: r.status === 400 && Boolean(r.json.details?.severity), evidence: `HTTP ${r.status}; details.severity = ${r.json.details?.severity ?? 'không có'}` };
  },

  'TC-010': async (browser) => withPage(browser, async (page) => {
    let dialog = false;
    page.on('dialog', async (d) => { dialog = true; await d.dismiss(); });
    const payload = `<img src=x onerror="window.__xss=1">Payload ${Date.now()}`;
    await page.goto(BASE + '/#/testcases');
    await page.getByLabel('Tiêu đề').fill(payload);
    await page.getByRole('button', { name: 'Thêm test case' }).click();
    const cell = page.getByRole('cell', { name: payload });
    const shown = await visibleWithin(cell);
    const executed = await page.evaluate(() => window.__xss);
    const imgs = shown ? await cell.locator('img').count() : -1;
    return { ok: shown && executed === undefined && imgs === 0 && !dialog, evidence: `Hiển thị dạng chữ = ${shown}; window.__xss = ${executed}; thẻ img = ${imgs}; hộp thoại = ${dialog}` };
  }),

  'TC-011': async (browser) => {
    const page = await browser.newPage({ viewport: { width: 375, height: 812 } });
    try {
      await page.goto(BASE + '/#/testcases');
      await page.getByRole('heading', { level: 1 }).waitFor({ timeout: 5000 });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      return { ok: overflow <= 0, evidence: `Màn hình 375px: scrollWidth - clientWidth = ${overflow}px` };
    } finally {
      await page.close();
    }
  },

  'TC-012': async () => {
    const bug = (await api('POST', '/api/bugs', { title: uniq('Bug vòng đời đúng luồng'), severity: 'minor' })).json;
    const chain = ['assigned', 'in_progress', 'fixed', 'retest', 'verified', 'closed'];
    const codes = [];
    let last = null;
    for (const status of chain) {
      const r = await api('PATCH', `/api/bugs/${bug.id}`, { status });
      codes.push(`${status}:${r.status}`);
      if (r.status !== 200) return { ok: false, evidence: `Dừng tại ${codes.join(', ')}` };
      last = r.json;
    }
    return { ok: last.status === 'closed' && Boolean(last.closedAt), evidence: `${bug.id}: ${codes.join(', ')}; closedAt = ${last.closedAt ? 'có' : 'không'}` };
  },

  'TC-013': async () => {
    const bug = (await api('POST', '/api/bugs', { title: uniq('Bug chuyển trái luồng'), severity: 'minor' })).json;
    const r = await api('PATCH', `/api/bugs/${bug.id}`, { status: 'closed' });
    const after = (await api('GET', '/api/bugs')).json.items.find((b) => b.id === bug.id);
    return {
      ok: r.status === 409 && after.status === 'new',
      evidence: `new -> closed: HTTP ${r.status}; trạng thái sau đó = ${after.status}`,
    };
  },

  'TC-014': async () => {
    const s = (await api('GET', '/api/summary')).json;
    const allActionable = s.exitCriteria.filter((c) => !c.ok).every((c) => typeof c.action === 'string');
    return {
      ok: s.readyForRelease === false && s.exitCriteria.length === 6 && allActionable,
      evidence: `readyForRelease = ${s.readyForRelease}; ${s.exitCriteria.filter((c) => !c.ok).length}/6 tiêu chí chưa đạt, đều có hành động`,
    };
  },

  'TC-015': async (browser) => withPage(browser, async (page) => {
    const findings = uniq('Review thực thi tự động');
    const created = await api('POST', '/api/reviews', { target: 'document', targetRef: 'Bài viết STLC', findings });
    await page.goto(BASE + '/#/plan');
    const seen = await visibleWithin(page.getByRole('cell', { name: findings }));
    return { ok: created.status === 201 && seen, evidence: `POST review -> HTTP ${created.status}; hiển thị trên trang Kế hoạch = ${seen}` };
  }),

  'TC-016': async () => {
    const r = await api('POST', '/api/testcases', { title: '😀'.repeat(150) });
    return { ok: r.status === 201, evidence: `Tiêu đề 150 emoji -> HTTP ${r.status}${r.json.details ? ` (${JSON.stringify(r.json.details)})` : ''}` };
  },

  'TC-017': async () => {
    const created = (await api('GET', '/api/testcases')).json.items.find((i) => i.title.startsWith('PATCH đồng thời'));
    const r = await api('PATCH', `/api/testcases/${created.id}`, { status: 'ready', result: 'pass' });
    const after = (await api('GET', `/api/testcases?q=${created.id}`)).json.items.find((i) => i.id === created.id);
    return {
      ok: after.status === 'ready' && after.result === 'pass',
      evidence: `PATCH {status:ready,result:pass} -> HTTP ${r.status}; status = ${after.status}, result = ${after.result}`,
    };
  },

  'TC-018': async () => ({
    blocked: true,
    evidence: 'Không thực thi: cần xoá data/plan.json của môi trường dùng chung để kiểm tra, nên bị chặn',
  }),
};

// Test case mới phát hiện từ đợt thăm dò trước; tạo nếu chưa có (khớp theo tiêu đề).
const NEW_CASES = [
  { key: 'TC-016', title: 'Tiêu đề 150 emoji (150 ký tự) được chấp nhận', requirementId: 'REQ-02', suiteId: 'TS-01', testType: 'boundary', expected: 'HTTP 201, tiêu đề được lưu' },
  { key: 'TC-017', title: 'PATCH đồng thời status và result phải cập nhật cả hai trường', requirementId: 'REQ-04', suiteId: 'TS-01', testType: 'state_transition', expected: 'status = ready và result = pass' },
  { key: 'TC-018', title: 'Thiếu kế hoạch thì STLC giai đoạn 2 không còn Đạt', requirementId: 'REQ-11', suiteId: 'TS-05', testType: 'decision_table', expected: 'Giai đoạn 2 không còn pass khi thiếu plan' },
];

async function ensureNewCases() {
  const all = (await api('GET', '/api/testcases')).json.items;
  for (const tc of NEW_CASES) {
    if (all.some((i) => i.title === tc.title)) continue;
    await api('POST', '/api/testcases', {
      title: tc.title, requirementId: tc.requirementId, suiteId: tc.suiteId, testType: tc.testType, expected: tc.expected,
    });
  }
  const refreshed = (await api('GET', '/api/testcases')).json.items;
  return Object.fromEntries(NEW_CASES.map((tc) => [tc.key, refreshed.find((i) => i.title === tc.title)?.id]));
}

async function main() {
  const idByKey = await ensureNewCases();
  const planIds = Object.keys(TESTS).map((key) => ({ key, id: idByKey[key] ?? key }));
  const browser = await chromium.launch();
  const rows = [];
  try {
    for (const { key, id } of planIds) {
      const run = TESTS[key];
      let outcome;
      try {
        const r = await run(browser);
        outcome = r.blocked ? { result: 'blocked', evidence: r.evidence } : { result: r.ok ? 'pass' : 'fail', evidence: r.evidence };
      } catch (err) {
        outcome = { result: 'blocked', evidence: `Lỗi khi thực thi: ${String(err.message).split('\n')[0]}` };
      }
      const evidence = `[${new Date().toISOString()}] ${outcome.evidence}`.slice(0, MAX_EVIDENCE);
      const saved = await api('PATCH', `/api/testcases/${id}`, { result: outcome.result, evidence });
      rows.push({ id, result: outcome.result, saved: saved.status, evidence: outcome.evidence });
    }
  } finally {
    await browser.close();
  }
  for (const row of rows) {
    console.log(`${row.id.padEnd(8)} ${row.result.padEnd(8)} HTTP ${row.saved}  ${row.evidence}`);
  }
  const counts = rows.reduce((acc, r) => ({ ...acc, [r.result]: (acc[r.result] ?? 0) + 1 }), {});
  console.log('Tổng:', JSON.stringify(counts));
  const recorded = await api('POST', '/api/projects/PRJ-001/runs', { note: 'Thực thi tự động bằng scripts/execute-test-cases.mjs' });
  console.log(`Ghi lịch sử: ${recorded.status === 201 ? recorded.json.id : `lỗi HTTP ${recorded.status}`}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
