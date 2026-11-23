// Lưu ý tưởng test sinh từ mã thành test case của dự án. Không tạo trùng tiêu đề, không ghi đè ca đã có.
import { validateTestCase } from './validate.js';

// Trả về số ca mới đã ghi. Ý tưởng không hợp lệ bị bỏ qua, không làm hỏng cả lô.
export function saveTestIdeas(store, projectId, ideas) {
  const existing = new Set(
    store.list('testcases')
      .filter((tc) => tc.projectId === projectId)
      .map((tc) => tc.title),
  );
  let created = 0;
  for (const idea of ideas) {
    if (existing.has(idea.title)) continue;
    const check = validateTestCase(idea);
    if (!check.ok) continue;
    store.insert('testcases', { ...check.value, projectId, result: 'not_run', status: 'draft' });
    existing.add(idea.title);
    created += 1;
  }
  return created;
}
