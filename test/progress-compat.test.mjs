import test from "node:test";
import assert from "node:assert/strict";
import {
  migrateLegacyProgress,
  classifyAccountProbe,
  LEGACY_PROGRESS_KEYS,
} from "../js/progress-compat.js";

const fakeStorage = (init = {}) => {
  const m = new Map(Object.entries(init));
  return {
    get length() { return m.size; },
    key: i => [...m.keys()][i] ?? null,
    getItem: k => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: k => m.delete(k),
    dump: () => Object.fromEntries(m),
  };
};

// Dữ liệu giống hệt người dùng trên bản live (store.get("lyt_progress") ghi vào khóa "lyt_lyt_progress").
const LIVE_USER = () => ({
  lyt_lyt_progress: JSON.stringify({ score: 37, total: 9, streak: 4, lastPlayed: "2026-10-27", badges: ["first", "combo5"] }),
  lyt_badges: JSON.stringify(["first", "combo5", "law1"]),
  lyt_qstat: JSON.stringify({ "Câu A": { s: 3, w: 1 } }),
  lyt_exams: JSON.stringify([{ d: "2026-10-26", set: "chung", n: 20, r: 15, pct: 75, used: 600 }]),
  lyt_daily: JSON.stringify({ day: "2026-10-27", last: "2026-10-27", streak: 4 }),
});

test("khóa cũ của bản live có trong danh sách khóa tương thích", () => {
  assert.ok(LEGACY_PROGRESS_KEYS.includes("lyt_lyt_progress"));
  assert.ok(LEGACY_PROGRESS_KEYS.includes("lyt_progress"));
});

test("chuyển tiến độ ngày cũ sang khóa mới mà không mất dữ liệu", () => {
  const st = fakeStorage(LIVE_USER());
  const r = migrateLegacyProgress(st);
  assert.equal(r.migrated, true);
  const moved = JSON.parse(st.getItem("lyt_dailyProgress"));
  assert.deepEqual(moved, { score: 37, total: 9, streak: 4, lastPlayed: "2026-10-27", badges: ["first", "combo5"] });
  // khóa cũ vẫn còn để có thể quay lại bản cũ
  assert.ok(st.getItem("lyt_lyt_progress"));
});

test("không đụng vào các khóa tiến độ khác của người dùng live", () => {
  const before = LIVE_USER();
  const st = fakeStorage(before);
  migrateLegacyProgress(st);
  for (const k of ["lyt_badges", "lyt_qstat", "lyt_exams", "lyt_daily"]) assert.equal(st.getItem(k), before[k]);
});

test("không ghi đè tiến độ mới nếu đã có", () => {
  const st = fakeStorage({ ...LIVE_USER(), lyt_dailyProgress: JSON.stringify({ score: 1, total: 1, streak: 1, lastPlayed: "2026-10-29", badges: [] }) });
  const r = migrateLegacyProgress(st);
  assert.equal(r.migrated, false);
  assert.equal(JSON.parse(st.getItem("lyt_dailyProgress")).score, 1);
});

test("chạy hai lần cho cùng kết quả", () => {
  const st = fakeStorage(LIVE_USER());
  migrateLegacyProgress(st);
  const once = st.dump();
  const r2 = migrateLegacyProgress(st);
  assert.equal(r2.migrated, false);
  assert.deepEqual(st.dump(), once);
});

test("khóa cũ hỏng hoặc sai kiểu thì bỏ qua, không ném lỗi", () => {
  for (const bad of ["{oops", "null", "42", '"x"', "[1,2]"]) {
    const st = fakeStorage({ lyt_lyt_progress: bad });
    assert.doesNotThrow(() => migrateLegacyProgress(st));
    assert.equal(st.getItem("lyt_dailyProgress"), null);
  }
});

test("chuẩn hóa trường thiếu/sai kiểu", () => {
  const st = fakeStorage({ lyt_lyt_progress: JSON.stringify({ score: "12", total: -3, badges: "x" }) });
  migrateLegacyProgress(st);
  assert.deepEqual(JSON.parse(st.getItem("lyt_dailyProgress")), { score: 12, total: 0, streak: 0, lastPlayed: "", badges: [] });
});

test("không có dữ liệu cũ thì không làm gì", () => {
  const st = fakeStorage({ lyt_qstat: "{}" });
  assert.equal(migrateLegacyProgress(st).migrated, false);
  assert.equal(st.getItem("lyt_dailyProgress"), null);
});

test("dùng khóa lyt_progress nếu không có lyt_lyt_progress", () => {
  const st = fakeStorage({ lyt_progress: JSON.stringify({ score: 5, total: 2, streak: 1, lastPlayed: "2026-10-01", badges: [] }) });
  assert.equal(migrateLegacyProgress(st).migrated, true);
  assert.equal(JSON.parse(st.getItem("lyt_dailyProgress")).score, 5);
});

test("máy chủ không có (GitHub Pages) -> chế độ tĩnh, không báo lỗi", () => {
  assert.equal(classifyAccountProbe({ status: 404 }), "static");
  assert.equal(classifyAccountProbe({ status: 405 }), "static");
  assert.equal(classifyAccountProbe({ status: 501 }), "static");
});

test("mất mạng: chưa từng đồng bộ -> chế độ tĩnh; đã từng đồng bộ -> báo lỗi để thử lại", () => {
  assert.equal(classifyAccountProbe({ networkError: true, hadSync: false }), "static");
  assert.equal(classifyAccountProbe({ networkError: true, hadSync: true }), "error");
});

test("trạng thái khác", () => {
  assert.equal(classifyAccountProbe({ status: 200 }), "ok");
  assert.equal(classifyAccountProbe({ status: 401 }), "anon");
  assert.equal(classifyAccountProbe({ status: 403 }), "anon");
  assert.equal(classifyAccountProbe({ status: 500 }), "error");
  assert.equal(classifyAccountProbe({ status: 503 }), "error");
});
