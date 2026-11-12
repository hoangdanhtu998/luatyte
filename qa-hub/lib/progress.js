// Tiến độ của một lượt tự động: mỗi bước có trạng thái, phần trăm tính từ số bước đã xong.

export const JOB_STATES = ['idle', 'running', 'done', 'error'];

// Bước đang chạy: bước đầu tiên chưa xong. Hết bước thì trả null.
export function currentStepKey(steps) {
  const next = steps.find((step) => step.status === 'running' || step.status === 'pending');
  return next ? next.key : null;
}

// Phần trăm = bước đã xong (done, skipped) trên tổng số bước. Bước lỗi không tính là xong.
export function percentComplete(steps) {
  if (steps.length === 0) return 0;
  const finished = steps.filter((step) => step.status === 'done' || step.status === 'skipped').length;
  return Math.round((finished / steps.length) * 100);
}

export function newJob({ id, projectId, stepDefs, now }) {
  return {
    id,
    projectId,
    state: 'running',
    startedAt: now,
    finishedAt: null,
    steps: stepDefs.map((def) => ({ key: def.key, label: def.label, status: 'pending', detail: null })),
  };
}

// Cập nhật một bước; trả về bản job mới (không sửa job cũ).
export function setStep(job, key, status, detail = null) {
  return {
    ...job,
    steps: job.steps.map((step) => (step.key === key ? { ...step, status, detail } : step)),
  };
}

export function summarize(job) {
  if (!job) return { state: 'idle', percent: 0, current: null, steps: [] };
  return {
    id: job.id,
    projectId: job.projectId,
    state: job.state,
    percent: percentComplete(job.steps),
    current: currentStepKey(job.steps),
    startedAt: job.startedAt,
    finishedAt: job.finishedAt,
    steps: job.steps,
  };
}
