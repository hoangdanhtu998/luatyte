// Sơ đồ kiến trúc & luồng (archify): chỉ quản trị viên xem được.
// File HTML nằm trong thư mục diagrams/ (không nằm trong public/), nên không ai xem được nếu không qua API này.
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const DIAGRAMS = [
  { file: '1-tai-khoan.html', title: '1. Vòng đời tài khoản', desc: 'Trạng thái tài khoản và gói: chưa đăng ký, free, chờ thanh toán, Premium, hết hạn, bị khóa.' },
  { file: '2-api-quan-ly.html', title: '2. App quản lý: nhóm API', desc: 'Các nhóm API của app quản lý: xác thực, gói, quản trị, học viên, công khai.' },
  { file: '3-ca-truc.html', title: '3. Mini game ca trực', desc: 'Luồng một ca: chọn chế độ, bệnh nhân, chọn đáp án, chấm điểm, tổng kết.' },
  { file: '4-hoc-vien.html', title: '4. Học viên: các tab học', desc: 'Đường đi của học viên từ đăng nhập qua các tab học đến bảng xếp hạng.' },
];

// Chính sách an toàn cho nội dung sơ đồ: không tải tài nguyên ngoài, chỉ chạy script/CSS nội tuyến của chính file.
const CSP = "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; base-uri 'none'; form-action 'none'";

export function createDiagramsRoutes({ dir, helpers }) {
  const { requireAdmin, send, err, audit } = helpers;
  const known = new Set(DIAGRAMS.map(d => d.file));

  return async function handle(req, res, url) {
    const p = url.pathname;
    if (!p.startsWith('/api/admin/diagrams')) return false;
    if (req.method !== 'GET') return false;

    if (p === '/api/admin/diagrams') {
      if (!requireAdmin(req, res)) return true;
      send(res, 200, { items: DIAGRAMS.map(({ file, title, desc }) => ({ file, title, desc, url: '/api/admin/diagrams/' + file })) });
      return true;
    }

    const m = /^\/api\/admin\/diagrams\/([\w-]+\.html)$/.exec(p);
    if (!m || !known.has(m[1])) return false;
    const s = requireAdmin(req, res);
    if (!s) return true;
    const file = join(dir, m[1]);
    if (!existsSync(file)) { err(res, 404, 'NOT_FOUND', 'Chưa có sơ đồ này.'); return true; }
    audit(req, s, { action: 'VIEW', entity: 'Diagram', entityId: null, newValue: { file: m[1] } });
    res.writeHead(200, {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store',
      'content-security-policy': CSP,
      'x-content-type-options': 'nosniff',
      'x-frame-options': 'SAMEORIGIN',
    });
    res.end(readFileSync(file));
    return true;
  };
}
