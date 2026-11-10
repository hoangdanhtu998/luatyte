// Tạo giọng VieNeu (Bắc) cho slide và câu mở đầu của 4 người giảng mới.
// Giọng lấy từ preset có sẵn trong package vieneu: Xuân Vĩnh, Đoan Trang, Quốc Tuấn, Thanh Bình.
// Slide: audio/slides/<bài>/<khóa>/NN.mp3, ghi vào trường "audios" của data/slides/<bài>.json (không đổi trường "audio").
// Mở đầu: audio/persona/<người giảng>.mp3.
// Chạy: node scripts/make-slide-audio-vieneu.mjs [tên-bài ...]
// Clip đã có mp3 thì bỏ qua, nên chạy lại được sau khi dừng giữa chừng.
import { readFile, writeFile, mkdir, unlink } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile, spawn } from 'node:child_process';
import { promisify } from 'node:util';

const runFile = promisify(execFile);
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PYTHON = process.env.PYTHON_PATH || 'C:/Python313/python.exe';
const LETTERS = ['A', 'B', 'C', 'D'];
const CHUNK = 200;
// Đọc chậm như các giọng Piper hiện có (speed 0.9)
const TEMPO = 0.9;
const OPENER_TEXT = 'Hôm nay chúng ta cùng học từng ý một nhé.';

// key: thư mục giọng trong audio/slides và trường "audios"; persona: khóa người giảng trong js/slide-persona.js
const VOICE_SETS = [
  { key: 'xuan_vinh', persona: 'vn_xuan_vinh', voice: 'Xuân Vĩnh' },
  { key: 'doan_trang', persona: 'vn_doan_trang', voice: 'Đoan Trang' },
  { key: 'quoc_tuan', persona: 'vn_quoc_tuan', voice: 'Quốc Tuấn' },
  { key: 'thanh_binh', persona: 'vn_thanh_binh', voice: 'Thanh Bình' },
];

// Cùng cách làm với make-slide-audio.mjs để chữ đọc giống hệt giọng Piper
function clean(t) {
  return t.replace(/['"`\\]/g, '’').replace(/\s+/g, ' ').replace(/\.{2,}/g, '.').replace(/\.\s*\./g, '.').trim();
}

function speechText(s) {
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

// Chạy Python và hiện tiến trình trực tiếp (không gom output)
function runPython(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(PYTHON, args, { stdio: 'inherit' });
    child.on('error', reject);
    child.on('close', (code) => (code === 0 ? resolve() : reject(new Error('python thoát mã ' + code))));
  });
}

function slideName(index) {
  return String(index + 1).padStart(2, '0') + '.mp3';
}

const lessons = process.argv.slice(2);
if (!lessons.length) lessons.push('triet-hoc', 'dao-duc', 'tam-quan', 'ly-thuyet');

const jobs = [];
for (const vs of VOICE_SETS) {
  const mp3 = join(ROOT, 'audio/persona', vs.persona + '.mp3');
  if (!existsSync(mp3)) {
    jobs.push({ voice: vs.voice, text: OPENER_TEXT, out: join(ROOT, 'output', 'vieneu-' + vs.persona + '.wav'), mp3 });
  }
}

const docs = {};
for (const id of lessons) {
  const file = join(ROOT, 'data/slides', id + '.json');
  const data = JSON.parse(await readFile(file, 'utf8'));
  docs[id] = { file, data };
  for (let i = 0; i < data.slides.length; i++) {
    const text = clean(speechText(data.slides[i]));
    if (!text) continue;
    for (const vs of VOICE_SETS) {
      const dir = join(ROOT, 'audio/slides', id, vs.key);
      await mkdir(dir, { recursive: true });
      const mp3 = join(dir, slideName(i));
      if (!existsSync(mp3)) {
        const out = join(ROOT, 'output', 'vieneu-' + id + '-' + vs.key + '-' + slideName(i).replace('.mp3', '.wav'));
        jobs.push({ voice: vs.voice, text, out, mp3 });
      }
    }
  }
}
console.log('việc cần làm:', jobs.length);

let converted = 0;
let failed = 0;
for (let k = 0; k < jobs.length; k += CHUNK) {
  const part = jobs.slice(k, k + CHUNK);
  await mkdir(join(ROOT, 'output'), { recursive: true });
  const jobsFile = join(ROOT, 'output', 'vieneu-jobs.json');
  await writeFile(jobsFile, JSON.stringify(part.map(({ voice, text, out }) => ({ voice, text, out }))), 'utf8');
  await runPython([join(ROOT, 'scripts/batch_vieneu.py'), jobsFile]);
  for (const job of part) {
    if (!existsSync(job.out)) { failed++; continue; }
    try {
      await runFile('ffmpeg', ['-y', '-loglevel', 'error', '-i', job.out, '-af', 'atempo=' + TEMPO, '-codec:a', 'libmp3lame', '-b:a', '64k', job.mp3]);
      await unlink(job.out);
      converted++;
    } catch (error) {
      failed++;
      console.log('lỗi chuyển mp3:', job.mp3, error.message);
    }
  }
  console.log('lô ' + (k / CHUNK + 1) + ' xong (' + Math.min(k + CHUNK, jobs.length) + '/' + jobs.length + ')');
}
console.log('chuyển được', converted, '| lỗi', failed);

// Ghi đường dẫn giọng mới vào data/slides (chỉ khi file mp3 đã có, để slide không trỏ tới file thiếu)
for (const id of Object.keys(docs)) {
  const { file, data } = docs[id];
  for (let i = 0; i < data.slides.length; i++) {
    for (const vs of VOICE_SETS) {
      const rel = 'audio/slides/' + id + '/' + vs.key + '/' + slideName(i);
      if (existsSync(join(ROOT, rel))) {
        data.slides[i].audios = { ...(data.slides[i].audios || {}), [vs.key]: rel };
      }
    }
  }
  await writeFile(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(' ' + id + ' (' + data.slides.length + ' slide) đã cập nhật');
}
