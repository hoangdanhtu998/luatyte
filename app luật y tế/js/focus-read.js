/* Chế độ đọc tập trung (mục 32): ẩn thanh điều hướng và thanh tiêu đề để đọc chương; nút Thoát luôn hiện.
   Chỉ trong phiên hiện tại; tải lại trang thì về bình thường. */
(function () {
  "use strict";
  var topbar = document.querySelector(".topbar .row");
  if (!topbar || document.getElementById("focus-toggle")) return;

  var toggle = document.createElement("button");
  toggle.type = "button";
  toggle.id = "focus-toggle";
  toggle.className = "btn ghost focus-toggle";
  toggle.setAttribute("aria-pressed", "false");
  toggle.textContent = "Đọc tập trung";

  var exit = document.createElement("button");
  exit.type = "button";
  exit.id = "focus-exit";
  exit.className = "btn focus-exit";
  exit.textContent = "Thoát đọc tập trung";

  function set(on) {
    document.body.classList.toggle("focus-read", on);
    toggle.setAttribute("aria-pressed", on ? "true" : "false");
    if (on) exit.focus(); else toggle.focus();
  }
  toggle.addEventListener("click", function () { set(!document.body.classList.contains("focus-read")); });
  exit.addEventListener("click", function () { set(false); });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && document.body.classList.contains("focus-read")) set(false);
  });

  var about = topbar.querySelector('a[href="index.html"]');
  topbar.insertBefore(toggle, about || null);
  document.body.appendChild(exit);
})();
