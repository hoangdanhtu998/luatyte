// Route HTTP cho Phase 2. app.mjs gọi handle(req, res, url); trả true nếu đã xử lý.
import { BillingError, createPlan, updatePlan, deletePlan, listPlans, createDiscount, updateDiscount, listDiscounts, computeDiscount, getPlan, createOrder, handleCallback, getActiveSubscription, grantSubscription, runRenewalReminders } from './billing.mjs';
import { processQueue } from './mail.mjs';

export function createBillingRoutes({ db, now, gateways, helpers }) {
  const { sessionOf, requireAdmin, readBody, send, err } = helpers;

  function fail(res, e) {
    if (e instanceof BillingError) return err(res, e.status, e.code, e.message);
    throw e;
  }

  return async function handle(req, res, url) {
    const p = url.pathname;
    const m = req.method;
    try {
      // ---- Gói cước ----
      if (p === '/api/plans' && m === 'GET') {
        return send(res, 200, { plans: listPlans(db, { publicOnly: true }) }), true;
      }
      if (p === '/api/admin/plans' && m === 'GET') {
        if (!requireAdmin(req, res)) return true;
        return send(res, 200, { plans: listPlans(db) }), true;
      }
      if (p === '/api/admin/plans' && m === 'POST') {
        const s = requireAdmin(req, res);
        if (!s) return true;
        const body = await readBody(req);
        const plan = createPlan(db, body, now());
        helpers.audit(req, s, { action: 'CREATE', entity: 'Plan', entityId: plan.id, newValue: plan });
        return send(res, 201, { plan }), true;
      }
      const planM = p.match(/^\/api\/admin\/plans\/(\d+)$/);
      if (planM) {
        const id = Number(planM[1]);
        const s = requireAdmin(req, res);
        if (!s) return true;
        if (m === 'PUT') {
          const before = getPlan(db, id);
          const body = await readBody(req);
          const plan = updatePlan(db, id, body, now());
          helpers.audit(req, s, { action: 'UPDATE', entity: 'Plan', entityId: id, oldValue: before, newValue: plan });
          return send(res, 200, { plan }), true;
        }
        if (m === 'DELETE') {
          const before = getPlan(db, id);
          deletePlan(db, id, now());
          helpers.audit(req, s, { action: 'DELETE', entity: 'Plan', entityId: id, oldValue: before });
          return send(res, 200, { ok: true }), true;
        }
      }

      // ---- Mã giảm giá ----
      if (p === '/api/admin/discount-codes' && m === 'GET') {
        if (!requireAdmin(req, res)) return true;
        return send(res, 200, { codes: listDiscounts(db) }), true;
      }
      if (p === '/api/admin/discount-codes' && m === 'POST') {
        const s = requireAdmin(req, res);
        if (!s) return true;
        const body = await readBody(req);
        const code = createDiscount(db, body, now());
        helpers.audit(req, s, { action: 'CREATE', entity: 'DiscountCode', entityId: code.id, newValue: code });
        return send(res, 201, { code }), true;
      }
      const dm = p.match(/^\/api\/admin\/discount-codes\/(\d+)$/);
      if (dm && m === 'PUT') {
        const s = requireAdmin(req, res);
        if (!s) return true;
        const body = await readBody(req);
        const before = listDiscounts(db).find(c => c.id === Number(dm[1]));
        const code = updateDiscount(db, Number(dm[1]), body);
        helpers.audit(req, s, { action: 'UPDATE', entity: 'DiscountCode', entityId: code.id, oldValue: before, newValue: code });
        return send(res, 200, { code }), true;
      }

      // ---- Thanh toán (người dùng đã đăng nhập) ----
      if (p === '/api/payments/apply-discount' && m === 'POST') {
        const s = sessionOf(req);
        if (!s) return err(res, 401, 'UNAUTHENTICATED', 'Chưa đăng nhập.'), true;
        const body = await readBody(req);
        const plan = getPlan(db, Number(body.planId));
        if (!plan) return err(res, 404, 'NOT_FOUND', 'Không tìm thấy gói.'), true;
        const d = computeDiscount(db, body.code, plan, now());
        return send(res, 200, { planPrice: plan.price, discountAmount: d.discountAmount, finalAmount: d.finalAmount }), true;
      }
      if (p === '/api/payments/create' && m === 'POST') {
        const s = sessionOf(req);
        if (!s) return err(res, 401, 'UNAUTHENTICATED', 'Chưa đăng nhập.'), true;
        const body = await readBody(req);
        const order = await createOrder(db, { userId: s.user_id, planId: Number(body.planId), gateway: body.gateway, code: body.code }, now(), gateways);
        return send(res, 201, order), true;
      }
      const cb = p.match(/^\/api\/payments\/callback\/([a-z-]+)$/);
      if (cb && m === 'POST') {
        const body = await readBody(req);
        const result = await handleCallback(db, cb[1], body, now(), gateways);
        return send(res, result.ok ? 200 : 400, result), true;
      }
      if (p === '/api/subscriptions/me' && m === 'GET') {
        const s = sessionOf(req);
        if (!s) return err(res, 401, 'UNAUTHENTICATED', 'Chưa đăng nhập.'), true;
        const u = db.prepare('SELECT role FROM users WHERE id = ?').get(s.user_id);
        // Admin luôn có quyền cao nhất, không phụ thuộc gói.
        if (u && u.role === 'admin') return send(res, 200, { tier: 'admin', subscription: null }), true;
        const sub = getActiveSubscription(db, s.user_id, now());
        return send(res, 200, { tier: sub ? 'plan' : 'free', subscription: sub ? { planId: sub.plan_id, startsAt: sub.starts_at, endsAt: sub.ends_at } : null }), true;
      }

      // ---- Cấp / thu hồi gói thủ công theo email (admin) ----
      if (p === '/api/admin/subscriptions' && m === 'GET') {
        if (!requireAdmin(req, res)) return true;
        const email = (url.searchParams.get('email') || '').trim().toLowerCase();
        const user = db.prepare('SELECT id, email, role, status FROM users WHERE email = ?').get(email);
        if (!user) return err(res, 404, 'NOT_FOUND', 'Không tìm thấy tài khoản với email này.'), true;
        const sub = getActiveSubscription(db, user.id, now());
        const plan = sub ? db.prepare('SELECT id, name FROM plans WHERE id = ?').get(sub.plan_id) : null;
        return send(res, 200, { user: { id: user.id, email: user.email, role: user.role, status: user.status },
          subscription: sub ? { planId: sub.plan_id, planName: plan ? plan.name : null, startsAt: sub.starts_at, endsAt: sub.ends_at } : null }), true;
      }
      if (p === '/api/admin/subscriptions/grant' && m === 'POST') {
        const s = requireAdmin(req, res);
        if (!s) return true;
        const body = await readBody(req);
        const email = String(body.email || '').trim().toLowerCase();
        const user = db.prepare('SELECT id, email FROM users WHERE email = ?').get(email);
        if (!user) return err(res, 404, 'NOT_FOUND', 'Không tìm thấy tài khoản với email này.'), true;
        const plan = getPlan(db, Number(body.planId));
        if (!plan) return err(res, 404, 'NOT_FOUND', 'Không tìm thấy gói.'), true;
        const before = getActiveSubscription(db, user.id, now());
        grantSubscription(db, user.id, plan.id, now());
        helpers.audit(req, s, { action: 'GRANT', entity: 'Subscription', entityId: user.id, oldValue: before ? { planId: before.plan_id } : null, newValue: { planId: plan.id, planName: plan.name } });
        return send(res, 201, { ok: true, email: user.email, planName: plan.name }), true;
      }
      if (p === '/api/admin/subscriptions/revoke' && m === 'POST') {
        const s = requireAdmin(req, res);
        if (!s) return true;
        const body = await readBody(req);
        const email = String(body.email || '').trim().toLowerCase();
        const user = db.prepare('SELECT id, email FROM users WHERE email = ?').get(email);
        if (!user) return err(res, 404, 'NOT_FOUND', 'Không tìm thấy tài khoản với email này.'), true;
        const r = db.prepare("UPDATE subscriptions SET status = 'expired' WHERE user_id = ? AND status = 'active'").run(user.id);
        helpers.audit(req, s, { action: 'REVOKE', entity: 'Subscription', entityId: user.id, newValue: { revoked: Number(r.changes) } });
        return send(res, 200, { ok: true, revoked: Number(r.changes) }), true;
      }

      // ---- Việc chạy nền (chạy thủ công từ admin) ----
      if (p === '/api/admin/jobs/run/subscription-reminder' && m === 'POST') {
        if (!requireAdmin(req, res)) return true;
        return send(res, 200, runRenewalReminders(db, now())), true;
      }
      if (p === '/api/admin/jobs/run/email-queue' && m === 'POST') {
        if (!requireAdmin(req, res)) return true;
        if (!helpers.sendEmail) return err(res, 503, 'EMAIL_NOT_CONFIGURED', 'Chưa cấu hình gửi email.'), true;
        return send(res, 200, await processQueue(db, now(), helpers.sendEmail)), true;
      }
    } catch (e) {
      return fail(res, e), true;
    }
    return false;
  };
}
