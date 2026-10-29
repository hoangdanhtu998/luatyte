// Trợ lý học tập: tìm trong toàn bộ nội dung app (bài đọc, slide, ví dụ, trắc nghiệm) và trả lời kèm nguồn.
// Mặc định không cần khóa API: chỉ trích đúng phần nội dung liên quan.
// Nếu đặt biến ANTHROPIC_API_KEY, câu trả lời được AI viết lại bằng tiếng Việt đơn giản, có ví dụ lấy từ nội dung.
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

const MODEL = process.env.CHAT_MODEL || 'claude-haiku-5-5';
const MAX_MESSAGE = 1000;
const STOP = new Set(['la', 'gi', 'the', 'nao', 'co', 'khong', 'cho', 'toi', 'minh', 'anh', 'vi', 'sao', 'mot', 'cac', 'va', 'de', 'trong', 'duoc', 'hay', 'thi', 've', 'voi', 'nhu', 'can', 'lam', 'the', 'hoi', 'ban', 'em', 'ra', 'vay', 'nay', 'do', 'cua', 'cai', 'mot', 'the', 'hom', 'thoi', 'tiet', 'nhe', 'giup', 'chi', 'tiep', 'bai', 'noi']);

// Bỏ dấu tiếng Việt để tìm kiếm không phụ thuộc dấu.
export function normalize(s) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');
}

export function tokens(s) {
  return normalize(s).split(/[^a-z0-9*&+\[\]]+/).filter(t => t.length > 1 && !STOP.has(t));
}

function stripTags(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|h\d|tr|pre)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, ' ').replace(/\n\s*\n+/g, '\n').trim();
}

// Chia nội dung thành các đoạn nhỏ, mỗi đoạn có nguồn rõ ràng.
export async function buildIndex(root) {
  const chunks = [];
  const add = (source, title, text) => {
    const t = text.trim();
    if (t.length < 20) return;
    // Đoạn dài thì cắt nhỏ để câu trả lời không quá dài.
    for (let i = 0; i < t.length; i += 700) {
      chunks.push({ source, title, text: t.slice(i, i + 700), tok: new Set(tokens(title + ' ' + t.slice(i, i + 700))) });
    }
  };

  const idx = JSON.parse(await readFile(join(root, 'content', 'index.json'), 'utf8'));
  for (const lesson of idx.lessons) {
    const md = await readFile(join(root, 'content', 'lessons', lesson.id + '.md'), 'utf8').catch(() => '');
    // Tách theo tiêu đề h2 để mỗi mục là một nguồn.
    const parts = md.split(/\n(?=## )/);
    for (const part of parts) {
      const head = (part.match(/^## (.+)$/m) || [null, lesson.title])[1];
      add(`Bài "${lesson.title}" · ${head}`, lesson.title + ' ' + head, part.replace(/^## .+$/m, '').replace(/[`*#>]/g, ''));
    }

    const slide = await readFile(join(root, lesson.slides), 'utf8').catch(() => '');
    const sections = slide.split(/<section /).slice(1);
    sections.forEach((sec, k) => {
      const text = stripTags(sec.replace(/^[^>]*>/, ''));
      add(`Slide ${k + 1} · ${lesson.title}`, lesson.title + ' slide ' + (k + 1), text);
    });

    const ex = await readFile(join(root, 'content', 'examples', lesson.id + '.json'), 'utf8').then(JSON.parse).catch(() => null);
    for (const e of ex?.examples || []) {
      add(`Ví dụ · ${e.title}`, lesson.title + ' ví dụ ' + e.title, e.title + '\n' + e.note + '\nCode:\n' + e.code + '\nKết quả khi chạy:\n' + e.output);
    }
    const qz = await readFile(join(root, 'content', 'quizzes', lesson.id + '.json'), 'utf8').then(JSON.parse).catch(() => null);
    for (const q of qz?.quizzes || []) {
      add(`Trắc nghiệm · ${lesson.title}`, lesson.title + ' trắc nghiệm', q.q + '\n' + q.explain);
    }
  }
  return chunks;
}

export function search(chunks, query, k = 3, boostTitle = "") {
  const qt = [...new Set(tokens(query))];
  if (qt.length === 0) return [];
  const scored = chunks.map(c => {
    let s = 0;
    for (const t of qt) if (c.tok.has(t)) s += 1;
    // Cụm từ đầy đủ khớp mạnh hơn.
    if (normalize(c.text).includes(normalize(query).slice(0, 25))) s += 2;
    // Ưu tiên nội dung của bài đang mở (tên bài nằm trong nguồn).
    if (boostTitle && c.source.includes('"' + boostTitle + '"')) s += 1.5;
    return { c, s };
  }).filter(x => x.s >= Math.max(1, Math.ceil(qt.length / 2))).sort((a, b) => b.s - a.s);
  // Bỏ các đoạn trùng nguồn để không lặp một mục nhiều lần.
  const out = [];
  const seen = new Set();
  for (const { c } of scored) {
    if (seen.has(c.source + c.text.slice(0, 40))) continue;
    seen.add(c.source + c.text.slice(0, 40));
    out.push(c);
    if (out.length >= k) break;
  }
  return out;
}

async function askModel(question, found) {
  const key = process.env.ANTHROPIC_API_KEY;
  const context = found.map((c, i) => `[${i + 1}] ${c.source}\n${c.text}`).join('\n\n');
  const system = 'Bạn là trợ lý học lập trình C/C++ cho người mới bắt đầu, không biết code. Trả lời bằng tiếng Việt, giọng dễ hiểu, ngắn gọn. ' +
    'Chỉ dựa vào tài liệu được cung cấp. Nếu tài liệu không có câu trả lời, nói rõ là chưa có trong bài. ' +
    'Giải thích bằng ví dụ đời thường trước, rồi đến ví dụ code lấy từ tài liệu. Ghi nguồn bằng số [1], [2].';
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: MODEL, max_tokens: 900, system,
      messages: [{ role: 'user', content: 'Tài liệu:\n' + context + '\n\nCâu hỏi: ' + question }],
    }),
  });
  if (!r.ok) throw new Error('AI trả về lỗi HTTP ' + r.status);
  const data = await r.json();
  return data.content.filter(b => b.type === 'text').map(b => b.text).join('\n').trim();
}

export function createChat(root) {
  let chunksPromise = buildIndex(root);
  return async function handleChat(body) {
    if (typeof body.message !== 'string' || body.message.trim() === '') return { status: 400, error: { code: 'EMPTY', message: 'Anh chưa nhập câu hỏi.' } };
    if (body.message.length > MAX_MESSAGE) return { status: 400, error: { code: 'TOO_LONG', message: 'Câu hỏi quá dài (tối đa 1000 ký tự).' } };
    const chunks = await chunksPromise;
    // Bài đang mở (gửi kèm từ trang bài học): tìm tên bài để ưu tiên.
    let boostTitle = '';
    try {
      const idx = JSON.parse(await readFile(join(root, 'content', 'index.json'), 'utf8'));
      const cur = idx.lessons.find((l) => l.id === body.lesson);
      if (cur) boostTitle = cur.title;
    } catch (e) { boostTitle = ''; }
    const found = search(chunks, body.message, 3, boostTitle);
    if (found.length === 0) {
      return { status: 200, ok: true, mode: 'none', answer: 'Mình chưa tìm thấy phần này trong nội dung của app. Anh thử hỏi cụ thể hơn, ví dụ: "con trỏ là gì", "malloc dùng để làm gì", "va chạm trong bảng băm là gì".', sources: [] };
    }
    if (process.env.ANTHROPIC_API_KEY) {
      try {
        const answer = await askModel(body.message, found);
        return { status: 200, ok: true, mode: 'ai', answer, sources: found.map(c => c.source) };
      } catch (e) {
        // Lỗi AI thì vẫn trả về nội dung tìm được, để người học không bị bỏ trống.
        return { status: 200, ok: true, mode: 'search', answer: 'Không gọi được AI lúc này (' + e.message + '). Dưới đây là phần nội dung liên quan:', passages: found.map(c => ({ source: c.source, text: c.text })), sources: found.map(c => c.source) };
      }
    }
    return { status: 200, ok: true, mode: 'search', answer: 'Mình tìm thấy các phần sau trong nội dung của app:', passages: found.map(c => ({ source: c.source, text: c.text })), sources: found.map(c => c.source) };
  };
}
