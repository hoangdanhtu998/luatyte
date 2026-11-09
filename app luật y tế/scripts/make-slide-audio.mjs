// Tạo giọng đọc AI (Piper, máy chủ node server.mjs đang chạy) cho từng slide trong data/slides/*.json.
// Mỗi slide có nhiều giọng (VOICE_SETS): audio/slides/<bài>/<giọng>/NN.mp3, và trường "audios" ghi đường dẫn từng giọng.
// Trường "audio" giữ giọng mặc định để tương thích. Đọc chậm hơn bình thường để dễ theo dõi.
// Ghi file JSON sau mỗi slide, nên chạy lại sẽ tiếp tục từ chỗ dừng.
// Chạy: node scripts/make-slide-audio.mjs [tên-bài ...]
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const run = promisify(execFile);
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const BASE = process.env.TTS_BASE || 'http://localhost:4400';
const LETTERS = ['A', 'B', 'C', 'D'];

// Các giọng người giảng. Khóa (key) dùng làm tên thư mục và trong slide-persona.js.
// speed < 1 là đọc chậm hơn. Giọng vivos và 25hours là giọng nhẹ hơn vais1000.
export const VOICE_SETS = [
  { key: 'vais', voice: 'vi_VN-vais1000-medium', speed: 0.9 },
  { key: 'vivos', voice: 'vi_VN-vivos-x_low', speed: 0.9 },
  { key: 'hours', voice: 'vi_VN-25hours_single-low', speed: 0.9 },
];

// Máy chủ TTS nhúng văn bản vào mã Python: bỏ dấu nháy và ký tự gây lỗi cú pháp.
export function clean(t) {
  return t.replace(/['"`\\]/g, '’').replace(/\s+/g, ' ').replace(/\.{2,}/g, '.').replace(/\.\s*\./g, '.').trim();
}

// Văn bản đọc cho từng loại slide: đọc đúng nội dung người học thấy.
export function speechText(s) {
  if (s.type === 'text') return [s.title, ...(s.body || [])].join('. ');
  if (s.type === 'mcq') return [s.q, ...s.options.map((o, k) => LETTERS[k] + ': ' + o)].join('. ');
  if (s.type === 'fill') {
    const text = s.text.replace(/\{(\d+)\}/g, (_, n) => 'chỗ trống số ' + n);
    const choices = s.blanks.map((b, k) => 'Chỗ trống ' + (k + 1) + ': ' + b.options.join(', ')).join('. ');
    return [s.title, text, 'Các lựa chọn: ' + choices].join('. ');
  }
  if (s.type === 'essay') return [s.q, 'Hãy tự trả lời trước khi xem đáp án mẫu.'].join('. ');
  return '';
}

async function speak(text, voice, speed) {
  const r = await fetch(BASE + '/api/tts/speak', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ text, voice, speed }),
  });
  const j = await r.json();
  if (!j.success) throw new Error('TTS lỗi: ' + JSON.stringify(j));
  return join(ROOT, 'output', basename(j.audioFile));
}

const lessons = process.argv.slice(2);
if (!lessons.length) lessons.push('tam-quan', 'triet-hoc', 'dao-duc');

for (const id of lessons) {
  const file = join(ROOT, 'data/slides', id + '.json');
  const data = JSON.parse(await readFile(file, 'utf8'));
  for (let i = 0; i < data.slides.length; i++) {
    const s = data.slides[i];
    const text = clean(speechText(s));
    if (!text) continue;
    const name = String(i + 1).padStart(2, '0') + '.mp3';
    s.audios = s.audios || {};
    let changed = false;
    for (const vs of VOICE_SETS) {
      const dir = join(ROOT, 'audio/slides', id, vs.key);
      await mkdir(dir, { recursive: true });
      const mp3 = join(dir, name);
      const rel = 'audio/slides/' + id + '/' + vs.key + '/' + name;
      if (s.audios[vs.key] !== rel) { s.audios[vs.key] = rel; changed = true; }
      if (!existsSync(mp3)) {
        const wav = await speak(text, vs.voice, vs.speed);
        await run('ffmpeg', ['-y', '-loglevel', 'error', '-i', wav, '-codec:a', 'libmp3lame', '-b:a', '64k', mp3]);
        process.stdout.write('.');
      }
    }
    // Giọng mặc định là giọng "vais" (đã có trước đó ở thư mục gốc của bài)
    if (s.audio !== s.audios.vais) { s.audio = s.audios.vais; changed = true; }
    if (changed) await writeFile(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
  }
  console.log(' ' + id + ' (' + data.slides.length + ' slide, ' + VOICE_SETS.length + ' giọng)');
}
