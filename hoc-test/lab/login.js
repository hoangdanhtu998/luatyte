// Màn hình đăng nhập bệnh nhân. Quy tắc nằm trong core.js (Lab.login, Lab.session).
(function () {
  'use strict';
  var L = window.Lab;

  function $(id) { return document.getElementById(id); }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  }
  function setErr(id, msg) { $(id).textContent = msg || ''; }

  function renderMine(phone) {
    var box = $('my-list');
    box.replaceChildren();
    var items = L.myAppointments(phone);
    if (!items.length) { box.appendChild(el('p', 'sub', 'Chưa có lịch nào.')); return; }
    var list = el('div', 'my-items');
    items.slice().reverse().forEach(function (a) {
      var row = el('div', 'my-item');
      row.appendChild(el('span', 'mono', a.code));
      row.appendChild(el('span', '', a.date + ' · ' + a.time));
      row.appendChild(el('span', 'st st-' + a.status, L.STATUS[a.status] || a.status));
      list.appendChild(row);
    });
    box.appendChild(list);
  }

  function render() {
    var acc = L.session();
    $('login-form').hidden = !!acc;
    $('login-panel').hidden = !acc;
    if (!acc) return;
    $('login-name').textContent = acc.name;
    renderMine(acc.phone);
  }

  function onSubmit(ev) {
    ev.preventDefault();
    setErr('login-err-phone', '');
    setErr('login-err-pass', '');
    setErr('login-msg', '');
    var r = L.login($('login-phone').value, $('login-pass').value);
    $('login-pass').value = '';
    if (r.ok) { render(); return; }
    if (r.errors) {
      setErr('login-err-phone', r.errors.phone || '');
      setErr('login-err-pass', r.errors.password || '');
      return;
    }
    if (r.locked) { setErr('login-msg', 'Tạm khóa đăng nhập số này. Thử lại sau ' + r.wait + ' giây.'); return; }
    setErr('login-msg', r.error);
  }

  function init() {
    if (!$('login-form')) return;
    $('login-form').addEventListener('submit', onSubmit);
    $('logout-btn').addEventListener('click', function () { L.logout(); render(); });
  }

  window.LabLogin = { render: render };
  init();
})();
