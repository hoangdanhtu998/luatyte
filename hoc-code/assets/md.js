// Bộ chuyển Markdown sang HTML tối thiểu, viết tay, không thư viện ngoài.
// Hỗ trợ: tiêu đề (#–####), đoạn văn, **đậm**, *nghiêng*, `code`, [chữ](link),
// khối ```code```, danh sách (- và 1.), bảng (| a | b |), trích dẫn (>).
// Mọi nội dung đều được escape trước khi thành HTML.
(function (root) {
  function esc(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function inline(text) {
    const codes = [];
    // Tách code span trước để nội dung trong `...` không bị đổi thành đậm/nghiêng.
    let s = text.replace(/`([^`]+)`/g, (m, c) => { codes.push(c); return '\u0000' + (codes.length - 1) + '\u0000'; });
    s = esc(s);
    s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+|[^\s)]+)\)/g, (m, label, url) => {
      if (/^javascript:/i.test(url)) return label;
      return '<a href="' + url + '" target="_blank" rel="noopener">' + label + '</a>';
    });
    s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    s = s.replace(/\u0000(\d+)\u0000/g, (m, i) => '<code>' + esc(codes[Number(i)]) + '</code>');
    return s;
  }

  const BLOCK_START = /^(#{1,4}\s|```|>|\s*[-*]\s+|\s*\d+\.\s)/;

  function render(src) {
    const lines = src.replace(/\r\n/g, '\n').split('\n');
    const out = [];
    let i = 0;
    while (i < lines.length) {
      const line = lines[i];

      if (/^```/.test(line)) {
        const lang = line.slice(3).trim();
        const buf = [];
        i++;
        while (i < lines.length && !/^```\s*$/.test(lines[i])) { buf.push(lines[i]); i++; }
        i++; // bỏ dòng ``` đóng
        out.push('<pre><code' + (lang ? ' class="language-' + esc(lang) + '"' : '') + '>' + esc(buf.join('\n')) + '</code></pre>');
        continue;
      }

      if (/^\s*$/.test(line)) { i++; continue; }

      const h = /^(#{1,4})\s+(.*)$/.exec(line);
      if (h) {
        const tag = 'h' + h[1].length;
        out.push('<' + tag + '>' + inline(h[2]) + '</' + tag + '>');
        i++;
        continue;
      }

      if (/^>\s?/.test(line)) {
        const buf = [];
        while (i < lines.length && /^>\s?/.test(lines[i])) { buf.push(lines[i].replace(/^>\s?/, '')); i++; }
        out.push('<blockquote>' + render(buf.join('\n')) + '</blockquote>');
        continue;
      }

      if (/^\s*\|/.test(line) && i + 1 < lines.length && /^\s*\|?\s*:?-{3,}/.test(lines[i + 1])) {
        const splitRow = (r) => r.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map(c => c.trim());
        const head = splitRow(line);
        i += 2;
        const rows = [];
        while (i < lines.length && /^\s*\|/.test(lines[i])) { rows.push(splitRow(lines[i])); i++; }
        let t = '<div class="table-wrap"><table><thead><tr>' + head.map(c => '<th>' + inline(c) + '</th>').join('') + '</tr></thead><tbody>';
        for (const r of rows) t += '<tr>' + r.map(c => '<td>' + inline(c) + '</td>').join('') + '</tr>';
        out.push(t + '</tbody></table></div>');
        continue;
      }

      if (/^\s*[-*]\s+/.test(line)) {
        const items = [];
        while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) { items.push(lines[i].replace(/^\s*[-*]\s+/, '')); i++; }
        out.push('<ul>' + items.map(t => '<li>' + inline(t) + '</li>').join('') + '</ul>');
        continue;
      }

      if (/^\s*\d+\.\s+/.test(line)) {
        const items = [];
        while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) { items.push(lines[i].replace(/^\s*\d+\.\s+/, '')); i++; }
        out.push('<ol>' + items.map(t => '<li>' + inline(t) + '</li>').join('') + '</ol>');
        continue;
      }

      const buf = [];
      while (i < lines.length && !/^\s*$/.test(lines[i]) && !BLOCK_START.test(lines[i])) { buf.push(lines[i]); i++; }
      if (buf.length === 0) { buf.push(lines[i]); i++; } // an toàn: không bao giờ lặp vô hạn
      out.push('<p>' + inline(buf.join(' ')) + '</p>');
    }
    return out.join('\n');
  }

  const api = { render, inline, esc };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.Md = api;
})(typeof window !== 'undefined' ? window : globalThis);
