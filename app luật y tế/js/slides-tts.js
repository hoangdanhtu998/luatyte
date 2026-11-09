// Giọng đọc cho slide.
// Ưu tiên file giọng AI (Piper, tạo sẵn bằng scripts/make-slide-audio.mjs) theo người giảng đang chọn.
// Đoạn đang đọc được làm sáng (ước lượng theo độ dài từng đoạn). Có thể tự chuyển sang slide tiếp theo.
// Nếu không có file giọng AI, dùng giọng có sẵn của trình duyệt (Web Speech API).
(function () {
  var btn = document.getElementById('tts-play');
  var speedSel = document.getElementById('tts-speed');
  var note = document.getElementById('tts-note');
  var stage = document.getElementById('stage');
  var autoBox = document.getElementById('tts-auto');
  var nextBtn = document.getElementById('next');
  if (!btn || !speedSel || !stage) return;

  var synth = window.speechSynthesis;
  var canSpeak = !!(synth && window.SpeechSynthesisUtterance);
  var playing = false;
  var audio = null;
  var units = [];      // các đoạn có thể làm sáng trên slide hiện tại
  var weights = [];    // tỷ lệ thời lượng của từng đoạn
  var lit = -1;
  var pendingAuto = false;

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

  // Các đoạn của slide: tiêu đề và từng đoạn văn/mục (không tính đáp án trắc nghiệm)
  function collectUnits() {
    var card = stage.querySelector('.slide-card');
    if (!card) return [];
    return Array.prototype.slice.call(card.querySelectorAll('h2, p, li')).filter(function (n) {
      return !n.closest('.opts') && !n.closest('.feedback') && n.textContent.trim().length > 0;
    });
  }

  function setLit(i) {
    if (i === lit) return;
    if (lit >= 0 && units[lit]) units[lit].classList.remove('tts-on');
    lit = i;
    if (i >= 0 && units[i]) {
      units[i].classList.add('tts-on');
      units[i].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }

  // Chia thời lượng file cho các đoạn theo độ dài chữ
  function computeWeights() {
    var lens = units.map(function (u) { return Math.max(1, u.textContent.trim().length); });
    var total = lens.reduce(function (a, b) { return a + b; }, 0) || 1;
    weights = lens.map(function (l) { return l / total; });
  }

  function unitAt(t, dur) {
    if (!dur || !isFinite(dur)) return 0;
    var acc = 0, frac = t / dur;
    for (var i = 0; i < weights.length; i++) {
      acc += weights[i];
      if (frac < acc) return i;
    }
    return weights.length - 1;
  }

  function pickVoice() {
    var voices = synth.getVoices() || [];
    var vi = voices.filter(function (v) { return /^vi/i.test(v.lang); });
    return vi[0] || null;
  }

  function setIdle() {
    playing = false;
    btn.textContent = 'Giọng đọc';
    setLit(-1);
  }

  function stop() {
    if (audio) { audio.pause(); audio = null; }
    if (canSpeak) synth.cancel();
    setIdle();
  }

  function currentRate() {
    var base = parseFloat(speedSel.value) || 1;
    var persona = window.SlidePersona && SlidePersona.rate ? SlidePersona.rate() : 1;
    return base * persona;
  }

  // Chọn đường dẫn giọng theo người giảng; nếu không có thì dùng giọng mặc định của slide
  function audioUrlFor(card) {
    var voice = window.SlidePersona && SlidePersona.voice ? SlidePersona.voice() : null;
    var map = {};
    try { map = JSON.parse(card.dataset.audios || '{}'); } catch (e) {}
    return (voice && map[voice]) || card.dataset.audio || '';
  }

  function playFile(url) {
    audio = new Audio(url);
    audio.playbackRate = currentRate();
    units = collectUnits();
    computeWeights();
    audio.ontimeupdate = function () {
      if (!audio || !units.length) return;
      setLit(unitAt(audio.currentTime, audio.duration));
    };
    audio.onended = function () {
      setIdle();
      if (autoBox && autoBox.checked && nextBtn && !nextBtn.disabled) {
        pendingAuto = true;
        nextBtn.click();
      }
    };
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
    u.rate = currentRate();
    var v = pickVoice();
    if (v) u.voice = v;
    u.onend = function () {
      setIdle();
      if (autoBox && autoBox.checked && nextBtn && !nextBtn.disabled) { pendingAuto = true; nextBtn.click(); }
    };
    u.onerror = function () { setIdle(); note.textContent = 'Không đọc được. Thử lại.'; };
    playing = true;
    btn.textContent = 'Dừng';
    synth.speak(u);
  }

  function speak() {
    var card = stage.querySelector('.slide-card');
    var url = card && audioUrlFor(card);
    if (url) playFile(url); else speakBrowser();
  }

  btn.addEventListener('click', function () {
    pendingAuto = false;
    if (playing) stop(); else speak();
  });
  speedSel.addEventListener('change', function () {
    if (audio) audio.playbackRate = currentRate();
    else if (playing) { stop(); speak(); }
  });

  // Đổi slide: nếu đang bật tự chuyển thì đọc tiếp slide mới; nếu không thì dừng
  new MutationObserver(function () {
    if (pendingAuto) {
      pendingAuto = false;
      if (audio) { audio.pause(); audio = null; }
      if (canSpeak) synth.cancel();
      setTimeout(speak, 600);
      return;
    }
    if (playing) stop();
  }).observe(stage, { childList: true });
})();
