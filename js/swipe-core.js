// Logic thuần cho mini game Vuốt Luật. Không đụng DOM, localStorage hay fetch.
export const SWIPE_VERSION = 1;

const clampInt = (v, max = 1_000_000) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.max(0, Math.min(max, Math.round(n))) : 0;
};

const isDay = s => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);

function dayBefore(key) {
  if (!isDay(key)) return "";
  const [y, m, d] = key.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() - 1);
  return date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0") + "-" + String(date.getDate()).padStart(2, "0");
}

export function emptySwipeStats() {
  return { v: SWIPE_VERSION, best: 0, bestCombo: 0, plays: 0, totalCorrect: 0, totalAnswered: 0, lastDay: "", streak: 0 };
}

export function normalizeSwipeStats(raw) {
  const r = raw && typeof raw === "object" ? raw : {};
  return {
    v: SWIPE_VERSION,
    best: clampInt(r.best),
    bestCombo: clampInt(r.bestCombo),
    plays: clampInt(r.plays),
    totalCorrect: clampInt(r.totalCorrect),
    totalAnswered: clampInt(r.totalAnswered),
    lastDay: isDay(r.lastDay) ? r.lastDay : "",
    streak: clampInt(r.streak),
  };
}

export function mergeSwipeStats(a, b) {
  const x = normalizeSwipeStats(a);
  const y = normalizeSwipeStats(b);
  let lastDay = x.lastDay;
  let streak = x.streak;
  if (y.lastDay > lastDay) { lastDay = y.lastDay; streak = y.streak; }
  else if (y.lastDay === lastDay) streak = Math.max(streak, y.streak);
  return {
    v: SWIPE_VERSION,
    best: Math.max(x.best, y.best),
    bestCombo: Math.max(x.bestCombo, y.bestCombo),
    plays: Math.max(x.plays, y.plays),
    totalCorrect: Math.max(x.totalCorrect, y.totalCorrect),
    totalAnswered: Math.max(x.totalAnswered, y.totalAnswered),
    lastDay,
    streak,
  };
}

export function detectMode({ coarsePointer = false, width = 1024, query = "" } = {}) {
  const q = String(query || "").trim().toLowerCase();
  if (q === "dien-thoai" || q === "mobile") return "mobile";
  if (q === "may-tinh" || q === "desktop") return "desktop";
  return coarsePointer || Number(width) <= 760 ? "mobile" : "desktop";
}

export function normalizeTf(list) {
  if (!Array.isArray(list)) return [];
  return list.map((row, i) => {
    if (!Array.isArray(row) || typeof row[0] !== "string" || !row[0].trim()) return null;
    return {
      id: "tf:" + i,
      kind: "tf",
      text: row[0].trim(),
      truth: !!row[1],
      why: String(row[2] || ""),
      source: "Nhận định nhanh",
    };
  }).filter(Boolean);
}

function shuffle(arr, rng = Math.random) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.max(0, Math.min(0.999999, Number(rng()) || 0)) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function hash(text) {
  let h = 5381;
  for (let i = 0; i < text.length; i++) h = ((h << 5) + h + text.charCodeAt(i)) >>> 0;
  return h.toString(36);
}

function lawName(laws, q) {
  if (q && q.law) return String(q.law);
  if (!q || q.t == null) return "";
  if (Array.isArray(laws)) {
    const hit = laws.find(l => l && l.id === q.t);
    return hit ? String(hit.name || "") : "";
  }
  if (laws && typeof laws === "object") {
    const hit = laws[q.t];
    return hit && typeof hit === "object" ? String(hit.name || "") : String(hit || "");
  }
  return "";
}

export function makeQuizCard(q, { source = "", wantTruth, rng = Math.random, laws = null } = {}) {
  if (!q || typeof q.q !== "string" || !Array.isArray(q.o) || q.o.length < 2) return null;
  const correct = Number(q.a);
  if (!Number.isInteger(correct) || correct < 0 || correct >= q.o.length) return null;
  const proposed = wantTruth === true
    ? correct
    : wantTruth === false
      ? (() => {
          const wrong = q.o.map((_, i) => i).filter(i => i !== correct);
          return wrong.length ? wrong[Math.floor(Math.max(0, Math.min(0.999999, Number(rng()) || 0)) * wrong.length)] : correct;
        })()
      : Math.floor(Math.max(0, Math.min(0.999999, Number(rng()) || 0)) * q.o.length);
  const truth = proposed === correct;
  const why = (q.e ? String(q.e).trim() + " " : "") + "Đáp án đúng: " + q.o[correct] + ".";
  return {
    id: "quiz:" + hash(q.q),
    kind: "quiz",
    text: q.q.trim(),
    proposed: String(q.o[proposed]),
    correctAnswer: String(q.o[correct]),
    truth,
    why,
    source: source || lawName(laws, q),
  };
}

export function buildSwipeDeck({ tf = [], quiz = [], laws = null, size = 60, rng = Math.random } = {}) {
  const target = Math.max(1, Math.min(200, Math.round(Number(size) || 60)));
  const seen = new Set();
  const keyOf = t => String(t || "").trim().toLowerCase().replace(/\s+/g, " ");

  const tfCards = shuffle(normalizeTf(tf), rng).filter(c => {
    const k = keyOf(c.text);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  }).slice(0, target);

  const tfTrue = tfCards.filter(c => c.truth).length;
  const remaining = Math.max(0, target - tfCards.length);
  const quizPool = shuffle((Array.isArray(quiz) ? quiz : []).filter(q => {
    if (!q || typeof q.q !== "string") return false;
    const k = keyOf(q.q);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  }), rng);

  const quizTrueTarget = Math.max(0, Math.min(remaining, Math.round(target / 2) - tfTrue));
  const quizCards = [];
  for (let i = 0; i < quizPool.length && quizCards.length < remaining; i++) {
    const wantTruth = quizCards.length < quizTrueTarget;
    const card = makeQuizCard(quizPool[i], { wantTruth, rng, laws });
    if (card) quizCards.push(card);
  }

  return shuffle([...tfCards, ...quizCards], rng);
}

export function buildDesktopDeck({ tf = [], rng = Math.random } = {}) {
  return shuffle(normalizeTf(tf), rng);
}

export function createRound({ mode = "mobile", deck = [], durationMs = 60000 } = {}) {
  return {
    mode,
    deck: Array.isArray(deck) ? deck.slice() : [],
    index: 0,
    score: 0,
    answered: 0,
    correct: 0,
    combo: 0,
    bestCombo: 0,
    remainMs: Math.max(1000, Math.round(Number(durationMs) || 60000)),
    answers: [],
  };
}

export function applyAnswer(round, answer) {
  if (!round || !Array.isArray(round.deck)) return { round, event: null };
  const card = round.deck[round.index];
  if (!card) return { round, event: null };
  const chosen = answer === true || answer === "true";
  const isCorrect = chosen === !!card.truth;
  const combo = isCorrect ? (round.combo || 0) + 1 : 0;
  const bestCombo = Math.max(round.bestCombo || 0, combo);
  const next = {
    ...round,
    index: (round.index || 0) + 1,
    score: (round.score || 0) + (isCorrect ? 1 : 0),
    answered: (round.answered || 0) + 1,
    correct: (round.correct || 0) + (isCorrect ? 1 : 0),
    combo,
    bestCombo,
    remainMs: isCorrect ? Math.max(0, round.remainMs || 0) : Math.max(0, (round.remainMs || 0) - 3000),
    answers: [...(round.answers || []), { id: card.id, correct: isCorrect }],
  };
  return {
    round: next,
    event: {
      isCorrect,
      card,
      penaltyMs: isCorrect ? 0 : 3000,
      combo,
      milestone: isCorrect && (combo === 5 || combo === 10) ? combo : 0,
    },
  };
}

export function accuracy(round) {
  const n = Number(round && round.answered) || 0;
  return n > 0 ? Math.round((Number(round.correct) || 0) / n * 100) : 0;
}

export function finishRound(round, prevStats, todayKey) {
  const prev = normalizeSwipeStats(prevStats);
  const r = round || {};
  const today = isDay(todayKey) ? todayKey : "";
  const score = clampInt(r.score);
  const best = Math.max(prev.best, score);
  let streak = prev.streak;
  if (today) {
    if (prev.lastDay === today) streak = Math.max(prev.streak, 1);
    else if (prev.lastDay && dayBefore(today) === prev.lastDay) streak = prev.streak + 1;
    else streak = 1;
  }
  return {
    stats: {
      v: SWIPE_VERSION,
      best,
      bestCombo: Math.max(prev.bestCombo, clampInt(r.bestCombo)),
      plays: prev.plays + 1,
      totalCorrect: prev.totalCorrect + clampInt(r.correct),
      totalAnswered: prev.totalAnswered + clampInt(r.answered),
      lastDay: today || prev.lastDay,
      streak,
    },
    isRecord: score > prev.best && score > 0,
  };
}

export function todayKey(date = new Date()) {
  return date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0") + "-" + String(date.getDate()).padStart(2, "0");
}
