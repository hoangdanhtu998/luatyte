/* sw.js — Sổ tay Luật Y tế: network-first (bản mới khi có mạng), cache khi ngoại tuyến */
const V = "lyt-personal-v7";
const CORE = [
  "ui-studio.js", "ui-studio.css", "ui-studio-art.svg", "ui-studio-art.avif", "ui-studio-prefs.js", "js/local-progress.mjs", "js/control-center.mjs", "admin.html",
  "./", "index.html", "hoc.html", "tam-quan.html", "triet-hoc.html", "dao-duc.html", "lyt-design.css", "game.html", "clinic.html", "site.css", "tokens.css", "base.css", "js/hospital.js", "tin_luat.html", "tham_chieu.html", "ly_thuyet.html", "404.html",
  "manifest.json", "icon.svg", "display-settings.css", "display-polish.css", "js/display-settings.js",
  "js/search.js", "js/progress-compat.js", "js/exam-builder.js", "js/avatar.js", "js/swipe-core.js", "js/plan-badge.js", "js/clinic3d.js",
  "data/laws.json", "data/quiz.json", "data/tf.json", "data/factpairs.json", "data/lo-trinh-vai-tro.json",
  "data/quiz_his.json", "data/quiz_lythuyet.json", "data/quiz_nentang.json", "data/quiz_bhyt.json",
  "data/khoa_phong.json", "data/ly_thuyet.json", "data/tra_loi_nhanh.json", "data/tin_luat.json", "data/tham-chieu.json"
];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(CORE.map(u => new Request(u, { cache: "reload" })))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V && (k.startsWith("lyt-") || k.startsWith("luatyte-")) ).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (url.origin !== location.origin || e.request.method !== "GET" || url.pathname.startsWith("/api/")) return;
  e.respondWith(
    fetch(e.request).then(r => {
      if(r.ok){const cp = r.clone();caches.open(V).then(c => c.put(e.request, cp)).catch(()=>{});}
      return r;
    }).catch(() => caches.match(e.request).then(h => h || caches.match(e.request, { ignoreSearch: true })).then(h => h || (e.request.mode === "navigate" ? caches.match("./") : Response.error())))
  );
});
