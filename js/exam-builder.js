/* Bộ tạo đề "Thi thử theo chương/vai trò": thuần logic, không đụng DOM, Node test được.
   Đây là ĐỀ LUYỆN do app tự tạo, không phải cấu trúc đề thi chính thức của cơ quan nào. */

export const MIN_QUESTIONS_FOR_WEAK = 3;
export const SESSION_VERSION = 1;

/* Bộ sinh số ngẫu nhiên có seed để test lặp lại được. */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffled(list, rng) {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* Chia `total` câu cho các chương theo trọng số (phương pháp phần dư lớn nhất).
   Chương không đủ câu thì nhường phần dư cho chương còn chỗ; nếu tổng câu có sẵn
   nhỏ hơn `total` thì lấy hết và trả `shortfall` > 0. */
export function allocateByWeight(caps, total) {
  const counts = {};
  caps.forEach(c => { counts[c.id] = 0; });
  const capacity = caps.reduce((s, c) => s + Math.max(0, c.available | 0), 0);
  let remaining = Math.max(0, Math.min(total | 0, capacity));
  const shortfall = Math.max(0, (total | 0) - remaining);
  while (remaining > 0) {
    const active = caps.filter(c => counts[c.id] < c.available);
    if (!active.length) break;
    const weightOf = c => (c.weight > 0 ? c.weight : 0);
    let wsum = active.reduce((s, c) => s + weightOf(c), 0);
    const flat = wsum <= 0;
    if (flat) wsum = active.length;
    const shares = active.map(c => {
      const ideal = remaining * (flat ? 1 : weightOf(c)) / wsum;
      return { c, ideal, frac: ideal - Math.floor(ideal) };
    });
    let left = remaining;
    for (const s of shares) {
      const take = Math.min(Math.floor(s.ideal), s.c.available - counts[s.c.id]);
      counts[s.c.id] += take;
      left -= take;
    }
    const order = shares.slice().sort((x, y) => y.frac - x.frac);
    for (const s of order) {
      if (left <= 0) break;
      if (counts[s.c.id] < s.c.available) { counts[s.c.id]++; left--; }
    }
    if (left === remaining) break; // không tiến triển được nữa
    remaining = left;
  }
  return { counts, shortfall };
}

/* Dựng đề theo chương.
   - pool: danh sách câu; chaptersOf(q) -> các chương câu thuộc về; chapters: chương được chọn.
   - Mỗi câu chỉ xuất hiện một lần và được gắn đúng một chương (`ch`) để chấm theo chương.
   - Bỏ câu `verify` (chưa đối chiếu).
   - weights: tuỳ chọn { chương: trọng số }; mặc định tỉ lệ theo số câu có sẵn của chương. */
export function buildChapterExam({ pool, chaptersOf, chapters, total, rng = Math.random, weights = null }) {
  const chosen = new Set(chapters);
  const seen = new Set();
  const single = [], multi = [];
  for (const q of pool) {
    if (!q || q.verify || seen.has(q.q)) continue;
    const cand = (chaptersOf(q) || []).filter(c => chosen.has(c));
    if (!cand.length) continue;
    seen.add(q.q);
    (cand.length === 1 ? single : multi).push({ q, cand });
  }
  const buckets = new Map(chapters.map(c => [c, []]));
  for (const { q, cand } of single) buckets.get(cand[0]).push(q);
  const order = new Map(chapters.map((c, i) => [c, i]));
  for (const { q, cand } of multi) {
    const pick = cand.slice().sort((a, b) => buckets.get(a).length - buckets.get(b).length || order.get(a) - order.get(b))[0];
    buckets.get(pick).push(q);
  }
  const caps = chapters.map(id => {
    const n = buckets.get(id).length;
    const w = weights && weights[id] != null ? weights[id] : n;
    return { id, weight: w, available: n };
  });
  const { counts, shortfall } = allocateByWeight(caps, total);
  const wsum = caps.reduce((s, c) => s + Math.max(0, c.weight), 0) || 1;
  const items = [];
  const perChapter = chapters.map(id => {
    const take = counts[id] || 0;
    shuffled(buckets.get(id), rng).slice(0, take).forEach(q => items.push({ q, ch: id }));
    const cap = caps.find(c => c.id === id);
    return { id, want: Math.round(total * Math.max(0, cap.weight) / wsum * 10) / 10, got: take, available: cap.available };
  });
  return { items: shuffled(items, rng), perChapter, shortfall, requested: total };
}

/* rows: [{ ch, ok }] với ok === true là đúng; null/undefined/false là sai (bỏ trống tính là sai). */
export function scoreByChapter(rows) {
  const map = new Map();
  for (const r of rows) {
    const e = map.get(r.ch) || { ch: r.ch, right: 0, total: 0, pct: 0 };
    e.total++;
    if (r.ok === true) e.right++;
    map.set(r.ch, e);
  }
  return [...map.values()].map(e => ({ ...e, pct: Math.round(e.right / e.total * 100) }));
}

/* Chương yếu: tỉ lệ đúng thấp nhất trong các chương có ít nhất `minQuestions` câu; chương đúng hết không tính. */
export function weakChapters(scores, { minQuestions = MIN_QUESTIONS_FOR_WEAK, count = 2 } = {}) {
  return scores
    .filter(s => s.total >= minQuestions && s.pct < 100)
    .sort((a, b) => a.pct - b.pct || b.total - a.total || String(a.ch).localeCompare(String(b.ch)))
    .slice(0, count);
}

/* Đồng hồ dựa trên mốc kết thúc tuyệt đối nên không lệch khi chuyển tab hoặc tải lại trang. */
export function remainingSeconds(endAt, now) {
  return Math.max(0, Math.ceil((endAt - now) / 1000));
}

export function serializeSession({ cfg, endAt, exi, items, answers }) {
  return JSON.stringify({
    v: SESSION_VERSION,
    cfg,
    endAt,
    exi,
    items: items.map(it => ({ q: it.q, idx: it.idx, ch: it.ch })),
    answers,
  });
}

/* lookup(qText) -> câu gốc trong dữ liệu hiện tại (hoặc null nếu câu đã bị xóa/đổi). */
export function restoreSession(raw, now, lookup) {
  const fail = { ok: false };
  let s;
  try { s = JSON.parse(raw); } catch { return fail; }
  if (!s || s.v !== SESSION_VERSION || !Array.isArray(s.items) || !s.items.length || !Number.isFinite(s.endAt)) return fail;
  const items = [];
  for (const it of s.items) {
    const base = it && typeof it.q === "string" ? lookup(it.q) : null;
    if (!base || !Array.isArray(base.o) || !Array.isArray(it.idx)) return fail;
    const n = base.o.length;
    const okPerm = it.idx.length === n && new Set(it.idx).size === n && it.idx.every(i => Number.isInteger(i) && i >= 0 && i < n);
    if (!okPerm) return fail;
    items.push({ ...base, o: it.idx.map(i => base.o[i]), a: it.idx.indexOf(base.a), ch: it.ch });
  }
  const raw_ans = Array.isArray(s.answers) ? s.answers : [];
  const answers = items.map((q, i) => (Number.isInteger(raw_ans[i]) && raw_ans[i] >= 0 && raw_ans[i] < q.o.length ? raw_ans[i] : null));
  const exi = Number.isInteger(s.exi) && s.exi >= 0 && s.exi < items.length ? s.exi : 0;
  const remaining = remainingSeconds(s.endAt, now);
  return { ok: true, items, answers, exi, cfg: s.cfg || {}, endAt: s.endAt, remaining, expired: remaining <= 0 };
}

/* Gộp ngân hàng câu cho đề theo chương.
   banks: các bộ câu đã có trong lộ trình; extra: bộ câu bổ sung (ví dụ câu lý thuyết),
   chỉ được vào đề khi có khóa chương rõ ràng trong chapterMap (không suy đoán chương). */
export function buildChapterPool({ banks, extra = [], chapterMap, isExcluded = () => false }) {
  const seen = new Set();
  const out = [];
  const add = q => {
    if (!q || q.verify || seen.has(q.q) || isExcluded(q)) return;
    seen.add(q.q);
    out.push(q);
  };
  banks.forEach(add);
  extra.forEach(q => { if (q && chapterMap[q.q]) add(q); });
  return out;
}

/* Hiển thị một lượt thi trong lịch sử; chịu được bản ghi cũ của bản live (thiếu topic/sbd/d10/byCh). */
export function examEntryView(x, setNames = {}) {
  const e = x && typeof x === "object" ? x : {};
  const n = Number.isFinite(Number(e.n)) ? Number(e.n) : 0;
  const r = Number.isFinite(Number(e.r)) ? Number(e.r) : 0;
  const rawPct = e.pct === undefined || e.pct === null ? NaN : Number(e.pct);
  const pct = Number.isFinite(rawPct) ? rawPct : (n ? Math.round(r / n * 100) : 0);
  const used = Number.isFinite(Number(e.used)) ? Number(e.used) : 0;
  const label = (setNames[e.set] || e.set || "Thi thử") + (e.topic ? " · " + e.topic : "");
  return { d: String(e.d || ""), label, n, r, pct, minutes: Math.round(used / 60) };
}

/* Giữ tối đa `max` lượt mới nhất (đầu danh sách) và không vượt `maxBytes` khi serialize. */
export function trimExamHistory(list, max, maxBytes) {
  if (!Array.isArray(list)) return [];
  let h = list.slice(0, max);
  while (h.length > 1 && JSON.stringify(h).length > maxBytes) h = h.slice(0, -1);
  return h;
}
