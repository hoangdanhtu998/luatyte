// Trình xem bài học dạng slide: đoạn văn, trắc nghiệm, điền chỗ trống (ô chọn 4 đáp án), tự luận có đáp án mẫu.
(function () {
  var params = new URLSearchParams(location.search);
  var lesson = params.get('lesson') || 'dao-duc';
  var stage = document.getElementById('stage');
  var bar = document.getElementById('progress');
  var prev = document.getElementById('prev');
  var next = document.getElementById('next');
  var counter = document.getElementById('counter');
  var titleEl = document.getElementById('lesson-title');
  var slides = [], idx = 0, score = { ok: 0, total: 0 }, answered = {};
  var PROG_KEY = 'luatyte-slides-progress';
  function allProg() { try { return JSON.parse(localStorage.getItem(PROG_KEY) || '{}'); } catch (e) { return {}; } }
  function saveProg() {
    try {
      var all = allProg();
      all[lesson] = { index: idx, score: score, answered: answered, updated: new Date().toISOString() };
      localStorage.setItem(PROG_KEY, JSON.stringify(all));
    } catch (e) {}
  }
  function clearProg() { try { var all = allProg(); delete all[lesson]; localStorage.setItem(PROG_KEY, JSON.stringify(all)); } catch (e) {} }

  if (!/^[a-z0-9-]+$/.test(lesson)) { stage.textContent = 'Bài học không hợp lệ.'; return; }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function renderText(s, host) {
    // Nhãn phần (nếu có) đặt trên tiêu đề, như slide trình chiếu
    if (s.kicker) host.appendChild(el('p', 'slide-label', s.kicker));
    host.appendChild(el('h2', null, s.title));
    if (s.style === 'bullets') {
      var ul = el('ul', 'slide-bullets');
      s.body.forEach(function (p) { ul.appendChild(el('li', null, p)); });
      host.appendChild(ul);
    } else {
      s.body.forEach(function (p) { host.appendChild(el('p', null, p)); });
    }
  }

  function renderMcq(s, i, host) {
    host.appendChild(el('p', 'slide-kind', 'Trắc nghiệm'));
    host.appendChild(el('h2', null, s.q));
    var opts = el('div', 'opts');
    var fb = el('div', 'feedback qz-fb');
    fb.style.display = 'none';
    var letters = ['A', 'B', 'C', 'D'];
    var done = answered[i] !== undefined;
    s.options.forEach(function (text, k) {
      var b = el('button', 'opt');
      b.type = 'button';
      b.appendChild(el('span', 'k', letters[k]));
      b.appendChild(el('span', 'tx', text));
      b.disabled = done;
      if (done) {
        if (k === s.answer) b.classList.add('right');
        if (k === answered[i] && k !== s.answer) b.classList.add('wrong');
      }
      b.addEventListener('click', function () {
        if (answered[i] !== undefined) return;
        answered[i] = k;
        score.total++;
        if (k === s.answer) score.ok++;
        show(i);
      });
      opts.appendChild(b);
    });
    host.appendChild(opts);
    if (done) {
      var ok = answered[i] === s.answer;
      fb.className = 'feedback qz-fb ' + (ok ? 'ok' : 'no');
      fb.textContent = (ok ? (window.SlidePersona ? SlidePersona.line('praise') : 'Đúng.') + ' ' : (window.SlidePersona ? SlidePersona.line('retry') : 'Chưa đúng.') + ' Đáp án đúng là ' + letters[s.answer] + '. ') + (s.feedback || '');
      fb.style.display = '';
    }
    host.appendChild(fb);
  }

  function renderFill(s, i, host) {
    host.appendChild(el('p', 'slide-kind', 'Điền chỗ trống'));
    host.appendChild(el('h2', null, s.title || 'Điền vào chỗ trống'));
    var p = el('p', 'fill-text');
    var parts = s.text.split(/\{(\d+)\}/);
    var selects = [];
    parts.forEach(function (part, j) {
      if (j % 2 === 0) { p.appendChild(document.createTextNode(part)); return; }
      var bi = Number(part) - 1;
      var blank = s.blanks[bi];
      var sel = el('select', 'fill-sel');
      sel.setAttribute('aria-label', 'Chỗ trống ' + part);
      sel.appendChild(new Option('Chọn đáp án', ''));
      blank.options.forEach(function (o, k) { sel.appendChild(new Option(o, String(k))); });
      if (answered[i]) { sel.value = answered[i][bi] === undefined ? '' : String(answered[i][bi]); sel.disabled = true; }
      selects[bi] = sel;
      p.appendChild(sel);
    });
    host.appendChild(p);
    var fb = el('div', 'feedback qz-fb');
    fb.style.display = 'none';
    host.appendChild(fb);
    var check = el('button', 'btn', 'Kiểm tra');
    check.type = 'button';
    if (answered[i]) { check.disabled = true; }
    check.addEventListener('click', function () {
      var picks = selects.map(function (sel) { return sel.value === '' ? undefined : Number(sel.value); });
      if (picks.some(function (v) { return v === undefined; })) {
        fb.className = 'feedback qz-fb no';
        fb.textContent = 'Hãy chọn đáp án cho mọi chỗ trống.';
        fb.style.display = '';
        return;
      }
      answered[i] = picks;
      var correct = s.blanks.every(function (b, bi) { return picks[bi] === b.answer; });
      score.total++;
      if (correct) score.ok++;
      show(i);
    });
    host.appendChild(check);
    if (answered[i]) {
      var correctNow = s.blanks.every(function (b, bi) { return answered[i][bi] === b.answer; });
      var names = s.blanks.map(function (b) { return b.options[b.answer]; });
      fb.className = 'feedback qz-fb ' + (correctNow ? 'ok' : 'no');
      fb.textContent = (correctNow ? (window.SlidePersona ? SlidePersona.line('praise') : 'Đúng.') + ' ' : (window.SlidePersona ? SlidePersona.line('retry') : 'Chưa đúng.') + ' Đáp án: ') + names.join(' / ') + '.';
      fb.style.display = '';
    }
  }

  function renderEssay(s, i, host) {
    host.appendChild(el('p', 'slide-kind', 'Tự luận'));
    host.appendChild(el('h2', null, 'Câu hỏi'));
    host.appendChild(el('p', null, s.q));
    var ta = el('textarea', 'essay');
    ta.rows = 6;
    ta.placeholder = 'Viết câu trả lời của bạn ở đây (có thể để trống và xem đáp án mẫu).';
    ta.setAttribute('aria-label', 'Câu trả lời');
    if (answered[i] !== undefined) ta.value = answered[i];
    host.appendChild(ta);
    var reveal = el('button', 'btn ghost', 'Xem đáp án mẫu');
    reveal.type = 'button';
    var model = el('div', 'model-answer');
    model.style.display = answered[i] !== undefined ? '' : 'none';
    model.appendChild(el('strong', null, 'Đáp án mẫu: '));
    model.appendChild(document.createTextNode(s.model));
    reveal.addEventListener('click', function () {
      if (answered[i] === undefined) { answered[i] = ta.value; }
      model.style.display = '';
      reveal.disabled = true;
    });
    if (answered[i] !== undefined) reveal.disabled = true;
    host.appendChild(reveal);
    host.appendChild(model);
  }

  function show(i) {
    var s = slides[i];
    stage.innerHTML = '';
    var card = el('section', 'slide-card');
    card.dataset.audio = s.audio || '';
    card.dataset.audios = JSON.stringify(s.audios || {});
    if (window.SlidePersona) card.appendChild(el('p', 'slide-narr', SlidePersona.label() + ': ' + SlidePersona.intro()));
    if (window.SlideArt && s.type === 'text') {
      var key = window.SlideArt.forTitle(s.title);
      var fig = el('figure', 'slide-art');
      fig.innerHTML = window.SlideArt.svg(key);
      card.appendChild(fig);
    }
    if (s.type === 'text') renderText(s, card);
    else if (s.type === 'mcq') renderMcq(s, i, card);
    else if (s.type === 'fill') renderFill(s, i, card);
    else if (s.type === 'essay') renderEssay(s, i, card);
    // Chân slide: tên bài và số trang, như slide trình chiếu
    card.appendChild(el('div', 'slide-foot', (titleEl ? titleEl.textContent : '') + '  ·  ' + (i + 1) + ' / ' + slides.length));
    stage.appendChild(card);
    idx = i;
    saveProg();
    counter.textContent = (i + 1) + ' / ' + slides.length;
    bar.style.width = ((i + 1) / slides.length * 100) + '%';
    prev.disabled = i === 0;
    next.textContent = i === slides.length - 1 ? 'Kết quả' : 'Tiếp →';
    try { history.replaceState(null, '', '?lesson=' + lesson + '&s=' + (i + 1)); } catch (e) {}
    window.scrollTo(0, 0);
  }

  var showingResult = false;
  function showResult() {
    showingResult = true;
    stage.innerHTML = '';
    var card = el('section', 'slide-card');
    card.appendChild(el('p', 'slide-kind', 'Kết quả'));
    card.appendChild(el('h2', null, 'Bạn đã làm xong bài'));
    var pct = score.total ? Math.round(score.ok / score.total * 100) : 0;
    card.appendChild(el('p', null, 'Đúng ' + score.ok + '/' + score.total + ' câu có chấm điểm (' + pct + '%). Câu tự luận không tính điểm, bạn tự so với đáp án mẫu.'));
    var back = el('button', 'btn ghost', 'Xem lại từ đầu');
    back.type = 'button';
    back.addEventListener('click', function () { showingResult = false; answered = {}; score = { ok: 0, total: 0 }; clearProg(); show(0); });
    card.appendChild(back);
    stage.appendChild(card);
    counter.textContent = 'Hết bài';
    bar.style.width = '100%';
    prev.disabled = false;
    next.textContent = 'Về đầu';
  }

  prev.addEventListener('click', function () { if (showingResult) { showingResult = false; show(slides.length - 1); return; } if (idx > 0) show(idx - 1); });
  next.addEventListener('click', function () {
    if (showingResult) { showingResult = false; show(0); return; }
    if (idx < slides.length - 1) show(idx + 1); else showResult();
  });
  document.addEventListener('keydown', function (e) {
    if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
    if (e.key === 'ArrowRight') next.click();
    if (e.key === 'ArrowLeft') prev.click();
  });

  fetch('data/slides/' + lesson + '.json', { cache: 'no-store' })
    .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then(function (data) {
      slides = data.slides || [];
      titleEl.textContent = data.title || 'Bài học';
      document.title = (data.title || 'Bài học') + ' · Sổ tay Luật Y tế';
      if (!slides.length) { stage.textContent = 'Bài học chưa có nội dung.'; return; }
      var prog = allProg()[lesson];
      var start = 0;
      if (params.get('s')) {
        start = Math.max(1, Math.min(slides.length, Number(params.get('s')) || 1)) - 1;
      } else if (prog && typeof prog.index === 'number') {
        start = Math.min(slides.length - 1, prog.index);
        answered = prog.answered || {};
        score = prog.score || { ok: 0, total: 0 };
      }
      show(start);
    })
    .catch(function () { stage.textContent = 'Không tải được bài học. Thử tải lại trang.'; });
})();
