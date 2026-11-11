// Giao diện của app tập. Mọi quy tắc nghiệp vụ nằm trong core.js.
(function () {
  'use strict';
  var L = window.Lab;
  var SUBMIT_DELAY_MS = 700;
  var ADMIN_FLAG = 'lab-saomai-admin';

  function $(id) { return document.getElementById(id); }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  }
  function doctorName(id) { var d = L.DOCTORS.find(function (x) { return x.id === id; }); return d ? d.name : id; }
  function viDate(s) { var p = String(s).split('-'); return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : s; }

  // ----- Chuyển màn hình -----
  var views = ['book', 'lookup', 'admin', 'api'];
  function show(name) {
    views.forEach(function (v) { $('view-' + v).hidden = v !== name; });
    document.querySelectorAll('.views button').forEach(function (b) {
      if (b.dataset.view === name) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
    });
    if (name === 'admin') renderAdmin();
    try { history.replaceState(null, '', location.pathname + location.search + '#' + name); } catch (e) { /* bỏ qua */ }
  }
  document.querySelectorAll('.views button').forEach(function (b) {
    b.addEventListener('click', function () { show(b.dataset.view); });
  });

  // ----- Chân trang: bản dựng, đồng hồ, dữ liệu -----
  function setupFooter() {
    $('build-badge').textContent = 'Bản ' + L.build;
    var other = L.build === '1.0' ? '1.1' : '1.0';
    var sw = $('build-switch');
    sw.textContent = 'Chuyển sang bản ' + other;
    sw.href = 'index.html?build=' + other;
    $('home-link').href = 'index.html?build=' + L.build;
    $('clock').value = L.toStr(L.today());
    $('clock').addEventListener('change', function () { L.setClock($('clock').value); location.reload(); });
    $('clock-clear').addEventListener('click', function () { L.setClock(''); location.reload(); });
    $('reset-data').addEventListener('click', function () {
      if (!window.confirm('Xóa mọi lịch đã tạo và nạp lại dữ liệu mẫu?')) return;
      L.reset();
      location.reload();
    });
  }

  // ----- Đặt lịch -----
  function setupBooking() {
    var field = $('phone-field');
    if (!L.has('q18')) {
      var lb = el('label', '', 'Số điện thoại');
      lb.htmlFor = 'f-phone';
      field.insertBefore(lb, field.firstChild);
      $('f-phone').removeAttribute('placeholder');
    } else {
      field.classList.add('no-label');
    }
    L.DOCTORS.forEach(function (d) { var o = el('option', '', d.name); o.value = d.id; $('f-doctor').appendChild(o); });
    Object.keys(L.SERVICES).forEach(function (k) {
      var o = el('option', '', L.SERVICES[k].name + ' · ' + L.money(L.SERVICES[k].fee)); o.value = k; $('f-service').appendChild(o);
    });
    $('f-date').value = L.plus(2);
    ['f-doctor', 'f-date'].forEach(function (id) { $(id).addEventListener('change', fillTimes); });
    ['f-age', 'f-service', 'f-bhyt'].forEach(function (id) {
      $(id).addEventListener('input', previewFee);
      $(id).addEventListener('change', previewFee);
    });
    fillTimes();
    previewFee();
    $('book-form').addEventListener('submit', onSubmit);
  }
  function fillTimes() {
    var sel = $('f-time');
    var keep = sel.value;
    var s = L.load();
    sel.innerHTML = '';
    L.slotTimes().forEach(function (t) {
      var n = L.booked(s, $('f-doctor').value, $('f-date').value, t);
      var full = L.slotFull(n);
      var o = el('option', '', t + (full ? ' · đã đủ' : ' · còn ' + Math.max(0, L.MAX_PER_SLOT - n) + ' chỗ'));
      o.value = t;
      o.disabled = full;
      sel.appendChild(o);
    });
    if (keep) sel.value = keep;
  }
  function previewFee() {
    var ageText = $('f-age').value.trim();
    var age = /^\d+$/.test(ageText) ? Number(ageText) : 30;
    $('fee-preview').textContent = L.money(L.fee(age, $('f-service').value, $('f-bhyt').checked));
  }
  function readForm() {
    return {
      name: $('f-name').value, phone: $('f-phone').value, age: $('f-age').value, guardian: $('f-guardian').value,
      doctor: $('f-doctor').value, service: $('f-service').value, bhyt: $('f-bhyt').checked,
      date: $('f-date').value, time: $('f-time').value,
    };
  }
  function showErrors(errors) {
    document.querySelectorAll('#book-form [data-err]').forEach(function (p) {
      var msg = errors[p.dataset.err] || '';
      p.textContent = msg;
      var input = p.parentNode.querySelector('input, select');
      if (input) input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    });
  }
  function onSubmit(ev) {
    ev.preventDefault();
    var btn = $('book-submit');
    var input = readForm();
    var errors = L.validate(input);
    showErrors(errors);
    $('book-result').hidden = true;
    if (Object.keys(errors).length) return;
    // Bản dựng tốt khóa nút trong lúc gửi để không tạo trùng lịch.
    if (!L.has('q17')) btn.disabled = true;
    $('book-sending').hidden = false;
    window.setTimeout(function () {
      var r = L.create(input);
      btn.disabled = false;
      $('book-sending').hidden = true;
      if (!r.ok) { showErrors(r.errors); return; }
      renderTicket($('book-result'), r.appointment, 'Đặt lịch thành công', false);
      fillTimes();
    }, SUBMIT_DELAY_MS);
  }

  function renderTicket(box, a, heading, plainMoney) {
    box.innerHTML = '';
    box.hidden = false;
    box.className = 'result ok';
    box.appendChild(el('h2', '', heading));
    var dl = el('dl', 'ticket');
    [
      ['Mã lịch', a.code], ['Họ tên', a.name], ['Số điện thoại', a.phone], ['Tuổi', String(a.age)],
      ['Người giám hộ', a.guardian || 'Không có'], ['Bác sĩ', doctorName(a.doctor)],
      ['Loại khám', (L.SERVICES[a.service] || {}).name || a.service], ['BHYT', a.bhyt ? 'Có' : 'Không'],
      ['Ngày giờ', viDate(a.date) + ' lúc ' + a.time], ['Phí', L.money(a.fee, plainMoney)],
      ['Trạng thái', L.STATUS[a.status] || a.status],
    ].forEach(function (row) { dl.appendChild(el('dt', '', row[0])); dl.appendChild(el('dd', '', row[1])); });
    box.appendChild(dl);
  }

  // ----- Tra cứu -----
  function setupLookup() {
    $('lookup-form').addEventListener('submit', function (ev) {
      ev.preventDefault();
      var box = $('lookup-result');
      var a = L.find($('l-code').value, $('l-phone').value);
      if (!a) {
        box.hidden = false; box.className = 'result bad'; box.innerHTML = '';
        box.appendChild(el('p', '', 'Không tìm thấy lịch khớp với số điện thoại và mã lịch này.'));
        return;
      }
      renderTicket(box, a, 'Thông tin lịch khám', L.has('q12'));
      if (L.canCancel(a)) {
        var b = el('button', 'danger', 'Hủy lịch này');
        b.type = 'button';
        b.addEventListener('click', function () {
          if (!window.confirm('Hủy lịch ' + a.code + '?')) return;
          var r = L.setStatus(a.code, 'huy');
          if (r.ok) renderTicket(box, r.appointment, 'Đã hủy lịch', L.has('q12'));
          fillTimes();
        });
        box.appendChild(b);
      }
    });
  }

  // ----- Quản trị -----
  function isAdmin() { try { return sessionStorage.getItem(ADMIN_FLAG) === '1'; } catch (e) { return false; } }
  function setAdmin(on) { try { if (on) sessionStorage.setItem(ADMIN_FLAG, '1'); else sessionStorage.removeItem(ADMIN_FLAG); } catch (e) { /* bỏ qua */ } }
  // Chèn chuỗi như HTML nhưng bỏ script và thuộc tính sự kiện, để lỗi hiển thị vẫn quan sát được mà không chạy mã.
  function inertHtml(text) {
    var t = document.createElement('template');
    t.innerHTML = String(text);
    t.content.querySelectorAll('script, iframe, object, embed, link, style, meta').forEach(function (n) { n.remove(); });
    t.content.querySelectorAll('*').forEach(function (n) {
      Array.prototype.slice.call(n.attributes).forEach(function (at) {
        if (/^on/i.test(at.name) || /^(href|src|action|formaction|srcdoc)$/i.test(at.name)) n.removeAttribute(at.name);
      });
    });
    return t.content;
  }
  function renderAdmin() {
    var logged = isAdmin();
    $('admin-login').hidden = logged;
    $('admin-panel').hidden = !logged;
    if (!logged) return;
    var s = L.load();
    $('admin-count').textContent = 'Tổng số lịch: ' + s.items.length;
    var body = document.querySelector('#admin-table tbody');
    body.innerHTML = '';
    s.items.slice().reverse().forEach(function (a) {
      var tr = el('tr');
      tr.appendChild(el('td', '', a.code));
      var nameCell = el('td');
      if (L.has('q16')) nameCell.appendChild(inertHtml(a.name)); else nameCell.textContent = a.name;
      tr.appendChild(nameCell);
      tr.appendChild(el('td', '', a.phone));
      tr.appendChild(el('td', '', String(a.age)));
      tr.appendChild(el('td', '', doctorName(a.doctor)));
      tr.appendChild(el('td', '', viDate(a.date) + ' ' + a.time));
      tr.appendChild(el('td', '', L.money(a.fee)));
      tr.appendChild(el('td', 'st st-' + a.status, L.STATUS[a.status] || a.status));
      var ops = el('td', 'ops');
      [['xacnhan', 'Xác nhận', a.status === 'cho'], ['dakham', 'Đã khám', a.status === 'xacnhan'], ['huy', 'Hủy', L.canCancel(a)]]
        .forEach(function (op) {
          if (!op[2]) return;
          var b = el('button', op[0] === 'huy' ? 'danger small' : 'small', op[1]);
          b.type = 'button';
          b.addEventListener('click', function () { L.setStatus(a.code, op[0]); renderAdmin(); fillTimes(); });
          ops.appendChild(b);
        });
      tr.appendChild(ops);
      body.appendChild(tr);
    });
  }
  function setupAdmin() {
    if (L.has('q19')) $('admin-table-box').classList.add('no-scroll');
    $('admin-form').addEventListener('submit', function (ev) {
      ev.preventDefault();
      var r = L.adminLogin($('a-pin').value);
      $('a-pin').value = '';
      if (r.ok) { $('admin-err').textContent = ''; setAdmin(true); renderAdmin(); return; }
      $('admin-err').textContent = r.locked
        ? 'Đăng nhập đang bị khóa. Thử lại sau ' + r.wait + ' giây.'
        : 'Mã PIN không đúng.';
    });
    $('admin-logout').addEventListener('click', function () { setAdmin(false); renderAdmin(); });
  }

  // ----- API -----
  function setupApi() {
    $('api-path').value = '/slots?doctor=lan&date=' + L.plus(2);
    $('api-body').value = JSON.stringify({
      name: 'Nguyễn Thị Hoa', phone: '0912345678', age: 30, guardian: '', doctor: 'lan',
      service: 'thuong', bhyt: false, date: L.plus(2), time: '10:00',
    }, null, 2);
    $('api-form').addEventListener('submit', function (ev) {
      ev.preventDefault();
      var method = $('api-method').value;
      var body = null;
      if (method === 'POST' || method === 'PUT') {
        try { body = JSON.parse($('api-body').value); }
        catch (e) { $('api-status').textContent = 'Thân yêu cầu không phải JSON hợp lệ: ' + e.message; $('api-response').textContent = ''; return; }
      }
      var r = L.api(method, $('api-path').value.trim(), body);
      $('api-status').textContent = method + ' ' + $('api-path').value.trim() + ' → ' + r.status;
      $('api-status').className = 'api-status ' + (r.status < 300 ? 'good' : 'bad');
      $('api-response').textContent = JSON.stringify(r.body, null, 2);
      fillTimes();
    });
  }

  setupFooter();
  setupBooking();
  setupLookup();
  setupAdmin();
  setupApi();
  var start = location.hash.replace('#', '');
  show(views.indexOf(start) >= 0 ? start : 'book');
})();
