const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const crypto = require('node:crypto');
const Module = require('node:module');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const express = require('express');

process.env.JWT_SECRET_KEY = 'candidate-setup-test-secret';
process.env.JWT_EXPIRE_TIME = '1h';

const sentEmails = [];
const originalLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (request === '../utils/sendEmail' && parent.filename.includes('/services/')) {
    return async (message) => { sentEmails.push(message); };
  }
  return originalLoad.apply(this, arguments);
};
const Candidate = require('../models/candidateModel');
const User = require('../models/userModel');
const candidateRoute = require('../routes/candidateRoute');
const authRoute = require('../routes/authRoute');
Module._load = originalLoad;

const app = express();
app.use(express.json());
app.use('/api/v1/candidate', candidateRoute);
app.use('/api/v1/auth', authRoute);
app.use((err, req, res, next) => res.status(err.statusCode || 500).json({ error: err.message }));

let server;
let serverReady;
let candidate;
let converted;
let setupToken;
let placeholder;

async function request(method, path, body) {
  await serverReady;
  const url = new URL(`/api/v1${path}`, `http://127.0.0.1:${server.address().port}`);
  return new Promise((resolve, reject) => {
    const call = http.request(url, { method, headers: { 'content-type': 'application/json' } }, (response) => {
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

async function setResetState(token, expiry, verified) {
  await User.findByIdAndUpdate(converted._id, {
    passwordResetCode: crypto.createHash('sha256').update(token).digest('hex'),
    passwordResetExpires: expiry,
    passwordResetVerified: verified,
  });
}

describe('candidate account setup and one-time reset', () => {
  before(async () => {
    const mongoBase = process.env.SECURITY_TEST_MONGO_URI || 'mongodb://127.0.0.1:27017';
    await mongoose.connect(`${mongoBase}/orchestra_setup_${process.pid}_${Date.now()}`);
    candidate = await Candidate.create({
      firstName: 'Accepted', lastName: 'Candidate', email: 'accepted@example.test',
      birthday: '1995-01-01', address: 'Tunis', height: 1.7, gender: 'female',
      nationality: 'Tunisian', cin: '12345678',
      audition_id: new mongoose.Types.ObjectId(), status: 'accepted',
      token_validate: 'candidate-acceptance-token',
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

  it('acceptance emails a setup link without placeholder password or hash', async () => {
    const create = User.create;
    User.create = async function (details) {
      placeholder = details.password;
      return create.call(this, details);
    };
    let result;
    try {
      result = await request('PUT', '/candidate/res/candidate-acceptance-token', { response: true });
    } finally {
      User.create = create;
    }
    assert.equal(result.status, 200);
    assert.equal(result.data.condidate.status, 'accepted_confimed');
    converted = await User.findOne({ email: candidate.email }).select('+password +passwordResetCode +passwordResetExpires');
    assert.ok(converted);
    assert.ok(placeholder);
    assert.notEqual(placeholder, converted.password);
    assert.equal(await bcrypt.compare(placeholder, converted.password), true);
    const email = sentEmails.find((message) => message.email === candidate.email);
    assert.ok(email);
    const content = `${email.message || ''} ${email.html || ''}`;
    assert.equal(content.includes(placeholder), false);
    assert.equal(content.includes(converted.password), false);
    assert.equal(content.includes('$2'), false);
    const link = content.match(/href="([^"]+)"/);
    assert.ok(link, 'setup link missing');
    const url = new URL(link[1]);
    setupToken = url.searchParams.get('resetCode');
    assert.equal(url.searchParams.get('email'), candidate.email);
    assert.match(setupToken, /^[a-f0-9]{64}$/);
  });

  it('stores only a hashed, expiring setup token', async () => {
    const stored = await User.findById(converted._id).select('+passwordResetCode +passwordResetExpires');
    assert.notEqual(stored.passwordResetCode, setupToken);
    assert.equal(stored.passwordResetCode, crypto.createHash('sha256').update(setupToken).digest('hex'));
    assert.ok(stored.passwordResetExpires > new Date());
  });

  it('rejects missing and wrong reset codes even when marked verified', async () => {
    await setResetState(setupToken, Date.now() + 600000, true);
    const missing = await request('PUT', '/auth/resetPassword', {
      email: candidate.email, newPassword: 'chosenPassword123',
    });
    assert.equal(missing.status, 400);
    const wrong = await request('PUT', '/auth/resetPassword', {
      email: candidate.email, resetCode: 'wrong-code', newPassword: 'chosenPassword123',
    });
    assert.equal(wrong.status, 400);
    const wrongEmail = await request('PUT', '/auth/resetPassword', {
      email: 'someone-else@example.test', resetCode: setupToken,
      newPassword: 'chosenPassword123',
    });
    assert.equal(wrongEmail.status, 400);
  });

  it('rejects an expired setup token even if it was verified earlier', async () => {
    await setResetState(setupToken, Date.now() - 1000, true);
    const result = await request('PUT', '/auth/resetPassword', {
      email: candidate.email, resetCode: setupToken, newPassword: 'chosenPassword123',
    });
    assert.equal(result.status, 400);
  });

  it('accepts a valid token once, allows login, and exposes no secrets', async () => {
    await setResetState(setupToken, Date.now() + 600000, false);
    const body = { email: candidate.email, resetCode: setupToken, newPassword: 'chosenPassword123' };
    const reset = await request('PUT', '/auth/resetPassword', body);
    assert.equal(reset.status, 200);
    assert.ok(reset.data.token);
    const response = JSON.stringify(reset.data);
    for (const field of ['password', 'passwordResetCode', 'passwordResetExpires', 'passwordResetVerified']) {
      assert.equal(response.includes(`"${field}"`), false, field);
    }
    assert.equal(JSON.stringify(reset.data).includes(setupToken), false);
    const stored = await User.findById(converted._id).select('+password +passwordResetCode +passwordResetExpires +passwordResetVerified');
    assert.equal(await bcrypt.compare('chosenPassword123', stored.password), true);
    assert.equal(stored.passwordResetCode, undefined);
    assert.equal(stored.passwordResetExpires, undefined);
    assert.equal(stored.passwordResetVerified, undefined);
    assert.ok(stored.passwordChangedAt);
    const login = await request('POST', '/auth/login', { email: candidate.email, password: 'chosenPassword123' });
    assert.equal(login.status, 200);
    assert.ok(login.data.token);
    assert.equal(JSON.stringify(login.data).includes(stored.password), false);
    const reuse = await request('PUT', '/auth/resetPassword', body);
    assert.equal(reuse.status, 400);
  });

  it('forgot-password email token works with the updated reset contract', async () => {
    const result = await request('POST', '/auth/forgotPassword', { email: candidate.email });
    assert.equal(result.status, 200);
    const email = sentEmails[sentEmails.length - 1];
    const code = `${email.message || ''}`.match(/reset code: ([a-f0-9]{64})/i);
    assert.ok(code, 'reset code missing from email');
    const reset = await request('PUT', '/auth/resetPassword', {
      email: candidate.email, resetCode: code[1], newPassword: 'recoveredPassword123',
    });
    assert.equal(reset.status, 200);
    const login = await request('POST', '/auth/login', { email: candidate.email, password: 'recoveredPassword123' });
    assert.equal(login.status, 200);
  });
});
