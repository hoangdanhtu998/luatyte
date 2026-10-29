// Quản lý người dùng: danh sách có lọc, chi tiết hồ sơ, lịch sử đăng nhập/gói/đồng ý, sửa hồ sơ, ẩn danh.
// Các thao tác khóa, đổi vai trò, đặt lại mật khẩu, xuất dữ liệu, cấp/thu hồi gói dùng route sẵn có.
import { anonymizeUser } from './phase567.mjs';
import { dayKey } from './access.mjs';
import { toCsv, sendCsv } from './csv.mjs';

const USERNAME_RE = /^[A-Za-z0-9_.]{3,30}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class PeopleError extends Error {
  constructor(code, message, status = 400) { super(message); this.code = code; this.status = status; }
}

const likeOf = s => `%${String(s).replace(/[%_]/g, m => '\\' + m)}%`;

const ACTIVE_PLAN_SQL = `SELECT p.name FROM subscriptions s JOIN plans p ON p.id = s.plan_id
  WHERE s.user_id = u.id AND s.status = 'active' AND (s.ends_at IS NULL OR s.ends_at > ?)
  ORDER BY s.id DESC LIMIT 1`;

function personDto(r) {
  return {
    id: r.id, email: r.email, username: r.username, name: r.name, role: r.role, status: r.status,
    totpEnabled: !!r.totp_enabled, createdAt: r.created_at,
    lastLoginAt: r.last_login_at, lastIp: r.last_ip, registerIp: r.register_ip,
    plan: r.plan_name ? { name: r.plan_name } : null,
  };
}

export function createPeopleRoutes({ db, now, helpers }) {
  const { requireAdmin, readBody, send, err, audit } = helpers;

  function listPeople({ q, role, status, plan, limit, offset }, t) {
    const where = ['1 = 1'];
    const params = [];
    if (q) { where.push("(u.email LIKE ? ESCAPE '\\' OR u.username LIKE ? ESCAPE '\\' OR u.name LIKE ? ESCAPE '\\')"); params.push(likeOf(q), likeOf(q), likeOf(q)); }
    if (role) { where.push('u.role = ?'); params.push(role); }
    if (status) { where.push('u.status = ?'); params.push(status); }
    if (plan === 'paid') where.push(`EXISTS (SELECT 1 FROM subscriptions s WHERE s.user_id = u.id AND s.status = 'active' AND (s.ends_at IS NULL OR s.ends_at > ?))`), params.push(t);
    if (plan === 'free') where.push(`NOT EXISTS (SELECT 1 FROM subscriptions s WHERE s.user_id = u.id AND s.status = 'active' AND (s.ends_at IS NULL OR s.ends_at > ?))`), params.push(t);
    const whereSql = where.join(' AND ');
    const total = db.prepare(`SELECT COUNT(*) AS n FROM users u WHERE ${whereSql}`).get(...params).n;
    const rows = db.prepare(`SELECT u.id, u.email, u.username, u.name, u.role, u.status, u.totp_enabled, u.created_at,
        (SELECT MAX(logged_at) FROM login_logs l WHERE l.user_id = u.id AND l.success = 1) AS last_login_at,
        (SELECT ip FROM login_logs l WHERE l.user_id = u.id AND l.success = 1 ORDER BY id DESC LIMIT 1) AS last_ip,
        (SELECT ip FROM consents c WHERE c.user_id = u.id ORDER BY id ASC LIMIT 1) AS register_ip,
        (${ACTIVE_PLAN_SQL}) AS plan_name
      FROM users u WHERE ${whereSql} ORDER BY u.id DESC LIMIT ? OFFSET ?`).all(t, ...params, limit, offset);
    return { total, items: rows.map(personDto) };
  }

  function personDetail(id, t) {
    const u = db.prepare(`SELECT u.id, u.email, u.username, u.name, u.role, u.status, u.totp_enabled, u.created_at,
        (SELECT MAX(logged_at) FROM login_logs l WHERE l.user_id = u.id AND l.success = 1) AS last_login_at,
        (SELECT ip FROM login_logs l WHERE l.user_id = u.id AND l.success = 1 ORDER BY id DESC LIMIT 1) AS last_ip,
        (SELECT ip FROM consents c WHERE c.user_id = u.id ORDER BY id ASC LIMIT 1) AS register_ip,
        (${ACTIVE_PLAN_SQL}) AS plan_name
      FROM users u WHERE u.id = ?`).get(t, id);
    if (!u) return null;
    const subscriptions = db.prepare(`SELECT s.id, p.name AS planName, s.starts_at, s.ends_at, s.status
      FROM subscriptions s JOIN plans p ON p.id = s.plan_id WHERE s.user_id = ? ORDER BY s.id DESC LIMIT 50`).all(id)
      .map(s => ({ id: s.id, planName: s.planName, startsAt: s.starts_at, endsAt: s.ends_at, status: s.status }));
    const logins = db.prepare(`SELECT ip, user_agent, success, failed_reason, logged_at FROM login_logs
      WHERE user_id = ? ORDER BY id DESC LIMIT 30`).all(id)
      .map(l => ({ ip: l.ip, userAgent: l.user_agent, success: !!l.success, failedReason: l.failed_reason, loggedAt: l.logged_at }));
    const consents = db.prepare('SELECT type, version, agreed_at, ip FROM consents WHERE user_id = ? ORDER BY id DESC LIMIT 30').all(id)
      .map(c => ({ type: c.type, version: c.version, agreedAt: c.agreed_at, ip: c.ip }));
    const orders = db.prepare(`SELECT o.final_amount, o.gateway, o.status, o.created_at, p.name AS planName
      FROM orders o JOIN plans p ON p.id = o.plan_id WHERE o.user_id = ? ORDER BY o.id DESC LIMIT 20`).all(id)
      .map(o => ({ planName: o.planName, amount: o.final_amount, gateway: o.gateway, status: o.status, createdAt: o.created_at }));
    const chat = db.prepare('SELECT count FROM chat_usage WHERE user_id = ? AND day = ?').get(id, dayKey(t));
    return { person: personDto(u), subscriptions, logins, consents, orders, chatToday: chat ? chat.count : 0 };
  }

  return async function handle(req, res, url) {
    const p = url.pathname;
    const m = req.method;
    try {
      if (p === '/api/admin/users.csv' && m === 'GET') {
        const s = requireAdmin(req, res);
        if (!s) return true;
        const sp = url.searchParams;
        const r = listPeople({
          q: (sp.get('q') || '').trim().slice(0, 100), role: sp.get('role') || '', status: sp.get('status') || '', plan: sp.get('plan') || '',
          limit: 100000, offset: 0,
        }, now());
        const csv = toCsv(r.items, [
          { label: 'Tên đăng nhập', key: 'username' },
          { label: 'Họ tên', key: 'name' },
          { label: 'Email', key: 'email' },
          { label: 'Vai trò', key: 'role' },
          { label: 'Trạng thái', key: 'status' },
          { label: 'Gói', value: u => (u.plan ? u.plan.name : '') },
          { label: 'Đăng nhập gần nhất', value: u => (u.lastLoginAt ? new Date(u.lastLoginAt).toISOString() : '') },
          { label: 'IP gần nhất', key: 'lastIp' },
          { label: 'Tạo lúc', key: 'createdAt' },
        ]);
        audit(req, s, { action: 'EXPORT', entity: 'User.csv', entityId: r.items.length, now: now() });
        return sendCsv(res, `nguoi-dung-${new Date(now()).toISOString().slice(0, 10)}.csv`, csv), true;
      }

      if (p === '/api/admin/people' && m === 'GET') {
        if (!requireAdmin(req, res)) return true;
        const sp = url.searchParams;
        const limit = Math.min(Math.max(Number(sp.get('limit') || 25), 1), 100);
        const page = Math.max(Number(sp.get('page') || 1), 1);
        const r = listPeople({
          q: (sp.get('q') || '').trim().slice(0, 100), role: sp.get('role') || '', status: sp.get('status') || '', plan: sp.get('plan') || '',
          limit, offset: (page - 1) * limit,
        }, now());
        return send(res, 200, { ...r, page, limit }), true;
      }

      const pm = p.match(/^\/api\/admin\/people\/(\d+)$/);
      if (pm) {
        const id = Number(pm[1]);
        const s = requireAdmin(req, res);
        if (!s) return true;
        const exists = db.prepare('SELECT id FROM users WHERE id = ?').get(id);
        if (!exists) return err(res, 404, 'NOT_FOUND', 'Không tìm thấy người dùng.'), true;
        if (m === 'GET') return send(res, 200, personDetail(id, now())), true;
        if (m === 'PUT') {
          const body = await readBody(req);
          const before = db.prepare('SELECT email, username, name FROM users WHERE id = ?').get(id);
          const next = {
            email: body.email !== undefined ? String(body.email).trim().toLowerCase() : before.email,
            username: body.username !== undefined ? String(body.username).trim() : before.username,
            name: body.name !== undefined ? String(body.name).trim().slice(0, 100) : before.name,
          };
          if (!EMAIL_RE.test(next.email)) return err(res, 400, 'INVALID_EMAIL', 'Email không hợp lệ.'), true;
          if (next.username && !USERNAME_RE.test(next.username)) return err(res, 400, 'INVALID_USERNAME', 'Tên đăng nhập 3 đến 30 ký tự: chữ, số, _ hoặc .'), true;
          if (db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(next.email, id)) return err(res, 409, 'EMAIL_TAKEN', 'Email này đã có tài khoản khác.'), true;
          if (next.username && db.prepare('SELECT id FROM users WHERE username = ? COLLATE NOCASE AND id != ?').get(next.username, id)) return err(res, 409, 'USERNAME_TAKEN', 'Tên đăng nhập này đã có người dùng khác.'), true;
          db.prepare('UPDATE users SET email = ?, username = ?, name = ? WHERE id = ?').run(next.email, next.username || null, next.name, id);
          audit(req, s, { action: 'UPDATE', entity: 'User.profile', entityId: id, oldValue: before, newValue: next });
          return send(res, 200, personDetail(id, now())), true;
        }
      }

      const am = p.match(/^\/api\/admin\/people\/(\d+)\/anonymize$/);
      if (am && m === 'POST') {
        const s = requireAdmin(req, res);
        if (!s) return true;
        const body = await readBody(req);
        if (body.confirm !== 'XOA') return err(res, 400, 'CONFIRM_REQUIRED', 'Gõ XOA để xác nhận ẩn danh tài khoản.'), true;
        const id = Number(am[1]);
        if (id === s.user_id) return err(res, 400, 'SELF_ANONYMIZE', 'Không tự ẩn danh tài khoản đang dùng.'), true;
        const r = anonymizeUser(db, id, now());
        audit(req, s, { action: 'ANONYMIZE', entity: 'User', entityId: id, now: now() });
        return send(res, 200, r), true;
      }
    } catch (e) {
      if (e instanceof PeopleError) return err(res, e.status, e.code, e.message), true;
      throw e;
    }
    return false;
  };
}
