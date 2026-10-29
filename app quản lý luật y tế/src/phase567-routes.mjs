// Route HTTP cho Phase 5, 6, 7. app.mjs gọi handle(req, res, url); trả true nếu đã xử lý.
import * as P from './phase567.mjs';
import { toCsv, sendCsv } from './csv.mjs';

export function createP567Routes({ db, now, helpers }) {
  const { sessionOf, requireAdmin, readBody, send, err, audit, backupDir, fxVndPerUsd } = helpers;
  const range = url => {
    const to = url.searchParams.get('to') ? Date.parse(url.searchParams.get('to')) : now();
    const from = url.searchParams.get('from') ? Date.parse(url.searchParams.get('from')) : to - 30 * 24 * 60 * 60 * 1000;
    if (Number.isNaN(from) || Number.isNaN(to) || to <= from) throw new P.P567Error('INVALID_INPUT', 'Khoảng thời gian không hợp lệ.');
    return { from, to };
  };

  return async function handle(req, res, url) {
    const p = url.pathname;
    const m = req.method;
    try {
      // ---- Phase 5 ----
      if (p === '/api/admin/overview' && m === 'GET') {
        if (!requireAdmin(req, res)) return true;
        return send(res, 200, P.overview(db, now())), true;
      }
      if (p === '/api/admin/backups' && m === 'GET') {
        if (!requireAdmin(req, res)) return true;
        return send(res, 200, { items: P.listBackups(backupDir()) }), true;
      }
      if ((p === '/api/admin/backups' || p === '/api/admin/jobs/run/backup') && m === 'POST') {
        const s = requireAdmin(req, res);
        if (!s) return true;
        const r = P.createBackup(db, backupDir(), now());
        audit(req, s, { action: 'BACKUP', entity: 'Database', entityId: r.name, now: now() });
        return send(res, 200, r), true;
      }
      if (p === '/api/admin/alerts' && m === 'GET') {
        if (!requireAdmin(req, res)) return true;
        return send(res, 200, { items: P.listAlerts(db, { resolved: url.searchParams.get('resolved') === 'true' }) }), true;
      }
      const alM = p.match(/^\/api\/admin\/alerts\/(\d+)\/resolve$/);
      if (alM && m === 'POST') {
        const s = requireAdmin(req, res);
        if (!s) return true;
        return send(res, 200, P.resolveAlert(db, Number(alM[1]), now())), true;
      }

      // ---- Phase 6: nội dung luật ----
      if (p === '/api/admin/content/categories' && m === 'POST') {
        if (!requireAdmin(req, res)) return true;
        return send(res, 201, P.createCategory(db, await readBody(req))), true;
      }
      if (p === '/api/admin/content/articles' && m === 'POST') {
        if (!requireAdmin(req, res)) return true;
        return send(res, 201, { article: P.createArticle(db, await readBody(req), now()) }), true;
      }
      const artM = p.match(/^\/api\/admin\/content\/articles\/(\d+)$/);
      if (artM) {
        const id = Number(artM[1]);
        if (!requireAdmin(req, res)) return true;
        if (m === 'PUT') return send(res, 200, { article: P.updateArticle(db, id, await readBody(req), now()) }), true;
        if (m === 'DELETE') return send(res, 200, P.deleteArticle(db, id)), true;
      }
      if (p === '/api/admin/content/news' && m === 'POST') {
        if (!requireAdmin(req, res)) return true;
        return send(res, 201, P.createNews(db, await readBody(req), now())), true;
      }
      if (p === '/api/admin/content/export' && m === 'GET') {
        if (!requireAdmin(req, res)) return true;
        return send(res, 200, P.exportLawContent(db)), true;
      }
      const legalM = p.match(/^\/api\/legal\/(terms|privacy)$/);
      if (legalM && m === 'GET') {
        return send(res, 200, P.getLegal(db, legalM[1])), true;
      }
      const legalAdmin = p.match(/^\/api\/admin\/content\/legal\/(terms|privacy)$/);
      if (legalAdmin && m === 'PUT') {
        const s = requireAdmin(req, res);
        if (!s) return true;
        const body = await readBody(req);
        P.setLegal(db, legalAdmin[1], body.text, now());
        audit(req, s, { action: 'UPDATE', entity: 'LegalPage', entityId: legalAdmin[1], now: now() });
        return send(res, 200, { ok: true }), true;
      }

      // ---- Phase 6: xuất và xóa dữ liệu cá nhân ----
      if (p === '/api/me/export' && m === 'GET') {
        const s = sessionOf(req);
        if (!s) return err(res, 401, 'UNAUTHENTICATED', 'Chưa đăng nhập.'), true;
        return send(res, 200, P.exportUserData(db, s.user_id), { 'content-disposition': 'attachment; filename="du-lieu-cua-toi.json"' }), true;
      }
      if (p === '/api/me/data' && m === 'DELETE') {
        const s = sessionOf(req);
        if (!s) return err(res, 401, 'UNAUTHENTICATED', 'Chưa đăng nhập.'), true;
        const r = P.anonymizeUser(db, s.user_id, now());
        return send(res, 200, r, { 'set-cookie': 'lyt_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0' }), true;
      }
      const dexM = p.match(/^\/api\/admin\/users\/(\d+)\/data-export$/);
      if (dexM && m === 'GET') {
        const s = requireAdmin(req, res);
        if (!s) return true;
        const r = P.exportUserData(db, Number(dexM[1]));
        audit(req, s, { action: 'EXPORT', entity: 'UserData', entityId: dexM[1], now: now() });
        return send(res, 200, r), true;
      }

      // ---- Phase 7: báo cáo tài chính ----
      if (p === '/api/admin/reports/revenue' && m === 'GET') {
        if (!requireAdmin(req, res)) return true;
        const { from, to } = range(url);
        const groupBy = url.searchParams.get('groupBy') || 'day';
        if (!['day', 'month', 'plan', 'gateway'].includes(groupBy)) throw new P.P567Error('INVALID_INPUT', 'groupBy phải là day, month, plan hoặc gateway.');
        return send(res, 200, P.revenueReport(db, { from, to, groupBy })), true;
      }
      if (p === '/api/admin/reports/revenue.csv' && m === 'GET') {
        if (!requireAdmin(req, res)) return true;
        const { from, to } = range(url);
        const groupBy = url.searchParams.get('groupBy') || 'day';
        if (!['day', 'month', 'plan', 'gateway'].includes(groupBy)) throw new P.P567Error('INVALID_INPUT', 'groupBy phải là day, month, plan hoặc gateway.');
        const rep = P.revenueReport(db, { from, to, groupBy });
        const rows = groupBy === 'plan' ? rep.byPlan : groupBy === 'gateway' ? rep.byGateway : rep.byPeriod;
        const key = groupBy === 'plan' ? 'planName' : groupBy === 'gateway' ? 'gateway' : 'period';
        const head = groupBy === 'plan' ? 'Gói' : groupBy === 'gateway' ? 'Cổng thanh toán' : groupBy === 'month' ? 'Tháng' : 'Ngày';
        const out = rows.map(r => ({ label: r[key], revenue: r.revenue }));
        out.push({ label: 'TỔNG', revenue: rep.totalRevenue });
        const csv = toCsv(out, [{ label: head, key: 'label' }, { label: 'Doanh thu (VND)', key: 'revenue' }]);
        return sendCsv(res, `doanh-thu-${groupBy}-${new Date(now()).toISOString().slice(0, 10)}.csv`, csv), true;
      }
      if (p === '/api/admin/costs' && m === 'GET') {
        if (!requireAdmin(req, res)) return true;
        return send(res, 200, { items: P.listCosts(db) }), true;
      }
      if (p === '/api/admin/costs' && m === 'POST') {
        const s = requireAdmin(req, res);
        if (!s) return true;
        const r = P.createCost(db, await readBody(req));
        audit(req, s, { action: 'CREATE', entity: 'CostItem', entityId: r.id, now: now() });
        return send(res, 201, r), true;
      }
      if (p === '/api/admin/reports/profit' && m === 'GET') {
        if (!requireAdmin(req, res)) return true;
        return send(res, 200, P.profitReport(db, range(url))), true;
      }
      if (p === '/api/admin/ai-usage' && m === 'POST') {
        if (!requireAdmin(req, res)) return true;
        const body = await readBody(req);
        return send(res, 201, P.logAiUsage(db, { userId: body.userId ?? null, feature: body.feature, tokens: body.tokens, costUsd: body.costUsd, now: now() })), true;
      }
      if (p === '/api/admin/reports/ai-cost' && m === 'GET') {
        if (!requireAdmin(req, res)) return true;
        return send(res, 200, P.aiCostReport(db, { ...range(url), fxVndPerUsd: fxVndPerUsd() })), true;
      }
    } catch (e) {
      if (e instanceof P.P567Error) return err(res, e.status, e.code, e.message), true;
      throw e;
    }
    return false;
  };
}
