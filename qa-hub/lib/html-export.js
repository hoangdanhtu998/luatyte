// Sinh trang HTML tự chứa (không script, không tài nguyên ngoài) từ dữ liệu QA Hub.
// Hàm thuần: nhận dữ liệu, trả về chuỗi HTML. Ghi file do scripts/export-html.mjs làm.

export function esc(value) {
  return String(value ?? '—').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

// cols: [[tiêu đề, khóa hoặc hàm(row)]]
export function table(rows, cols) {
  if (!rows.length) return '<p class="empty">Không có dữ liệu.</p>';
  const cell = (row, col) => {
    const raw = typeof col[1] === 'function' ? col[1](row) : row[col[1]];
    if (raw === true) return 'Có';
    if (raw === false) return 'Không';
    return raw;
  };
  const head = cols.map((c) => `<th>${esc(c[0])}</th>`).join('');
  const body = rows.map((r) => `<tr>${cols.map((c) => `<td>${esc(cell(r, c))}</td>`).join('')}</tr>`).join('');
  return `<div class="wrap"><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
}

function section(id, title, body) {
  return `<section id="${id}"><h2>${esc(title)}</h2>${body}</section>`;
}

// data: { date, projects, checklist, testcases, bugs, requirements, suites, reviews, runs, plan, faq, a11yText, evidence }
export function renderHtml(data) {
  const { checklist = [], evidence = [] } = data;
  const byId = new Map(evidence.map((e) => [e.checklistId, e]));
  const groups = [...new Set(checklist.map((i) => i.group))];
  const doneCount = checklist.filter((i) => i.done).length;

  const cards = `<div class="cards">
    <div class="card"><b>${data.projects.length}</b><span>Dự án</span></div>
    <div class="card"><b>${doneCount}/${checklist.length}</b><span>Checklist đã tick</span></div>
    <div class="card"><b>${data.testcases.length}</b><span>Test case</span></div>
    <div class="card"><b>${data.bugs.length}</b><span>Lỗi</span></div>
    <div class="card"><b>${data.requirements.length}</b><span>Requirement</span></div>
    <div class="card"><b>${data.runs.length}</b><span>Lần chạy</span></div></div>`;

  const checklistBody = groups.map((g) => {
    const items = checklist.filter((i) => i.group === g);
    return `<h3>${esc(g)}</h3>` + table(items, [
      ['Mã', 'id'],
      ['Nội dung', 'text'],
      ['Đã tick', (r) => (r.done ? 'Có' : 'Chưa')],
      ['Bằng chứng tự động', (r) => {
        const e = byId.get(r.id);
        return e ? `${e.result}: ${e.detail}` : '—';
      }],
    ]);
  }).join('');

  const sections = [
    section('tong', 'Tổng quan', `${cards}<p>Xuất ngày ${esc(data.date)}. Trang không cần mạng hay máy chủ.</p>`),
    section('du-an', 'Dự án', table(data.projects, [['Mã', 'id'], ['Tên', 'name'], ['Nguồn', 'sourceType'], ['Tham chiếu', 'sourceRef'], ['Domain đã xác nhận', 'ownershipConfirmed'], ['Bật chạy test', 'autoTests'], ['Test gần nhất', 'testedAt']])),
    section('checklist', `Checklist (${checklist.length} mục)`, checklistBody),
    section('test-case', `Test case (${data.testcases.length})`, table(data.testcases, [['Mã', 'id'], ['Dự án', 'projectId'], ['Tiêu đề', 'title'], ['Loại', 'testType'], ['Ưu tiên', 'priority'], ['Trạng thái', 'status'], ['Kết quả', 'result'], ['Bước / bằng chứng', 'steps']])),
    section('loi', `Lỗi tìm thấy (${data.bugs.length})`, table(data.bugs, [['Mã', 'id'], ['Tiêu đề', 'title'], ['Mức độ', 'severity'], ['Trạng thái', 'status'], ['Dự án', 'projectId']])),
    section('requirement', `Requirement (${data.requirements.length})`, table(data.requirements, [['Mã', 'id'], ['Nội dung', (r) => r.title ?? r.text ?? r.description], ['Dự án', 'projectId']])),
    section('suite', `Suite (${data.suites.length})`, table(data.suites, [['Mã', 'id'], ['Tên', 'name'], ['Mô tả', 'description']])),
    section('review', `Review (${data.reviews.length})`, table(data.reviews, [['Mã', 'id'], ['Đối tượng', 'target'], ['Tham chiếu', 'targetRef'], ['Phát hiện', 'findings']])),
    section('lan-chay', `Lần chạy (${data.runs.length})`, table(data.runs.slice(-200), [['Mã', 'id'], ['Ghi chú', 'note'], ['Thời điểm', 'createdAt']]) + (data.runs.length > 200 ? '<p>Chỉ hiện 200 lần chạy gần nhất.</p>' : '')),
    section('ke-hoach', 'Kế hoạch kiểm thử', data.plan ? `<pre>${esc(JSON.stringify(data.plan, null, 2).slice(0, 20000))}</pre>` : '<p class="empty">Không có dữ liệu kế hoạch.</p>'),
    section('a11y', 'Báo cáo accessibility (axe-core)', `<pre>${esc(data.a11yText ?? 'Chưa có báo cáo.')}</pre>`),
    section('kien-thuc', 'Kiến thức kiểm thử và QA Hub', `<pre class="faq">${esc(data.faq ?? '')}</pre>`),
  ].join('\n');

  const nav = ['tong', 'du-an', 'checklist', 'test-case', 'loi', 'requirement', 'suite', 'review', 'lan-chay', 'ke-hoach', 'a11y', 'kien-thuc']
    .map((id) => `<a href="#${id}">${id}</a>`).join('');

  return `<!doctype html>
<html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>QA Hub – Dữ liệu</title>
<style>${STYLE}</style></head>
<body>
<header><h1>QA Hub – Dữ liệu</h1><nav>${nav}</nav></header>
<main>
${sections}
</main>
</body></html>`;
}

const STYLE = `
:root { --ink:#1c1917; --muted:#5E5346; --paper:#fbfaf7; --line:#e7e5e4; --accent:#8a3b1f; }
* { box-sizing: border-box; }
body { margin:0; font: 15px/1.5 system-ui, "Segoe UI", sans-serif; color:var(--ink); background:var(--paper); }
header { position:sticky; top:0; background:#fff; border-bottom:1px solid var(--line); padding:12px 16px; z-index:1; }
header h1 { margin:0 0 6px; font-size:20px; color:var(--accent); }
nav a { margin-right:10px; color:var(--muted); text-decoration:none; font-size:13px; }
main { padding:16px; max-width:1200px; margin:0 auto; }
section { margin-bottom:32px; }
h2 { border-bottom:2px solid var(--accent); padding-bottom:4px; font-size:18px; }
h3 { font-size:15px; color:var(--muted); margin-top:18px; }
.wrap { overflow-x:auto; }
table { border-collapse:collapse; width:100%; background:#fff; font-size:14px; }
th, td { text-align:left; padding:6px 8px; border:1px solid var(--line); vertical-align:top; }
th { background:#f5f5f4; }
.cards { display:flex; flex-wrap:wrap; gap:10px; margin:8px 0 14px; }
.card { background:#fff; border:1px solid var(--line); border-radius:8px; padding:10px 14px; min-width:130px; }
.card b { display:block; font-size:22px; color:var(--accent); }
.card span { color:var(--muted); font-size:13px; }
pre { background:#fff; border:1px solid var(--line); border-radius:8px; padding:12px; white-space:pre-wrap; word-break:break-word; font: 13px/1.5 ui-monospace, Consolas, monospace; }
pre.faq { font-family: system-ui, "Segoe UI", sans-serif; font-size:14px; }
.empty { color:var(--muted); font-style:italic; }
@media (prefers-color-scheme: dark) {
  :root { --ink:#f5f5f4; --muted:#d6cfc4; --paper:#1c1917; --line:#44403c; --accent:#f0a57f; }
  header, table, .card, pre { background:#292524; }
  th { background:#3a332e; }
}
`;
