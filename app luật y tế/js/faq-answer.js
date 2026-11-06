// Trả lời các câu hỏi cơ bản (chào hỏi, cách dùng trang, khái niệm chính) từ data/faq.json.
// Khớp theo cụm từ khóa đã bỏ dấu; cụm dài hơn được ưu tiên.
window.FaqAnswer = (function () {
  var items = null;
  function norm(s) {
    return ' ' + (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, ' ').trim() + ' ';
  }
  fetch('data/faq.json', { cache: 'no-store' }).then(function (r) { return r.json(); }).then(function (d) { items = d; }).catch(function () { items = []; });
  return {
    match: function (q) {
      if (!items) return '';
      var nq = norm(q), best = null, bestLen = 0;
      var pid = document.body.getAttribute('data-chat-id') || '';
      items.forEach(function (it) {
        var ok = (it.p || []).some(function (x) { return x === '*' || x === pid; });
        if (!ok) return;
        (it.k || []).forEach(function (p) {
          var np = norm(p);
          if (nq.indexOf(np) >= 0 && np.length > bestLen) { best = it; bestLen = np.length; }
        });
      });
      return best ? best.a : '';
    }
  };
})();
