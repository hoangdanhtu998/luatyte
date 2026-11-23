// Đọc file zip không cần thư viện ngoài, có giới hạn để chống zip bomb và zip slip.
import { inflateRawSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

export const ZIP_LIMITS = {
  maxArchiveBytes: 20 * 1024 * 1024,
  maxEntries: 5000,
  maxTotalBytes: 100 * 1024 * 1024,
  maxEntryBytes: 20 * 1024 * 1024,
};

const EOCD_SIG = 0x06054b50;
const CD_SIG = 0x02014b50;
const SECRET_NAME_RE = /(^|\/)(\.env[^/]*|[^/]*\.(pem|key|p12|pfx)|id_rsa[^/]*)$/i;

export class ZipError extends Error {}

function findEocd(buf) {
  const minOffset = Math.max(0, buf.length - 22 - 0xffff);
  for (let i = buf.length - 22; i >= minOffset; i -= 1) {
    if (buf.readUInt32LE(i) === EOCD_SIG) return i;
  }
  throw new ZipError('Không tìm thấy mục lục trong file zip');
}

// Đường dẫn trong zip phải tương đối, không có ".." và không có ổ đĩa.
export function safeEntryName(rawName) {
  const name = rawName.replace(/\\/g, '/');
  if (name.includes('\0') || name.startsWith('/') || /^[A-Za-z]:/.test(name)) {
    throw new ZipError(`Đường dẫn không hợp lệ: ${rawName}`);
  }
  const segments = name.split('/').filter((s) => s !== '' && s !== '.');
  if (segments.some((s) => s === '..')) {
    throw new ZipError(`Đường dẫn trỏ ra ngoài thư mục: ${rawName}`);
  }
  return segments.join('/');
}

export function readZipEntries(buf) {
  if (buf.length > ZIP_LIMITS.maxArchiveBytes) throw new ZipError('File zip vượt quá 20 MB');
  const eocd = findEocd(buf);
  const total = buf.readUInt16LE(eocd + 10);
  const cdOffset = buf.readUInt32LE(eocd + 16);
  if (total === 0xffff || cdOffset === 0xffffffff) throw new ZipError('Zip64 chưa được hỗ trợ');
  if (total > ZIP_LIMITS.maxEntries) throw new ZipError(`Zip có quá ${ZIP_LIMITS.maxEntries} file`);

  const entries = [];
  let p = cdOffset;
  for (let i = 0; i < total; i += 1) {
    if (buf.readUInt32LE(p) !== CD_SIG) throw new ZipError('Mục lục zip bị lỗi');
    const flags = buf.readUInt16LE(p + 8);
    const method = buf.readUInt16LE(p + 10);
    const compSize = buf.readUInt32LE(p + 20);
    const uncompSize = buf.readUInt32LE(p + 24);
    const nameLen = buf.readUInt16LE(p + 28);
    const extraLen = buf.readUInt16LE(p + 30);
    const commentLen = buf.readUInt16LE(p + 32);
    const localOffset = buf.readUInt32LE(p + 42);
    const rawName = buf.toString('utf8', p + 46, p + 46 + nameLen);
    entries.push({ rawName, flags, method, compSize, uncompSize, localOffset });
    p += 46 + nameLen + extraLen + commentLen;
  }
  return entries;
}

export function extractZip(buf, destDir) {
  const entries = readZipEntries(buf);
  const root = path.resolve(destDir);
  mkdirSync(root, { recursive: true });
  let totalBytes = 0;
  let files = 0;

  for (const entry of entries) {
    if (entry.flags & 0x1) throw new ZipError('Zip có mật khẩu, không hỗ trợ');
    if (entry.rawName.endsWith('/')) continue;
    if (entry.method !== 0 && entry.method !== 8) throw new ZipError(`Kiểu nén ${entry.method} chưa hỗ trợ`);
    if (entry.uncompSize > ZIP_LIMITS.maxEntryBytes) throw new ZipError(`File quá lớn: ${entry.rawName}`);
    totalBytes += entry.uncompSize;
    if (totalBytes > ZIP_LIMITS.maxTotalBytes) throw new ZipError('Tổng dung lượng sau giải nén vượt 100 MB');

    const name = safeEntryName(entry.rawName);
    if (!name) continue;
    // Không giải nén file bí mật (khoá, .env) vào máy chủ.
    if (SECRET_NAME_RE.test(name)) continue;
    const target = path.resolve(root, name);
    if (target !== root && !target.startsWith(root + path.sep)) {
      throw new ZipError(`Đường dẫn trỏ ra ngoài thư mục: ${entry.rawName}`);
    }

    const localNameLen = buf.readUInt16LE(entry.localOffset + 26);
    const localExtraLen = buf.readUInt16LE(entry.localOffset + 28);
    const dataStart = entry.localOffset + 30 + localNameLen + localExtraLen;
    const raw = buf.subarray(dataStart, dataStart + entry.compSize);
    const data = entry.method === 0 ? raw : inflateRawSync(raw, { maxOutputLength: ZIP_LIMITS.maxEntryBytes });
    if (data.length !== entry.uncompSize) throw new ZipError(`Dung lượng không khớp: ${entry.rawName}`);

    mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, data);
    files += 1;
  }
  return { files, totalBytes };
}
