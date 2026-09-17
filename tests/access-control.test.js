const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const Module = require('node:module');

process.env.JWT_SECRET_KEY = 'access-control-test-secret';

const originalLoad = Module._load;
const users = {
  chorist: { _id: 'chorist', role: 'chorist' },
  admin: { _id: 'admin', role: 'admin' },
};
const breaks = {
  own: { _id: 'own', user_sender: 'chorist', status_request: 'pending' },
  other: { _id: 'other', user_sender: 'someone-else', status_request: 'pending' },
  accepted: { _id: 'accepted', user_sender: 'chorist', status_request: 'accepted' },
};

const endpoint = (req, res) => res.status(200).json({ reached: true });
const service = new Proxy({}, { get: () => endpoint });
const validator = new Proxy({}, { get: () => (req, res, next) => next() });

Module._load = function (request, parent, isMain) {
  if (request === '../models/userModel' && parent.filename.includes('/middlewares/')) {
    return { findById: async (id) => users[id] || null };
  }
  if (request === '../models/breaksModel' && parent.filename.includes('/middlewares/')) {
    return { findById: async (id) => breaks[id] || null };
  }
  if (request.startsWith('../services/') && parent.filename.includes('/routes/')) return service;
  if (request.startsWith('../utils/validators/') && parent.filename.includes('/routes/')) return validator;
  return originalLoad.apply(this, arguments);
};

const express = require('express');
const jwt = require('jsonwebtoken');
const mountRoutes = require('../routes');
Module._load = originalLoad;

const app = express();
app.use(express.json());
mountRoutes(app);
app.use((err, req, res, next) => res.status(err.statusCode || 500).json({ error: err.message }));
let server;
let serverReady;

describe('access control', () => {
  before(() => {
    server = http.createServer(app);
    serverReady = new Promise((resolve, reject) => {
      server.once('error', reject);
      server.listen(0, '127.0.0.1', resolve);
    });
    return serverReady;
  });
  after(() => new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  }));

async function request(method, path, role) {
  await serverReady;
  const url = new URL(`/api/v1${path}`, `http://127.0.0.1:${server.address().port}`);
  const headers = {};
  if (role) headers.authorization = `Bearer ${jwt.sign({ userId: role }, process.env.JWT_SECRET_KEY)}`;
  return new Promise((resolve, reject) => {
    const call = http.request(url, { method, headers }, (response) => {
      response.resume();
      response.on('end', () => resolve(response.statusCode));
    });
    call.on('error', reject);
    call.end();
  });
}

it('protected endpoint rejects unauthenticated requests', async () => {
  assert.equal(await request('GET', '/users/getMe'), 401);
});
it('chorist cannot access an admin endpoint', async () => {
  assert.equal(await request('GET', '/audition/audition-id', 'chorist'), 403);
});
it('admin can access an admin endpoint', async () => {
  assert.equal(await request('GET', '/audition/audition-id', 'admin'), 200);
});
it('candidate application remains public', async () => {
  assert.equal(await request('POST', '/candidate/'), 200);
  assert.equal(await request('PUT', '/candidate/email-token'), 200);
  assert.equal(await request('PUT', '/candidate/res/acceptance-token'), 200);
});
it('login and password recovery routes remain public', async () => {
  for (const [method, path] of [
    ['POST', '/auth/login'], ['POST', '/auth/forgotPassword'],
    ['POST', '/auth/verifyResetCode'], ['PUT', '/auth/resetPassword'],
  ]) assert.equal(await request(method, path), 200, path);
});
it('user cannot read or update another user break', async () => {
  assert.equal(await request('GET', '/breaks/other', 'chorist'), 403);
  assert.equal(await request('PUT', '/breaks/other', 'chorist'), 403);
});
it('admin can read and update another user break', async () => {
  assert.equal(await request('GET', '/breaks/other', 'admin'), 200);
  assert.equal(await request('PUT', '/breaks/other', 'admin'), 200);
});
it('pending owner update is allowed and accepted update is denied', async () => {
  assert.equal(await request('PUT', '/breaks/own', 'chorist'), 200);
  assert.equal(await request('PUT', '/breaks/accepted', 'chorist'), 403);
});
it('user cannot read another user history, but admin can', async () => {
  assert.equal(await request('GET', '/history/my-histroy/someone-else', 'chorist'), 403);
  assert.equal(await request('GET', '/history/my-histroy/someone-else', 'admin'), 200);
  assert.equal(await request('GET', '/history/my-histroy/chorist', 'chorist'), 200);
});
it('QR display is admin-only while chorists can submit attendance', async () => {
  for (const path of ['/concert/get-qrcode/event', '/repetition/qrCode/event', '/presence/qrcode/event']) {
    assert.equal(await request('GET', path, 'chorist'), 403, path);
    assert.equal(await request('GET', path, 'admin'), 200, path);
  }
  assert.equal(await request('PUT', '/presence/qrcode', 'chorist'), 200);
});
it('candidate test bypass is admin-only', async () => {
  assert.equal(await request('POST', '/candidate/new', 'chorist'), 403);
  assert.equal(await request('POST', '/candidate/new', 'admin'), 200);
});
it('only one POST /users handler is registered', () => {
  const route = require('../routes/userRoute');
  const postRoot = route.stack.filter((layer) => layer.route && layer.route.path === '/' && layer.route.methods.post);
  assert.equal(postRoot.length, 1);
});

});
