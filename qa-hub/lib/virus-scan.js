// Quét virus thư mục mã nguồn bằng Microsoft Defender (MpCmdRun.exe). Không dùng shell.
// Mã thoát của MpCmdRun: 0 = sạch, 2 = phát hiện mối đe dọa. Mã khác = lỗi.
import { execFile } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';

const DEFENDER_CANDIDATES = [
  'C:\\Program Files\\Windows Defender\\MpCmdRun.exe',
  'C:\\ProgramData\\Microsoft\\Windows Defender\\Platform',
];
const SCAN_TIMEOUT_MS = 10 * 60 * 1000;
const EXIT_CLEAN = 0;
const EXIT_THREAT = 2;

// Tìm MpCmdRun.exe. Thư mục Platform chứa các phiên bản con, lấy bản mới nhất.
export function findDefenderCli(exists = existsSync, listDir = null) {
  if (exists(DEFENDER_CANDIDATES[0])) return DEFENDER_CANDIDATES[0];
  if (exists(DEFENDER_CANDIDATES[1]) && listDir) {
    const versions = listDir(DEFENDER_CANDIDATES[1]).sort().reverse();
    for (const version of versions) {
      const candidate = path.join(DEFENDER_CANDIDATES[1], version, 'MpCmdRun.exe');
      if (exists(candidate)) return candidate;
    }
  }
  return null;
}

// Trả về { status: 'clean' | 'threat' | 'unavailable' | 'error', detail }.
export function scanForThreats(targetDir, { cli, execFileImpl = execFile } = {}) {
  if (!cli) return Promise.resolve({ status: 'unavailable', detail: 'Không tìm thấy Microsoft Defender để quét virus' });
  return new Promise((resolve) => {
    execFileImpl(cli, ['-Scan', '-ScanType', '3', '-File', targetDir, '-DisableRemediation'],
      { timeout: SCAN_TIMEOUT_MS, windowsHide: true }, (err, stdout) => {
        const code = err ? err.code : 0;
        if (code === EXIT_CLEAN) return resolve({ status: 'clean', detail: 'Không phát hiện mối đe dọa' });
        if (code === EXIT_THREAT) return resolve({ status: 'threat', detail: 'Phát hiện mối đe dọa, đã dừng luồng' });
        resolve({ status: 'error', detail: `Quét virus lỗi (mã ${code ?? 'không rõ'}): ${String(stdout ?? '').split('\n')[0].slice(0, 160)}` });
      });
  });
}
