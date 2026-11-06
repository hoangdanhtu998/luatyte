// Chọn giao diện: theo hệ thống (mặc định), paper, ink hoặc warm. Lưu lựa chọn trên máy này.
(function () {
  var KEY = 'luatyte-theme';
  var root = document.documentElement;
  var sel = document.getElementById('theme-pick');
  var saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) {}
  function apply(v) { if (v) root.setAttribute('data-theme', v); else root.removeAttribute('data-theme'); }
  apply(saved || '');
  if (sel) {
    sel.value = saved || '';
    sel.addEventListener('change', function () {
      var v = sel.value;
      apply(v);
      try { if (v) localStorage.setItem(KEY, v); else localStorage.removeItem(KEY); } catch (e) {}
    });
  }
})();
