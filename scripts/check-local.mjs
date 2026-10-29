// Một lệnh kiểm tra cục bộ: test core/contract/sync/server + security smoke (+ admin nếu --admin).
// Chạy từ gốc repo: node scripts/check-local.mjs [--admin]
import { spawn } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');
const STUDY = join(ROOT, 'app luật y tế');
const ADMIN = join(ROOT, 'app quản lý luật y tế');
const withAdmin = process.argv.includes('--admin');
let failed = 0;

function run(name, command, args, cwd, useShell = false) {
  return new Promise(ok => {
    const started = Date.now();
    const child = spawn(command, args, { cwd, stdio: 'inherit', shell: useShell });
    child.on('close', code => {
      const pass = code === 0;
      if (!pass) failed++;
      console.log(`${pass ? 'PASS' : 'FAIL'} ${name} (${Date.now() - started}ms)`);
      ok();
    });
    child.on('error', e => {
      failed++;
      console.log(`FAIL ${name}: ${e.message}`);
      ok();
    });
  });
}

await run('Study tests', process.execPath, [
  '--test',
  'test/content-contract.test.mjs',
  'test/sync-proxy.test.mjs',
  'test/server-resilience.test.mjs',
  'test/swipe-core.test.mjs',
], STUDY);
await run('Security smoke', process.execPath, [join(ROOT, 'scripts', 'security-smoke.mjs')], ROOT);
if (withAdmin) await run('Admin tests', 'npm', ['test'], ADMIN, true);

console.log(failed ? `\nCÓ ${failed} NHÓM KIỂM TRA LỖI` : '\nTẤT CẢ KIỂM TRA CỤC BỘ ĐỀU PASS');
process.exitCode = failed ? 1 : 0;
