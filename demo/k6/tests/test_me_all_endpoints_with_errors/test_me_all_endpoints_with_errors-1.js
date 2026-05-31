import testMeAllEndpointsWithErrors from './test_me_all_endpoints_with_errors.js';

// Запуск:
// export LOAD_HOST='localhost:8080'
// export TESTID='with-errors'
// export K6_PROMETHEUS_RW_SERVER_URL=http://localhost:9091/api/v1/write
// k6 run -o experimental-prometheus-rw tests/test_me_all_endpoints_with_errors/test_me_all_endpoints_with_errors-1.js

export const options = {
  tags: { testid: __ENV.TESTID || 'with-errors' },
  scenarios: {
    testMeAllEndpointsWithErrors: {
      executor: 'ramping-vus',
      startVUs: 1,
      stages: [
        { duration: '1m', target: 15 },
        { duration: '1m', target: 15 },
      ],
      exec: 'testMeAllEndpointsWithErrorsLoad',
    },
  },
  thresholds: {
    http_req_duration: ['p(95) < 5000'],
    checks: ['rate > 0.95'],
  },
};

export function testMeAllEndpointsWithErrorsLoad() {
  testMeAllEndpointsWithErrors();
}
