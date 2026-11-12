// Xem bộ nhớ trực tiếp: đọc kịch bản JSON dựng sẵn và vẽ stack, heap, mũi tên. Không chạy code C, không gọi máy chủ ngoài.
(function () {
  'use strict';
  var THU_MUC = 'content/bo-nho/';
  var NHAN_CANH_BAO = { tranMang: 'Tràn mảng', roRi: 'Rò rỉ bộ nhớ', giaiPhongRoi: 'Giải phóng sai', conTroTreo: 'Con trỏ treo' };
  var SVGNS = 'http://www.w3.org/2000/svg';
  var $ = function (id) { return document.getElementById(id); };

  var danhSach = [];
  var vd = null;
  var buoc = 0;
  var cache = {};
  var chonVd = $('bn-vd');

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  function hienLoi(msg) {
    var h = $('bn-loi');
    h.textContent = msg;
    h.hidden = false;
    $('bn-trang').hidden = true;
  }

  function layJson(ten) {
    if (cache[ten]) return Promise.resolve(cache[ten]);
    return fetch(THU_MUC + ten + '.json').then(function (r) {
      if (!r.ok) throw new Error('Không tải được ' + ten + ' (' + r.status + ')');
      return r.json();
    }).then(function (j) { cache[ten] = j; return j; });
  }

  // ---- vẽ ----
  function veGiaTri(gt, cls) {
    var s = el('span', 'bn-gt' + (cls ? ' ' + cls : ''), String(gt));
    return s;
  }

  function veBien(v, truoc) {
    var box = el('div', 'bn-bien');
    box.id = 'bn-n-' + v.id;
    box.appendChild(el('span', 'ten', v.ten));
    box.appendChild(el('span', 'kieu', v.kieu));
    box.appendChild(el('span', 'dia', v.dia));
    if (v.o) {
      var m = el('div', 'bn-mang');
      v.o.forEach(function (o) {
        var c = el('div', 'bn-o');
        var g = veGiaTri(o.giaTri, (o.loi ? 'loi' : '') + (o.dacBiet ? ' ket' : ''));
        g.id = 'bn-n-' + v.id + '.' + o.chiSo;
        c.appendChild(g);
        c.appendChild(el('span', 'chiso', '[' + o.chiSo + ']'));
        if (o.loi) c.appendChild(el('span', 'bn-nhan-loi', '⚠ ngoài mảng'));
        m.appendChild(c);
      });
      box.appendChild(m);
    } else {
      var cu = truoc && truoc[v.id];
      var g2 = veGiaTri(v.giaTri, cu !== undefined && cu !== v.giaTri ? 'moi' : '');
      g2.id = 'bn-n-' + v.id + '.v';
      box.appendChild(g2);
    }
    return box;
  }

  function veStack(b, truoc) {
    var goc = $('bn-stack');
    goc.textContent = '';
    if (!b.stack.length) { goc.appendChild(el('p', 'bn-trong', 'Chưa có biến nào.')); return; }
    var khungs = [];
    b.stack.forEach(function (v) {
      var k = v.khung || 'main';
      if (khungs.indexOf(k) < 0) khungs.push(k);
    });
    khungs.reverse(); // khung gọi sau nằm trên
    khungs.forEach(function (k) {
      var w = el('div', 'bn-khungham');
      w.appendChild(el('p', 'bn-tenham', k + '()'));
      b.stack.filter(function (v) { return (v.khung || 'main') === k; }).forEach(function (v) { w.appendChild(veBien(v, truoc)); });
      goc.appendChild(w);
    });
  }

  function veHeap(b, truoc) {
    var goc = $('bn-heap');
    goc.textContent = '';
    if (!b.heap.length) { goc.appendChild(el('p', 'bn-trong', 'Heap đang trống.')); return; }
    b.heap.forEach(function (h) {
      var giai = h.trangThai === 'daGiaiPhong';
      var k = el('div', 'bn-khoi' + (giai ? ' giai' : ''));
      k.id = 'bn-n-' + h.id;
      var dau = el('div', 'dau');
      dau.appendChild(el('b', '', h.id));
      dau.appendChild(el('span', '', h.kichThuoc + ' byte'));
      dau.appendChild(el('span', '', h.dia));
      dau.appendChild(el('span', 'tt', giai ? '✖ đã giải phóng' : '● đang dùng'));
      k.appendChild(dau);
      var t = el('div', 'bn-truong');
      h.noiDung.forEach(function (o, i) {
        var c = el('div', 'bn-o');
        var cu = truoc && truoc[h.id + '.' + i];
        var g = veGiaTri(o.giaTri, cu !== undefined && cu !== o.giaTri ? 'moi' : '');
        g.id = 'bn-n-' + h.id + '.' + i;
        c.appendChild(g);
        if (o.ten) c.appendChild(el('span', 'chiso', o.ten));
        t.appendChild(c);
      });
      k.appendChild(t);
      goc.appendChild(k);
    });
  }

  function giaTriCu(b) {
    var m = {};
    if (!b) return m;
    b.stack.forEach(function (v) { if (!v.o) m[v.id] = v.giaTri; });
    b.heap.forEach(function (h) { h.noiDung.forEach(function (o, i) { m[h.id + '.' + i] = o.giaTri; }); });
    return m;
  }

  // ---- mũi tên ----
  function veMuiTen() {
    var g = $('bn-mui');
    var mem = $('bn-mem');
    var svg = $('bn-svg');
    g.textContent = '';
    var goc = mem.getBoundingClientRect();
    svg.setAttribute('width', goc.width);
    svg.setAttribute('height', goc.height);
    svg.setAttribute('viewBox', '0 0 ' + goc.width + ' ' + goc.height);
    var b = vd.buoc[buoc];
    var treo = {};
    b.heap.forEach(function (h) { if (h.trangThai === 'daGiaiPhong') treo[h.id] = true; });
    b.mauTen.forEach(function (m, idx) {
      var tu = $('bn-n-' + m.tu + (b.stack.some(function (v) { return v.id === m.tu && !v.o; }) ? '.v' : ''));
      var den = $('bn-n-' + m.den);
      if (!tu || !den) return;
      var a = tu.getBoundingClientRect();
      var d = den.getBoundingClientRect();
      var ox = goc.left, oy = goc.top;
      var kTu = tu.closest('.bn-khung'), cung = kTu === den.closest('.bn-khung');
      var gutter = kTu.getBoundingClientRect().right - ox - 30 + (idx % 4) * 6;
      var p;
      if (d.left >= a.right + 10) { // sang cột bên cạnh
        var x1 = a.right - ox, y1 = a.top + a.height / 2 - oy, x2 = d.left - ox, y2 = d.top + Math.min(d.height / 2, 24) - oy, mx = (x1 + x2) / 2;
        p = 'M' + x1 + ',' + y1 + ' C' + mx + ',' + y1 + ' ' + mx + ',' + y2 + ' ' + x2 + ',' + y2;
      } else if (!cung && d.top >= a.bottom + 4 && Math.abs((d.left + d.width / 2) - (a.left + a.width / 2)) < goc.width) {
        // đích nằm dưới: đi từ đáy nguồn ra mép phải rồi xuống đích
        var sx = a.left + a.width / 2 - ox, sy = a.bottom - oy, tx = d.right - ox, ty = d.top + Math.min(d.height / 2, 24) - oy;
        var bx = gutter;
        p = 'M' + sx + ',' + sy + ' C' + sx + ',' + (sy + 18) + ' ' + bx + ',' + (sy + 8) + ' ' + bx + ',' + ((sy + ty) / 2) + ' S' + (bx - 4) + ',' + ty + ' ' + tx + ',' + ty;
      } else { // cùng cột, đích ở trên hoặc ngang: cong ra mép phải
        var rx = a.right - ox, ry = a.top + a.height / 2 - oy, ex = d.right - ox, ey = d.top + Math.min(d.height / 2, 24) - oy;
        var bulge = Math.max(gutter, rx + 12, ex + 12);
        p = 'M' + rx + ',' + ry + ' C' + bulge + ',' + ry + ' ' + bulge + ',' + ey + ' ' + ex + ',' + ey;
      }
      var path = document.createElementNS(SVGNS, 'path');
      path.setAttribute('d', p);
      path.setAttribute('class', 'bn-mui' + (treo[m.den] ? ' treo' : ''));
      path.setAttribute('marker-end', 'url(#bn-dau)');
      g.appendChild(path);
    });
  }

  // ---- hiển thị một bước ----
  function hienBuoc(i) {
    var t0 = performance.now();
    buoc = Math.max(0, Math.min(vd.buoc.length - 1, i));
    var b = vd.buoc[buoc];
    var truoc = giaTriCu(buoc > 0 ? vd.buoc[buoc - 1] : null);
    document.querySelectorAll('.bn-dong').forEach(function (d, k) {
      d.classList.toggle('dang', k + 1 === b.dong);
      if (k + 1 === b.dong) d.setAttribute('aria-current', 'step'); else d.removeAttribute('aria-current');
    });
    veStack(b, truoc);
    veHeap(b, truoc);
    $('bn-buoc').textContent = b.moTa;
    $('bn-dauRa').textContent = b.dauRa || '(chưa in gì)';
    var cb = $('bn-canhbao');
    if (b.canhBao) {
      cb.textContent = '';
      cb.appendChild(el('strong', '', '⚠ ' + (NHAN_CANH_BAO[b.canhBao.loai] || 'Cảnh báo') + ': '));
      cb.appendChild(document.createTextNode(b.canhBao.thongDiep));
      cb.hidden = false;
    } else cb.hidden = true;
    var tong = vd.buoc.length - 1;
    $('bn-so').textContent = 'Bước ' + buoc + ' / ' + tong;
    $('bn-thanh-i').style.width = (tong ? buoc / tong * 100 : 0) + '%';
    var tb = document.querySelector('.bn-thanh');
    tb.setAttribute('aria-valuemax', tong);
    tb.setAttribute('aria-valuenow', buoc);
    $('bn-lui').disabled = buoc === 0;
    $('bn-dat').disabled = buoc === 0;
    $('bn-tien').disabled = buoc === tong;
    veMuiTen();
    var dongEl = document.querySelector('.bn-dong.dang');
    if (dongEl) {
      var kh = $('bn-code');
      var top = dongEl.offsetTop - kh.offsetTop;
      if (top < kh.scrollTop || top + dongEl.offsetHeight > kh.scrollTop + kh.clientHeight) kh.scrollTop = Math.max(0, top - 24);
    }
    window.__boNho.lastMs = performance.now() - t0;
  }

  function veCode() {
    var c = $('bn-code');
    c.textContent = '';
    vd.maNguon.forEach(function (d, k) {
      var r = el('div', 'bn-dong');
      r.appendChild(el('b', '', String(k + 1)));
      r.appendChild(el('span', '', d));
      c.appendChild(r);
    });
  }

  function tai(id) {
    $('bn-loi').hidden = true;
    return layJson(id).then(function (j) {
      vd = j;
      $('bn-mota').textContent = j.baiHoc + ': ' + j.moTaNgan;
      $('bn-trang').hidden = false;
      veCode();
      hienBuoc(0);
      var u = new URL(location.href);
      u.searchParams.set('vd', id);
      history.replaceState(null, '', u);
    }).catch(function (e) { hienLoi('Không tải được ví dụ: ' + e.message); });
  }

  function timVd(q) {
    if (!q) return danhSach[0].id;
    for (var i = 0; i < danhSach.length; i++) if (danhSach[i].id === q) return q;
    for (var k = 0; k < danhSach.length; k++) if (danhSach[k].baiHocId === q) return danhSach[k].id; // nhận cả id bài học
    return danhSach[0].id;
  }

  function batSuKien() {
    $('bn-tien').addEventListener('click', function () { hienBuoc(buoc + 1); });
    $('bn-lui').addEventListener('click', function () { hienBuoc(buoc - 1); });
    $('bn-dat').addEventListener('click', function () { hienBuoc(0); });
    chonVd.addEventListener('change', function () { tai(chonVd.value); });
    document.addEventListener('keydown', function (e) {
      if (!vd || e.altKey || e.ctrlKey || e.metaKey) return;
      var tag = e.target && e.target.tagName;
      if (tag === 'SELECT' || tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.target && e.target.id === 'bn-code' && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) { /* khung code cuộn ngang được, vẫn cho điều hướng */ }
      if (e.key === 'ArrowRight') hienBuoc(buoc + 1);
      else if (e.key === 'ArrowLeft') hienBuoc(buoc - 1);
      else if (e.key === 'Home') hienBuoc(0);
      else if (e.key === 'End') hienBuoc(vd.buoc.length - 1);
      else return;
      e.preventDefault();
    });
    var cho = 0;
    var ve = function () { if (vd) { cancelAnimationFrame(cho); cho = requestAnimationFrame(veMuiTen); } };
    window.addEventListener('resize', ve);
    window.addEventListener('orientationchange', ve);
    if (window.ResizeObserver) new ResizeObserver(ve).observe($('bn-mem'));
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(ve);
  }

  window.__boNho = {
    tong: function () { return vd ? vd.buoc.length - 1 : 0; },
    buoc: function () { return buoc; },
    tien: function () { hienBuoc(buoc + 1); },
    lui: function () { hienBuoc(buoc - 1); },
    datLai: function () { hienBuoc(0); },
    tai: tai,
    lastMs: 0
  };

  batSuKien();
  layJson('danh-sach').then(function (ds) {
    danhSach = ds.vidu;
    danhSach.forEach(function (v, i) {
      var o = el('option', '', (i + 1) + '. ' + v.tieuDe);
      o.value = v.id;
      chonVd.appendChild(o);
    });
    var id = timVd(new URLSearchParams(location.search).get('vd'));
    chonVd.value = id;
    return tai(id);
  }).catch(function (e) { hienLoi('Không tải được danh sách ví dụ: ' + e.message); });
})();
