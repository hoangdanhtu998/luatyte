// Kiểm thử tải nhẹ bằng k6. BASE_URL mặc định là app đang chạy ở cổng 3000.
import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE = __ENV.BASE_URL || 'http://127.0.0.1:3000';

export const options = {
  stages: [
    { duration: '10s', target: 10 },
    { duration: '20s', target: 20 },
    { duration: '5s', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<300'],
  },
};

export default function () {
  const health = http.get(`${BASE}/api/health`);
  check(health, { 'health 200': (r) => r.status === 200 });
  const list = http.get(`${BASE}/api/testcases?projectId=PRJ-001`);
  check(list, { 'list 200': (r) => r.status === 200 });
  const summary = http.get(`${BASE}/api/summary`);
  check(summary, { 'summary 200': (r) => r.status === 200 });
  sleep(0.5);
}
