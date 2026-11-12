const STATUS_LABEL = { draft: 'Nháp', ready: 'Sẵn sàng', passed: 'Đạt', failed: 'Lỗi' };
const PRIORITY_LABEL = { low: 'Thấp', medium: 'Trung bình', high: 'Cao' };
const BUG_PRIORITY_LABEL = { low: 'Thấp', medium: 'Trung bình', high: 'Cao', urgent: 'Khẩn cấp' };
const SEVERITY_LABEL = { critical: 'Nghiêm trọng', major: 'Lớn', minor: 'Nhỏ', trivial: 'Không đáng kể' };
const BUG_STATUS_LABEL = {
  new: 'Mới', assigned: 'Đã giao', in_progress: 'Đang xử lý', fixed: 'Đã sửa',
  retest: 'Kiểm thử lại', verified: 'Đã xác nhận', closed: 'Đã đóng', reopened: 'Mở lại',
  rejected: 'Từ chối', duplicate: 'Trùng lặp', deferred: 'Hoãn',
};
const RESULT_LABEL = { not_run: 'Chưa chạy', pass: 'Pass', fail: 'Fail', blocked: 'Blocked', not_applicable: 'Không áp dụng' };
const TYPE_LABEL = {
  positive: 'Positive', negative: 'Negative', boundary: 'Biên (boundary)', equivalence: 'Phân vùng tương đương',
  decision_table: 'Bảng quyết định', state_transition: 'Chuyển trạng thái', use_case: 'Use case', pairwise: 'Pairwise',
  exploratory: 'Khám phá', regression: 'Hồi quy', smoke: 'Smoke', compatibility: 'Tương thích',
  performance: 'Hiệu năng', security: 'Bảo mật',
};
const FOUND_IN_LABEL = { test: 'Kiểm thử', uat: 'UAT', production: 'Production' };
const REVIEW_TARGET_LABEL = { requirement: 'Requirement', testcase: 'Test case', design: 'Thiết kế', code: 'Source code', document: 'Tài liệu' };
const STAGE_LABEL = { pass: 'Đạt', fail: 'Lỗi', partial: 'Một phần', not_run: 'Chưa chạy' };
const SOURCE_LABEL = { manual: 'Thủ công', auto: 'Tự động', report: 'Tự động' };
const SEVERITIES = Object.keys(SEVERITY_LABEL);
const BUG_STATUSES = Object.keys(BUG_STATUS_LABEL);

const app = document.getElementById('app');
const live = document.getElementById('live');

function el(tag, props, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props ?? {})) {
    if (value === null || value === undefined || value === false) continue;
    if (key === 'text') node.textContent = value;
    else if (key.startsWith('on') && typeof value === 'function') node.addEventListener(key.slice(2), value);
    else node.setAttribute(key, value === true ? '' : String(value));
  }
  for (const child of children.flat()) {
    if (child === null || child === undefined || child === false) continue;
    node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return node;
}

function announce(message) {
  live.textContent = '';
  live.textContent = message;
}

async function api(path, options = {}) {
  const res = await fetch(path, {
    ...options,
    headers: { 'Content-Type': 'application/json' },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error ?? `Lỗi HTTP ${res.status}`);
    err.details = data.details ?? null;
    throw err;
  }
  return data;
}

function optionsOf(labels, selectedValue) {
  return Object.entries(labels).map(([value, label]) =>
    el('option', { value, selected: value === selectedValue }, label));
}

function formField(prefix, name, labelText, control) {
  const id = `${prefix}-${name}`;
  control.id = id;
  control.name = name;
  control.setAttribute('aria-describedby', `${id}-error`);
  return el('div', { class: 'field' },
    el('label', { for: id }, labelText),
    control,
    el('p', { class: 'field-error', id: `${id}-error` }),
  );
}

function showFormErrors(form, prefix, summary, errors = {}) {
  for (const input of form.querySelectorAll('[aria-describedby]')) {
    const message = errors[input.name] ?? '';
    form.querySelector(`#${prefix}-${input.name}-error`).textContent = message;
    input.setAttribute('aria-invalid', message ? 'true' : 'false');
  }
  const count = Object.keys(errors).length;
  summary.hidden = count === 0;
  summary.textContent = count === 0 ? '' : `Vui lòng sửa ${count} lỗi trong form.`;
}

function kpi(label, value, hint) {
  return el('div', { class: 'card' },
    el('div', { class: 'kpi-label' }, label),
    el('div', { class: 'kpi-value' }, value),
    el('div', { class: 'muted' }, hint),
  );
}

function table(caption, headers, rows) {
  return el('div', { class: 'table-wrap' }, el('table', null,
    el('caption', { class: 'visually-hidden' }, caption),
    el('thead', null, el('tr', null, headers.map((text) => el('th', { scope: 'col' }, text)))),
    el('tbody', null, rows),
  ));
}

function chip(status, labels) {
  return el('span', { class: `chip chip-${status}` }, labels[status] ?? status);
}

// ---------- Tổng quan ----------

async function renderOverview() {
  const [stats, { stages, reportAvailable }, auto] = await Promise.all([
    api('/api/stats'), api('/api/stages'), api('/api/autorun'),
  ]);
  const e2e = stats.e2e;
  return el('section', { 'aria-labelledby': 'overview-title' },
    el('h1', { id: 'overview-title', tabindex: '-1' }, 'Tổng quan kiểm thử'),
    el('div', { class: 'kpis' },
      kpi('Test case', stats.testcases.total, `${stats.testcases.byStatus.ready ?? 0} ở trạng thái sẵn sàng`),
      kpi('E2E đạt', e2e ? `${e2e.passRate ?? '—'}%` : '—', e2e ? `${e2e.passed}/${e2e.total} test` : 'Chưa có kết quả'),
      kpi('Bug đang mở', stats.bugs.open, `Tổng ${stats.bugs.total} bug`),
      kpi('Thời gian chạy E2E', e2e?.durationMs ? `${(e2e.durationMs / 1000).toFixed(1)} s` : '—', reportAvailable ? 'Từ lần chạy gần nhất' : 'Chạy npm test để có số liệu'),
      kpi('Tự chạy bộ test', auto.enabled ? `Mỗi ${auto.intervalMinutes} phút` : 'Tắt', auto.running
        ? 'Đang chạy…'
        : auto.lastRun ? `Lần cuối: exit ${auto.lastRun.exitCode}, ${new Date(auto.lastRun.finishedAt).toLocaleString('vi-VN')}` : 'Chưa chạy lần nào'),
    ),
    el('h2', null, 'Pipeline 14 giai đoạn'),
    el('ol', { class: 'stages' }, stages.map((stage) =>
      el('li', { class: 'stage' },
        el('span', { class: 'stage-id' }, `Giai đoạn ${stage.id}`),
        el('strong', null, stage.name),
        chip(stage.status, STAGE_LABEL),
      ))),
  );
}

// ---------- Test case ----------

function testCaseRows(items, requirementsById) {
  return items.map((item) => {
    const statusSelect = el('select', {
      'aria-label': `Trạng thái ${item.id}`,
      onchange: async (event) => {
        const next = event.target.value;
        try {
          await api(`/api/testcases/${item.id}`, { method: 'PATCH', body: { status: next } });
          announce(`${item.id} đã đổi sang ${STATUS_LABEL[next]}`);
        } catch (err) {
          announce(`Lỗi: ${err.message}`);
        }
      },
    }, optionsOf(STATUS_LABEL, item.status));
    // Kết quả chỉ do kiểm thử tự động ghi. Không có ô sửa tay.
    const resultText = item.automationKey
      ? `${RESULT_LABEL[item.result ?? 'not_run']}${item.autoResultAt ? ' (tự động)' : ' (chưa chạy)'}`
      : 'Chưa có kiểm thử tự động';
    const resultSelect = el('span', {
      class: 'auto-result',
      title: 'Kết quả do kiểm thử tự động ghi, không sửa tay',
    }, resultText);
    const reqTitle = (item.requirementIds ?? []).map((id) => requirementsById.get(id) ?? id).join(', ') || '—';
    return el('tr', null,
      el('td', null, item.id),
      el('td', null, item.title),
      el('td', null, item.module),
      el('td', null, PRIORITY_LABEL[item.priority]),
      el('td', null, TYPE_LABEL[item.testType ?? 'positive']),
      el('td', null, reqTitle),
      el('td', null, statusSelect),
      el('td', null, resultSelect),
    );
  });
}

async function loadTestCaseTable(host, filters, requirementsById) {
  const params = new URLSearchParams();
  params.set('projectId', filters.project.value);
  if (filters.status.value) params.set('status', filters.status.value);
  if (filters.result.value) params.set('result', filters.result.value);
  if (filters.q.value.trim()) params.set('q', filters.q.value.trim());
  const { items } = await api(`/api/testcases?${params}`);
  host.replaceChildren(items.length === 0
    ? el('p', { class: 'empty' }, 'Không có test case phù hợp.')
    : table('Danh sách test case',
      ['Mã', 'Tiêu đề', 'Module', 'Ưu tiên', 'Kiểu test', 'Requirement', 'Trạng thái', 'Kết quả'],
      testCaseRows(items, requirementsById)));
  return items.length;
}

function projectOptions(projects, selectedId) {
  return projects.map((p) => el('option', { value: p.id, selected: p.id === selectedId }, `${p.id} — ${p.name}`));
}

async function renderTestCases() {
  const [{ items: requirements }, { items: suites }, { items: projects }] = await Promise.all([
    api('/api/requirements'), api('/api/suites'), api('/api/projects'),
  ]);
  const requirementsById = new Map(requirements.map((req) => [req.id, req.id]));

  const projectPick = el('select', null, projectOptions(projects, 'PRJ-001'));
  const summary = el('div', { class: 'alert', role: 'alert', id: 'tc-summary', hidden: true });
  const titleInput = el('input', { type: 'text', autocomplete: 'off' });
  const moduleInput = el('input', { type: 'text', value: 'Chung', autocomplete: 'off' });
  const prioritySelect = el('select', null, optionsOf(PRIORITY_LABEL, 'medium'));
  const typeSelect = el('select', null, optionsOf(TYPE_LABEL, 'positive'));
  const requirementSelect = el('select', null,
    el('option', { value: '' }, 'Không gắn'),
    requirements.map((req) => el('option', { value: req.id }, `${req.id} — ${req.title}`)));
  const suiteSelect = el('select', null,
    el('option', { value: '' }, 'Không gắn suite'),
    suites.map((suite) => el('option', { value: suite.id }, `${suite.id} — ${suite.name}`)));
  const expectedInput = el('input', { type: 'text', autocomplete: 'off' });
  const preconditionsInput = el('input', { type: 'text', autocomplete: 'off' });
  const stepsInput = el('textarea', null);
  const testDataInput = el('input', { type: 'text', autocomplete: 'off' });
  const submitButton = el('button', { type: 'submit' }, 'Thêm test case');

  const statusFilter = el('select', { id: 'tc-filter-status', name: 'status' },
    el('option', { value: '' }, 'Tất cả'), optionsOf(STATUS_LABEL, ''));
  const resultFilter = el('select', { id: 'tc-filter-result', name: 'result' },
    el('option', { value: '' }, 'Tất cả'), optionsOf(RESULT_LABEL, ''));
  const searchInput = el('input', { id: 'tc-search', type: 'search', name: 'q', autocomplete: 'off' });
  const tableHost = el('div', { id: 'tc-table' });
  const count = el('p', { class: 'muted', id: 'tc-count' });

  const filters = { status: statusFilter, result: resultFilter, q: searchInput, project: projectPick };
  const refresh = async () => {
    const total = await loadTestCaseTable(tableHost, filters, requirementsById);
    count.textContent = `Hiển thị ${total} test case`;
  };

  const form = el('form', { class: 'card', id: 'tc-form', novalidate: true, 'aria-labelledby': 'tc-form-title' },
    el('h2', { id: 'tc-form-title', class: 'section-title' }, 'Thêm test case'),
    summary,
    el('div', { class: 'form-grid' },
      formField('tc', 'title', 'Tiêu đề', titleInput),
      formField('tc', 'module', 'Module', moduleInput),
      formField('tc', 'priority', 'Ưu tiên', prioritySelect),
      formField('tc', 'testType', 'Kiểu test', typeSelect),
      formField('tc', 'requirementId', 'Requirement', requirementSelect),
      formField('tc', 'suiteId', 'Suite', suiteSelect),
      formField('tc', 'expected', 'Kết quả mong đợi', expectedInput),
      formField('tc', 'preconditions', 'Điều kiện tiên quyết', preconditionsInput),
      formField('tc', 'testData', 'Dữ liệu test', testDataInput),
      formField('tc', 'steps', 'Các bước thực hiện', stepsInput),
      formField('tc', 'projectId', 'Dự án', projectPick),
    ),
    el('div', { class: 'form-actions' }, submitButton),
  );

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    submitButton.disabled = true;
    try {
      const created = await api('/api/testcases', {
        method: 'POST',
        body: {
          title: titleInput.value,
          module: moduleInput.value,
          priority: prioritySelect.value,
          testType: typeSelect.value,
          requirementId: requirementSelect.value,
          suiteId: suiteSelect.value,
          expected: expectedInput.value,
          projectId: projectPick.value,
          preconditions: preconditionsInput.value,
          testData: testDataInput.value,
          steps: stepsInput.value,
        },
      });
      showFormErrors(form, 'tc', summary, {});
      titleInput.value = '';
      expectedInput.value = '';
      stepsInput.value = '';
      announce(`Đã thêm ${created.id}`);
      await refresh();
    } catch (err) {
      showFormErrors(form, 'tc', summary, err.details ?? { body: err.message });
      if (!err.details) summary.hidden = false;
    } finally {
      submitButton.disabled = false;
    }
  });

  statusFilter.addEventListener('change', refresh);
  resultFilter.addEventListener('change', refresh);
  projectPick.addEventListener('change', refresh);
  searchInput.addEventListener('input', refresh);

  queueMicrotask(refresh);
  return el('section', { 'aria-labelledby': 'tc-page-title' },
    el('h1', { id: 'tc-page-title', tabindex: '-1' }, 'Test case'),
    form,
    el('section', { class: 'card', 'aria-labelledby': 'tc-list-title' },
      el('h2', { id: 'tc-list-title', class: 'section-title' }, 'Danh sách'),
      el('div', { class: 'toolbar' },
        el('div', { class: 'field' }, el('label', { for: 'tc-filter-status' }, 'Lọc theo trạng thái'), statusFilter),
        el('div', { class: 'field' }, el('label', { for: 'tc-filter-result' }, 'Lọc theo kết quả'), resultFilter),
        el('div', { class: 'field' }, el('label', { for: 'tc-search' }, 'Tìm kiếm'), searchInput),
      ),
      count,
      tableHost,
    ),
  );
}

// ---------- Bug ----------

function bugRows(items, transitions) {
  return items.map((bug) => {
    const allowed = [bug.status, ...(transitions[bug.status] ?? [])];
    const statusSelect = el('select', {
      'aria-label': `Trạng thái ${bug.id}`,
      disabled: (transitions[bug.status] ?? []).length === 0,
      onchange: async (event) => {
        const next = event.target.value;
        try {
          await api(`/api/bugs/${bug.id}`, { method: 'PATCH', body: { status: next } });
          announce(`${bug.id} đã chuyển sang ${BUG_STATUS_LABEL[next]}`);
          window.dispatchEvent(new HashChangeEvent('hashchange'));
        } catch (err) {
          announce(`Lỗi: ${err.message}`);
          event.target.value = bug.status;
        }
      },
    }, allowed.map((status) => el('option', { value: status, selected: status === bug.status }, BUG_STATUS_LABEL[status])));
    return el('tr', null,
      el('td', null, bug.id),
      el('td', null, bug.title),
      el('td', null, SEVERITY_LABEL[bug.severity]),
      el('td', null, BUG_PRIORITY_LABEL[bug.priority ?? 'medium']),
      el('td', null, statusSelect),
      el('td', null, bug.assignee ?? '—'),
    );
  });
}

async function renderBugs() {
  const { items: projects } = await api('/api/projects');
  const projectPick = el('select', null, projectOptions(projects, 'PRJ-001'));
  const summary = el('div', { class: 'alert', role: 'alert', id: 'bug-summary', hidden: true });
  const titleInput = el('input', { type: 'text', autocomplete: 'off' });
  const severitySelect = el('select', null, optionsOf(SEVERITY_LABEL, 'major'));
  const prioritySelect = el('select', null, optionsOf(BUG_PRIORITY_LABEL, 'medium'));
  const moduleInput = el('input', { type: 'text', value: 'Chung', autocomplete: 'off' });
  const environmentSelect = el('select', null, ['DEV', 'SIT', 'QA', 'UAT', 'STAGING', 'PROD'].map((env) =>
    el('option', { value: env, selected: env === 'QA' }, env)));
  const buildInput = el('input', { type: 'text', value: '1.0.0', autocomplete: 'off' });
  const foundInSelect = el('select', null, optionsOf(FOUND_IN_LABEL, 'test'));
  const preconditionsInput = el('textarea', null);
  const stepsInput = el('textarea', null);
  const expectedInput = el('input', { type: 'text', autocomplete: 'off' });
  const actualInput = el('input', { type: 'text', autocomplete: 'off' });
  const evidenceInput = el('textarea', null);
  const assigneeInput = el('input', { type: 'text', autocomplete: 'off' });
  const submitButton = el('button', { type: 'submit' }, 'Báo bug');
  const listHost = el('div', { id: 'bug-table' });

  const refresh = async () => {
    const { items, transitions } = await api(`/api/bugs?projectId=${encodeURIComponent(projectPick.value)}`);
    listHost.replaceChildren(items.length === 0
      ? el('p', { class: 'empty' }, 'Chưa có bug nào được báo.')
      : table('Danh sách bug', ['Mã', 'Tiêu đề', 'Mức độ', 'Ưu tiên', 'Trạng thái', 'Người xử lý'],
        bugRows(items, transitions)));
  };

  const form = el('form', { class: 'card', id: 'bug-form', novalidate: true, 'aria-labelledby': 'bug-form-title' },
    el('h2', { id: 'bug-form-title', class: 'section-title' }, 'Báo bug mới'),
    summary,
    el('div', { class: 'form-grid' },
      formField('bug', 'title', 'Tiêu đề bug', titleInput),
      formField('bug', 'projectId', 'Dự án', projectPick),
      formField('bug', 'severity', 'Mức độ', severitySelect),
      formField('bug', 'priority', 'Ưu tiên sửa', prioritySelect),
      formField('bug', 'module', 'Module', moduleInput),
      formField('bug', 'environment', 'Môi trường', environmentSelect),
      formField('bug', 'buildVersion', 'Phiên bản build', buildInput),
      formField('bug', 'foundIn', 'Tìm thấy ở', foundInSelect),
      formField('bug', 'assignee', 'Người xử lý', assigneeInput),
      formField('bug', 'preconditions', 'Điều kiện tiên quyết', preconditionsInput),
      formField('bug', 'steps', 'Các bước tái hiện', stepsInput),
      formField('bug', 'expected', 'Kết quả mong đợi', expectedInput),
      formField('bug', 'actual', 'Kết quả thực tế', actualInput),
      formField('bug', 'evidence', 'Bằng chứng (ảnh, log, ghi chú)', evidenceInput),
    ),
    el('div', { class: 'form-actions' }, submitButton),
  );

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    submitButton.disabled = true;
    try {
      const created = await api('/api/bugs', {
        method: 'POST',
        body: {
          title: titleInput.value,
          severity: severitySelect.value,
          projectId: projectPick.value,
          priority: prioritySelect.value,
          module: moduleInput.value,
          environment: environmentSelect.value,
          buildVersion: buildInput.value,
          foundIn: foundInSelect.value,
          assignee: assigneeInput.value,
          preconditions: preconditionsInput.value,
          steps: stepsInput.value,
          expected: expectedInput.value,
          actual: actualInput.value,
          evidence: evidenceInput.value,
        },
      });
      showFormErrors(form, 'bug', summary, {});
      titleInput.value = '';
      stepsInput.value = '';
      announce(`Đã báo ${created.id}`);
      await refresh();
    } catch (err) {
      showFormErrors(form, 'bug', summary, err.details ?? { body: err.message });
      if (!err.details) summary.hidden = false;
    } finally {
      submitButton.disabled = false;
    }
  });

  projectPick.addEventListener('change', refresh);
  queueMicrotask(refresh);
  return el('section', { 'aria-labelledby': 'bug-page-title' },
    el('h1', { id: 'bug-page-title', tabindex: '-1' }, 'Bug'),
    form,
    el('section', { class: 'card', 'aria-labelledby': 'bug-list-title' },
      el('h2', { id: 'bug-list-title', class: 'section-title' }, 'Danh sách bug'),
      listHost,
    ),
  );
}

// ---------- Kế hoạch và review ----------

function reviewRows(items) {
  return items.map((review) => el('tr', null,
    el('td', null, review.id),
    el('td', null, REVIEW_TARGET_LABEL[review.target]),
    el('td', null, review.targetRef),
    el('td', null, review.findings),
  ));
}

function listOf(items) {
  return el('ul', { class: 'plain-list' }, items.map((text) => el('li', null, text)));
}

async function renderPlan() {
  const [plan, { items: reviews }, health] = await Promise.all([
    api('/api/plan'), api('/api/reviews'), api('/api/health'),
  ]);
  const summary = el('div', { class: 'alert', role: 'alert', id: 'rev-summary', hidden: true });
  const targetSelect = el('select', null, optionsOf(REVIEW_TARGET_LABEL, 'requirement'));
  const refInput = el('input', { type: 'text', autocomplete: 'off' });
  const findingsInput = el('textarea', null);
  const submitButton = el('button', { type: 'submit' }, 'Ghi nhận review');
  const listHost = el('div', { id: 'rev-table' });

  const refreshReviews = async () => {
    const { items } = await api('/api/reviews');
    listHost.replaceChildren(items.length === 0
      ? el('p', { class: 'empty' }, 'Chưa có review nào được ghi nhận.')
      : table('Danh sách review', ['Mã', 'Đối tượng', 'Tên / mã', 'Ghi nhận'], reviewRows(items)));
  };

  const form = el('form', { class: 'card', id: 'rev-form', novalidate: true, 'aria-labelledby': 'rev-form-title' },
    el('h2', { id: 'rev-form-title', class: 'section-title' }, 'Ghi nhận review (kiểm thử tĩnh)'),
    summary,
    el('div', { class: 'form-grid' },
      formField('rev', 'target', 'Đối tượng review', targetSelect),
      formField('rev', 'targetRef', 'Tên tài liệu hoặc mã', refInput),
      formField('rev', 'findings', 'Ghi nhận', findingsInput),
    ),
    el('div', { class: 'form-actions' }, submitButton),
  );

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    submitButton.disabled = true;
    try {
      const created = await api('/api/reviews', {
        method: 'POST',
        body: { target: targetSelect.value, targetRef: refInput.value, findings: findingsInput.value },
      });
      showFormErrors(form, 'rev', summary, {});
      refInput.value = '';
      findingsInput.value = '';
      announce(`Đã ghi nhận ${created.id}`);
      await refreshReviews();
    } catch (err) {
      showFormErrors(form, 'rev', summary, err.details ?? { body: err.message });
      if (!err.details) summary.hidden = false;
    } finally {
      submitButton.disabled = false;
    }
  });

  queueMicrotask(refreshReviews);
  const envRows = plan.environments.map((env) => el('tr', null,
    el('td', null, env.name),
    el('td', null, env.purpose),
    el('td', null, env.name === health.environment ? 'Đang dùng' : '—'),
  ));
  const riskRows = plan.risks.map((risk) => el('tr', null,
    el('td', null, risk.id),
    el('td', null, risk.description),
    el('td', null, `${risk.likelihood} × ${risk.impact} = ${risk.likelihood * risk.impact}`),
    el('td', null, risk.mitigation),
  ));

  return el('section', { 'aria-labelledby': 'plan-title' },
    el('h1', { id: 'plan-title', tabindex: '-1' }, 'Kế hoạch và review'),
    el('div', { class: 'two-col' },
      el('div', { class: 'card' }, el('h2', { class: 'section-title' }, 'Phạm vi kiểm thử'), listOf(plan.scope)),
      el('div', { class: 'card' }, el('h2', { class: 'section-title' }, 'Ngoài phạm vi'), listOf(plan.outOfScope)),
      el('div', { class: 'card' }, el('h2', { class: 'section-title' }, 'Entry criteria'), listOf(plan.entryCriteria)),
      el('div', { class: 'card' }, el('h2', { class: 'section-title' }, 'Exit criteria'), listOf(plan.exitCriteria)),
    ),
    el('h2', null, 'Cấp độ kiểm thử (ISTQB)'),
    table('Cấp độ kiểm thử', ['Cấp độ', 'Người thực hiện', 'Ví dụ'],
      plan.testLevels.map((level) => el('tr', null, el('td', null, level.name), el('td', null, level.who), el('td', null, level.example)))),
    el('h2', null, 'Loại kiểm thử'),
    table('Loại kiểm thử', ['Loại', 'Mục đích'],
      plan.testTypes.map((type) => el('tr', null, el('td', null, type.name), el('td', null, type.purpose)))),
    el('h2', null, 'Kỹ thuật thiết kế test case'),
    el('div', { class: 'card' }, listOf(plan.techniques)),
    el('h2', null, 'Môi trường'),
    table('Môi trường kiểm thử', ['Môi trường', 'Mục đích', 'Trạng thái'], envRows),
    el('h2', null, 'Công cụ'),
    table('Công cụ', ['Nhóm', 'Công cụ'],
      plan.tools.map((tool) => el('tr', null, el('td', null, tool.category), el('td', null, tool.tools)))),
    el('h2', null, 'Rủi ro (xác suất × tác động)'),
    table('Rủi ro', ['Mã', 'Mô tả', 'Điểm', 'Biện pháp'], riskRows),
    el('h2', null, 'Câu hỏi cần làm rõ'),
    el('div', { class: 'card' }, listOf(plan.openQuestions)),
    el('h2', null, 'Review tài liệu'),
    form,
    el('section', { class: 'card', 'aria-labelledby': 'rev-list-title' },
      el('h2', { id: 'rev-list-title', class: 'section-title' }, 'Các review đã ghi nhận'),
      listHost,
    ),
  );
}

// ---------- Tổng kết ----------

async function renderSummary(projectId = 'PRJ-001') {
  const [s, plan, { items: projects }] = await Promise.all([
    api(`/api/summary?projectId=${encodeURIComponent(projectId)}`), api('/api/plan'), api('/api/projects'),
  ]);
  const projectPick = el('select', {
    id: 'summary-project',
    onchange: async (event) => {
      app.replaceChildren(el('p', { class: 'muted', role: 'status' }, 'Đang tải…'));
      app.replaceChildren(await renderSummary(event.target.value));
    },
  }, projectOptions(projects, projectId));
  const pct = (value) => (value === null ? '—' : `${value}%`);
  const criteriaRows = s.exitCriteria.map((item) => el('tr', null,
    el('td', null, item.name),
    el('td', null, el('span', { class: `chip ${item.ok ? 'chip-pass' : 'chip-fail'}` }, item.ok ? 'Đạt' : 'Chưa đạt')),
    el('td', null, item.detail),
    el('td', null, item.action ?? '—'),
  ));
  const resultRows = Object.keys(RESULT_LABEL).map((key) => el('tr', null,
    el('td', null, RESULT_LABEL[key]),
    el('td', null, s.execution.byResult[key] ?? 0),
  ));
  const severityRows = SEVERITIES.map((key) => el('tr', null,
    el('td', null, SEVERITY_LABEL[key]),
    el('td', null, s.bugs.bySeverity[key] ?? 0),
  ));
  return el('section', { 'aria-labelledby': 'summary-title' },
    el('h1', { id: 'summary-title', tabindex: '-1' }, 'Tổng kết kiểm thử'),
    el('div', { class: 'field' }, el('label', { for: 'summary-project' }, 'Dự án'), projectPick),
    el('div', { class: 'kpis' },
      kpi('Tỉ lệ pass', pct(s.execution.passRate), `${s.execution.byResult.pass} Pass / ${s.execution.byResult.fail} Fail`),
      kpi('Requirement coverage', pct(s.requirements.percent), `${s.requirements.covered}/${s.requirements.total} yêu cầu có test`),
      kpi('Bug đang mở', s.bugs.open, `${s.bugs.openCritical} mức Nghiêm trọng`),
      kpi('Thời gian xử lý TB', s.bugs.avgResolutionHours === null ? '—' : `${s.bugs.avgResolutionHours} giờ`, 'Từ lúc báo đến lúc đóng'),
    ),
    el('div', { class: 'card verdict', role: 'status' },
      el('strong', null, s.readyForRelease ? 'Đủ điều kiện bàn giao' : 'Chưa đủ điều kiện bàn giao'),
      el('span', { class: 'muted' }, s.readyForRelease
        ? 'Đã đạt toàn bộ exit criteria.'
        : `${s.exitCriteria.filter((item) => !item.ok).length}/${s.exitCriteria.length} tiêu chí exit chưa đạt. Xem hành động kiểm soát bên dưới.`)),
    el('h2', null, 'Exit criteria và kiểm soát'),
    table('Exit criteria', ['Tiêu chí', 'Kết quả', 'Chi tiết', 'Hành động kiểm soát'], criteriaRows),
    el('div', { class: 'two-col' },
      el('div', null,
        el('h2', null, 'Kết quả thực thi'),
        table('Kết quả thực thi', ['Kết quả', 'Số test case'], resultRows)),
      el('div', null,
        el('h2', null, 'Bug theo mức độ'),
        table('Bug theo mức độ', ['Mức độ', 'Số lượng'], severityRows)),
    ),
    el('h2', null, 'Chỉ số giám sát'),
    el('div', { class: 'card' }, listOf([
      `Tỉ lệ fail: ${pct(s.execution.failRate)}`,
      `Đã thực thi: ${pct(s.execution.executedPercent)} test case`,
      `Lỗi lọt sang production: ${pct(s.bugs.leakagePercent)} trên tổng số bug`,
      `Mật độ lỗi: ${s.bugs.defectDensity ?? '—'} bug trên mỗi requirement`,
    ])),
    el('h2', null, 'Bài học rút ra (Lessons learned)'),
    el('div', { class: 'card' }, listOf(plan.lessonsLearned)),
  );
}

// ---------- Checklist ----------

function stlcRows(phases) {
  return phases.map((phase) => el('tr', null,
    el('td', null, phase.id),
    el('td', null, phase.name),
    el('td', null, el('span', { class: `chip chip-${phase.status}` }, STAGE_LABEL[phase.status])),
    el('td', null, phase.note),
  ));
}

function qaChecklistSection(items, done) {
  const groups = [...new Set(items.map((item) => item.group))];
  const progress = el('p', { class: 'muted', id: 'qa-progress', role: 'status' }, `Đã hoàn thành ${done}/${items.length}`);
  let doneCount = done;
  const groupBlocks = groups.map((group) => el('div', { class: 'card' },
    el('h3', { class: 'section-title' }, group),
    el('ul', { class: 'plain-list' }, items.filter((item) => item.group === group).map((item) => {
      const box = el('input', {
        type: 'checkbox',
        id: `cl-${item.id}`,
        checked: item.done,
        onchange: async (event) => {
          const next = event.target.checked;
          try {
            await api(`/api/checklist/${item.id}`, { method: 'PATCH', body: { done: next } });
            doneCount += next ? 1 : -1;
            progress.textContent = `Đã hoàn thành ${doneCount}/${items.length}`;
            announce(`${item.text}: ${next ? 'đã xong' : 'chưa xong'}`);
          } catch (err) {
            event.target.checked = !next;
            announce(`Lỗi: ${err.message}`);
          }
        },
      });
      return el('li', { class: 'check-item' }, el('label', { for: `cl-${item.id}` }, box, ' ', item.text));
    })),
  ));
  return el('section', { 'aria-labelledby': 'qa-checklist-title' },
    el('h2', { id: 'qa-checklist-title' }, 'Checklist dự án QA (36 mục)'),
    progress,
    ...groupBlocks,
  );
}

async function renderChecklist() {
  const [{ stages, reportAvailable }, { phases }, checklist] = await Promise.all([
    api('/api/stages'), api('/api/stlc'), api('/api/checklist'),
  ]);
  return el('section', { 'aria-labelledby': 'checklist-title' },
    el('h1', { id: 'checklist-title', tabindex: '-1' }, 'Checklist'),
    el('h2', null, 'Quy trình STLC (7 giai đoạn)'),
    el('p', { class: 'muted' }, 'Trạng thái tính từ dữ liệu thật trong hệ thống.'),
    table('Quy trình STLC', ['#', 'Giai đoạn', 'Trạng thái', 'Ghi chú'], stlcRows(phases)),
    el('h2', null, 'Checklist 14 giai đoạn kiểm thử web'),
    el('p', { class: 'muted' },
      reportAvailable
        ? 'Trạng thái tự động lấy từ báo cáo Playwright gần nhất.'
        : 'Chưa có báo cáo. Chạy npm test trong thư mục qa-hub rồi tải lại trang.'),
    table('Trạng thái 14 giai đoạn kiểm thử web', ['#', 'Giai đoạn', 'Cách kiểm', 'Trạng thái', 'Ghi chú'],
      stages.map((stage) => el('tr', null,
        el('td', null, stage.id),
        el('td', null, stage.name),
        el('td', null, SOURCE_LABEL[stage.source]),
        el('td', null, el('span', { class: `chip chip-${stage.status}` }, STAGE_LABEL[stage.status])),
        el('td', null, stage.note),
      ))),
    qaChecklistSection(checklist.items, checklist.done),
  );
}

// ---------- Dự án ----------

const SOURCE_TYPE_LABEL = { local: 'Thư mục trên máy', github: 'GitHub', domain: 'Domain', manual: 'Nhập tay', zip: 'File zip' };

function projectRows(items) {
  return items.map((p) => el('tr', null,
    el('td', null, p.id),
    el('td', null, el('a', { href: `#/projects/${p.id}` }, p.name)),
    el('td', null, SOURCE_TYPE_LABEL[p.sourceType]),
    el('td', null, p.sourceRef ?? '—'),
    el('td', null, p.testcaseCount),
    el('td', null, p.bugsOpen),
    el('td', null, p.runCount),
  ));
}

async function renderProjects() {
  const { items, steps } = await api('/api/projects');
  const summary = el('div', { class: 'alert', role: 'alert', id: 'pj-summary', hidden: true });
  const nameInput = el('input', { type: 'text', autocomplete: 'off' });
  const typeSelect = el('select', null, optionsOf(SOURCE_TYPE_LABEL, 'manual'));
  const refInput = el('input', { type: 'text', autocomplete: 'off', placeholder: 'https://github.com/owner/repo' });
  const ownership = el('input', { type: 'checkbox', name: 'ownershipConfirmed', id: 'pj-ownershipConfirmed', 'aria-describedby': 'pj-ownershipConfirmed-error' });
  const autoTests = el('input', { type: 'checkbox', name: 'autoTests', id: 'pj-autoTests' });
  const submit = el('button', { type: 'submit' }, 'Thêm dự án');
  const form = el('form', { class: 'card', id: 'pj-form', novalidate: true, 'aria-labelledby': 'pj-form-title' },
    el('h2', { id: 'pj-form-title', class: 'section-title' }, 'Thêm dự án'),
    summary,
    el('div', { class: 'form-grid' },
      formField('pj', 'name', 'Tên dự án', nameInput),
      formField('pj', 'sourceType', 'Nguồn', typeSelect),
      formField('pj', 'sourceRef', 'Link hoặc đường dẫn', refInput),
      el('div', { class: 'field' },
        el('label', { for: 'pj-ownershipConfirmed' }, ownership, ' Tôi có quyền kiểm thử domain này (bắt buộc với domain)'),
        el('p', { class: 'field-error', id: 'pj-ownershipConfirmed-error' })),
      el('div', { class: 'field' },
        el('label', { for: 'pj-autoTests' }, autoTests,
          ' Cho bot cài và chạy test của dự án zip/GitHub sau khi quét virus sạch (mã lạ có thể nguy hiểm, chỉ bật khi tin nguồn)')),
    ),
    el('div', { class: 'form-actions' }, submit),
    el('p', { class: 'muted' }, 'Mã nguồn được quét virus trước khi đọc. Chạy test chỉ khi bạn bật tùy chọn trên.'),
  );
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    submit.disabled = true;
    try {
      const created = await api('/api/projects', { method: 'POST', body: {
        name: nameInput.value,
        sourceType: typeSelect.value,
        sourceRef: refInput.value,
        ownershipConfirmed: ownership.checked,
        autoTests: autoTests.checked,
      } });
      showFormErrors(form, 'pj', summary, {});
      announce(`Đã thêm ${created.id}`);
      window.location.hash = `#/projects/${created.id}`;
    } catch (err) {
      showFormErrors(form, 'pj', summary, err.details ?? { body: err.message });
      if (!err.details) summary.hidden = false;
    } finally {
      submit.disabled = false;
    }
  });
  return el('section', { 'aria-labelledby': 'projects-title' },
    el('h1', { id: 'projects-title', tabindex: '-1' }, 'Dự án'),
    el('p', { class: 'muted' }, `Mỗi dự án có ${steps.length} bước quy trình và lịch sử lần chạy riêng.`),
    table('Danh sách dự án', ['Mã', 'Tên', 'Nguồn', 'Tham chiếu', 'Test case', 'Bug mở', 'Lần chạy'], projectRows(items)),
    form,
  );
}

function zipSection(project, id) {
  if (project.sourceType !== 'zip') return null;
  const input = el('input', { type: 'file', id: 'zip-file', accept: '.zip,application/zip', 'aria-describedby': 'zip-error' });
  const error = el('p', { class: 'field-error', id: 'zip-error' });
  const button = el('button', { type: 'button', onclick: async () => {
    const file = input.files?.[0];
    if (!file) {
      error.textContent = 'Chọn file .zip trước';
      return;
    }
    button.disabled = true;
    error.textContent = '';
    try {
      const res = await fetch(`/api/projects/${id}/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/zip', 'X-File-Name': encodeURIComponent(file.name) },
        body: file,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? `Lỗi HTTP ${res.status}`);
      announce('Đã giải nén file zip');
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    } catch (err) {
      error.textContent = err.message;
      button.disabled = false;
    }
  } }, 'Upload và giải nén');
  return el('div', { class: 'card' },
    el('h2', { class: 'section-title' }, 'Mã nguồn từ file zip'),
    el('p', null, project.localPath ? `Đã có mã nguồn: ${project.sourceRef}` : 'Chưa có mã nguồn. Chọn file zip (tối đa 20 MB, không chứa mật khẩu).'),
    el('div', { class: 'field' }, el('label', { for: 'zip-file' }, 'File .zip'), input, error),
    el('div', { class: 'form-actions' }, button));
}

function scanSection(project, id) {
  if (project.sourceType !== 'domain') return null;
  const scan = project.scan;
  const button = el('button', { type: 'button', disabled: !project.ownershipConfirmed, onclick: async () => {
    button.disabled = true;
    try {
      await api(`/api/projects/${id}/scan`, { method: 'POST' });
      announce('Đã quét xong');
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    } catch (err) {
      announce(`Lỗi: ${err.message}`);
      button.disabled = false;
    }
  } }, 'Quét domain');
  return el('div', { class: 'card' },
    el('h2', { class: 'section-title' }, 'Quét domain'),
    el('p', { class: 'muted' }, 'Chỉ đọc: gửi GET tới trang chủ và một đường dẫn không tồn tại. Không đăng nhập, không gửi form, không quét địa chỉ nội bộ.'),
    button,
    scan
      ? table('Kết quả quét', ['Kiểm tra', 'Kết quả', 'Chi tiết'], scan.checks.map((c) => el('tr', null,
        el('td', null, c.name),
        el('td', null, el('span', { class: `chip ${c.ok ? 'chip-pass' : 'chip-fail'}` }, c.ok ? 'Đạt' : 'Chưa đạt')),
        el('td', null, c.detail),
      )))
      : el('p', { class: 'empty' }, 'Chưa quét.'),
    scan ? el('p', null, `${scan.passed}/${scan.total} kiểm tra đạt · ${new Date(scan.scannedAt).toLocaleString('vi-VN')}`) : null);
}

function aiSection(project, id, items) {
  const consent = el('input', { type: 'checkbox', id: 'ai-consent' });
  const review = project.checklistAi;
  const itemText = Object.fromEntries(items.map((i) => [i.id, i.text]));
  const boxes = new Map();
  const rows = (review?.suggestions ?? []).map((s) => {
    const box = el('input', { type: 'checkbox', id: `ai-${s.id}`, 'aria-label': `Áp dụng ${s.id}`, disabled: !s.done, checked: s.done });
    boxes.set(s.id, box);
    return el('tr', null,
      el('td', null, s.id),
      el('td', null, itemText[s.id] ?? ''),
      el('td', null, s.done ? 'Đã làm' : 'Chưa đủ bằng chứng'),
      el('td', null, s.evidence ?? '—'),
      el('td', null, s.reason || '—'),
      el('td', null, box),
    );
  });
  const runButton = el('button', { type: 'button', onclick: async () => {
    try {
      await api(`/api/projects/${id}/ai-review`, { method: 'POST', body: { consent: consent.checked } });
      announce('Đã đọc mã và có gợi ý');
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    } catch (err) {
      announce(`Lỗi: ${err.message}`);
    }
  } }, 'AI đọc mã và gợi ý');
  const applyButton = el('button', { type: 'button', onclick: async () => {
    const ids = [...boxes.entries()].filter(([, box]) => box.checked).map(([key]) => key);
    try {
      await api(`/api/projects/${id}/ai-review/apply`, { method: 'POST', body: { ids } });
      announce(`Đã tick ${ids.length} mục`);
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    } catch (err) {
      announce(`Lỗi: ${err.message}`);
    }
  } }, 'Áp dụng mục đã chọn');
  return el('div', { class: 'card' },
    el('h2', { class: 'section-title' }, 'AI đọc mã để gợi ý tick checklist'),
    el('p', { class: 'muted' }, 'Nếu server có ANTHROPIC_API_KEY, trích đoạn mã (đã ẩn bí mật) được gửi tới Claude API. Nếu không có key, chỉ dùng luật dự phòng và không gửi mã đi đâu. Mọi gợi ý "đã làm" đều phải có file bằng chứng tồn tại.'),
    el('label', { class: 'check-item', for: 'ai-consent' }, consent, ' Đồng ý gửi trích đoạn mã tới Claude API (chỉ cần khi có key)'),
    runButton,
    review
      ? el('p', null, `Chế độ: ${review.mode === 'ai' ? 'AI' : 'luật dự phòng'} · ${review.fileCount} file · ${new Date(review.reviewedAt).toLocaleString('vi-VN')}${review.note ? ` · ${review.note}` : ''}`)
      : el('p', { class: 'empty' }, 'Chưa có gợi ý.'),
    review ? table('Gợi ý tick checklist', ['Mã', 'Nội dung', 'Gợi ý', 'Bằng chứng', 'Lý do', 'Áp dụng'], rows) : null,
    review ? el('div', { class: 'form-actions' }, applyButton) : null);
}

function projectChecklistSection(id, items) {
  const groups = [...new Set(items.map((i) => i.group))];
  let count = items.filter((i) => i.done).length;
  const progress = el('p', { class: 'muted', role: 'status' }, `Đã tick ${count}/${items.length}`);
  return el('section', { 'aria-labelledby': 'pc-title' },
    el('h2', { id: 'pc-title' }, 'Checklist QA của dự án'),
    progress,
    ...groups.map((group) => el('div', { class: 'card' },
      el('h3', { class: 'section-title' }, group),
      el('ul', { class: 'plain-list' }, items.filter((i) => i.group === group).map((item) => {
        const box = el('input', {
          type: 'checkbox',
          id: `pc-${item.id}`,
          checked: item.done,
          onchange: async (event) => {
            const next = event.target.checked;
            try {
              await api(`/api/projects/${id}/checklist/${item.id}`, { method: 'PATCH', body: { done: next } });
              count += next ? 1 : -1;
              progress.textContent = `Đã tick ${count}/${items.length}`;
              announce(`${item.text}: ${next ? 'đã xong' : 'chưa xong'}`);
            } catch (err) {
              event.target.checked = !next;
              announce(`Lỗi: ${err.message}`);
            }
          },
        });
        return el('li', { class: 'check-item' }, el('label', { for: `pc-${item.id}` }, box, ' ', item.text));
      })),
    )),
  );
}

async function renderProject(id) {
  const [{ project, steps, runs }, { items: checklistItems }] = await Promise.all([
    api(`/api/projects/${id}`), api(`/api/projects/${id}/checklist`),
  ]);
  const external = project.sourceType !== 'local';
  const confirmBox = el('input', { type: 'checkbox', id: 'pj-run-confirm' });
  const stepList = el('ul', { class: 'plain-list' }, steps.map((step) => {
    const box = el('input', {
      type: 'checkbox',
      id: `wf-${step.key}`,
      checked: Boolean(project.workflow[step.key]),
      onchange: async (event) => {
        const done = event.target.checked;
        try {
          await api(`/api/projects/${id}/workflow/${step.key}`, { method: 'PATCH', body: { done, confirmed: confirmBox.checked } });
          announce(`${step.name}: ${done ? 'đã làm' : 'chưa làm'}`);
        } catch (err) {
          event.target.checked = !done;
          announce(`Lỗi: ${err.message}`);
        }
      },
    });
    const needs = external && step.needsConfirm;
    return el('li', { class: 'check-item' },
      el('label', { for: `wf-${step.key}` }, box, ' ', step.name, needs ? el('span', { class: 'muted' }, ' (cần xác nhận)') : null));
  }));

  const notes = el('textarea', { id: 'pj-notes', name: 'extraFindings', 'aria-describedby': 'pj-notes-error' }, project.extraFindings ?? '');
  const notesError = el('p', { class: 'field-error', id: 'pj-notes-error' });
  const notesSave = el('button', { type: 'button', onclick: async () => {
    try {
      await api(`/api/projects/${id}/notes`, { method: 'PATCH', body: { extraFindings: notes.value } });
      notesError.textContent = '';
      announce('Đã lưu lỗi phát hiện thêm');
    } catch (err) {
      notesError.textContent = err.details?.extraFindings ?? err.message;
    }
  } }, 'Lưu lỗi phát hiện thêm');

  const runNote = el('input', { type: 'text', id: 'pj-run-note', autocomplete: 'off' });
  const runButton = el('button', { type: 'button', onclick: async () => {
    try {
      await api(`/api/projects/${id}/runs`, { method: 'POST', body: { note: runNote.value } });
      announce('Đã ghi lần chạy vào lịch sử');
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    } catch (err) {
      announce(`Lỗi: ${err.message}`);
    }
  } }, 'Ghi lần chạy vào lịch sử');

  const runRows = runs.map((run) => el('tr', null,
    el('td', null, new Date(run.finishedAt).toLocaleString('vi-VN')),
    el('td', null, run.snapshot.total),
    el('td', null, run.snapshot.byResult.pass),
    el('td', null, run.snapshot.byResult.fail),
    el('td', null, run.snapshot.byResult.blocked),
    el('td', null, run.snapshot.byResult.not_run),
    el('td', null, run.snapshot.bugsOpen),
    el('td', null, run.note || '—'),
  ));

  return el('section', { 'aria-labelledby': 'project-title' },
    el('h1', { id: 'project-title', tabindex: '-1' }, project.name),
    el('p', { class: 'muted' }, `${project.id} · ${SOURCE_TYPE_LABEL[project.sourceType]}${project.sourceRef ? ` · ${project.sourceRef}` : ''}`),
    el('p', null, el('a', { href: `#/projects/${id}/report` }, 'Mở báo cáo để in')),
    zipSection(project, id),
    scanSection(project, id),
    project.sourceType === 'github'
      ? el('div', { class: 'card' },
        el('p', null, project.workflow.clone ? 'Đã lấy mã nguồn về thư mục riêng.' : 'Chưa lấy mã nguồn. Bước này chỉ clone repo, chưa chạy code của repo.'),
        el('button', { type: 'button', disabled: project.workflow.clone, onclick: async (event) => {
          event.target.disabled = true;
          try {
            await api(`/api/projects/${id}/clone`, { method: 'POST' });
            announce('Đã lấy mã nguồn');
            window.dispatchEvent(new HashChangeEvent('hashchange'));
          } catch (err) {
            event.target.disabled = false;
            announce(`Lỗi: ${err.message}`);
          }
        } }, 'Lấy mã nguồn (clone)'))
      : null,
    el('h2', null, 'Quy trình'),
    el('div', { class: 'card' },
      external ? el('label', { class: 'check-item' }, confirmBox, ' Tôi xác nhận các bước cần xác nhận được chạy trên mã của dự án này') : null,
      stepList),
    el('h2', null, 'Lỗi phát hiện thêm ngoài checklist'),
    el('div', { class: 'card' },
      el('div', { class: 'field' }, el('label', { for: 'pj-notes' }, 'Ghi nhận'), notes, notesError),
      el('div', { class: 'form-actions' }, notesSave)),
    aiSection(project, id, checklistItems),
    projectChecklistSection(id, checklistItems),
    el('h2', null, 'Ghi lần chạy'),
    el('div', { class: 'card' },
      el('div', { class: 'field' }, el('label', { for: 'pj-run-note' }, 'Ghi chú lần chạy'), runNote),
      el('div', { class: 'form-actions' }, runButton)),
    el('h2', null, 'Lịch sử'),
    runs.length
      ? table('Lịch sử lần chạy', ['Thời điểm', 'Tổng', 'Pass', 'Fail', 'Blocked', 'Chưa chạy', 'Bug mở', 'Ghi chú'], runRows)
      : el('p', { class: 'empty' }, 'Chưa có lần chạy nào.'),
  );
}

async function renderPrintReport(id) {
  const r = await api(`/api/projects/${id}/report`);
  const s = r.summary;
  const extra = el('textarea', { id: 'rp-extra', name: 'extra' }, r.extraFindings);
  return el('section', { class: 'report', 'aria-labelledby': 'report-title' },
    el('div', { class: 'no-print' },
      el('p', null, el('a', { href: `#/projects/${id}` }, '← Quay lại dự án')),
      el('button', { type: 'button', onclick: () => window.print() }, 'In báo cáo')),
    el('h1', { id: 'report-title', tabindex: '-1' }, `Báo cáo kiểm thử — ${r.project.name}`),
    el('p', { class: 'muted' }, `Mã dự án ${r.project.id} · Lập lúc ${new Date(r.generatedAt).toLocaleString('vi-VN')}`),

    el('h2', null, '1. Thông tin chung'),
    table('Thông tin chung', ['Mục', 'Nội dung'], [
      el('tr', null, el('td', null, 'Nguồn'), el('td', null, `${SOURCE_TYPE_LABEL[r.project.sourceType]}${r.project.sourceRef ? ` — ${r.project.sourceRef}` : ''}`)),
      el('tr', null, el('td', null, 'Người thực hiện'), el('td', null, el('input', { type: 'text', 'aria-label': 'Người thực hiện', value: '' }))),
      el('tr', null, el('td', null, 'Môi trường'), el('td', null, el('input', { type: 'text', 'aria-label': 'Môi trường', value: '' }))),
      el('tr', null, el('td', null, 'Phiên bản build'), el('td', null, el('input', { type: 'text', 'aria-label': 'Phiên bản build', value: '' }))),
    ]),

    el('h2', null, '2. Quy trình (checklist)'),
    el('ul', { class: 'plain-list' }, r.steps.map((step) => el('li', null, `${step.done ? '☑' : '☐'} ${step.name}`))),

    el('h2', null, '3. Kết quả test case'),
    table('Tổng kết kết quả', ['Chỉ số', 'Giá trị'], [
      el('tr', null, el('td', null, 'Tổng test case'), el('td', null, s.execution.total)),
      el('tr', null, el('td', null, 'Pass / Fail / Blocked'), el('td', null, `${s.execution.byResult.pass} / ${s.execution.byResult.fail} / ${s.execution.byResult.blocked}`)),
      el('tr', null, el('td', null, 'Chưa chạy'), el('td', null, s.execution.byResult.not_run)),
      el('tr', null, el('td', null, 'Tỉ lệ pass'), el('td', null, s.execution.passRate === null ? '—' : `${s.execution.passRate}%`)),
      el('tr', null, el('td', null, 'Đủ điều kiện bàn giao'), el('td', null, s.readyForRelease ? 'Có' : 'Chưa')),
    ]),
    table('Chi tiết test case', ['Mã', 'Tiêu đề', 'Kết quả', 'Bằng chứng'], r.testcases.map((tc) => el('tr', null,
      el('td', null, tc.id),
      el('td', null, tc.title),
      el('td', null, RESULT_LABEL[tc.result ?? 'not_run']),
      el('td', null, tc.evidence || '—'),
    ))),

    el('h2', null, '4. Bug đã báo'),
    r.bugs.length
      ? table('Bug', ['Mã', 'Tiêu đề', 'Mức độ', 'Trạng thái', 'Môi trường', 'Bằng chứng'], r.bugs.map((b) => el('tr', null,
        el('td', null, b.id),
        el('td', null, b.title),
        el('td', null, SEVERITY_LABEL[b.severity]),
        el('td', null, BUG_STATUS_LABEL[b.status] ?? b.status),
        el('td', null, b.environment ?? '—'),
        el('td', null, b.evidence || '—'),
      )))
      : el('p', { class: 'empty' }, 'Chưa có bug nào.'),

    el('h2', null, '5. Lỗi phát hiện thêm ngoài checklist'),
    el('div', { class: 'field' }, el('label', { for: 'rp-extra' }, 'Mô tả'), extra),

    el('h2', null, '6. Lịch sử lần chạy gần nhất'),
    r.runs.length
      ? table('Lịch sử', ['Thời điểm', 'Pass', 'Fail', 'Blocked', 'Bug mở', 'Ghi chú'], r.runs.map((run) => el('tr', null,
        el('td', null, new Date(run.finishedAt).toLocaleString('vi-VN')),
        el('td', null, run.snapshot.byResult.pass),
        el('td', null, run.snapshot.byResult.fail),
        el('td', null, run.snapshot.byResult.blocked),
        el('td', null, run.snapshot.bugsOpen),
        el('td', null, run.note || '—'),
      )))
      : el('p', { class: 'empty' }, 'Chưa có lần chạy.'),

    el('h2', null, '7. Kết luận'),
    el('div', { class: 'field' }, el('label', { for: 'rp-conclusion' }, 'Kết luận và đề xuất'),
      el('textarea', { id: 'rp-conclusion', name: 'conclusion' })),
  );
}

// ---------- Trợ lý QA ----------

function reportList(title, items, emptyText) {
  return el('div', { class: 'card' },
    el('h3', { class: 'section-title' }, title),
    items.length
      ? listOf(items)
      : el('p', { class: 'empty' }, emptyText));
}

function renderReport(report) {
  return el('div', { class: 'two-col', id: 'assistant-report' },
    el('div', { class: 'card verdict', role: 'status' },
      el('strong', null, 'Đang ở'),
      el('span', null, report.currentStage)),
    reportList('Đã có', report.completed, 'Chưa giai đoạn nào đạt đủ.'),
    reportList('Còn thiếu', report.missing, 'Không còn giai đoạn nào thiếu.'),
    reportList(`Checklist chưa tick (${report.uncheckedChecklistTotal})`, report.uncheckedChecklist, 'Đã tick hết checklist.'),
    reportList('Test case chưa chạy', report.notRunTestCases, 'Mọi test case đã có kết quả.'),
    reportList('Requirement chưa có test', report.uncoveredRequirements, 'Mọi requirement đã có test case.'),
    reportList('Tiêu chí exit chưa đạt', report.exitCriteriaUnmet, 'Đã đạt toàn bộ tiêu chí exit.'),
  );
}

function appendMessage(log, who, text) {
  log.append(el('div', { class: `msg msg-${who}` },
    el('span', { class: 'msg-who' }, who === 'user' ? 'Bạn' : 'Trợ lý'),
    el('p', { class: 'msg-text' }, text)));
}

function keyStatusText(settings, providerId) {
  const saved = settings.keys?.[providerId];
  return saved?.saved ? `Đã lưu key: ${saved.masked}` : 'Chưa có key cho provider này';
}

function providerModelOptions(preset) {
  return preset.models.map((model) => el('option', { value: model }, model));
}

// Form cấu hình provider: chọn preset, dán key, lưu. Key không bao giờ hiển thị lại.
function renderAiSettings(settings) {
  const presets = settings.presets;
  const providerPick = el('select', { id: 'ai-provider' },
    ...Object.entries(presets).map(([id, preset]) => el('option', { value: id }, preset.label)));
  providerPick.value = settings.provider;
  const baseUrlInput = el('input', { id: 'ai-base-url', type: 'url', value: settings.baseUrl || presets[settings.provider].baseUrl });
  const modelList = el('datalist', { id: 'ai-model-list' }, ...providerModelOptions(presets[settings.provider]));
  const modelInput = el('input', { id: 'ai-model', type: 'text', maxlength: 100, value: settings.model, list: 'ai-model-list' });
  const keyInput = el('input', { id: 'ai-key', type: 'password', autocomplete: 'off', placeholder: 'Dán key mới; để trống để giữ key cũ' });
  const keyStatus = el('p', { class: 'muted', id: 'ai-key-status' }, keyStatusText(settings, settings.provider));
  const consent = el('input', { type: 'checkbox', id: 'ai-consent' });
  consent.checked = settings.allowCodeToAi === true;
  const message = el('p', { class: 'muted', role: 'status', id: 'ai-settings-status' });

  providerPick.addEventListener('change', () => {
    const preset = presets[providerPick.value];
    baseUrlInput.value = preset.baseUrl;
    baseUrlInput.disabled = !preset.editableBaseUrl;
    modelInput.value = preset.models[0] ?? '';
    modelList.replaceChildren(...providerModelOptions(preset));
    keyStatus.textContent = keyStatusText(settings, providerPick.value);
  });
  baseUrlInput.disabled = !presets[settings.provider].editableBaseUrl;

  const send = async (body) => {
    try {
      const saved = await api('/api/ai/settings', { method: 'PUT', body });
      message.textContent = 'Đã lưu cấu hình.';
      keyInput.value = '';
      keyStatus.textContent = keyStatusText(saved, body.provider);
    } catch (err) {
      message.textContent = err.message;
    }
  };

  const form = el('form', { id: 'ai-settings-form', novalidate: true, 'aria-labelledby': 'ai-settings-title', class: 'card' },
    el('h2', { id: 'ai-settings-title', class: 'section-title' }, 'Cấu hình AI'),
    el('div', { class: 'field' }, el('label', { for: 'ai-provider' }, 'Provider'), providerPick),
    el('div', { class: 'field' }, el('label', { for: 'ai-base-url' }, 'Đường dẫn API'), baseUrlInput),
    el('div', { class: 'field' }, el('label', { for: 'ai-model' }, 'Model'), modelInput, modelList),
    el('div', { class: 'field' }, el('label', { for: 'ai-key' }, 'API key'), keyInput, keyStatus),
    el('div', { class: 'field' },
      el('label', { for: 'ai-consent' }, consent, ' Cho AI đọc mã dự án để tự tích checklist (trích đoạn mã được gửi tới provider đã chọn)')),
    el('div', { class: 'form-actions' },
      el('button', { type: 'submit' }, 'Lưu cấu hình'),
      el('button', {
        type: 'button',
        onclick: () => send({
          provider: providerPick.value, baseUrl: baseUrlInput.value, model: modelInput.value, clearKey: true, allowCodeToAi: consent.checked,
        }),
      }, 'Xóa key provider này')),
    message);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    send({
      provider: providerPick.value,
      baseUrl: baseUrlInput.value,
      model: modelInput.value,
      apiKey: keyInput.value,
      allowCodeToAi: consent.checked,
    });
  });
  return form;
}

async function renderAssistant(projectId = 'PRJ-001') {
  const [{ aiEnabled, report }, { items: projects }, settings] = await Promise.all([
    api(`/api/assistant?projectId=${encodeURIComponent(projectId)}`), api('/api/projects'), api('/api/ai/settings'),
  ]);
  const projectPick = el('select', {
    id: 'assistant-project',
    onchange: async (event) => {
      app.replaceChildren(el('p', { class: 'muted', role: 'status' }, 'Đang tải…'));
      app.replaceChildren(await renderAssistant(event.target.value));
    },
  }, projectOptions(projects, projectId));
  const log = el('div', { class: 'chat-log', role: 'log', 'aria-live': 'polite', 'aria-label': 'Hội thoại với trợ lý' });
  const summary = el('div', { class: 'alert', role: 'alert', id: 'ai-summary', hidden: true });
  const input = el('textarea', { id: 'ai-input', rows: 3, maxlength: 2000 });
  const submit = el('button', { type: 'submit' }, 'Gửi');

  const form = el('form', { class: 'card chat-form', id: 'ai-form', novalidate: true, 'aria-labelledby': 'ai-form-title' },
    el('h2', { id: 'ai-form-title', class: 'section-title' }, 'Gửi thông tin hoặc câu hỏi'),
    summary,
    el('div', { class: 'field' },
      el('label', { for: 'ai-input' }, 'Thông tin hoặc câu hỏi'),
      input,
      el('p', { class: 'muted' }, 'Trợ lý luôn đọc trạng thái hiện tại của app. Bạn chỉ cần hỏi hoặc bổ sung thông tin.')),
    el('div', { class: 'form-actions' }, submit),
  );

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const text = input.value.trim();
    if (!text) {
      summary.hidden = false;
      summary.textContent = 'Nhập nội dung trước khi gửi.';
      return;
    }
    summary.hidden = true;
    submit.disabled = true;
    appendMessage(log, 'user', text);
    input.value = '';
    try {
      const res = await api('/api/assistant', { method: 'POST', body: { message: text, projectId: projectPick.value } });
      appendMessage(log, 'bot', res.reply);
    } catch (err) {
      summary.hidden = false;
      summary.textContent = err.message;
    } finally {
      submit.disabled = false;
    }
  });

  return el('section', { 'aria-labelledby': 'assistant-title' },
    el('h1', { id: 'assistant-title', tabindex: '-1' }, 'Trợ lý QA'),
    el('div', { class: 'field' }, el('label', { for: 'assistant-project' }, 'Dự án'), projectPick),
    el('p', { class: 'muted' }, aiEnabled
      ? 'Trợ lý đang dùng AI theo provider đã chọn. Trạng thái bên dưới được tính từ dữ liệu thật.'
      : 'Chưa có key cho provider đang chọn. Trợ lý vẫn tính báo cáo theo quy tắc; dán key bên dưới để bật AI.'),
    renderAiSettings(settings),
    renderReport(report),
    el('h2', null, 'Hội thoại'),
    el('div', { class: 'card' }, log),
    form,
  );
}

// ---------- Tổng: một trang cho toàn bộ tiến độ (dữ liệu thật) ----------

const TONG_STAGE_LABEL = { pass: 'Đạt', partial: 'Đang làm', not_run: 'Chưa làm' };
const STAGE_CLASS = { pass: 'tong-pass', partial: 'tong-partial', not_run: 'tong-todo' };
const WORKFLOW_LABEL = { source: 'Nguồn', clone: 'Lấy mã', install: 'Cài đặt', smoke: 'Kiểm tra nhanh', tests: 'Chạy test', report: 'Báo cáo' };

function tongSection(title, id, ...children) {
  return el('section', { class: 'tong-section', 'aria-labelledby': id },
    el('h2', { id, class: 'section-title' }, title), ...children);
}

// ---------- Pipeline CI: từng bước, trạng thái thật, nút chạy và tự cập nhật ----------

const CI_ICON = { pending: '○', running: '◐', ok: '✓', fail: '✗' };
const CI_TEXT = { pending: 'Chờ', running: 'Đang chạy', ok: 'Đạt', fail: 'Lỗi' };
const CI_POLL_MS = 3000;

async function loadCi() {
  const [progress, latest] = await Promise.all([
    api('/api/ci/progress').catch(() => null),
    api('/api/ci/latest').catch(() => null),
  ]);
  return { progress, latest };
}

const CI_STEP_LABELS = [
  ['install', 'Cài đặt'],
  ['syntax', 'Kiểm cú pháp'],
  ['e2e', 'E2E, API, UI, bảo mật'],
  ['sync', 'Đồng bộ kết quả vào test case'],
  ['a11y', 'Accessibility (axe-core)'],
  ['lhci', 'Hiệu năng (Lighthouse CI)'],
  ['report', 'Báo cáo và xuất HTML'],
];

// Ưu tiên tiến độ đang chạy, rồi kết quả lần chạy gần nhất, cuối cùng là khung 7 bước chờ.
function ciSteps(progress, latest) {
  if (progress?.steps) return progress.steps;
  if (latest?.stages) return latest.stages.map((s) => ({ key: s.key, label: s.label, status: s.ok ? 'ok' : 'fail', detail: s.detail }));
  return CI_STEP_LABELS.map(([key, label]) => ({ key, label, status: 'pending', detail: '' }));
}

function ciSection(progress, latest) {
  const steps = ciSteps(progress, latest);
  const running = progress?.running === true;
  const verdict = running
    ? 'Đang chạy… các bước cập nhật tự động'
    : latest ? `Lần chạy gần nhất: ${latest.ok ? 'ĐẠT' : 'KHÔNG ĐẠT'} (${latest.runAt ?? ''})` : 'Chưa có lần chạy CI';
  const status = el('p', { id: 'ci-status', class: 'meta', role: 'status' }, verdict);
  const button = el('button', { class: 'btn', type: 'button', disabled: running }, 'Chạy CI');
  const summary = latest?.summary && !running
    ? el('pre', { class: 'ci-summary' }, latest.summary)
    : null;
  const section = tongSection('Pipeline CI', 'tong-ci-title',
    el('div', { class: 'tong-runner-row' }, button),
    status,
    ...steps.map((s) => el('div', { class: 'tong-item' },
      el('span', { class: 'tong-badge' }, `${CI_ICON[s.status] ?? '○'} ${CI_TEXT[s.status] ?? s.status}`),
      el('span', { class: 'tong-name' }, s.label),
      el('span', { class: 'tong-note' }, s.detail ?? ''))),
    ...(summary ? [summary] : []));
  button.onclick = () => startCi(section, status, button);
  return section;
}

// Gửi lệnh chạy, rồi hỏi tiến độ mỗi vài giây cho tới khi xong.
async function startCi(section, status, button) {
  button.disabled = true;
  status.textContent = 'Đang gửi lệnh chạy…';
  try {
    await api('/api/ci/run', { method: 'POST' });
  } catch (err) {
    status.textContent = `Lỗi: ${err.message}`;
    button.disabled = false;
    return;
  }
  let current = section;
  const tick = async () => {
    if (!current.isConnected) return;
    const { progress, latest } = await loadCi();
    if (progress?.running) {
      const next = ciSection(progress, latest);
      current.replaceWith(next);
      current = next;
      setTimeout(tick, CI_POLL_MS);
    } else {
      await route();
    }
  };
  setTimeout(tick, 1000);
}

function tongBar(percent, label) {
  const bar = el('div', { class: 'progress-bar', role: 'progressbar', 'aria-label': label, 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-valuenow': String(percent) },
    el('div', { class: 'progress-fill' }));
  bar.firstChild.style.width = `${percent}%`;
  return bar;
}

function tongCurrent(progress) {
  if (progress.kind === 'tests' && progress.state === 'running') {
    return el('p', { class: 'tong-current' },
      `Đang test QA Hub: ${progress.percent}% · ${progress.done}/${progress.total || '?'} test · đang chạy: ${progress.current ?? '…'}`);
  }
  const steps = progress.steps ?? [];
  const running = steps.find((s) => s.status === 'running');
  if (progress.state === 'running' && running) {
    return el('p', { class: 'tong-current' }, `Đang làm: ${running.label} (${progress.percent}% xong)`);
  }
  if (progress.state === 'done') return el('p', { class: 'tong-current' }, 'Lượt gần nhất đã xong.');
  if (progress.state === 'error') return el('p', { class: 'alert', role: 'alert' }, 'Lượt gần nhất có lỗi, xem chi tiết ở từng dự án.');
  return el('p', { class: 'muted' }, 'Chưa có việc nào đang chạy. Thêm dự án ở mục Dự án để bot bắt đầu.');
}

function tongStages(stages) {
  const passed = stages.filter((s) => s.status === 'pass').length;
  return tongSection('Giai đoạn kiểm thử', 'tong-stages-title',
    el('p', null, el('strong', null, `${passed}/${stages.length} giai đoạn đạt`), ` · ${Math.round((passed / stages.length) * 100)}%`),
    tongBar(Math.round((passed / stages.length) * 100), 'Tiến độ giai đoạn'),
    el('ol', { class: 'tong-list' }, ...stages.map((stage) => el('li', { class: `tong-item ${STAGE_CLASS[stage.status] ?? ''}` },
      el('span', { class: 'tong-badge' }, TONG_STAGE_LABEL[stage.status] ?? stage.status),
      el('span', { class: 'tong-name' }, `${stage.id}. ${stage.name}`),
      el('span', { class: 'muted tong-note' }, stage.note)))));
}

function tongAutorun(autorun) {
  const live = autorun.live ?? {};
  const last = autorun.lastRun;
  const lastText = last
    ? `Lần gần nhất: ${last.passed} đạt, ${last.failed} lỗi (${new Date(last.finishedAt).toLocaleString('vi-VN')})`
    : 'Chưa có lần chạy nào';
  return tongSection('Bộ test QA Hub (tự chạy)', 'tong-autorun-title',
    el('p', null, autorun.enabled ? `Tự chạy mỗi ${autorun.intervalMinutes} phút` : 'Đang tắt tự chạy'),
    el('p', null, lastText),
    autorun.running
      ? el('div', null, el('p', { class: 'tong-current' }, `Đang chạy: ${live.percent}% (${live.done}/${live.total || '?'}) · ${live.current ?? '…'}`), tongBar(live.percent ?? 0, 'Tiến độ bộ test'))
      : null);
}

function tongProject(project, steps, checklist) {
  const done = steps.filter((s) => project.workflow?.[s.key]).length;
  return el('article', { class: 'tong-project card' },
    el('h3', null, el('a', { href: `#/projects/${project.id}` }, project.name), ` · ${project.id}`),
    el('p', null, `Quy trình ${done}/${steps.length} · Checklist ${checklist.done}/${checklist.total}`),
    el('ol', { class: 'tong-steps' }, ...steps.map((step) => {
      const ok = Boolean(project.workflow?.[step.key]);
      return el('li', { class: ok ? 'tong-pass' : 'tong-todo' }, `${ok ? '✔' : '○'} ${WORKFLOW_LABEL[step.key] ?? step.label}`);
    })),
    project.scan ? el('p', { class: 'muted' }, `Quét domain: ${project.scan.checks?.filter((c) => c.ok).length ?? 0}/${project.scan.checks?.length ?? 0} kiểm tra đạt`) : null);
}

async function tongProjects(projects, steps) {
  if (projects.length === 0) {
    return tongSection('Dự án', 'tong-projects-title', el('p', null, 'Chưa có dự án. Thêm dự án ở mục Dự án.'));
  }
  const checklists = await Promise.all(projects.map((p) => api(`/api/projects/${p.id}/checklist`)));
  return tongSection('Dự án', 'tong-projects-title',
    el('div', { class: 'tong-projects' }, ...projects.map((p, i) => tongProject(p, steps, checklists[i]))));
}

function tongChecklist(checklist) {
  const unfinished = checklist.items.filter((i) => !i.done).slice(0, 5);
  return tongSection('Checklist QA Hub', 'tong-checklist-title',
    el('p', null, el('strong', null, `${checklist.done}/${checklist.total} mục đã tích`), ` · ${Math.round((checklist.done / checklist.total) * 100)}%`),
    tongBar(Math.round((checklist.done / checklist.total) * 100), 'Tiến độ checklist'),
    unfinished.length
      ? el('ul', null, ...unfinished.map((i) => el('li', null, `${i.id} · ${i.text}`)))
      : el('p', { class: 'muted' }, 'Đã tích hết checklist.'),
    el('p', null, el('a', { href: '#/checklist' }, 'Mở checklist')));
}

function tongNumbers(stats) {
  return tongSection('Test case và lỗi', 'tong-numbers-title',
    el('div', { class: 'kpis' },
      el('div', { class: 'card' }, el('div', { class: 'kpi-label' }, 'Test case'), el('div', { class: 'kpi-value' }, String(stats.testcases.total)), el('div', { class: 'muted' }, `${stats.testcases.byStatus.ready ?? 0} sẵn sàng`)),
      el('div', { class: 'card' }, el('div', { class: 'kpi-label' }, 'Lỗi đang mở'), el('div', { class: 'kpi-value' }, String(stats.bugs.open)), el('div', { class: 'muted' }, `Tổng ${stats.bugs.total}`)),
      el('div', { class: 'card' }, el('div', { class: 'kpi-label' }, 'Test QA Hub đạt'), el('div', { class: 'kpi-value' }, `${stats.e2e.passed}/${stats.e2e.total}`), el('div', { class: 'muted' }, 'lần chạy gần nhất'))));
}

function tongHero(stages, autorun, progress) {
  const passed = stages.filter((s) => s.status === 'pass').length;
  const percent = Math.round((passed / stages.length) * 100);
  const liveLabel = progress.kind === 'tests' && progress.state === 'running'
    ? `Đang test ${progress.percent}%`
    : progress.state === 'running' ? 'Đang chạy' : 'Đang nghỉ';
  return el('div', { class: 'tong-hero' },
    el('div', null,
      el('p', { class: 'tong-hero-eyebrow' }, 'Tiến độ tổng hợp (dữ liệu thật)'),
      el('p', { class: 'tong-hero-number' }, `${percent}%`),
      el('p', { class: 'tong-hero-sub' }, `${passed}/${stages.length} giai đoạn đạt`)),
    el('div', { class: 'tong-hero-chips' },
      el('span', { class: 'tong-chip' }, liveLabel),
      el('span', { class: 'tong-chip' }, autorun.enabled ? `Tự chạy mỗi ${autorun.intervalMinutes} phút` : 'Tự chạy đang tắt'),
      el('span', { class: 'tong-chip' }, autorun.lastRun ? `Test gần nhất: ${autorun.lastRun.passed} đạt / ${autorun.lastRun.failed} lỗi` : 'Chưa có lần test')));
}
// Mở trang Tổng lần đầu là tự chạy toàn bộ (không cần bấm). Các lần làm mới sau không gọi lại.
// Chọn dự án rồi chạy toàn bộ luồng: domain, quét virus, đọc mã, chạy test (nếu có mã), báo cáo.
function tongRunner(projects) {
  const select = el('select', { id: 'tong-run-project', 'aria-label': 'Chọn dự án để chạy' },
    ...projects.map((p) => el('option', { value: p.id }, `${p.id} — ${p.name}`)));
  const status = el('p', { id: 'tong-run-status', class: 'meta', role: 'status' });
  const button = el('button', { class: 'btn', type: 'button' }, 'Chạy từ A đến Z');
  button.onclick = async () => {
    if (!select.value) return;
    button.disabled = true;
    status.textContent = 'Đang chạy: quét domain, quét virus, đọc mã, chạy test (nếu có mã)…';
    try {
      await api(`/api/projects/${select.value}/auto`, { method: 'POST', body: { runTests: true } });
      status.textContent = 'Đã chạy xong. Xem kết quả ở các mục bên dưới.';
      await route();
    } catch (err) {
      status.textContent = `Lỗi: ${err.message}`;
    } finally {
      button.disabled = false;
    }
  };
  return el('section', { class: 'tong-runner', 'aria-labelledby': 'tong-run-title' },
    el('h2', { id: 'tong-run-title', class: 'section-title' }, 'Chạy dự án từ A đến Z'),
    el('div', { class: 'tong-runner-row' }, select, button),
    status);
}

let tongKickedOff = false;

async function renderTong() {
  if (!tongKickedOff) {
    tongKickedOff = true;
    api('/api/run-all', { method: 'POST' }).catch((err) => console.error('Chạy toàn bộ lỗi:', err.message));
  }
  const [progress, stages, autorun, stats, { items: projects, steps }] = await Promise.all([
    api('/api/progress'), api('/api/stages'), api('/api/autorun'), api('/api/stats'), api('/api/projects'),
  ]);
  const ci = await loadCi();
  return el('section', { 'aria-labelledby': 'tong-title' },
    el('h1', { id: 'tong-title', tabindex: '-1' }, 'Tổng'),
    el('p', { class: 'lead' }, 'Bot tự làm các bước và ghi kết quả thật. Bạn chỉ cần thêm dự án hoặc xem kết quả.'),
    tongHero(stages.stages, autorun, progress),
    tongRunner(projects),
    ciSection(ci.progress, ci.latest),
    tongCurrent(progress),
    tongStages(stages.stages),
    tongAutorun(autorun),
    await tongProjects(projects, steps),
    tongChecklist(await api('/api/checklist')),
    tongNumbers(stats));
}
// ---------- Router ----------

const VIEWS = {
  tong: renderTong,
  start: renderTong,
  projects: renderProjects,
  assistant: renderAssistant,
  overview: renderOverview,
  testcases: renderTestCases,
  bugs: renderBugs,
  plan: renderPlan,
  summary: renderSummary,
  checklist: renderChecklist,
};

let activeRoute = 0;

function pickView(parts) {
  const [name, id, sub] = parts;
  if (name === 'projects' && id) {
    return sub === 'report' ? () => renderPrintReport(id) : () => renderProject(id);
  }
  return VIEWS[name] ?? VIEWS.tong;
}

async function route() {
  const parts = location.hash.replace(/^#\/?/, '').split('/');
  const name = parts[0] || 'tong';
  const view = pickView(parts);
  const token = ++activeRoute;

  for (const link of document.querySelectorAll('[data-nav]')) {
    if (link.dataset.nav === name) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }

  app.replaceChildren(el('p', { class: 'muted', role: 'status' }, 'Đang tải…'));
  try {
    const node = await view();
    if (token !== activeRoute) return;
    app.replaceChildren(node);
  } catch (err) {
    if (token !== activeRoute) return;
    app.replaceChildren(el('div', { class: 'alert', role: 'alert' }, `Không tải được trang: ${err.message}`));
  }
  app.querySelector('h1')?.focus();
}

// Tự làm mới các trang chỉ đọc. Bỏ qua khi người dùng đang thao tác trong khung nội dung.
const AUTO_REFRESH_VIEWS = new Set(['tong', 'start', 'overview', 'summary', 'checklist', 'projects']);
const REFRESH_MS = 20000;

setInterval(() => {
  if (document.hidden || app.contains(document.activeElement)) return;
  const name = location.hash.replace(/^#\/?/, '').split('/')[0] || 'tong';
  if (AUTO_REFRESH_VIEWS.has(name)) route();
}, REFRESH_MS);

window.addEventListener('hashchange', route);
route();

// ---------- Bảng tiến độ tự động (bên phải, mọi trang) ----------
const STEP_STATUS_LABEL = {
  pending: 'Chờ', running: 'Đang chạy', done: 'Xong', skipped: 'Bỏ qua', error: 'Lỗi',
};
const PROGRESS_REFRESH_MS = 2000;

function renderTestProgress(panel, progress) {
  const bar = el('div', { class: 'progress-bar', role: 'progressbar', 'aria-label': 'Tiến độ test', 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-valuenow': String(progress.percent) },
    el('div', { class: 'progress-fill' }));
  bar.firstChild.style.width = `${progress.percent}%`;
  panel.replaceChildren(
    el('h2', { class: 'progress-title' }, 'Đang test QA Hub'),
    el('p', null,
      el('strong', null, `${progress.percent}%`),
      ` · ${progress.done}/${progress.total || '?'} test`),
    bar,
    el('p', { class: 'progress-current' }, `Đang chạy: ${progress.current ?? '…'}`),
    el('p', { class: 'muted' }, `Đạt ${progress.passed} · Lỗi ${progress.failed}`),
  );
}

function renderProgressPanel(progress) {
  const panel = document.getElementById('progress-panel');
  if (!panel) return;
  if (progress.kind === 'tests') {
    renderTestProgress(panel, progress);
    return;
  }
  const idle = progress.state === 'idle';
  const stepItems = progress.steps.map((step) => el('li', { class: `progress-step progress-${step.status}` },
    el('span', { class: 'progress-step-label' }, step.label),
    el('span', { class: 'progress-step-status' }, STEP_STATUS_LABEL[step.status] ?? step.status),
    step.detail ? el('span', { class: 'progress-step-detail muted' }, step.detail) : null));
  const bar = el('div', { class: 'progress-bar', role: 'progressbar', 'aria-label': 'Tiến độ tự động', 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-valuenow': String(progress.percent) },
    el('div', { class: 'progress-fill' }));
  bar.firstChild.style.width = `${progress.percent}%`;
  panel.replaceChildren(
    el('h2', { class: 'progress-title' }, 'Tiến độ tự động'),
    idle
      ? el('p', { class: 'muted' }, 'Chưa có lượt nào. Thêm dự án hoặc upload zip để bot bắt đầu.')
      : el('p', null,
        el('strong', null, `${progress.percent}%`),
        ` · ${progress.state === 'done' ? 'đã xong' : progress.state === 'error' ? 'có lỗi' : 'đang chạy'}`),
    bar,
    idle ? null : el('ol', { class: 'progress-steps' }, ...stepItems),
  );
}

async function refreshProgress() {
  try {
    renderProgressPanel(await api('/api/progress'));
  } catch {
    // Mất kết nối tạm thời: giữ nguyên bảng cũ, lần sau thử lại.
  }
}

if (document.body && !document.getElementById('progress-panel')) {
  document.body.appendChild(el('aside', { id: 'progress-panel', class: 'progress-panel', 'aria-label': 'Tiến độ tự động' }));
  refreshProgress();
  setInterval(refreshProgress, PROGRESS_REFRESH_MS);
}
