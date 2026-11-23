// Quét domain ở mức HTTP: chỉ GET, chỉ HTTPS, không đăng nhập, không gửi form.
// Chặn địa chỉ nội bộ để server không bị dùng để dò mạng riêng (SSRF).
import dns from 'node:dns/promises';
import net from 'node:net';

const SCAN_TIMEOUT_MS = 10000;
const BODY_LIMIT_BYTES = 512 * 1024;
const USER_AGENT = 'QA-Hub-Scanner/1.0 (kiểm thử domain do chủ sở hữu cho phép)';
const SLOW_MS = 3000;

export function isPrivateAddress(ip) {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split('.').map(Number);
    return a === 0 || a === 10 || a === 127 || a >= 224
      || (a === 100 && b >= 64 && b <= 127)
      || (a === 169 && b === 254)
      || (a === 172 && b >= 16 && b <= 31)
      || (a === 192 && b === 168);
  }
  if (net.isIPv6(ip)) {
    const lower = ip.toLowerCase();
    if (lower.startsWith('::ffff:')) return isPrivateAddress(lower.slice(7));
    return lower === '::' || lower === '::1'
      || lower.startsWith('fc') || lower.startsWith('fd')
      || lower.startsWith('fe8') || lower.startsWith('fe9')
      || lower.startsWith('fea') || lower.startsWith('feb');
  }
  return true;
}

export async function assertPublicHost(hostname) {
  if (hostname === 'localhost' || hostname.endsWith('.localhost')) {
    throw new Error('Không quét localhost');
  }
  const addresses = net.isIP(hostname)
    ? [{ address: hostname }]
    : await dns.lookup(hostname, { all: true });
  if (addresses.some((a) => isPrivateAddress(a.address))) {
    throw new Error('Domain trỏ tới địa chỉ nội bộ, không được quét');
  }
}

async function readLimited(res) {
  const reader = res.body?.getReader();
  if (!reader) return '';
  const chunks = [];
  let size = 0;
  while (size < BODY_LIMIT_BYTES) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    size += value.length;
  }
  await reader.cancel().catch(() => {});
  return Buffer.concat(chunks.map((c) => Buffer.from(c))).toString('utf8');
}

const SECURITY_HEADERS = [
  ['content-security-policy', 'Có Content-Security-Policy'],
  ['strict-transport-security', 'Có Strict-Transport-Security (HSTS)'],
  ['x-content-type-options', 'Có X-Content-Type-Options'],
  ['x-frame-options', 'Có X-Frame-Options'],
  ['referrer-policy', 'Có Referrer-Policy'],
];

export async function scanDomain(rawUrl, fetchImpl = fetch) {
  let url;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new Error('URL không hợp lệ');
  }
  if (url.protocol !== 'https:') throw new Error('Chỉ quét https');
  await assertPublicHost(url.hostname);

  const checks = [];
  const add = (name, ok, detail) => checks.push({ name, ok, detail });
  const get = (target) => fetchImpl(target, {
    method: 'GET',
    redirect: 'manual',
    headers: { 'user-agent': USER_AGENT, accept: 'text/html,*/*' },
    signal: AbortSignal.timeout(SCAN_TIMEOUT_MS),
  });

  const t0 = Date.now();
  const home = await get(url.href);
  const elapsed = Date.now() - t0;
  const status = home.status;

  add('HTTPS', true, `Địa chỉ dùng ${url.protocol}`);
  if (status >= 300 && status < 400) {
    const location = home.headers.get('location') ?? '';
    const sameOrSecure = location.startsWith('https://') || location.startsWith('/');
    add('Trang chủ chuyển hướng', sameOrSecure, `HTTP ${status} → ${location || '(không có Location)'}`);
  } else {
    add('Trang chủ tải được', status >= 200 && status < 300, `HTTP ${status}`);
  }
  add('Thời gian phản hồi', elapsed < SLOW_MS, `${elapsed} ms (ngưỡng ${SLOW_MS} ms)`);

  for (const [header, label] of SECURITY_HEADERS) {
    const present = home.headers.has(header);
    add(label, present, present ? 'có' : 'thiếu');
  }

  const contentType = home.headers.get('content-type') ?? '';
  if (status >= 200 && status < 300) {
    const body = await readLimited(home);
    add('Nội dung là HTML', contentType.includes('text/html'), contentType || '(không có Content-Type)');
    const title = /<title[^>]*>([^<]{1,200})<\/title>/i.exec(body);
    add('Có thẻ title', Boolean(title), title ? `"${title[1].trim()}"` : 'không tìm thấy');
  }

  const probe = `${url.origin}/qa-hub-probe-${Date.now()}-missing`;
  const missing = await get(probe);
  await missing.body?.cancel().catch(() => {});
  add('Trang không tồn tại trả 404', missing.status === 404 || missing.status === 410,
    `HTTP ${missing.status} (soft-404 hoặc 500 là lỗi)`);

  return {
    scannedAt: new Date().toISOString(),
    url: url.href,
    passed: checks.filter((c) => c.ok).length,
    total: checks.length,
    checks,
  };
}
