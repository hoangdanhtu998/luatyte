import { test, expect } from '@playwright/test';
import { hasTestScript, safeEnv, runProjectTests } from '../lib/project-tests.js';
import { runProjectPipeline, testsDue, TEST_INTERVAL_MS } from '../lib/pipeline.js';
import { validateProject } from '../lib/projects.js';

const WITH_TEST = {
  exists: () => true,
  read: () => JSON.stringify({ scripts: { test: 'node --test' } }),
};

function fakeExec(codes) {
  const calls = [];
  const execFileImpl = (cmd, args, opts, cb) => {
    calls.push({ args, env: opts.env });
    const code = codes.shift() ?? 0;
    cb(code === 0 ? null : Object.assign(new Error('x'), { code }), 'out', '');
  };
  return { calls, execFileImpl };
}

test.describe('Chạy test dự án zip/GitHub', () => {
  test('không có script test thì không cài và báo unavailable', async () => {
    const { calls, execFileImpl } = fakeExec([]);
    const result = await runProjectTests('/x', {
      execFileImpl, env: {}, npmCli: '/npm-cli.js', hasScript: () => false,
    });
    expect(calls.length).toBe(0);
    expect(result.status).toBe('unavailable');
  });

  test('cài với --ignore-scripts rồi chạy npm test; đạt khi mã thoát 0', async () => {
    const { calls, execFileImpl } = fakeExec([0, 0]);
    const result = await runProjectTests('/x', {
      execFileImpl, env: {}, npmCli: '/npm-cli.js', hasScript: () => true,
    });
    expect(calls.length).toBe(2);
    expect(calls[0].args).toEqual(['/npm-cli.js', 'install', '--ignore-scripts', '--no-audit', '--no-fund']);
    expect(calls[1].args).toEqual(['/npm-cli.js', 'test']);
    expect(result.status).toBe('pass');
  });

  test('install lỗi thì báo install_failed và không chạy test', async () => {
    const { calls, execFileImpl } = fakeExec([1]);
    const result = await runProjectTests('/x', {
      execFileImpl, env: {}, npmCli: '/npm-cli.js', hasScript: () => true,
    });
    expect(calls.length).toBe(1);
    expect(result.status).toBe('install_failed');
  });

  test('npm test lỗi thì báo fail', async () => {
    const { execFileImpl } = fakeExec([0, 1]);
    const result = await runProjectTests('/x', {
      execFileImpl, env: {}, npmCli: '/npm-cli.js', hasScript: () => true,
    });
    expect(result.status).toBe('fail');
  });

  test('biến nhạy cảm không được truyền vào tiến trình con', async () => {
    const { calls, execFileImpl } = fakeExec([0, 0]);
    const env = safeEnv({ PATH: '/bin', ANTHROPIC_API_KEY: 'secret', AI_TOKEN: 'x' });
    await runProjectTests('/x', { execFileImpl, env, npmCli: '/npm-cli.js', hasScript: () => true });
    for (const call of calls) {
      expect(call.env.ANTHROPIC_API_KEY).toBeUndefined();
      expect(call.env.AI_TOKEN).toBeUndefined();
    }
  });

  test('safeEnv bỏ khóa và biến không cần thiết', () => {
    const env = safeEnv({ PATH: '/p', GITHUB_TOKEN: 't', ANTHROPIC_API_KEY: 'k' });
    expect(env.PATH).toBe('/p');
    expect(env.GITHUB_TOKEN).toBeUndefined();
    expect(env.CI).toBe('1');
  });
});

test.describe('Bước tests trong luồng', () => {
  function deps(overrides = {}) {
    const calls = { tests: [], recorded: [] };
    return {
      calls,
      deps: {
        scanDomain: async () => ({ checks: [] }),
        saveScan: async () => {},
        exists: () => true,
        scanVirus: async () => ({ status: 'clean', detail: 'ok' }),
        collectFiles: () => ({ tree: [], excerpts: [] }),
        suggest: async () => [],
        applyChecklist: async () => {},
        recordReport: async () => {},
        runTests: async (dir) => { calls.tests.push(dir); return { status: 'pass', detail: 'Test đạt' }; },
        recordTests: async (id, status) => { calls.recorded.push([id, status]); },
        ...overrides,
      },
    };
  }

  const base = { id: 'PRJ-030', sourceType: 'zip', sourceRef: 'a.zip', localPath: '/w/a' };

  test('dự án không bật autoTests thì không chạy test', async () => {
    const { calls, deps: d } = deps();
    await runProjectPipeline({ ...base, autoTests: false }, d);
    expect(calls.tests).toEqual([]);
  });

  test('bật autoTests và quét virus sạch thì chạy test và ghi kết quả', async () => {
    const { calls, deps: d } = deps();
    const outcome = await runProjectPipeline({ ...base, autoTests: true }, d);
    expect(calls.tests).toEqual(['/w/a']);
    expect(calls.recorded).toEqual([['PRJ-030', 'pass']]);
    expect(outcome.steps.tests.status).toBe('pass');
  });

  test('virus thì không chạy test dù đã bật', async () => {
    const { calls, deps: d } = deps({
      scanVirus: async () => ({ status: 'threat', detail: 'virus' }),
    });
    await runProjectPipeline({ ...base, autoTests: true }, d);
    expect(calls.tests).toEqual([]);
  });

  test('vừa chạy trong 24 giờ thì không chạy lại', async () => {
    const { calls, deps: d } = deps();
    const recent = new Date(Date.now() - 1000).toISOString();
    await runProjectPipeline({ ...base, autoTests: true, testedAt: recent }, d);
    expect(calls.tests).toEqual([]);
    expect(testsDue({ testedAt: recent })).toBe(false);
    expect(testsDue({ testedAt: new Date(Date.now() - TEST_INTERVAL_MS - 1000).toISOString() })).toBe(true);
  });

  test('test lỗi được ghi là lỗi ở bước tests', async () => {
    const { deps: d } = deps({ runTests: async () => ({ status: 'fail', detail: 'Test lỗi (mã 1)' }) });
    const outcome = await runProjectPipeline({ ...base, autoTests: true }, d);
    expect(outcome.steps.tests.ok).toBe(false);
  });
});

test.describe('Tùy chọn autoTests khi tạo dự án', () => {
  test('zip bật autoTests được lưu, domain thì luôn tắt', () => {
    const zip = validateProject({ name: 'Dự án zip', sourceType: 'zip', sourceRef: 'a.zip', autoTests: true });
    expect(zip.value.autoTests).toBe(true);
    const domain = validateProject({
      name: 'Domain thử', sourceType: 'domain', sourceRef: 'https://example.com', ownershipConfirmed: true, autoTests: true,
    });
    expect(domain.value.autoTests).toBe(false);
  });

  test('không gửi autoTests thì mặc định tắt', () => {
    const zip = validateProject({ name: 'Dự án zip', sourceType: 'zip', sourceRef: 'a.zip' });
    expect(zip.value.autoTests).toBe(false);
  });
});

test.describe('Phát hiện script test', () => {
  test('đọc package.json có scripts.test thì true, thiếu thì false', () => {
    expect(hasTestScript('/x', WITH_TEST.exists, WITH_TEST.read)).toBe(true);
    expect(hasTestScript('/x', () => true, () => '{"scripts":{}}')).toBe(false);
    expect(hasTestScript('/x', () => true, () => 'không phải json')).toBe(false);
    expect(hasTestScript('/x', () => false)).toBe(false);
  });
});
