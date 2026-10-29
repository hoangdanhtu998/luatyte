// Route cho quyền theo gói: xem quyền hiện tại, trừ lượt chat, và nội dung luật đã cắt theo gói.
import { getActiveSubscription } from './billing.mjs';
import { entitlementsFor, consumeChat, chatStatus, truncateLines } from './access.mjs';

export function createAccessRoutes({ db, now, helpers }) {
  const { sessionOf, send, err } = helpers;

  return async function handle(req, res, url) {
    const p = url.pathname;
    const m = req.method;

    if (p === '/api/me/entitlements' && m === 'GET') {
      const s = sessionOf(req);
      const uid = s ? s.user_id : null;
      const sub = uid ? getActiveSubscription(db, uid, now()) : null;
      const ent = entitlementsFor(db, uid, now(), sub);
      const chat = uid ? chatStatus(db, uid, ent.features, now()) : { used: 0, limit: ent.features.chatDailyLimit, remaining: ent.features.chatDailyLimit };
      return send(res, 200, { tier: ent.tier, features: ent.features, chat }), true;
    }

    // Mỗi lượt chat gọi endpoint này trước; hết lượt thì trả 429 và không xử lý tiếp.
    if (p === '/api/chat/consume' && m === 'POST') {
      const s = sessionOf(req);
      if (!s) return err(res, 401, 'UNAUTHENTICATED', 'Cần đăng nhập để dùng chat.'), true;
      const sub = getActiveSubscription(db, s.user_id, now());
      const ent = entitlementsFor(db, s.user_id, now(), sub);
      const r = consumeChat(db, s.user_id, ent.features, now());
      if (!r.allowed) {
        return send(res, 429, { error: { code: 'QUOTA_EXCEEDED', message: `Bạn đã dùng hết ${r.limit} lượt chat hôm nay. Nâng cấp gói để dùng thêm.` }, chat: r }), true;
      }
      return send(res, 200, { ok: true, chat: r }), true;
    }

    // Nội dung luật: chỉ trả điều đã đối chiếu, cắt theo số dòng được xem của gói.
    const art = p.match(/^\/api\/law\/articles\/(\d+)$/);
    if (art && m === 'GET') {
      const s = sessionOf(req);
      const sub = s ? getActiveSubscription(db, s.user_id, now()) : null;
      const ent = entitlementsFor(db, s ? s.user_id : null, now(), sub);
      const row = db.prepare('SELECT id, number, title, content, is_verified FROM law_articles WHERE id = ?').get(Number(art[1]));
      if (!row || !row.is_verified) return err(res, 404, 'NOT_FOUND', 'Không tìm thấy điều luật.'), true;
      const cut = truncateLines(row.content, ent.features.lawVisibleLines);
      return send(res, 200, { id: row.id, number: row.number, title: row.title, content: cut.text,
        totalLines: cut.totalLines, shownLines: cut.shownLines, truncated: cut.truncated, tier: ent.tier }), true;
    }
    return false;
  };
}
