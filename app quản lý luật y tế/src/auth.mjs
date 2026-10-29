// Băm và kiểm tra mật khẩu bằng scrypt. Không bao giờ lưu mật khẩu gốc.
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

export const MIN_PASSWORD = 10;

export function hashPassword(password) {
  if (typeof password !== 'string' || password.length < MIN_PASSWORD) {
    throw new Error(`Mật khẩu phải có ít nhất ${MIN_PASSWORD} ký tự.`);
  }
  const salt = randomBytes(16).toString('hex');
  return `scrypt$${salt}$${scryptSync(password, salt, 64).toString('hex')}`;
}

export function verifyPassword(password, stored) {
  const [alg, salt, hex] = String(stored || '').split('$');
  if (alg !== 'scrypt' || !salt || !hex) return false;
  const expected = Buffer.from(hex, 'hex');
  const actual = scryptSync(String(password ?? ''), salt, expected.length);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
