// Theo dõi tiến độ bộ test đang chạy từ dòng log của Playwright (reporter "list").
// Dòng kết quả có dạng: "  ok 12 [chromium] › tests/x.spec.mjs:10:3 › suite › tên test (30ms)".

// Phần sau "[project] › file › " là tiêu đề test (file bị bỏ qua).
const RESULT_LINE = /^\s*(ok|x|-)\s+\d+\s+\[[^\]]+\]\s+›\s+[^›]+›\s+(.+?)\s*(?:\(\d[\d.,]*(?:ms|s|m)\))?\s*$/;
const STATUS_OF = { ok: 'pass', x: 'fail', '-': 'skip' };

// Trả về { status, title } nếu dòng là kết quả một test; ngược lại trả null.
export function parseReporterLine(line) {
  const match = RESULT_LINE.exec(line);
  if (!match) return null;
  return { status: STATUS_OF[match[1]], title: match[2].trim() };
}

// total: số test dự kiến (lấy từ lần chạy trước). Mỗi lượt có một tracker riêng.
export function createLiveTracker() {
  let state = idle();

  function idle() {
    return { running: false, total: 0, done: 0, passed: 0, failed: 0, skipped: 0, current: null };
  }

  return {
    start(total) {
      state = { ...idle(), running: true, total: Math.max(0, total) };
    },
    push(line) {
      const result = parseReporterLine(line);
      if (!result) return;
      const done = state.done + 1;
      state = {
        ...state,
        done,
        passed: state.passed + (result.status === 'pass' ? 1 : 0),
        failed: state.failed + (result.status === 'fail' ? 1 : 0),
        skipped: state.skipped + (result.status === 'skip' ? 1 : 0),
        current: result.title,
      };
    },
    finish() {
      state = { ...state, running: false, current: null };
    },
    snapshot() {
      const percent = state.total > 0 ? Math.min(100, Math.round((state.done / state.total) * 100)) : 0;
      return { ...state, percent };
    },
  };
}
