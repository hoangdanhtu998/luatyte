// Trò chơi học code: "Đoán kết quả" và "Tìm lỗi". HTML/CSS/JS thuần, không cần máy chủ biên dịch.
// Dữ liệu đọc từ content/tro-choi/*.json (đáp án đã được gcc kiểm chứng khi tạo dữ liệu).
(function () {
  'use strict';

  var MAX_CAU = 10;
  var DATA_URL = {
    doan: 'content/tro-choi/doan-ket-qua.json',
    loi: 'content/tro-choi/tim-loi.json'
  };
  var TEN = { doan: 'Đoán kết quả', loi: 'Tìm lỗi' };
  var GIAY = { doan: 8, loi: 12 };
  var MASCOT = { chao: 'assets/mascot/m01-meo-chao.png', vui: 'assets/mascot/m03-meo-vui.png', suyNghi: 'assets/mascot/m02-meo-suy-nghi.png' };

  var $ = function (id) { return document.getElementById(id); };
  var cache = {};
  var st = null;      // trạng thái ván đang chơi
  var hengio = null;  // đồng hồ đếm câu
  var hetGio = 0;     // mốc thời gian hết giờ của câu hiện tại
  var hen = null;     // hẹn chuyển câu tự động

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined && text !== null) e.textContent = String(text);
    return e;
  }
  function xaoTron(a) {
    var b = a.slice();
    for (var i = b.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = b[i]; b[i] = b[j]; b[j] = t; }
    return b;
  }
  function taiDuLieu(loai) {
    if (cache[loai]) return Promise.resolve(cache[loai]);
    return fetch(DATA_URL[loai], { cache: 'no-cache' }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }).then(function (j) { cache[loai] = j.questions || []; return cache[loai]; });
  }
  function hienLoi(msg) {
    var p = $('load-error');
    p.textContent = msg;
    p.classList.remove('hidden');
  }
  function anHet() {
    ['menu', 'play', 'end'].forEach(function (id) { $(id).classList.add('hidden'); });
  }
  function dungDongHo() {
    if (hengio) { clearInterval(hengio); hengio = null; }
    if (hen) { clearTimeout(hen); hen = null; }
  }
  function mascot(src, kieu) {
    var m = $('mascot');
    m.src = src;
    m.classList.remove('shake', 'nod');
    void m.offsetWidth; // khởi động lại animation
    if (kieu) m.classList.add(kieu);
  }
  function capNhatDiem() {
    var sb = $('scorebar');
    sb.textContent = '';
    sb.appendChild(el('span', '', 'Điểm: ' + st.diem));
    sb.appendChild(el('span', '', 'Streak: ' + st.streak + (st.streak >= 3 ? ' 🔥' : '')));
    sb.appendChild(el('span', '', 'Câu ' + Math.min(st.idx + 1, st.deck.length) + '/' + st.deck.length));
  }
  function veTienDo() {
    var p = $('progress');
    p.textContent = '';
    st.kq.forEach(function (k) { p.appendChild(el('span', 'dot ' + (k ? 'ok' : 'bad'), '')); });
    if (st.idx < st.deck.length) p.appendChild(el('span', 'dot on', ''));
    for (var i = st.kq.length + 1; i <= st.deck.length; i++) p.appendChild(el('span', 'dot', ''));
    p.appendChild(el('span', '', ' ' + Math.min(st.idx + 1, st.deck.length) + '/' + st.deck.length));
  }
  function batDongHo(giay, khiHet) {
    hetGio = Date.now() + giay * 1000;
    var t = $('timer');
    function tick() {
      var con = Math.max(0, Math.ceil((hetGio - Date.now()) / 1000));
      t.textContent = 'Còn ' + con + ' giây';
      t.classList.toggle('low', con <= 3);
      if (con <= 0) { dungDongHo(); khiHet(); }
    }
    tick();
    hengio = setInterval(tick, 200);
  }
  function chuyenSau(ms) {
    if (hen) clearTimeout(hen);
    hen = setTimeout(function () { hen = null; cauTiep(); }, ms);
  }
  function hienTiep(on) {
    var b = $('next');
    b.classList.toggle('hidden', !on);
  }
  function hetVan() {
    dungDongHo();
    anHet();
    $('end').classList.remove('hidden');
    var tt = $('end-title');
    tt.textContent = 'Hoàn thành! ' + st.diem + ' điểm';
    $('end-streak').textContent = 'Streak dài nhất: ' + st.streakMax + (st.streakMax >= 3 ? ' 🔥' : '') + ' · ' + st.kq.filter(Boolean).length + '/' + st.deck.length + ' câu đúng';
    var ol = $('review');
    ol.textContent = '';
    st.review.forEach(function (r) {
      var li = el('li', '');
      li.appendChild(el('strong', '', (r.ok ? '✔ ' : '✘ ') + r.tieu));
      li.appendChild(document.createElement('br'));
      if (r.chiTiet) li.appendChild(el('span', '', r.chiTiet));
      ol.appendChild(li);
    });
    mascot(st.kq.filter(Boolean).length >= 7 ? MASCOT.vui : MASCOT.suyNghi, null);
    $('again').focus();
  }

  // ---------- Đoán kết quả ----------
  function veDoan() {
    var q = st.deck[st.idx];
    st.answered = false;
    veTienDo();
    capNhatDiem();
    $('meta').textContent = q.topic + ' · cấp ' + q.level;
    $('bubble').textContent = 'Đoán xem đoạn này in ra gì nhé!';
    mascot(MASCOT.suyNghi, null);
    hienTiep(false);
    $('feedback').textContent = '';

    var area = $('code-area');
    area.textContent = '';
    var box = el('div', 'code-box');
    var lines = q.code.split('\n');
    var gut = el('div', 'gutter', '');
    lines.forEach(function (_, i) { gut.appendChild(el('div', '', String(i + 1))); });
    var pre = el('pre', '', q.code);
    pre.setAttribute('tabindex', '0');
    pre.setAttribute('aria-label', 'Đoạn code');
    box.appendChild(gut);
    box.appendChild(pre);
    area.appendChild(box);

    var ans = $('answers');
    ans.textContent = '';
    st.ansButtons = [];
    q.options.forEach(function (o, i) {
      var b = el('button', '', '');
      b.type = 'button';
      b.appendChild(el('span', 'mark', ''));
      var code = el('code', '', (i + 1) + '. ' + o.text);
      b.appendChild(code);
      b.setAttribute('data-i', String(i));
      b.addEventListener('click', function () { chonDoan(i); });
      ans.appendChild(b);
      st.ansButtons.push(b);
    });
    batDongHo(GIAY.doan, function () { chonDoan(-1); });
    st.ansButtons[0].focus();
  }

  function chonDoan(i) {
    if (st.answered) return;
    st.answered = true;
    dungDongHo();
    var q = st.deck[st.idx];
    var dung = i >= 0 && q.options[i].right;
    var fb = $('feedback');
    st.ansButtons.forEach(function (b, k) {
      b.disabled = true;
      var mk = b.querySelector('.mark');
      if (q.options[k].right) { b.classList.add('ok'); if (!mk.textContent) mk.textContent = '✅'; }
      if (k === i && !dung) { b.classList.add('bad'); mk.textContent = '❌'; }
    });
    var diemCau = 0;
    if (dung) {
      st.streak++;
      diemCau = 10 + (st.streak >= 3 ? 5 : 0);
      st.diem += diemCau;
      st.kq.push(true);
      mascot(MASCOT.vui, 'nod');
      $('bubble').textContent = 'Đúng rồi! +' + diemCau + ' điểm';
      fb.textContent = '✅ Đúng. ' + q.gt;
      chuyenSau(1800);
    } else {
      st.streak = 0;
      st.kq.push(false);
      mascot(MASCOT.suyNghi, 'shake');
      var het = i < 0;
      $('bubble').textContent = het ? 'Hết giờ rồi. Đáp án đúng là ô có ✅.' : 'Chưa đúng, xem đáp án có ✅ nhé.';
      fb.textContent = (het ? '⏱ Hết giờ. ' : '❌ Chưa đúng. ') + q.gt;
      chuyenSau(2800);
    }
    st.streakMax = Math.max(st.streakMax, st.streak);
    st.review.push({
      ok: dung,
      tieu: q.topic + ' (cấp ' + q.level + ')',
      chiTiet: (dung ? 'Bạn chọn đúng: ' : 'Đáp án đúng: ') + q.answer.replace(/\n/g, ' ⏎ ') + (dung ? '' : (i >= 0 ? ' (bạn chọn: ' + q.options[i].text.replace(/\n/g, ' ⏎ ') + ')' : ' (hết giờ)'))
    });
    capNhatDiem();
    hienTiep(true);
    $('next').focus();
  }

  // ---------- Tìm lỗi ----------
  function veLoi() {
    var q = st.deck[st.idx];
    st.answered = false;
    st.tim = false;
    veTienDo();
    capNhatDiem();
    $('meta').textContent = q.topic + ' · cấp ' + q.level + ' · chạm vào dòng bị lỗi';
    $('bubble').textContent = 'Dòng nào sai đây? Chạm vào dòng để chỉ ra lỗi!';
    mascot(MASCOT.suyNghi, null);
    hienTiep(false);
    $('feedback').textContent = '';

    var area = $('code-area');
    area.textContent = '';
    var box = el('div', 'code-lines');
    st.lineButtons = [];
    q.lines.forEach(function (ln, i) {
      var b = el('button', 'ln', '');
      b.type = 'button';
      b.setAttribute('data-i', String(i));
      b.setAttribute('aria-label', 'Dòng ' + (i + 1) + ': ' + ln);
      b.appendChild(el('span', 'num', String(i + 1)));
      b.appendChild(el('span', 'mark', ''));
      b.appendChild(el('span', 'txt', ln));
      b.addEventListener('click', function () { chamDong(i); });
      box.appendChild(b);
      st.lineButtons.push(b);
    });
    area.appendChild(box);
    batDongHo(GIAY.loi, function () { hetGioLoi(); });
    st.lineButtons[0].focus();
  }

  function chamDong(i) {
    if (st.answered) return;
    var q = st.deck[st.idx];
    var b = st.lineButtons[i];
    if (i + 1 === q.bugLine) {
      st.answered = true;
      dungDongHo();
      b.classList.add('ok');
      b.querySelector('.mark').textContent = '✔';
      st.lineButtons.forEach(function (x) { x.disabled = true; });
      st.streak++;
      st.diem += 15;
      st.kq.push(true);
      st.streakMax = Math.max(st.streakMax, st.streak);
      st.review.push({ ok: true, tieu: q.name + ' (dòng ' + q.bugLine + ')', chiTiet: q.gt });
      mascot(MASCOT.vui, 'nod');
      $('bubble').textContent = 'Đúng rồi! Lỗi là: ' + q.name + '. +15 điểm';
      $('feedback').textContent = '✔ ' + q.gt + ' Sửa thành: ' + q.fixedLine.trim();
      capNhatDiem();
      hienTiep(true);
      chuyenSau(2600);
      $('next').focus();
    } else {
      if (b.classList.contains('bad')) return;
      b.classList.add('bad');
      b.querySelector('.mark').textContent = '✘';
      st.diem = Math.max(0, st.diem - 5);
      st.streak = 0;
      mascot(MASCOT.suyNghi, 'shake');
      $('bubble').textContent = 'Dòng này không phải lỗi, tìm tiếp!';
      $('feedback').textContent = '✘ Dòng ' + (i + 1) + ' đúng rồi, không phải lỗi. −5 điểm.';
      capNhatDiem();
    }
  }

  function hetGioLoi() {
    var q = st.deck[st.idx];
    st.answered = true;
    st.lineButtons.forEach(function (x, k) {
      x.disabled = true;
      if (k + 1 === q.bugLine) { x.classList.add('reveal'); x.querySelector('.mark').textContent = '⚠'; }
    });
    st.streak = 0;
    st.kq.push(false);
    st.review.push({ ok: false, tieu: q.name + ' (dòng ' + q.bugLine + ')', chiTiet: 'Hết giờ. ' + q.gt });
    mascot(MASCOT.suyNghi, 'shake');
    $('bubble').textContent = 'Hết giờ! Dòng có ⚠ là lỗi.';
    $('feedback').textContent = '⏱ Hết giờ. ' + q.gt;
    capNhatDiem();
    hienTiep(true);
    chuyenSau(3000);
    $('next').focus();
  }

  // ---------- Điều khiển chung ----------
  function cauTiep() {
    dungDongHo();
    st.idx++;
    if (st.idx >= st.deck.length) { hetVan(); return; }
    if (st.loai === 'doan') veDoan(); else veLoi();
  }

  function batDau(loai) {
    dungDongHo();
    $('load-error').classList.add('hidden');
    taiDuLieu(loai).then(function (ds) {
      if (!ds.length) throw new Error('rỗng');
      st = {
        loai: loai, deck: xaoTron(ds).slice(0, MAX_CAU), idx: 0, diem: 0, streak: 0, streakMax: 0,
        kq: [], review: [], answered: false
      };
      $('title').textContent = TEN[loai];
      anHet();
      $('play').classList.remove('hidden');
      mascot(MASCOT.chao, null);
      $('bubble').textContent = loai === 'doan' ? 'Đoán xem đoạn này in ra gì nhé!' : 'Dòng nào sai đây? Chạm vào dòng để chỉ ra lỗi!';
      if (loai === 'doan') veDoan(); else veLoi();
    }).catch(function (e) {
      anHet();
      $('menu').classList.remove('hidden');
      hienLoi('Không tải được câu hỏi (' + e.message + '). Mở trang này qua máy chủ Học code (http://localhost:4500/tro-choi.html) hoặc trang đã đưa lên mạng.');
    });
  }

  function vaoMenu() {
    dungDongHo();
    st = null;
    anHet();
    $('title').textContent = 'Trò chơi';
    $('menu').classList.remove('hidden');
    $('start-doan').focus();
  }

  $('start-doan').addEventListener('click', function () { batDau('doan'); });
  $('start-loi').addEventListener('click', function () { batDau('loi'); });
  $('next').addEventListener('click', function () { if (hen) { clearTimeout(hen); hen = null; } cauTiep(); });
  $('quit').addEventListener('click', vaoMenu);
  $('again').addEventListener('click', function () { if (st) batDau(st.loai); });
  $('to-menu').addEventListener('click', vaoMenu);

  // Phím tắt: 1–4 chọn đáp án (Đoán kết quả); mũi tên lên/xuống di chuyển dòng (Tìm lỗi); Enter/Space sang câu tiếp.
  document.addEventListener('keydown', function (e) {
    if (!st || $('play').classList.contains('hidden')) return;
    if (st.loai === 'doan' && !st.answered && /^[1-4]$/.test(e.key)) {
      var k = parseInt(e.key, 10) - 1;
      if (st.ansButtons[k]) { e.preventDefault(); st.ansButtons[k].focus(); chonDoan(k); }
      return;
    }
    if (st.loai === 'loi' && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      var active = document.activeElement;
      var idx = st.lineButtons.indexOf(active);
      if (idx < 0) return;
      e.preventDefault();
      var nxt = idx + (e.key === 'ArrowDown' ? 1 : -1);
      if (st.lineButtons[nxt]) st.lineButtons[nxt].focus();
      return;
    }
    if ((e.key === 'Enter' || e.key === ' ') && st.answered && !$('next').classList.contains('hidden') && document.activeElement === document.body) {
      e.preventDefault();
      $('next').click();
    }
  });
})();
