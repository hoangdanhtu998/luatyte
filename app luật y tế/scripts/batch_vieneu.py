# Tạo giọng VieNeu v3 Turbo (CPU) từ danh sách việc (JSON), nạp model một lần cho cả lô.
# Mỗi việc: {"voice": "<tên giọng VieNeu>", "text": "...", "out": "<đường dẫn .wav>"}
# Chạy: python scripts/batch_vieneu.py <jobs.json>
# Chạy offline (HF_HUB_OFFLINE=1): chỉ dùng model đã có trong cache, không tải thêm.
import json
import os
import sys

os.environ['HF_HUB_OFFLINE'] = '1'
sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, r'C:\Users\SK\AppData\Roaming\Python\Python313\site-packages')

import numpy as np
import soundfile as sf
from vieneu import Vieneu


def main():
    with open(sys.argv[1], encoding='utf-8') as f:
        jobs = json.load(f)
    if isinstance(jobs, dict):
        jobs = [jobs]
    tts = Vieneu(mode='v3turbo', device='cpu')
    done = 0
    failed = 0
    for job in jobs:
        try:
            wav = tts.infer(job['text'], voice=job['voice'])
            sf.write(job['out'], np.asarray(wav, dtype=np.float32), tts.sample_rate)
            done += 1
        except Exception as error:
            failed += 1
            print('FAIL', job['out'], type(error).__name__, str(error)[:200], flush=True)
            continue
        print('OK', done + failed, len(jobs), flush=True)
    print(f'XONG ok={done} fail={failed}', flush=True)


if __name__ == '__main__':
    main()
