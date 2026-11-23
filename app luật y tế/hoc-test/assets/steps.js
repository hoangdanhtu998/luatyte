// Trình chạy "từng bước": hiển thị một chuỗi màn hình gồm lời mèo, hộp (biến), dòng lệnh và câu đoán.
// Nội dung đến từ file JSON (content/steps/<id>.json). Mọi chữ đưa vào bằng textContent, không chèn HTML.
// Cách dùng: mountSteps(container, { screens, imgBase: 'assets/mascot/' })
(function () {
  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  }

  function mountSteps(root, opts) {
    const screens = opts.screens || [];
    const imgBase = opts.imgBase || 'assets/mascot/';
    const state = { i: 0, ran: false };

    // Dựng khung giao diện.
    root.innerHTML = '';
    const top = el('div', 'hop-top');
    const dots = el('div', 'hop-dots');
    dots.setAttribute('aria-label', 'Tiến độ');
    top.appendChild(dots);

    const stage = el('div', 'hop-stage');
    const mascotWrap = el('div', 'hop-mascot');
    const mascot = el('img');
    mascot.alt = 'Mèo hướng dẫn';
    mascotWrap.appendChild(mascot);
    const right = el('div');
    const say = el('div', 'hop-bubble');
    const boxes = el('div', 'hop-boxes');
    boxes.setAttribute('aria-live', 'polite');
    const code = el('div', 'hop-code none');
    const choices = el('div', 'hop-choices');
    choices.hidden = true;
    const feedback = el('p', 'hop-feedback');
    feedback.setAttribute('aria-live', 'polite');
    right.append(say, boxes, code, choices, feedback);
    stage.append(mascotWrap, right);

    const actions = el('div', 'hop-actions');
    const speak = el('button', 'btn ghost', '🔊 Đọc to');
    speak.type = 'button';
    const next = el('button', 'btn amber', 'Tiếp');
    next.type = 'button';
    const restart = el('button', 'btn ghost', 'Học lại từ đầu');
    restart.type = 'button';
    restart.hidden = true;
    actions.append(speak, next, restart);

    root.append(top, stage, actions);

    // Giá trị các hộp: cộng dồn dòng lệnh của các màn trước, thêm dòng của màn hiện tại nếu đã chạy.
    function boxValues() {
      const vals = {};
      for (let k = 0; k < state.i; k++) {
        if (screens[k].run) Object.assign(vals, screens[k].run);
      }
      const cur = screens[state.i];
      const changed = {};
      if (cur.run && state.ran) {
        Object.assign(vals, cur.run);
        Object.keys(cur.run).forEach(n => { changed[n] = true; });
      }
      return { vals, changed };
    }

    function renderDots() {
      dots.innerHTML = '';
      screens.forEach((_, k) => {
        const s = el('span');
        if (k <= state.i) s.className = 'on';
        dots.appendChild(s);
      });
    }

    function renderBoxes(screen) {
      boxes.innerHTML = '';
      const { vals, changed } = boxValues();
      (screen.boxes || []).forEach(name => {
        const has = vals[name] !== undefined;
        const wrap = el('div', 'hop-box');
        wrap.appendChild(el('div', 'lid', name));
        const text = has ? String(vals[name]) : 'trống';
        const body = el('div', 'body' + (has ? '' : ' empty') + (changed[name] ? ' fresh' : '') + (text.length > 4 ? ' long' : ''), text);
        wrap.appendChild(body);
        boxes.appendChild(wrap);
      });
    }

    function speakText(text) {
      if (!('speechSynthesis' in window)) return;
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'vi-VN';
      u.rate = 0.9;
      speechSynthesis.speak(u);
    }

    function show() {
      const s = screens[state.i];
      mascot.src = imgBase + s.img;
      say.textContent = s.say;
      renderDots();
      renderBoxes(s);

      code.textContent = s.code ? s.code : 'Chưa có dòng lệnh ở bước này.';
      code.className = 'hop-code' + (s.code ? '' : ' none');

      feedback.textContent = '';
      feedback.className = 'hop-feedback';

      choices.innerHTML = '';
      choices.hidden = true;
      next.hidden = false;
      next.textContent = 'Tiếp';
      restart.hidden = !s.end;

      if (s.quiz) {
        // Câu đoán: chỉ đi tiếp sau khi chọn đúng.
        choices.hidden = false;
        next.hidden = true;
        s.quiz.forEach(opt => {
          const b = el('button', null, opt.text);
          b.type = 'button';
          b.addEventListener('click', () => {
            if (opt.right) {
              b.classList.add('right');
              feedback.textContent = '🎉 ' + opt.hint;
              feedback.className = 'hop-feedback good';
              choices.querySelectorAll('button').forEach(x => { x.disabled = true; });
              next.hidden = false;
            } else {
              b.classList.add('wrong');
              feedback.textContent = 'Chưa đúng. ' + opt.hint;
              feedback.className = 'hop-feedback bad';
            }
          });
          choices.appendChild(b);
        });
      } else if (s.run && !state.ran) {
        next.textContent = 'Chạy dòng này';
      } else if (s.run && state.ran) {
        feedback.textContent = s.after || '';
        feedback.className = 'hop-feedback good';
      }
      if (s.end) next.hidden = true;
    }

    next.addEventListener('click', () => {
      const s = screens[state.i];
      if (s.run && !state.ran) {
        state.ran = true; // chạy dòng lệnh, ở lại màn này để thấy hộp đổi
        show();
        return;
      }
      if (state.i < screens.length - 1) {
        state.i++;
        state.ran = false;
      }
      show();
    });
    restart.addEventListener('click', () => { state.i = 0; state.ran = false; show(); });
    speak.addEventListener('click', () => speakText(screens[state.i].say));

    show();
  }

  window.mountSteps = mountSteps;
})();
