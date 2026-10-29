// Hợp đồng dữ liệu Lộ trình theo vai trò: mọi khóa phải trỏ tới dữ liệu gốc.
// Chạy: cd "app luật y tế" && node --test test/role-roadmap.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const read = f => JSON.parse(readFileSync(join(ROOT, 'data', f), 'utf8'));
const laws = read('laws.json');
const theory = read('ly_thuyet.json');
const quizFiles = ['quiz.json', 'quiz_bhyt.json', 'quiz_his.json', 'quiz_nentang.json'];
const quiz = Object.fromEntries(quizFiles.map(f => [f, read(f)]));
const allQuiz = Object.values(quiz).flat();
const roadmap = read('lo-trinh-vai-tro.json');

export function validateRoadmap(data, sources) {
  const errors = [];
  const push = (field, message) => errors.push({ field, message });
  const lawById = new Map(sources.laws.map(l => [l.id, l]));
  const chapterIds = new Set(sources.theory.chuong.map(c => c.id));
  const questionKeys = new Set(sources.quiz.map(q => q.q));
  if (!data || !Array.isArray(data.vai_tro) || !data.chuong || !data.cau_hoi) return [{ field: 'root', message: 'thiếu vai_tro/chuong/cau_hoi' }];
  const roleIds = new Set(), chapterToRoles = new Map();
  for (const role of data.vai_tro) {
    if (!role.id || roleIds.has(role.id)) push('vai_tro.id', `trùng/thiếu: ${role.id}`);
    roleIds.add(role.id);
    if (!role.ten || !role.mo_ta) push(`vai_tro.${role.id}`, 'thiếu tên/mô tả');
    if (!Array.isArray(role.chuong) || new Set(role.chuong).size !== role.chuong.length) push(`vai_tro.${role.id}.chuong`, 'chương trùng/không phải mảng');
    if (role.chuong?.[0] !== 'c10' || role.chuong?.[1] !== 'c11') push(`vai_tro.${role.id}.chuong`, 'phải bắt đầu bằng c10, c11');
    const professional = (role.chuong || []).filter(c => !['c10', 'c11'].includes(c));
    if (professional.length < 3) push(`vai_tro.${role.id}.chuong`, 'cần ít nhất 3 chương chuyên môn');
    for (const c of role.chuong || []) {
      if (!chapterIds.has(c)) push(`vai_tro.${role.id}.chuong`, `chương không tồn tại: ${c}`);
      const list = chapterToRoles.get(c) || [];
      list.push(role.id); chapterToRoles.set(c, list);
    }
    if (!Array.isArray(role.van_ban)) push(`vai_tro.${role.id}.van_ban`, 'phải là mảng');
    for (const id of role.van_ban || []) {
      const law = lawById.get(id);
      if (!law) push(`vai_tro.${role.id}.van_ban`, `văn bản không tồn tại: ${id}`);
      else if (law.status === 'het') push(`vai_tro.${role.id}.van_ban`, `văn bản hết hiệu lực trong lộ trình chính: ${id}`);
    }
  }
  for (const [c, meta] of Object.entries(data.chuong)) {
    if (!chapterIds.has(c)) push('chuong', `chương không tồn tại: ${c}`);
    const expected = (chapterToRoles.get(c) || []).sort();
    const actual = (meta.vai_tro || []).slice().sort();
    if (JSON.stringify(expected) !== JSON.stringify(actual)) push(`chuong.${c}.vai_tro`, 'không khớp danh sách vai');
  }
  for (const role of data.vai_tro) {
    const keys = new Set();
    for (const [q, chapters] of Object.entries(data.cau_hoi)) {
      if (!questionKeys.has(q)) push('cau_hoi', `câu không tồn tại: ${q.slice(0, 80)}`);
      if (!Array.isArray(chapters) || !chapters.length) push(`cau_hoi.${q}`, 'phải có ít nhất một chương');
      for (const c of chapters || []) if (!chapterIds.has(c)) push(`cau_hoi.${q}`, `chương không tồn tại: ${c}`);
      if ((chapters || []).some(c => role.chuong.includes(c))) keys.add(q);
    }
    if (keys.size < 30) push(`vai_tro.${role.id}.so_cau`, `chỉ có ${keys.size} câu, cần >=30`);
    if (role.so_cau !== keys.size) push(`vai_tro.${role.id}.so_cau`, 'so_cau không khớp ánh xạ');
  }
  return errors;
}

test('dữ liệu lộ trình vai trò hợp lệ', () => {
  const errors = validateRoadmap(roadmap, { laws, theory, quiz: allQuiz });
  assert.deepEqual(errors, []);
  assert.equal(roadmap.vai_tro.length, 5);
  assert.ok(Object.keys(roadmap.cau_hoi).length >= 100);
});

test('validator bắt chương/câu/vai sai và vai thiếu câu', () => {
  const bad = structuredClone(roadmap);
  bad.vai_tro[0].chuong.push('c99');
  const key = Object.keys(bad.cau_hoi)[0];
  bad.cau_hoi[key] = ['c99'];
  bad.vai_tro[1].so_cau = 1;
  const errors = validateRoadmap(bad, { laws, theory, quiz: allQuiz });
  assert.ok(errors.some(e => e.field.includes('chuong') || e.message.includes('không tồn tại')));
  assert.ok(errors.some(e => e.field.includes('so_cau')));
});

test('không có văn bản hết hiệu lực trong lộ trình chính', () => {
  for (const role of roadmap.vai_tro) {
    const het = role.van_ban.filter(id => laws.find(l => l.id === id)?.status === 'het');
    assert.deepEqual(het, [], `${role.id} chứa văn bản hết hiệu lực`);
  }
});
