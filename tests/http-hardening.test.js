const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');

process.env.CORS_ORIGINS = ' https://example.com, ,http://localhost:3000, ';
const { app } = require('../server');
let server;

async function get(path, origin) {
  const headers = origin ? { origin } : {};
  return fetch(`http://127.0.0.1:${server.address().port}${path}`, { headers });
}

describe('HTTP hardening', () => {
  before(async () => {
    server = http.createServer(app);
    await new Promise((resolve, reject) => {
      server.once('error', reject);
      server.listen(0, '127.0.0.1', resolve);
    });
  });
  after(async () => {
    if (server) await new Promise((resolve) => server.close(resolve));
  });

  it('returns 404 for an unknown route', async () => {
    assert.equal((await get('/missing-route')).status, 404);
  });

  it('allows a configured Origin after trimming whitespace', async () => {
    const response = await get('/health/live', 'https://example.com');
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('access-control-allow-origin'), 'https://example.com');
  });

  it('rejects a disallowed browser Origin', async () => {
    const response = await get('/health/live', 'https://untrusted.example');
    assert.equal(response.status, 403);
    assert.equal(response.headers.get('access-control-allow-origin'), null);
  });

  it('accepts requests without an Origin header', async () => {
    assert.equal((await get('/health/live')).status, 200);
  });

  it('adds standard rate-limit headers to API responses', async () => {
    const response = await get('/api/v1/not-a-route');
    assert.equal(response.headers.get('ratelimit-limit'), '100');
  });

  it('keeps health outside the API limiter', async () => {
    const response = await get('/health/live');
    assert.equal(response.headers.get('ratelimit-limit'), null);
  });

  it('adds a Helmet security header', async () => {
    const response = await get('/health/live');
    assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
  });
});
