export const PRIORITIES = ['low', 'medium', 'high'];
export const TC_STATUSES = ['draft', 'ready', 'passed', 'failed'];
export const TC_RESULTS = ['not_run', 'pass', 'fail', 'blocked', 'not_applicable'];
export const TEST_TYPES = [
  'positive', 'negative', 'boundary', 'equivalence', 'decision_table', 'state_transition',
  'use_case', 'pairwise', 'exploratory', 'regression', 'smoke', 'compatibility', 'performance', 'security',
  'white_box', 'black_box',
];
export const BUG_SEVERITIES = ['critical', 'major', 'minor', 'trivial'];
export const BUG_PRIORITIES = ['low', 'medium', 'high', 'urgent'];
export const BUG_STATUSES = [
  'new', 'assigned', 'in_progress', 'fixed', 'retest', 'verified',
  'closed', 'reopened', 'rejected', 'duplicate', 'deferred',
];

// Vòng đời bug: trạng thái hiện tại -> các trạng thái được phép chuyển tới.
export const BUG_TRANSITIONS = {
  new: ['assigned', 'rejected', 'duplicate', 'deferred'],
  assigned: ['in_progress', 'rejected', 'deferred'],
  in_progress: ['fixed', 'assigned'],
  fixed: ['retest'],
  retest: ['verified', 'reopened'],
  verified: ['closed'],
  reopened: ['assigned'],
  deferred: ['assigned'],
  rejected: ['closed'],
  duplicate: ['closed'],
  closed: [],
};

export const ENVIRONMENTS = ['DEV', 'SIT', 'QA', 'UAT', 'STAGING', 'PROD'];
export const FOUND_IN = ['test', 'uat', 'production'];
export const REVIEW_TARGETS = ['requirement', 'testcase', 'design', 'code', 'document'];

const TITLE_MIN = 3;
const TITLE_MAX = 200;
const BUG_TITLE_MIN = 5;
const MODULE_MAX = 50;
const SHORT_MAX = 500;
const STEPS_MAX = 2000;
const BUILD_MAX = 40;
const ASSIGNEE_MAX = 50;
const REF_MAX = 100;
const FINDINGS_MAX = 1000;

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function notObjectResult() {
  return { ok: false, errors: { body: 'Dữ liệu phải là một object JSON' } };
}

function trimmedString(value) {
  return typeof value === 'string' ? value.trim() : null;
}

// Đếm theo ký tự thật (code point), để emoji không bị tính thành 2 đơn vị.
function charLength(text) {
  return [...text].length;
}

// Trường tùy chọn dạng chuỗi: rỗng hoặc thiếu -> '', quá dài -> ghi lỗi.
function optionalText(value, max, errors, key) {
  if (value === undefined || value === null || value === '') return '';
  const text = trimmedString(value);
  if (text === null || charLength(text) > max) {
    errors[key] = `Tối đa ${max} ký tự`;
    return '';
  }
  return text;
}

function optionalId(value, pattern, errors, key, message) {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value === 'string' && pattern.test(value)) return value;
  errors[key] = message;
  return null;
}

function requiredEnum(value, allowed, errors, key, label) {
  if (!allowed.includes(value)) {
    errors[key] = `${label} phải là một trong: ${allowed.join(', ')}`;
    return null;
  }
  return value;
}

export function validateTestCase(body) {
  if (!isPlainObject(body)) return notObjectResult();

  const errors = {};
  const title = trimmedString(body.title) ?? '';
  if (charLength(title) < TITLE_MIN) {
    errors.title = `Tiêu đề cần ít nhất ${TITLE_MIN} ký tự`;
  } else if (charLength(title) > TITLE_MAX) {
    errors.title = `Tiêu đề tối đa ${TITLE_MAX} ký tự`;
  }

  let module = 'Chung';
  if (body.module !== undefined) {
    module = trimmedString(body.module) ?? '';
  }
  if (charLength(module) < 1 || charLength(module) > MODULE_MAX) {
    errors.module = `Module từ 1 đến ${MODULE_MAX} ký tự`;
  }

  const priority = requiredEnum(body.priority ?? 'medium', PRIORITIES, errors, 'priority', 'Ưu tiên');
  const testType = requiredEnum(body.testType ?? 'positive', TEST_TYPES, errors, 'testType', 'Kiểu test');
  const expected = optionalText(body.expected, SHORT_MAX, errors, 'expected');
  const requirementId = optionalId(body.requirementId, /^REQ-\d{2,}$/, errors, 'requirementId', 'Mã requirement phải có dạng REQ-01');
  const suiteId = optionalId(body.suiteId, /^TS-\d{2}$/, errors, 'suiteId', 'Mã suite phải có dạng TS-01');
  const preconditions = optionalText(body.preconditions, SHORT_MAX, errors, 'preconditions');
  const steps = optionalText(body.steps, STEPS_MAX, errors, 'steps');
  const testData = optionalText(body.testData, SHORT_MAX, errors, 'testData');

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return {
    ok: true,
    value: {
      title,
      module,
      priority,
      testType,
      expected,
      preconditions,
      steps,
      testData,
      requirementIds: requirementId ? [requirementId] : [],
      suiteId,
    },
  };
}

export function validateTestCaseStatus(body) {
  if (!isPlainObject(body)) return notObjectResult();
  if (!TC_STATUSES.includes(body.status)) {
    return { ok: false, errors: { status: `Trạng thái phải là một trong: ${TC_STATUSES.join(', ')}` } };
  }
  return { ok: true, value: { status: body.status } };
}

export function validateTestCaseResult(body) {
  if (!isPlainObject(body)) return notObjectResult();
  const errors = {};
  const result = requiredEnum(body.result, TC_RESULTS, errors, 'result', 'Kết quả');
  const evidence = optionalText(body.evidence, SHORT_MAX, errors, 'evidence');
  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, value: { result, evidence } };
}

export function validateBug(body) {
  if (!isPlainObject(body)) return notObjectResult();

  const errors = {};
  const title = trimmedString(body.title) ?? '';
  if (charLength(title) < BUG_TITLE_MIN) {
    errors.title = `Tiêu đề bug cần ít nhất ${BUG_TITLE_MIN} ký tự`;
  } else if (charLength(title) > TITLE_MAX) {
    errors.title = `Tiêu đề bug tối đa ${TITLE_MAX} ký tự`;
  }

  const severity = requiredEnum(body.severity, BUG_SEVERITIES, errors, 'severity', 'Mức độ');
  const priority = requiredEnum(body.priority ?? 'medium', BUG_PRIORITIES, errors, 'priority', 'Ưu tiên sửa');
  const environment = requiredEnum(body.environment ?? 'QA', ENVIRONMENTS, errors, 'environment', 'Môi trường');
  const foundIn = requiredEnum(body.foundIn ?? 'test', FOUND_IN, errors, 'foundIn', 'Tìm thấy ở');

  let module = 'Chung';
  if (body.module !== undefined) module = trimmedString(body.module) ?? '';
  if (charLength(module) < 1 || charLength(module) > MODULE_MAX) {
    errors.module = `Module từ 1 đến ${MODULE_MAX} ký tự`;
  }

  const buildVersion = optionalText(body.buildVersion ?? '1.0.0', BUILD_MAX, errors, 'buildVersion') || '1.0.0';
  const steps = optionalText(body.steps, STEPS_MAX, errors, 'steps');
  const preconditions = optionalText(body.preconditions, SHORT_MAX, errors, 'preconditions');
  const expected = optionalText(body.expected, SHORT_MAX, errors, 'expected');
  const actual = optionalText(body.actual, SHORT_MAX, errors, 'actual');
  const evidence = optionalText(body.evidence, SHORT_MAX, errors, 'evidence');
  const assignee = optionalText(body.assignee, ASSIGNEE_MAX, errors, 'assignee') || null;

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return {
    ok: true,
    value: {
      title, severity, priority, module, environment, foundIn, buildVersion,
      steps, preconditions, expected, actual, evidence, assignee,
    },
  };
}

export function validateBugUpdate(body) {
  if (!isPlainObject(body)) return notObjectResult();

  const errors = {};
  const value = {};
  if (body.status !== undefined) {
    value.status = requiredEnum(body.status, BUG_STATUSES, errors, 'status', 'Trạng thái');
  }
  if (body.assignee !== undefined) {
    value.assignee = optionalText(body.assignee, ASSIGNEE_MAX, errors, 'assignee') || null;
  }
  if (Object.keys(errors).length > 0) return { ok: false, errors };
  if (Object.keys(value).length === 0) {
    return { ok: false, errors: { body: 'Cần ít nhất một trường: status hoặc assignee' } };
  }
  return { ok: true, value };
}

export function validateReview(body) {
  if (!isPlainObject(body)) return notObjectResult();

  const errors = {};
  const target = requiredEnum(body.target, REVIEW_TARGETS, errors, 'target', 'Đối tượng review');
  const targetRef = trimmedString(body.targetRef) ?? '';
  if (targetRef.length < 1 || targetRef.length > REF_MAX) {
    errors.targetRef = `Tên tài liệu hoặc mã đối tượng từ 1 đến ${REF_MAX} ký tự`;
  }
  const findings = trimmedString(body.findings) ?? '';
  if (findings.length < 1 || findings.length > FINDINGS_MAX) {
    errors.findings = `Ghi nhận review từ 1 đến ${FINDINGS_MAX} ký tự`;
  }
  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, value: { target, targetRef, findings } };
}

export function validateChecklistUpdate(body) {
  if (!isPlainObject(body)) return notObjectResult();
  if (typeof body.done !== 'boolean') {
    return { ok: false, errors: { done: 'done phải là true hoặc false' } };
  }
  return { ok: true, value: { done: body.done } };
}
