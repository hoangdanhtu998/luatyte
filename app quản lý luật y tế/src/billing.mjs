// Phase 2: gói cước, mã giảm giá, đơn hàng, cổng thanh toán (qua interface), gói đang dùng, nhắc gia hạn.
import { enqueue, renderTemplate, signPayload } from './mail.mjs';

export class BillingError extends Error {
  constructor(code, message, status = 400) { super(message); this.code = code; this.status = status; }
}
const DAY = 24 * 60 * 60 * 1000;
const iso = t => new Date(t).toISOString();

// ---------- Gói cước ----------
export function validatePlanInput(p, partial = false) {
  const out = {};
  if (!partial || p.name !== undefined) {
    const name = String(p.name ?? '').trim();
    if (!name || name.length > 100) throw new BillingError('INVALID_INPUT', 'Tên gói phải từ 1 đến 100 ký tự.');
    out.name = name;
  }
  if (!partial || p.durationDays !== undefined) {
    const d = Number(p.durationDays);
    if (!Number.isInteger(d) || (d !== -1 && d < 1) || d > 36500) throw new BillingError('INVALID_INPUT', 'Thời hạn phải là số ngày từ 1 đến 36500, hoặc -1 cho trọn đời.');
    out.durationDays = d;
  }
  if (!partial || p.price !== undefined) {
    const price = Number(p.price);
    if (!Number.isInteger(price) || price < 0 || price > 1_000_000_000) throw new BillingError('INVALID_INPUT', 'Giá phải là số nguyên VND từ 0 trở lên.');
    out.price = price;
  }
  if (!partial || p.features !== undefined) {
    let features = p.features ?? {};
    if (typeof features === 'string') {
      try { features = JSON.parse(features || '{}'); } catch { throw new BillingError('INVALID_INPUT', 'Tính năng phải là JSON hợp lệ.'); }
    }
    if (typeof features !== 'object' || Array.isArray(features) || features === null) throw new BillingError('INVALID_INPUT', 'Tính năng phải là một object JSON.');
    const json = JSON.stringify(features);
    if (json.length > 2000) throw new BillingError('INVALID_INPUT', 'Tính năng quá dài.');
    out.features = json;
  }
  if (p.status !== undefined) {
    if (!['active', 'inactive'].includes(p.status)) throw new BillingError('INVALID_INPUT', 'Trạng thái gói không hợp lệ.');
    out.status = p.status;
  }
  return out;
}

export function createPlan(db, body, now) {
  const v = validatePlanInput(body);
  const info = db.prepare("INSERT INTO plans (name, duration_days, price, currency, features, status, created_at, updated_at) VALUES (?, ?, ?, 'VND', ?, ?, ?, ?)")
    .run(v.name, v.durationDays, v.price, v.features, body.status ?? 'active', iso(now), iso(now));
  return getPlan(db, Number(info.lastInsertRowid));
}

export function getPlan(db, id) {
  const r = db.prepare('SELECT * FROM plans WHERE id = ? AND deleted_at IS NULL').get(id);
  return r ? planDto(r) : null;
}

export function planDto(r) {
  return { id: r.id, name: r.name, durationDays: r.duration_days, price: r.price, currency: r.currency, features: JSON.parse(r.features || '{}'), status: r.status };
}

export function updatePlan(db, id, body, now) {
  if (!getPlan(db, id)) throw new BillingError('NOT_FOUND', 'Không tìm thấy gói.', 404);
  const v = validatePlanInput(body, true);
  const cur = db.prepare('SELECT * FROM plans WHERE id = ?').get(id);
  const next = { ...cur, ...Object.fromEntries(Object.entries({
    name: v.name, duration_days: v.durationDays, price: v.price, features: v.features, status: v.status,
  }).filter(([, x]) => x !== undefined)) };
  db.prepare('UPDATE plans SET name = ?, duration_days = ?, price = ?, features = ?, status = ?, updated_at = ? WHERE id = ?')
    .run(next.name, next.duration_days, next.price, next.features, next.status, iso(now), id);
  return getPlan(db, id);
}

// Xóa mềm: không xóa hàng, chỉ đánh dấu và ẩn khỏi danh sách.
export function deletePlan(db, id, now) {
  if (!getPlan(db, id)) throw new BillingError('NOT_FOUND', 'Không tìm thấy gói.', 404);
  db.prepare("UPDATE plans SET deleted_at = ?, status = 'inactive', updated_at = ? WHERE id = ?").run(iso(now), iso(now), id);
}

export function listPlans(db, { publicOnly = false } = {}) {
  const rows = publicOnly
    ? db.prepare("SELECT * FROM plans WHERE deleted_at IS NULL AND status = 'active' ORDER BY price, id").all()
    : db.prepare('SELECT * FROM plans WHERE deleted_at IS NULL ORDER BY id').all();
  return rows.map(planDto);
}

// ---------- Mã giảm giá ----------
export function validateDiscountInput(b, partial = false, planExists = () => true) {
  const out = {};
  if (!partial || b.code !== undefined) {
    const code = String(b.code ?? '').trim().toUpperCase();
    if (!/^[A-Z0-9_-]{3,32}$/.test(code)) throw new BillingError('INVALID_INPUT', 'Mã giảm giá: 3 đến 32 ký tự gồm chữ, số, gạch dưới hoặc gạch ngang.');
    out.code = code;
  }
  if (!partial || b.type !== undefined) {
    if (!['percent', 'fixed'].includes(b.type)) throw new BillingError('INVALID_INPUT', 'Loại giảm giá phải là percent hoặc fixed.');
    out.type = b.type;
  }
  if (!partial || b.value !== undefined) {
    const v = Number(b.value);
    if (!Number.isInteger(v) || v <= 0 || (b.type ?? out.type) === 'percent' && v > 100) throw new BillingError('INVALID_INPUT', 'Giá trị giảm không hợp lệ (phần trăm từ 1 đến 100, hoặc số tiền VND dương).');
    out.value = v;
  }
  if (b.maxUses !== undefined) {
    const m = Number(b.maxUses);
    if (!Number.isInteger(m) || (m !== -1 && m < 1)) throw new BillingError('INVALID_INPUT', 'Số lần dùng tối đa phải là số nguyên dương, hoặc -1 cho không giới hạn.');
    out.max_uses = m;
  }
  if (b.expiresAt !== undefined) {
    if (b.expiresAt === null || b.expiresAt === '') out.expires_at = null;
    else {
      const t = Date.parse(b.expiresAt);
      if (Number.isNaN(t)) throw new BillingError('INVALID_INPUT', 'Ngày hết hạn không hợp lệ.');
      out.expires_at = iso(t);
    }
  }
  if (b.planId !== undefined) {
    if (b.planId === null) out.plan_id = null;
    else {
      const pid = Number(b.planId);
      if (!Number.isInteger(pid) || !planExists(pid)) throw new BillingError('INVALID_INPUT', 'Gói áp dụng không tồn tại.');
      out.plan_id = pid;
    }
  }
  if (b.active !== undefined) out.active = b.active ? 1 : 0;
  return out;
}

function planExistsIn(db, pid) {
  return !!db.prepare('SELECT id FROM plans WHERE id = ? AND deleted_at IS NULL').get(pid);
}

export function createDiscount(db, body, now) {
  const v = validateDiscountInput(body, false, pid => planExistsIn(db, pid));
  if (db.prepare('SELECT id FROM discount_codes WHERE code = ?').get(v.code)) throw new BillingError('CODE_EXISTS', 'Mã này đã tồn tại.', 409);
  const info = db.prepare('INSERT INTO discount_codes (code, type, value, max_uses, used_count, expires_at, plan_id, active, created_at) VALUES (?, ?, ?, ?, 0, ?, ?, ?, ?)')
    .run(v.code, v.type, v.value, v.max_uses ?? -1, v.expires_at ?? null, v.plan_id ?? null, v.active ?? 1, iso(now));
  return discountDto(db.prepare('SELECT * FROM discount_codes WHERE id = ?').get(Number(info.lastInsertRowid)));
}

export function updateDiscount(db, id, body) {
  const cur = db.prepare('SELECT * FROM discount_codes WHERE id = ?').get(id);
  if (!cur) throw new BillingError('NOT_FOUND', 'Không tìm thấy mã.', 404);
  const v = validateDiscountInput(body, true, pid => planExistsIn(db, pid));
  delete v.code; // không đổi mã sau khi tạo
  const next = { ...cur, ...v };
  if (next.type === 'percent' && (next.value < 1 || next.value > 100)) throw new BillingError('INVALID_INPUT', 'Phần trăm giảm phải từ 1 đến 100.');
  db.prepare('UPDATE discount_codes SET type = ?, value = ?, max_uses = ?, expires_at = ?, plan_id = ?, active = ? WHERE id = ?')
    .run(next.type, next.value, next.max_uses, next.expires_at, next.plan_id, next.active, id);
  return discountDto(db.prepare('SELECT * FROM discount_codes WHERE id = ?').get(id));
}

export function listDiscounts(db) {
  return db.prepare('SELECT * FROM discount_codes ORDER BY id').all().map(discountDto);
}

export function discountDto(r) {
  return { id: r.id, code: r.code, type: r.type, value: r.value, maxUses: r.max_uses, usedCount: r.used_count, expiresAt: r.expires_at, planId: r.plan_id, active: !!r.active };
}

// Kiểm tra mã và tính số tiền giảm cho một gói. Không ghi gì vào DB.
export function computeDiscount(db, code, plan, now) {
  const row = db.prepare('SELECT * FROM discount_codes WHERE code = ?').get(String(code ?? '').trim().toUpperCase());
  if (!row || !row.active) throw new BillingError('DISCOUNT_INVALID', 'Mã giảm giá không tồn tại hoặc đã tắt.');
  if (row.expires_at && Date.parse(row.expires_at) <= now) throw new BillingError('DISCOUNT_EXPIRED', 'Mã đã hết hạn.');
  if (row.max_uses !== -1 && row.used_count >= row.max_uses) throw new BillingError('DISCOUNT_USED_UP', 'Mã đã dùng hết lượt.');
  if (row.plan_id !== null && row.plan_id !== plan.id) throw new BillingError('DISCOUNT_WRONG_PLAN', 'Mã không áp dụng cho gói này.');
  const amount = plan.price;
  const raw = row.type === 'percent' ? Math.floor(amount * row.value / 100) : row.value;
  const discountAmount = Math.min(raw, amount);
  return { code: row.code, discountAmount, finalAmount: amount - discountAmount };
}

// ---------- Cổng thanh toán (interface dùng chung) ----------
// Mỗi cổng có: name, createPayment(order) -> { paymentUrl }, handleCallback(data) -> { success, orderId, txn, amount }.
// Cổng thử nghiệm "sandbox" ký bằng PAYMENT_SECRET. Cổng thật (VNPay...) cần thông tin merchant nên chưa cấu hình.
export function createGateways({ secret }) {
  if (!secret || secret.length < 16) throw new Error('PAYMENT_SECRET phải có ít nhất 16 ký tự.');
  return {
    sandbox: {
      name: 'sandbox',
      async createPayment(order) {
        return { paymentUrl: `/api/payments/sandbox/pay?order=${order.id}` };
      },
      async handleCallback(data) {
        const { orderId, txn, amount, status, signature } = data || {};
        const expected = signPayload(secret, [orderId, txn, amount, status]);
        if (signature !== expected) return { success: false, reason: 'BAD_SIGNATURE' };
        return { success: status === 'paid', orderId: Number(orderId), txn: String(txn), amount: Number(amount) };
      },
    },
  };
}

// Tạo đơn hàng: tính giảm giá theo mã và gọi cổng để lấy link thanh toán.
export async function createOrder(db, { userId, planId, gateway, code }, now, gateways) {
  const plan = getPlan(db, planId);
  if (!plan || plan.status !== 'active') throw new BillingError('PLAN_NOT_AVAILABLE', 'Gói này không còn bán.', 404);
  const gw = gateways[gateway || 'sandbox'];
  if (!gw) throw new BillingError('GATEWAY_UNKNOWN', 'Cổng thanh toán chưa được cấu hình.');
  let disc = { discountAmount: 0, finalAmount: plan.price, code: null };
  if (code) disc = computeDiscount(db, code, plan, now);
  const info = db.prepare("INSERT INTO orders (user_id, plan_id, gateway, amount, discount_code, discount_amount, final_amount, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?)")
    .run(userId, planId, gw.name, plan.price, disc.code, disc.discountAmount, disc.finalAmount, iso(now));
  const order = { id: Number(info.lastInsertRowid), finalAmount: disc.finalAmount };
  const pay = await gw.createPayment(order);
  return { orderId: order.id, planId, amount: plan.price, discountAmount: disc.discountAmount, finalAmount: disc.finalAmount, paymentUrl: pay.paymentUrl };
}

// Xử lý callback từ cổng. Idempotent: đơn đã trả thì không cộng gói hai lần.
export async function handleCallback(db, gatewayName, data, now, gateways) {
  const gw = gateways[gatewayName];
  if (!gw) throw new BillingError('GATEWAY_UNKNOWN', 'Cổng không hợp lệ.', 404);
  const res = await gw.handleCallback(data);
  if (!res.success) return { ok: false, reason: res.reason || 'NOT_PAID' };
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(res.orderId);
  if (!order) throw new BillingError('NOT_FOUND', 'Không tìm thấy đơn.', 404);
  if (order.status === 'paid') return { ok: true, alreadyPaid: true };
  if (res.amount !== order.final_amount) return { ok: false, reason: 'AMOUNT_MISMATCH' };
  db.exec('BEGIN IMMEDIATE');
  try {
    db.prepare("UPDATE orders SET status = 'paid', provider_txn = ?, paid_at = ? WHERE id = ? AND status = 'pending'").run(res.txn, iso(now), order.id);
    if (order.discount_code) db.prepare('UPDATE discount_codes SET used_count = used_count + 1 WHERE code = ?').run(order.discount_code);
    grantSubscription(db, order.user_id, order.plan_id, now);
    db.exec('COMMIT');
  } catch (e) { db.exec('ROLLBACK'); throw e; }
  return { ok: true, alreadyPaid: false, orderId: order.id };
}

// Gia hạn: nếu đang có gói chưa hết hạn thì nối tiếp, không thì tính từ bây giờ.
export function grantSubscription(db, userId, planId, now) {
  const plan = db.prepare('SELECT duration_days FROM plans WHERE id = ?').get(planId);
  const active = getActiveSubscription(db, userId, now);
  const start = active && active.ends_at !== null ? active.ends_at : now;
  if (plan.duration_days === -1) {
    db.prepare("UPDATE subscriptions SET status = 'expired' WHERE user_id = ? AND status = 'active'").run(userId);
    return db.prepare("INSERT INTO subscriptions (user_id, plan_id, starts_at, ends_at, status) VALUES (?, ?, ?, NULL, 'active')").run(userId, planId, now);
  }
  const ends = start + plan.duration_days * DAY;
  return db.prepare("INSERT INTO subscriptions (user_id, plan_id, starts_at, ends_at, status) VALUES (?, ?, ?, ?, 'active')").run(userId, planId, start, ends);
}

export function getActiveSubscription(db, userId, now) {
  const rows = db.prepare("SELECT * FROM subscriptions WHERE user_id = ? AND status = 'active' ORDER BY id DESC").all(userId);
  return rows.find(r => r.ends_at === null || r.ends_at > now) || null;
}

// Nhắc gia hạn: gói còn dưới 7 ngày (hoặc đã có trong cửa sổ), mỗi gói chỉ nhắc một lần.
export function runRenewalReminders(db, now, { windowDays = 7 } = {}) {
  const until = now + windowDays * DAY;
  const subs = db.prepare(`SELECT s.id, s.user_id, s.ends_at, u.email, u.name FROM subscriptions s
    JOIN users u ON u.id = s.user_id
    WHERE s.status = 'active' AND s.ends_at IS NOT NULL AND s.ends_at > ? AND s.ends_at <= ?
      AND NOT EXISTS (SELECT 1 FROM reminder_logs r WHERE r.subscription_id = s.id)`).all(now, until);
  let queued = 0;
  for (const s of subs) {
    let mail;
    try {
      mail = renderTemplate('renewal-reminder', { userName: s.name || s.email, expiryDate: iso(s.ends_at).slice(0, 10) });
    } catch (e) {
      db.prepare('INSERT INTO reminder_logs (subscription_id, user_id, sent_at, result) VALUES (?, ?, ?, ?)').run(s.id, s.user_id, iso(now), 'TEMPLATE_ERROR: ' + e.code);
      continue;
    }
    enqueue(db, { to: s.email, subject: mail.subject, body: mail.body }, now);
    db.prepare('INSERT INTO reminder_logs (subscription_id, user_id, sent_at, result) VALUES (?, ?, ?, ?)').run(s.id, s.user_id, iso(now), 'QUEUED');
    queued++;
  }
  return { candidates: subs.length, queued };
}
