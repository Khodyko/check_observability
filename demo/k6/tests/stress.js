import http from 'k6/http';
import { check, sleep } from 'k6';
import { BASE_URL, POST_PARAMS } from './common.js';

// Stress: выше нормы — где деградация
// cd demo/k6/tests && k6 run -o experimental-prometheus-rw stress.js

export const options = {
  tags: { testid: __ENV.TESTID || 'stress' },
  stages: [
    { duration: '1m', target: 10 },
    { duration: '1m', target: 20 },
    { duration: '1m', target: 30 },
    { duration: '1m', target: 40 },
    { duration: '1m', target: 50 },
    { duration: '1m', target: 60 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<15000'],
  },
};

export default function () {
  const endpoints = [
    () => http.post(`${BASE_URL}/api/fast`, JSON.stringify({}, POST_PARAMS))
  ];

  for (const call of endpoints) {
    const res = call();
    check(res, { 'status is 200': (r) => r.status === 200 });
  }
  sleep(1);
}
