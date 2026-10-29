// Bảng xếp hạng theo tên đăng nhập: mỗi lần chơi xong lưu điểm vào tài khoản.
// Chỉ hiện tên đăng nhập, không hiện email. Xếp theo số vàng cao nhất trong một ca.
const MODE_RE = /^[a-z]{1,20}$/;

export function createScoresRoutes({ db, now, helpers }) {
  const { sessionOf, send, err, readBody } = helpers;
  db.exec(`CREATE TABLE IF NOT EXISTS game_scores (
    id INTEGER PRIMARY KEY, user_id INTEGER NOT NULL, mode TEXT NOT NULL,
    gold INTEGER NOT NULL, healed INTEGER NOT NULL, created_at INTEGER NOT NULL)`);
  db.exec('CREATE INDEX IF NOT EXISTS game_scores_user ON game_scores(user_id, gold)');

  function board(uid) {
    const top = db.prepare(`SELECT u.username AS name, MAX(s.gold) AS best, COUNT(*) AS plays
      FROM game_scores s JOIN users u ON u.id = s.user_id
      WHERE u.username IS NOT NULL GROUP BY s.user_id ORDER BY best DESC, plays DESC LIMIT 10`).all();
    let me = null;
    if (uid) {
      const mine = db.prepare('SELECT MAX(gold) AS best, COUNT(*) AS plays FROM game_scores WHERE user_id = ?').get(uid);
      if (mine && mine.plays) {
        const ahead = db.prepare(`SELECT COUNT(*) AS n FROM (SELECT user_id, MAX(gold) AS best FROM game_scores GROUP BY user_id)
          WHERE best > ?`).get(mine.best).n;
        me = { best: mine.best, plays: mine.plays, rank: ahead + 1 };
      }
    }
    return { top, me };
  }

  return async function handle(req, res, url) {
    const p = url.pathname, m = req.method;

    if (p === '/api/scores/top' && m === 'GET') {
      const s = sessionOf(req);
      return send(res, 200, board(s ? s.user_id : null)), true;
    }

    if (p === '/api/scores' && m === 'POST') {
      const s = sessionOf(req);
      if (!s) return err(res, 401, 'UNAUTHENTICATED', 'Cần đăng nhập để lưu điểm.'), true;
      if (!s.username) return err(res, 403, 'NO_USERNAME', 'Tài khoản chưa có tên đăng nhập.'), true;
      const b = await readBody(req);
      const mode = String(b.mode || '');
      const gold = Number(b.gold), healed = Number(b.healed);
      if (!MODE_RE.test(mode) || !Number.isInteger(gold) || gold < 0 || gold > 20000
          || !Number.isInteger(healed) || healed < 0 || healed > 500) {
        return err(res, 400, 'INVALID_SCORE', 'Điểm không hợp lệ.'), true;
      }
      // Mỗi tài khoản lưu tối đa 1 ca mỗi 10 giây, tránh gửi dồn.
      const last = db.prepare('SELECT MAX(created_at) AS t FROM game_scores WHERE user_id = ?').get(s.user_id).t || 0;
      if (now() - last < 10000) return err(res, 429, 'TOO_FAST', 'Chờ vài giây rồi lưu tiếp.'), true;
      db.prepare('INSERT INTO game_scores (user_id, mode, gold, healed, created_at) VALUES (?, ?, ?, ?, ?)')
        .run(s.user_id, mode, gold, healed, now());
      return send(res, 200, { ok: true, ...board(s.user_id) }), true;
    }
    return false;
  };
}
