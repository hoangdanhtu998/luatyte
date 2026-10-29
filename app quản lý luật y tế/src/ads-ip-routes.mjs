// Quảng cáo tự quản, ghi nhận IP truy cập, và thống kê IP cho admin.
import { entitlementsFor } from './access.mjs';
import { getActiveSubscription } from './billing.mjs';

const PLACEMENTS = ['banner-top', 'inline', 'sidebar'];
const VN_OFFSET_MS = 7 * 60 * 60 * 1000;
const dayOf = t => new Date(t + VN_OFFSET_MS).toISOString().slice(0, 10);

export class AdError extends Error {
  constructor(code, message, status = 400) { super(message); this.code = code; this.status = status; }
}

function cleanUrl(v, label) {
  const s = String(v ?? '').trim();
  if (!s) return '';
  if (s.length > 500) throw new AdError('INVALID_INPUT', `${label} quá dài.`);
  if (!/^https?:\/\//i.test(s)) throw new AdError('INVALID_INPUT', `${label} phải bắt đầu bằng http:// hoặc https://.`);
  return s;
}

export function validateAd(b, partial = false) {
  const out = {};
  if (!partial || b.placement !== undefined) {
    if (!PLACEMENTS.includes(b.placement)) throw new AdError('INVALID_INPUT', `Vị trí quảng cáo phải là một trong: ${PLACEMENTS.join(', ')}.`);
    out.placement = b.placement;
  }
  if (!partial || b.title !== undefined) {
    const t = String(b.title ?? '').trim();
    if (!t || t.length > 120) throw new AdError('INVALID_INPUT', 'Tiêu đề quảng cáo từ 1 đến 120 ký tự.');
    out.title = t;
  }
  if (b.body !== undefined) {
    const t = String(b.body ?? '').trim();
    if (t.length > 500) throw new AdError('INVALID_INPUT', 'Nội dung quảng cáo tối đa 500 ký tự.');
    out.body = t;
  }
  if (b.linkUrl !== undefined) out.link_url = cleanUrl(b.linkUrl, 'Link');
  if (b.imageUrl !== undefined) out.image_url = cleanUrl(b.imageUrl, 'Ảnh');
  if (b.active !== undefined) out.active = b.active ? 1 : 0;
  return out;
}

function adDto(r) {
  return { id: r.id, placement: r.placement, title: r.title, body: r.body, linkUrl: r.link_url, imageUrl: r.image_url, active: !!r.active, createdAt: r.created_at };
}

export function createAdsIpRoutes({ db, now, helpers }) {
  const { sessionOf, requireAdmin, readBody, send, err, audit, clientIp } = helpers;

  function fail(res, e) {
    if (e instanceof AdError) return err(res, e.status, e.code, e.message), true;
    throw e;
  }

  return async function handle(req, res, url) {
    const p = url.pathname;
    const m = req.method;
    try {
      // ---- Ghi nhận truy cập theo IP (trang công khai gọi khi mở) ----
      if (p === '/api/public/visit' && m === 'POST') {
        const ip = String(clientIp(req)).slice(0, 64);
        const day = dayOf(now());
        db.prepare(`INSERT INTO ip_visits (day, ip, hits) VALUES (?, ?, 1)
          ON CONFLICT(day, ip) DO UPDATE SET hits = hits + 1`).run(day, ip);
        return send(res, 200, { ok: true }), true;
      }

      // ---- Quảng cáo cho người dùng: gói trả phí không thấy quảng cáo ----
      if (p === '/api/public/ads' && m === 'GET') {
        const s = sessionOf(req);
        const sub = s ? getActiveSubscription(db, s.user_id, now()) : null;
        const ent = entitlementsFor(db, s ? s.user_id : null, now(), sub);
        if (!ent.features.showAds) return send(res, 200, { ads: [] }), true;
        const placement = url.searchParams.get('placement');
        const rows = placement
          ? db.prepare('SELECT * FROM ad_slots WHERE active = 1 AND placement = ? ORDER BY id DESC LIMIT 10').all(placement)
          : db.prepare('SELECT * FROM ad_slots WHERE active = 1 ORDER BY id DESC LIMIT 50').all();
        return send(res, 200, { ads: rows.map(adDto) }), true;
      }

      // ---- Quản lý quảng cáo (admin) ----
      if (p === '/api/admin/ads' && m === 'GET') {
        if (!requireAdmin(req, res)) return true;
        return send(res, 200, { ads: db.prepare('SELECT * FROM ad_slots ORDER BY id DESC').all().map(adDto) }), true;
      }
      if (p === '/api/admin/ads' && m === 'POST') {
        const s = requireAdmin(req, res);
        if (!s) return true;
        const v = validateAd(await readBody(req));
        const info = db.prepare('INSERT INTO ad_slots (placement, title, body, link_url, image_url, active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
          .run(v.placement, v.title, v.body ?? '', v.link_url ?? '', v.image_url ?? '', v.active ?? 1, now());
        audit(req, s, { action: 'CREATE', entity: 'Ad', entityId: Number(info.lastInsertRowid), newValue: v });
        return send(res, 201, { id: Number(info.lastInsertRowid) }), true;
      }
      const am = p.match(/^\/api\/admin\/ads\/(\d+)$/);
      if (am) {
        const id = Number(am[1]);
        const s = requireAdmin(req, res);
        if (!s) return true;
        const before = db.prepare('SELECT * FROM ad_slots WHERE id = ?').get(id);
        if (!before) return err(res, 404, 'NOT_FOUND', 'Không tìm thấy quảng cáo.'), true;
        if (m === 'PUT') {
          const v = validateAd(await readBody(req), true);
          const keys = Object.keys(v);
          if (keys.length) {
            db.prepare(`UPDATE ad_slots SET ${keys.map(k => `${k} = ?`).join(', ')} WHERE id = ?`).run(...keys.map(k => v[k]), id);
          }
          audit(req, s, { action: 'UPDATE', entity: 'Ad', entityId: id, oldValue: adDto(before), newValue: v });
          return send(res, 200, { ok: true }), true;
        }
        if (m === 'DELETE') {
          db.prepare('DELETE FROM ad_slots WHERE id = ?').run(id);
          audit(req, s, { action: 'DELETE', entity: 'Ad', entityId: id, oldValue: adDto(before) });
          return send(res, 200, { ok: true }), true;
        }
      }

      // ---- Thống kê IP (admin) ----
      if (p === '/api/admin/ip-stats' && m === 'GET') {
        if (!requireAdmin(req, res)) return true;
        const days = Math.min(Math.max(Number(url.searchParams.get('days') || 7), 1), 90);
        const since = now() - days * 24 * 60 * 60 * 1000;
        const sinceDay = dayOf(since);
        const daily = db.prepare(`SELECT day, COUNT(*) AS uniqueIps, SUM(hits) AS hits FROM ip_visits
          WHERE day >= ? GROUP BY day ORDER BY day DESC`).all(sinceDay);
        const top = db.prepare(`SELECT ip, SUM(hits) AS hits, MAX(day) AS lastDay FROM ip_visits
          WHERE day >= ? GROUP BY ip ORDER BY hits DESC LIMIT 20`).all(sinceDay);
        // Số tài khoản đã đăng nhập thành công từ từng IP trong khoảng thời gian
        const accounts = db.prepare(`SELECT ip, COUNT(DISTINCT user_id) AS accounts FROM login_logs
          WHERE success = 1 AND logged_at >= ? GROUP BY ip`).all(since);
        const accountsByIp = Object.fromEntries(accounts.map(a => [a.ip, Number(a.accounts)]));
        const totals = db.prepare(`SELECT COUNT(DISTINCT ip) AS uniqueIps, COALESCE(SUM(hits),0) AS hits FROM ip_visits WHERE day >= ?`).get(sinceDay);
        const users = db.prepare('SELECT COUNT(*) AS n FROM users').get().n;
        const active = db.prepare(`SELECT COUNT(DISTINCT user_id) AS n FROM login_logs WHERE success = 1 AND logged_at >= ?`).get(since).n;
        return send(res, 200, {
          days,
          totals: { users, activeAccounts: Number(active), uniqueIps: Number(totals.uniqueIps), hits: Number(totals.hits) },
          daily: daily.map(d => ({ day: d.day, uniqueIps: Number(d.uniqueIps), hits: Number(d.hits) })),
          topIps: top.map(t => ({ ip: t.ip, hits: Number(t.hits), lastDay: t.lastDay, accounts: accountsByIp[t.ip] || 0 })),
        }), true;
      }
    } catch (e) {
      return fail(res, e);
    }
    return false;
  };
}
