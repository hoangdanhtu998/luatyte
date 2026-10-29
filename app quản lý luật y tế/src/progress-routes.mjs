// Đồng bộ tiến độ học của app luật y tế theo tài khoản.
// Mỗi tài khoản lưu một ảnh chụp các khóa localStorage bắt đầu bằng "lyt_".
// Đồng bộ kiểu "bản mới nhất thắng": client so updatedAt để quyết định kéo hay đẩy.
const KEY_RE = /^lyt_[a-z0-9_]{1,48}$/i;
const MAX_KEYS = 400;
const MAX_VALUE = 60_000;
const MAX_TOTAL = 180_000;

function readJson(req, limit = 200_000) {
  return new Promise((ok, bad) => {
    let s = '';
    req.on('data', c => {
      s += c;
      if (s.length > limit) {
        req.destroy();
        bad(Object.assign(new Error('too large'), { code: 'TOO_LARGE' }));
      }
    });
    req.on('end', () => {
      try { ok(s ? JSON.parse(s) : {}); }
      catch { bad(Object.assign(new Error('bad json'), { code: 'BAD_JSON' })); }
    });
    req.on('error', bad);
  });
}

export function createProgressRoutes({ db, now, helpers }) {
  const { sessionOf, send, err } = helpers;

  return async function handle(req, res, url) {
    if (url.pathname !== '/api/progress') return false;
    const s = sessionOf(req);
    if (!s) return err(res, 401, 'UNAUTHENTICATED', 'Cần đăng nhập để đồng bộ tiến độ.'), true;

    if (req.method === 'GET') {
      const row = db.prepare('SELECT data, updated_at FROM user_progress WHERE user_id = ?').get(s.user_id);
      let data = null;
      if (row) { try { data = JSON.parse(row.data); } catch { data = null; } }
      return send(res, 200, { data, updatedAt: row ? row.updated_at : 0 }), true;
    }

    if (req.method === 'PUT') {
      let body;
      try { body = await readJson(req); }
      catch (e) {
        if (e.code === 'TOO_LARGE') return err(res, 413, 'TOO_LARGE', 'Tiến độ quá lớn để đồng bộ.'), true;
        return err(res, 400, 'BAD_JSON', 'Dữ liệu JSON không hợp lệ.'), true;
      }
      const data = body && body.data;
      if (!data || typeof data !== 'object' || Array.isArray(data)) {
        return err(res, 400, 'INVALID_DATA', 'Thiếu hoặc sai định dạng tiến độ.'), true;
      }
      const entries = Object.entries(data);
      if (entries.length > MAX_KEYS) return err(res, 400, 'TOO_MANY_KEYS', 'Quá nhiều mục tiến độ.'), true;
      let total = 0;
      for (const [k, v] of entries) {
        if (!KEY_RE.test(k)) return err(res, 400, 'INVALID_KEY', `Khóa tiến độ không hợp lệ: ${k.slice(0, 60)}`), true;
        if (typeof v !== 'string') return err(res, 400, 'INVALID_VALUE', 'Giá trị tiến độ phải là chuỗi JSON.'), true;
        if (v.length > MAX_VALUE) return err(res, 413, 'VALUE_TOO_LARGE', 'Một mục tiến độ quá lớn.'), true;
        total += k.length + v.length;
      }
      if (total > MAX_TOTAL) return err(res, 413, 'TOO_LARGE', 'Tiến độ quá lớn để đồng bộ.'), true;

      const at = now();
      db.prepare(`INSERT INTO user_progress (user_id, data, updated_at) VALUES (?, ?, ?)
        ON CONFLICT(user_id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at`)
        .run(s.user_id, JSON.stringify(data), at);
      return send(res, 200, { ok: true, updatedAt: at }), true;
    }

    return err(res, 405, 'METHOD_NOT_ALLOWED', 'Chỉ hỗ trợ GET và PUT.'), true;
  };
}
