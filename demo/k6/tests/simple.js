import http from 'k6/http';
import { sleep } from 'k6';
import { BASE_URL } from './common.js';

// Минимальный k6-скрипт: структура файла без check/thresholds
// cd demo/k6/tests && k6 run -o experimental-prometheus-rw simple.js

export const options = {
  tags: { testid: __ENV.TESTID || 'simple' },
  vus: 1,
  duration: '5s',
};

export default function () {
  http.get(`${BASE_URL}/api/fast?mode=3`);
  sleep(1);
}
