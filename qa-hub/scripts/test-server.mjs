// Khởi động server cho test: xóa dữ liệu cũ để mỗi lần chạy bắt đầu từ seed.
import { rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = path.resolve(root, process.env.DATA_DIR ?? '.test-data');

rmSync(dataDir, { recursive: true, force: true });
await import('../server.js');
