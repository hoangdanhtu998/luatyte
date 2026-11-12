// Màn hình đăng nhập bệnh nhân: đăng nhập, đổi mật khẩu, quên mật khẩu, nhắc lịch.
// Quy tắc nằm trong core.js (Lab.login, Lab.changePassword, Lab.requestReset, Lab.resetPassword, Lab.upcomingFor).
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
  function setNotice(id, msg) { var n = $(id); n.textContent = msg || ''; n.hidden = !msg; }

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

  function renderReminder(phone) {
    var box = $('reminder');
    var soon = L.upcomingFor(phone);
    box.hidden = !soon.length;
    box.replaceChildren();
    if (!soon.length) return;
    box.appendChild(el('strong', '', 'Sắp đến lịch khám'));
    soon.forEach(function (a) {
      box.appendChild(el('p', '', 'Lịch ' + a.code + ' ngày ' + a.date + ' lúc ' + a.time + ' với ' + (L.DOCTORS.find(function (d) { return d.id === a.doctor; }) || { name: a.doctor }).name + '.'));
    });
  }

  function render() {
    var acc = L.session();
    $('login-form').hidden = !!acc;
    $('forgot').hidden = true;
    $('login-panel').hidden = !acc;
    if (!acc) return;
    $('login-name').textContent = acc.name;
    renderReminder(acc.phone);
    renderMine(acc.phone);
  }

  // ----- Đăng nhập -----
  function onLogin(ev) {
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

  // ----- Đổi mật khẩu -----
  function onChangePassword(ev) {
    ev.preventDefault();
    setErr('pw-err-old', '');
    setErr('pw-err-new', '');
    setNotice('pw-msg', '');
    var acc = L.session();
    if (!acc) return;
    var r = L.changePassword(acc.phone, $('pw-old').value, $('pw-new').value);
    if (r.ok) {
      $('pw-old').value = '';
      $('pw-new').value = '';
      setNotice('pw-msg', 'Đã đổi mật khẩu. Lần đăng nhập sau dùng mật khẩu mới.');
      return;
    }
    setErr('pw-err-old', (r.errors && r.errors.old) || '');
    setErr('pw-err-new', (r.errors && r.errors.new) || r.error || '');
  }

  // ----- Quên mật khẩu -----
  function onForgotSend() {
    setErr('fg-err-phone', '');
    setNotice('fg-notice', '');
    var r = L.requestReset($('fg-phone').value);
    if (!r.ok) {
      setErr('fg-err-phone', (r.errors && r.errors.phone) || r.error || '');
      $('fg-step2').hidden = true;
      return;
    }
    setNotice('fg-notice', 'Mã xác nhận (mã mẫu của app tập): ' + r.code + '. Có hiệu lực ' + r.minutes + ' phút.');
    $('fg-step2').hidden = false;
  }
  function onForgotReset() {
    setErr('fg-err-code', '');
    setErr('fg-err-new', '');
    setErr('fg-msg', '');
    var r = L.resetPassword($('fg-phone').value, $('fg-code').value, $('fg-new').value);
    if (r.ok) {
      setErr('fg-msg', '');
      $('fg-step2').hidden = true;
      setNotice('fg-notice', 'Đã đặt mật khẩu mới. Hãy đăng nhập lại.');
      $('fg-code').value = '';
      $('fg-new').value = '';
      return;
    }
    setErr('fg-err-code', (r.errors && r.errors.code) || '');
    setErr('fg-err-new', (r.errors && r.errors.new) || '');
    setErr('fg-msg', r.error || '');
  }

  function init() {
    if (!$('login-form')) return;
    $('login-form').addEventListener('submit', onLogin);
    $('logout-btn').addEventListener('click', function () { L.logout(); render(); });
    $('pw-form').addEventListener('submit', onChangePassword);
    $('forgot-open').addEventListener('click', function () {
      $('login-form').hidden = true;
      $('forgot').hidden = false;
    });
    $('fg-send').addEventListener('click', onForgotSend);
    $('fg-reset').addEventListener('click', onForgotReset);
  }

  window.LabLogin = { render: render };
  init();
})();
