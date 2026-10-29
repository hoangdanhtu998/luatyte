// Hợp đồng dữ liệu nội dung: schema, trùng lặp, đáp án, tham chiếu, bộ câu đặc thù.
// Chạy: cd "app luật y tế" && node --test test/content-contract.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const readJson = f => JSON.parse(readFileSync(join(ROOT, 'data', f), 'utf8'));

const laws = readJson('laws.json');
const theory = readJson('ly_thuyet.json');
const tf = readJson('tf.json');
const quizFiles = ['quiz.json', 'quiz_bhyt.json', 'quiz_his.json', 'quiz_lythuyet.json', 'quiz_nentang.json'];
const quizzes = Object.fromEntries(quizFiles.map(f => [f, readJson(f)]));
const allQuiz = Object.values(quizzes).flat();

const nonEmpty = v => typeof v === 'string' && v.trim().length > 0;

// Trả về danh sách lỗi dạng { file, id, field, message }; dùng cho cả dữ liệu thật và fixture xấu.
export function validateContent(input) {
  const errors = [];
  const push = (file, id, field, message) => errors.push({ file, id, field, message });
  const checkQuizSet = (file, rows) => {
    if (!Array.isArray(rows)) return push(file, '-', 'root', 'phải là mảng');
    const seen = new Set();
    rows.forEach((q, i) => {
      const id = q.id || `#${i + 1}`;
      if (!nonEmpty(q.q)) push(file, id, 'q', 'thiếu nội dung câu hỏi');
      if (nonEmpty(q.q) && seen.has(q.q)) push(file, id, 'q', 'câu hỏi bị trùng');
      seen.add(q.q);
      if (!Array.isArray(q.o) || q.o.length < 3) push(file, id, 'o', 'phải có ít nhất 3 lựa chọn');
      if (Array.isArray(q.o) && new Set(q.o).size !== q.o.length) push(file, id, 'o', 'lựa chọn bị trùng');
      if (!Number.isInteger(q.a) || q.a < 0 || q.a >= (q.o?.length || 0)) push(file, id, 'a', 'đáp án ngoài phạm vi');
      if (!nonEmpty(q.e)) push(file, id, 'e', 'thiếu giải thích');
    });
  };

  if (!Array.isArray(input.laws)) push('laws.json', '-', 'root', 'phải là mảng');
  else {
    const ids = new Map(), numbers = new Map();
    input.laws.forEach((l, i) => {
      const id = l.id || `#${i + 1}`;
      for (const f of ['id', 'name', 'so', 'pass', 'eff', 'cat']) if (!nonEmpty(l[f])) push('laws.json', id, f, 'thiếu trường bắt buộc');
      if (!['on', 'amend', 'het'].includes(l.status)) push('laws.json', id, 'status', 'trạng thái không hợp lệ');
      if (!nonEmpty(l.nguon) && !nonEmpty(l.detailSource) && l.verify !== true) push('laws.json', id, 'nguon', 'thiếu nguồn và chưa đánh dấu verify');
      if (!Array.isArray(l.points) || !l.points.length || l.points.some(p => !nonEmpty(p))) push('laws.json', id, 'points', 'phải có điểm nội dung không rỗng');
      if (nonEmpty(l.id)) {
        if (ids.has(l.id)) push('laws.json', id, 'id', `trùng id với ${ids.get(l.id)}`);
        else ids.set(l.id, id);
      }
      if (nonEmpty(l.so)) {
        if (numbers.has(l.so)) push('laws.json', id, 'so', `trùng số hiệu với ${numbers.get(l.so)}`);
        else numbers.set(l.so, id);
      }
    });
  }

  Object.entries(input.quizzes).forEach(([f, rows]) => checkQuizSet(f, rows));

  if (!Array.isArray(input.tf)) push('tf.json', '-', 'root', 'phải là mảng');
  else input.tf.forEach((row, i) => {
    const id = `#${i + 1}`;
    if (!Array.isArray(row) || row.length < 3) return push('tf.json', id, 'row', 'phải có [câu, đáp án, giải thích]');
    if (!nonEmpty(row[0])) push('tf.json', id, 'q', 'thiếu nội dung');
    if (typeof row[1] !== 'boolean') push('tf.json', id, 'a', 'đáp án phải là boolean');
    if (!nonEmpty(row[2])) push('tf.json', id, 'e', 'thiếu giải thích');
  });

  if (!input.theory || typeof input.theory !== 'object') push('ly_thuyet.json', '-', 'root', 'thiếu object');
  else {
    if (!nonEmpty(input.theory.meta?.ten)) push('ly_thuyet.json', '-', 'meta.ten', 'thiếu tên bộ lý thuyết');
    if (!Array.isArray(input.theory.chuong)) push('ly_thuyet.json', '-', 'chuong', 'phải là mảng');
    else {
      const ids = new Set();
      input.theory.chuong.forEach(c => {
        const id = c.id || '(không id)';
        if (!nonEmpty(c.id)) push('ly_thuyet.json', id, 'id', 'thiếu id');
        else if (ids.has(c.id)) push('ly_thuyet.json', id, 'id', 'trùng id chương');
        else ids.add(c.id);
        if (!nonEmpty(c.ten)) push('ly_thuyet.json', id, 'ten', 'thiếu tên chương');
        if (!Array.isArray(c.buoc) || !c.buoc.length) push('ly_thuyet.json', id, 'buoc', 'phải có bước');
        else c.buoc.forEach((b, i) => {
          for (const f of ['tieu_de', 'giai_thich', 'nguon']) if (!nonEmpty(b[f])) push('ly_thuyet.json', id, `buoc[${i}].${f}`, 'thiếu nội dung');
        });
      });
    }
  }
  return errors;
}

function readMetaSets() {
  const html = readFileSync(join(ROOT, 'index.html'), 'utf8');
  const grab = name => {
    const m = html.match(new RegExp(`const ${name} = new Set\\(\\[([\\s\\S]*?)\\]\\);`));
    assert.ok(m, `không tìm thấy ${name} trong index.html`);
    return m[1].match(/"(?:[^"\\]|\\.)*"/g)?.map(s => JSON.parse(s)) || [];
  };
  return { metaQs: grab('META_QS'), metaTf: grab('META_TF') };
}

test('dữ liệu thật thỏa hợp đồng', () => {
  const errors = validateContent({ laws, quizzes, tf, theory });
  assert.deepEqual(errors, []);
  assert.ok(laws.length >= 40, `laws phải còn ít nhất 40, hiện ${laws.length}`);
  assert.ok(allQuiz.length >= 187, `quiz phải còn ít nhất 187, hiện ${allQuiz.length}`);
  assert.ok(tf.length >= 23, `tf phải còn ít nhất 23, hiện ${tf.length}`);
  assert.ok(theory.chuong.length >= 14, `lý thuyết phải còn ít nhất 14 chương, hiện ${theory.chuong.length}`);
});

test('bộ câu đặc thù đúng 8 và mọi câu đều tồn tại trong dữ liệu', () => {
  const { metaQs, metaTf } = readMetaSets();
  assert.equal(metaQs.length + metaTf.length, 8);
  for (const q of metaQs) assert.ok(allQuiz.some(x => x.q === q), `META_QS không có trong dữ liệu: ${q}`);
  for (const q of metaTf) assert.ok(tf.some(row => row[0] === q), `META_TF không có trong dữ liệu: ${q}`);
});

test('contract chặn được fixture thiếu trường, trùng id và đáp án sai', () => {
  const badLaws = structuredClone(laws);
  delete badLaws[0].so;
  const badQuizzes = structuredClone(quizzes);
  badQuizzes['quiz.json'].push({ ...badQuizzes['quiz.json'][0] });
  badQuizzes['quiz_bhyt.json'][0].a = 99;

  const errors = validateContent({
    laws: badLaws,
    quizzes: badQuizzes,
    tf: structuredClone(tf),
    theory: structuredClone(theory),
  });
  assert.ok(errors.some(e => e.file === 'laws.json' && e.field === 'so'), 'phải bắt thiếu số hiệu');
  assert.ok(errors.some(e => e.file === 'quiz.json' && e.field === 'q' && e.message.includes('trùng')), 'phải bắt trùng câu hỏi');
  assert.ok(errors.some(e => e.file === 'quiz_bhyt.json' && e.field === 'a'), 'phải bắt đáp án ngoài phạm vi');

  const badAnswer2 = structuredClone(quizzes);
  badAnswer2['quiz.json'][0].a = 99;
  const errors2 = validateContent({ laws: structuredClone(laws), quizzes: badAnswer2, tf: structuredClone(tf), theory: structuredClone(theory) });
  assert.ok(errors2.some(e => e.file === 'quiz.json' && e.field === 'a'), 'phải bắt đáp án sai ở quiz.json');
});
