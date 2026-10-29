// Quyền truy cập theo gói: giới hạn lượt chat mỗi ngày và số dòng nội dung luật được xem.
// Quy ước: -1 = không giới hạn. Admin luôn có quyền cao nhất.
export const DEFAULT_FREE = { chatDailyLimit: 5, lawVisibleLines: 30, showAds: true };
export const UNLIMITED = { chatDailyLimit: -1, lawVisibleLines: -1, showAds: false };
const VN_OFFSET_MS = 7 * 60 * 60 * 1000; // ngày tính theo giờ Việt Nam (UTC+7)

export function dayKey(now) {
  return new Date(now + VN_OFFSET_MS).toISOString().slice(0, 10);
}

// Gói miễn phí là gói đang bán có giá 0, rẻ nhất; không có thì dùng mặc định.
function freePlanFeatures(db) {
  const r = db.prepare("SELECT features FROM plans WHERE price = 0 AND status = 'active' AND deleted_at IS NULL ORDER BY id LIMIT 1").get();
  if (!r) return DEFAULT_FREE;
  return { ...DEFAULT_FREE, ...JSON.parse(r.features || '{}') };
}

// Trả về tier và quyền: admin, plan (đang có gói), hoặc free.
export function entitlementsFor(db, userId, now, activeSubscription) {
  if (userId) {
    const u = db.prepare('SELECT role FROM users WHERE id = ?').get(userId);
    if (u && u.role === 'admin') return { tier: 'admin', features: UNLIMITED };
  }
  if (activeSubscription) {
    const p = db.prepare('SELECT features FROM plans WHERE id = ?').get(activeSubscription.plan_id);
    // Gói trả phí mặc định không có quảng cáo, trừ khi gói ghi rõ showAds: true.
    const features = { ...DEFAULT_FREE, showAds: false, ...(p ? JSON.parse(p.features || '{}') : {}) };
    return { tier: 'plan', planId: activeSubscription.plan_id, features };
  }
  return { tier: 'free', features: freePlanFeatures(db) };
}

// Đếm lượt chat trong ngày. Trả về allowed=false khi đã hết lượt.
export function consumeChat(db, userId, features, now) {
  const limit = features.chatDailyLimit;
  const day = dayKey(now);
  const row = db.prepare('SELECT count FROM chat_usage WHERE user_id = ? AND day = ?').get(userId, day);
  const used = row ? row.count : 0;
  if (limit !== -1 && used >= limit) return { allowed: false, used, limit, remaining: 0 };
  db.prepare(`INSERT INTO chat_usage (user_id, day, count) VALUES (?, ?, 1)
    ON CONFLICT(user_id, day) DO UPDATE SET count = count + 1`).run(userId, day);
  const next = used + 1;
  return { allowed: true, used: next, limit, remaining: limit === -1 ? -1 : Math.max(0, limit - next) };
}

export function chatStatus(db, userId, features, now) {
  const row = db.prepare('SELECT count FROM chat_usage WHERE user_id = ? AND day = ?').get(userId, dayKey(now));
  const used = row ? row.count : 0;
  const limit = features.chatDailyLimit;
  return { used, limit, remaining: limit === -1 ? -1 : Math.max(0, limit - used) };
}

// Cắt nội dung theo số dòng được xem. visible = -1 thì xem hết.
export function truncateLines(text, visible) {
  const lines = String(text ?? '').split('\n');
  if (visible === -1 || lines.length <= visible) return { text: lines.join('\n'), totalLines: lines.length, shownLines: lines.length, truncated: false };
  return { text: lines.slice(0, visible).join('\n'), totalLines: lines.length, shownLines: visible, truncated: true };
}
