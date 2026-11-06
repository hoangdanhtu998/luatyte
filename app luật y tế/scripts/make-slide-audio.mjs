// Tạo giọng đọc AI (Piper, máy chủ node server.mjs đang chạy) cho từng slide trong data/slides/*.json.
// Kết quả: audio/slides/<bài>/<nn>.mp3, và trường "audio" được ghi vào từng slide.
// Ghi file JSON sau mỗi slide, nên chạy lại sẽ tiếp tục từ chỗ dừng.
// Chạy: node scripts/make-slide-audio.mjs [tên-bài ...]
import { readFile, writeFile, copyFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const run = promisify(execFile);
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const BASE = process.env.TTS_BASE || 'http://localhost:4400';
const VOICE = 'vi_VN-vais1000-medium';
const LETTERS = ['A', 'B', 'C', 'D'];

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

async function speak(text) {
  const r = await fetch(BASE + '/api/tts/speak', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ text, voice: VOICE, speed: 1.0 }),
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
  const dir = join(ROOT, 'audio/slides', id);
  await mkdir(dir, { recursive: true });
  for (let i = 0; i < data.slides.length; i++) {
    const s = data.slides[i];
    const text = clean(speechText(s));
    if (!text) continue;
    const name = String(i + 1).padStart(2, '0') + '.mp3';
    const mp3 = join(dir, name);
    const rel = 'audio/slides/' + id + '/' + name;
    if (existsSync(mp3)) {
      if (s.audio !== rel) {
        s.audio = rel;
        await writeFile(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
      }
      continue;
    }
    const wav = await speak(text);
    await run('ffmpeg', ['-y', '-loglevel', 'error', '-i', wav, '-codec:a', 'libmp3lame', '-b:a', '64k', mp3]);
    s.audio = rel;
    await writeFile(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
    process.stdout.write('.');
  }
  console.log(' ' + id + ' (' + data.slides.length + ' slide)');
}
