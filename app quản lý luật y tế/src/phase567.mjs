// Phase 5 (vận hành: tổng quan, sao lưu, cảnh báo), Phase 6 (nội dung luật, trang pháp lý, xuất/xóa dữ liệu), Phase 7 (doanh thu, chi phí, lợi nhuận, chi phí AI).
import { statfsSync, readdirSync, statSync, unlinkSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { cpus, totalmem, freemem, uptime, loadavg } from 'node:os';
import { enqueue } from './mail.mjs';
import { setSetting, getSetting } from './ops.mjs';

const DAY = 24 * 60 * 60 * 1000;
const MIN5 = 5 * 60 * 1000;
const iso = t => new Date(t).toISOString();

export class P567Error extends Error {
  constructor(code, message, status = 400) { super(message); this.code = code; this.status = status; }
}

// ---------- Phase 5 ----------
export function overview(db, now, { rootPath = process.cwd() } = {}) {
  const startToday = new Date(now); startToday.setUTCHours(0, 0, 0, 0);
  const startMonth = new Date(Date.UTC(new Date(now).getUTCFullYear(), new Date(now).getUTCMonth(), 1)).getTime();
  const users = db.prepare("SELECT COUNT(*) n, SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) active FROM users").get();
  const newToday = db.prepare('SELECT COUNT(*) n FROM users WHERE created_at >= ?').get(iso(startToday.getTime())).n;
  const rev = (from) => db.prepare("SELECT COALESCE(SUM(final_amount), 0) s FROM orders WHERE status = 'paid' AND paid_at >= ?").get(iso(from)).s;
  const errors24 = db.prepare('SELECT COUNT(*) n FROM system_errors WHERE created_at >= ?').get(now - DAY).n;
  const failedMail24 = db.prepare("SELECT COUNT(*) n FROM email_queue WHERE status = 'failed' AND tried_at >= ?").get(iso(now - DAY)).n;
  let disk = null;
  try { const st = statfsSync(rootPath); disk = Math.round((1 - st.bavail / st.blocks) * 100); } catch { disk = null; }
  // Windows không có loadavg: để null thay vì bịa số.
  const load = process.platform === 'win32' ? null : loadavg()[0];
  return {
    users: { total: users.n, active: users.active || 0, newToday },
    revenue: { today: rev(startToday.getTime()), month: rev(startMonth), currency: 'VND' },
    server: {
      cpuPercent: load === null ? null : Math.min(100, Math.round(load / cpus().length * 100)),
      memoryPercent: Math.round((1 - freemem() / totalmem()) * 100),
      diskPercent: disk,
      uptimeHours: Math.round(uptime() / 3600),
    },
    errors24h: errors24,
    failedEmails24h: failedMail24,
  };
}

export function recordError(db, { path, message, now }) {
  db.prepare('INSERT INTO system_errors (path, message, created_at) VALUES (?, ?, ?)').run(String(path).slice(0, 200), String(message).slice(0, 300), now);
  const recent = db.prepare('SELECT COUNT(*) n FROM system_errors WHERE created_at >= ?').get(now - MIN5).n;
  if (recent > 5) {
    const open = db.prepare("SELECT id FROM system_alerts WHERE type = 'SERVER_ERROR' AND resolved_at IS NULL AND created_at >= ?").get(now - MIN5);
    if (!open) createAlert(db, { type: 'SERVER_ERROR', message: `${recent} lỗi máy chủ trong 5 phút gần nhất`, severity: 'critical', now });
  }
}

export function createAlert(db, { type, message, severity = 'warning', now, notifyTo = null }) {
  const info = db.prepare('INSERT INTO system_alerts (type, message, severity, created_at) VALUES (?, ?, ?, ?)').run(type, message, severity, now);
  if (notifyTo) enqueue(db, { to: notifyTo, subject: `[Cảnh báo ${severity}] ${type}`, body: message }, now);
  return Number(info.lastInsertRowid);
}

export function listAlerts(db, { resolved = false } = {}) {
  return db.prepare(resolved ? 'SELECT * FROM system_alerts ORDER BY id DESC LIMIT 100' : 'SELECT * FROM system_alerts WHERE resolved_at IS NULL ORDER BY id DESC LIMIT 100')
    .all().map(a => ({ id: a.id, type: a.type, message: a.message, severity: a.severity, createdAt: a.created_at, resolvedAt: a.resolved_at }));
}

export function resolveAlert(db, id, now) {
  const r = db.prepare('SELECT id FROM system_alerts WHERE id = ?').get(id);
  if (!r) throw new P567Error('NOT_FOUND', 'Không tìm thấy cảnh báo.', 404);
  db.prepare('UPDATE system_alerts SET resolved_at = ? WHERE id = ? AND resolved_at IS NULL').run(now, id);
  return { ok: true };
}

// Sao lưu: VACUUM INTO tạo bản sao nhất quán ngay cả khi đang ghi. Giữ 7 bản mới nhất.
export function createBackup(db, dir, now, { keep = 7 } = {}) {
  mkdirSync(dir, { recursive: true });
  const name = `backup-${iso(now).replace(/[:.]/g, '-')}.db`;
  const file = join(dir, name);
  try {
    db.prepare('VACUUM INTO ?').run(file);
  } catch (e) {
    createAlert(db, { type: 'BACKUP_FAIL', message: 'Sao lưu thất bại: ' + String(e.message).slice(0, 200), severity: 'critical', now });
    throw new P567Error('BACKUP_FAILED', 'Sao lưu thất bại. Đã tạo cảnh báo.', 500);
  }
  const all = listBackups(dir);
  for (const b of all.slice(keep)) { try { unlinkSync(join(dir, b.name)); } catch { /* bỏ qua */ } }
  return { name, kept: Math.min(all.length, keep) };
}

export function listBackups(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter(n => /^backup-.*\.db$/.test(n))
    .map(n => ({ name: n, size: statSync(join(dir, n)).size, mtime: statSync(join(dir, n)).mtimeMs }))
    .sort((a, b) => b.mtime - a.mtime);
}

// ---------- Phase 6: nội dung luật ----------
export function createCategory(db, { name, parentId = null, sortOrder = 0 }) {
  const n = String(name || '').trim();
  if (!n || n.length > 200) throw new P567Error('INVALID_INPUT', 'Tên danh mục từ 1 đến 200 ký tự.');
  const info = db.prepare('INSERT INTO law_categories (name, parent_id, sort_order) VALUES (?, ?, ?)').run(n, parentId, Number(sortOrder) || 0);
  return { id: Number(info.lastInsertRowid), name: n, parentId, sortOrder: Number(sortOrder) || 0 };
}

export function createArticle(db, { categoryId, number, title, content }, now) {
  const num = String(number || '').trim();
  if (!num || !title || !content) throw new P567Error('INVALID_INPUT', 'Thiếu số điều, tiêu đề hoặc nội dung.');
  if (String(content).length > 20000) throw new P567Error('INVALID_INPUT', 'Nội dung điều quá dài.');
  const info = db.prepare('INSERT INTO law_articles (category_id, number, title, content, is_verified, verified_at) VALUES (?, ?, ?, ?, 0, NULL)')
    .run(categoryId ?? null, num, String(title).slice(0, 300), String(content));
  return getArticle(db, Number(info.lastInsertRowid));
}

export function getArticle(db, id) {
  const a = db.prepare('SELECT * FROM law_articles WHERE id = ?').get(id);
  return a ? { id: a.id, categoryId: a.category_id, number: a.number, title: a.title, content: a.content, isVerified: !!a.is_verified, verifiedAt: a.verified_at } : null;
}

// Đánh dấu đã đối chiếu với văn bản gốc. Sửa nội dung thì bỏ đánh dấu.
export function updateArticle(db, id, body, now) {
  const cur = getArticle(db, id);
  if (!cur) throw new P567Error('NOT_FOUND', 'Không tìm thấy điều luật.', 404);
  const contentChanged = body.content !== undefined && body.content !== cur.content;
  const next = {
    number: body.number ?? cur.number, title: body.title ?? cur.title, content: body.content ?? cur.content,
    is_verified: body.isVerified !== undefined ? (body.isVerified ? 1 : 0) : (contentChanged ? 0 : (cur.isVerified ? 1 : 0)),
  };
  const verifiedAt = next.is_verified ? (cur.isVerified && !contentChanged ? cur.verifiedAt : now) : null;
  db.prepare('UPDATE law_articles SET number = ?, title = ?, content = ?, is_verified = ?, verified_at = ? WHERE id = ?')
    .run(String(next.number), String(next.title), String(next.content), next.is_verified, verifiedAt, id);
  return getArticle(db, id);
}

export function deleteArticle(db, id) {
  if (!getArticle(db, id)) throw new P567Error('NOT_FOUND', 'Không tìm thấy điều luật.', 404);
  db.prepare('DELETE FROM law_articles WHERE id = ?').run(id);
  return { ok: true };
}

export function createNews(db, { title, content, publish = false }, now) {
  if (!title || !content) throw new P567Error('INVALID_INPUT', 'Thiếu tiêu đề hoặc nội dung.');
  const info = db.prepare('INSERT INTO law_news (title, content, published_at, is_published) VALUES (?, ?, ?, ?)')
    .run(String(title).slice(0, 300), String(content), publish ? now : null, publish ? 1 : 0);
  return { id: Number(info.lastInsertRowid) };
}

export function exportLawContent(db) {
  return {
    categories: db.prepare('SELECT id, name, parent_id, sort_order FROM law_categories ORDER BY id').all(),
    articles: db.prepare('SELECT id, category_id, number, title, content, is_verified, verified_at FROM law_articles ORDER BY id').all(),
    news: db.prepare('SELECT id, title, content, published_at, is_published FROM law_news ORDER BY id').all(),
  };
}

// ---------- Phase 6: trang pháp lý (cần luật sư duyệt trước khi công khai) ----------
const LEGAL = ['terms', 'privacy'];
export function setLegal(db, name, text, now) {
  if (!LEGAL.includes(name)) throw new P567Error('NOT_FOUND', 'Không có trang này.', 404);
  if (typeof text !== 'string' || text.length > 50000) throw new P567Error('INVALID_INPUT', 'Nội dung trang pháp lý không hợp lệ.');
  setSetting(db, `legal.${name}`, text, { now });
  return { ok: true };
}
export function getLegal(db, name) {
  if (!LEGAL.includes(name)) throw new P567Error('NOT_FOUND', 'Không có trang này.', 404);
  return { name, text: getSetting(db, `legal.${name}`) || '' };
}

// ---------- Phase 6: xuất và xóa dữ liệu cá nhân ----------
export function exportUserData(db, userId) {
  const u = db.prepare('SELECT id, email, name, role, status, created_at FROM users WHERE id = ?').get(userId);
  if (!u) throw new P567Error('NOT_FOUND', 'Không tìm thấy user.', 404);
  return {
    exportedAt: new Date().toISOString(),
    profile: { id: u.id, email: u.email, name: u.name, role: u.role, status: u.status, createdAt: u.created_at },
    consents: db.prepare('SELECT type, version, agreed_at FROM consents WHERE user_id = ? ORDER BY id').all(userId),
    orders: db.prepare('SELECT id, plan_id, amount, discount_amount, final_amount, status, created_at, paid_at FROM orders WHERE user_id = ? ORDER BY id').all(userId),
    subscriptions: db.prepare('SELECT id, plan_id, starts_at, ends_at, status FROM subscriptions WHERE user_id = ? ORDER BY id').all(userId),
    loginHistory: db.prepare('SELECT logged_at, success, failed_reason FROM login_logs WHERE user_id = ? ORDER BY id DESC LIMIT 200').all(userId),
  };
}

// Xóa dữ liệu cá nhân: ẩn danh tài khoản, xóa phiên, giữ đơn hàng và thống kê không định danh.
export function anonymizeUser(db, userId, now) {
  const u = db.prepare('SELECT id FROM users WHERE id = ?').get(userId);
  if (!u) throw new P567Error('NOT_FOUND', 'Không tìm thấy user.', 404);
  db.exec('BEGIN IMMEDIATE');
  try {
    db.prepare("UPDATE users SET email = ?, name = '', password_hash = 'deleted', status = 'locked', totp_secret = NULL, totp_enabled = 0 WHERE id = ?")
      .run(`deleted-${userId}@anonymized.local`, userId);
    db.prepare('DELETE FROM sessions WHERE user_id = ?').run(userId);
    db.prepare('DELETE FROM consents WHERE user_id = ?').run(userId);
    db.prepare("UPDATE login_logs SET email = 'deleted', ip = NULL, user_agent = NULL WHERE user_id = ?").run(userId);
    db.exec('COMMIT');
  } catch (e) { db.exec('ROLLBACK'); throw e; }
  return { ok: true, anonymizedAt: iso(now) };
}

// ---------- Phase 7: doanh thu, chi phí, lợi nhuận, chi phí AI ----------
export function revenueReport(db, { from, to, groupBy = 'day' }) {
  const rows = db.prepare(`SELECT o.final_amount amt, o.paid_at at, o.gateway gw, p.name plan
    FROM orders o JOIN plans p ON p.id = o.plan_id
    WHERE o.status = 'paid' AND o.paid_at >= ? AND o.paid_at < ?`).all(iso(from), iso(to));
  const total = rows.reduce((s, r) => s + r.amt, 0);
  const bucket = {};
  const key = r => groupBy === 'month' ? r.at.slice(0, 7) : r.at.slice(0, 10);
  const byPlan = {}, byGateway = {};
  for (const r of rows) {
    if (groupBy === 'day' || groupBy === 'month') bucket[key(r)] = (bucket[key(r)] || 0) + r.amt;
    byPlan[r.plan] = (byPlan[r.plan] || 0) + r.amt;
    byGateway[r.gw] = (byGateway[r.gw] || 0) + r.amt;
  }
  return {
    totalRevenue: total,
    byPeriod: Object.entries(bucket).sort().map(([period, revenue]) => ({ period, revenue })),
    byPlan: Object.entries(byPlan).map(([planName, revenue]) => ({ planName, revenue })),
    byGateway: Object.entries(byGateway).map(([gateway, revenue]) => ({ gateway, revenue })),
  };
}

export function createCost(db, { name, type, amount, periodStart, periodEnd }) {
  if (!['fixed', 'variable'].includes(type)) throw new P567Error('INVALID_INPUT', 'Loại chi phí phải là fixed hoặc variable.');
  const a = Number(amount), s = Date.parse(periodStart), e = Date.parse(periodEnd);
  if (!name || !Number.isInteger(a) || a < 0 || Number.isNaN(s) || Number.isNaN(e) || e <= s) throw new P567Error('INVALID_INPUT', 'Thông tin chi phí không hợp lệ.');
  const info = db.prepare('INSERT INTO cost_items (name, type, amount, period_start, period_end) VALUES (?, ?, ?, ?, ?)').run(String(name).slice(0, 200), type, a, s, e);
  return { id: Number(info.lastInsertRowid) };
}

export function listCosts(db) {
  return db.prepare('SELECT * FROM cost_items ORDER BY id').all().map(c => ({ id: c.id, name: c.name, type: c.type, amount: c.amount, periodStart: iso(c.period_start), periodEnd: iso(c.period_end) }));
}

// Chi phí được chia đều theo số ngày của kỳ, chỉ tính phần nằm trong khoảng [from, to).
function costInRange(db, from, to) {
  let total = 0;
  for (const c of db.prepare('SELECT * FROM cost_items').all()) {
    const days = (c.period_end - c.period_start) / DAY;
    const overlapStart = Math.max(from, c.period_start), overlapEnd = Math.min(to, c.period_end);
    if (overlapEnd > overlapStart) total += c.amount * ((overlapEnd - overlapStart) / DAY) / days;
  }
  return Math.round(total);
}

export function profitReport(db, { from, to }) {
  const revenue = revenueReport(db, { from, to }).totalRevenue;
  const costs = costInRange(db, from, to);
  return { revenue, costs, profit: revenue - costs, warningLossFor30Days: lossWarning(db, to) };
}

// Cảnh báo: 30 ngày liên tiếp kết thúc tại `to` mà ngày nào cũng lỗ (doanh thu < chi phí phân bổ).
export function lossWarning(db, to) {
  for (let i = 0; i < 30; i++) {
    const dayStart = to - (i + 1) * DAY, dayEnd = to - i * DAY;
    const rev = db.prepare("SELECT COALESCE(SUM(final_amount), 0) s FROM orders WHERE status = 'paid' AND paid_at >= ? AND paid_at < ?").get(iso(dayStart), iso(dayEnd)).s;
    const cost = costInRange(db, dayStart, dayEnd);
    if (rev >= cost) return false;
  }
  return true;
}

export function logAiUsage(db, { userId = null, feature, tokens, costUsd, now }) {
  if (!feature || !Number.isInteger(tokens) || tokens < 0 || !Number.isFinite(costUsd) || costUsd < 0) throw new P567Error('INVALID_INPUT', 'Thông tin sử dụng AI không hợp lệ.');
  db.prepare('INSERT INTO ai_usage_logs (user_id, feature, tokens, cost_usd, created_at) VALUES (?, ?, ?, ?, ?)').run(userId, String(feature).slice(0, 100), tokens, costUsd, now);
  return { ok: true };
}

export function aiCostReport(db, { from, to, fxVndPerUsd = 26000 }) {
  const rows = db.prepare('SELECT feature, SUM(tokens) tokens, SUM(cost_usd) usd FROM ai_usage_logs WHERE created_at >= ? AND created_at < ? GROUP BY feature').all(from, to);
  const usd = rows.reduce((s, r) => s + r.usd, 0);
  return { totalUsd: Math.round(usd * 10000) / 10000, totalVnd: Math.round(usd * fxVndPerUsd), fxVndPerUsd, byFeature: rows.map(r => ({ feature: r.feature, tokens: r.tokens, usd: Math.round(r.usd * 10000) / 10000 })) };
}
