// Trang thực hành 7/3: bên trái là app đang test (nhiều loại), bên phải là trợ giảng (kịch bản viết sẵn, không gọi AI).
// Nội dung đọc từ content/practice/<id>.json. Mọi chữ hiển thị bằng textContent, không chèn HTML.
(function () {
  'use strict';
  var SVG_NS = 'http://www.w3.org/2000/svg';
  var INT_RE = /^-?\d+$/;

  // Hàm mẫu cho app loại "code". Mỗi lần chạy trả về giá trị và nhánh đã đi qua.
  var CODE_FUNCS = {
    max3: function (a, b, c) {
      if (a >= b && a >= c) return { v: a, hit: 'b1' };
      if (b >= c) return { v: b, hit: 'b2' };
      return { v: c, hit: 'b3' };
    },
    phiShip: function (km, tong, thanhVien) {
      if (km > 10) return { v: -1, hit: 'b1' };
      if (tong >= 300000) return { v: 0, hit: 'b2' };
      if (thanhVien === 1 && tong >= 150000) return { v: 0, hit: 'b3' };
      if (km <= 3) return { v: 15000, hit: 'b4' };
      return { v: 15000 + (km - 3) * 5000, hit: 'b5' };
    }
  };

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  }
  function svgEl(tag, attrs) {
    var n = document.createElementNS(SVG_NS, tag);
    Object.keys(attrs || {}).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    return n;
  }
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  async function typeText(setValue, text) {
    var acc = '';
    for (var i = 0; i < text.length; i++) {
      acc += text[i];
      setValue(acc);
      await sleep(40);
    }
  }
  function field(labelText, control) {
    var wrap = el('div', 'field');
    var lab = el('label', '', labelText);
    lab.setAttribute('for', control.id);
    wrap.append(lab, control);
    return wrap;
  }
  function uid(p) { return p + '-' + Math.random().toString(36).slice(2, 8); }

  // ===== App loại "form": một ô số, có trục số =====
  function judgeForm(cfg, raw) {
    var s = String(raw).trim();
    if (s === '') return { result: 'none', msg: 'Chưa nhập gì.' };
    if (!INT_RE.test(s)) return { result: 'err', msg: 'Báo lỗi: ' + cfg.field + ' phải là số nguyên.' };
    var n = Number(s);
    if (n < cfg.lo || n > cfg.hi) return { result: 'err', msg: 'Báo lỗi: ' + cfg.field + ' phải từ ' + cfg.lo + ' đến ' + cfg.hi + '.' };
    return { result: 'ok', msg: 'Chấp nhận: ' + cfg.field + ' hợp lệ.' };
  }

  function buildAxis(cfg) {
    var node = el('div', 'axis-box');
    var svg = svgEl('svg', { viewBox: '0 0 600 150', role: 'img' });
    var t = svgEl('title');
    t.textContent = 'Trục số: dưới ' + cfg.lo + ' báo lỗi, từ ' + cfg.lo + ' đến ' + cfg.hi + ' chấp nhận, trên ' + cfg.hi + ' báo lỗi';
    svg.appendChild(t);
    var X0 = 30, X1 = 570;
    function xs(v) { return X0 + (v - cfg.minV) / (cfg.maxV - cfg.minV) * (X1 - X0); }
    svg.appendChild(svgEl('rect', { x: xs(cfg.minV), y: 40, width: xs(cfg.lo) - xs(cfg.minV), height: 38, rx: 6, fill: '#f6d5d0' }));
    svg.appendChild(svgEl('rect', { x: xs(cfg.lo), y: 40, width: xs(cfg.hi) - xs(cfg.lo), height: 38, rx: 6, fill: '#cfe9dc' }));
    svg.appendChild(svgEl('rect', { x: xs(cfg.hi), y: 40, width: xs(cfg.maxV) - xs(cfg.hi), height: 38, rx: 6, fill: '#f6d5d0' }));
    function label(x, y, txt) { var n = svgEl('text', { x: x, y: y, 'text-anchor': 'middle', class: 'band-label' }); n.textContent = txt; return n; }
    svg.appendChild(label((xs(cfg.minV) + xs(cfg.lo)) / 2, 30, 'dưới ' + cfg.lo + ': báo lỗi'));
    svg.appendChild(label((xs(cfg.lo) + xs(cfg.hi)) / 2, 30, cfg.lo + ' đến ' + cfg.hi + ': chấp nhận'));
    svg.appendChild(label((xs(cfg.hi) + xs(cfg.maxV)) / 2, 30, 'trên ' + cfg.hi + ': báo lỗi'));
    svg.appendChild(svgEl('line', { x1: X0, y1: 100, x2: X1, y2: 100, stroke: '#5b6475', 'stroke-width': 2 }));
    var tLo = svgEl('text', { x: xs(cfg.lo), y: 122, 'text-anchor': 'middle', class: 'tick-label' }); tLo.textContent = String(cfg.lo);
    var tHi = svgEl('text', { x: xs(cfg.hi), y: 122, 'text-anchor': 'middle', class: 'tick-label' }); tHi.textContent = String(cfg.hi);
    svg.append(tLo, tHi);
    var marker = svgEl('g', { transform: 'translate(' + xs(0) + ',0)' });
    marker.appendChild(svgEl('line', { x1: 0, y1: 20, x2: 0, y2: 100, stroke: '#14181f', 'stroke-width': 2, 'stroke-dasharray': '4 3' }));
    marker.appendChild(svgEl('circle', { cx: 0, cy: 59, r: 8, fill: '#1C2027' }));
    var mText = svgEl('text', { x: 0, y: 144, 'text-anchor': 'middle', class: 'marker-text' });
    marker.appendChild(mText);
    svg.appendChild(marker);
    node.appendChild(svg);
    return {
      node: node,
      mark: function (raw) {
        var s = String(raw).trim();
        if (INT_RE.test(s)) {
          var n = Math.max(cfg.minV, Math.min(cfg.maxV, Number(s)));
          marker.setAttribute('transform', 'translate(' + xs(n) + ',0)');
          mText.textContent = s;
        } else {
          mText.textContent = '';
          marker.setAttribute('transform', 'translate(' + xs(0) + ',0)');
        }
      }
    };
  }

  function buildForm(cfg, host, ctrl) {
    var box = el('div', 'form-mock');
    var input = el('input'); input.id = uid('th-in'); input.type = 'text';
    input.setAttribute('inputmode', 'numeric'); input.setAttribute('autocomplete', 'off');
    var send = el('button', 'btn amber', 'Gửi'); send.type = 'button';
    var reset = el('button', 'btn ghost', 'Đặt lại'); reset.type = 'button';
    var row = el('div', 'form-row'); row.append(send, reset);
    var result = el('div', 'result', 'Chưa nhập gì.');
    result.setAttribute('aria-live', 'polite');
    box.append(field(cfg.field, input), row, result, el('p', 'rule-text', cfg.ruleText));
    var axis = buildAxis(cfg);
    host.append(box, axis.node);

    function formRes(raw) {
      var j = judgeForm(cfg, raw);
      return { kind: 'form', raw: String(raw), judged: j.result, logText: '"' + raw + '" → ' + j.msg };
    }
    function show(raw) {
      input.value = raw;
      var j = judgeForm(cfg, raw);
      result.textContent = j.msg;
      result.className = 'result ' + (j.result === 'ok' ? 'ok' : j.result === 'err' ? 'err' : '');
      axis.mark(raw);
    }
    function doReset() { input.value = ''; result.textContent = 'Chưa nhập gì.'; result.className = 'result'; axis.mark(''); }

    send.addEventListener('click', function () {
      if (ctrl.busy || !input.value.length) return;
      ctrl.submit(formRes(input.value));
    });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !ctrl.busy && input.value.length) ctrl.submit(formRes(input.value));
    });
    input.addEventListener('input', function () { if (!ctrl.busy) show(input.value); });
    reset.addEventListener('click', function () { if (!ctrl.busy) doReset(); });

    return {
      reset: doReset,
      onEnter: function () {},
      setDisabled: function (v) { input.disabled = v; send.disabled = v; reset.disabled = v; },
      demo: async function (a) {
        if (a.type === 'type') {
          await ctrl.glide(input, true);
          await typeText(show, a.value);
          show(a.value);
          return;
        }
        if (a.type === 'submit') { await ctrl.glide(send, true); ctrl.submit(formRes(input.value)); }
      },
      meets: function (c, res) {
        if (c.result !== res.judged) return false;
        var s = res.raw.trim();
        if (c.text) return !INT_RE.test(s);
        if (!INT_RE.test(s)) return false;
        var n = Number(s);
        if (c.value !== undefined) return n === c.value;
        if (c.valueRange) return n >= c.valueRange[0] && n <= c.valueRange[1];
        return true;
      }
    };
  }

  // ===== App loại "code": một hàm, các nhánh được tô màu khi chạy =====
  function buildCode(cfg, host, ctrl) {
    var fn = CODE_FUNCS[cfg.func];
    var codeBox = el('div', 'code-box');
    var lineEls = cfg.code.split('\n').map(function (t) { return el('div', 'code-line', t); });
    codeBox.append.apply(codeBox, lineEls);
    var inputs = {};
    var row = el('div', 'form-row');
    cfg.inputs.forEach(function (name) {
      var inp = el('input'); inp.id = uid('th-code'); inp.type = 'text';
      inp.setAttribute('inputmode', 'numeric'); inp.setAttribute('autocomplete', 'off');
      inputs[name] = inp;
      row.appendChild(field(name, inp));
    });
    var runBtn = el('button', 'btn amber', 'Chạy hàm'); runBtn.type = 'button';
    var out = el('div', 'result', 'Chưa chạy.');
    var cov = el('div', 'coverage', '');
    host.append(codeBox, row, runBtn, out, cov);

    function paintLines(hit) {
      lineEls.forEach(function (d) { d.classList.remove('hit'); });
      ((cfg.branches || {})[hit] || []).forEach(function (i) { if (lineEls[i]) lineEls[i].classList.add('hit'); });
    }
    // Trợ giảng giải thích từng dòng của nhánh vừa chạy, bằng lời dễ hiểu.
    function explainLines(hit) {
      var notes = cfg.lineNotes || {};
      ((cfg.branches || {})[hit] || []).forEach(function (i) {
        if (notes[i]) ctrl.note('Dòng ' + (i + 1) + ': ' + notes[i]);
      });
    }
    function paintCover() {
      var all = Object.keys(cfg.branches || {});
      cov.textContent = 'Nhánh đã phủ: ' + (ctrl.covered.length ? ctrl.covered.join(', ') : 'chưa có') + ' (' + ctrl.covered.length + '/' + all.length + ')';
    }
    function run() {
      var vals = {};
      for (var k = 0; k < cfg.inputs.length; k++) {
        var s = inputs[cfg.inputs[k]].value.trim();
        if (!INT_RE.test(s)) { out.textContent = 'Nhập số nguyên vào cả ba ô.'; out.className = 'result err'; return null; }
        vals[cfg.inputs[k]] = Number(s);
      }
      var r = fn(vals[cfg.inputs[0]], vals[cfg.inputs[1]], vals[cfg.inputs[2]]);
      out.textContent = 'Kết quả: ' + r.v;
      out.className = 'result ok';
      paintLines(r.hit);
      explainLines(r.hit);
      var parts = cfg.inputs.map(function (n) { return n + '=' + vals[n]; }).join(', ');
      var res = { kind: 'code', hit: r.hit, logText: parts + ' → ' + r.v + ' (nhánh ' + r.hit + ')' };
      ctrl.submit(res);
      paintCover();
      return res;
    }
    runBtn.addEventListener('click', function () { if (!ctrl.busy) run(); });

    return {
      reset: function () {
        cfg.inputs.forEach(function (n) { inputs[n].value = ''; });
        out.textContent = 'Chưa chạy.'; out.className = 'result';
        lineEls.forEach(function (d) { d.classList.remove('hit'); });
        paintCover();
      },
      onEnter: function () { paintCover(); },
      setDisabled: function (v) { runBtn.disabled = v; cfg.inputs.forEach(function (n) { inputs[n].disabled = v; }); },
      demo: async function (a) {
        if (a.type === 'set') {
          var target = inputs[a.field];
          await ctrl.glide(target, true);
          await typeText(function (v) { target.value = v; }, a.value);
          target.value = a.value;
          return;
        }
        if (a.type === 'run') { await ctrl.glide(runBtn, true); run(); }
      },
      meets: function () { return true; }
    };
  }

  // ===== App loại "choice": đọc tình huống, chọn một đáp án =====
  function buildChoice(cfg, host, ctrl) {
    var scen = el('div', 'scenario', '');
    var btns = el('div', 'choice-btns');
    host.append(scen, btns);
    var list = [];
    var byId = {};
    return {
      reset: function () {},
      onEnter: function (step) {
        scen.textContent = step.scenario || '';
        btns.innerHTML = '';
        list = [];
        byId = {};
        var choices = step.task && step.task.choices;
        if (!choices) return;
        choices.forEach(function (c) {
          var b = el('button', 'btn ghost', c.label); b.type = 'button';
          b.addEventListener('click', function () {
            if (ctrl.busy) return;
            ctrl.submit({ kind: 'choice', choice: c.id, logText: 'Chọn: ' + c.label });
          });
          list.push(b);
          byId[c.id] = { node: b, label: c.label };
          btns.appendChild(b);
        });
      },
      setDisabled: function (v) { list.forEach(function (b) { b.disabled = v; }); },
      demo: async function (a) {
        if (a.type !== 'pick' || !byId[a.id]) return;
        await ctrl.glide(byId[a.id].node, true);
        ctrl.submit({ kind: 'choice', choice: a.id, logText: 'Chọn: ' + byId[a.id].label });
      },
      meets: function (c, res) { return res.choice === c.answer; }
    };
  }

  // ===== App loại "report": form báo cáo lỗi =====
  function buildReport(cfg, host, ctrl) {
    var controls = {};
    var form = el('div', 'report-form');
    cfg.fields.forEach(function (f) {
      var ctl;
      if (f.type === 'select') {
        ctl = el('select');
        f.options.forEach(function (o) { var op = el('option', '', o); op.value = o; ctl.appendChild(op); });
      } else if (f.type === 'area') {
        ctl = el('textarea'); ctl.rows = 3;
      } else {
        ctl = el('input'); ctl.type = 'text';
      }
      ctl.id = uid('th-rep');
      controls[f.id] = ctl;
      form.appendChild(field(f.label, ctl));
    });
    var send = el('button', 'btn amber', 'Gửi báo cáo'); send.type = 'button';
    var reset = el('button', 'btn ghost', 'Xóa form'); reset.type = 'button';
    var row = el('div', 'form-row'); row.append(send, reset);
    host.append(form, row);

    function data() {
      var d = {};
      cfg.fields.forEach(function (f) { d[f.id] = controls[f.id].value; });
      return d;
    }
    function doReset() {
      cfg.fields.forEach(function (f) { controls[f.id].value = f.type === 'select' ? f.options[0] : ''; });
    }
    doReset();
    function sendNow() {
      var d = data();
      ctrl.submit({ kind: 'report', data: d, logText: 'Báo cáo "' + (d.title || '(chưa có tiêu đề)') + '" · mức ' + d.severity });
    }
    send.addEventListener('click', function () { if (!ctrl.busy) sendNow(); });
    reset.addEventListener('click', function () { if (!ctrl.busy) doReset(); });

    return {
      reset: doReset,
      onEnter: function () {},
      setDisabled: function (v) { cfg.fields.forEach(function (f) { controls[f.id].disabled = v; }); send.disabled = v; reset.disabled = v; },
      demo: async function (a) {
        if (a.type === 'fill') {
          var ctl = controls[a.field];
          await ctrl.glide(ctl, true);
          if (ctl.tagName === 'SELECT') { ctl.value = a.value; return; }
          await typeText(function (v) { ctl.value = v; }, a.value);
          ctl.value = a.value;
          return;
        }
        if (a.type === 'submit') { await ctrl.glide(send, true); sendNow(); }
      },
      meets: function (c, res) {
        var d = res.data;
        if (c.filled && !c.filled.every(function (k) { return String(d[k] || '').trim() !== ''; })) return false;
        if (c.equals && !Object.keys(c.equals).every(function (k) { return d[k] === c.equals[k]; })) return false;
        if (c.contains) {
          return Object.keys(c.contains).every(function (k) {
            var text = String(d[k] || '').toLowerCase();
            return c.contains[k].every(function (w) { return text.indexOf(w.toLowerCase()) >= 0; });
          });
        }
        return true;
      }
    };
  }

  // ===== App loại "matrix": chọn cấu hình để chạy =====
  function buildMatrix(cfg, host, ctrl) {
    var list = el('div', 'matrix-list');
    var boxes = {};
    var rows = {};
    cfg.items.forEach(function (it) {
      var lab = el('label', 'matrix-item');
      var cb = el('input'); cb.type = 'checkbox'; cb.id = uid('th-mx');
      boxes[it.id] = cb;
      rows[it.id] = lab;
      lab.append(cb, el('span', '', it.label));
      list.appendChild(lab);
    });
    var run = el('button', 'btn amber', 'Chạy ma trận'); run.type = 'button';
    var out = el('div', 'result', 'Chưa chạy.');
    host.append(list, run, out);

    function selected() { return cfg.items.filter(function (it) { return boxes[it.id].checked; }).map(function (it) { return it.id; }); }
    function clearAll() { Object.keys(boxes).forEach(function (k) { boxes[k].checked = false; }); out.textContent = 'Chưa chạy.'; out.className = 'result'; }
    function runMatrix() {
      var sel = selected();
      var labels = cfg.items.filter(function (it) { return sel.indexOf(it.id) >= 0; }).map(function (it) { return it.label; });
      out.textContent = sel.length ? 'Đã chạy ' + sel.length + ' cấu hình.' : 'Bạn chưa chọn cấu hình nào.';
      out.className = 'result ' + (sel.length ? 'ok' : 'err');
      ctrl.submit({ kind: 'matrix', selected: sel, logText: sel.length ? 'Chạy: ' + labels.join(', ') : 'Chưa chọn cấu hình nào' });
    }
    run.addEventListener('click', function () {
      if (ctrl.busy) return;
      runMatrix();
    });

    return {
      reset: clearAll,
      onEnter: function () {},
      setDisabled: function (v) { Object.keys(boxes).forEach(function (k) { boxes[k].disabled = v; }); run.disabled = v; },
      demo: async function (a) {
        if (a.type === 'tick') {
          await ctrl.glide(rows[a.id], true);
          boxes[a.id].checked = true;
          return;
        }
        if (a.type === 'submit') { await ctrl.glide(run, true); runMatrix(); }
      },
      meets: function (c, res) {
        if (c.include && !c.include.every(function (k) { return res.selected.indexOf(k) >= 0; })) return false;
        if (c.min && res.selected.length < c.min) return false;
        return true;
      }
    };
  }

  var FACTORY = { form: buildForm, code: buildCode, choice: buildChoice, report: buildReport, matrix: buildMatrix };

  function start(data) {
    var root = document.getElementById('th-root');
    root.innerHTML = '';
    var type = data.app.type || 'form';
    if (!FACTORY[type]) { root.textContent = 'Loại app chưa hỗ trợ: ' + type; return; }
    var steps = data.steps;
    var idx = 0, busy = false, attempts = 0, hintsShown = 0, passed = false, app = null;
    var ctrl = { busy: false, demoMode: false, covered: [], submit: submit, note: addBot };

    // ----- Khung giao diện -----
    var head = el('div', 'th-head');
    head.append(el('span', 'eyebrow', 'Thực hành · vừa học vừa làm'), el('h1', '', data.title));
    var count = el('p', 'th-count', '');
    head.appendChild(count);
    var grid = el('div', 'th-grid');

    var appSec = el('section', 'card th-app');
    appSec.setAttribute('aria-label', 'App đang test');
    appSec.appendChild(el('p', 'panel-title', 'App đang test: ' + data.app.name));
    var appBody = el('div', 'th-appbody');
    appSec.appendChild(appBody);
    appSec.appendChild(el('h3', 'log-title', 'Nhật ký ca đã chạy'));
    var logList = el('ol', 'log-list');
    logList.setAttribute('aria-live', 'polite');
    appSec.appendChild(logList);

    var chatSec = el('section', 'card th-chat');
    chatSec.setAttribute('aria-label', 'Trợ giảng');
    chatSec.appendChild(el('p', 'panel-title', 'Trợ giảng'));
    var chatLog = el('div', 'chat-log');
    chatLog.setAttribute('aria-live', 'polite');
    var controls = el('div', 'controls');
    var demoBtn = el('button', 'btn ghost', 'Chạy demo'); demoBtn.type = 'button';
    var hintBtn = el('button', 'btn ghost', 'Gợi ý'); hintBtn.type = 'button';
    var detailBtn = el('button', 'btn ghost', 'Giải thích chi tiết'); detailBtn.type = 'button';
    var nextBtn = el('button', 'btn amber', 'Tiếp →'); nextBtn.type = 'button';
    controls.append(demoBtn, hintBtn, detailBtn, nextBtn);
    chatSec.append(chatLog, controls);

    grid.append(appSec, chatSec);
    root.append(head, grid);

    app = FACTORY[type](data.app, appBody, ctrl);

    // ----- Demo trực quan: con trỏ, vòng bấm, thanh trạng thái -----
    var reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    var cursor = el('div', 'th-cursor');
    cursor.setAttribute('aria-hidden', 'true');
    var cursorSvg = svgEl('svg', { viewBox: '0 0 26 26' });
    cursorSvg.appendChild(svgEl('path', { d: 'M3 2 L3 21 L8 16.5 L11.5 24 L14.5 22.6 L11.2 15.4 L18 15.4 Z', fill: '#1C2027', stroke: '#ffffff', 'stroke-width': 1.6, 'stroke-linejoin': 'round' }));
    cursor.appendChild(cursorSvg);
    appBody.appendChild(cursor);
    var demoBar = el('div', 'th-demobar');
    demoBar.setAttribute('role', 'status');
    demoBar.append(el('span', 'dot'), el('span', 'th-demobar-text', ''));
    appSec.insertBefore(demoBar, appBody);

    function setDemoBar(text) {
      demoBar.querySelector('.th-demobar-text').textContent = text;
      demoBar.classList.toggle('on', !!text);
    }
    function ripple(x, y) {
      var rp = el('div', 'th-ripple');
      rp.style.left = x + 'px';
      rp.style.top = y + 'px';
      appBody.appendChild(rp);
      setTimeout(function () { rp.remove(); }, 650);
    }
    // Con trỏ bay tới giữa phần tử, làm phần tử sáng viền, rồi bấm nếu click = true.
    async function glide(target, click) {
      if (!target || !target.getBoundingClientRect) return;
      var base = appBody.getBoundingClientRect();
      var r = target.getBoundingClientRect();
      var x = r.left - base.left + Math.min(r.width / 2, 40);
      var y = r.top - base.top + r.height / 2;
      cursor.classList.add('on');
      cursor.style.transform = 'translate(' + x + 'px,' + y + 'px)';
      target.classList.add('th-spot');
      await sleep(reduceMotion ? 40 : 600);
      if (click) {
        cursor.classList.add('press');
        ripple(x, y);
        await sleep(reduceMotion ? 40 : 180);
        cursor.classList.remove('press');
      }
      target.classList.remove('th-spot');
    }
    ctrl.glide = glide;
    function clearDemoVisuals() {
      cursor.classList.remove('on', 'press');
      appBody.querySelectorAll('.th-spot').forEach(function (n) { n.classList.remove('th-spot'); });
    }
    // Trợ giảng "đang gõ" rồi mới hiện câu trả lời, giống chat thật.
    async function botSay(text) {
      var m = el('div', 'msg bot');
      var dots = el('span', 'th-typing');
      dots.setAttribute('aria-label', 'Trợ giảng đang gõ');
      dots.append(el('i'), el('i'), el('i'));
      m.append(el('span', 'who', 'Trợ giảng'), dots);
      chatLog.appendChild(m);
      chatLog.scrollTop = chatLog.scrollHeight;
      await sleep(reduceMotion ? 80 : Math.min(1300, 450 + text.length * 14));
      dots.remove();
      m.appendChild(el('span', '', text));
    }

    // ----- Trợ giảng và nhật ký -----
    function addBot(text) {
      var m = el('div', 'msg bot');
      m.appendChild(el('span', 'who', 'Trợ giảng'));
      m.appendChild(el('span', '', text));
      chatLog.appendChild(m);
      chatLog.scrollTop = chatLog.scrollHeight;
    }
    function addLog(text, who) {
      logList.appendChild(el('li', '', (who ? who + ': ' : '') + text));
      logList.scrollTop = logList.scrollHeight;
    }
    function setBusy(v) {
      busy = v;
      ctrl.busy = v;
      app.setDisabled(v);
      demoBtn.disabled = v;
      hintBtn.disabled = v;
      detailBtn.disabled = v;
      refreshNext();
    }
    function refreshNext() {
      var step = steps[idx];
      var need = !!step.task && !passed;
      nextBtn.disabled = busy || need;
      nextBtn.textContent = idx === steps.length - 1 ? 'Về bài học' : 'Tiếp →';
      count.textContent = 'Bước ' + (idx + 1) + '/' + steps.length + ': ' + step.title;
      hintBtn.hidden = !step.task;
      demoBtn.hidden = !step.demo;
      detailBtn.hidden = !step.detail;
    }

    function meets(task, res) {
      var c = task.check || {};
      if (c.hit !== undefined) return res.hit === c.hit;
      if (c.cover) return c.cover.every(function (h) { return ctrl.covered.indexOf(h) >= 0; });
      return app.meets(c, res);
    }

    // Nhận một lần chạy/gửi từ app. fromDemo thì chỉ ghi nhật ký, không chấm.
    function submit(res) {
      addLog(res.logText, ctrl.demoMode ? 'Demo' : 'Bạn');
      if (res.hit && ctrl.covered.indexOf(res.hit) < 0) ctrl.covered.push(res.hit);
      if (ctrl.demoMode) return;
      var step = steps[idx];
      if (!step.task || passed) return;
      attempts++;
      if (meets(step.task, res)) {
        passed = true;
        addBot(step.task.pass);
        refreshNext();
      } else {
        var hints = step.task.hints || [];
        if (hints.length) addBot(hints[Math.min(attempts - 1, hints.length - 1)]);
      }
    }

    function enterStep(i) {
      idx = i;
      attempts = 0; hintsShown = 0; passed = false;
      ctrl.covered = [];
      app.reset();
      app.onEnter(steps[i]);
      steps[i].theory.forEach(addBot);
      if (steps[i].task) addBot(steps[i].task.prompt);
      refreshNext();
    }

    async function runDemo() {
      var step = steps[idx];
      if (!step.demo || busy) return;
      setBusy(true);
      ctrl.demoMode = true;
      app.reset();
      try {
        for (var k = 0; k < step.demo.length; k++) {
          var a = step.demo[k];
          setDemoBar('Đang chạy demo · thao tác ' + (k + 1) + '/' + step.demo.length);
          if (a.type === 'say') { await botSay(a.text); }
          else { await app.demo(a); }
          await sleep(reduceMotion ? 60 : 300);
        }
      } finally {
        ctrl.demoMode = false;
        clearDemoVisuals();
        setDemoBar('');
        setBusy(false);
      }
    }

    // ----- Sự kiện -----
    demoBtn.addEventListener('click', function () { runDemo(); });
    hintBtn.addEventListener('click', function () {
      var hints = steps[idx].task && steps[idx].task.hints;
      if (!hints || !hints.length) return;
      addBot(hints[Math.min(hintsShown, hints.length - 1)]);
      hintsShown = Math.min(hintsShown + 1, hints.length);
    });
    detailBtn.addEventListener('click', function () {
      var d = steps[idx].detail;
      (Array.isArray(d) ? d : [d]).forEach(function (t) { if (t) addBot(t); });
    });
    nextBtn.addEventListener('click', function () {
      if (idx < steps.length - 1) { enterStep(idx + 1); return; }
      location.href = 'lesson.html?track=tester&id=' + encodeURIComponent(data.lesson || 'tu-duy-tester');
    });

    enterStep(0);
  }

  var params = new URLSearchParams(location.search);
  var id = params.get('id') || 'phan-vung-tuoi';
  var root = document.getElementById('th-root');
  if (!/^[a-z0-9-]+$/.test(id)) { root.textContent = 'Mã bài không hợp lệ.'; return; }
  fetch('content/practice/' + id + '.json', { cache: 'no-store' })
    .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then(start)
    .catch(function (err) {
      root.textContent = 'Không tải được bài thực hành (' + err.message + '). Hãy mở trang qua localhost.';
    });
})();
