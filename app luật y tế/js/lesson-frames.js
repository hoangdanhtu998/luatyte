// Gói mỗi phần của bài học (tiêu đề h2 và các nội dung bên dưới) vào một khung để dễ đọc.
(function () {
  var main = document.querySelector('main.triet');
  if (!main) return;
  var h2s = Array.prototype.slice.call(main.querySelectorAll(':scope > h2'));
  h2s.forEach(function (h) {
    var frame = document.createElement('section');
    frame.className = 'lesson-frame';
    h.parentNode.insertBefore(frame, h);
    frame.appendChild(h);
    var n = frame.nextSibling;
    while (n && !(n.nodeType === 1 && (n.tagName === 'H2' || n.tagName === 'HR' || n.tagName === 'NAV' || n.classList && n.classList.contains('lesson-frame')))) {
      var next = n.nextSibling;
      frame.appendChild(n);
      n = next;
    }
  });
})();

// Nút ẩn/hiện mục lục (màn hình rộng). Trạng thái được nhớ trên trình duyệt.
(function () {
  var main = document.querySelector('main.triet');
  var toc = main && main.querySelector(':scope > nav.toc');
  if (!toc) return;
  var KEY = 'luatyte-toc-hidden';
  function set(hidden) {
    document.body.classList.toggle('toc-off', hidden);
    btn.textContent = hidden ? 'Hiện mục lục' : 'Ẩn mục lục';
    btn.setAttribute('aria-expanded', hidden ? 'false' : 'true');
    try { localStorage.setItem(KEY, hidden ? '1' : '0'); } catch (e) {}
  }
  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'toc-toggle';
  btn.addEventListener('click', function () { set(!document.body.classList.contains('toc-off')); });
  document.body.appendChild(btn);
  var saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) {}
  set(saved === '1');
})();
