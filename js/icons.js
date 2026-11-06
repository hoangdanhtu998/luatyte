// Bộ icon đường nét dùng chung. Màu lấy từ chữ hiện tại (currentColor), nên đổi giao diện vẫn khớp.
window.LytIcons = (function () {
  var P = {
    book: '<path d="M4 5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5M8 7h6"/>',
    scale: '<path d="M12 4v16M6 8h12M7 8l-3 6h6zM17 8l-3 6h6z"/><path d="M8 20h8"/>',
    compass: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
    chat: '<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9h8M8 12h5"/>',
    bulb: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.7.5 1 1.2 1 2.1h5c0-.9.3-1.6 1-2.1A6 6 0 0 0 12 3z"/>',
    shield: '<path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z"/><path d="M9.5 12l2 2 3.5-4"/>',
    question: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6"/><circle cx="12" cy="17" r=".6"/>',
    check: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 12l3 3 5-6"/>',
    code: '<path d="M8 8l-4 4 4 4M16 8l4 4-4 4M14 5l-4 14"/>',
    users: '<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14c3 0 5 2 5 5"/>',
    layers: '<path d="M12 4l9 5-9 5-9-5z"/><path d="M3 14l9 5 9-5"/>'
  };
  function svg(name) {
    return '<svg class="lx-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (P[name] || P.book) + '</svg>';
  }
  return { svg: svg };
})();

// Gắn icon cho thẻ trang Học và tiêu đề các phần bài học
(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') fn(); else document.addEventListener('DOMContentLoaded', fn);
  }
  ready(function () {
    // Thẻ khu học
    var hubMap = { 'triet-hoc.html': 'bulb', 'tam-quan.html': 'compass', 'dao-duc.html': 'scale', 'hoc-code/index-hoccode.html': 'code', '/hoc-test/': 'check' };
    document.querySelectorAll('.hub-card a.hub-link').forEach(function (a) {
      var key = a.getAttribute('href');
      var name = hubMap[key];
      if (!name) return;
      var kicker = a.querySelector('.hub-kicker');
      if (kicker) kicker.insertAdjacentHTML('beforebegin', window.LytIcons.svg(name));
    });
    // Tiêu đề phần bài học
    document.querySelectorAll('main.triet .lesson-frame > h2').forEach(function (h) {
      var t = h.textContent.toLowerCase();
      var name = 'book';
      if (/ngụy|lỗi|suy diễn|quy nạp|phản ví/.test(t)) name = 'question';
      else if (/đồng ý|tình huống|lắng nghe|tranh luận/.test(t)) name = 'chat';
      else if (/bảo mật|nguyên tắc|tôn trọng/.test(t)) name = 'shield';
      else if (/xung đột|cân nhắc|công bằng/.test(t)) name = 'scale';
      else if (/phương pháp|lập luận|tư duy|cách đọc/.test(t)) name = 'bulb';
      else if (/các cách|ba cách|trường phái|ngành/.test(t)) name = 'layers';
      else if (/phương đông|đông|việt nam|hy lạp|trung cổ|cận đại|thế kỷ|cổ đại/.test(t)) name = 'compass';
      else if (/bài tập|trắc nghiệm|ôn|tổng/.test(t)) name = 'check';
      else if (/người|bạn|gia đình/.test(t)) name = 'users';
      h.insertAdjacentHTML('afterbegin', window.LytIcons.svg(name));
    });
  });
})();
