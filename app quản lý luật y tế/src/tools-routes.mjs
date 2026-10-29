// Sổ công cụ & repo đang dùng cho app: ghi rõ dùng ở đâu, giấy phép, trạng thái, và số lần sử dụng.
// Số lần dùng chỉ tính từ lúc có nhật ký (không khôi phục lại các lần trước đó).

const SEED = [
  { id: 'slidev', name: 'Slidev', repo: 'https://github.com/slidevjs/slidev', license: 'MIT (đã kiểm tra)', purpose: 'Làm bài giảng slide theo chương, build sang trang tĩnh', status: 'dùng', used_in: 'slides-ly-thuyet (/slides/)', notes: 'Đã dùng để build bộ slide 5 chương và các bản chương 1.' },
  { id: 'iconify-mdi', name: '@iconify-json/mdi', repo: 'https://www.npmjs.com/package/@iconify-json/mdi', license: 'chưa kiểm tra', purpose: 'Biểu tượng cho slide', status: 'dùng', used_in: 'slides-ly-thuyet', notes: '' },
  { id: 'piper-tts', name: 'Piper TTS (vi_VN-vais1000-medium)', repo: 'https://github.com/rhasspy/piper', license: 'chưa kiểm tra', purpose: 'Giọng đọc tiếng Việt cho bài giảng', status: 'dùng', used_in: 'scripts/make-lecture-audio.mjs, /api/tts', notes: 'Chạy local, không cần internet.' },
  { id: 'voxcpm2', name: 'VoxCPM2 (openbmb)', repo: 'https://huggingface.co/openbmb/VoxCPM2', license: 'chưa kiểm tra', purpose: 'Giọng đọc chất lượng cao (thử nghiệm)', status: 'đã thử, chưa dùng', used_in: '', notes: 'Chạy được tiếng Việt nhưng trên CPU rất chậm (khoảng 43 lần chậm hơn thời lượng audio).' },
  { id: 'md-slides', name: 'md-slides', repo: 'https://github.com/zl190/md-slides', license: 'MIT (đã kiểm tra)', purpose: 'Chuyển Markdown thành slide, có tạo ảnh qua Gemini', status: 'đã đánh giá, chưa dùng', used_in: '', notes: 'Tạo ảnh cần GEMINI_API_KEY; chỉ chạy qua lệnh trong Claude Code, không có chế độ hàng loạt.' },
  { id: 'reveal-js', name: 'reveal.js', repo: 'https://github.com/hakimel/reveal.js', license: 'chưa kiểm tra', purpose: 'Khung slide HTML (phương án dự phòng)', status: 'đã đánh giá, chưa dùng', used_in: '', notes: '' },
  { id: 'skill-image-gen', name: 'skill-image-gen', repo: 'https://github.com/adamd9/skill-image-gen', license: 'MIT (theo tìm kiếm, chưa mở repo)', purpose: 'Skill tạo ảnh cho Claude Code (OpenAI/Gemini)', status: 'đã tìm, chưa dùng', used_in: '', notes: 'Cần khóa API riêng.' },
  { id: 'cindy-media-mai', name: 'Cindy media: MAI-Image-2.6-Flash', repo: 'Dịch vụ Cindy (provider xd)', license: 'theo điều khoản nhà cung cấp', purpose: 'Tạo ảnh minh họa bài giảng', status: 'dùng (đang ngừng)', used_in: 'slides-ly-thuyet/public/img', notes: 'Đã tạo 9 ảnh. Hiện trả lỗi MODEL_NOT_AVAILABLE (mô hình đã ngừng).' },
  { id: 'cindy-media-gpt', name: 'Cindy media: GPT Image (openai/gpt-image-2)', repo: 'Dịch vụ Cindy (provider openai)', license: 'theo điều khoản OpenAI', purpose: 'Tạo ảnh minh họa (dự phòng)', status: 'đã thử, lỗi', used_in: '', notes: 'Lần thử trả lỗi 403, không xác định được có bị tính phí không. Không thử lại khi chưa có xác nhận.' },
];

export function createToolsRoutes({ db, now, helpers }) {
  const { sessionOf, requireAdmin, readBody, send, err, audit } = helpers;
  db.exec(`CREATE TABLE IF NOT EXISTS tool_registry (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, repo TEXT, license TEXT, purpose TEXT,
    status TEXT, used_in TEXT, notes TEXT, uses INTEGER NOT NULL DEFAULT 0, last_used INTEGER)`);
  const ins = db.prepare(`INSERT OR IGNORE INTO tool_registry (id, name, repo, license, purpose, status, used_in, notes, uses, last_used)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, NULL)`);
  for (const t of SEED) ins.run(t.id, t.name, t.repo, t.license, t.purpose, t.status, t.used_in, t.notes);

  const list = () => db.prepare('SELECT * FROM tool_registry ORDER BY uses DESC, name ASC').all();

  return async function handle(req, res, url) {
    const p = url.pathname, m = req.method;
    if (p === '/api/admin/tools' && m === 'GET') {
      if (!requireAdmin(req, res)) return true;
      return send(res, 200, { tools: list() }), true;
    }
    const hit = p.match(/^\/api\/admin\/tools\/([a-z0-9-]+)\/log$/);
    if (hit && m === 'POST') {
      const s = requireAdmin(req, res);
      if (!s) return true;
      const id = hit[1];
      const row = db.prepare('SELECT id FROM tool_registry WHERE id = ?').get(id);
      if (!row) return err(res, 404, 'NOT_FOUND', 'Không có công cụ này trong sổ.'), true;
      db.prepare('UPDATE tool_registry SET uses = uses + 1, last_used = ? WHERE id = ?').run(now(), id);
      audit(req, s, { action: 'tool.log', entity: 'tool', entityId: id });
      return send(res, 200, { ok: true, tools: list() }), true;
    }
    return false;
  };
}
