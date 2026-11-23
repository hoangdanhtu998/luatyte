// Sinh ý tưởng test từ mã nguồn, không chạy mã và không gọi AI.
// White box: nhìn vào cấu trúc code (hàm, nhánh if, catch, throw).
// Black box: nhìn vào giao diện và ngưỡng (route API, ô nhập, giới hạn số).
// Mỗi ý tưởng đều có file bằng chứng; file không có trong dự án thì bị bỏ.
export const MAX_IDEAS = 40;
const TITLE_LIMIT = 180;
const MAX_FIELDS_PER_FILE = 8;
const SOURCE_RE = /\.(m?js|ts|tsx|jsx|py|go|java|html)$/i;
const NON_SOURCE_RE = /(\.spec\.|\.test\.|(^|\/)tests?\/|node_modules\/|(^|\/)(dist|build|coverage)\/)/i;

const BRANCH_RE = /\b(if|else if|case)\b\s*\(?/g;
const HAS_CATCH_RE = /\bcatch\s*\(/;
const THROW_RE = /\bthrow\s+new\s+\w+\(/g;
const LIMIT_RE = /\b(length|size|max\w*|min\w*)\s*(<=|>=|<|>)\s*(\d{1,6})\b/g;
const FIELD_RE = /<(input|textarea|select)\b[^>]*\bname="([\w-]+)"[^>]*>/gi;
const ROUTE_RE = /method:\s*'(GET|POST|PUT|PATCH|DELETE)',\s*pattern:\s*\/\^(.+?)\$\//g;

export function isSourcePath(rel) {
  return SOURCE_RE.test(rel) && !NON_SOURCE_RE.test(rel);
}

function clip(text) {
  return text.length > TITLE_LIMIT ? `${text.slice(0, TITLE_LIMIT - 1)}…` : text;
}

function idea({ title, testType, evidence, expected, priority = 'medium' }) {
  return { title: clip(title), testType, priority, expected, steps: `Bằng chứng: ${evidence}` };
}

// Đường API lấy từ bảng ROUTES: bỏ escape và regex, giữ dạng đọc được.
function readableRoute(raw) {
  return raw.replace(/\\\//g, '/').replace(/\([^)]*\)/g, ':id');
}

function apiIdeas(rel, text) {
  const out = [];
  for (const m of text.matchAll(ROUTE_RE)) {
    const route = readableRoute(m[2]);
    out.push(idea({
      title: `API ${m[1]} ${route}: dữ liệu hợp lệ, thiếu trường, sai kiểu, không tồn tại`,
      testType: 'black_box',
      evidence: rel,
      expected: '2xx khi hợp lệ; 400 khi dữ liệu sai; 404 khi không có đối tượng',
    }));
  }
  return out;
}

function limitIdeas(rel, text) {
  const seen = new Set();
  const out = [];
  for (const m of text.matchAll(LIMIT_RE)) {
    const n = Number(m[3]);
    const key = `${m[1]}${m[2]}${n}`;
    if (seen.has(key) || n < 1) continue;
    seen.add(key);
    out.push(idea({
      title: `Biên ${m[1]} ${m[2]} ${n} trong ${rel}: thử ${n - 1}, ${n}, ${n + 1}`,
      testType: 'black_box',
      evidence: rel,
      expected: `Đúng ngưỡng: ${n} được xử lý theo quy định, ${n + 1} bị từ chối hoặc cắt`,
      priority: 'high',
    }));
  }
  return out;
}

function fieldIdeas(rel, text) {
  return [...text.matchAll(FIELD_RE)].slice(0, MAX_FIELDS_PER_FILE).map((m) => idea({
    title: `Ô ${m[2]} (${rel}): để trống, quá dài, ký tự đặc biệt`,
    testType: 'black_box',
    evidence: rel,
    expected: 'Hiện thông báo lỗi rõ ràng gần ô sai, không mất dữ liệu đã nhập',
  }));
}

// Chỉ tạo ca cho chỗ rủi ro thật: nhiều điều kiện, nhánh lỗi, chỗ ném lỗi.
function whiteBoxIdeas(rel, text) {
  const out = [];
  const branches = [...text.matchAll(BRANCH_RE)].length;
  if (branches >= 3) {
    out.push(idea({
      title: `Độ phủ quyết định trong ${rel} (${branches} điều kiện): thử đủ tổ hợp đúng và sai`,
      testType: 'white_box',
      evidence: rel,
      expected: 'Mỗi điều kiện có ít nhất một ca cho kết quả đúng và một ca cho kết quả sai',
    }));
  }
  if (HAS_CATCH_RE.test(text)) {
    out.push(idea({
      title: `Nhánh lỗi (catch) trong ${rel}: ép lỗi và kiểm thông báo`,
      testType: 'white_box',
      evidence: rel,
      expected: 'Lỗi được báo rõ cho người dùng, không nuốt lỗi im lặng',
      priority: 'high',
    }));
  }
  const throws = [...text.matchAll(THROW_RE)].length;
  if (throws > 0) {
    out.push(idea({
      title: `Đường ném lỗi trong ${rel} (${throws} chỗ throw): có input kích hoạt từng cái`,
      testType: 'white_box',
      evidence: rel,
      expected: 'Mỗi throw được kích hoạt ít nhất một lần và thông điệp đúng',
    }));
  }
  return out;
}

function dedupe(ideas) {
  const seen = new Set();
  return ideas.filter((i) => {
    if (seen.has(i.title)) return false;
    seen.add(i.title);
    return true;
  });
}

// Đầu vào: tree (danh sách file) và sources ([{ path, text }] đã che bí mật).
// Xen kẽ black box và white box để cả hai loại đều có mặt khi bị cắt bớt theo giới hạn.
function interleave(first, second, limit) {
  const out = [];
  for (let k = 0; out.length < limit && (k < first.length || k < second.length); k += 1) {
    if (k < first.length) out.push(first[k]);
    if (k < second.length && out.length < limit) out.push(second[k]);
  }
  return out;
}

export function designTests({ tree, sources }) {
  const files = new Set(tree);
  const valid = sources.filter((s) => files.has(s.path) && isSourcePath(s.path));
  const blackBox = [];
  const whiteBox = [];
  for (const { path: rel, text } of valid) {
    blackBox.push(...apiIdeas(rel, text), ...limitIdeas(rel, text));
    if (/\.html$/i.test(rel)) blackBox.push(...fieldIdeas(rel, text));
    else whiteBox.push(...whiteBoxIdeas(rel, text));
  }
  return interleave(dedupe(blackBox), dedupe(whiteBox), MAX_IDEAS);
}
