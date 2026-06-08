import http from 'k6/http';
import { BASE_URL } from '../common.js';
import { check } from 'k6';

export const options = {
    thresholds: {
        http_req_duration: ['p(95)<1000'],
        "http_req_duration{status:200}": ['p(95)<1000'],
        "http_req_duration{speed:'slow'}": ['p(95)<300'],
        "http_req_duration{speed:'fast'}": ['p(95)<1000'],
    },
};

export default function () {
   http.post(`${BASE_URL}/api/fast`, null, { tags: { speed: 'fast' } });
   http.post(`${BASE_URL}/api/slow`, null, { tags: { speed: 'slow' } });

   check(res, { 'status is 200': (r) => r.status === 200 }, {speed: 'fast'});

}
