// Xuất CSV cho báo cáo quản trị. Có BOM UTF-8 để Excel hiển thị đúng tiếng Việt.
export function csvCell(value) {
  const s = value === null || value === undefined ? '' : String(value);
  return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

// columns: [{ label, key }] hoặc [{ label, value: row => ... }]
export function toCsv(rows, columns) {
  const line = row => columns.map(c => csvCell(typeof c.value === 'function' ? c.value(row) : row[c.key])).join(',');
  const head = columns.map(c => csvCell(c.label)).join(',');
  const body = rows.map(line).join('\r\n');
  return '\uFEFF' + head + (body ? '\r\n' + body : '') + '\r\n';
}

export function sendCsv(res, filename, csv) {
  res.writeHead(200, {
    'content-type': 'text/csv; charset=utf-8',
    'content-disposition': `attachment; filename="${filename}"`,
    'cache-control': 'no-store',
  });
  res.end(csv);
}
