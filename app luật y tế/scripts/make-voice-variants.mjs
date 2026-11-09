// Tạo các giọng biến thể cho người giảng từ giọng gốc (vais) bằng cách đổi cao độ, không cần chạy Piper lại.
// Giọng gốc là vais1000 (chất lượng tốt nhất). Mỗi biến thể là một mp3 mới bên cạnh giọng gốc:
//   gs   = giáo sư: trầm, dày hơn
//   hsg  = học sinh giỏi: cao, trẻ hơn
//   nt   = người thân: hơi trầm, ấm
//   bt   = bạn thân: cao vừa, tươi
// Chạy: node scripts/make-voice-variants.mjs [tên-bài ...]
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const run = promisify(execFile);
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SR = 22050; // mẫu gốc của giọng vais1000

// f < 1: trầm hơn; f > 1: cao hơn. atempo giữ nguyên tốc độ đọc.
export const VARIANTS = [
  { key: 'gs', f: 0.88 },
  { key: 'hsg', f: 1.18 },
  { key: 'nt', f: 0.95 },
  { key: 'bt', f: 1.08 },
];

const lessons = process.argv.slice(2);
if (!lessons.length) lessons.push('triet-hoc', 'tam-quan', 'dao-duc', 'ly-thuyet');

let made = 0;
for (const id of lessons) {
  const file = join(ROOT, 'data/slides', id + '.json');
  const data = JSON.parse(await readFile(file, 'utf8'));
  for (const s of data.slides) {
    const src = s.audios && s.audios.vais;
    if (!src) continue;
    const srcPath = join(ROOT, src);
    if (!existsSync(srcPath)) continue;
    const name = src.split('/').pop();
    s.audios = s.audios || {};
    for (const v of VARIANTS) {
      const dir = join(ROOT, 'audio/slides', id, v.key);
      await mkdir(dir, { recursive: true });
      const out = join(dir, name);
      const rel = 'audio/slides/' + id + '/' + v.key + '/' + name;
      s.audios[v.key] = rel;
      if (existsSync(out)) continue;
      const r = (SR * v.f).toFixed(0);
      const tempo = (1 / v.f).toFixed(4);
      await run('ffmpeg', ['-y', '-loglevel', 'error', '-i', srcPath,
        '-af', `asetrate=${r},aresample=${SR},atempo=${tempo}`,
        '-codec:a', 'libmp3lame', '-b:a', '64k', out]);
      made++;
    }
  }
  await writeFile(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(' ' + id + ' xong');
}
console.log('clip mới:', made);
