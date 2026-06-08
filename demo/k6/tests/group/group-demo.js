import http from 'k6/http';
import { group } from 'k6';
import { BASE_URL } from '../common.js';

// Groups: логические блоки с отдельными group_duration-метриками
// cd demo/k6/tests/group && k6 run -o experimental-prometheus-rw group-demo.js

export const options = {
  tags: { testid: __ENV.TESTID || 'group' },
  vus: 1,
  duration: '10s',
  thresholds: {
    'group_duration{group:::fast}': ['avg < 500'],
    'group_duration{group:::slow}': ['avg < 2000'],
  },
};

export default function () {
  group('fast', function () {
    http.post(`${BASE_URL}/api/fast`, null);
  });

  group('slow', function () {
    http.post(`${BASE_URL}/api/slow`, null);
  });
}
