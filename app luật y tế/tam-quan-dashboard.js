(() => {
  'use strict';

  const page = document.querySelector('main');
  const lesson = page?.querySelector('.lesson');
  const legacyControls = [...(page?.children || [])].filter(node => node !== lesson && node.tagName !== 'SCRIPT');
  if (!page || !lesson || document.getElementById('tamquan-dashboard')) return;

  const storageKey = 'luatyte-tamquan-dashboard-v1';
  const read = () => {
    try {
      const value = JSON.parse(localStorage.getItem(storageKey) || '{}');
      return value && typeof value === 'object' ? value : {};
    } catch { return {}; }
  };
  const write = patch => {
    const next = { ...read(), ...patch };
    try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch { /* private mode */ }
    return next;
  };
  const esc = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const dashboard = document.createElement('div');
  dashboard.id = 'tamquan-dashboard';
  dashboard.innerHTML = `
    <header class="tq-topbar">
      <a class="tq-brand" href="hoc.html"><span class="tq-mark">L</span><span><b>luatyte.online</b><small>Không gian học tập</small></span></a>
      <label class="tq-search"><span aria-hidden="true">⌕</span><input type="search" placeholder="Tìm bài học, khái niệm, chủ đề Tam Quan…" aria-label="Tìm bài học Tam Quan"><kbd>⌘ K</kbd></label>
      <div class="tq-top-actions"><button type="button" class="tq-icon" aria-label="Lịch học">▦</button><button type="button" class="tq-icon" aria-label="Thông báo">♧</button><a class="tq-premium" href="hoc.html">✦ Không gian học</a><button class="tq-avatar" type="button" aria-label="Tài khoản">T</button></div>
    </header>
    <div class="tq-layout">
      <aside class="tq-sidebar" aria-label="Điều hướng Tam Quan">
        <a class="tq-side-link" href="hoc.html">⌂ <span>Trang chủ</span></a>
        <a class="tq-side-link active" href="#tamquan-dashboard">✿ <span>Học Tam Quan</span></a>
        <a class="tq-side-link" href="triet-hoc.html">⌘ <span>Triết học</span></a>
        <a class="tq-side-link" href="dao-duc.html">♧ <span>Đạo đức</span></a>
        <a class="tq-side-link" href="#tq-roadmap">▤ <span>Lộ trình học</span></a>
        <a class="tq-side-link" href="#tq-reflection">✎ <span>Nhật ký phản tư</span></a>
        <a class="tq-side-link" href="#tq-library">▣ <span>Kho tri thức</span></a>
        <div class="tq-side-spacer"></div>
        <div class="tq-profile"><span class="tq-avatar large">T</span><span><b>Người học</b><small>Học tập cá nhân</small></span></div>
      </aside>
      <section class="tq-main">
        <section class="tq-hero" aria-labelledby="tq-title">
          <div class="tq-hero-copy"><div class="tq-eyebrow"><span>luatyte.online</span><i>›</i><b>Học Tam Quan</b></div><span class="tq-leaf" aria-hidden="true">❧</span><h1 id="tq-title">Học Tam Quan</h1><p class="tq-subtitle">Thế giới quan · Nhân sinh quan · Giá trị quan</p><p class="tq-intro">Không chỉ học tri thức, mà rèn cách nhìn thế giới, hiểu con người, định vị bản thân và sống theo những giá trị có ý nghĩa.</p><div class="tq-hero-actions"><a class="tq-button primary" href="#tq-roadmap">▶ <span>Tiếp tục học</span> <b>→</b></a><a class="tq-button" href="#tq-map">⌘ <span>Khám phá toàn bộ lộ trình</span></a></div></div>
          <div class="tq-island" role="img" aria-label="Minh họa hòn đảo tri thức, cây hoa và người đang suy ngẫm"><div class="tq-orbit orbit-one"></div><div class="tq-orbit orbit-two"></div><div class="tq-cloud cloud-one"></div><div class="tq-cloud cloud-two"></div><div class="tq-island-ground"></div><div class="tq-tree"><i></i><b></b><em></em></div><div class="tq-person"><i></i><b></b></div><div class="tq-float f-world">◎<small>Thế giới quan</small></div><div class="tq-float f-human">♙<small>Nhân sinh quan</small></div><div class="tq-float f-value">❀<small>Giá trị quan</small></div><div class="tq-stars">✦　·　✧　·　✦</div></div>
        </section>
        <section class="tq-prompt-card"><div class="tq-prompt-icon">✧</div><div><small>GỢI Ý SUY NGẪM HÔM NAY</small><p>“Điều gì thực sự quan trọng với bạn trong 5 năm tới, và vì sao nó xứng đáng để bạn dành tâm sức?”</p></div><button type="button" class="tq-button green" data-open-reflection>Viết suy ngẫm <b>→</b></button></section>
        <div class="tq-two-col">
          <section class="tq-panel tq-roadmap" id="tq-roadmap"><div class="tq-panel-head"><div><span class="tq-section-icon green-text">♧</span><div><h2>Hành trình học</h2><p>Lộ trình Mind Lab: hiểu → soi chiếu → ứng dụng → chuyển hóa.</p></div></div><a href="#tq-lessons">Xem toàn lộ trình →</a></div><div class="tq-journey"><div class="tq-step done"><i>✓</i><b>Nền tảng</b><small>Tam Quan</small></div><div class="tq-step"><i>1</i><b>Khám phá</b><small>Thế giới quan</small></div><div class="tq-step"><i>2</i><b>Hiểu về mình</b><small>Nhân sinh quan</small></div><div class="tq-step"><i>3</i><b>Xây dựng</b><small>Giá trị quan</small></div><div class="tq-step"><i>4</i><b>Ứng dụng</b><small>Vào đời sống</small></div></div><div class="tq-progress-label"><span>Tiến độ hành trình</span><b data-progress-label>0%</b></div><div class="tq-progress"><i data-progress-bar></i></div></section>
          <section class="tq-panel tq-map" id="tq-map"><div class="tq-panel-head"><div><span class="tq-section-icon mint-text">♧</span><div><h2>Bản đồ khái niệm</h2><p>Khám phá mối liên hệ giữa các khái niệm cốt lõi.</p></div></div><a href="#tq-lessons">Mở rộng ↗</a></div><div class="tq-concept-map"><svg viewBox="0 0 500 190" role="img" aria-label="Sơ đồ ba trụ cột Tam Quan và các khái niệm liên quan"><g class="map-lines"><path d="M250 95 105 45M250 95 105 145M250 95 395 45M250 95 395 145M250 95 250 26M250 95 250 164"/></g><g class="map-node"><rect x="185" y="71" width="130" height="48" rx="24" class="node-center"/><text x="250" y="101" class="center-text">Tam Quan</text><rect x="24" y="25" width="145" height="40" rx="20"/><text x="96" y="50">Ý nghĩa sống</text><rect x="30" y="125" width="150" height="40" rx="20"/><text x="105" y="150">Hạnh phúc</text><rect x="333" y="25" width="145" height="40" rx="20"/><text x="405" y="50">Con người</text><rect x="322" y="125" width="156" height="40" rx="20"/><text x="400" y="150">Thiện · Ác</text><rect x="180" y="4" width="140" height="38" rx="19"/><text x="250" y="28">Vũ trụ</text><rect x="180" y="148" width="140" height="38" rx="19"/><text x="250" y="172">Trải nghiệm</text></g></svg><div class="tq-map-legend"><span><i class="dot purple"></i>Thế giới quan</span><span><i class="dot pink"></i>Nhân sinh quan</span><span><i class="dot mint"></i>Giá trị quan</span></div></div></section>
        </div>
        <section class="tq-section" id="tq-lessons"><div class="tq-section-heading"><div><small>HỌC THEO NHỊP CỦA BẠN</small><h2>Chủ đề khám phá</h2></div><label class="tq-filter"><span>⌕</span><input type="search" placeholder="Lọc chủ đề…" aria-label="Lọc chủ đề"></label></div><div class="tq-topic-grid"><a class="tq-topic-card topic-world" href="#m2" data-topic><span class="topic-icon">◎</span><span class="topic-arrow">↗</span><h3>Thế giới quan</h3><p>Ta hiểu thế giới và vị trí của con người trong thế giới ấy ra sao?</p><small>6 bài học <b>→</b></small></a><a class="tq-topic-card topic-life" href="#b7" data-topic><span class="topic-icon">♙</span><span class="topic-arrow">↗</span><h3>Nhân sinh quan</h3><p>Sống để làm gì, điều gì tạo nên ý nghĩa và hướng đi cho đời sống?</p><small>2 bài học <b>→</b></small></a><a class="tq-topic-card topic-values" href="#m3" data-topic><span class="topic-icon">❀</span><span class="topic-arrow">↗</span><h3>Giá trị quan</h3><p>Điều gì quan trọng với ta, và lựa chọn nào thể hiện điều đó?</p><small>4 bài học <b>→</b></small></a><a class="tq-topic-card topic-practice" href="#m9" data-topic><span class="topic-icon">✧</span><span class="topic-arrow">↗</span><h3>Tình huống suy ngẫm</h3><p>Thử áp dụng Tam Quan vào những quyết định trong đời sống.</p><small>Thực hành <b>→</b></small></a></div></section>
        <div class="tq-lower-grid"><section class="tq-panel tq-reflection" id="tq-reflection"><div class="tq-panel-head"><div><span class="tq-section-icon pink-text">✎</span><div><h2>Nhật ký phản tư</h2><p>Ghi lại điều bạn nhận ra trong hành trình.</p></div></div><span class="tq-private">● Lưu trên thiết bị này</span></div><label for="tq-note">Hôm nay tôi học được gì về cách mình nhìn thế giới?</label><textarea id="tq-note" rows="3" placeholder="Viết vài dòng cho riêng bạn…"></textarea><div class="tq-reflection-foot"><small data-saved>Chỉ lưu cục bộ trên trình duyệt này.</small><button type="button" class="tq-button primary" data-save-note>Lưu suy ngẫm <b>→</b></button></div></section><section class="tq-panel tq-assessment"><div class="tq-panel-head"><div><span class="tq-section-icon mint-text">◎</span><div><h2>Tự đánh giá nhanh</h2><p>Mức độ bạn muốn khám phá từng trụ cột.</p></div></div><a href="#tq-lessons">Làm ngay →</a></div><div class="tq-ratings"><label><span>◎ <b>Thế giới quan</b></span><input type="range" min="0" max="100" value="0" data-rating="world"><output>0%</output></label><label><span>♙ <b>Nhân sinh quan</b></span><input type="range" min="0" max="100" value="0" data-rating="life"><output>0%</output></label><label><span>❀ <b>Giá trị quan</b></span><input type="range" min="0" max="100" value="0" data-rating="values"><output>0%</output></label></div></section></div>
        <details class="tq-original" id="tq-library"><summary>Kho bài học đầy đủ · mục lục và nội dung gốc</summary><p>Nội dung học hiện có được giữ nguyên bên dưới.</p></details>
      </section>
      <aside class="tq-rightbar" aria-label="Hỗ trợ học tập"><section class="tq-panel tq-ai"><div class="tq-panel-head"><div><span class="tq-section-icon lilac-text">✦</span><div><h2>Trợ lý AI Tam Quan</h2></div></div><span class="tq-online"><i></i> Đang trực tuyến</span></div><div class="tq-ai-message"><span class="tq-bot">✦</span><p>Chào bạn! Hôm nay bạn muốn khám phá thế giới quan, nhân sinh quan hay giá trị quan?</p></div><div class="tq-ai-quick"><button type="button" data-suggestion="Gợi ý bài học phù hợp">▤ Gợi ý bài học phù hợp</button><button type="button" data-suggestion="Giải thích khái niệm">ⓘ Giải thích khái niệm</button><button type="button" data-suggestion="Thảo luận một tình huống">☏ Thảo luận tình huống</button><button type="button" data-suggestion="Gợi ý câu hỏi suy ngẫm">✧ Câu hỏi suy ngẫm</button></div><form class="tq-chat"><label class="visually-hidden" for="tq-chat-input">Hỏi về Tam Quan</label><input id="tq-chat-input" placeholder="Hỏi về Tam Quan…"><button aria-label="Gửi câu hỏi">➤</button></form><small class="tq-ai-note">Gợi ý học tập mẫu, không gửi dữ liệu ra ngoài.</small></section>
        <section class="tq-panel tq-streak"><div class="tq-panel-head"><div><span class="tq-section-icon fire-text">♨</span><div><h2>Nhịp học của bạn</h2></div></div><button class="tq-info" type="button" aria-label="Thông tin nhịp học">ⓘ</button></div><div class="tq-streak-count"><b data-streak>0</b><span>ngày học<br>đã ghi nhận</span><span class="flame">✹</span></div><div class="tq-week"><span>T2</span><span>T3</span><span>T4</span><span>T5</span><span>T6</span><span>T7</span><span>CN</span><b>·</b><b>·</b><b>·</b><b>·</b><b>·</b><b>·</b><b>·</b></div></section>
        <section class="tq-panel tq-habits"><div class="tq-panel-head"><div><span class="tq-section-icon mint-text">▦</span><div><h2>Thói quen phản tư</h2></div></div><a href="#tq-reflection">7 ngày →</a></div><p>Đánh dấu những ngày bạn dành thời gian suy ngẫm.</p><div class="tq-days"><button type="button" data-day="0">T2</button><button type="button" data-day="1">T3</button><button type="button" data-day="2">T4</button><button type="button" data-day="3">T5</button><button type="button" data-day="4">T6</button><button type="button" data-day="5">T7</button><button type="button" data-day="6">CN</button></div></section>
        <section class="tq-panel tq-recommend"><div class="tq-panel-head"><div><span class="tq-section-icon lilac-text">✧</span><div><h2>Gợi ý cho bạn</h2></div></div></div><a href="#m2"><span>◎</span><div><b>Bắt đầu với Thế giới quan</b><small>Khám phá cách ta hiểu thế giới.</small></div>›</a><a href="#b7"><span>♙</span><div><b>Suy ngẫm về lẽ sống</b><small>Điều gì làm nên một đời sống ý nghĩa?</small></div>›</a><a href="#m3"><span>❀</span><div><b>Nhận diện giá trị của bạn</b><small>Nhìn lại những lựa chọn thường ngày.</small></div>›</a></section></aside>
    </div>
    <dialog class="tq-reflection-dialog" aria-labelledby="tq-dialog-title"><form method="dialog"><button class="tq-dialog-close" aria-label="Đóng">×</button><small>GỢI Ý SUY NGẪM</small><h2 id="tq-dialog-title">Điều gì thực sự quan trọng với bạn?</h2><p>Hãy viết một suy nghĩ ngắn. Ghi chú sẽ chỉ lưu trên thiết bị này.</p><textarea rows="5" placeholder="Bắt đầu viết…" data-dialog-note></textarea><div><button class="tq-button" value="cancel">Để sau</button><button class="tq-button primary" type="button" data-dialog-save>Lưu suy ngẫm</button></div></form></dialog>`;
  lesson.before(dashboard);
  const studioButton = document.querySelector('.ecosystem-ui-open');
  if (studioButton) {
    studioButton.classList.add('tq-side-link');
    studioButton.textContent = '✦ Tùy chỉnh giao diện';
    dashboard.querySelector('.tq-sidebar').append(studioButton);
  }
  const original = dashboard.querySelector('.tq-original');
  const lessonShell = document.createElement('div');
  lessonShell.className = 'tq-lesson-shell';
  lessonShell.append(lesson);
  original.append(lessonShell);
  legacyControls.forEach(node => node.hidden = true);
  const state = read();
  const note = dashboard.querySelector('#tq-note');
  note.value = typeof state.note === 'string' ? state.note : '';
  const ratings = state.ratings || {};
  dashboard.querySelectorAll('[data-rating]').forEach(input => {
    input.value = Number.isFinite(ratings[input.dataset.rating]) ? ratings[input.dataset.rating] : 0;
    input.nextElementSibling.value = `${input.value}%`;
    input.addEventListener('input', () => {
      input.nextElementSibling.value = `${input.value}%`;
      write({ ratings: { ...read().ratings, [input.dataset.rating]: Number(input.value) } });
    });
  });
  const week = state.week || Array(7).fill(false);
  dashboard.querySelectorAll('[data-day]').forEach(button => {
    const day = Number(button.dataset.day);
    button.classList.toggle('checked', Boolean(week[day]));
    button.setAttribute('aria-pressed', String(Boolean(week[day])));
    button.addEventListener('click', () => {
      const next = [...(read().week || Array(7).fill(false))]; next[day] = !next[day];
      write({ week: next }); button.classList.toggle('checked', next[day]); button.setAttribute('aria-pressed', String(next[day]));
      dashboard.querySelector('[data-streak]').textContent = next.filter(Boolean).length;
    });
  });
  dashboard.querySelector('[data-streak]').textContent = week.filter(Boolean).length;
  const saveNote = value => {
    write({ note: value }); note.value = value;
    dashboard.querySelector('[data-saved]').textContent = 'Đã lưu trên thiết bị này.';
  };
  dashboard.querySelector('[data-save-note]').addEventListener('click', () => saveNote(note.value));
  const dialog = dashboard.querySelector('dialog');
  dashboard.querySelector('[data-open-reflection]').addEventListener('click', () => { dialog.querySelector('[data-dialog-note]').value = note.value; dialog.showModal(); });
  dialog.querySelector('[data-dialog-save]').addEventListener('click', () => { saveNote(dialog.querySelector('[data-dialog-note]').value); dialog.close(); });
  const searchInputs = dashboard.querySelectorAll('input[type="search"]');
  searchInputs.forEach(input => input.addEventListener('input', () => {
    const query = input.value.trim().toLocaleLowerCase('vi');
    searchInputs.forEach(other => { if (other !== input) other.value = input.value; });
    dashboard.querySelectorAll('[data-topic]').forEach(card => { card.hidden = query && !card.innerText.toLocaleLowerCase('vi').includes(query); });
  }));
  const quickReply = text => {
    const area = dashboard.querySelector('.tq-ai-message p');
    const replies = {
      'Gợi ý bài học phù hợp': 'Bạn có thể bắt đầu từ Thế giới quan, sau đó đọc phần Nhân sinh quan để nối cách mình hiểu thế giới với câu hỏi sống như thế nào.',
      'Giải thích khái niệm': 'Tam Quan thường gồm thế giới quan (cách nhìn thế giới), nhân sinh quan (quan niệm về đời sống và lẽ sống), và giá trị quan (điều ta coi trọng và dùng để lựa chọn).',
      'Thảo luận một tình huống': 'Hãy chọn một quyết định gần đây. Bạn đã dựa vào điều mình tin về hoàn cảnh, mục tiêu sống hay giá trị ưu tiên nào?',
      'Gợi ý câu hỏi suy ngẫm': 'Khi hai điều bạn đều coi trọng xung đột với nhau, bạn thường chọn điều gì trước? Lựa chọn đó nói gì về giá trị của bạn?',
      'default': 'Mình có thể giúp bạn khám phá khái niệm từ nội dung bài học. Hãy thử mở một chủ đề bên dưới hoặc ghi suy ngẫm riêng trong nhật ký.'
    };
    area.textContent = replies[text] || replies.default;
  };
  dashboard.querySelectorAll('[data-suggestion]').forEach(button => button.addEventListener('click', () => quickReply(button.dataset.suggestion)));
  dashboard.querySelector('.tq-chat').addEventListener('submit', event => {
    event.preventDefault(); const input = dashboard.querySelector('#tq-chat-input');
    quickReply(input.value.trim() ? 'default' : 'Gợi ý câu hỏi suy ngẫm'); input.value = '';
  });
  const totalLessons = lesson.querySelectorAll('h2[id]').length;
  const completed = new Set(Array.isArray(state.completedTopics) ? state.completedTopics : []);
  const updateProgress = () => {
    const percent = totalLessons ? Math.round(completed.size / totalLessons * 100) : 0;
    dashboard.querySelector('[data-progress-label]').textContent = `${percent}%`;
    dashboard.querySelector('[data-progress-bar]').style.width = `${percent}%`;
  };
  updateProgress();
  dashboard.querySelectorAll('a[href^="#m"],a[href^="#b"]').forEach(link => link.addEventListener('click', event => {
    const target = lesson.querySelector(link.getAttribute('href'));
    if (!target) return;
    event.preventDefault();
    original.open = true;
    completed.add(target.id);
    write({ completedTopics: [...completed] });
    updateProgress();
    requestAnimationFrame(() => target.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }));
})();

