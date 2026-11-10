// Tiến độ và ghi chú lưu trên trình duyệt (localStorage).
// Cấu trúc: { done: { "<id bài>": true }, code: { "<id bài tập>": "<mã đang viết>" } }
const PROGRESS_KEY = 'hoc-cpp-progress-v2';

function loadProgress() {
  try {
    const p = JSON.parse(localStorage.getItem(PROGRESS_KEY));
    return { done: (p && p.done) || {}, code: (p && p.code) || {} };
  } catch (e) {
    return { done: {}, code: {} };
  }
}

// Gộp với dữ liệu đang lưu để bản nháp code không ghi đè trạng thái "đã học" đã ghi trước đó.
function saveProgress(p) {
  try {
    const cur = loadProgress();
    p.done = Object.assign({}, cur.done, p.done);
    p.code = Object.assign({}, cur.code, p.code);
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(p));
    return true;
  } catch (e) {
    return false; // trình duyệt chặn bộ nhớ hoặc đầy
  }
}

// Ghi bài là hoàn thành (chỉ bật, không tự tắt). Gọi khi làm đúng hết trắc nghiệm hoặc chấm bài đạt hết test.
function markLessonDone(lessonId, message) {
  if (!lessonId) return;
  const p = loadProgress();
  if (p.done[lessonId]) return;
  p.done[lessonId] = true;
  saveProgress(p);
  const btn = document.getElementById('done');
  if (btn) { btn.textContent = 'Đã học xong ✓'; btn.className = 'btn ok'; }
  const note = document.getElementById('done-note');
  if (note && message) { note.textContent = message; note.hidden = false; }
}

// Ngôn ngữ và chuẩn biên dịch. Chuẩn của C và C++ khác nhau, nên danh sách chuẩn đổi theo ngôn ngữ.
const ENVIRONMENTS = {
  c: { label: 'C', compiler: 'gcc', file: 'main.c', stds: ['c17', 'c11'] },
  cpp: { label: 'C++', compiler: 'g++', file: 'main.cpp', stds: ['c++17', 'c++20'] },
};

// Bộ khung dùng chung của khu luyện tập trên trang bài học.
// Giai đoạn 1: không có máy chạy code, nên nút Chạy chỉ báo trạng thái thật, không giả lập kết quả.
function initPractice({ lessonId, exercises }) {
  const state = { ex: 0, progress: loadProgress() };

  const el = {
    tabs: document.getElementById('ex-tabs'),
    prompt: document.getElementById('ex-prompt'),
    lang: document.getElementById('lang'),
    std: document.getElementById('std'),
    warn: document.getElementById('warn'),
    code: document.getElementById('code'),
    gutter: document.getElementById('gutter'),
    run: document.getElementById('run'),
    reset: document.getElementById('reset'),
    term: document.getElementById('term'),
    saved: document.getElementById('saved'),
    stdin: document.getElementById('stdin'),
    grade: document.getElementById('grade'),
  };

  function setTerm(lines) {
    el.term.innerHTML = '';
    for (const [cls, text] of lines) {
      const span = document.createElement('span');
      span.className = cls;
      span.textContent = text + '\n';
      el.term.appendChild(span);
    }
  }

  function fillStds() {
    const env = ENVIRONMENTS[el.lang.value];
    el.std.innerHTML = '';
    for (const s of env.stds) {
      const o = document.createElement('option');
      o.value = s;
      o.textContent = s;
      el.std.appendChild(o);
    }
  }

  function updateGutter() {
    const n = el.code.value.split('\n').length;
    let s = '';
    for (let i = 1; i <= n; i++) s += i + '\n';
    el.gutter.textContent = s.replace(/\n$/, '');
    el.gutter.scrollTop = el.code.scrollTop;
  }

  function currentEx() { return exercises[state.ex]; }

  function codeKey() { return lessonId + ':' + currentEx().id; }

  function renderTabs() {
    el.tabs.innerHTML = '';
    exercises.forEach((ex, i) => {
      const b = document.createElement('button');
      b.className = 'ex-tab' + (i === state.ex ? ' on' : '');
      b.textContent = ex.title.split(':')[0];
      b.title = ex.title;
      b.onclick = () => selectEx(i);
      el.tabs.appendChild(b);
    });
  }

  function selectEx(i) {
    state.ex = i;
    renderTabs();
    const ex = currentEx();
    // Bài C++ tự chuyển sang g++ để không báo lỗi thiếu thư viện.
    if (ex.language && ENVIRONMENTS[ex.language] && el.lang.value !== ex.language) {
      el.lang.value = ex.language;
      fillStds();
    }
    // Bài bash không chạy được trên trang (trình chạy chỉ hỗ trợ C/C++): khóa nút và nói rõ.
    const notRunnable = ex.language === 'bash';
    el.run.disabled = notRunnable;
    el.grade.disabled = notRunnable;
    el.prompt.innerHTML = '<h3>' + ex.title + '</h3>' + Md.render(ex.prompt);
    if (notRunnable) {
      el.prompt.insertAdjacentHTML('beforeend', '<p class="muted">Bài này viết bằng shell (bash). Hãy chạy trong terminal Linux hoặc WSL; trang này chỉ chạy C/C++.</p>');
    }
    const saved = state.progress.code[codeKey()];
    el.code.value = saved !== undefined ? saved : ex.starter;
    updateGutter();
    setTerm([['info', 'Sẵn sàng. Viết code rồi bấm Chạy.']]);
    el.saved.textContent = '';
  }

  let saveTimer;
  el.code.addEventListener('input', () => {
    updateGutter();
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      state.progress.code[codeKey()] = el.code.value;
      el.saved.textContent = saveProgress(state.progress) ? 'Đã lưu bản nháp trên trình duyệt này.' : 'Không lưu được bản nháp (bộ nhớ trình duyệt đầy).';
    }, 400);
  });
  el.code.addEventListener('scroll', () => { el.gutter.scrollTop = el.code.scrollTop; });

  // Tab chèn 4 dấu cách thay vì nhảy sang ô khác.
  el.code.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    e.preventDefault();
    const s = el.code.selectionStart, t = el.code.selectionEnd;
    el.code.value = el.code.value.slice(0, s) + '    ' + el.code.value.slice(t);
    el.code.selectionStart = el.code.selectionEnd = s + 4;
    el.code.dispatchEvent(new Event('input'));
  });

  el.lang.addEventListener('change', fillStds);

  el.reset.addEventListener('click', () => {
    if (!confirm('Khôi phục mã mẫu ban đầu của bài tập này? Bản nháp hiện tại sẽ bị xóa.')) return;
    el.code.value = currentEx().starter;
    el.code.dispatchEvent(new Event('input'));
  });

  // Gửi code lên máy chủ Học code để biên dịch và chạy. Máy chủ chạy bằng: node server/server.mjs
  async function callRun(stdin) {
    let r;
    try {
      r = await fetch('/api/run', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ language: el.lang.value, std: el.std.value, warn: el.warn.checked, code: el.code.value, stdin: stdin || '' }),
      });
    } catch (e) {
      throw new Error('Không kết nối được máy chạy code. Mở trang qua http://localhost:4500 và kiểm tra server đang chạy (node server/server.mjs).');
    }
    let data;
    try { data = await r.json(); } catch (e) { throw new Error('Máy chủ trả về dữ liệu không đọc được (HTTP ' + r.status + ').'); }
    if (!data.ok) throw new Error(data.error.message + ' [' + data.error.code + ']');
    return data;
  }

  // Hiển thị kết quả như terminal: lệnh biên dịch, cảnh báo/lỗi, đầu ra chương trình, mã thoát, thời gian.
  function showResult(d) {
    const lines = [['prompt', '$ ' + d.command]];
    const cstderr = (d.compile.stderr || '').replace(/\s+$/, '');
    if (cstderr) lines.push([d.compile.ok ? 'warn' : 'err', cstderr]);
    if (!d.compile.ok) {
      lines.push(['err', 'Biên dịch thất bại. Sửa lỗi rồi chạy lại.']);
      setTerm(lines);
      return;
    }
    if (!cstderr) lines.push(['ok', 'Biên dịch xong, không có cảnh báo.']);
    lines.push(['prompt', '$ ./main']);
    const r = d.run;
    const out = (r.stdout || '').replace(/\r\n/g, '\n').replace(/\s+$/, '');
    if (out) lines.push(['out', out]);
    const err = (r.stderr || '').replace(/\s+$/, '');
    if (err) lines.push(['err', err]);
    if (r.timedOut) lines.push(['err', 'Chương trình chạy quá 5 giây, đã bị dừng.']);
    if (r.truncated) lines.push(['warn', 'Đầu ra quá dài, đã cắt bớt.']);
    lines.push(['info', (r.timedOut ? '' : '[mã thoát ' + r.code + '] ') + '· ' + r.ms + ' ms']);
    setTerm(lines);
  }

  el.run.addEventListener('click', async () => {
    el.run.disabled = true;
    setTerm([['info', 'Đang biên dịch và chạy...']]);
    try {
      showResult(await callRun(el.stdin.value));
    } catch (e) {
      setTerm([['err', e.message]]);
    } finally {
      el.run.disabled = false;
    }
  });

  // So khớp đầu ra: bỏ khác biệt về xuống dòng và khoảng trắng cuối dòng.
  function normalizeOut(s) {
    return (s || '').replace(/\r\n/g, '\n').split('\n').map(l => l.replace(/\s+$/, '')).join('\n').replace(/\n+$/, '');
  }

  el.grade.addEventListener('click', async () => {
    const ex = currentEx();
    const tests = ex.tests || [];
    if (tests.length === 0) { setTerm([['warn', 'Bài này chưa có test để chấm.']]); return; }
    el.grade.disabled = true;
    const lines = [['info', 'Chấm bài: ' + ex.title + ' (' + tests.length + ' test)']];
    let passed = 0;
    try {
      for (let i = 0; i < tests.length; i++) {
        const t = tests[i];
        const d = await callRun(t.stdin || '');
        if (!d.compile.ok) {
          lines.push(['err', 'Code chưa biên dịch được nên không chấm được. Bấm Chạy để xem lỗi.']);
          break;
        }
        const got = normalizeOut(d.run.stdout);
        const want = normalizeOut(t.expected);
        const ok = !d.run.timedOut && got === want;
        if (ok) passed++;
        lines.push([ok ? 'ok' : 'err', 'Test ' + (i + 1) + ': ' + (ok ? 'ĐẠT' : 'CHƯA ĐẠT')]);
        if (!ok) {
          lines.push(['info', '   kỳ vọng: ' + JSON.stringify(want)]);
          lines.push(['info', '   thực tế: ' + JSON.stringify(got) + (d.run.timedOut ? ' (hết thời gian)' : '')]);
        }
      }
      if (passed === tests.length) {
        lines.push(['ok', 'Kết quả: ' + passed + '/' + tests.length + ' test đạt. Làm tốt lắm.']);
        markLessonDone(lessonId, 'Đã chấm đạt hết bài tập viết code, bài được ghi là hoàn thành.');
      } else {
        lines.push(['warn', 'Kết quả: ' + passed + '/' + tests.length + ' test đạt.']);
      }
      setTerm(lines);
    } catch (e) {
      setTerm([['err', e.message]]);
    } finally {
      el.grade.disabled = false;
    }
  });

  // Đánh dấu bài đã học.
  const doneBtn = document.getElementById('done');
  function renderDone() {
    const on = !!state.progress.done[lessonId];
    doneBtn.textContent = on ? 'Đã học xong ✓' : 'Đánh dấu đã học';
    doneBtn.className = 'btn ' + (on ? 'ok' : 'ghost');
  }
  doneBtn.addEventListener('click', () => {
    state.progress = loadProgress(); // lấy trạng thái mới nhất, tránh ghi đè
    state.progress.done[lessonId] = !state.progress.done[lessonId];
    saveProgress(state.progress);
    renderDone();
  });
  renderDone();

  fillStds();
  selectEx(0);
}

// Ôn tập: nhớ câu trắc nghiệm đã trả lời sai. Đúng thì xóa khỏi danh sách ôn.
const REVIEW_KEY = 'hoc-cpp-review-v1';
function loadReview() {
  try { return JSON.parse(localStorage.getItem(REVIEW_KEY)) || {}; } catch (e) { return {}; }
}
function setReviewWrong(lessonId, qi, wrong) {
  const r = loadReview();
  r[lessonId] = r[lessonId] || {};
  if (wrong) r[lessonId][qi] = true; else delete r[lessonId][qi];
  if (!Object.keys(r[lessonId]).length) delete r[lessonId];
  try { localStorage.setItem(REVIEW_KEY, JSON.stringify(r)); } catch (e) {}
}
