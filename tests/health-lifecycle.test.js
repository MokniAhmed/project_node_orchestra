const { describe, it, after } = require('node:test');
const assert = require('node:assert/strict');
const { spawn, spawnSync } = require('node:child_process');

const base = 'http://127.0.0.1:18080';
let child;
let logs = '';

async function waitForResponse(url) {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    try { return await fetch(url); } catch (error) {
      if (child && child.exitCode !== null) throw new Error(`server exited: ${logs}`);
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }
  throw new Error(`server did not listen: ${logs}`);
}

function start(env) {
  const processHandle = spawn(process.execPath, ['server.js'], {
    cwd: `${__dirname}/..`,
    env: { ...process.env, PORT: '18080', ...env },
  });
  let output = '';
  processHandle.stdout.on('data', (chunk) => { output += chunk; });
  processHandle.stderr.on('data', (chunk) => { output += chunk; });
  return { processHandle, output: () => output };
}

describe('application health and lifecycle', () => {
  after(() => { if (child && child.exitCode === null) child.kill('SIGKILL'); });

  it('readiness returns 503 when Mongoose is disconnected', () => {
    const script = `
      const http = require('node:http');
      const { app } = require('./server');
      if (!app) { console.log('missing app'); process.exit(0); }
      const server = http.createServer(app);
      server.listen(0, '127.0.0.1', async () => {
        const response = await fetch('http://127.0.0.1:' + server.address().port + '/health/ready');
        console.log(response.status);
        server.close(() => process.exit(0));
      });
    `;
    const result = spawnSync(process.execPath, ['-e', script], {
      cwd: `${__dirname}/..`, timeout: 5000, encoding: 'utf8',
      env: { ...process.env, NODE_ENV: 'test' },
    });
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout.trim(), '503');
  });

  it('liveness returns 200 after normal startup', async () => {
    const started = start();
    child = started.processHandle;
    child.stdout.on('data', (chunk) => { logs += chunk; });
    child.stderr.on('data', (chunk) => { logs += chunk; });
    const response = await waitForResponse(`${base}/health/live`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { status: 'ok' });
  });

  it('readiness returns 200 while MongoDB is connected', async () => {
    const response = await fetch(`${base}/health/ready`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { status: 'ok' });
  });

  it('SIGTERM exits cleanly after closing listeners and MongoDB', async () => {
    const exit = new Promise((resolve) => child.once('exit', (code, signal) => resolve({ code, signal })));
    child.kill('SIGTERM');
    const result = await exit;
    assert.deepEqual(result, { code: 0, signal: null });
    assert.match(logs, /shutdown complete/i);
  });

  it('does not accept HTTP traffic when initial MongoDB connection fails', async () => {
    const started = start({ PORT: '18081', DB_URI: 'mongodb://127.0.0.1:1/?serverSelectionTimeoutMS=500' });
    const failed = started.processHandle;
    const exit = new Promise((resolve) => failed.once('exit', (code) => resolve(code)));
    await new Promise((resolve) => setTimeout(resolve, 200));
    let accepted = false;
    try { await fetch('http://127.0.0.1:18081/health/live'); accepted = true; } catch (error) { /* expected */ }
    assert.equal(accepted, false);
    assert.equal(await exit, 1);
    assert.match(started.output(), /startup error/i);
  });
});
