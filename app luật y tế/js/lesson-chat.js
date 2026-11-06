// Trợ lý tra cứu bài học (bên phải). Không phải AI: tìm từ khóa trong nội dung slide của chính bài đang học
// và chỉ tới đúng slide. Dữ liệu lấy từ data/slides/<bài>.json.
(function () {
  var lesson = document.body.getAttribute('data-lesson');
  if (!lesson || !/^[a-z0-9-]+$/.test(lesson)) return;

  var STOP = ['la','va','cua','co','khong','mot','cac','nhung','duoc','cho','de','voi','thi','nay','do','nao','gi','o','trong','ra','ve','the','nao','hay','lam','se','da','dang','bi','boi','tu','theo','ma','neu','vi','nen','toi','ban','minh','ai','sao','bao','nhieu','rat','cung','con','het','ve','den','khi'];

  function norm(s) {
    return (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9\s]/g, ' ');
  }
  function tokens(s) {
    return norm(s).split(/\s+/).filter(function (t) { return t.length > 1 && STOP.indexOf(t) < 0; });
  }
  function slideChunks(data) {
    return data.slides.map(function (s, i) {
      var parts = [];
      if (s.title) parts.push(s.title);
      if (s.body) parts.push(s.body.join(' '));
      if (s.q) parts.push(s.q);
      if (s.options) parts.push(s.options.join(' '));
      if (s.feedback) parts.push(s.feedback);
      if (s.text) parts.push(s.text.replace(/\{\d+\}/g, ' '));
      if (s.blanks) parts.push(s.blanks.map(function (b) { return b.options.join(' '); }).join(' '));
      if (s.model) parts.push(s.model);
      var text = parts.join(' ');
      return { n: i + 1, title: s.title || s.q || 'Slide', text: text, tok: tokens(text), type: s.type };
    });
  }
  function search(chunks, q) {
    var qt = tokens(q);
    if (!qt.length) return [];
    var scored = chunks.map(function (c) {
      var hits = 0, seen = {};
      qt.forEach(function (t) {
        if (c.tok.indexOf(t) >= 0 && !seen[t]) { hits++; seen[t] = true; }
      });
      return { c: c, score: hits / qt.length };
    }).filter(function (r) { return r.score > 0; });
    scored.sort(function (a, b) { return b.score - a.score || a.c.n - b.c.n; });
    return scored.slice(0, 4);
  }
  function snippet(text, q) {
    var words = tokens(q);
    var plain = text.replace(/\s+/g, ' ');
    var idx = -1;
    for (var i = 0; i < words.length && idx < 0; i++) {
      idx = norm(plain).indexOf(words[i]);
    }
    var start = Math.max(0, (idx < 0 ? 0 : idx) - 60);
    var s = plain.slice(start, start + 220);
    return (start > 0 ? '… ' : '') + s + (start + 220 < plain.length ? ' …' : '');
  }

  // --- giao diện ---
  var box = document.createElement('aside');
  box.className = 'lesson-chat';
  box.setAttribute('aria-label', 'Trợ lý tra cứu bài học');
  box.innerHTML =
    '<div class="lc-head"><strong>Trợ lý tra cứu bài</strong><button type="button" class="lc-close" aria-label="Đóng">×</button></div>' +
    '<div class="lc-log" aria-live="polite"></div>' +
    '<form class="lc-form"><input type="search" class="lc-input" placeholder="Hỏi về nội dung bài, ví dụ: đồng ý có thông tin" aria-label="Câu hỏi"><button type="submit" class="lc-send">Hỏi</button></form>';
  var fab = document.createElement('button');
  fab.type = 'button';
  fab.className = 'lc-fab';
  fab.textContent = 'Hỏi trợ lý';
  document.body.appendChild(box);
  document.body.appendChild(fab);
  var log = box.querySelector('.lc-log');
  var input = box.querySelector('.lc-input');

  function open(on) {
    document.body.classList.toggle('chat-open', on);
    fab.style.display = on ? 'none' : '';
    try { localStorage.setItem('luatyte-chat-open', on ? '1' : '0'); } catch (e) {}
    if (on) input.focus();
  }
  fab.addEventListener('click', function () { open(true); });
  box.querySelector('.lc-close').addEventListener('click', function () { open(false); });

  function addMsg(html, who) {
    var d = document.createElement('div');
    d.className = 'lc-msg lc-' + who;
    d.innerHTML = html;
    log.appendChild(d);
    log.scrollTop = log.scrollHeight;
  }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

  var chunks = null;
  fetch('data/slides/' + lesson + '.json', { cache: 'no-store' })
    .then(function (r) { if (!r.ok) throw new Error(); return r.json(); })
    .then(function (data) {
      chunks = slideChunks(data);
      addMsg('Chào bạn. Hỏi về nội dung bài này, mình sẽ chỉ bạn tới đúng slide chứa phần đó. Mình chỉ tra cứu nội dung có trong bài.', 'bot');
    })
    .catch(function () { addMsg('Không tải được nội dung bài. Thử tải lại trang.', 'bot'); });

  box.querySelector('.lc-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var q = input.value.trim();
    if (!q || !chunks) return;
    addMsg(esc(q), 'me');
    input.value = '';
    var res = search(chunks, q);
    if (!res.length) {
      addMsg('Mình chưa tìm thấy nội dung này trong bài. Thử dùng từ khóa khác, ví dụ tên khái niệm hoặc tên trường phái.', 'bot');
      return;
    }
    var html = 'Có ' + res.length + ' phần liên quan:<ul class="lc-list">' + res.map(function (r) {
      return '<li><a href="slides.html?lesson=' + lesson + '&s=' + r.c.n + '">Slide ' + r.c.n + ': ' + esc(r.c.title) + '</a><div class="lc-snip">' + esc(snippet(r.c.text, q)) + '</div></li>';
    }).join('') + '</ul>';
    addMsg(html, 'bot');
  });

  // Mặc định: hiện trên màn hình rộng, ẩn trên màn hình nhỏ; nhớ lựa chọn của người dùng
  var saved = null;
  try { saved = localStorage.getItem('luatyte-chat-open'); } catch (e) {}
  var wide = window.matchMedia('(min-width:1400px)').matches;
  open(saved === null ? wide : saved === '1');
})();
