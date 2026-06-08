import http from 'k6/http';
import { check } from 'k6';
import { BASE_URL } from '../common.js';

// Теги на запросах и thresholds по тегам
// cd demo/k6/tests/tag && k6 run -o experimental-prometheus-rw tag.js

export const options = {
  tags: { testid: __ENV.TESTID || 'tag' },
  vus: 1,
  duration: '10s',
  thresholds: {
    http_req_duration: ['p(95)<1000'],
    'http_req_duration{status:200}': ['p(95)<1000'],
    "http_req_duration{speed:'slow'}": ['p(95)<3000'],
    "http_req_duration{speed:'fast'}": ['p(95)<1000'],
    "checks{speed:'fast'}": ['rate>0.99'],
  },
};

export default function () {
  const fastRes = http.post(`${BASE_URL}/api/fast`, null, { tags: { speed: 'fast' } });
  const slowRes = http.post(`${BASE_URL}/api/slow`, null, { tags: { speed: 'slow' } });

  check(fastRes, { 'fast status is 200': (r) => r.status === 200 }, { speed: 'fast' });
  check(slowRes, { 'slow status is 200': (r) => r.status === 200 }, { speed: 'slow' });
}
