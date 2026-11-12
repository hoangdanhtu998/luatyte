// Phòng khám Sao Mai: lõi nghiệp vụ của app tập kiểm thử.
// Đây là "hệ thống cần kiểm thử". Mỗi bản dựng (build) bật một tập sai lệch có chủ đích.
// Mã sai lệch chỉ là ký hiệu; mô tả nằm trong đáp án của sổ tay, không nằm ở đây.
(function (root) {
  'use strict';

  var STORE_KEY = 'lab-saomai-v1';
  var CLOCK_KEY = 'lab-saomai-clock';
  var DAY_MS = 86400000;
  var MAX_PER_SLOT = 3;
  var ADMIN_PIN = '2468';
  var LOCK_AFTER = 5;
  var LOCK_MS = 60000;

  var BUILD_QUIRKS = {
    '1.0': ['q01', 'q02', 'q03', 'q04', 'q05', 'q06', 'q07', 'q08', 'q09', 'q10', 'q11', 'q12', 'q13', 'q14',
      'q15', 'q16', 'q17', 'q18', 'q19', 'q20', 'a1', 'a2', 'a3'],
    '1.1': ['q01', 'q02', 'q03', 'q05', 'q06', 'q08', 'q10', 'q12', 'q13', 'q14',
      'q16', 'q17', 'q18', 'q19', 'q20', 'q21', 'q22', 'a1', 'a2', 'a3'],
  };

  var DOCTORS = [
    { id: 'lan', name: 'BS. Lan (Nội tổng quát)' },
    { id: 'hung', name: 'BS. Hùng (Nhi)' },
    { id: 'mai', name: 'BS. Mai (Da liễu)' },
  ];
  var SERVICES = { thuong: { name: 'Khám thường', fee: 150000 }, chuyenkhoa: { name: 'Khám chuyên khoa', fee: 300000 } };
  var STATUS = { cho: 'Chờ xác nhận', xacnhan: 'Đã xác nhận', dakham: 'Đã khám', huy: 'Đã hủy' };

  function buildFromUrl() {
    try { return new URLSearchParams(root.location.search).get('build') === '1.1' ? '1.1' : '1.0'; } catch (e) { return '1.0'; }
  }
  var build = buildFromUrl();
  var quirks = new Set(BUILD_QUIRKS[build]);
  function has(code) { return quirks.has(code); }

  // ----- Ngày giờ: dùng đồng hồ giả lập để ca kiểm thử lặp lại được -----
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function toStr(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function parse(s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || ''));
    if (!m) return null;
    var d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    return (d.getMonth() === Number(m[2]) - 1 && d.getDate() === Number(m[3])) ? d : null;
  }
  function today() {
    var saved = null;
    try { saved = parse(root.localStorage.getItem(CLOCK_KEY)); } catch (e) { /* không đọc được thì dùng ngày thật */ }
    var d = saved || new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }
  function setClock(str) {
    try {
      if (str && parse(str)) root.localStorage.setItem(CLOCK_KEY, str); else root.localStorage.removeItem(CLOCK_KEY);
    } catch (e) { /* bỏ qua */ }
  }
  function plus(n) { var t = today(); return toStr(new Date(t.getFullYear(), t.getMonth(), t.getDate() + n)); }

  // ----- Lưu trữ -----
  function seed() {
    return {
      seq: 100005,
      fails: 0,
      lockedUntil: 0,
      items: [
        { code: 'SM-100001', name: 'Nguyễn Văn An', phone: '0901000001', age: 34, guardian: '', doctor: 'lan', service: 'thuong', bhyt: false, date: plus(2), time: '09:00', status: 'cho', fee: 150000 },
        { code: 'SM-100002', name: 'Trần Thị Bình', phone: '0901000002', age: 67, guardian: '', doctor: 'lan', service: 'thuong', bhyt: true, date: plus(2), time: '09:00', status: 'xacnhan', fee: 70000 },
        { code: 'SM-100003', name: 'Lê Minh Châu', phone: '0901000003', age: 5, guardian: 'Lê Văn Đức', doctor: 'hung', service: 'thuong', bhyt: false, date: plus(3), time: '10:00', status: 'cho', fee: 0 },
        { code: 'SM-100004', name: 'Phạm Quốc Dũng', phone: '0901000004', age: 45, guardian: '', doctor: 'mai', service: 'chuyenkhoa', bhyt: false, date: plus(-1), time: '14:00', status: 'dakham', fee: 300000 },
        { code: 'SM-100005', name: 'Hoàng Thu Giang', phone: '0901000005', age: 29, guardian: '', doctor: 'mai', service: 'chuyenkhoa', bhyt: true, date: plus(4), time: '15:30', status: 'huy', fee: 250000 },
      ],
    };
  }
  function load() {
    try {
      var s = JSON.parse(root.localStorage.getItem(STORE_KEY));
      if (s && Array.isArray(s.items)) return s;
    } catch (e) { /* dữ liệu hỏng thì tạo lại */ }
    var fresh = seed();
    save(fresh);
    return fresh;
  }
  function save(s) { try { root.localStorage.setItem(STORE_KEY, JSON.stringify(s)); } catch (e) { /* bộ nhớ đầy */ } }
  function reset() { var s = seed(); save(s); return s; }

  // ----- Quy tắc nghiệp vụ -----
  function slotTimes() {
    var out = [];
    for (var m = 8 * 60; m <= 16 * 60 + 30; m += 30) {
      var lunch = m >= 11 * 60 + 30 && m < 13 * 60;
      if (lunch && !(has('q08') && m === 11 * 60 + 30)) continue;
      out.push(pad(Math.floor(m / 60)) + ':' + pad(m % 60));
    }
    return out;
  }
  function booked(s, doctor, date, time) {
    return s.items.filter(function (a) {
      return a.doctor === doctor && a.date === date && a.time === time && (has('q14') || a.status !== 'huy');
    }).length;
  }
  function slotFull(count) { return has('q09') ? count > MAX_PER_SLOT : count >= MAX_PER_SLOT; }

  function fee(age, service, bhyt) {
    var base = (SERVICES[service] || SERVICES.thuong).fee;
    var free = age < 6 && !has('q21');
    var amount = free ? 0 : base;
    var senior = has('q10') ? age > 60 : age >= 60;
    if (!free && senior) amount = amount * 0.8;
    if (bhyt) amount -= 50000;
    if (!has('q11')) amount = Math.max(0, amount);
    return Math.round(amount);
  }
  function money(n, plain) {
    if (plain) return n + 'đ';
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + 'đ';
  }

  function validate(input) {
    var e = {};
    var rawName = String(input.name == null ? '' : input.name);
    var name = has('q02') ? rawName : rawName.trim();
    var minName = has('q01') ? 1 : 2;
    if (name.length < minName || name.length > 50) e.name = 'Họ tên phải từ 2 đến 50 ký tự.';

    var phone = String(input.phone == null ? '' : input.phone).trim();
    var phoneOk = has('q03') ? /^0\d{9,10}$/.test(phone) : /^0\d{9}$/.test(phone);
    if (!phoneOk) e.phone = 'Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 0.';

    var ageText = String(input.age == null ? '' : input.age).trim();
    var age = Number(ageText);
    var ageOk = /^\d+$/.test(ageText) && (has('q04') ? age < 120 : age <= 120);
    if (!ageOk) e.age = 'Tuổi phải là số nguyên từ 0 đến 120.';
    else {
      var needGuardian = has('q05') ? age <= 16 : age < 16;
      if (needGuardian && !String(input.guardian || '').trim()) e.guardian = 'Người dưới 16 tuổi cần có tên người giám hộ.';
    }

    if (!DOCTORS.some(function (d) { return d.id === input.doctor; })) e.doctor = 'Hãy chọn bác sĩ.';
    if (!SERVICES[input.service]) e.service = 'Hãy chọn loại khám.';

    var d = parse(input.date);
    if (!d) e.date = 'Hãy chọn ngày khám.';
    else {
      var t = today();
      var diff = Math.round((d.getTime() - t.getTime()) / DAY_MS);
      var minDiff = has('q06') ? 0 : 1;
      var maxDiff = has('q22') ? 29 : 30;
      var closedDay = has('q07') ? 6 : 0;
      if (diff < minDiff || diff > maxDiff) e.date = 'Ngày khám phải từ ngày mai đến tối đa 30 ngày tới.';
      else if (d.getDay() === closedDay) e.date = 'Phòng khám nghỉ Chủ nhật. Hãy chọn ngày khác.';
    }
    if (slotTimes().indexOf(input.time) < 0) e.time = 'Hãy chọn giờ khám.';
    return e;
  }

  function create(input, opts) {
    var s = load();
    var skipValidation = opts && opts.viaApi && has('a1');
    var errors = skipValidation ? {} : validate(input);
    if (Object.keys(errors).length) return { ok: false, errors: errors };
    if (slotFull(booked(s, input.doctor, input.date, input.time))) {
      return { ok: false, full: true, errors: { time: 'Khung giờ này đã đủ ' + MAX_PER_SLOT + ' lịch. Hãy chọn giờ khác.' } };
    }
    var age = Number(input.age);
    s.seq += 1;
    var appt = {
      code: 'SM-' + s.seq,
      name: has('q02') ? String(input.name) : String(input.name).trim(),
      phone: String(input.phone == null ? '' : input.phone).trim(),
      age: age,
      guardian: String(input.guardian || '').trim(),
      doctor: input.doctor, service: input.service, bhyt: !!input.bhyt,
      date: input.date, time: input.time, status: 'cho',
      fee: fee(age, input.service, !!input.bhyt),
    };
    s.items.push(appt);
    save(s);
    return { ok: true, appointment: appt };
  }

  function find(code, phone) {
    var s = load();
    var c = String(code || '').trim().toUpperCase();
    var p = String(phone || '').trim();
    return s.items.find(function (a) { return a.code === c && (has('q15') || a.phone === p); }) || null;
  }

  function canCancel(a) {
    if (!a) return false;
    var okStatus = a.status === 'cho' || a.status === 'xacnhan' || (has('q13') && a.status === 'dakham');
    var d = parse(a.date);
    return okStatus && !!d && d.getTime() > today().getTime();
  }
  function setStatus(code, next) {
    var s = load();
    var a = s.items.find(function (x) { return x.code === code; });
    if (!a) return { ok: false, reason: 'notfound' };
    var allowed = { xacnhan: ['cho'], dakham: ['xacnhan'] }[next];
    if (next === 'huy') { if (!canCancel(a)) return { ok: false, reason: 'state' }; }
    else if (!allowed || allowed.indexOf(a.status) < 0) return { ok: false, reason: 'state' };
    a.status = next;
    save(s);
    return { ok: true, appointment: a };
  }

  function adminLogin(pin) {
    var s = load();
    var now = Date.now();
    if (!has('q20') && s.lockedUntil > now) return { ok: false, locked: true, wait: Math.ceil((s.lockedUntil - now) / 1000) };
    if (String(pin) === ADMIN_PIN) { s.fails = 0; s.lockedUntil = 0; save(s); return { ok: true }; }
    s.fails = (s.fails || 0) + 1;
    if (s.fails >= LOCK_AFTER) { s.lockedUntil = now + LOCK_MS; s.fails = 0; }
    save(s);
    return { ok: false, locked: false };
  }

  // ----- API mô phỏng: cùng quy tắc với giao diện, trả về mã trạng thái kiểu HTTP -----
  function api(method, path, body) {
    var m = String(method || '').toUpperCase();
    var parts = String(path || '').split('?');
    var route = parts[0].replace(/\/+$/, '');
    var q = new URLSearchParams(parts[1] || '');
    var s = load();

    if (route === '/slots') {
      if (m !== 'GET') return { status: 405, body: { error: 'Phương thức không được hỗ trợ.' } };
      var doctor = q.get('doctor'), date = q.get('date');
      if (!DOCTORS.some(function (d) { return d.id === doctor; }) || !parse(date)) return { status: 400, body: { error: 'Thiếu hoặc sai doctor, date.' } };
      return { status: 200, body: slotTimes().map(function (t) { var n = booked(s, doctor, date, t); return { time: t, booked: n, full: slotFull(n) }; }) };
    }
    if (route === '/appointments') {
      if (m !== 'POST') return { status: 405, body: { error: 'Phương thức không được hỗ trợ.' } };
      if (!body || typeof body !== 'object') return { status: 400, body: { error: 'Thân yêu cầu phải là JSON.' } };
      var r = create(body, { viaApi: true });
      if (r.ok) return { status: has('a3') ? 200 : 201, body: r.appointment };
      return r.full ? { status: 409, body: { error: r.errors.time } } : { status: 400, body: { errors: r.errors } };
    }
    var one = /^\/appointments\/([^/]+)$/.exec(route);
    if (one) {
      var code = decodeURIComponent(one[1]);
      var appt = find(code, q.get('phone'));
      if (m === 'GET') return appt ? { status: 200, body: appt } : { status: 404, body: { error: 'Không tìm thấy lịch.' } };
      if (m === 'DELETE') {
        if (!appt) return has('a2') ? { status: 200, body: { ok: true } } : { status: 404, body: { error: 'Không tìm thấy lịch.' } };
        var c = setStatus(appt.code, 'huy');
        return c.ok ? { status: 200, body: c.appointment } : { status: 409, body: { error: 'Lịch này không hủy được.' } };
      }
      return { status: 405, body: { error: 'Phương thức không được hỗ trợ.' } };
    }
    return { status: 404, body: { error: 'Không có đường dẫn này.' } };
  }

  // ----- Đăng nhập bệnh nhân (tài khoản mẫu, chỉ để tập) -----
  var SESSION_KEY = 'lab-saomai-session';
  var PATIENT_LOCK_AFTER = 5;
  var PATIENT_LOCK_MS = 60000;
  var ACCOUNTS = [
    { phone: '0901000001', name: 'Nguyễn Văn An', password: 'Sao@2026' },
    { phone: '0901000002', name: 'Trần Thị Bình', password: 'Sao@2026' },
  ];
  function session() {
    var p = null;
    try { p = root.localStorage.getItem(SESSION_KEY); } catch (e) { return null; }
    return ACCOUNTS.find(function (a) { return a.phone === p; }) || null;
  }
  function logout() { try { root.localStorage.removeItem(SESSION_KEY); } catch (e) { /* bỏ qua */ } }
  function login(phone, password) {
    var p = String(phone == null ? '' : phone).trim();
    var pw = String(password == null ? '' : password);
    var errors = {};
    if (!/^0\d{9}$/.test(p)) errors.phone = 'Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 0.';
    if (!pw) errors.password = 'Hãy nhập mật khẩu.';
    if (Object.keys(errors).length) return { ok: false, errors: errors };

    var s = load();
    s.loginFails = s.loginFails || {};
    var now = Date.now();
    var rec = s.loginFails[p] || { n: 0, until: 0 };
    if (rec.until > now) return { ok: false, locked: true, wait: Math.ceil((rec.until - now) / 1000) };

    var acc = ACCOUNTS.find(function (a) { return a.phone === p && a.password === pw; });
    if (acc) {
      delete s.loginFails[p];
      save(s);
      try { root.localStorage.setItem(SESSION_KEY, p); } catch (e) { /* bỏ qua */ }
      return { ok: true, account: acc };
    }
    rec.n += 1;
    if (rec.n >= PATIENT_LOCK_AFTER) {
      s.loginFails[p] = { n: 0, until: now + PATIENT_LOCK_MS };
      save(s);
      return { ok: false, locked: true, wait: Math.ceil(PATIENT_LOCK_MS / 1000) };
    }
    s.loginFails[p] = rec;
    save(s);
    return { ok: false, error: 'Số điện thoại hoặc mật khẩu không đúng.' };
  }
  function myAppointments(phone) {
    return load().items.filter(function (a) { return a.phone === phone; });
  }

  root.Lab = {
    session: session, login: login, logout: logout, myAppointments: myAppointments,
    build: build, has: has, DOCTORS: DOCTORS, SERVICES: SERVICES, STATUS: STATUS, MAX_PER_SLOT: MAX_PER_SLOT,
    today: today, toStr: toStr, plus: plus, setClock: setClock,
    load: load, reset: reset, slotTimes: slotTimes, booked: booked, slotFull: slotFull,
    fee: fee, money: money, validate: validate, create: create, find: find,
    canCancel: canCancel, setStatus: setStatus, adminLogin: adminLogin, api: api,
  };
})(typeof window !== 'undefined' ? window : globalThis);
