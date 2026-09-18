const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const crypto = require('node:crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const express = require('express');

process.env.JWT_SECRET_KEY = 'user-security-test-secret';
process.env.JWT_EXPIRE_TIME = '1h';

const User = require('../models/userModel');
const authRoute = require('../routes/authRoute');
const userRoute = require('../routes/userRoute');
const app = express();
app.use(express.json());
app.use('/api/v1/auth', authRoute);
app.use('/api/v1/users', userRoute);
app.use((err, req, res, next) => res.status(err.statusCode || 500).json({ error: err.message }));

let server;
let serverReady;
let admin;
let chorist;
let resetUser;

function account(email, role) {
  return {
    firstName: 'Test', lastName: 'User', birthday: '1990-01-01', height: 1.7,
    gender: 'female', nationality: 'Tunisian', address: 'Tunis',
    email, password: 'initialPass123', role,
  };
}

async function request(method, path, role, body) {
  await serverReady;
  const url = new URL(`/api/v1${path}`, `http://127.0.0.1:${server.address().port}`);
  const headers = { 'content-type': 'application/json' };
  if (role) headers.authorization = `Bearer ${jwt.sign({ userId: role._id }, process.env.JWT_SECRET_KEY)}`;
  return new Promise((resolve, reject) => {
    const call = http.request(url, { method, headers }, (response) => {
      let raw = '';
      response.on('data', (chunk) => { raw += chunk; });
      response.on('end', () => {
        let data;
        try { data = JSON.parse(raw); } catch (error) { data = raw; }
        resolve({ status: response.statusCode, data });
      });
    });
    call.on('error', reject);
    call.end(body ? JSON.stringify(body) : undefined);
  });
}

function noSecrets(value) {
  const serialized = JSON.stringify(value);
  for (const field of ['password', 'passwordResetCode', 'passwordResetExpires', 'passwordResetVerified', 'passwordChangedAt']) {
    assert.equal(serialized.includes(`"${field}"`), false, field);
  }
}

describe('user credential and assignment security', () => {
  before(async () => {
    const mongoBase = process.env.SECURITY_TEST_MONGO_URI || 'mongodb://127.0.0.1:27017';
    const database = `orchestra_security_${process.pid}_${Date.now()}`;
    await mongoose.connect(`${mongoBase}/${database}`);
    admin = await User.create(account('admin-security@example.test', 'admin'));
    chorist = await User.create(account('chorist-security@example.test', 'chorist'));
    resetUser = await User.create(account('reset-security@example.test', 'chorist'));
    server = http.createServer(app);
    serverReady = new Promise((resolve, reject) => {
      server.once('error', reject);
      server.listen(0, '127.0.0.1', resolve);
    });
    await serverReady;
  });

  after(async () => {
    if (server) await new Promise((resolve) => server.close(resolve));
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.dropDatabase();
      await mongoose.disconnect();
    }
  });

  it('normal User queries and user endpoints omit credential fields', async () => {
    const queried = await User.findById(chorist._id);
    noSecrets(queried);
    assert.equal(queried.password, undefined);
    assert.equal(queried.passwordResetCode, undefined);
    for (const path of ['/users/', `/users/${chorist._id}`, '/users/getMe']) {
      const result = await request('GET', path, path.endsWith('getMe') ? chorist : admin);
      assert.equal(result.status, 200, path);
      noSecrets(result.data);
    }
  });

  it('populated reset fields stay hidden in normal queries and user responses', async () => {
    await User.findByIdAndUpdate(resetUser._id, {
      passwordResetCode: 'stored-hash',
      passwordResetExpires: Date.now() + 600000,
      passwordResetVerified: true,
    });
    const queried = await User.findById(resetUser._id);
    assert.equal(queried.passwordResetCode, undefined);
    assert.equal(queried.passwordResetExpires, undefined);
    assert.equal(queried.passwordResetVerified, undefined);
    const result = await request('GET', `/users/${resetUser._id}`, admin);
    assert.equal(result.status, 200);
    noSecrets(result.data);
  });

  it('login succeeds with a hidden password and omits credentials from response', async () => {
    const result = await request('POST', '/auth/login', null, {
      email: chorist.email, password: 'initialPass123',
    });
    assert.equal(result.status, 200);
    assert.ok(result.data.token);
    noSecrets(result.data);
  });

  it('admin creation accepts role but ignores internal fields and omits credentials', async () => {
    const body = {
      ...account('created-security@example.test', 'chef_choeur'),
      passwordResetCode: 'attacker-code', passwordResetVerified: true,
      passwordChangedAt: '2020-01-01', active: false, deleted: true,
      nb_absence: 99, status_elimination: 'disciplinary', status: [{ statuts: 'senior' }],
    };
    const result = await request('POST', '/users/', admin, body);
    assert.equal(result.status, 201);
    assert.equal(result.data.data.role, 'chef_choeur');
    noSecrets(result.data);
    const created = await User.findOne({ email: body.email }).select('+passwordResetCode +passwordResetVerified');
    assert.equal(created.active, true);
    assert.equal(created.deleted, false);
    assert.equal(created.nb_absence, 0);
    assert.equal(created.status_elimination, 'none');
    assert.equal(created.status.length, 0);
    assert.equal(created.passwordResetCode, undefined);
  });

  it('updateMe cannot change role, password, or internal state', async () => {
    const result = await request('PUT', '/users/updateMe', chorist, {
      phone: '12345678', role: 'admin', password: 'attackerPassword',
      active: false, deleted: true, nb_absence: 50,
    });
    assert.equal(result.status, 200);
    noSecrets(result.data);
    const updated = await User.findById(chorist._id).select('+password');
    assert.equal(updated.phone, '12345678');
    assert.equal(updated.role, 'chorist');
    assert.equal(updated.active, true);
    assert.equal(updated.deleted, false);
    assert.equal(updated.nb_absence, 0);
    assert.equal(await bcrypt.compare('initialPass123', updated.password), true);
  });

  it('status update cannot mass-assign role or password', async () => {
    const result = await request('PUT', `/users/status/${chorist._id}`, admin, {
      status: [{ statuts: 'junior', date: '2024-01-01' }],
      role: 'admin', password: 'attackerPassword', active: false,
    });
    assert.equal(result.status, 204);
    const updated = await User.findById(chorist._id).select('+password');
    assert.equal(updated.status.length, 1);
    assert.equal(updated.role, 'chorist');
    assert.equal(updated.active, true);
    assert.equal(await bcrypt.compare('initialPass123', updated.password), true);
  });

  it('admin password change route is unavailable', async () => {
    const result = await request('PUT', `/users/changePassword/${chorist._id}`, admin, {
      password: 'attackerPassword',
    });
    assert.equal(result.status, 404);
  });

  it('changeMyPassword updates only the logged-in user and returns no credentials', async () => {
    const result = await request('PUT', '/users/changeMyPassword', chorist, {
      currentPassword: 'initialPass123',
      password: 'newSelfPassword',
      passwordConfirm: 'newSelfPassword',
    });
    assert.equal(result.status, 200);
    assert.ok(result.data.token);
    noSecrets(result.data);
    const updated = await User.findById(chorist._id).select('+password');
    assert.equal(await bcrypt.compare('newSelfPassword', updated.password), true);
  });

  it('verified reset flow still changes password without exposing reset fields', async () => {
    const code = '123456';
    const hashed = crypto.createHash('sha256').update(code).digest('hex');
    await User.findByIdAndUpdate(resetUser._id, {
      passwordResetCode: hashed,
      passwordResetExpires: Date.now() + 600000,
      passwordResetVerified: false,
    });
    const verify = await request('POST', '/auth/verifyResetCode', null, { resetCode: code });
    assert.equal(verify.status, 200);
    noSecrets(verify.data);
    const reset = await request('PUT', '/auth/resetPassword', null, {
      email: resetUser.email, resetCode: code, newPassword: 'resetPassword123',
    });
    assert.equal(reset.status, 200);
    assert.ok(reset.data.token);
    noSecrets(reset.data);
    const updated = await User.findById(resetUser._id).select('+password +passwordResetCode +passwordResetVerified');
    assert.equal(await bcrypt.compare('resetPassword123', updated.password), true);
    assert.equal(updated.passwordResetCode, undefined);
    assert.equal(updated.passwordResetVerified, undefined);
  });
});
