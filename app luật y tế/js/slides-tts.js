// Giọng đọc cho slide.
// Ưu tiên file giọng AI (Piper, tạo sẵn bằng scripts/make-slide-audio.mjs) nếu slide có trường "audio".
// Nếu không có, dùng giọng có sẵn của trình duyệt (Web Speech API).
(function () {
  var btn = document.getElementById('tts-play');
  var speedSel = document.getElementById('tts-speed');
  var note = document.getElementById('tts-note');
  var stage = document.getElementById('stage');
  if (!btn || !speedSel || !stage) return;

  var synth = window.speechSynthesis;
  var canSpeak = !!(synth && window.SpeechSynthesisUtterance);
  var playing = false;
  var audio = null;

  // Văn bản đọc từ slide đang hiển thị (dùng khi không có file giọng AI).
  function slideText() {
    var card = stage.querySelector('.slide-card');
    if (!card) return '';
    var clone = card.cloneNode(true);
    clone.querySelectorAll('select').forEach(function (s) {
      var span = document.createElement('span');
      span.textContent = ' chỗ trống ';
      s.parentNode.replaceChild(span, s);
    });
    clone.querySelectorAll('button, textarea').forEach(function (n) { n.remove(); });
    var parts = [];
    clone.querySelectorAll('h2, p').forEach(function (n) {
      if (n.closest('.opts')) return;
      var t = n.textContent.replace(/\s+/g, ' ').trim();
      if (t) parts.push(t);
    });
    var letters = ['A', 'B', 'C', 'D'];
    card.querySelectorAll('.opt .tx').forEach(function (o, k) {
      parts.push(letters[k] + ': ' + o.textContent.trim());
    });
    return parts.join('. ');
  }

  function pickVoice() {
    var voices = synth.getVoices() || [];
    var vi = voices.filter(function (v) { return /^vi/i.test(v.lang); });
    return vi[0] || null;
  }

  function setIdle() {
    playing = false;
    btn.textContent = 'Giọng đọc';
  }

  function stop() {
    if (audio) { audio.pause(); audio = null; }
    if (canSpeak) synth.cancel();
    setIdle();
  }

  function playFile(url) {
    audio = new Audio(url);
    audio.playbackRate = parseFloat(speedSel.value) || 1;
    audio.onended = setIdle;
    audio.onerror = function () { audio = null; speakBrowser(); };
    playing = true;
    btn.textContent = 'Dừng';
    audio.play().catch(function () { audio = null; speakBrowser(); });
  }

  function speakBrowser() {
    if (!canSpeak) { note.textContent = 'Trình duyệt này không hỗ trợ giọng đọc.'; setIdle(); return; }
    var text = slideText();
    if (!text) { setIdle(); return; }
    synth.cancel();
    var u = new SpeechSynthesisUtterance(text);
    u.lang = 'vi-VN';
    u.rate = parseFloat(speedSel.value) || 1;
    var v = pickVoice();
    if (v) u.voice = v;
    u.onend = setIdle;
    u.onerror = function () { setIdle(); note.textContent = 'Không đọc được. Thử lại.'; };
    playing = true;
    btn.textContent = 'Dừng';
    synth.speak(u);
  }

  function speak() {
    var card = stage.querySelector('.slide-card');
    var url = card && card.dataset.audio;
    if (url) playFile(url); else speakBrowser();
  }

  btn.addEventListener('click', function () {
    if (playing) stop(); else speak();
  });
  speedSel.addEventListener('change', function () {
    if (audio) audio.playbackRate = parseFloat(speedSel.value) || 1;
    else if (playing) { stop(); speak(); }
  });

  // Chuyển slide thì dừng đọc
  new MutationObserver(function () { if (playing) stop(); }).observe(stage, { childList: true });
})();
