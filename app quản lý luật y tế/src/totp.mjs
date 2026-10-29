// TOTP theo RFC 6238 (HMAC-SHA1, 6 chữ số, bước 30 giây). Không cần thư viện ngoài.
import { createHmac, randomBytes } from 'node:crypto';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function base32Encode(buf) {
  let bits = 0, value = 0, out = '';
  for (const byte of buf) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) { out += ALPHABET[(value >>> (bits - 5)) & 31]; bits -= 5; }
  }
  if (bits > 0) out += ALPHABET[(value << (5 - bits)) & 31];
  return out;
}

export function base32Decode(str) {
  const clean = String(str).toUpperCase().replace(/=+$/, '').replace(/\s+/g, '');
  let bits = 0, value = 0;
  const out = [];
  for (const ch of clean) {
    const idx = ALPHABET.indexOf(ch);
    if (idx < 0) throw new Error('Base32 không hợp lệ.');
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) { out.push((value >>> (bits - 8)) & 0xff); bits -= 8; }
  }
  return Buffer.from(out);
}

export function newSecret() {
  return base32Encode(randomBytes(20));
}

export function codeAt(secret, counter) {
  const key = base32Decode(secret);
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64BE(BigInt(counter));
  const h = createHmac('sha1', key).update(buf).digest();
  const offset = h[h.length - 1] & 0xf;
  const bin = ((h[offset] & 0x7f) << 24) | (h[offset + 1] << 16) | (h[offset + 2] << 8) | h[offset + 3];
  return String(bin % 1_000_000).padStart(6, '0');
}

// Chấp nhận mã của bước hiện tại và bước lệch ±1 (tối đa 30 giây lệch đồng hồ).
// Trả về bước đã dùng để chặn dùng lại cùng một mã, hoặc null nếu sai.
export function matchTotp(secret, code, now = Date.now(), lastStep = -1) {
  if (!/^\d{6}$/.test(String(code ?? ''))) return null;
  const step = Math.floor(now / 1000 / 30);
  for (const s of [step, step - 1, step + 1]) {
    if (s <= lastStep) continue;
    if (codeAt(secret, s) === code) return s;
  }
  return null;
}

export function otpauthUri(secret, email, issuer = 'Luật Y tế Quản lý') {
  const label = encodeURIComponent(`${issuer}:${email}`);
  return `otpauth://totp/${label}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
}
