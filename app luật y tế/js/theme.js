// Chọn giao diện. Mặc định là "Tím đêm" (indigo); người dùng vẫn chọn được giao diện khác.
// Lựa chọn "Theo máy" được lưu là "system" để không bị đổi lại về mặc định.
(function () {
  var KEY = 'luatyte-theme';
  var DEFAULT = 'indigo';
  var root = document.documentElement;
  var sel = document.getElementById('theme-pick');
  var saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) {}
  var current = saved === null ? DEFAULT : saved;
  function apply(v) { if (v && v !== 'system') root.setAttribute('data-theme', v); else root.removeAttribute('data-theme'); }
  apply(current);
  if (sel) {
    sel.value = current === 'system' ? '' : current;
    sel.addEventListener('change', function () {
      var v = sel.value;
      apply(v);
      try { localStorage.setItem(KEY, v || 'system'); } catch (e) {}
    });
  }
})();
