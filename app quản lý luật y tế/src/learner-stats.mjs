// Thống kê học viên (mục 41): chỉ số gộp, không lộ danh tính. Đọc ảnh chụp tiến độ đã đồng bộ (user_progress).
// Mỗi ảnh chụp có khóa "lyt_qstat": JSON {câu hỏi: {s: số lần đúng liên tiếp, w: số lần sai}}.
const MASTER_AT = 5; // khớp với app: đúng liên tiếp 5 lần thì coi là đã thuộc câu
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export function learnerStats(db, now) {
  const learners = db.prepare("SELECT COUNT(*) AS n FROM users WHERE role = 'user' AND status = 'active'").get().n;
  const rows = db.prepare(`SELECT p.data, p.updated_at FROM user_progress p
    JOIN users u ON u.id = p.user_id WHERE u.role = 'user' AND u.status = 'active'`).all();

  let withProgress = 0;
  let activeLast7Days = 0;
  let questionsMastered = 0;
  let questionsWrong = 0;
  const wrongLearners = new Map(); // câu hỏi -> số học viên từng sai câu đó
  for (const row of rows) {
    withProgress += 1;
    if (row.updated_at >= now - WEEK_MS) activeLast7Days += 1;
    let stats = {};
    try { stats = JSON.parse(JSON.parse(row.data).lyt_qstat || '{}'); } catch { continue; }
    for (const [question, st] of Object.entries(stats)) {
      if (!st || typeof st !== 'object') continue;
      if ((st.s ?? 0) >= MASTER_AT) questionsMastered += 1;
      if ((st.w ?? 0) > 0) {
        questionsWrong += 1;
        wrongLearners.set(question, (wrongLearners.get(question) ?? 0) + 1);
      }
    }
  }
  const topWrong = [...wrongLearners.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([question, count]) => ({ question: String(question).slice(0, 200), learners: count }));
  return {
    learners,
    withProgress,
    activeLast7Days,
    questionsMastered,
    questionsWrong,
    topWrong,
  };
}
