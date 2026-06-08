import http from 'k6/http';
import { sleep } from 'k6';
import { BASE_URL } from './common.js';
// import exec from 'k6/execution';

// Smoke: «жив ли сервис»

export const options = {
  tags: { testid: __ENV.TESTID || 'smoke' },
  vus: 2,
  duration: '10s',
};

export default function () {
  http.get(`${BASE_URL}/api/fast?mode=1`);
  // console.log(exec.scenario.iterationInTest);
  sleep(1);
}
