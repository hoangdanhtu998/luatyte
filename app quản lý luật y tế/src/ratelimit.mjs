// Giới hạn số lần thử trong cửa sổ thời gian (trong bộ nhớ, đủ cho một tiến trình).
export function createLimiter({ max, windowMs, now = () => Date.now() }) {
  const hits = new Map(); // key -> { count, resetAt }
  return {
    // Trả về true nếu còn được thử, false nếu đã vượt giới hạn.
    attempt(key) {
      const t = now();
      const cur = hits.get(key);
      if (!cur || cur.resetAt <= t) {
        hits.set(key, { count: 1, resetAt: t + windowMs });
        return true;
      }
      cur.count += 1;
      return cur.count <= max;
    },
    // Đã dùng hết số lần cho phép trong cửa sổ hiện tại.
    blocked(key) {
      const cur = hits.get(key);
      return !!cur && cur.resetAt > now() && cur.count >= max;
    },
    clear(key) { hits.delete(key); },
    size() { return hits.size; },
  };
}
