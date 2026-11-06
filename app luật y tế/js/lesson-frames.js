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
