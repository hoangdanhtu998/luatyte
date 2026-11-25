// Sinh feed.xml (RSS 2.0) từ data/tin_luat.json để người đọc theo dõi tin cập nhật luật.
// Dùng: node scripts/build-rss.mjs   (chạy lại mỗi khi tin_luat.json đổi)
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const data = JSON.parse(readFileSync(join(ROOT, 'data', 'tin_luat.json'), 'utf8'));
const items = Array.isArray(data.muc) ? data.muc : [];
const SITE = 'https://luatyte.online';
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const entries = items.map((t) => {
  const link = `${SITE}/tin_luat.html#${encodeURIComponent(t.id || '')}`;
  const desc = [t.tom_tat, ...(t.diem || [])].filter(Boolean).join(' ');
  return `    <item>
      <title>${esc(t.tieu_de)}</title>
      <link>${esc(link)}</link>
      <guid isPermaLink="false">${esc(t.id)}</guid>
      <description>${esc(desc)}</description>
      <category>${esc(t.tinh_trang)}</category>
      <pubDate>${esc(t.moc)}</pubDate>
    </item>`;
});

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Tin cập nhật luật y tế · Sổ tay Luật Y tế</title>
    <link>${SITE}/tin_luat.html</link>
    <description>Tin cập nhật về luật y tế, kèm trạng thái ban hành và hiệu lực.</description>
    <language>vi</language>
${entries.join('\n')}
  </channel>
</rss>
`;
writeFileSync(join(ROOT, 'feed.xml'), xml, 'utf8');
console.log(`Đã ghi feed.xml với ${entries.length} tin.`);
