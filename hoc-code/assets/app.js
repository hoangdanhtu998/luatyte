// Lưu tiến độ trên trình duyệt (localStorage). Không cần máy chủ.
const STORE_KEY = 'hoc-cpp-progress-v1';

function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY)) || { status: {}, notes: {} };
  } catch (e) {
    return { status: {}, notes: {} };
  }
}

function saveProgress(p) {
  localStorage.setItem(STORE_KEY, JSON.stringify(p));
}

const STATUS_LABEL = { todo: 'Chưa bắt đầu', doing: 'Đang làm', done: 'Đã xong' };

function statusOf(progress, id) {
  return progress.status[id] || 'todo';
}
