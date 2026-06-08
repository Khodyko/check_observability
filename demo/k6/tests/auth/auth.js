import http from 'k6/http';
import { check } from 'k6';
import { BASE_URL, POST_PARAMS } from '../common.js';

const AUTH_USER = __ENV.AUTH_USER || 'demo';
const AUTH_PASS = __ENV.AUTH_PASS || 'demo';

/**
 * Выполняет логин и возвращает accessToken.
 * Вызывать из setup(), не из default().
 *
 * @returns {string} access token
 */
export function login() {
  const res = http.post(
    `${BASE_URL}/auth/login`,
    JSON.stringify({ username: AUTH_USER, password: AUTH_PASS }),
    POST_PARAMS,
  );
  check(res, {
    'login status is 200': (r) => r.status === 200,
    'login returns token': (r) => r.json('accessToken') !== undefined,
  });
  return res.json('accessToken');
}

/**
 * Возвращает заголовки с Bearer-токеном для защищённых endpoint'ов.
 *
 * @param {string} token access token
 * @returns {{ headers: object }} параметры HTTP-запроса
 */
export function getAuthHeaders(token) {
  return {
    headers: {
      ...POST_PARAMS.headers,
      Authorization: `Bearer ${token}`,
    },
  };
}
