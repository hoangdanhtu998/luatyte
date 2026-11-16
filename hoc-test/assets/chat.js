// Khung chat trợ lý học tập. Gửi câu hỏi tới /api/chat. Mọi nội dung hiển thị bằng textContent (không chèn HTML).
(function () {
  const lessonId = new URLSearchParams(location.search).get('id') || '';

  const btn = document.createElement('button');
  btn.id = 'chat-open';
  btn.type = 'button';
  btn.textContent = 'Hỏi trợ lý';
  btn.setAttribute('aria-label', 'Mở trợ lý học tập');

  const box = document.createElement('section');
  box.id = 'chat-box';
  box.hidden = true;
  box.setAttribute('aria-label', 'Trợ lý học tập');
  box.innerHTML = '<header><strong>Trợ lý học tập (AI)</strong><button type="button" id="chat-close" aria-label="Đóng">×</button></header>' +
    '<p id="chat-notice" class="muted" style="margin:6px 10px;font-size:12px">Trợ lý này là AI, không phải giáo viên. Câu hỏi của bạn được gửi tới dịch vụ Claude của Anthropic (ở nước ngoài) để trả lời. Đừng nhập họ tên, số điện thoại hay thông tin cá nhân khác.</p>' +
    '<div id="chat-log" aria-live="polite"></div>' +
    '<form id="chat-form"><input id="chat-input" type="text" maxlength="1000" placeholder="Anh hỏi gì? Ví dụ: con trỏ là gì?" autocomplete="off"><button type="submit">Gửi</button></form>';

  document.body.appendChild(btn);
  document.body.appendChild(box);

  const log = box.querySelector('#chat-log');
  const form = box.querySelector('#chat-form');
  const input = box.querySelector('#chat-input');

  function add(cls, text) {
    const d = document.createElement('div');
    d.className = 'msg ' + cls;
    d.textContent = text;
    log.appendChild(d);
    log.scrollTop = log.scrollHeight;
    return d;
  }

  function addPassage(p) {
    const d = document.createElement('div');
    d.className = 'msg passage';
    const src = document.createElement('div');
    src.className = 'src';
    src.textContent = p.source;
    const body = document.createElement('pre');
    body.textContent = p.text;
    d.appendChild(src);
    d.appendChild(body);
    log.appendChild(d);
  }

  function open() {
    box.hidden = false;
    btn.hidden = true;
    input.focus();
    if (!log.childElementCount) {
      add('bot', 'Chào anh. Anh hỏi bất cứ điều gì trong bài hoặc slide, mình sẽ tìm và giải thích. Ví dụ: "con trỏ là gì", "malloc làm gì", "va chạm là gì".');
    }
  }
  function close() { box.hidden = true; btn.hidden = false; }

  btn.addEventListener('click', open);
  box.querySelector('#chat-close').addEventListener('click', close);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !box.hidden) close(); });

  // Bỏ dấu và chữ hoa để tìm được cả khi gõ không dấu.
  const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'd').toLowerCase();

  async function searchLessons(question) {
    try {
      const r = await fetch(new URL('content/tester/index.json', location.href), { cache: 'no-store' });
      if (!r.ok) return [];
      const data = await r.json();
      const words = norm(question).split(/\s+/).filter(w => w.length > 2);
      return data.lessons
        .map(l => ({ l, score: words.filter(w => norm(l.title + ' ' + l.desc).includes(w)).length }))
        .filter(x => x.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map(x => x.l);
    } catch (e) {
      return [];
    }
  }

  // Khi không có máy chủ AI: gợi ý các bài khớp từ khóa trong câu hỏi.
  async function answerLocally(question) {
    const hits = await searchLessons(question);
    if (!hits.length) {
      add('bot', 'Chưa tìm thấy bài nào khớp câu hỏi. Thử từ khóa khác, ví dụ "bug", "bảo mật", "API".');
      return;
    }
    add('bot', 'Máy chủ AI chưa bật ở bản này, nên mình tìm trong danh sách bài. Gợi ý:');
    hits.forEach(addLessonLink);
  }

  function addLessonLink(lesson) {
    const d = document.createElement('div');
    d.className = 'msg passage';
    const a = document.createElement('a');
    a.href = 'lesson.html?track=tester&id=' + encodeURIComponent(lesson.id);
    a.textContent = lesson.title;
    d.appendChild(a);
    log.appendChild(d);
    log.scrollTop = log.scrollHeight;
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const q = input.value.trim();
    if (!q) return;
    input.value = '';
    add('user', q);
    const pending = add('bot pending', 'Đang tìm...');
    try {
      const r = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ message: q, lesson: lessonId }),
      });
      const data = await r.json();
      pending.remove();
      if (!data.ok) { await answerLocally(q); return; }
      add('bot', data.answer);
      (data.passages || []).forEach(addPassage);
    } catch (err) {
      pending.remove();
      await answerLocally(q);
    }
  });
})();
