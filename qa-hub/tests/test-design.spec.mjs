import { test, expect } from '@playwright/test';
import { designTests, isSourcePath, MAX_IDEAS } from '../lib/test-design.js';
import { saveTestIdeas } from '../lib/test-ideas-store.js';

const ROUTE_SRC = `
const ROUTES = [
  { method: 'PATCH', pattern: /^\\/api\\/projects\\/(PRJ-\\d{3,})\\/checklist\\/(CL-\\d{2})$/, handler: setItem },
];`;

test.describe('Sinh ý tưởng test từ mã nguồn', () => {
  test('chỉ coi mã sản xuất là nguồn, bỏ file test và thư mục cài đặt', () => {
    expect(isSourcePath('src/a.js')).toBe(true);
    expect(isSourcePath('lib/x.mjs')).toBe(true);
    expect(isSourcePath('tests/a.spec.mjs')).toBe(false);
    expect(isSourcePath('node_modules/x/index.js')).toBe(false);
    expect(isSourcePath('README.md')).toBe(false);
  });

  test('route API thành ý tưởng black box với dạng đường dẫn đọc được', () => {
    const ideas = designTests({ tree: ['server.js'], sources: [{ path: 'server.js', text: ROUTE_SRC }] });
    const api = ideas.find((i) => i.title.startsWith('API PATCH'));
    expect(api.title).toContain('/api/projects/:id/checklist/:id');
    expect(api.testType).toBe('black_box');
    expect(api.steps).toContain('server.js');
  });

  test('ngưỡng số trong code thành ca biên với ba giá trị n-1, n, n+1', () => {
    const text = 'if (title.length > 200) throw new Error("x");';
    const ideas = designTests({ tree: ['lib/v.js'], sources: [{ path: 'lib/v.js', text }] });
    const bound = ideas.find((i) => i.title.startsWith('Biên length > 200'));
    expect(bound.title).toContain('199, 200, 201');
    expect(bound.testType).toBe('black_box');
    expect(bound.priority).toBe('high');
  });

  test('hàm, catch và throw thành ca white box, có bằng chứng là file đó', () => {
    const text = `
function parseThing(raw) {
  if (!raw) return null;
  try { return JSON.parse(raw); } catch (e) { throw new Error('bad'); }
}`;
    const ideas = designTests({ tree: ['lib/p.js'], sources: [{ path: 'lib/p.js', text }] });
    const titles = ideas.map((i) => i.title);
    expect(titles.some((t) => t.startsWith('Nhánh lỗi (catch) trong lib/p.js'))).toBe(true);
    expect(titles.some((t) => t.startsWith('Đường ném lỗi trong lib/p.js'))).toBe(true);
    expect(ideas.filter((i) => i.testType === 'white_box').every((i) => i.steps.includes('lib/p.js'))).toBe(true);
  });

  test('ô nhập HTML thành ca black box cho từng trường', () => {
    const text = '<input type="email" name="email" required>';
    const ideas = designTests({ tree: ['index.html'], sources: [{ path: 'index.html', text }] });
    expect(ideas.some((i) => i.title.startsWith('Ô email (index.html)'))).toBe(true);
  });

  test('nguồn không có trong cây file bị bỏ, không bịa bằng chứng', () => {
    const ideas = designTests({ tree: ['a.js'], sources: [{ path: 'ghost.js', text: 'function f(){}' }] });
    expect(ideas).toHaveLength(0);
  });

  test('khi bị cắt bớt vẫn giữ cả black box lẫn white box', () => {
    const tree = Array.from({ length: 60 }, (_, k) => `m${k}.js`);
    const sources = tree.map((p, k) => ({
      path: p,
      text: `if (x.length > ${k + 1}) {}\ntry { go(); } catch (e) { throw new Error("x"); }`,
    }));
    const ideas = designTests({ tree, sources });
    expect(ideas.filter((i) => i.testType === 'black_box').length).toBeGreaterThan(0);
    expect(ideas.filter((i) => i.testType === 'white_box').length).toBeGreaterThan(0);
  });

  test('số ý tưởng không vượt giới hạn và không trùng tiêu đề', () => {
    const tree = Array.from({ length: 80 }, (_, k) => `m${k}.js`);
    const sources = tree.map((p, k) => ({ path: p, text: `if (x.length > ${k + 1}) {}` }));
    const ideas = designTests({ tree, sources });
    expect(ideas.length).toBeLessThanOrEqual(MAX_IDEAS);
    expect(new Set(ideas.map((i) => i.title)).size).toBe(ideas.length);
  });
});

test.describe('Lưu ý tưởng test thành ca của dự án', () => {
  function fakeStore(rows = []) {
    const testcases = [...rows];
    return {
      testcases,
      list: (name) => (name === 'testcases' ? testcases : []),
      insert: (name, row) => { testcases.push({ id: `TC-${testcases.length + 1}`, ...row }); },
    };
  }

  test('ghi ca mới, bỏ ca trùng tiêu đề trong cùng dự án và ca không hợp lệ', () => {
    const store = fakeStore([{ projectId: 'PRJ-001', title: 'Ca đã có sẵn' }]);
    const ideas = [
      { title: 'Ca đã có sẵn', testType: 'white_box', priority: 'medium', expected: 'x', steps: 'y' },
      { title: 'Ca mới hợp lệ', testType: 'black_box', priority: 'medium', expected: 'x', steps: 'y' },
      { title: 'x', testType: 'black_box', priority: 'medium', expected: '', steps: '' },
    ];
    const created = saveTestIdeas(store, 'PRJ-001', ideas);
    expect(created).toBe(1);
    const added = store.testcases.find((tc) => tc.title === 'Ca mới hợp lệ');
    expect(added.projectId).toBe('PRJ-001');
    expect(added.result).toBe('not_run');
    expect(added.status).toBe('draft');
  });

  test('ca của dự án khác không chặn việc ghi', () => {
    const store = fakeStore([{ projectId: 'PRJ-002', title: 'Trùng tên' }]);
    const created = saveTestIdeas(store, 'PRJ-001', [
      { title: 'Trùng tên', testType: 'white_box', priority: 'medium', expected: 'x', steps: 'y' },
    ]);
    expect(created).toBe(1);
  });
});
