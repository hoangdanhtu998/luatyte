// Trợ lý tra cứu dùng chung cho các trang khác (lý thuyết, tin luật, tra cứu, bài giảng).
// Không phải AI: tìm từ khóa trong dữ liệu JSON của chính trang (data-chat-src) và trả về đoạn trích có liên quan.
(function () {
  var src = document.body.getAttribute('data-chat-src');
  if (!src || !/^data\/[a-z0-9_\-\/]+\.json$/i.test(src)) return;

  var STOP = ['la','va','cua','co','khong','mot','cac','nhung','duoc','cho','de','voi','thi','nay','do','nao','gi','o','trong','ra','ve','the','hay','lam','se','da','bi','tu','theo','ma','neu','vi','nen','ban','minh','sao','nhieu','rat','cung','con','den','khi'];
  var TITLE_KEYS = ['ten','title','name','tieu_de','ten_luat','so','so_hieu','id','chuong','muc'];

  function norm(s) {
    return (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9\s]/g, ' ');
  }
  function tokens(s) {
    return norm(s).split(/\s+/).filter(function (t) { return t.length > 1 && STOP.indexOf(t) < 0; });
  }

  // Duyệt toàn bộ dữ liệu: mỗi chuỗi đủ dài là một đoạn; nhãn lấy từ tên mục gần nhất
  function chunksFrom(data) {
    var out = [];
    function walk(node, label) {
      if (typeof node === 'string') {
        if (node.length >= 25) out.push({ label: label, text: node, tok: tokens(node) });
        return;
      }
      if (Array.isArray(node)) { node.forEach(function (v) { walk(v, label); }); return; }
      if (node && typeof node === 'object') {
        var own = '';
        for (var i = 0; i < TITLE_KEYS.length; i++) {
          if (typeof node[TITLE_KEYS[i]] === 'string' && node[TITLE_KEYS[i]].length < 200) { own = node[TITLE_KEYS[i]]; break; }
        }
        var here = own || label;
        Object.keys(node).forEach(function (k) { walk(node[k], here); });
      }
    }
    walk(data, 'Nội dung');
    return out;
  }
  function search(chunks, q) {
    var qt = tokens(q);
    if (!qt.length) return [];
    var scored = chunks.map(function (c) {
      var hits = 0, seen = {};
      qt.forEach(function (t) { if (c.tok.indexOf(t) >= 0 && !seen[t]) { hits++; seen[t] = true; } });
      return { c: c, score: hits / qt.length };
    }).filter(function (r) { return r.score > 0; });
    scored.sort(function (a, b) { return b.score - a.score; });
    return scored.slice(0, 5);
  }
  function snippet(text, q) {
    var plain = text.replace(/\s+/g, ' ');
    var words = tokens(q), idx = -1, np = norm(plain);
    for (var i = 0; i < words.length && idx < 0; i++) idx = np.indexOf(words[i]);
    var start = Math.max(0, (idx < 0 ? 0 : idx) - 70);
    return (start > 0 ? '… ' : '') + plain.slice(start, start + 240) + (start + 240 < plain.length ? ' …' : '');
  }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

  var box = document.createElement('aside');
  box.className = 'lesson-chat';
  box.setAttribute('aria-label', 'Trợ lý tra cứu');
  box.innerHTML =
    '<div class="lc-head"><strong>Trợ lý · ' + esc(document.body.getAttribute('data-chat-name') || 'Tra cứu') + '</strong><button type="button" class="lc-close" aria-label="Đóng">×</button></div>' +
    '<div class="lc-log" aria-live="polite"></div>' +
    '<form class="lc-form"><input type="search" class="lc-input" placeholder="Hỏi trong nội dung trang này" aria-label="Câu hỏi"><button type="submit" class="lc-send">Hỏi</button></form>';
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

  var chunks = null;
  fetch(src, { cache: 'no-store' })
    .then(function (r) { if (!r.ok) throw new Error(); return r.json(); })
    .then(function (data) {
      chunks = chunksFrom(data);
      addMsg('Chào bạn. Hỏi về nội dung trang này, mình sẽ tìm đoạn liên quan. Mình chỉ tra cứu những gì có trong trang.', 'bot');
    })
    .catch(function () { addMsg('Không tải được nội dung trang. Thử tải lại trang.', 'bot'); });

  box.querySelector('.lc-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var q = input.value.trim();
    if (!q || !chunks) return;
    addMsg(esc(q), 'me');
    input.value = '';
    var faq = window.FaqAnswer ? window.FaqAnswer.match(q) : '';
    if (faq) { addMsg(esc(faq), 'bot'); return; }
    var res = search(chunks, q);
    if (!res.length) {
      addMsg('Mình chưa tìm thấy nội dung này trong trang. Thử từ khóa khác, ví dụ tên luật, số hiệu hoặc khái niệm.', 'bot');
      return;
    }
    addMsg('Có ' + res.length + ' đoạn liên quan:<ul class="lc-list">' + res.map(function (r) {
      return '<li><span class="lc-label">' + esc(r.c.label) + '</span><div class="lc-snip">' + esc(snippet(r.c.text, q)) + '</div></li>';
    }).join('') + '</ul>', 'bot');
  });

  var saved = null;
  try { saved = localStorage.getItem('luatyte-chat-open'); } catch (e) {}
  var wide = window.matchMedia('(min-width:1400px)').matches;
  open(saved === null ? wide : saved === '1');
})();
