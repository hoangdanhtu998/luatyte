/* Nhớ chỗ đọc dở (mục 33): lưu vị trí cuộn của trang lý thuyết; quay lại thì hỏi có tiếp tục không.
   Không tự cuộn: người đọc bấm "Tiếp tục" mới được đưa tới chỗ cũ. Khóa lyt_* nên được đồng bộ theo tài khoản. */
(function () {
  "use strict";
  var KEY = "lyt_resume_reading";
  var MAX_AGE = 30 * 24 * 60 * 60 * 1000;
  var path = location.pathname.replace(/\/+$/, "") || "/";
  var timer = null;

  function read() {
    try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) { return null; }
  }
  function write(value) {
    try { localStorage.setItem(KEY, JSON.stringify(value)); } catch (e) { /* không lưu được thì thôi */ }
  }
  function nearEnd() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    return max > 0 && window.scrollY >= max - 120;
  }
  function save() {
    if (nearEnd() || window.scrollY < 200) { clearSaved(); return; }
    write({ path: path, y: Math.round(window.scrollY), at: Date.now() });
  }
  function clearSaved() {
    try { localStorage.removeItem(KEY); } catch (e) { /* bỏ qua */ }
  }
  function onScroll() {
    clearTimeout(timer);
    timer = setTimeout(save, 400);
  }

  function offer(saved) {
    var bar = document.createElement("div");
    bar.className = "resume-bar";
    bar.setAttribute("role", "status");
    bar.setAttribute("aria-live", "polite");
    var text = document.createElement("span");
    text.textContent = "Bạn đang đọc dở trang này.";
    var go = document.createElement("button");
    go.type = "button";
    go.className = "btn";
    go.textContent = "Tiếp tục";
    var skip = document.createElement("button");
    skip.type = "button";
    skip.className = "btn ghost";
    skip.textContent = "Bỏ qua";
    go.addEventListener("click", function () {
      var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: saved.y, behavior: reduce ? "auto" : "smooth" });
      bar.remove();
    });
    skip.addEventListener("click", function () {
      clearSaved();
      bar.remove();
    });
    bar.append(text, go, skip);
    var host = document.querySelector("main") || document.body;
    host.insertBefore(bar, host.firstChild);
  }

  var saved = read();
  if (saved && saved.path === path && saved.y > 200 && Date.now() - saved.at < MAX_AGE) {
    window.addEventListener("load", function () { offer(saved); });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("pagehide", save);
})();
