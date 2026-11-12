// Trang hướng dẫn test app Sao Mai: bên trái là app (iframe cùng gốc), bên phải là trợ giảng.
// Trợ giảng khoanh chỗ cần test, di con trỏ, tự điền mẫu, tự bấm, rồi tự kiểm kết quả.
// Kịch bản đọc từ content/lab/huong-dan.json. Chữ hiển thị bằng textContent, không chèn HTML.
(function () {
  'use strict';
  var DATA_URL = 'content/lab/huong-dan.json';
  var STORE_KEY = 'huong-dan-test-v1';
  var STATUS_MARK = { pass: '✓', fail: '✗', skip: '–' };
  var reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  var frame = document.getElementById('app-frame');
  var ring = document.getElementById('hd-ring');
  var cursor = document.getElementById('hd-cursor');
  var chat = document.getElementById('hd-chat');
  var list = document.getElementById('hd-steps');
  var note = document.getElementById('hd-note');
  var count = document.getElementById('hd-count');
  var buildSel = document.getElementById('hd-build');
  var openLink = document.getElementById('hd-open');
  var btnBack = document.getElementById('hd-back');
  var btnAgain = document.getElementById('hd-again');
  var btnHint = document.getElementById('hd-hint');
  var btnDemo = document.getElementById('hd-demo');
  var btnPass = document.getElementById('hd-pass');
  var btnFail = document.getElementById('hd-fail');
  var btnSkip = document.getElementById('hd-skip');
  var ctrls = [btnBack, btnAgain, btnHint, btnDemo, btnPass, btnFail, btnSkip];

  var steps = [];
  var idx = 0;
  var results = {};
  var currentTarget = null;
  var watchedWin = null;
  var running = false;

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  }
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, reduceMotion ? Math.min(ms, 40) : ms); }); }
  function norm(s) { return String(s || '').replace(/\s+/g, ' ').trim().toLowerCase(); }

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

  // ----- Truy cập app trong iframe -----
  function appDoc() {
    try { return frame.contentDocument; } catch (e) { return null; }
  }
  function appLab() {
    try { return frame.contentWindow.Lab; } catch (e) { return null; }
  }
  function showView(view) {
    var d = appDoc();
    if (!d || !view) return;
    var b = d.querySelector('.views button[data-view="' + view + '"]');
    if (b && b.getAttribute('aria-current') !== 'page') b.click();
  }
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
  function findAny(selector) {
    var d = appDoc();
    if (!d) return null;
    try { return d.querySelector(selector); } catch (e) { return null; }
  }
  // Đổi token trong giá trị mẫu: {today}, {plus:N} theo đồng hồ của app.
  function resolve(value) {
    var L = appLab();
    if (!L || typeof value !== 'string') return value;
    return value
      .replace(/\{today\}/g, L.toStr(L.today()))
      .replace(/\{ngay:(-?\d+)\}/g, function (m, n) { return nextOpenDay(L, Number(n)); })
      .replace(/\{plus:(-?\d+)\}/g, function (m, n) { return L.plus(Number(n)); });
  }
  // Ngày an toàn từ N ngày tới: tránh Chủ nhật (bản 1.1) và Thứ Bảy (bản 1.0 đóng cửa Thứ Bảy).
  function nextOpenDay(L, n) {
    var d = L.today();
    d.setDate(d.getDate() + n);
    while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1);
    return L.toStr(d);
  }

  // App được thu còn APP_SCALE (CSS transform). Toạ độ trong app phải nhân tỉ lệ khi đưa ra khung trang.
  var APP_SCALE = 0.75;
  function inPage(node) {
    var fr = frame.getBoundingClientRect();
    var r = node.getBoundingClientRect();
    return {
      left: fr.left + r.left * APP_SCALE,
      top: fr.top + r.top * APP_SCALE,
      right: fr.left + r.right * APP_SCALE,
      bottom: fr.top + r.bottom * APP_SCALE,
      width: r.width * APP_SCALE,
      height: r.height * APP_SCALE
    };
  }

  // ----- Vòng khoanh (đứng yên) -----
  function drawRing() {
    if (!currentTarget || currentTarget.offsetParent === null) { ring.hidden = true; return; }
    var r = inPage(currentTarget);
    var pad = 6;
    ring.hidden = false;
    ring.style.left = (r.left - pad) + 'px';
    ring.style.top = (r.top - pad) + 'px';
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

  // ----- Con trỏ của trợ giảng -----
  function cursorTo(node) {
    if (!node) return;
    var r = inPage(node);
    var x = r.left + Math.min(r.width / 2, 60);
    var y = r.top + r.height / 2;
    cursor.hidden = false;
    cursor.style.transform = 'translate(' + x + 'px,' + y + 'px)';
  }
  async function moveTo(node) {
    if (!node) throw new Error('không thấy phần tử cần thao tác');
    try { node.scrollIntoView({ block: 'center' }); } catch (e) { /* bỏ qua */ }
    await sleep(120);
    cursorTo(node);
    owlTo(node);
    await sleep(reduceMotion ? 40 : 650);
  }
  function fireEvents(node, names) {
    var win = node.ownerDocument.defaultView;
    names.forEach(function (n) { node.dispatchEvent(new win.Event(n, { bubbles: true })); });
  }
  async function pressFx() {
    cursor.classList.add('press');
    await sleep(160);
    cursor.classList.remove('press');
  }
  function needNode(sel) {
    var node = findAny(sel);
    if (!node) throw new Error('không thấy ' + sel);
    return node;
  }

  // ----- Thao tác mẫu -----
  async function actFill(sel, value) {
    var node = needNode(sel);
    await moveTo(node);
    node.focus();
    if (node.tagName === 'SELECT' || node.type === 'date') {
      node.value = value;
    } else {
      node.value = '';
      var acc = '';
      for (var i = 0; i < String(value).length; i++) {
        acc += String(value)[i];
        node.value = acc;
        await sleep(45);
      }
    }
    fireEvents(node, ['input', 'change']);
  }
  async function actSelect(sel, value) {
    var node = needNode(sel);
    await moveTo(node);
    node.value = value;
    fireEvents(node, ['change']);
  }
  async function actCheck(sel, on) {
    var node = needNode(sel);
    await moveTo(node);
    node.checked = !!on;
    fireEvents(node, ['change']);
  }
  async function actClick(sel, wait) {
    var node = needNode(sel);
    await moveTo(node);
    await pressFx();
    node.click();
    await sleep(wait === undefined ? 300 : wait);
  }
  async function actClickIn(scopeSel, text, buttonText, wait) {
    var scope = needNode(scopeSel);
    var row = Array.prototype.find.call(scope.querySelectorAll('tr'), function (tr) {
      return tr.textContent.indexOf(text) >= 0;
    });
    if (!row) throw new Error('không thấy dòng ' + text);
    var btn = Array.prototype.find.call(row.querySelectorAll('button'), function (b) {
      return norm(b.textContent) === norm(buttonText);
    });
    if (!btn) throw new Error('không thấy nút "' + buttonText + '" ở dòng ' + text);
    await moveTo(btn);
    await pressFx();
    btn.click();
    await sleep(wait === undefined ? 300 : wait);
  }
  async function actReset() {
    var L = appLab();
    if (!L) throw new Error('chưa mở được app');
    L.reset();
    var win = frame.contentWindow;
    var loaded = new Promise(function (res) { frame.addEventListener('load', res, { once: true }); });
    win.location.reload();
    await loaded;
    await sleep(300);
  }

  // Kiểm kết quả: vùng chứa sel phải có chữ text.
  function checkText(sel, text) {
    var node = findAny(sel);
    return !!node && norm(node.textContent).indexOf(norm(resolve(text))) >= 0;
  }

  // ----- Trợ giảng -----
  function botSay(text, cls) {
    var m = el('div', 'msg bot' + (cls ? ' ' + cls : ''));
    m.append(el('span', 'who', 'Trợ giảng'), el('span', 'txt', text));
    chat.appendChild(m);
    chat.scrollTop = chat.scrollHeight;
    return m;
  }
  // Trợ giảng "đang gõ" rồi mới hiện câu, giống chat thật.
  async function botSayTyping(text) {
    var m = el('div', 'msg bot');
    var dots = el('span', 'th-typing');
    dots.append(el('i'), el('i'), el('i'));
    m.append(el('span', 'who', 'Trợ giảng'), dots);
    chat.appendChild(m);
    chat.scrollTop = chat.scrollHeight;
    await sleep(Math.min(1100, 400 + text.length * 12));
    dots.remove();
    m.appendChild(el('span', 'txt', text));
    chat.scrollTop = chat.scrollHeight;
  }

  // Khối đề bài: tiêu đề, lời giảng, các bước 1-2-3, và hộp hướng giải.
  function renderCard(step, i) {
    var card = document.getElementById('hd-card');
    if (!card) return;
    card.replaceChildren();
    card.appendChild(el('h2', '', 'Câu ' + (i + 1) + ': ' + step.title));
    card.appendChild(el('p', '', step.say));

    var blocks = el('div', 'hd-blocks');
    blocks.appendChild(block('Khoanh chỗ cần xem', step.target ? 'Vòng vàng trong app là chỗ làm việc của bước này.' : 'Mở đúng tab rồi làm theo bước.'));
    blocks.appendChild(block('Làm gì', step.do));
    blocks.appendChild(block('Kỳ vọng', step.expect));
    card.appendChild(blocks);

    if (step.technique || step.hint) {
      var hint = el('div', 'hd-hint');
      hint.appendChild(el('h3', '', 'Hướng giải'));
      var ol = el('ol');
      if (step.technique) ol.appendChild(el('li', '', step.technique));
      if (step.hint) ol.appendChild(el('li', '', step.hint));
      hint.appendChild(ol);
      card.appendChild(hint);
    }
  }
  function block(title, text) {
    var b = el('div', 'hd-block');
    b.appendChild(el('h3', '', title));
    b.appendChild(el('p', '', text || ''));
    return b;
  }
  // Chọn bước từ menu: nhảy tới câu đó và đóng menu.
  function pickStep(i) {
    var picker = document.querySelector('.hd-picker');
    if (picker) picker.open = false;
    goTo(i);
  }

  function renderList() {
    list.replaceChildren();
    steps.forEach(function (s, i) {
      var r = results[s.id];
      var st = r ? r.status : '';
      var li = el('li', (st ? st : '') + (i === idx ? ' cur' : ''));
      li.setAttribute('role', 'button');
      li.tabIndex = 0;
      li.append(el('span', 'n', String(i + 1) + '.'), el('span', 't', s.title), el('span', 's', st ? STATUS_MARK[st] : ''));
      li.addEventListener('click', function () { pickStep(i); });
      li.addEventListener('keydown', function (e) { if (e.key === 'Enter') pickStep(i); });
      list.appendChild(li);
    });
    var done = Object.keys(results).filter(function (k) { return results[k] && results[k].status; }).length;
    count.textContent = 'Đã làm ' + done + '/' + steps.length + ' bước';
    var now = document.getElementById('hd-now');
    if (now && steps[idx]) now.textContent = 'Bước ' + (idx + 1) + ': ' + steps[idx].title;
  }
  // ----- Cú trợ giảng bay tới từng ô, và phụ đề gõ dần dưới khung app -----
  var owl = document.getElementById('hd-owl');
  if (owl && tutor) {
    var svgSrc = tutor.querySelector('svg');
    if (svgSrc) owl.appendChild(svgSrc.cloneNode(true));
  }
  function owlTo(node) {
    if (!owl || !node) return;
    var fr = frame.getBoundingClientRect();
    var r = inPage(node);
    var x = Math.min(r.right + 10, fr.right - 124);
    var y = Math.max(r.top - 34, fr.top + 6);
    owl.hidden = false;
    owl.style.transform = 'translate(' + x + 'px,' + y + 'px)';
  }
  function setOwlPose(pose) {
    if (owl) owl.className = 'hd-owl tutor ' + pose;
  }
  function hideOwl() {
    if (owl) owl.hidden = true;
  }
  // Phụ đề dưới khung app: mỗi dòng gõ dần, các dòng trước vẫn giữ và cuộn.
  // Lời trợ giảng gõ dần ngay trong khung trợ giảng bên phải. Dòng mới luôn cuộn vào tầm mắt.
  var scroller = document.getElementById('hd-scroll');
  function scrollToNew() {
    if (scroller) scroller.scrollTop = scroller.scrollHeight;
  }
  async function typeCaption(text, cls) {
    var m = el('div', 'msg bot' + (cls ? ' ' + cls : ''));
    var who = el('span', 'who', 'Trợ giảng');
    var body = el('span', 'txt', '');
    m.append(who, body);
    chat.appendChild(m);
    scrollToNew();
    for (var i = 0; i < text.length; i++) {
      body.textContent += text[i];
      if (i % 4 === 0) scrollToNew();
      await sleep(16);
    }
    scrollToNew();
  }
  function resetCaption() { /* phụ đề nằm trong khung trợ giảng, không cần dọn riêng */ }
  function clearCaptionLater() { /* giữ nguyên lời trợ giảng để đọc lại */ }

  // Tư thế của trợ giảng: idle, point, think, happy, oops. Tự về idle sau ms nếu có.
  var tutor = document.getElementById('hd-tutor');
  var poseTimer = null;
  function setPose(pose, ms) {
    if (!tutor) return;
    tutor.className = 'tutor ' + pose;
    clearTimeout(poseTimer);
    if (ms) poseTimer = setTimeout(function () { tutor.className = 'tutor idle'; }, ms);
  }

  function setBusy(v) {
    running = v;
    ctrls.forEach(function (b) { b.disabled = v; });
  }

  async function enterStep(i) {
    idx = i;
    var step = steps[i];
    note.value = (results[step.id] && results[step.id].note) || '';
    cursor.hidden = true;
    setPose('idle');
    renderList();
    renderCard(step, i);
    btnBack.disabled = i === 0;
    var target = await spotlight(step);
    if (!target && !step.auto) botSay('Chưa thấy phần này trong app. Hãy mở đúng tab hoặc làm bước trước rồi bấm Khoanh lại.');
  }
  function goTo(i) {
    if (running || i < 0 || i >= steps.length) return;
    enterStep(i);
  }

  // Chạy mẫu: trợ giảng tự thao tác, rồi kiểm kết quả từng bước.
  async function runDemo() {
    if (running) return;
    var step = steps[idx];
    if (!step.auto) return;
    setBusy(true);
    setPose('point');
    setOwlPose('point');
    resetCaption();
    var pass = 0, fail = 0;
    try {
      botSay('Mình làm mẫu bước này. Xem con trỏ và cú.');
      await spotlight(step);
      if (currentTarget) owlTo(currentTarget);
      for (var k = 0; k < step.auto.length; k++) {
        var a = step.auto[k];
        if (a.say) { await typeCaption(a.say); continue; }
        if (a.reset) { await actReset(); showView(step.view); await sleep(300); continue; }
        if (a.fillForm) {
          for (var sel in a.fillForm) {
            if (Object.prototype.hasOwnProperty.call(a.fillForm, sel)) await actFill(sel, resolve(a.fillForm[sel]));
          }
          if (a.click) await actClick(a.click, a.wait);
          continue;
        }
        if (a.fill) { await actFill(a.fill, resolve(a.value)); continue; }
        if (a.select) { await actSelect(a.select, resolve(a.value)); continue; }
        if (a.check) { await actCheck(a.check, a.on); continue; }
        if (a.clickIn) { await actClickIn(a.clickIn, a.text, a.button, a.wait); continue; }
        if (a.click) { await actClick(a.click, a.wait); continue; }
        if (a.wait) { await sleep(a.wait); continue; }
        if (a.expect) {
          var ok = checkText(a.expect, a.text);
          if (ok) pass++; else fail++;
          var line;
          if (ok) {
            line = '✓ Đúng kỳ vọng: "' + a.text + '"';
            setOwlPose('happy');
          } else {
            line = '✗ Ghi lỗi: ' + (step.khu || step.title) + '. Người xử lý: ' + (step.chu || 'chưa phân công') +
              '. Không thấy "' + a.text + '" trong ' + a.expect + '.';
            setOwlPose('oops');
          }
          await typeCaption(line, ok ? 'good' : 'bad');
          await sleep(500);
          setOwlPose('point');
        }
      }
      botSay('Mẫu xong: ' + pass + ' kiểm tra đúng, ' + fail + ' chưa khớp.' +
        (fail
          ? ' Khác kỳ vọng nghĩa là có thể là lỗi của app. Hãy làm tay lại, bấm Lỗi ✗ và ghi rõ thấy gì.'
          : ' Giờ bạn tự làm lại, rồi bấm Đạt.'));
    } catch (err) {
      botSay('Mẫu dừng lại: ' + err.message + '. Bạn làm tay phần còn lại nhé.');
    } finally {
      cursor.classList.remove('press');
      setBusy(false);
      setPose('idle');
      setOwlPose('idle');
      setTimeout(hideOwl, 1500);
      clearCaptionLater(12000);
      drawRing();
    }
  }

  function record(status) {
    if (running) return;
    var step = steps[idx];
    results[step.id] = { status: status, note: note.value.trim(), at: new Date().toISOString() };
    saveResults();
    setPose(status === 'pass' ? 'happy' : status === 'fail' ? 'oops' : 'idle', 1800);
    if (status === 'fail') {
      botSay('Ghi lỗi: ' + (step.khu || step.title) + '. Người xử lý: ' + (step.chu || 'chưa phân công') + '.' +
        (results[step.id].note ? ' Mô tả: ' + results[step.id].note : ' Chưa có mô tả, bạn nên ghi thấy gì và mong đợi gì.'));
    }
    if (idx < steps.length - 1) { enterStep(idx + 1); return; }
    finish();
  }

  function finish() {
    currentTarget = null;
    ring.hidden = true;
    cursor.hidden = true;
    renderList();
    var all = steps.map(function (s) { return results[s.id]; });
    var pass = all.filter(function (r) { return r && r.status === 'pass'; }).length;
    var failed = steps.filter(function (s) { return results[s.id] && results[s.id].status === 'fail'; });
    var skip = all.filter(function (r) { return r && r.status === 'skip'; }).length;
    var summary = botSay('Xong ' + steps.length + ' bước: ' + pass + ' đạt, ' + failed.length + ' lỗi, ' + skip + ' bỏ qua.');
    if (failed.length) {
      // Gom lỗi theo người xử lý để biết ai nhận phần nào.
      var owners = {};
      failed.forEach(function (s) {
        var key = s.chu || 'chưa phân công';
        (owners[key] = owners[key] || []).push(s);
      });
      Object.keys(owners).forEach(function (owner) {
        summary.appendChild(el('p', 'hd-owner', owner + ' (' + owners[owner].length + ' lỗi)'));
        var ul = el('ul', 'hd-summary');
        owners[owner].forEach(function (s) {
          var r = results[s.id];
          ul.appendChild(el('li', '', (s.khu || s.title) + (r.note ? ': ' + r.note : '')));
        });
        summary.appendChild(ul);
      });
    }
  }

  function hint() {
    var step = steps[idx];
    setPose('think', 2500);
    botSay(step.hint || 'Bước này không có gợi ý thêm. Đọc lại phần Làm và Kỳ vọng.');
  }

  // ----- Đổi bản dựng -----
  function setBuild(v) {
    var build = v === '1.1' ? '1.1' : '1.0';
    openLink.href = 'lab/index.html?build=' + build;
    frame.src = 'lab/index.html?build=' + build + '&embed=1';
  }
  frame.addEventListener('load', function () {
    watchAppScroll();
    if (steps.length && !running) spotlight(steps[idx]);
  });
  window.addEventListener('resize', drawRing);
  window.addEventListener('scroll', drawRing, { passive: true });

  // ----- Sự kiện -----
  btnDemo.addEventListener('click', runDemo);
  btnPass.addEventListener('click', function () { record('pass'); });
  btnFail.addEventListener('click', function () { record('fail'); });
  btnSkip.addEventListener('click', function () { record('skip'); });
  btnBack.addEventListener('click', function () { goTo(idx - 1); });
  btnAgain.addEventListener('click', function () { if (!running) spotlight(steps[idx]); });
  btnHint.addEventListener('click', hint);
  buildSel.addEventListener('change', function () { setBuild(buildSel.value); });

  // ----- Khởi động -----
  results = loadResults();
  fetch(DATA_URL, { cache: 'no-store' })
    .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then(function (data) {
      steps = data.steps || [];
      var start = 0;
      while (start < steps.length && results[steps[start].id]) start++;
      idx = start < steps.length ? start : 0;
      enterStep(idx);
    })
    .catch(function (err) {
      botSay('Không tải được kịch bản (' + err.message + '). Hãy mở trang qua localhost hoặc trang web.');
    });
})();
