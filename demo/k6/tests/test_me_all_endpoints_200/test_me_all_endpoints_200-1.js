import testMeAllEndpoints200 from './test_me_all_endpoints_200.js';

// Запуск:
// export LOAD_HOST='localhost:8080'
// export TESTID='all-endpoints-200'
// export K6_PROMETHEUS_RW_SERVER_URL=http://localhost:9091/api/v1/write
// k6 run -o experimental-prometheus-rw tests/test_me_all_endpoints_200/test_me_all_endpoints_200-1.js

export const options = {
  tags: { testid: __ENV.TESTID || 'all-endpoints-200' },
  scenarios: {
    testMeAllEndpoints200: {
      executor: 'ramping-vus',
      startVUs: 1,
      stages: [
        { duration: '1m', target: 15 },
        { duration: '1m', target: 15 },
      ],
      exec: 'testMeAllEndpoints200Load',
    },
  },
  thresholds: {
    http_req_duration: ['p(95) < 5000'],
    checks: ['rate > 0.95'],
  },
};

export function testMeAllEndpoints200Load() {
  testMeAllEndpoints200();
}
