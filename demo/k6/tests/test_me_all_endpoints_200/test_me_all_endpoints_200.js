import http from 'k6/http';
import { BASE_URL, POST_PARAMS } from '../common.js';

export default function () {
  http.post(`${BASE_URL}/api/fast`, JSON.stringify({}, POST_PARAMS));
  http.post(`${BASE_URL}/api/slow-3`, JSON.stringify({}, POST_PARAMS));
  http.post(`${BASE_URL}/api/slow-10`, JSON.stringify({}, POST_PARAMS));

  http.get(`${BASE_URL}/api/fast?mode=1`);
  http.get(`${BASE_URL}/api/slow-3`);
  http.get(`${BASE_URL}/api/slow-10`);
}
