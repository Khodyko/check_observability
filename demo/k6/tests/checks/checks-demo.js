import http from 'k6/http';
import { check, sleep } from 'k6';
import { BASE_URL } from '../common.js';

// Демо check() и thresholds
// cd demo/k6/tests/checks && k6 run -o experimental-prometheus-rw checks-demo.js

export const options = {
  tags: { testid: __ENV.TESTID || 'checks' },
  vus: 1,
  duration: '10s',
  thresholds: {
    http_req_duration: ['p(95)<1000'],
    checks: ['rate>0.99'],
  },
};

export default function () {
  const res = http.get(`${BASE_URL}/api/fast?mode=1`);
  check(res, {
    'status is 200': (r) => r.status === 200,
    'body is not empty': (r) => r.body.length > 0,
  });
  sleep(1);
}
