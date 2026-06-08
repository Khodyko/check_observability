import http from 'k6/http';
import { check, sleep } from 'k6';
import { BASE_URL, POST_PARAMS } from './common.js';

// Load: ожидаемая нагрузка, стабильная работа
// cd demo/k6/tests && k6 run -o experimental-prometheus-rw load.js

export const options = {
  tags: { testid: __ENV.TESTID || 'load' },
  stages: [
    { duration: '1m', target: 20 },
    { duration: '30s', target: 40 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<5000'],
    checks: ['rate>0.95'],
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
