/**
 * TTS Module - Text-to-Speech cho tiếng Việt
 * Sử dụng Piper TTS chạy local, không cần API keys
 */

import { execFileSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, mkdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// Cấu hình
const VOICE_DIR = process.env.VOICE_DIR || join(ROOT, 'voices');
const OUTPUT_DIR = process.env.OUTPUT_DIR || join(ROOT, 'output');
const PYTHON_PATH = process.env.PYTHON_PATH || 'C:/Python313/python.exe';

// Đảm bảo thư mục output tồn tại
mkdirSync(OUTPUT_DIR, { recursive: true });

/**
 * Danh sách giọng nói available
 */
export const VOICES = [
  {
    id: 'vi_VN-vais1000-medium',
    name: 'Tiếng Việt (Medium)',
    language: 'vi_VN',
    quality: 'medium',
    description: 'Giọng Việt Nam tự nhiên, truyền cảm — phù hợp đọc văn bản pháp luật',
    dataset: 'VAIS1000',
    size: '~60MB'
  },
  {
    id: 'vi_VN-25hours_single-low',
    name: 'Tiếng Việt (Low)',
    language: 'vi_VN',
    quality: 'low',
    description: 'Giọng Việt Nam nhẹ, nhanh hơn — phù hợp test',
    dataset: '25Hours',
    size: '~15MB'
  }
];

/**
 * Gọi Piper TTS qua Python
 */
export function synthesize(text, options = {}) {
  const {
    voice = 'vi_VN-vais1000-medium',
    speed = 1.0,
    outputFilename = `tts-${Date.now()}.wav`
  } = options;

  const voiceOnnx = join(VOICE_DIR, `${voice}.onnx`);
  const voiceConfig = join(VOICE_DIR, `${voice}.onnx.json`);
  const outputWav = join(OUTPUT_DIR, outputFilename);

  // Kiểm tra voice file tồn tại
  if (!existsSync(voiceOnnx)) {
    throw new Error(`Không tìm thấy voice: ${voiceOnnx}`);
  }
  if (!existsSync(voiceConfig)) {
    throw new Error(`Không tìm thấy config: ${voiceConfig}`);
  }

  // Tốc độ: 0.5 = chậm nửa倍, 1.0 = bình thường, 2.0 = nhanh gấp đôi
  // Piper điều chỉnh tốc độ qua length_scale
  const lengthScale = 1.0 / speed;

  // Tạo Python script
  const script = `
import sys
sys.path.insert(0, r'C:\Users\SK\AppData\Roaming\Python\Python313\site-packages')
from piper import PiperVoice
from piper.config import SynthesisConfig
import wave

voice_onnx = r'${voiceOnnx}'
output_wav = r'${outputWav}'
text = r'${text.replace(/'/g, "\'")}'
length_scale = ${lengthScale}

voice = PiperVoice.load(voice_onnx)
config = SynthesisConfig(length_scale=length_scale)
with wave.open(output_wav, 'wb') as wav_file:
    voice.synthesize_wav(text, wav_file, config)
print('OK')
`;

  try {
    execFileSync(PYTHON_PATH, ['-c', script], {
      encoding: 'utf8',
      timeout: 60000,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    return { success: true, outputWav, voice, speed };
  } catch (error) {
    throw new Error(`Lỗi TTS: ${error.message}`);
  }
}

/**
 * Ước tính thời lượng audio (giây)
 */
export function estimateDuration(text, speed = 1.0) {
  // Trung bình 4 chữ/giây cho tiếng Việt ở tốc độ bình thường
  const charsPerSecond = 4 * speed;
  return Math.ceil(text.length / charsPerSecond);
}

/**
 * GET /api/tts/voices - Danh sách giọng
 */
export function getVoices() {
  return VOICES.map(v => ({
    ...v,
    available: existsSync(join(VOICE_DIR, `${v.id}.onnx`))
  }));
}

/**
 * POST /api/tts/speak - Chuyển text thành giọng nói
 */
export function speak(text, voiceId = 'vi_VN-vais1000-medium', speed = 1.0) {
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    throw new Error('Thiếu text để chuyển đổi');
  }
  if (text.length > 5000) {
    throw new Error('Text quá dài (tối đa 5000 ký tự)');
  }
  if (speed < 0.5 || speed > 2.0) {
    throw new Error('Speed phải từ 0.5 đến 2.0');
  }
  return synthesize(text, { voice: voiceId, speed });
}

/**
 * Kiểm tra sức khỏe TTS
 */
export function healthCheck() {
  return {
    status: 'ok',
    python: PYTHON_PATH,
    voiceDir: VOICE_DIR,
    outputDir: OUTPUT_DIR,
    voices: getVoices()
  };
}
