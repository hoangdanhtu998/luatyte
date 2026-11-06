// Máy chủ Học code: phục vụ file tĩnh và chạy code C/C++ bằng gcc/g++.
// Không dùng thư viện ngoài. Chạy: node server/server.mjs   (cổng 4500, đổi bằng biến PORT)
//
// RUNNER=local  (mặc định): biên dịch và chạy trên máy này. Chỉ dùng khi phát triển.
// RUNNER=docker: mỗi lần chạy trong container không mạng, giới hạn bộ nhớ và CPU. Dùng khi lên VPS.
//
// Biến môi trường:
//   COMPILER_DIR  thư mục chứa gcc.exe / g++.exe (Windows). Mặc định C:\winlibs\mingw64\bin
//   DOCKER_IMAGE  image dùng khi RUNNER=docker. Mặc định gcc:14

import http from 'node:http';
import { readFile, mkdtemp, writeFile, rm, stat } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { join, extname, resolve, dirname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { randomBytes } from 'node:crypto';
import { createChat } from './chat.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PORT = Number(process.env.PORT || 4500);
const RUNNER = (process.env.RUNNER || 'local').toLowerCase();
const WIN = process.platform === 'win32';
const COMPILER_DIR = process.env.COMPILER_DIR || (WIN ? 'C:\\winlibs\\mingw64\\bin' : '');
const DOCKER_IMAGE = process.env.DOCKER_IMAGE || 'gcc:14';

const LIMIT = {
  bodyBytes: 96 * 1024,
  codeBytes: 64 * 1024,
  stdinBytes: 8 * 1024,
  outBytes: 64 * 1024,
  compileMs: 10000,
  runMs: 5000,
};

const STANDARDS = {
  c: ['c11', 'c17'],
  cpp: ['c++17', 'c++20'],
};

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
};

function sendJson(res, status, body) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
  res.end(JSON.stringify(body));
}

function fail(res, status, code, message) {
  sendJson(res, status, { ok: false, error: { code, message } });
}

// Chạy một tiến trình, có giới hạn thời gian và dung lượng đầu ra. Không đi qua shell.
function runProcess(file, args, { cwd, input = '', timeout, cap, env }) {
  return new Promise(done => {
    const t0 = Date.now();
    let settled = false;
    let out = '';
    let err = '';
    let truncated = false;
    let timedOut = false;
    let child;
    try {
      child = spawn(file, args, { cwd, env, windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'] });
    } catch (e) {
      return done({ spawnError: e.code || 'SPAWN_ERROR', code: null, signal: null, stdout: '', stderr: String(e.message), timedOut: false, truncated: false, ms: 0 });
    }
    const finish = (value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      done(value);
    };
    const room = () => cap - out.length - err.length;
    child.stdout.on('data', d => {
      if (room() <= 0) return;
      const s = d.toString('utf8');
      out += s.slice(0, room());
      if (out.length + err.length >= cap) { truncated = true; child.kill('SIGKILL'); }
    });
    child.stderr.on('data', d => {
      if (room() <= 0) return;
      const s = d.toString('utf8');
      err += s.slice(0, room());
      if (out.length + err.length >= cap) { truncated = true; child.kill('SIGKILL'); }
    });
    child.stdin.on('error', () => {});
    child.stdin.end(input);
    const timer = setTimeout(() => { timedOut = true; child.kill('SIGKILL'); }, timeout);
    child.on('error', e => finish({ spawnError: e.code || 'SPAWN_ERROR', code: null, signal: null, stdout: out, stderr: err || String(e.message), timedOut, truncated, ms: Date.now() - t0 }));
    child.on('close', (code, signal) => finish({ spawnError: null, code, signal, stdout: out, stderr: err, timedOut, truncated, ms: Date.now() - t0 }));
  });
}

function compilerFile(language) {
  const name = language === 'c' ? 'gcc' : 'g++';
  return WIN ? join(COMPILER_DIR, name + '.exe') : name;
}

function childEnv() {
  if (!WIN || !COMPILER_DIR) return process.env;
  // DLL của gcc nằm trong thư mục bin, nên phải đưa vào PATH khi chạy chương trình đã biên dịch.
  return { ...process.env, PATH: COMPILER_DIR + ';' + (process.env.PATH || '') };
}

function validate(body) {
  if (!body || typeof body !== 'object') return 'Dữ liệu gửi lên không hợp lệ.';
  if (!STANDARDS[body.language]) return 'Ngôn ngữ phải là c hoặc cpp.';
  if (!STANDARDS[body.language].includes(body.std)) return 'Chuẩn không được hỗ trợ: ' + body.std;
  if (typeof body.code !== 'string' || body.code.length === 0) return 'Chưa có code để chạy.';
  if (Buffer.byteLength(body.code, 'utf8') > LIMIT.codeBytes) return 'Code vượt quá 64 KB.';
  const stdin = body.stdin ?? '';
  if (typeof stdin !== 'string' || Buffer.byteLength(stdin, 'utf8') > LIMIT.stdinBytes) return 'Đầu vào (stdin) vượt quá 8 KB.';
  return null;
}

function commandText(language, std, warn, src) {
  const compiler = language === 'c' ? 'gcc' : 'g++';
  const flags = warn ? ['-Wall', '-Wextra'] : [];
  return [compiler, '-std=' + std, ...flags, src, '-o', 'main'].join(' ');
}

async function runLocal({ language, std, warn, code, stdin }) {
  const dir = await mkdtemp(join(tmpdir(), 'hoccode-'));
  try {
    const src = 'main.' + (language === 'c' ? 'c' : 'cpp');
    await writeFile(join(dir, src), code, 'utf8');
    const exe = join(dir, 'main' + (WIN ? '.exe' : ''));
    const flags = warn ? ['-Wall', '-Wextra'] : [];
    const compile = await runProcess(compilerFile(language), ['-std=' + std, ...flags, src, '-o', exe], {
      cwd: dir, timeout: LIMIT.compileMs, cap: LIMIT.outBytes, env: childEnv(),
    });
    if (compile.spawnError === 'ENOENT') {
      return { unavailable: true };
    }
    const command = commandText(language, std, warn, src);
    if (compile.timedOut) {
      return { command, compile: { ok: false, stderr: 'Biên dịch quá 10 giây, đã dừng.', ms: compile.ms } };
    }
    if (compile.code !== 0) {
      return { command, compile: { ok: false, stderr: compile.stderr || compile.stdout, ms: compile.ms } };
    }
    const run = await runProcess(exe, [], {
      cwd: dir, input: stdin, timeout: LIMIT.runMs, cap: LIMIT.outBytes, env: childEnv(),
    });
    return {
      command,
      compile: { ok: true, stderr: compile.stderr, ms: compile.ms },
      run: { code: run.code, signal: run.signal, stdout: run.stdout, stderr: run.stderr, timedOut: run.timedOut, truncated: run.truncated, ms: run.ms },
    };
  } finally {
    await rm(dir, { recursive: true, force: true }).catch(() => {});
  }
}

// Một container cho cả biên dịch lẫn chạy: không mạng, giới hạn RAM, CPU và số tiến trình.
async function runDocker({ language, std, warn, code, stdin }) {
  const dir = await mkdtemp(join(tmpdir(), 'hoccode-'));
  try {
    const src = 'main.' + (language === 'c' ? 'c' : 'cpp');
    await writeFile(join(dir, src), code, 'utf8');
    const compiler = language === 'c' ? 'gcc' : 'g++';
    const flags = warn ? '-Wall -Wextra ' : '';
    const script = `${compiler} -std=${std} ${flags}${src} -o main 2> build.log || { cat build.log >&2; exit 90; }; cat build.log >&2; timeout 5 ./main`;
    const args = ['run', '--rm', '-i', '--network', 'none', '--memory', '256m', '--cpus', '1', '--pids-limit', '64',
      '-v', dir + ':/work', '-w', '/work', DOCKER_IMAGE, 'sh', '-c', script];
    const t0 = Date.now();
    const r = await runProcess('docker', args, { cwd: dir, input: stdin, timeout: LIMIT.compileMs + LIMIT.runMs, cap: LIMIT.outBytes });
    if (r.spawnError === 'ENOENT') return { unavailable: true };
    const command = commandText(language, std, warn, src);
    if (r.code === 90) {
      return { command, compile: { ok: false, stderr: r.stderr, ms: Date.now() - t0 } };
    }
    return {
      command,
      compile: { ok: true, stderr: '', ms: 0 },
      run: { code: r.code, signal: r.signal, stdout: r.stdout, stderr: r.stderr, timedOut: r.timedOut || r.code === 124, truncated: r.truncated, ms: Date.now() - t0 },
    };
  } finally {
    await rm(dir, { recursive: true, force: true }).catch(() => {});
  }
}

async function handleRun(req, res) {
  let raw = '';
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > LIMIT.bodyBytes) return fail(res, 413, 'TOO_LARGE', 'Dữ liệu quá lớn.');
    raw += chunk.toString('utf8');
  }
  let body;
  try { body = JSON.parse(raw); } catch { return fail(res, 400, 'BAD_JSON', 'Dữ liệu không đúng định dạng JSON.'); }
  const problem = validate(body);
  if (problem) return fail(res, 400, 'INVALID_INPUT', problem);
  const job = { language: body.language, std: body.std, warn: body.warn !== false, code: body.code, stdin: body.stdin ?? '' };
  let result;
  try {
    result = RUNNER === 'docker' ? await runDocker(job) : await runLocal(job);
  } catch (e) {
    return fail(res, 500, 'INTERNAL', 'Máy chủ gặp lỗi khi chạy code: ' + e.message);
  }
  if (result.unavailable) {
    return fail(res, 503, 'COMPILER_UNAVAILABLE',
      RUNNER === 'docker'
        ? 'Chưa tìm thấy Docker trên máy chủ. Hãy cài Docker hoặc kiểm tra image ' + DOCKER_IMAGE + '.'
        : 'Chưa tìm thấy trình biên dịch ' + compilerFile(job.language) + '. Kiểm tra biến COMPILER_DIR.');
  }
  sendJson(res, 200, { ok: true, runner: RUNNER, ...result });
}

async function serveStatic(req, res, pathname) {
  let rel = decodeURIComponent(pathname);
  if (rel === '/' || rel === '') rel = '/index-hoccode.html';
  const file = resolve(ROOT, '.' + rel);
  const inRoot = file === ROOT || file.startsWith(ROOT + sep);
  const blocked = /(^|[\\/])(server|\.git|node_modules)([\\/]|$)/i.test(rel) || /(^|[\\/])\./.test(rel);
  if (!inRoot || blocked) { res.writeHead(404); return res.end('Không tìm thấy'); }
  try {
    const st = await stat(file);
    if (!st.isFile()) throw new Error('not file');
    const data = await readFile(file);
    res.writeHead(200, { 'content-type': MIME[extname(file).toLowerCase()] || 'application/octet-stream', 'cache-control': 'no-cache' });
    res.end(data);
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('Không tìm thấy');
  }
}

const chat = createChat(ROOT);

async function handleChatRoute(req, res) {
  let raw = '';
  for await (const chunk of req) {
    raw += chunk.toString('utf8');
    if (raw.length > 8192) return fail(res, 413, 'TOO_LARGE', 'Câu hỏi quá dài.');
  }
  let body;
  try { body = JSON.parse(raw); } catch { return fail(res, 400, 'BAD_JSON', 'Dữ liệu không đúng định dạng.'); }
  try {
    const r = await chat(body);
    if (r.error) return fail(res, r.status, r.error.code, r.error.message);
    sendJson(res, 200, r);
  } catch (e) {
    fail(res, 500, 'INTERNAL', 'Trợ lý gặp lỗi: ' + e.message);
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname === '/api/chat') {
    if (req.method !== 'POST') return fail(res, 405, 'METHOD', 'Dùng POST.');
    return handleChatRoute(req, res);
  }
  if (url.pathname === '/api/run') {
    if (req.method !== 'POST') return fail(res, 405, 'METHOD', 'Dùng POST.');
    return handleRun(req, res);
  }
  if (url.pathname.startsWith('/api/')) return fail(res, 404, 'NOT_FOUND', 'Không có API này.');
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); return res.end(); }
  return serveStatic(req, res, url.pathname);
});

server.listen(PORT, '127.0.0.1', () => {
  console.log('Học code đang chạy tại http://localhost:' + PORT + '/index-hoccode.html');
  console.log('Trình chạy code: ' + RUNNER + (RUNNER === 'docker' ? ' (image ' + DOCKER_IMAGE + ')' : ' (trình biên dịch: ' + (WIN ? COMPILER_DIR : 'PATH') + ')'));
  if (RUNNER !== 'docker') {
    console.log('CẢNH BÁO: chế độ local biên dịch và chạy code trực tiếp trên máy này. Chỉ dùng khi phát triển, không mở cổng này ra internet.');
  }
});
