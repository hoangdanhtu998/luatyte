// Route HTTP cho Phase 3 (email) và Phase 4 (nhật ký). app.mjs gọi handle(req, res, url); trả true nếu đã xử lý.
import { getEmailConfig, saveEmailConfig, sendTestEmail, listEmailQueue, retryEmail, listLoginLogs, listAudit, OpsError, processQueue } from './ops.mjs';

export function createOpsRoutes({ db, now, helpers }) {
  const { requireAdmin, readBody, send, err, sendEmail, cryptoKey } = helpers;

  return async function handle(req, res, url) {
    const p = url.pathname;
    const m = req.method;
    try {
      // ---- Cấu hình email (V3.1) ----
      if (p === '/api/admin/settings/email-config' && m === 'GET') {
        if (!requireAdmin(req, res)) return true;
        return send(res, 200, { config: getEmailConfig(db, cryptoKey) }), true;
      }
      if (p === '/api/admin/settings/email-config' && m === 'PUT') {
        const s = requireAdmin(req, res);
        if (!s) return true;
        const body = await readBody(req);
        const before = getEmailConfig(db, cryptoKey);
        const config = saveEmailConfig(db, body, now(), cryptoKey);
        helpers.audit(req, s, { action: 'UPDATE', entity: 'Setting.email', entityId: 'email.config', oldValue: { ...before, password: '***' }, newValue: { ...config, password: '***' }, now: now() });
        return send(res, 200, { config }), true;
      }
      if (p === '/api/admin/settings/email-config/test' && m === 'POST') {
        if (!requireAdmin(req, res)) return true;
        const body = await readBody(req);
        if (!sendEmail) return send(res, 503, { success: false, error: { code: 'EMAIL_NOT_CONFIGURED', message: 'Chưa cấu hình gửi email.' } }), true;
        return send(res, 200, await sendTestEmail(sendEmail, body.to, body.subject, body.body)), true;
      }

      // ---- Hàng đợi email (V3.2) ----
      if (p === '/api/admin/email-queue' && m === 'GET') {
        if (!requireAdmin(req, res)) return true;
        const status = url.searchParams.get('status') || undefined;
        const limit = Number(url.searchParams.get('limit') || 50);
        const offset = Number(url.searchParams.get('offset') || 0);
        return send(res, 200, { items: listEmailQueue(db, { status, limit, offset }) }), true;
      }
      const rm = p.match(/^\/api\/admin\/email-queue\/(\d+)\/retry$/);
      if (rm && m === 'POST') {
        const s = requireAdmin(req, res);
        if (!s) return true;
        const r = retryEmail(db, Number(rm[1]), now());
        helpers.audit(req, s, { action: 'RETRY', entity: 'EmailQueue', entityId: rm[1], now: now() });
        return send(res, 200, r), true;
      }
      if (p === '/api/admin/jobs/run/email-queue' && m === 'POST') {
        if (!requireAdmin(req, res)) return true;
        if (!sendEmail) return err(res, 503, 'EMAIL_NOT_CONFIGURED', 'Chưa cấu hình gửi email.'), true;
        return send(res, 200, await processQueue(db, now(), sendEmail)), true;
      }

      // ---- Nhật ký (V4.1, V4.2) ----
      if (p === '/api/admin/login-logs' && m === 'GET') {
        if (!requireAdmin(req, res)) return true;
        const q = url.searchParams;
        const logs = listLoginLogs(db, {
          userId: q.get('userId') ? Number(q.get('userId')) : undefined,
          ip: q.get('ip') || undefined,
          from: q.get('from') ? Date.parse(q.get('from')) : undefined,
          to: q.get('to') ? Date.parse(q.get('to')) : undefined,
          limit: Number(q.get('take') || 50), offset: Number(q.get('skip') || 0),
        });
        return send(res, 200, { items: logs }), true;
      }
      if (p === '/api/admin/audit-logs' && m === 'GET') {
        if (!requireAdmin(req, res)) return true;
        const q = url.searchParams;
        return send(res, 200, { items: listAudit(db, { limit: Number(q.get('take') || 50), offset: Number(q.get('skip') || 0) }) }), true;
      }
    } catch (e) {
      if (e instanceof OpsError) return err(res, e.status, e.code, e.message), true;
      throw e;
    }
    return false;
  };
}
