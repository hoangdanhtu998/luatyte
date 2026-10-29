import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  allocateByWeight,
  buildChapterExam,
  scoreByChapter,
  weakChapters,
  remainingSeconds,
  serializeSession,
  restoreSession,
  mulberry32,
  buildChapterPool,
  examEntryView,
  trimExamHistory,
} from "../js/exam-builder.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const read = f => JSON.parse(fs.readFileSync(path.join(here, "..", "data", f), "utf8"));

// Bộ câu giả: chương c1 có 30 câu, c2 20, c3 10, c4 2.
const mkPool = () => {
  const pool = [], map = {};
  const add = (ch, n) => { for (let i = 0; i < n; i++) { const q = { q: `${ch}-câu-${i}`, o: ["a", "b", "c", "d"], a: 0 }; pool.push(q); map[q.q] = [ch]; } };
  add("c1", 30); add("c2", 20); add("c3", 10); add("c4", 2);
  return { pool, chaptersOf: q => map[q.q] || [], map };
};

test("chia số câu theo tỉ lệ, tổng đúng bằng yêu cầu, lệch tối đa 1", () => {
  const r = allocateByWeight([{ id: "a", weight: 3, available: 99 }, { id: "b", weight: 2, available: 99 }, { id: "c", weight: 1, available: 99 }], 40);
  assert.equal(Object.values(r.counts).reduce((s, x) => s + x, 0), 40);
  const ideal = { a: 20, b: 13.333, c: 6.667 };
  for (const k of Object.keys(ideal)) assert.ok(Math.abs(r.counts[k] - ideal[k]) <= 1, `${k}: ${r.counts[k]}`);
  assert.equal(r.shortfall, 0);
});

test("chương thiếu câu: nhường phần dư cho chương khác và báo rõ", () => {
  const r = allocateByWeight([{ id: "a", weight: 1, available: 2 }, { id: "b", weight: 1, available: 50 }], 10);
  assert.equal(r.counts.a, 2);
  assert.equal(r.counts.b, 8);
  assert.equal(r.shortfall, 0);
});

test("tổng câu có sẵn nhỏ hơn yêu cầu: lấy hết và báo thiếu", () => {
  const r = allocateByWeight([{ id: "a", weight: 1, available: 3 }, { id: "b", weight: 1, available: 4 }], 20);
  assert.deepEqual(r.counts, { a: 3, b: 4 });
  assert.equal(r.shortfall, 13);
});

test("trọng số 0 hoặc không có chương: không ném lỗi", () => {
  assert.deepEqual(allocateByWeight([], 10), { counts: {}, shortfall: 10 });
  const r = allocateByWeight([{ id: "a", weight: 0, available: 5 }, { id: "b", weight: 0, available: 5 }], 6);
  assert.equal(Object.values(r.counts).reduce((s, x) => s + x, 0), 6);
});

test("đề 40 câu x100 lần: không trùng, đúng tổng, lệch tối đa 1, dưới 200 ms/đề", () => {
  const { pool, chaptersOf } = mkPool();
  const total = 40;
  const ideal = { c1: 30 / 62 * total, c2: 20 / 62 * total, c3: 10 / 62 * total, c4: 2 / 62 * total };
  for (let i = 0; i < 100; i++) {
    const t0 = performance.now();
    const ex = buildChapterExam({ pool, chaptersOf, chapters: ["c1", "c2", "c3", "c4"], total, rng: mulberry32(i + 1) });
    assert.ok(performance.now() - t0 < 200);
    assert.equal(ex.items.length, total);
    assert.equal(new Set(ex.items.map(x => x.q.q)).size, total, "trùng câu");
    assert.equal(ex.shortfall, 0);
    for (const row of ex.perChapter) assert.ok(Math.abs(row.got - ideal[row.id]) <= 1 + 1e-9, `${row.id} ${row.got} vs ${ideal[row.id]}`);
    for (const it of ex.items) assert.ok(chaptersOf(it.q).includes(it.ch));
  }
});

test("cùng seed cho cùng đề, khác seed khác đề", () => {
  const { pool, chaptersOf } = mkPool();
  const f = s => buildChapterExam({ pool, chaptersOf, chapters: ["c1", "c2"], total: 10, rng: mulberry32(s) }).items.map(x => x.q.q).join("|");
  assert.equal(f(5), f(5));
  assert.notEqual(f(5), f(6));
});

test("báo rõ số câu thực tế khi chương không đủ, không âm thầm thay bằng chương khác chưa chọn", () => {
  const { pool, chaptersOf } = mkPool();
  const ex = buildChapterExam({ pool, chaptersOf, chapters: ["c4"], total: 10, rng: mulberry32(1) });
  assert.equal(ex.items.length, 2);
  assert.equal(ex.shortfall, 8);
  assert.ok(ex.items.every(x => x.ch === "c4"));
});

test("câu thuộc nhiều chương chỉ xuất hiện một lần", () => {
  const pool = [], map = {};
  for (let i = 0; i < 12; i++) { const q = { q: `x${i}`, o: ["a", "b"], a: 0 }; pool.push(q); map[q.q] = ["c1", "c2"]; }
  const ex = buildChapterExam({ pool, chaptersOf: q => map[q.q], chapters: ["c1", "c2"], total: 12, rng: mulberry32(3) });
  assert.equal(new Set(ex.items.map(x => x.q.q)).size, ex.items.length);
  assert.equal(ex.items.length, 12);
});

test("bỏ qua câu verify và câu không thuộc chương nào được chọn", () => {
  const pool = [{ q: "a", o: [1, 2], a: 0, verify: true }, { q: "b", o: [1, 2], a: 0 }, { q: "c", o: [1, 2], a: 0 }];
  const map = { a: ["c1"], b: ["c1"], c: ["c9"] };
  const ex = buildChapterExam({ pool, chaptersOf: q => map[q.q], chapters: ["c1"], total: 5, rng: mulberry32(1) });
  assert.deepEqual(ex.items.map(x => x.q.q), ["b"]);
});

const rows = spec => spec.flatMap(([ch, oks]) => oks.map(ok => ({ ch, ok })));

test("chấm điểm: đúng hết", () => {
  const s = scoreByChapter(rows([["c1", [true, true, true]], ["c2", [true, true, true, true]]]));
  assert.deepEqual(s.map(x => [x.ch, x.right, x.total, x.pct]), [["c1", 3, 3, 100], ["c2", 4, 4, 100]]);
});
test("chấm điểm: sai hết", () => {
  const s = scoreByChapter(rows([["c1", [false, false, false]]]));
  assert.deepEqual(s[0], { ch: "c1", right: 0, total: 3, pct: 0 });
});
test("chấm điểm: bỏ trống tính là sai", () => {
  const s = scoreByChapter([{ ch: "c1", ok: null }, { ch: "c1", ok: true }, { ch: "c1", ok: undefined }]);
  assert.deepEqual(s[0], { ch: "c1", right: 1, total: 3, pct: 33 });
});
test("chấm điểm: làm tròn phần trăm", () => {
  assert.equal(scoreByChapter(rows([["c1", [true, true, false]]]))[0].pct, 67);
});
test("chấm điểm: đề rỗng", () => { assert.deepEqual(scoreByChapter([]), []); });

test("chương yếu: thấp nhất trong các chương có từ 3 câu, lấy 2 chương", () => {
  const s = scoreByChapter(rows([
    ["c1", [true, true, true, true]],
    ["c2", [true, false, false]],
    ["c3", [false, false, false]],
    ["c4", [false, false]], // dưới 3 câu: không được xét dù 0%
    ["c5", [true, true, false]],
  ]));
  assert.deepEqual(weakChapters(s).map(x => x.ch), ["c3", "c2"]);
});
test("chương yếu: hòa điểm thì ưu tiên chương nhiều câu hơn", () => {
  const s = scoreByChapter(rows([["a", [true, false, false]], ["b", [true, false, false, false, false, true]]]));
  assert.equal(s[0].pct, 33); assert.equal(s[1].pct, 33);
  assert.equal(weakChapters(s, { count: 1 })[0].ch, "b");
});
test("chương yếu: không chương nào đủ 3 câu thì trả mảng rỗng", () => {
  assert.deepEqual(weakChapters(scoreByChapter(rows([["a", [false, false]]]))), []);
});
test("chương yếu: chương đúng hết không bị gọi là yếu", () => {
  assert.deepEqual(weakChapters(scoreByChapter(rows([["a", [true, true, true]]]))), []);
});

test("đồng hồ dựa trên mốc kết thúc tuyệt đối", () => {
  const t0 = 1_000_000;
  assert.equal(remainingSeconds(t0 + 60_000, t0), 60);
  assert.equal(remainingSeconds(t0 + 60_000, t0 + 30_500), 30);
  assert.equal(remainingSeconds(t0 + 60_000, t0 + 60_000), 0);
  assert.equal(remainingSeconds(t0 + 60_000, t0 + 90_000), 0);
});

const lookup = q => ({ q, o: ["a", "b", "c", "d"], a: 1 });
test("lưu và khôi phục phiên thi: đáp án, thứ tự đáp án, thời gian còn lại", () => {
  const now = 5_000_000;
  const raw = serializeSession({
    cfg: { set: "chapter", mins: 20, label: "Điều dưỡng" },
    endAt: now + 600_000,
    exi: 2,
    items: [{ q: "Câu 1", idx: [3, 2, 1, 0], ch: "c1" }, { q: "Câu 2", idx: [0, 1, 2, 3], ch: "c2" }, { q: "Câu 3", idx: [1, 0, 3, 2], ch: "c2" }],
    answers: [0, null, 3],
  });
  const r = restoreSession(raw, now + 120_000, lookup);
  assert.equal(r.ok, true);
  assert.equal(r.remaining, 480);
  assert.equal(r.expired, false);
  assert.deepEqual(r.answers, [0, null, 3]);
  assert.equal(r.exi, 2);
  assert.deepEqual(r.items[0].o, ["d", "c", "b", "a"]);
  assert.equal(r.items[0].a, 2); // đáp án đúng (gốc 1) nằm ở vị trí 2 sau khi xáo
  assert.equal(r.items[0].ch, "c1");
  assert.equal(r.cfg.label, "Điều dưỡng");
});
test("phiên đã hết giờ: báo expired để tự nộp bài", () => {
  const raw = serializeSession({ cfg: { set: "chapter", mins: 1 }, endAt: 1000, exi: 0, items: [{ q: "Câu 1", idx: [0, 1, 2, 3], ch: "c1" }], answers: [null] });
  const r = restoreSession(raw, 999_999, lookup);
  assert.equal(r.ok, true); assert.equal(r.expired, true); assert.equal(r.remaining, 0);
});
test("phiên hỏng hoặc câu hỏi không còn trong dữ liệu: không khôi phục, không ném lỗi", () => {
  assert.equal(restoreSession("{oops", 1, lookup).ok, false);
  assert.equal(restoreSession(null, 1, lookup).ok, false);
  assert.equal(restoreSession(JSON.stringify({ v: 99 }), 1, lookup).ok, false);
  const raw = serializeSession({ cfg: { mins: 1 }, endAt: 5000, exi: 0, items: [{ q: "Câu mất", idx: [0, 1], ch: "c1" }], answers: [null] });
  assert.equal(restoreSession(raw, 1, () => null).ok, false);
});
test("khôi phục chặn chỉ số đáp án bậy", () => {
  const raw = serializeSession({ cfg: { mins: 1 }, endAt: 5000, exi: 9, items: [{ q: "Câu 1", idx: [0, 1, 2, 3], ch: "c1" }], answers: [77] });
  const r = restoreSession(raw, 1, lookup);
  assert.equal(r.ok, true);
  assert.equal(r.exi, 0);
  assert.deepEqual(r.answers, [null]);
});

// Dữ liệu thật: mỗi vai dựng được đề 40 câu hợp lệ, không có câu verify/đặc thù, không trùng.
const roadmap = read("lo-trinh-vai-tro.json");
const bank = [...read("quiz.json"), ...read("quiz_nentang.json"), ...read("quiz_his.json"), ...read("quiz_bhyt.json")];
const META = new Set([
  "Thông tư 21/2023/TT-BYT (đã hết hiệu lực từ 01/01/2025) gồm bao nhiêu phụ lục khung giá?",
  "Thông tư 25/2026/TT-BYT thay thế toàn bộ Điều nào của Thông tư 32/2023 về khám sức khỏe?",
  "Thông tư 13/2025/TT-BYT làm hết hiệu lực Thông tư nào về hồ sơ bệnh án điện tử?",
]);
for (const role of roadmap.vai_tro) {
  test(`dữ liệu thật: vai ${role.id} dựng được đề hợp lệ`, () => {
    const pool = bank.filter(q => !q.verify && !META.has(q.q));
    const ex = buildChapterExam({ pool, chaptersOf: q => roadmap.cau_hoi[q.q] || [], chapters: role.chuong, total: 40, rng: mulberry32(7) });
    assert.ok(ex.items.length > 0);
    assert.equal(new Set(ex.items.map(x => x.q.q)).size, ex.items.length);
    assert.ok(ex.items.every(x => !x.q.verify && role.chuong.includes(x.ch)));
    assert.equal(ex.items.length + ex.shortfall, 40);
  });
}

// ---- Gộp ngân hàng câu: câu lý thuyết chỉ vào đề khi có khóa chương rõ ràng (không đoán) ----
test("buildChapterPool: câu bổ sung chỉ vào pool khi có khóa trong bản đồ chương", () => {
  const base = [{ q: "A", o: [1, 2], a: 0 }, { q: "B", o: [1, 2], a: 0, verify: true }];
  const extra = [{ q: "L1", o: [1, 2], a: 0 }, { q: "L2", o: [1, 2], a: 0 }, { q: "A", o: [1, 2], a: 0 }];
  const map = { A: ["c1"], L1: ["c4"] };
  const pool = buildChapterPool({ banks: base, extra, chapterMap: map, isExcluded: () => false });
  assert.deepEqual(pool.map(q => q.q), ["A", "L1"]); // B (verify) bỏ, L2 không có khóa nên bỏ, A không nhân đôi
});
test("buildChapterPool: loại câu đặc thù theo isExcluded", () => {
  const pool = buildChapterPool({ banks: [{ q: "A", o: [1, 2], a: 0 }, { q: "M", o: [1, 2], a: 0 }], extra: [], chapterMap: { A: ["c1"], M: ["c1"] }, isExcluded: q => q.q === "M" });
  assert.deepEqual(pool.map(q => q.q), ["A"]);
});
test("dữ liệu thật: quiz_lythuyet hiện chưa có khóa chương nào nên không lọt vào đề (chưa đoán)", () => {
  const lt = read("quiz_lythuyet.json");
  const pool = buildChapterPool({ banks: [], extra: lt, chapterMap: roadmap.cau_hoi, isExcluded: () => false });
  assert.equal(pool.length, lt.filter(q => roadmap.cau_hoi[q.q] && !q.verify).length);
});
test("dữ liệu thật: mọi khóa chương của quiz_lythuyet (nếu có sau này) trỏ tới chương tồn tại", () => {
  const lt = new Set(read("quiz_lythuyet.json").map(q => q.q));
  for (const [q, chs] of Object.entries(roadmap.cau_hoi)) if (lt.has(q)) for (const c of chs) assert.ok(roadmap.chuong[c], `${q} -> ${c}`);
});
test("dữ liệu thật: HIS có trường law ở mọi câu để nhóm chuyên đề theo luật", () => {
  const his = read("quiz_his.json");
  assert.ok(his.every(q => typeof q.law === "string" && q.law.length > 0));
  assert.ok(new Set(his.map(q => q.law)).size >= 2);
});

// ---- Lịch sử thi: dữ liệu cũ (không có byCh/topic/sbd) vẫn hiển thị được ----
const SETS = { chung: "Luật chung", chapter: "Theo chương" };
test("examEntryView: bản ghi cũ của bản live (không topic/sbd/d10/byCh)", () => {
  const v = examEntryView({ d: "2026-10-26", set: "chung", n: 20, r: 15, pct: 75, used: 600 }, SETS);
  assert.deepEqual(v, { d: "2026-10-26", label: "Luật chung", n: 20, r: 15, pct: 75, minutes: 10 });
});
test("examEntryView: bản ghi mới có topic và byCh", () => {
  const v = examEntryView({ d: "2026-10-29", set: "chapter", topic: "HIS · 5 chương", n: 10, r: 4, pct: 40, used: 90, byCh: [["c7", 2, 4]] }, SETS);
  assert.equal(v.label, "Theo chương · HIS · 5 chương");
  assert.equal(v.minutes, 2);
});
test("examEntryView: bản ghi thiếu trường hoặc hỏng không ném lỗi", () => {
  for (const bad of [{}, { set: "lạ" }, { n: "x", r: null, pct: undefined, used: "abc" }]) {
    const v = examEntryView(bad, SETS);
    assert.equal(typeof v.label, "string");
    assert.ok(Number.isFinite(v.pct) && Number.isFinite(v.minutes) && Number.isFinite(v.n) && Number.isFinite(v.r));
  }
  assert.equal(examEntryView({ n: 10, r: 5 }, SETS).pct, 50); // thiếu pct thì tính lại
});
test("trimExamHistory: trộn bản ghi cũ và mới, giới hạn số lượt và dung lượng", () => {
  const old = { d: "2026-10-01", set: "chung", n: 20, r: 10, pct: 50, used: 60 };
  const mixed = [{ ...old, byCh: [["c1", 1, 3]] }, old];
  assert.equal(trimExamHistory(mixed, 100, 55000).length, 2);
  const many = Array.from({ length: 150 }, (_, i) => ({ ...old, d: `d${i}` }));
  const t = trimExamHistory(many, 100, 55000);
  assert.equal(t.length, 100);
  assert.equal(t[0].d, "d0"); // giữ lượt mới nhất (đầu danh sách)
  const fat = Array.from({ length: 50 }, () => ({ ...old, topic: "x".repeat(2000) }));
  const t2 = trimExamHistory(fat, 100, 20000);
  assert.ok(JSON.stringify(t2).length <= 20000 && t2.length >= 1);
});
test("trimExamHistory: đầu vào không phải mảng thì trả mảng rỗng", () => {
  assert.deepEqual(trimExamHistory(null, 100, 1000), []);
});
