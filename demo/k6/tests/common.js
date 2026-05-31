export const BASE_URL = (() => {
  const host = `${__ENV.LOAD_HOST}`;
  return host.startsWith('http://') ? host : `http://${host}`;
})();

export const POST_PARAMS = {
  headers: { 'Content-Type': 'application/json' },
};
