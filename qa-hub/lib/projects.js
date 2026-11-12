// Dự án: mỗi dự án có nguồn (local/github/domain/manual), quy trình 6 bước và lịch sử lần chạy.

export const DEFAULT_PROJECT_ID = 'PRJ-001';
export const SOURCE_TYPES = ['local', 'github', 'domain', 'manual', 'zip'];

// needsConfirm: với dự án không phải local, tích bước này phải có xác nhận rõ ràng
// (vì cài đặt và chạy test nghĩa là chạy mã của người khác trên máy này).
export const WORKFLOW_STEPS = [
  { key: 'source', name: 'Nhận nguồn dự án', needsConfirm: false },
  { key: 'clone', name: 'Lấy mã nguồn (clone hoặc đọc file)', needsConfirm: false },
  { key: 'install', name: 'Cài đặt môi trường và phụ thuộc', needsConfirm: true },
  { key: 'smoke', name: 'Smoke test', needsConfirm: false },
  { key: 'tests', name: 'Chạy bộ test', needsConfirm: true },
  { key: 'report', name: 'Lập báo cáo', needsConfirm: false },
];

const NAME_MIN = 3;
const NAME_MAX = 80;
const REF_MAX = 200;
const FINDINGS_MAX = 2000;
const GITHUB_RE = /^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+(\.git)?$/;
const DOMAIN_RE = /^https:\/\/[a-z0-9-]+(\.[a-z0-9-]+)+(\/[^\s]*)?$/i;

const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const notObject = () => ({ ok: false, errors: { body: 'Dữ liệu phải là một object JSON' } });

export function emptyWorkflow() {
  return Object.fromEntries(WORKFLOW_STEPS.map((step) => [step.key, false]));
}

export function validateProject(body) {
  if (!isObject(body)) return notObject();
  const errors = {};
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  if (name.length < NAME_MIN || name.length > NAME_MAX) {
    errors.name = `Tên dự án từ ${NAME_MIN} đến ${NAME_MAX} ký tự`;
  }
  if (!SOURCE_TYPES.includes(body.sourceType)) {
    errors.sourceType = `Nguồn phải là một trong: ${SOURCE_TYPES.join(', ')}`;
  }

  const rawRef = typeof body.sourceRef === 'string' ? body.sourceRef.trim() : '';
  if (body.sourceType === 'github') {
    if (!GITHUB_RE.test(rawRef)) {
      errors.sourceRef = 'Link GitHub phải có dạng https://github.com/chủ-sở-hữu/tên-repo';
    }
  } else if (body.sourceType === 'domain') {
    if (!DOMAIN_RE.test(rawRef)) {
      errors.sourceRef = 'Domain phải bắt đầu bằng https:// và có tên miền hợp lệ';
    }
    if (body.ownershipConfirmed !== true) {
      errors.ownershipConfirmed = 'Chỉ kiểm thử domain mà bạn sở hữu hoặc được phép kiểm thử';
    }
  } else if (rawRef.length > REF_MAX) {
    errors.sourceRef = `Tối đa ${REF_MAX} ký tự`;
  }
  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return {
    ok: true,
    value: {
      name,
      sourceType: body.sourceType,
      sourceRef: rawRef || null,
      ownershipConfirmed: body.sourceType === 'domain',
      // Chỉ zip/GitHub mới có thể bật chạy test; mặc định tắt vì mã lạ có thể độc hại.
      autoTests: body.autoTests === true && (body.sourceType === 'zip' || body.sourceType === 'github'),
    },
  };
}

export function validateWorkflowPatch(body) {
  if (!isObject(body)) return notObject();
  if (typeof body.done !== 'boolean') {
    return { ok: false, errors: { done: 'done phải là true hoặc false' } };
  }
  return { ok: true, value: { done: body.done, confirmed: body.confirmed === true } };
}

export function validateProjectNotes(body) {
  if (!isObject(body)) return notObject();
  const text = typeof body.extraFindings === 'string' ? body.extraFindings.trim() : null;
  if (text === null || text.length > FINDINGS_MAX) {
    return { ok: false, errors: { extraFindings: `Tối đa ${FINDINGS_MAX} ký tự` } };
  }
  return { ok: true, value: { extraFindings: text } };
}

// Ảnh chụp kết quả hiện tại của dự án, lưu vào lịch sử khi ghi một lần chạy.
export function snapshotRun({ testcases, bugs }) {
  const byResult = { not_run: 0, pass: 0, fail: 0, blocked: 0, not_applicable: 0 };
  for (const tc of testcases) {
    const key = tc.result ?? 'not_run';
    byResult[key] = (byResult[key] ?? 0) + 1;
  }
  return {
    total: testcases.length,
    byResult,
    bugsOpen: bugs.filter((bug) => !['closed', 'rejected', 'duplicate'].includes(bug.status)).length,
    bugsTotal: bugs.length,
  };
}
