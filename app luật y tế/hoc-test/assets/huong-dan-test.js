// Trang hướng dẫn test app Sao Mai: bên trái là app (iframe cùng gốc), bên phải là trợ giảng.
// Kịch bản đọc từ content/lab/huong-dan.json. Chữ hiển thị bằng textContent, không chèn HTML.
(function () {
  'use strict';
  var DATA_URL = 'content/lab/huong-dan.json';
  var STORE_KEY = 'huong-dan-test-v1';
  var STATUS_MARK = { pass: '✓', fail: '✗', skip: '–' };
  var STATUS_LABEL = { pass: 'Đạt', fail: 'Lỗi', skip: 'Bỏ qua' };

  var frame = document.getElementById('app-frame');
  var ring = document.getElementById('hd-ring');
  var chat = document.getElementById('hd-chat');
  var list = document.getElementById('hd-steps');
  var note = document.getElementById('hd-note');
  var count = document.getElementById('hd-count');
  var buildSel = document.getElementById('hd-build');
  var openLink = document.getElementById('hd-open');
  var btnBack = document.getElementById('hd-back');
  var btnAgain = document.getElementById('hd-again');
  var btnHint = document.getElementById('hd-hint');
  var btnPass = document.getElementById('hd-pass');
  var btnFail = document.getElementById('hd-fail');
  var btnSkip = document.getElementById('hd-skip');

  var steps = [];
  var idx = 0;
  var results = {};
  var currentTarget = null;
  var watchedWin = null;

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  }
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  // ----- Lưu kết quả: chỉ để tiện xem lại trên máy này -----
  function loadResults() {
    try {
      var raw = JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
      return raw && typeof raw === 'object' ? raw : {};
    } catch (e) { return {}; }
  }
  function saveResults() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(results)); } catch (e) { /* bộ nhớ đầy hoặc bị chặn */ }
  }

  // ----- Điều khiển app trong iframe -----
  function appDoc() {
    try { return frame.contentDocument; } catch (e) { return null; }
  }
  function showView(view) {
    var d = appDoc();
    if (!d || !view) return;
    var b = d.querySelector('.views button[data-view="' + view + '"]');
    if (b && b.getAttribute('aria-current') !== 'page') b.click();
  }
  // Lấy phần tử đầu tiên đang hiển thị trong danh sách chọn (ví dụ "#a, #b").
  function findVisible(selector) {
    var d = appDoc();
    if (!d || !selector) return null;
    var nodes;
    try { nodes = d.querySelectorAll(selector); } catch (e) { return null; }
    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i].offsetParent !== null) return nodes[i];
    }
    return null;
  }

  // Vẽ vòng khoanh quanh phần tử trong iframe (toạ độ theo khung trang).
  function drawRing() {
    if (!currentTarget || currentTarget.offsetParent === null) { ring.hidden = true; return; }
    var fr = frame.getBoundingClientRect();
    var r = currentTarget.getBoundingClientRect();
    var pad = 6;
    ring.hidden = false;
    ring.style.left = (fr.left + r.left - pad) + 'px';
    ring.style.top = (fr.top + r.top - pad) + 'px';
    ring.style.width = (r.width + pad * 2) + 'px';
    ring.style.height = (r.height + pad * 2) + 'px';
    if (r.bottom < 0 || r.top > window.innerHeight) ring.hidden = true;
  }
  function watchAppScroll() {
    var win = null;
    try { win = frame.contentWindow; } catch (e) { win = null; }
    if (!win || win === watchedWin) return;
    watchedWin = win;
    try { win.addEventListener('scroll', drawRing); win.addEventListener('resize', drawRing); } catch (e) { /* bỏ qua */ }
  }

  // Khoanh một bước: mở đúng tab, cuộn tới phần tử, rồi vẽ vòng.
  async function spotlight(step) {
    showView(step.view);
    await sleep(250);
    currentTarget = findVisible(step.target);
    if (currentTarget) {
      try { currentTarget.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch (e) { /* bỏ qua */ }
      await sleep(350);
    }
    drawRing();
    return currentTarget;
  }

  // ----- Trợ giảng và danh sách bước -----
  function botSay(text, cls) {
    var m = el('div', 'msg bot' + (cls ? ' ' + cls : ''));
    m.append(el('span', 'who', 'Trợ giảng'), el('span', '', text));
    chat.appendChild(m);
    chat.scrollTop = chat.scrollHeight;
  }
  function renderList() {
    list.replaceChildren();
    steps.forEach(function (s, i) {
      var r = results[s.id];
      var st = r ? r.status : '';
      var li = el('li', (st ? st : '') + (i === idx ? ' cur' : ''));
      li.setAttribute('role', 'button');
      li.tabIndex = 0;
      li.append(el('span', 'mark', st ? STATUS_MARK[st] : String(i + 1)), el('span', '', (i + 1) + '. ' + s.title));
      li.addEventListener('click', function () { goTo(i); });
      li.addEventListener('keydown', function (e) { if (e.key === 'Enter') goTo(i); });
      list.appendChild(li);
    });
    var done = Object.keys(results).filter(function (k) { return results[k] && results[k].status; }).length;
    count.textContent = 'Đã làm ' + done + '/' + steps.length + ' bước · bước hiện tại: ' + (idx + 1);
  }

  async function enterStep(i) {
    idx = i;
    var step = steps[i];
    note.value = (results[step.id] && results[step.id].note) || '';
    renderList();
    if (i === 0 && !chat.childElementCount) botSay('Mình sẽ khoanh chỗ cần test trong app bên trái. Làm theo từng bước, rồi bấm Đạt hoặc Lỗi.');
    botSay('Bước ' + (i + 1) + '/' + steps.length + ': ' + step.title, 'step');
    botSay('Khoanh: ' + step.say);
    botSay('Làm: ' + step.do);
    botSay('Kỳ vọng: ' + step.expect);
    var target = await spotlight(step);
    if (!target) botSay('Chưa thấy phần này trong app. Hãy mở đúng tab hoặc làm bước trước rồi bấm Khoanh lại.');
    btnBack.disabled = i === 0;
  }
  function goTo(i) {
    if (i < 0 || i >= steps.length) return;
    enterStep(i);
  }

  function record(status) {
    var step = steps[idx];
    results[step.id] = { status: status, note: note.value.trim(), at: new Date().toISOString() };
    saveResults();
    if (status === 'fail') botSay('Đã ghi lỗi. Ghi rõ thấy gì và mong đợi gì trong ô ghi chú, để người khác tái hiện được.');
    if (idx < steps.length - 1) { enterStep(idx + 1); return; }
    finish();
  }

  function finish() {
    currentTarget = null;
    ring.hidden = true;
    renderList();
    var summary = el('div', 'msg bot');
    summary.append(el('span', 'who', 'Trợ giảng'));
    var all = steps.map(function (s) { return results[s.id]; });
    var pass = all.filter(function (r) { return r && r.status === 'pass'; }).length;
    var fail = all.filter(function (r) { return r && r.status === 'fail'; });
    var skip = all.filter(function (r) { return r && r.status === 'skip'; }).length;
    summary.append(el('span', '', 'Xong ' + steps.length + ' bước: ' + pass + ' đạt, ' + fail.length + ' lỗi, ' + skip + ' bỏ qua.'));
    if (fail.length) {
      var ul = el('ul', 'hd-summary');
      steps.forEach(function (s) {
        var r = results[s.id];
        if (r && r.status === 'fail') ul.appendChild(el('li', '', s.title + (r.note ? ': ' + r.note : '')));
      });
      summary.appendChild(ul);
    }
    chat.appendChild(summary);
    chat.scrollTop = chat.scrollHeight;
  }

  function hint() {
    var step = steps[idx];
    botSay(step.hint || 'Bước này không có gợi ý thêm. Hãy đọc lại phần Làm và Kỳ vọng.');
  }

  // ----- Đổi bản dựng -----
  function setBuild(v) {
    var build = v === '1.1' ? '1.1' : '1.0';
    openLink.href = 'lab/index.html?build=' + build;
    frame.src = 'lab/index.html?build=' + build;
  }
  // Khi iframe tải lại (đổi bản dựng), khoanh lại bước hiện tại mà không lặp tin nhắn.
  frame.addEventListener('load', function () {
    watchAppScroll();
    if (steps.length) spotlight(steps[idx]);
  });
  window.addEventListener('resize', drawRing);
  window.addEventListener('scroll', drawRing, { passive: true });

  // ----- Sự kiện -----
  btnPass.addEventListener('click', function () { record('pass'); });
  btnFail.addEventListener('click', function () { record('fail'); });
  btnSkip.addEventListener('click', function () { record('skip'); });
  btnBack.addEventListener('click', function () { goTo(idx - 1); });
  btnAgain.addEventListener('click', function () { enterStep(idx); });
  btnHint.addEventListener('click', hint);
  buildSel.addEventListener('change', function () { setBuild(buildSel.value); });

  // ----- Khởi động -----
  results = loadResults();
  fetch(DATA_URL, { cache: 'no-store' })
    .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then(function (data) {
      steps = data.steps || [];
      document.getElementById('hd-title').textContent = 'Test app Phòng khám Sao Mai';
      var start = 0;
      while (start < steps.length && results[steps[start].id]) start++;
      idx = start < steps.length ? start : 0;
      enterStep(idx);
    })
    .catch(function (err) {
      botSay('Không tải được kịch bản (' + err.message + '). Hãy mở trang qua localhost hoặc trang web.');
    });
})();
