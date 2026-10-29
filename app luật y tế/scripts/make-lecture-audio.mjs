// Tạo bài giảng có giọng đọc: mỗi điều luật là một bài, mỗi ý chính là một slide.
// Chạy khi máy chủ đang bật (node server.mjs). Kết quả: data/bai-giang.json và audio/bai-giang/*.wav
import { readFile, writeFile, copyFile, mkdir } from 'node:fs/promises';
import { join, basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const BASE = process.env.TTS_BASE || 'http://localhost:4400';
const VOICE = 'vi_VN-vais1000-medium';

const laws = JSON.parse(await readFile(join(ROOT, 'data/laws.json'), 'utf8'));
const lessons = [];
await mkdir(join(ROOT, 'audio/bai-giang'), { recursive: true });

async function speak(text, out) {
  const r = await fetch(BASE + '/api/tts/speak', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ text, voice: VOICE, speed: 1.0 }),
  });
  const j = await r.json();
  if (!j.success) throw new Error('TTS lỗi: ' + JSON.stringify(j));
  await copyFile(join(ROOT, 'output', basename(j.audioFile)), join(ROOT, 'audio/bai-giang', out));
  return 'audio/bai-giang/' + out;
}

for (const law of laws) {
  const pts = (law.points || []).filter(p => !p.startsWith('---') && !p.startsWith('Ghi chú nguồn'));
  if (!pts.length) continue;
  const title = law.title || law.name;
  const slides = [{ text: title + '.' }, ...pts.map(p => ({ text: p }))];
  for (let i = 0; i < slides.length; i++) {
    const out = `${law.id}-${String(i).padStart(2, '0')}.wav`;
    slides[i].audio = await speak(slides[i].text, out);
    process.stdout.write('.');
  }
  lessons.push({ id: law.id, title, slides });
  console.log(' ' + law.id + ' (' + slides.length + ' slide)');
}

await writeFile(join(ROOT, 'data/bai-giang.json'), JSON.stringify(lessons, null, 2) + '\n');
console.log('xong:', lessons.length, 'bài');

// Ghi nhật ký dùng công cụ vào sổ quản trị (không làm lỗi script nếu sổ chưa sẵn sàng)
import { execFileSync as __ex } from "node:child_process";
import { fileURLToPath } from "node:url";
const __logTool = (id) => { try { __ex(process.execPath, [fileURLToPath(new URL("../../app quản lý luật y tế/scripts/log-tool.mjs", import.meta.url)), id], { stdio: "ignore" }); } catch (e) {} };

__logTool('piper-tts');
