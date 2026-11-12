// Cài và chạy "npm test" của dự án zip/GitHub trong thư mục làm việc tạm.
// Không dùng shell. Cài với --ignore-scripts để không chạy script postinstall.
// Môi trường tối thiểu: không truyền khóa API hay biến nhạy cảm của QA Hub vào tiến trình.
import { execFile } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const INSTALL_TIMEOUT_MS = 5 * 60 * 1000;
const TEST_TIMEOUT_MS = 10 * 60 * 1000;
const OUTPUT_TAIL_CHARS = 600;
const SAFE_ENV_KEYS = ['PATH', 'Path', 'SystemRoot', 'TEMP', 'TMP', 'USERPROFILE', 'HOME', 'APPDATA', 'LOCALAPPDATA'];

// npm đi kèm Node: chạy qua node để không cần shell (npm.cmd trên Windows cần shell).
// Windows: npm nằm cạnh node.exe. Linux/macOS: npm nằm ở ../lib/node_modules.
export function npmCliPath(execPath = process.execPath, exists = existsSync) {
  const candidates = [
    path.join(path.dirname(execPath), 'node_modules', 'npm', 'bin', 'npm-cli.js'),
    path.join(path.dirname(execPath), '..', 'lib', 'node_modules', 'npm', 'bin', 'npm-cli.js'),
  ];
  return candidates.find((c) => exists(c)) ?? candidates[0];
}

export function safeEnv(source = process.env) {
  const env = {};
  for (const key of SAFE_ENV_KEYS) {
    if (source[key] !== undefined) env[key] = source[key];
  }
  return { ...env, CI: '1' };
}

// Dự án có "scripts.test" trong package.json thì mới chạy được.
export function hasTestScript(dir, exists = existsSync, read = readFileSync) {
  const pkg = path.join(dir, 'package.json');
  if (!exists(pkg)) return false;
  try {
    return typeof JSON.parse(read(pkg, 'utf8')).scripts?.test === 'string';
  } catch {
    return false;
  }
}

function runNode(args, { cwd, timeout, env, execFileImpl }) {
  return new Promise((resolve) => {
    execFileImpl(process.execPath, args, { cwd, timeout, env, windowsHide: true, maxBuffer: 4 * 1024 * 1024 },
      (err, stdout, stderr) => {
        const output = `${stdout ?? ''}${stderr ?? ''}`.slice(-OUTPUT_TAIL_CHARS);
        resolve({ code: err ? (typeof err.code === 'number' ? err.code : -1) : 0, output });
      });
  });
}

// Trả về { status: 'pass' | 'fail' | 'unavailable' | 'install_failed', detail }.
export async function runProjectTests(dir, {
  npmCli = npmCliPath(), execFileImpl = execFile, env = safeEnv(), hasScript = hasTestScript,
} = {}) {
  if (!hasScript(dir)) {
    return { status: 'unavailable', detail: 'Dự án không có script "test" trong package.json' };
  }
  const install = await runNode([npmCli, 'install', '--ignore-scripts', '--no-audit', '--no-fund'],
    { cwd: dir, timeout: INSTALL_TIMEOUT_MS, env, execFileImpl });
  if (install.code !== 0) {
    return { status: 'install_failed', detail: `Cài đặt lỗi (mã ${install.code})`, output: install.output };
  }
  const test = await runNode([npmCli, 'test'], { cwd: dir, timeout: TEST_TIMEOUT_MS, env, execFileImpl });
  if (test.code === 0) return { status: 'pass', detail: 'Test đạt', output: test.output };
  return { status: 'fail', detail: `Test lỗi (mã ${test.code})`, output: test.output };
}
