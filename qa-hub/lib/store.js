import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { DEFAULT_PROJECT_ID } from './projects.js';

// prefix dùng để sinh mã khi insert. Collection không có insert (suites, checklist)
// chỉ đọc từ seed hoặc cập nhật theo id.
const COLLECTIONS = {
  testcases: { prefix: 'TC' },
  bugs: { prefix: 'BUG' },
  reviews: { prefix: 'REV' },
  requirements: { prefix: 'REQ' },
  suites: { prefix: 'TS' },
  checklist: { prefix: 'CL' },
  projects: { prefix: 'PRJ' },
  runs: { prefix: 'RUN' },
};

// Dữ liệu cũ chưa có projectId thuộc dự án mặc định.
const PROJECT_SCOPED = ['testcases', 'bugs', 'reviews'];

function writeAtomic(file, data) {
  const tmp = `${file}.tmp`;
  writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8');
  renameSync(tmp, file);
}

function nextId(prefix, items) {
  const max = items.reduce((acc, item) => {
    const n = Number(String(item.id).split('-')[1]);
    return Number.isFinite(n) && n > acc ? n : acc;
  }, 0);
  return `${prefix}-${String(max + 1).padStart(3, '0')}`;
}

export function createStore({ dataDir, seedFile }) {
  mkdirSync(dataDir, { recursive: true });
  const seed = JSON.parse(readFileSync(seedFile, 'utf8'));
  const state = {};

  for (const name of Object.keys(COLLECTIONS)) {
    const file = path.join(dataDir, `${name}.json`);
    if (!existsSync(file)) {
      writeAtomic(file, seed[name] ?? []);
    }
    state[name] = JSON.parse(readFileSync(file, 'utf8'));
    if (PROJECT_SCOPED.includes(name)) {
      state[name] = state[name].map((item) => (item.projectId ? item : { ...item, projectId: DEFAULT_PROJECT_ID }));
    }
  }

  const persist = (name) => writeAtomic(path.join(dataDir, `${name}.json`), state[name]);

  const find = (name, id) => state[name].find((item) => item.id === id) ?? null;

  return {
    list: (name) => [...state[name]],
    find,
    insert(name, fields) {
      const item = {
        ...fields,
        id: nextId(COLLECTIONS[name].prefix, state[name]),
        createdAt: new Date().toISOString(),
      };
      state[name] = [...state[name], item];
      persist(name);
      return item;
    },
    update(name, id, patch) {
      const updated = { ...find(name, id), ...patch, updatedAt: new Date().toISOString() };
      state[name] = state[name].map((item) => (item.id === id ? updated : item));
      persist(name);
      return updated;
    },
  };
}
