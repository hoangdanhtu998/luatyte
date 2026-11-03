import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  detectMode,
  makeQuizCard,
  buildSwipeDeck,
  buildDesktopDeck,
  createRound,
  applyAnswer,
  finishRound,
  mergeSwipeStats,
  emptySwipeStats,
  accuracy,
} from "../js/swipe-core.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const read = f => JSON.parse(fs.readFileSync(path.join(here, "..", "data", f), "utf8"));
const TF = read("tf.json");
const LAWS = read("laws.json");
const QUIZ = [
  ...read("quiz.json"),
  ...read("quiz_nentang.json"),
  ...read("quiz_his.json"),
];

const TF_FIX = [
  ["Nhận định đúng", true, "Vì đúng."],
  ["Nhận định sai", false, "Vì sai."],
  ["Nhận định đúng 2", true, "Vì đúng."],
  ["Nhận định sai 2", false, "Vì sai."],
];
const QUIZ_FIX = [
  { q: "Câu 1", o: ["A1", "B1", "C1", "D1"], a: 1, e: "Giải thích 1" },
  { q: "Câu 2", o: ["A2", "B2", "C2", "D2"], a: 0, e: "Giải thích 2" },
  { q: "Câu 3", o: ["A3", "B3", "C3", "D3"], a: 2, e: "Giải thích 3" },
  { q: "Câu 4", o: ["A4", "B4", "C4", "D4"], a: 3, e: "Giải thích 4" },
  { q: "Câu 5", o: ["A5", "B5", "C5", "D5"], a: 1, e: "Giải thích 5" },
  { q: "Câu 6", o: ["A6", "B6", "C6", "D6"], a: 0, e: "Giải thích 6" },
];

test("detectMode: query thắng, pointer/width quyết định còn lại", () => {
  assert.equal(detectMode({ coarsePointer: true, width: 1200, query: "" }), "mobile");
  assert.equal(detectMode({ coarsePointer: false, width: 1200, query: "" }), "desktop");
  assert.equal(detectMode({ coarsePointer: false, width: 390, query: "" }), "mobile");
  assert.equal(detectMode({ coarsePointer: true, width: 390, query: "may-tinh" }), "desktop");
  assert.equal(detectMode({ coarsePointer: false, width: 1200, query: "dien-thoai" }), "mobile");
});

test("makeQuizCard: đáp án đề xuất và truth khớp đáp án gốc", () => {
  const right = makeQuizCard(QUIZ_FIX[0], { wantTruth: true, source: "Luật A", rng: () => 0.4 });
  assert.equal(right.kind, "quiz");
  assert.equal(right.truth, true);
  assert.equal(right.proposed, "B1");
  assert.match(right.why, /Đáp án đúng: B1/);

  for (let i = 0; i < 20; i++) {
    const wrong = makeQuizCard(QUIZ_FIX[0], { wantTruth: false, source: "Luật A" });
    assert.equal(wrong.truth, false);
    assert.notEqual(wrong.proposed, "B1");
  }
});

test("buildSwipeDeck: đủ 60 thẻ, không lặp, cân bằng, truth đúng", () => {
  const deck = buildSwipeDeck({ tf: TF, quiz: QUIZ, laws: LAWS, size: 60 });
  assert.equal(deck.length, 60);
  const texts = deck.map(c => c.text);
  assert.equal(new Set(texts).size, texts.length, "không trùng nội dung trong deck");
  for (let i = 1; i < deck.length; i++) assert.notEqual(deck[i].text, deck[i - 1].text);

  const truthCount = deck.filter(c => c.truth).length;
  assert.ok(Math.abs(truthCount - (deck.length - truthCount)) <= 2, `lệch Đúng/Sai quá 2: ${truthCount}/${deck.length}`);

  const tfByText = new Map(TF.map(([text, truth]) => [text, truth]));
  for (const card of deck) {
    if (card.kind === "tf") {
      assert.equal(card.truth, tfByText.get(card.text));
      assert.ok(card.why);
    } else {
      assert.equal(card.truth, card.proposed === card.correctAnswer);
      assert.equal(card.kind, "quiz");
      assert.ok(card.text && card.proposed && card.correctAnswer);
    }
  }
});

test("buildSwipeDeck: kho dữ liệu nhỏ vẫn trả deck hợp lệ, không lặp", () => {
  const deck = buildSwipeDeck({ tf: TF_FIX, quiz: QUIZ_FIX, size: 40 });
  assert.equal(deck.length, 10);
  assert.equal(new Set(deck.map(c => c.text)).size, 10);
  assert.ok(deck.some(c => c.kind === "tf"));
  assert.ok(deck.some(c => c.kind === "quiz"));
});

test("buildDesktopDeck: chỉ TF, đủ 23, không lặp", () => {
  const deck = buildDesktopDeck({ tf: TF });
  assert.equal(deck.length, 23);
  assert.ok(deck.every(c => c.kind === "tf"));
  assert.equal(new Set(deck.map(c => c.text)).size, deck.length);
});

test("applyAnswer: đúng tăng điểm/combo, sai trừ 3 giây và reset combo", () => {
  const deck = [
    { id: "a", text: "A", truth: true, kind: "tf" },
    { id: "b", text: "B", truth: false, kind: "tf" },
    { id: "c", text: "C", truth: true, kind: "tf" },
  ];
  let r = createRound({ mode: "mobile", deck, durationMs: 60000 });
  assert.equal(r.remainMs, 60000);
  assert.equal(accuracy(r), 0);

  let out = applyAnswer(r, true);
  assert.equal(out.event.isCorrect, true);
  assert.equal(out.round.score, 1);
  assert.equal(out.round.combo, 1);
  assert.equal(out.round.bestCombo, 1);
  assert.equal(out.round.remainMs, 60000);
  assert.equal(out.round.answered, 1);
  assert.equal(out.round.index, 1);

  out = applyAnswer(out.round, true);
  assert.equal(out.event.isCorrect, false);
  assert.equal(out.round.score, 1);
  assert.equal(out.round.combo, 0);
  assert.equal(out.round.remainMs, 57000);
  assert.equal(out.event.penaltyMs, 3000);

  out = applyAnswer(out.round, true);
  assert.equal(out.round.score, 2);
  assert.equal(out.round.combo, 1);
  assert.equal(out.round.index, 3);
  assert.equal(accuracy(out.round), 67);
});

test("applyAnswer: milestone combo 5 và 10", () => {
  const deck = Array.from({ length: 10 }, (_, i) => ({ id: "q" + i, text: "Q" + i, truth: true, kind: "tf" }));
  let r = createRound({ mode: "mobile", deck });
  const milestones = [];
  for (let i = 0; i < 10; i++) {
    const out = applyAnswer(r, true);
    r = out.round;
    if (out.event.milestone) milestones.push(out.event.milestone);
  }
  assert.deepEqual(milestones, [5, 10]);
  assert.equal(r.score, 10);
  assert.equal(r.bestCombo, 10);
});

test("finishRound: kỷ lục, tổng, chuỗi ngày cùng ngày/hôm qua/cách ngày", () => {
  const round = { ...createRound({ mode: "mobile", deck: [] }), score: 7, correct: 8, answered: 10, bestCombo: 4 };
  const today = "2026-10-29";

  let out = finishRound(round, emptySwipeStats(), today);
  assert.equal(out.stats.best, 7);
  assert.equal(out.stats.bestCombo, 4);
  assert.equal(out.stats.plays, 1);
  assert.equal(out.stats.totalCorrect, 8);
  assert.equal(out.stats.totalAnswered, 10);
  assert.equal(out.stats.streak, 1);
  assert.equal(out.stats.lastDay, today);
  assert.equal(out.isRecord, true);

  out = finishRound({ ...round, score: 3 }, out.stats, today);
  assert.equal(out.stats.best, 7);
  assert.equal(out.stats.plays, 2);
  assert.equal(out.stats.streak, 1, "cùng ngày không tăng chuỗi");
  assert.equal(out.isRecord, false);

  out = finishRound({ ...round, score: 9 }, out.stats, "2026-10-30");
  assert.equal(out.stats.streak, 2, "hôm qua thì +1");
  assert.equal(out.stats.best, 9);

  out = finishRound({ ...round, score: 1 }, out.stats, "2026-11-05");
  assert.equal(out.stats.streak, 1, "cách ngày thì reset");
});

test("mergeSwipeStats: lấy max điểm/ván, chuỗi theo ngày muộn hơn", () => {
  const a = { v: 1, best: 5, bestCombo: 3, plays: 2, totalCorrect: 10, totalAnswered: 20, lastDay: "2026-10-28", streak: 3 };
  const b = { v: 1, best: 8, bestCombo: 6, plays: 1, totalCorrect: 12, totalAnswered: 22, lastDay: "2026-10-29", streak: 1 };
  const m = mergeSwipeStats(a, b);
  assert.equal(m.best, 8);
  assert.equal(m.bestCombo, 6);
  assert.equal(m.plays, 2);
  assert.equal(m.totalCorrect, 12);
  assert.equal(m.totalAnswered, 22);
  assert.equal(m.lastDay, "2026-10-29");
  assert.equal(m.streak, 1);

  const same = mergeSwipeStats(a, { ...a, streak: 4 });
  assert.equal(same.streak, 4);
});

test("dữ liệu hỏng: stats rỗng vẫn an toàn", () => {
  const s = mergeSwipeStats(null, { best: "x", plays: -2, lastDay: 123, streak: "a" });
  assert.equal(s.best, 0);
  assert.equal(s.plays, 0);
  assert.equal(s.lastDay, "");
  assert.equal(s.streak, 0);
});
