// Trợ giảng chữ cho các trang học. Mỗi mục (h2) của trang là một bước; người học tự đánh dấu Đạt / Lỗi / Bỏ qua.
// Không bấm hay điền gì trên trang. Mọi chữ đưa vào bằng textContent. Trạng thái lưu cục bộ trên máy này.
(function () {
  'use strict';
  if (window.TutorPanel) return;

  var MARK = { pass: '✓', fail: '✗', skip: '–' };
  var LABEL = { pass: 'Đạt', fail: 'Lỗi', skip: 'Bỏ qua' };
  var KEY = 'tutor-panel:' + location.pathname + location.search;
  var state = { steps: [], i: 0, status: {}, note: '', sig: null };
  var panel = null;

  var CSS = [
    '.tutor-panel{box-sizing:border-box;margin:18px auto 24px;max-width:720px;padding:14px;border:1px solid #e2e6ee;border-radius:14px;background:#fff;color:#221F1B;font-family:inherit;font-size:15px;line-height:1.5}',
    '.tutor-panel *{box-sizing:border-box}',
    '@media (min-width:1000px){.tutor-panel{position:fixed;right:16px;top:72px;width:280px;max-width:none;max-height:calc(100vh - 88px);overflow:auto;margin:0;z-index:20}body>main{margin-right:300px}}',
    '.tp-head{display:flex;gap:10px;align-items:center;margin-bottom:10px}',
    '.tp-avatar{width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#8A2E22,#7A2318);color:#fff;font-weight:800;font-size:13px;display:grid;place-items:center;flex:none}',
    '.tp-count{font-size:13px;color:#6B6259}',
    '.tp-card{border:1px solid #E6DCD0;border-radius:12px;padding:12px;background:#fbfcfe}',
    '.tp-step{font-size:12px;color:#6B6259;font-weight:700}',
    '.tp-title{font-size:16px;margin:4px 0 6px;color:#221F1B}',
    '.tp-body{max-height:260px;overflow-y:auto;margin-top:6px;padding-right:4px}',
    '.tp-text{margin:0 0 6px;font-size:14px}',
    '.tp-hl{outline:2px solid #8A2E22;outline-offset:4px;border-radius:6px;transition:outline-color .3s}',
    '.tp-now{font-size:12px;color:#7A2318;font-weight:700;margin-top:6px}',
    '.tp-marks,.tp-nav{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}',
    '.tp-btn{font:inherit;font-size:13px;padding:6px 10px;border:1px solid #D9CFC2;border-radius:8px;background:#fff;color:#221F1B;cursor:pointer}',
    '.tp-btn.on{background:#221F1B;color:#fff;border-color:#221F1B}',
    '.tp-btn:disabled{opacity:.45;cursor:not-allowed}',
    '.tp-list{margin:10px 0 0;padding-left:18px;font-size:13px;max-height:200px;overflow-y:auto}',
    '.tp-list li{margin-bottom:3px}',
    '.tp-list button{background:none;border:0;padding:0;font:inherit;text-align:left;color:#221F1B;cursor:pointer}',
    '.tp-list li.on button{font-weight:800;text-decoration:underline}',
    '.tp-note{display:block;width:100%;min-height:70px;margin-top:10px;font:inherit;font-size:14px;padding:8px;border:1px solid #D9CFC2;border-radius:8px;resize:vertical;background:#fff;color:#221F1B}'
  ].join('\n');

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  }

  function load() {
    try {
      var s = JSON.parse(localStorage.getItem(KEY) || '{}');
      if (s && typeof s === 'object') return s;
    } catch (e) { /* bộ nhớ bị chặn: dùng trạng thái tạm */ }
    return {};
  }
  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify({ i: state.i, status: state.status, note: state.note }));
    } catch (e) { /* bỏ qua */ }
  }

  function isVisible(h) {
    return !h.closest('[hidden]') && !h.closest('.tutor-panel');
  }

  // Nội dung của một mục: các đoạn, ý trong danh sách và dòng bảng, đến tiêu đề kế tiếp.
  function sectionOf(h) {
    var out = [];
    var nodes = [];
    for (var n = h.nextElementSibling; n && !/^H[1-3]$/.test(n.tagName); n = n.nextElementSibling) {
      if (isVisible(n)) nodes.push(n);
    }
    nodes.forEach(function (n) {
      var items = n.matches('p, li, blockquote, tr, pre') ? [n] : Array.prototype.slice.call(n.querySelectorAll('p, li, tr'));
      items.forEach(function (x) {
        if (x.tagName === 'TR') {
          var cells = Array.prototype.map.call(x.children, function (c) { return c.textContent.replace(/\s+/g, ' ').trim(); });
          var row = cells.filter(Boolean).join(' | ');
          if (row) out.push(row);
          return;
        }
        var t = x.textContent.replace(/\s+/g, ' ').trim();
        if (t && out.indexOf(t) === -1) out.push(t);
      });
    });
    return { nodes: nodes, lines: out };
  }

  function stepsFromPage() {
    var main = document.querySelector('main') || document.body;
    var hs = Array.prototype.filter.call(main.querySelectorAll('h2'), isVisible);
    if (!hs.length) hs = Array.prototype.filter.call(main.querySelectorAll('h1'), isVisible);
    return hs.map(function (h) {
      var title = h.textContent.replace(/\s+/g, ' ').trim();
      var sec = sectionOf(h);
      return { key: title, title: title, node: h, nodes: sec.nodes, lines: sec.lines };
    }).filter(function (s) { return s.title; });
  }

  // Làm nổi bật mục đang chọn trên trang.
  function highlight(step) {
    state.steps.forEach(function (s) {
      (s.nodes || []).forEach(function (n) { n.classList.remove('tp-hl'); });
    });
    if (step) (step.nodes || []).forEach(function (n) { n.classList.add('tp-hl'); });
  }

  // Chọn mục theo vị trí cuộn: mục có tiêu đề gần đầu màn hình nhất.
  function syncToScroll() {
    var best = -1;
    state.steps.forEach(function (s, j) {
      if (s.node && s.node.getBoundingClientRect().top <= 140) best = j;
    });
    if (best !== -1 && best !== state.i) {
      state.i = best;
      save();
      render();
    }
  }
  var syncing = null;
  function watchPage() {
    // Bấm mục lục hoặc bấm vào nội dung: đợi trang cuộn xong rồi đồng bộ.
    document.addEventListener('click', function (e) {
      if (panel && panel.contains(e.target)) return;
      if (!e.target.closest || !e.target.closest('main, nav, .toc, #toc, aside')) return;
      clearTimeout(syncing);
      syncing = setTimeout(syncToScroll, 350);
    });
    var t = null;
    window.addEventListener('scroll', function () {
      clearTimeout(t);
      t = setTimeout(syncToScroll, 250);
    }, { passive: true });
  }

  function build() {
    var steps = stepsFromPage();
    if (!steps.length) steps = [{ key: '_trang', title: document.title || 'Trang này', lines: ['Trang này chưa có mục nào để theo dõi.'] }];
    var sig = steps.map(function (s) { return s.key; }).join('|');
    if (sig === state.sig) {
      // Cùng danh sách mục nhưng nội dung có thể đã dựng lại: cập nhật tham chiếu.
      state.steps.forEach(function (s, j) {
        if (steps[j]) { s.node = steps[j].node; s.nodes = steps[j].nodes; s.lines = steps[j].lines; }
      });
      return;
    }
    state.sig = sig;
    state.steps = steps;
    if (state.i >= steps.length) state.i = 0;
    render();
  }

  // Chọn một mục; nếu scroll = true thì cuộn trang tới mục đó.
  function select(j, scroll) {
    state.i = Math.min(Math.max(0, j), state.steps.length - 1);
    save();
    render();
    var s = state.steps[state.i];
    if (scroll && s && s.node && s.node.scrollIntoView) {
      var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
      s.node.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    }
  }

  // Đặt khung ngay dưới thanh tiêu đề của từng trang, để không che menu.
  function place() {
    if (!panel || !window.matchMedia || !matchMedia('(min-width:1000px)').matches) return;
    var h = document.querySelector('header.top, header.mast, header');
    var top = Math.max(12, Math.round(h ? h.getBoundingClientRect().bottom : 0) + 12);
    panel.style.top = top + 'px';
    panel.style.maxHeight = Math.max(200, innerHeight - top - 16) + 'px';
  }

  function go(d) { select(state.i + d, true); }

  function setStatus(key, k) {
    if (state.status[key] === k) delete state.status[key];
    else state.status[key] = k;
    save();
    render();
  }

  function render() {
    if (!panel) {
      panel = el('aside', 'tutor-panel');
      panel.setAttribute('aria-label', 'Trợ giảng');
      document.body.appendChild(panel);
    }
    panel.replaceChildren();
    var s = state.steps[state.i];
    var stepKeys = state.steps.map(function (x) { return x.key; });
    var done = Object.keys(state.status).filter(function (k) { return stepKeys.indexOf(k) !== -1; }).length;

    var head = el('div', 'tp-head');
    head.appendChild(el('span', 'tp-avatar', 'TG'));
    var hw = el('div');
    hw.appendChild(el('strong', null, 'Trợ giảng'));
    hw.appendChild(el('div', 'tp-count', 'Đã làm ' + done + '/' + state.steps.length + ' bước'));
    head.appendChild(hw);
    panel.appendChild(head);

    var card = el('div', 'tp-card');
    card.appendChild(el('div', 'tp-step', 'Bước ' + (state.i + 1) + '/' + state.steps.length));
    card.appendChild(el('h3', 'tp-title', s.title));
    var body = el('div', 'tp-body');
    var lines = s.lines && s.lines.length ? s.lines : ['Mục này chỉ có tiêu đề. Đọc tiếp phần bên dưới trang.'];
    lines.forEach(function (t) { body.appendChild(el('p', 'tp-text', t)); });
    card.appendChild(body);
    highlight(s);
    var st = state.status[s.key];
    if (st) card.appendChild(el('div', 'tp-now', 'Đã đánh dấu: ' + LABEL[st]));
    panel.appendChild(card);

    var marks = el('div', 'tp-marks');
    ['pass', 'fail', 'skip'].forEach(function (k) {
      var b = el('button', 'tp-btn' + (st === k ? ' on' : ''), k === 'pass' ? 'Đạt ✓' : k === 'fail' ? 'Lỗi ✗' : 'Bỏ qua');
      b.type = 'button';
      b.addEventListener('click', function () { setStatus(s.key, k); });
      marks.appendChild(b);
    });
    panel.appendChild(marks);

    var nav = el('div', 'tp-nav');
    var prev = el('button', 'tp-btn', '← Quay lại');
    prev.type = 'button';
    prev.disabled = state.i === 0;
    prev.addEventListener('click', function () { go(-1); });
    var next = el('button', 'tp-btn', 'Tiếp →');
    next.type = 'button';
    next.disabled = state.i >= state.steps.length - 1;
    next.addEventListener('click', function () { go(1); });
    nav.appendChild(prev);
    nav.appendChild(next);
    panel.appendChild(nav);

    var list = el('ol', 'tp-list');
    state.steps.forEach(function (x, j) {
      var li = el('li', j === state.i ? 'on' : null);
      var b = el('button', null, (MARK[state.status[x.key]] || '·') + ' ' + x.title);
      b.type = 'button';
      b.addEventListener('click', function () { select(j, true); });
      li.appendChild(b);
      list.appendChild(li);
    });
    panel.appendChild(list);

    var note = el('textarea', 'tp-note');
    note.placeholder = 'Ghi chú: thấy gì, mong đợi gì';
    note.setAttribute('aria-label', 'Ghi chú');
    note.value = state.note;
    note.addEventListener('input', function () { state.note = note.value; save(); });
    panel.appendChild(note);
    place();
  }

  function init() {
    var saved = load();
    state.i = Number(saved.i) || 0;
    state.status = saved.status && typeof saved.status === 'object' ? saved.status : {};
    state.note = typeof saved.note === 'string' ? saved.note : '';
    var style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);
    build();
    watchPage();
    window.addEventListener('resize', place);
    // Nội dung bài có thể được dựng sau (tải bằng fetch); theo dõi để cập nhật danh sách bước.
    var timer = null;
    new MutationObserver(function () {
      clearTimeout(timer);
      timer = setTimeout(build, 400);
    }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden'] });
  }

  window.TutorPanel = { build: build };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
