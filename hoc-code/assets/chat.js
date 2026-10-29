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
  box.innerHTML = '<header><strong>Trợ lý học tập</strong><button type="button" id="chat-close" aria-label="Đóng">×</button></header>' +
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
      if (!data.ok) { add('bot error', data.error ? data.error.message : 'Trợ lý chưa trả lời được.'); return; }
      add('bot', data.answer);
      (data.passages || []).forEach(addPassage);
    } catch (err) {
      pending.remove();
      add('bot error', 'Không kết nối được máy chủ. Kiểm tra server đang chạy (node server/server.mjs) và mở trang qua http://localhost:4500.');
    }
  });
})();
