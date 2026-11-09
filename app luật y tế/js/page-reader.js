// Nghe cả bài: đọc lần lượt các tiêu đề và đoạn văn trong khung bài (main.triet), làm sáng đoạn đang đọc,
// tự cuộn theo. Dùng giọng có sẵn của trình duyệt (Web Speech API). Không gửi nội dung đi đâu.
(function () {
  // Khung nội dung bài: main.triet, hoặc main của các trang tra cứu/lý thuyết
  var main = document.querySelector('main.triet') || document.querySelector('main.page') || document.querySelector('main');
  if (!main || !window.speechSynthesis || !window.SpeechSynthesisUtterance) return;

  var synth = window.speechSynthesis;
  var blocks = [];
  var idx = -1;
  var playing = false;
  var run = 0; // mã lượt đọc: đoạn cũ bị hủy không được kích hoạt đoạn tiếp theo

  // Các khối đọc theo thứ tự: tiêu đề phần, đoạn văn, mục trong danh sách (bỏ mục lục và đáp án trắc nghiệm)
  function collect() {
    var list = Array.prototype.slice.call(main.querySelectorAll('h1, h2, p, li'));
    return list.filter(function (n) {
      if (n.closest('nav, .toc, .opts, .feedback, .qz-item, .reader')) return false;
      if (n.tagName === 'LI' && n.querySelector('p')) return false;
      // Bỏ các dòng chỉ là liên kết điều hướng (ví dụ "← Học", nút "Học dạng slide")
      if (n.tagName === 'P' && n.querySelector('a') && n.textContent.trim().length < 60) return false;
      return n.textContent.replace(/\s+/g, ' ').trim().length > 0;
    });
  }

  // Thanh điều khiển đặt ngay trước nội dung
  var bar = document.createElement('div');
  bar.className = 'reader';
  bar.innerHTML =
    '<button type="button" class="btn" id="reader-play">Nghe cả bài</button>' +
    '<label>Tốc độ <select id="reader-speed" aria-label="Tốc độ đọc">' +
    '<option value="0.8">0.8×</option><option value="0.9" selected>0.9×</option><option value="1">1×</option><option value="1.2">1.2×</option></select></label>' +
    '<span class="reader-note" id="reader-note">Giọng đọc của trình duyệt</span>';
  var first = main.querySelector('h1');
  if (first) first.insertAdjacentElement('afterend', bar); else main.insertBefore(bar, main.firstChild);

  var btn = document.getElementById('reader-play');
  var speed = document.getElementById('reader-speed');

  function setLit(i) {
    if (idx >= 0 && blocks[idx]) blocks[idx].classList.remove('read-on');
    idx = i;
    if (i >= 0 && blocks[i]) {
      blocks[i].classList.add('read-on');
      blocks[i].scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }

  function pickVoice() {
    var vi = (synth.getVoices() || []).filter(function (v) { return /^vi/i.test(v.lang); });
    // Ưu tiên giọng miền Bắc (NamMinh) nếu máy có; không có thì dùng giọng tiếng Việt đầu tiên
    var north = vi.filter(function (v) { return /NamMinh|Nam Minh/i.test(v.name); });
    return north[0] || vi[0] || null;
  }

  function stop() {
    playing = false;
    run++;
    synth.cancel();
    setLit(-1);
    btn.textContent = 'Nghe cả bài';
  }

  function say(i) {
    if (i >= blocks.length) { stop(); return; }
    setLit(i);
    var r = run;
    var text = blocks[i].textContent.replace(/\s+/g, ' ').trim();
    var u = new SpeechSynthesisUtterance(text);
    u.lang = 'vi-VN';
    u.rate = parseFloat(speed.value) || 0.9;
    var v = pickVoice();
    if (v) u.voice = v;
    u.onend = function () { if (playing && r === run) say(i + 1); };
    u.onerror = function () { if (r === run) stop(); };
    synth.speak(u);
  }

  btn.addEventListener('click', function () {
    if (playing) { stop(); return; }
    blocks = collect();
    if (!blocks.length) return;
    playing = true;
    btn.textContent = 'Dừng';
    say(0);
  });

  // Đổi tốc độ giữa chừng: đọc lại đoạn hiện tại với tốc độ mới
  speed.addEventListener('change', function () {
    if (playing && idx >= 0) { run++; synth.cancel(); say(idx); }
  });

  // Không đọc khi người dùng rời trang
  window.addEventListener('pagehide', function () { synth.cancel(); });
})();
