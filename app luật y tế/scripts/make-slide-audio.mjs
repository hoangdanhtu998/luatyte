// Tạo giọng đọc AI (Piper) cho từng slide trong data/slides/*.json.
// Mỗi slide có nhiều giọng (VOICE_SETS): audio/slides/<bài>/<giọng>/NN.mp3, và trường "audios" ghi đường dẫn từng giọng.
// Trường "audio" giữ giọng mặc định (vais). Đọc chậm hơn bình thường để dễ theo dõi.
// Cách làm: gom các clip còn thiếu, chạy scripts/batch_piper.py một lần cho mỗi giọng (không nạp lại model mỗi clip),
// rồi chuyển WAV sang MP3 bằng ffmpeg. Chạy lại sẽ bỏ qua clip đã có.
// Chạy: node scripts/make-slide-audio.mjs [tên-bài ...]
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const run = promisify(execFile);
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PYTHON = process.env.PYTHON_PATH || 'C:/Python313/python.exe';
const LETTERS = ['A', 'B', 'C', 'D'];

// Các giọng người giảng. Khóa (key) dùng làm tên thư mục và trong slide-persona.js.
const ALL_VOICE_SETS = [
  { key: 'vais', voice: 'vi_VN-vais1000-medium', speed: 0.9 },
  { key: 'vivos', voice: 'vi_VN-vivos-x_low', speed: 0.9 },
  { key: 'hours', voice: 'vi_VN-25hours_single-low', speed: 0.9 },
];
// Có thể giới hạn giọng bằng biến môi trường, ví dụ VOICE_KEYS=vais để chỉ tạo giọng mặc định
export const VOICE_SETS = process.env.VOICE_KEYS ? ALL_VOICE_SETS.filter((v) => process.env.VOICE_KEYS.split(",").includes(v.key)) : ALL_VOICE_SETS;

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

const lessons = process.argv.slice(2);
if (!lessons.length) lessons.push('tam-quan', 'triet-hoc', 'dao-duc');

const pending = [];
const docs = {};
for (const id of lessons) {
  const file = join(ROOT, 'data/slides', id + '.json');
  const data = JSON.parse(await readFile(file, 'utf8'));
  docs[id] = { file, data };
  for (let i = 0; i < data.slides.length; i++) {
    const s = data.slides[i];
    const text = clean(speechText(s));
    if (!text) continue;
    const name = String(i + 1).padStart(2, '0') + '.mp3';
    s.audios = s.audios || {};
    for (const vs of VOICE_SETS) {
      const dir = join(ROOT, 'audio/slides', id, vs.key);
      await mkdir(dir, { recursive: true });
      const mp3 = join(dir, name);
      s.audios[vs.key] = 'audio/slides/' + id + '/' + vs.key + '/' + name;
      if (!existsSync(mp3)) {
        const out = join(ROOT, 'output', 'batch-' + id + '-' + vs.key + '-' + name.replace('.mp3', '.wav'));
        pending.push({ voice: vs.voice, speed: vs.speed, text, out, mp3 });
      }
    }
  }
}
console.log('việc cần làm:', pending.length);

// Làm theo lô nhỏ: sau mỗi lô đã có MP3, nên bị dừng giữa chừng vẫn giữ được phần đã làm
const CHUNK = 30;
for (let k = 0; k < pending.length; k += CHUNK) {
  const part = pending.slice(k, k + CHUNK);
  await mkdir(join(ROOT, 'output'), { recursive: true });
  const jobsFile = join(ROOT, 'output', 'batch-jobs.json');
  await writeFile(jobsFile, JSON.stringify(part.map(({ voice, speed, text, out }) => ({ voice, speed, text, out }))), 'utf8');
  await run(PYTHON, [join(ROOT, 'scripts/batch_piper.py'), jobsFile], { maxBuffer: 64 * 1024 * 1024 });
  for (const p of part) {
    await run('ffmpeg', ['-y', '-loglevel', 'error', '-i', p.out, '-codec:a', 'libmp3lame', '-b:a', '64k', p.mp3]);
  }
  console.log('lô ' + (k / CHUNK + 1) + ' xong (' + Math.min(k + CHUNK, pending.length) + '/' + pending.length + ')');
}

for (const id of Object.keys(docs)) {
  const { file, data } = docs[id];
  for (const s of data.slides) {
    if (s.audios && s.audios.vais) s.audio = s.audios.vais;
  }
  await writeFile(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(' ' + id + ' (' + data.slides.length + ' slide, ' + VOICE_SETS.length + ' giọng)');
}
