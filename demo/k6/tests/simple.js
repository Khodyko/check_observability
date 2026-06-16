import http from 'k6/http';
import { sleep } from 'k6';

// Минимальный k6-скрипт: структура файла без check/thresholds
// cd demo/k6/tests && k6 run -o experimental-prometheus-rw simple.js

export const options = {
  tags: { testid: 'simple' },
  vus: 1,
  duration: '5s',
};

export default function () {
  http.get(`http://localhost:8080/api/fast?mode=3`);
  sleep(1);
}
