// Tạo câu mở đầu được đọc thành tiếng cho từng người giảng: audio/persona/<người giảng>.mp3.
// Dùng giọng vais1000 (Piper) rồi đổi cao độ theo giọng của người giảng (cùng hệ số với make-voice-variants.mjs).
// Chạy: node scripts/make-persona-openers.mjs
import { writeFile, mkdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const run = promisify(execFile);
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PYTHON = process.env.PYTHON_PATH || 'C:/Python313/python.exe';
const SR = 22050;

// Câu mở đầu và hệ số cao độ theo từng người giảng
const OPENERS = [
  { id: 'giao_vien', f: 1, text: 'Hôm nay chúng ta cùng học từng ý một nhé.', speed: 0.9 },
  { id: 'giao_su', f: 0.88, text: 'Ta hãy xem xét vấn đề này một cách có hệ thống.', speed: 0.9 },
  { id: 'hoc_sinh_gioi', f: 1.18, text: 'Mình sẽ đi qua phần này cùng bạn nhé.', speed: 0.9 },
  { id: 'nguoi_than', f: 0.95, text: 'Con nghe này, mình học từ từ thôi nhé.', speed: 0.85 },
  { id: 'ban_than', f: 1.08, text: 'Vào học nè, dễ mà.', speed: 0.9 },
];

const outDir = join(ROOT, 'audio/persona');
await mkdir(outDir, { recursive: true });
const jobsFile = join(ROOT, 'output', 'persona-jobs.json');
await mkdir(join(ROOT, 'output'), { recursive: true });

const jobs = OPENERS.map((o) => ({ voice: 'vi_VN-vais1000-medium', speed: o.speed, text: o.text, out: join(ROOT, 'output', 'persona-' + o.id + '.wav') }));
await writeFile(jobsFile, JSON.stringify(jobs), 'utf8');
await run(PYTHON, [join(ROOT, 'scripts/batch_piper.py'), jobsFile], { maxBuffer: 16 * 1024 * 1024 });

for (const o of OPENERS) {
  const src = join(ROOT, 'output', 'persona-' + o.id + '.wav');
  const dst = join(outDir, o.id + '.mp3');
  const r = (SR * o.f).toFixed(0);
  const tempo = (1 / o.f).toFixed(4);
  await run('ffmpeg', ['-y', '-loglevel', 'error', '-i', src, '-af', `asetrate=${r},aresample=${SR},atempo=${tempo}`, '-codec:a', 'libmp3lame', '-b:a', '64k', dst]);
  console.log('ok', o.id, existsSync(dst));
}
