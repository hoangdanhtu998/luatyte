/* Tương thích tiến độ cũ + nhận biết chạy tĩnh (không có máy chủ tài khoản).
   Thuần logic, không đụng DOM, để Node test được. */

// Bản live cũ gọi store.get("lyt_progress"), store tự thêm tiền tố "lyt_" nên thực tế ghi vào "lyt_lyt_progress".
export const LEGACY_PROGRESS_KEYS = ["lyt_lyt_progress", "lyt_progress"];
export const DAILY_PROGRESS_KEY = "lyt_dailyProgress";

const num = (v, min = 0) => {
  const n = Number(v);
  return Number.isFinite(n) && n >= min ? n : min;
};

function normalizeDaily(o) {
  return {
    score: num(o.score),
    total: num(o.total),
    streak: num(o.streak),
    lastPlayed: typeof o.lastPlayed === "string" ? o.lastPlayed : "",
    badges: Array.isArray(o.badges) ? o.badges.filter(b => typeof b === "string") : [],
  };
}

function readObject(storage, key) {
  try {
    const raw = storage.getItem(key);
    if (raw == null) return null;
    const v = JSON.parse(raw);
    return v && typeof v === "object" && !Array.isArray(v) ? v : null;
  } catch {
    return null;
  }
}

/* Chép tiến độ ngày của bản live sang khóa mới. Không xóa khóa cũ, không ghi đè khóa mới. */
export function migrateLegacyProgress(storage) {
  if (storage.getItem(DAILY_PROGRESS_KEY) != null) return { migrated: false };
  for (const key of LEGACY_PROGRESS_KEYS) {
    const old = readObject(storage, key);
    if (!old) continue;
    storage.setItem(DAILY_PROGRESS_KEY, JSON.stringify(normalizeDaily(old)));
    return { migrated: true, from: key };
  }
  return { migrated: false };
}

/* Phân loại kết quả gọi /api/me:
   static = không có máy chủ (GitHub Pages trả 404...), chỉ lưu trên máy; anon = chưa đăng nhập;
   ok = đã đăng nhập; error = có máy chủ nhưng lỗi, cần cho người dùng thử lại. */
export function classifyAccountProbe({ status, networkError = false, hadSync = false } = {}) {
  if (networkError) return hadSync ? "error" : "static";
  if (status === 404 || status === 405 || status === 501) return "static";
  if (status === 401 || status === 403) return "anon";
  if (status >= 200 && status < 300) return "ok";
  return "error";
}
