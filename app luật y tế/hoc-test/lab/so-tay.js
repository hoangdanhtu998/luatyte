// Sổ tay kiểm thử: lưu sản phẩm từng bài, sổ lỗi và kết quả đối chiếu đáp án trên trình duyệt.
(function () {
  'use strict';
  var D = window.SoTayData;
  var KEY = 'lab-sotay-v1';
  var PROGRESS_KEY = 'hoc-cpp-progress-v2'; // cùng khóa với trang khóa học, để bài được ghi là đã học
  var SAVE_DELAY_MS = 400;

  function $(id) { return document.getElementById(id); }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  }
  function load() {
    try {
      var s = JSON.parse(localStorage.getItem(KEY));
      if (s && typeof s === 'object') {
        return { work: s.work || {}, checks: s.checks || {}, bugs: Array.isArray(s.bugs) ? s.bugs : [], keyOpen: !!s.keyOpen, found: s.found || {} };
      }
    } catch (e) { /* dữ liệu hỏng thì bắt đầu lại */ }
    return { work: {}, checks: {}, bugs: [], keyOpen: false, found: {} };
  }
  var state = load();
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); return true; } catch (e) { return false; }
  }
  function markCourseDone(lessonId) {
    try {
      var p = JSON.parse(localStorage.getItem(PROGRESS_KEY)) || {};
      var next = { done: Object.assign({}, p.done), code: Object.assign({}, p.code) };
      next.done[lessonId] = true;
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(next));
    } catch (e) { /* không ghi được tiến độ thì bỏ qua */ }
  }
  function download(name, text) {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type: 'text/markdown;charset=utf-8' }));
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  }

  // ----- Chuyển tab -----
  var tabs = ['work', 'bugs', 'key'];
  function show(name) {
    tabs.forEach(function (t) { $('tab-' + t).hidden = t !== name; });
    document.querySelectorAll('.views button').forEach(function (b) {
      if (b.dataset.tab === name) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
    });
    if (name === 'key') renderKey();
    try { history.replaceState(null, '', '#' + name); } catch (e) { /* bỏ qua */ }
  }
  document.querySelectorAll('.views button').forEach(function (b) { b.addEventListener('click', function () { show(b.dataset.tab); }); });

  // ----- Sản phẩm từng bài -----
  function lessonDone(l) {
    var c = state.checks[l.id] || [];
    return l.rubric.every(function (_, i) { return !!c[i]; }) && String(state.work[l.id] || '').trim().length > 0;
  }
  function updateWorkProgress() {
    var n = D.lessons.filter(lessonDone).length;
    $('work-progress').textContent = 'Đã hoàn thành ' + n + '/' + D.lessons.length + ' sản phẩm';
  }
  function renderWork() {
    var box = $('work-list');
    box.innerHTML = '';
    var openId = location.hash.indexOf('#bai=') === 0 ? location.hash.slice(5) : '';
    D.lessons.forEach(function (l) {
      var card = el('details', 'work');
      if (l.id === openId) card.open = true;
      var sum = el('summary');
      sum.appendChild(el('span', '', l.title));
      var st = el('span', 'state');
      sum.appendChild(st);
      card.appendChild(sum);
      var body = el('div', 'work-body');
      body.appendChild(el('p', 'task', l.task));

      var lessonLink = el('a', '', 'Mở bài học này');
      lessonLink.href = '../lesson.html?track=tester&id=' + encodeURIComponent(l.id);
      var row = el('div', 'row');
      var insert = el('button', '', 'Chèn khung mẫu');
      insert.type = 'button';
      row.appendChild(insert);
      row.appendChild(lessonLink);
      var saved = el('span', 'muted', '');
      row.appendChild(saved);
      body.appendChild(row);

      var ta = el('textarea');
      ta.id = 'w-' + l.id;
      ta.setAttribute('aria-label', 'Bài làm: ' + l.title);
      ta.spellcheck = false;
      ta.value = state.work[l.id] || '';
      body.appendChild(ta);

      body.appendChild(el('h3', '', 'Tự chấm theo tiêu chí'));
      var ul = el('ul', 'rubric');
      var checks = state.checks[l.id] || [];
      l.rubric.forEach(function (text, i) {
        var li = el('li');
        var lb = el('label');
        var cb = el('input');
        cb.type = 'checkbox';
        cb.checked = !!checks[i];
        cb.addEventListener('change', function () {
          var next = (state.checks[l.id] || []).slice();
          next[i] = cb.checked;
          state.checks = Object.assign({}, state.checks);
          state.checks[l.id] = next;
          save();
          refresh();
        });
        lb.appendChild(cb);
        lb.appendChild(el('span', '', text));
        li.appendChild(lb);
        ul.appendChild(li);
      });
      body.appendChild(ul);

      var sample = el('details', 'sample');
      sample.appendChild(el('summary', '', 'Xem bài mẫu (chỉ mở sau khi đã tự làm)'));
      sample.appendChild(el('pre', '', l.sample));
      body.appendChild(sample);
      card.appendChild(body);
      box.appendChild(card);

      function refresh() {
        var done = lessonDone(l);
        card.classList.toggle('done', done);
        st.textContent = done ? 'Đã xong' : (String(state.work[l.id] || '').trim() ? 'Đang làm' : 'Chưa làm');
        if (done) markCourseDone(l.id);
        updateWorkProgress();
      }
      var timer = null;
      ta.addEventListener('input', function () {
        clearTimeout(timer);
        timer = setTimeout(function () {
          state.work = Object.assign({}, state.work);
          state.work[l.id] = ta.value;
          saved.textContent = save() ? 'Đã lưu' : 'Không lưu được (bộ nhớ trình duyệt đầy hoặc bị chặn)';
          refresh();
        }, SAVE_DELAY_MS);
      });
      insert.addEventListener('click', function () {
        if (ta.value.trim() && !window.confirm('Chèn khung mẫu vào cuối bài làm hiện có?')) return;
        ta.value = (ta.value.trim() ? ta.value.replace(/\s+$/, '') + '\n\n' : '') + l.template + '\n';
        ta.dispatchEvent(new Event('input'));
        ta.focus();
      });
      refresh();
    });
  }

  // ----- Sổ lỗi -----
  function bugToMd(b, i) {
    return '### BUG-' + (i + 1) + ' · ' + b.title + '\n\n- Môi trường: ' + b.env + '\n- Mức nghiêm trọng: ' + b.sev + '\n- Mức ưu tiên: ' + b.pri +
      '\n\n**Các bước tái hiện**\n\n' + b.steps + '\n\n**Kết quả thực tế**\n\n' + b.actual + '\n\n**Kết quả mong đợi**\n\n' + b.expected + '\n';
  }
  function renderBugs() {
    var box = $('bug-list');
    box.innerHTML = '';
    $('bug-count').textContent = 'Đang có ' + state.bugs.length + ' lỗi trong sổ';
    state.bugs.forEach(function (b, i) {
      var card = el('article', 'bug');
      card.appendChild(el('h3', '', 'BUG-' + (i + 1) + ' · ' + b.title));
      card.appendChild(el('div', 'meta', b.env + ' · Nghiêm trọng: ' + b.sev + ' · Ưu tiên: ' + b.pri));
      var dl = el('dl');
      [['Các bước tái hiện', b.steps], ['Kết quả thực tế', b.actual], ['Kết quả mong đợi', b.expected]].forEach(function (r) {
        dl.appendChild(el('dt', '', r[0]));
        dl.appendChild(el('dd', '', r[1]));
      });
      card.appendChild(dl);
      var del = el('button', '', 'Xóa báo cáo này');
      del.type = 'button';
      del.addEventListener('click', function () {
        if (!window.confirm('Xóa BUG-' + (i + 1) + '? Không khôi phục được.')) return;
        state.bugs = state.bugs.filter(function (_, j) { return j !== i; });
        save();
        renderBugs();
      });
      card.appendChild(del);
      box.appendChild(card);
    });
  }
  $('bug-form').addEventListener('submit', function (ev) {
    ev.preventDefault();
    var b = {
      title: $('b-title').value.trim(), env: $('b-env').value.trim(), sev: $('b-sev').value, pri: $('b-pri').value,
      steps: $('b-steps').value.trim(), actual: $('b-actual').value.trim(), expected: $('b-expected').value.trim(),
    };
    var missing = [];
    if (!b.title) missing.push('tiêu đề');
    if (!b.steps) missing.push('các bước tái hiện');
    if (!b.actual) missing.push('kết quả thực tế');
    if (!b.expected) missing.push('kết quả mong đợi');
    if (missing.length) { $('bug-err').textContent = 'Báo cáo còn thiếu: ' + missing.join(', ') + '.'; return; }
    $('bug-err').textContent = '';
    state.bugs = state.bugs.concat([b]);
    if (!save()) { $('bug-err').textContent = 'Không lưu được vào trình duyệt.'; return; }
    ['b-title', 'b-steps', 'b-actual', 'b-expected'].forEach(function (id) { $(id).value = ''; });
    renderBugs();
  });
  $('export-bugs').addEventListener('click', function () {
    download('so-loi-sao-mai.md', '# Sổ lỗi: Phòng khám Sao Mai\n\n' + (state.bugs.map(bugToMd).join('\n') || 'Chưa có lỗi nào.\n'));
  });
  $('export-all').addEventListener('click', function () {
    var parts = ['# Sổ tay kiểm thử: Phòng khám Sao Mai\n'];
    D.lessons.forEach(function (l) {
      parts.push('## ' + l.title + '\n\n' + (String(state.work[l.id] || '').trim() || '_Chưa làm._') + '\n');
    });
    parts.push('## Sổ lỗi\n\n' + (state.bugs.map(bugToMd).join('\n') || '_Chưa có lỗi nào._\n'));
    download('so-tay-kiem-thu-sao-mai.md', parts.join('\n'));
  });

  // ----- Đối chiếu đáp án -----
  function renderKey() {
    $('key-mine').textContent = String(state.bugs.length);
    $('key-lock').hidden = state.keyOpen;
    $('key-body').hidden = !state.keyOpen;
    if (!state.keyOpen) return;
    var build = $('key-build').value;
    var list = D.bugs.filter(function (b) { return b.builds.indexOf(build) >= 0; });
    var body = document.querySelector('#key-table tbody');
    body.innerHTML = '';
    list.forEach(function (b) {
      var fk = build + ':' + b.id;
      var tr = el('tr', state.found[fk] ? 'found' : '');
      var td = el('td');
      var cb = el('input');
      cb.type = 'checkbox';
      cb.checked = !!state.found[fk];
      cb.setAttribute('aria-label', 'Đã tìm ra lỗi ' + b.id);
      cb.addEventListener('change', function () {
        state.found = Object.assign({}, state.found);
        state.found[fk] = cb.checked;
        save();
        renderKey();
      });
      td.appendChild(cb);
      tr.appendChild(td);
      [b.id, b.area, b.title, b.req, b.sev, b.how].forEach(function (t) { tr.appendChild(el('td', '', t)); });
      body.appendChild(tr);
    });
    var found = list.filter(function (b) { return state.found[build + ':' + b.id]; });
    var serious = list.filter(function (b) { return b.sev === 'Nghiêm trọng' || b.sev === 'Cao'; });
    var seriousFound = serious.filter(function (b) { return state.found[build + ':' + b.id]; });
    $('key-score').textContent = 'Bạn tìm ra ' + found.length + '/' + list.length + ' lỗi của bản ' + build;
    var missed = serious.length - seriousFound.length;
    $('key-verdict').textContent = 'Lỗi mức Nghiêm trọng và Cao: tìm ra ' + seriousFound.length + '/' + serious.length + '. ' +
      (missed === 0
        ? 'Bạn không bỏ sót lỗi nặng nào. Số lỗi nặng bị bỏ sót quan trọng hơn tổng số lỗi tìm được.'
        : 'Còn sót ' + missed + ' lỗi nặng. Với mỗi lỗi sót, xem cột "Kỹ thuật tìm ra" rồi bổ sung ca tương ứng vào bộ ca ở bài 3 hoặc bài 6.');
  }
  $('key-open').addEventListener('click', function () {
    if (!window.confirm('Mở đáp án? Sau khi mở, bạn không còn tự tìm lỗi một cách khách quan được nữa.')) return;
    state.keyOpen = true;
    save();
    renderKey();
  });
  $('key-build').addEventListener('change', renderKey);

  renderWork();
  renderBugs();
  var start = location.hash.replace('#', '');
  show(tabs.indexOf(start) >= 0 ? start : 'work');
})();
