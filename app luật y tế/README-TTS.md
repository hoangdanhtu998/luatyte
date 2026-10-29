# Text-to-Speech (TTS) cho tiếng Việt

Sử dụng **Piper TTS** chạy hoàn toàn local, không cần internet.

## Cài đặt

### 1. Python dependencies
```bash
pip install piper-tts piper-onnx soundfile
```

### 2. Voice model
Tự động tải khi khởi động lần đầu, hoặc copy thủ công:
```bash
mkdir -p voices
cd voices
curl -O https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/vi/vi_VN/vais1000/medium/vi_VN-vais1000-medium.onnx
curl -O https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/vi/vi_VN/vais1000/medium/vi_VN-vais1000-medium.onnx.json
```

### 3. Khởi động server
```bash
node server.mjs
# Hoặc chỉ định port:
PORT=4401 node server.mjs
```

## API Endpoints

### GET /api/tts/health
Kiểm tra trạng thái TTS
```json
{
  "status": "ok",
  "python": "C:/Python313/python.exe",
  "voiceDir": ".../voices",
  "outputDir": ".../output",
  "voices": [...]
}
```

### GET /api/tts/voices
Danh sách giọng available
```json
[
  {
    "id": "vi_VN-vais1000-medium",
    "name": "Tiếng Việt (Medium)",
    "language": "vi_VN",
    "quality": "medium",
    "available": true
  }
]
```

### POST /api/tts/speak
Chuyển text thành giọng nói
```json
// Request
{
  "text": "Xin chào, đây là giọng nói tiếng Việt.",
  "voice": "vi_VN-vais1000-medium"
}

// Response
{
  "success": true,
  "audioFile": "/output/tts-1234567890.wav",
  "voice": "vi_VN-vais1000-medium"
}
```

### GET /output/{filename}.wav
Phát/tải file audio

## Frontend Component

```html
<div id="tts-container"></div>
<script src="/js/tts.js"></script>
<script>
  new TTSAudioController('tts-container');
</script>
```

## Cấu hình Environment Variables

| Variable | Default | Mô tả |
|----------|---------|-------|
| `PORT` | 4400 | Cổng server |
| `VOICE_DIR` | `./voices` | Thư mục chứa voice models |
| `OUTPUT_DIR` | `./output` | Thư mục lưu audio |
| `PYTHON_PATH` | `C:/Python313/python.exe` | Đường dẫn Python |

## Ghi chú

- Voice model medium: ~60MB, chất lượng tốt
- Voice model low: ~15MB, nhanh hơn
- TTS chạy local 100%, không gửi dữ liệu ra ngoài
- Hỗ trợ text lên đến 5000 ký tự/lần
