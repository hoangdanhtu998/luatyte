# Đọc danh sách công việc (JSON) và tạo nhiều file WAV bằng Piper, mỗi giọng chỉ nạp model một lần.
# Chạy: python scripts/batch_piper.py <jobs.json>
# Mỗi việc: {"voice": "<tên giọng>", "speed": 0.9, "text": "...", "out": "<đường dẫn .wav>"}
import json, sys, wave, os
sys.path.insert(0, r'C:\Users\SK\AppData\Roaming\Python\Python313\site-packages')
from piper import PiperVoice
from piper.config import SynthesisConfig

VOICE_DIR = os.environ.get('VOICE_DIR', os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'voices'))
jobs = json.load(open(sys.argv[1], encoding='utf8'))
loaded = {}
done = 0
for j in jobs:
    v = j['voice']
    if v not in loaded:
        loaded[v] = PiperVoice.load(os.path.join(VOICE_DIR, v + '.onnx'))
    cfg = SynthesisConfig(length_scale=1.0 / float(j.get('speed', 1.0)))
    with wave.open(j['out'], 'wb') as wf:
        loaded[v].synthesize_wav(j['text'], wf, cfg)
    done += 1
    print('OK', done, len(jobs), flush=True)
