import http from 'k6/http';
import { check, sleep } from 'k6';
import { BASE_URL } from './common.js';

// Spike: резкий скачок трафика
// k6 run -o experimental-prometheus-rw tests/spike.js

export const options = {
  tags: { testid: __ENV.TESTID || 'spike' },
  stages: [
    { duration: '1m', target: 5 },
    { duration: '10s', target: 50 },
    { duration: '1m', target: 50 },
    { duration: '30s', target: 5 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.10'],
  },
};

export default function () {
  const res = http.get(`${BASE_URL}/api/fast?mode=1`);
  check(res, { 'status is 200': (r) => r.status === 200 });
  sleep(1);
}
