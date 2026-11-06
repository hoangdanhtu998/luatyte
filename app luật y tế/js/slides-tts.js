// Giọng đọc cho slide, dùng giọng có sẵn của trình duyệt (Web Speech API).
// Trang tĩnh không chạy được máy chủ TTS (Piper), nên dùng giọng của trình duyệt/hệ điều hành.
(function () {
  var btn = document.getElementById('tts-play');
  var speedSel = document.getElementById('tts-speed');
  var note = document.getElementById('tts-note');
  var stage = document.getElementById('stage');
  if (!btn || !speedSel || !stage) return;

  var synth = window.speechSynthesis;
  var supported = !!(synth && window.SpeechSynthesisUtterance);
  var playing = false;

  if (!supported) {
    btn.disabled = true;
    note.textContent = 'Trình duyệt này không hỗ trợ giọng đọc.';
    return;
  }

  // Lấy văn bản đọc từ slide đang hiển thị, bỏ các phần không đọc (nút, ô nhập, phần chọn đáp án).
  function slideText() {
    var card = stage.querySelector('.slide-card');
    if (!card) return '';
    var clone = card.cloneNode(true);
    clone.querySelectorAll('select').forEach(function (s) {
      var span = document.createElement('span');
      span.textContent = ' chỗ trống ';
      s.parentNode.replaceChild(span, s);
    });
    clone.querySelectorAll('button, textarea, .model-answer-hide').forEach(function (n) { n.remove(); });
    var parts = [];
    clone.querySelectorAll('h2, p, .opt .tx, .model-answer, .feedback').forEach(function (n) {
      if (n.closest('.opts') && n.classList.contains('tx') === false) return;
      var t = n.textContent.replace(/\s+/g, ' ').trim();
      if (t) parts.push(t);
    });
    // Đọc các đáp án với nhãn A, B, C, D cho dễ nghe
    var letters = ['A', 'B', 'C', 'D'];
    var opts = card.querySelectorAll('.opt .tx');
    if (opts.length) {
      parts = parts.filter(function (p) { return opts.length === 0 || !Array.prototype.some.call(opts, function (o) { return o.textContent.trim() === p; }); });
      Array.prototype.forEach.call(opts, function (o, k) { parts.push((letters[k] || '') + ': ' + o.textContent.trim()); });
    }
    return parts.join('. ');
  }

  function pickVoice() {
    var voices = synth.getVoices() || [];
    var vi = voices.filter(function (v) { return /^vi/i.test(v.lang); });
    return vi[0] || null;
  }

  function stop() {
    synth.cancel();
    playing = false;
    btn.textContent = 'Giọng đọc';
  }

  function speak() {
    var text = slideText();
    if (!text) return;
    synth.cancel();
    var u = new SpeechSynthesisUtterance(text);
    u.lang = 'vi-VN';
    u.rate = parseFloat(speedSel.value) || 1;
    var v = pickVoice();
    if (v) u.voice = v;
    else note.textContent = 'Máy chưa có giọng tiếng Việt; đang dùng giọng mặc định.';
    u.onend = function () { playing = false; btn.textContent = 'Giọng đọc'; };
    u.onerror = function () { playing = false; btn.textContent = 'Giọng đọc'; note.textContent = 'Không đọc được. Thử lại.'; };
    playing = true;
    btn.textContent = 'Dừng';
    synth.speak(u);
  }

  btn.addEventListener('click', function () {
    if (playing) stop(); else speak();
  });
  speedSel.addEventListener('change', function () { if (playing) { stop(); speak(); } });

  // Chuyển slide thì dừng đọc
  new MutationObserver(function () { if (playing) stop(); }).observe(stage, { childList: true });

  // Một số trình duyệt tải giọng chậm
  if (synth.onvoiceschanged !== undefined) synth.onvoiceschanged = function () {};
})();
