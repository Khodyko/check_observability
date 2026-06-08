import http from 'k6/http';
import { Counter } from 'k6/metrics';
import { BASE_URL } from '../common.js';

// Custom metric: Counter my_counter → Prometheus (k6_my_counter)
// cd demo/k6/tests/custom-metric && k6 run -o experimental-prometheus-rw custom-metric-demo.js

const myCounter = new Counter('my_counter');

export const options = {
  tags: { testid: __ENV.TESTID || 'custom-metric' },
  vus: 1,
  duration: '10s',
};

export default function () {
  http.get(`${BASE_URL}/api/fast?mode=1`);
  myCounter.add(1);
}
