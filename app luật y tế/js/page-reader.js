// Nghe cả bài: đọc lần lượt các tiêu đề và đoạn văn trong khung bài (main.triet), làm sáng đoạn đang đọc,
// tự cuộn theo. Giọng theo người giảng chọn trên thanh: giọng VieNeu phát clip có sẵn (audio/read/<giọng>/<mã>.mp3);
// đoạn chưa có clip, hoặc chọn giọng khác, thì dùng giọng có sẵn của trình duyệt (Web Speech API).
// Không gửi nội dung đi đâu.
(function () {
  // Khung nội dung bài: main.triet, hoặc main của các trang tra cứu/lý thuyết
  var main = document.querySelector('main.triet') || document.querySelector('main.page') || document.querySelector('main');
  if (!main || !window.speechSynthesis || !window.SpeechSynthesisUtterance) return;

  var CLIP_DIR = 'https://cdn.jsdelivr.net/gh/hoangdanhtu998/luatyte@main/app%20lu%E1%BA%ADt%20y%20t%E1%BA%BF/audio/read/';
  var synth = window.speechSynthesis;
  var blocks = [];
  var idx = -1;
  var playing = false;
  var run = 0; // mã lượt đọc: đoạn cũ bị hủy không được kích hoạt đoạn tiếp theo
  var clip = null; // clip VieNeu đang phát

  // Các khối đọc theo thứ tự: tiêu đề phần, đoạn văn, mục trong danh sách (bỏ mục lục và đáp án trắc nghiệm)
  function collect() {
    var list = Array.prototype.slice.call(main.querySelectorAll('h1, h2, p, li'));
    return list.filter(function (n) {
      if (n.closest('nav, .toc, .opts, .feedback, .qz-item, .reader, .narrator')) return false;
      if (n.tagName === 'LI' && n.querySelector('p')) return false;
      // Bỏ các dòng chỉ là liên kết điều hướng (ví dụ "← Học", nút "Học dạng slide")
      if (n.tagName === 'P' && n.querySelector('a') && n.textContent.trim().length < 60) return false;
      return n.textContent.replace(/\s+/g, ' ').trim().length > 0;
    });
  }

  // Mã băm FNV-1a 32 bit của đoạn văn; phải giống hệt scripts/make-read-audio-vieneu.py để khớp tên clip
  function clipKey(text) {
    var h = 0x811c9dc5;
    for (var i = 0; i < text.length; i++) {
      h ^= text.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    return (h >>> 0).toString(16).padStart(8, '0');
  }

  // Thư mục giọng VieNeu (ví dụ xuan_vinh) khi người giảng đã chọn là giọng VieNeu; giọng khác thì trả về ''
  function clipFolder() {
    if (!window.SlidePersona || SlidePersona.opener().indexOf('vn_') !== 0) return '';
    return SlidePersona.voice();
  }

  // Thanh điều khiển đặt ngay trước nội dung
  var bar = document.createElement('div');
  bar.className = 'reader';
  bar.innerHTML =
    '<button type="button" class="btn" id="reader-play">Nghe cả bài</button>' +
    '<label>Người giảng <select id="reader-voice" aria-label="Chọn người giảng"></select></label>' +
    '<label>Tốc độ <select id="reader-speed" aria-label="Tốc độ đọc">' +
    '<option value="0.8">0.8×</option><option value="0.9" selected>0.9×</option><option value="1">1×</option><option value="1.2">1.2×</option></select></label>' +
    '<span class="reader-note" id="reader-note"></span>';
  var first = main.querySelector('h1');
  if (first) first.insertAdjacentElement('afterend', bar); else main.insertBefore(bar, main.firstChild);

  var btn = document.getElementById('reader-play');
  var speed = document.getElementById('reader-speed');
  var voiceSel = document.getElementById('reader-voice');
  var note = document.getElementById('reader-note');

  if (window.NarratorPicker) NarratorPicker.fill(voiceSel);
  else voiceSel.parentNode.hidden = true;

  function updateNote() {
    note.textContent = clipFolder() ? 'Giọng VieNeu: ' + SlidePersona.label() : 'Giọng đọc của trình duyệt';
  }
  updateNote();

  // Đổi người giảng giữa chừng: dừng, rồi cập nhật ghi chú (lựa chọn đã được lưu trước đó bởi NarratorPicker)
  voiceSel.addEventListener('change', function () {
    if (playing) stop();
    updateNote();
  });

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

  function stopClip() {
    if (clip) { clip.onended = null; clip.onerror = null; clip.pause(); clip = null; }
  }

  function stop() {
    playing = false;
    run++;
    synth.cancel();
    stopClip();
    setLit(-1);
    btn.textContent = 'Nghe cả bài';
  }

  // Đọc đoạn bằng giọng của trình duyệt
  function speakBrowser(i, text, r) {
    var u = new SpeechSynthesisUtterance(text);
    u.lang = 'vi-VN';
    u.rate = parseFloat(speed.value) || 0.9;
    var v = pickVoice();
    if (v) u.voice = v;
    u.onend = function () { if (playing && r === run) say(i + 1); };
    u.onerror = function () { if (r === run) stop(); };
    synth.speak(u);
  }

  // Phát clip VieNeu của đoạn; không có clip (hoặc không phát được) thì đọc đoạn đó bằng giọng trình duyệt
  function playClip(i, text, r, folder) {
    var failed = false;
    function fallback() {
      if (failed || r !== run) return;
      failed = true;
      clip = null;
      speakBrowser(i, text, r);
    }
    clip = new Audio(CLIP_DIR + folder + '/' + clipKey(text) + '.mp3');
    clip.playbackRate = parseFloat(speed.value) || 0.9;
    clip.onended = function () { if (playing && r === run) say(i + 1); };
    clip.onerror = fallback;
    clip.play().catch(fallback);
  }

  function say(i) {
    if (i >= blocks.length) { stop(); return; }
    setLit(i);
    var r = run;
    var text = blocks[i].textContent.replace(/\s+/g, ' ').trim();
    var folder = clipFolder();
    if (folder) playClip(i, text, r, folder);
    else speakBrowser(i, text, r);
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
    if (playing && idx >= 0) { run++; synth.cancel(); stopClip(); say(idx); }
  });

  // Không đọc khi người dùng rời trang
  window.addEventListener('pagehide', function () { synth.cancel(); stopClip(); });
})();
