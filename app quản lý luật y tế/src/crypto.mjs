// Mã hóa bí mật (mật khẩu SMTP, API key) bằng AES-256-GCM. Khóa lấy từ biến môi trường SETTINGS_KEY (64 ký tự hex = 32 byte).
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

export function parseKey(hex) {
  if (!/^[0-9a-fA-F]{64}$/.test(String(hex || ''))) {
    throw new Error('SETTINGS_KEY phải là 64 ký tự hex (32 byte). Không ghi khóa này vào mã nguồn.');
  }
  return Buffer.from(hex, 'hex');
}

export function encryptSecret(plain, key) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const enc = Buffer.concat([cipher.update(String(plain), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v1:${iv.toString('base64')}:${tag.toString('base64')}:${enc.toString('base64')}`;
}

export function decryptSecret(value, key) {
  const [ver, ivB, tagB, dataB] = String(value).split(':');
  if (ver !== 'v1' || !ivB || !tagB || !dataB) throw new Error('Dữ liệu mã hóa không hợp lệ.');
  const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(ivB, 'base64'));
  decipher.setAuthTag(Buffer.from(tagB, 'base64'));
  return Buffer.concat([decipher.update(Buffer.from(dataB, 'base64')), decipher.final()]).toString('utf8');
}
