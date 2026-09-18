const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET_KEY = 'change-my-password-test-secret';
process.env.JWT_EXPIRE_TIME = '1h';

const User = require('../models/userModel');
const userRoute = require('../routes/userRoute');
const app = express();
app.use(express.json());
app.use('/api/v1/users', userRoute);
app.use((err, req, res, next) => res.status(err.statusCode || 500).json({ error: err.message }));

let user;
let server;
let serverReady;
const oldPassword = 'initialPass123';
const newPassword = 'newSelfPassword123';

async function request(body, authenticated = true, token, actor = user) {
  await serverReady;
  const url = new URL('/api/v1/users/changeMyPassword', `http://127.0.0.1:${server.address().port}`);
  const headers = { 'content-type': 'application/json' };
  if (authenticated) {
    headers.authorization = `Bearer ${token || jwt.sign({ userId: actor.id }, process.env.JWT_SECRET_KEY)}`;
  }
  return new Promise((resolve, reject) => {
    const call = http.request(url, { method: 'PUT', headers }, (response) => {
      let raw = '';
      response.on('data', (chunk) => { raw += chunk; });
      response.on('end', () => {
        let data;
        try { data = JSON.parse(raw); } catch (error) { data = raw; }
        resolve({ status: response.statusCode, data });
      });
    });
    call.on('error', reject);
    call.end(JSON.stringify(body));
  });
}

async function storedUser() {
  return User.findById(user.id).select('+password +passwordResetCode +passwordResetExpires +passwordResetVerified');
}

describe('changeMyPassword', () => {
  before(async () => {
    const mongoBase = process.env.SECURITY_TEST_MONGO_URI || 'mongodb://127.0.0.1:27017';
    await mongoose.connect(`${mongoBase}/orchestra_change_password_${process.pid}_${Date.now()}`);
    user = await User.create({
      firstName: 'Test', lastName: 'User', birthday: '1990-01-01', height: 1.7,
      gender: 'female', nationality: 'Tunisian', address: 'Tunis',
      email: 'change-password@example.test', password: oldPassword, role: 'chorist',
    });
    await User.findByIdAndUpdate(user.id, {
      passwordResetCode: 'internal-reset-code',
      passwordResetExpires: Date.now() + 600000,
      passwordResetVerified: true,
    });
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

  it('rejects an unauthenticated request without changing the password', async () => {
    const result = await request({ currentPassword: oldPassword, password: newPassword, passwordConfirm: newPassword }, false);
    assert.equal(result.status, 401);
    assert.equal(await bcrypt.compare(oldPassword, (await storedUser()).password), true);
  });

  const invalidInputs = [
    ['missing currentPassword', { password: newPassword, passwordConfirm: newPassword }],
    ['missing password', { currentPassword: oldPassword, passwordConfirm: newPassword }],
    ['password shorter than 6', { currentPassword: oldPassword, password: 'short', passwordConfirm: 'short' }],
    ['missing passwordConfirm', { currentPassword: oldPassword, password: newPassword }],
    ['passwordConfirm mismatch', { currentPassword: oldPassword, password: newPassword, passwordConfirm: 'differentPassword' }],
  ];

  for (const [name, body] of invalidInputs) {
    it(`returns 400 for ${name} without changing the stored password`, async () => {
      const beforeChange = await storedUser();
      const result = await request(body);
      assert.equal(result.status, 400);
      const afterChange = await storedUser();
      assert.equal(afterChange.password, beforeChange.password);
      assert.equal(afterChange.passwordChangedAt?.getTime(), beforeChange.passwordChangedAt?.getTime());
    });
  }

  it('rejects a wrong currentPassword without changing the stored password', async () => {
    const beforeChange = await storedUser();
    const result = await request({ currentPassword: 'wrongPassword', password: newPassword, passwordConfirm: newPassword });
    assert.equal(result.status, 400);
    const afterChange = await storedUser();
    assert.equal(afterChange.password, beforeChange.password);
    assert.equal(afterChange.passwordChangedAt?.getTime(), beforeChange.passwordChangedAt?.getTime());
  });

  it('clears existing password-reset state after a successful password change', async () => {
    const resetStateUser = await User.create({
      firstName: 'Reset', lastName: 'State', birthday: '1990-01-01', height: 1.7,
      gender: 'female', nationality: 'Tunisian', address: 'Tunis',
      email: 'reset-state-change@example.test', password: oldPassword, role: 'chorist',
    });
    await User.findByIdAndUpdate(resetStateUser.id, {
      passwordResetCode: 'existing-reset-code',
      passwordResetExpires: Date.now() + 600000,
      passwordResetVerified: true,
    });
    const beforeChange = await User.findById(resetStateUser.id).select('+passwordResetCode +passwordResetExpires +passwordResetVerified');
    assert.equal(beforeChange.passwordResetCode, 'existing-reset-code');
    assert.ok(beforeChange.passwordResetExpires);
    assert.equal(beforeChange.passwordResetVerified, true);

    const result = await request({
      currentPassword: oldPassword,
      password: 'nextSelfPassword123',
      passwordConfirm: 'nextSelfPassword123',
    }, true, undefined, resetStateUser);
    assert.equal(result.status, 200);
    const afterChange = await User.findById(resetStateUser.id).select('+passwordResetCode +passwordResetExpires +passwordResetVerified');
    assert.equal(afterChange.passwordResetCode, undefined);
    assert.equal(afterChange.passwordResetExpires, undefined);
    assert.equal(afterChange.passwordResetVerified, undefined);
  });

  it('saves the new password once and returns a fresh token without secrets', async () => {
    const beforeChange = await storedUser();
    const previousToken = jwt.sign(
      { userId: user.id, iat: Math.floor(Date.now() / 1000) - 60 },
      process.env.JWT_SECRET_KEY,
      { expiresIn: '1h' }
    );
    const result = await request({ currentPassword: oldPassword, password: newPassword, passwordConfirm: newPassword }, true, previousToken);
    assert.equal(result.status, 200);
    assert.equal(jwt.verify(result.data.token, process.env.JWT_SECRET_KEY).userId, user.id);
    assert.notEqual(result.data.token, previousToken);
    const response = JSON.stringify(result.data);
    for (const field of ['password', 'passwordResetCode', 'passwordResetExpires', 'passwordResetVerified']) {
      assert.equal(response.includes(`"${field}"`), false, field);
    }
    const afterChange = await storedUser();
    assert.ok(afterChange.passwordChangedAt instanceof Date);
    assert.ok(afterChange.passwordChangedAt.getTime() >= beforeChange.updatedAt.getTime());
    assert.equal(await bcrypt.compare(oldPassword, afterChange.password), false);
    assert.equal(await bcrypt.compare(newPassword, afterChange.password), true);
  });

});
