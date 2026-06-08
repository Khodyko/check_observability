import http from 'k6/http';
import { check, sleep } from 'k6';
import { BASE_URL } from '../common.js';
import { login, getAuthHeaders } from './auth.js';

// Auth demo: login → Bearer → 200, без токена → 401
// k6 run -o experimental-prometheus-rw tests/auth/auth-demo.js

export const options = {
  tags: { testid: __ENV.TESTID || 'auth-demo' },
  vus: 2,
  duration: '30s',
  thresholds: {
    checks: ['rate>0.99'],
  },
};

/**
 * Логин один раз на прогон.
 *
 * @returns {{ token: string }} данные для итераций
 */
export function setup() {
  return { token: login() };
}

export default function (data) {
  const withToken = http.get(`${BASE_URL}/api/secure`, getAuthHeaders(data.token));
  check(withToken, { 'secure with token is 200': (r) => r.status === 200 });

  const withoutToken = http.get(`${BASE_URL}/api/secure`);
  check(withoutToken, { 'secure without token is 401': (r) => r.status === 401 });
  sleep(1);
}
