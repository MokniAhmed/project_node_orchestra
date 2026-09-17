const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const Module = require('node:module');
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET_KEY = 'http-method-test-secret';

const emails = [];
const originalLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (request === '../utils/sendEmail' && parent.filename.includes('/services/')) {
    return async (message) => { emails.push(message); };
  }
  return originalLoad.apply(this, arguments);
};
const User = require('../models/userModel');
const Candidate = require('../models/candidateModel');
const Concert = require('../models/concertModel');
const candidateRoute = require('../routes/candidateRoute');
const concertRoute = require('../routes/concertRoute');
Module._load = originalLoad;

const app = express();
app.use(express.json());
app.use('/api/v1/candidate', candidateRoute);
app.use('/api/v1/concert', concertRoute);
app.use((err, req, res, next) => res.status(err.statusCode || 500).json({ error: err.message }));

let server;
let serverReady;
let admin;
let chorist;
let candidate;
let concert;

async function request(method, path, actor) {
  await serverReady;
  const url = new URL(`/api/v1${path}`, `http://127.0.0.1:${server.address().port}`);
  const headers = actor ? { authorization: `Bearer ${jwt.sign({ userId: actor.id }, process.env.JWT_SECRET_KEY)}` } : {};
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
    call.end();
  });
}

describe('HTTP methods for state-changing actions', () => {
  before(async () => {
    const mongoBase = process.env.SECURITY_TEST_MONGO_URI || 'mongodb://127.0.0.1:27017';
    await mongoose.connect(`${mongoBase}/orchestra_http_methods_${process.pid}_${Date.now()}`);
    const profile = {
      firstName: 'Test', lastName: 'User', birthday: '1990-01-01', height: 1.7,
      gender: 'female', nationality: 'Tunisian', address: 'Tunis', password: 'test-password',
    };
    admin = await User.create({ ...profile, email: 'admin@example.test', role: 'admin' });
    chorist = await User.create({ ...profile, email: 'chorist@example.test', role: 'chorist' });
    candidate = await Candidate.create({
      firstName: 'Accepted', lastName: 'Candidate', email: 'accepted@example.test',
      birthday: '1995-01-01', address: 'Tunis', height: 1.7, gender: 'female',
      nationality: 'Tunisian', cin: '12345678', audition_id: new mongoose.Types.ObjectId(),
      status: 'accepted',
    });
    concert = await Concert.create({ name: 'Test concert', list_candidate: [chorist._id] });
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

  it('GET candidate root does not send emails or change acceptance tokens', async () => {
    const result = await request('GET', '/candidate/', admin);
    assert.equal(result.status, 404);
    assert.equal(emails.length, 0);
    assert.equal((await Candidate.findById(candidate.id)).token_validate, undefined);
  });

  it('candidate acceptance POST requires admin and runs the workflow', async () => {
    assert.equal((await request('POST', '/candidate/acceptance-emails')).status, 401);
    assert.equal((await request('POST', '/candidate/acceptance-emails', chorist)).status, 403);
    assert.equal(emails.length, 0);
    const result = await request('POST', '/candidate/acceptance-emails', admin);
    assert.equal(result.status, 200);
    assert.equal(result.data.newListAccepted.length, 1);
    assert.equal(emails.length, 1);
    assert.equal(emails[0].email, candidate.email);
    assert.ok((await Candidate.findById(candidate.id)).token_validate);
  });

  it('GET confirm-all does not update the final concert list', async () => {
    const result = await request('GET', `/concert/confirm-all/${concert.id}`, admin);
    assert.equal(result.status, 404);
    assert.deepEqual((await Concert.findById(concert.id).setOptions({ skipConcertPopulation: true })).list_final, []);
  });

  it('concert confirm-all POST requires admin and updates list_final', async () => {
    const path = `/concert/confirm-all/${concert.id}`;
    assert.equal((await request('POST', path)).status, 401);
    assert.equal((await request('POST', path, chorist)).status, 403);
    assert.deepEqual((await Concert.findById(concert.id).setOptions({ skipConcertPopulation: true })).list_final, []);
    const result = await request('POST', path, admin);
    assert.equal(result.status, 200);
    const saved = await Concert.findById(concert.id).setOptions({ skipConcertPopulation: true });
    assert.deepEqual(saved.list_final.map(String), saved.list_candidate.map(String));
  });

  it('normal candidate and concert GET reads still work', async () => {
    const candidates = await request('GET', '/candidate/all', admin);
    assert.equal(candidates.status, 200);
    assert.equal(candidates.data.results, 1);
    const concertRead = await request('GET', `/concert/${concert.id}`, chorist);
    assert.equal(concertRead.status, 200);
    assert.equal(concertRead.data.data._id, concert.id);
  });
});
