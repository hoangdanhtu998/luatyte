// Tự chạy bộ test theo lịch. Chỉ chạy đúng bộ test của chính QA Hub (không chạy mã của dự án khác).
import { spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { createLiveTracker } from './live.js';

const MIN_INTERVAL_MINUTES = 5;
const OUTPUT_TAIL_LINES = 40;

export function readStats(resultsFile) {
  if (!existsSync(resultsFile)) return null;
  try {
    const stats = JSON.parse(readFileSync(resultsFile, 'utf8')).stats ?? {};
    return {
      passed: stats.expected ?? 0,
      failed: stats.unexpected ?? 0,
      flaky: stats.flaky ?? 0,
      durationMs: stats.duration ?? null,
    };
  } catch {
    return null;
  }
}

// deps: { root, resultsFile, onFinish(record) }. Không dùng shell: tham số là mảng cố định.
export function createAutoRunner({ root, resultsFile, onFinish, spawnImpl = spawn, now = () => new Date() }) {
  const cli = path.join(root, 'node_modules', '@playwright', 'test', 'cli.js');
  let running = false;
  let lastRun = null;
  let timer = null;
  const tracker = createLiveTracker();

  function runNow() {
    if (running) return { started: false, reason: 'Đang chạy' };
    if (!existsSync(cli)) return { started: false, reason: 'Chưa cài Playwright: chạy npm run setup' };
    running = true;
    const startedAt = now().toISOString();
    const tail = [];
    const previous = readStats(resultsFile);
    tracker.start(previous ? previous.passed + previous.failed + previous.flaky : 0);
    const child = spawnImpl(process.execPath, [cli, 'test'], { cwd: root, env: process.env });
    const keep = (chunk) => {
      for (const line of String(chunk).split('\n')) {
        if (line.trim()) tail.push(line);
        if (tail.length > OUTPUT_TAIL_LINES) tail.shift();
        tracker.push(line);
      }
    };
    child.stdout?.on('data', keep);
    child.stderr?.on('data', keep);
    child.on('close', (code) => {
      running = false;
      tracker.finish();
      const finishedAt = now().toISOString();
      const stats = readStats(resultsFile);
      lastRun = { startedAt, finishedAt, exitCode: code, ...(stats ?? {}), outputTail: tail.slice(-OUTPUT_TAIL_LINES) };
      try {
        onFinish?.(lastRun);
      } catch (err) {
        console.error('Ghi lịch sử tự chạy lỗi:', err.message);
      }
    });
    child.on('error', (err) => {
      running = false;
      tracker.finish();
      lastRun = { startedAt, finishedAt: now().toISOString(), exitCode: -1, error: err.message, outputTail: tail };
    });
    return { started: true };
  }

  function start(minutes) {
    const interval = Math.max(MIN_INTERVAL_MINUTES, Number(minutes));
    stop();
    timer = setInterval(() => runNow(), interval * 60 * 1000);
    timer.unref?.();
    return interval;
  }

  function stop() {
    if (timer) clearInterval(timer);
    timer = null;
  }

  function status(intervalMinutes) {
    return { enabled: timer !== null, intervalMinutes: intervalMinutes ?? null, running, lastRun, live: tracker.snapshot() };
  }

  return { runNow, start, stop, status };
}
