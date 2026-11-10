# Tạo clip giọng VieNeu (Bắc) cho nút "Nghe cả bài" ở các trang đọc.
# Danh sách đoạn lấy từ trình duyệt (output/read-texts/*.json, do scripts/collect-read-texts.py ghi),
# đúng nội dung và thứ tự đang hiển thị. Mỗi đoạn một clip, đặt tên theo mã băm FNV-1a của văn bản:
#   audio/read/<giọng>/<mã>.mp3
# Trình duyệt tính cùng mã đó từ chữ đang đọc nên không phụ thuộc thứ tự đoạn trong trang.
# Chạy: python scripts/make-read-audio-vieneu.py [--collect-only]   (--collect-only chỉ đếm, không tạo tiếng)
# Clip đã có thì bỏ qua, nên chạy lại được sau khi dừng giữa chừng. Giọng chạy theo thứ tự: giọng xong trước thì dùng được trước.
import json
import os
import re
import site
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TEXTS_DIR = ROOT / 'output' / 'read-texts'
# (khóa thư mục, tên preset trong package vieneu)
VOICES = [('xuan_vinh', 'Xuân Vĩnh'), ('doan_trang', 'Đoan Trang'), ('quoc_tuan', 'Quốc Tuấn'), ('thanh_binh', 'Thanh Bình')]
FFMPEG_ARGS = ['-codec:a', 'libmp3lame', '-b:a', '48k', '-ac', '1']


def clip_key(text):
    # FNV-1a 32 bit trên các đơn vị UTF-16, giống hàm clipKey() trong js/page-reader.js
    h = 0x811C9DC5
    data = text.encode('utf-16-le')
    for i in range(0, len(data), 2):
        h ^= data[i] | (data[i + 1] << 8)
        h = (h * 0x01000193) & 0xFFFFFFFF
    return '%08x' % h


def speech_text(text):
    # Cùng cách làm sạch với make-slide-audio-vieneu.mjs
    t = re.sub(r"['\"`\\]", '’', text)
    t = re.sub(r'\s+', ' ', t)
    t = re.sub(r'\.{2,}', '.', t)
    t = re.sub(r'\.\s*\.', '.', t)
    return t.strip()


def load_texts():
    texts = {}
    for path in sorted(TEXTS_DIR.glob('*.json')):
        blocks = json.loads(path.read_text(encoding='utf-8'))
        for text in blocks:
            texts.setdefault(clip_key(text), text)
        print(path.name, len(blocks), 'đoạn', flush=True)
    return texts


def build_jobs(texts):
    jobs = []
    for voice_key, preset in VOICES:
        folder = ROOT / 'audio' / 'read' / voice_key
        folder.mkdir(parents=True, exist_ok=True)
        for key, text in texts.items():
            mp3 = folder / (key + '.mp3')
            if not mp3.exists():
                jobs.append({'preset': preset, 'text': speech_text(text), 'mp3': mp3})
    return jobs


def synthesize(jobs):
    import numpy as np
    import soundfile as sf
    os.environ['HF_HUB_OFFLINE'] = '1'
    # Thư mục site-packages của người dùng hiện tại (không ghi cứng tên máy)
    sys.path.insert(0, site.getusersitepackages())
    from vieneu import Vieneu

    tts = Vieneu(mode='v3turbo', device='cpu')
    tmp_wav = ROOT / 'output' / 'read-tmp.wav'
    ok = 0
    fail = 0
    for n, job in enumerate(jobs, 1):
        try:
            wav = tts.infer(job['text'], voice=job['preset'])
            sf.write(str(tmp_wav), np.asarray(wav, dtype=np.float32), tts.sample_rate)
            subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', str(tmp_wav), *FFMPEG_ARGS, str(job['mp3'])], check=True)
            ok += 1
        except Exception as error:
            fail += 1
            job['mp3'].unlink(missing_ok=True)
            print('FAIL', job['mp3'].parent.name, job['mp3'].name, type(error).__name__, str(error)[:160], flush=True)
        if n % 20 == 0 or n == len(jobs):
            print('tiến độ', n, '/', len(jobs), 'lỗi', fail, flush=True)
    tmp_wav.unlink(missing_ok=True)
    print('XONG ok=%d fail=%d' % (ok, fail), flush=True)


def main():
    sys.stdout.reconfigure(encoding='utf-8')
    texts = load_texts()
    longest = max((len(t) for t in texts.values()), default=0)
    print('đoạn duy nhất:', len(texts), '| dài nhất:', longest, 'ký tự', flush=True)
    if '--collect-only' in sys.argv:
        return
    jobs = build_jobs(texts)
    print('việc cần làm:', len(jobs), flush=True)
    if jobs:
        synthesize(jobs)


if __name__ == '__main__':
    main()
