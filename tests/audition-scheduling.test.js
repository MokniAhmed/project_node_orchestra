const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const Module = require('node:module');
const express = require('express');
const mongoose = require('mongoose');

process.env.TZ = 'UTC';

const originalLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (request === '../utils/sendEmail' && parent.filename.includes('/services/')) {
    return async () => {};
  }
  return originalLoad.apply(this, arguments);
};
const Candidate = require('../models/candidateModel');
const Audition = require('../models/auditionModel');
const candidateService = require('../services/candidateService');
Module._load = originalLoad;

const app = express();
app.use(express.json());
app.put('/validate/:token', candidateService.ValidateCondidate);
app.post('/new', candidateService.createNewCandidate);
app.use((err, req, res, next) => res.status(err.statusCode || 500).json({ error: err.message }));
let server;

async function request(method, path, body) {
  const url = new URL(path, `http://127.0.0.1:${server.address().port}`);
  return new Promise((resolve, reject) => {
    const call = http.request(url, { method, headers: { 'content-type': 'application/json' } }, (response) => {
      let raw = '';
      response.on('data', (chunk) => { raw += chunk; });
      response.on('end', () => resolve({ status: response.statusCode, body: JSON.parse(raw) }));
    });
    call.on('error', reject);
    call.end(body ? JSON.stringify(body) : undefined);
  });
}

async function schedule(flow, planning) {
  const audition = await Audition.create({
    season: new mongoose.Types.ObjectId(),
    starting_date: '2024-06-01T00:00:00.000Z',
    ending_date: '2024-06-30T00:00:00.000Z',
    audition_starting_date: '2024-06-10T00:00:00.000Z',
    nb_candidate_day: 5,
    planning,
  });
  const candidate = {
    firstName: 'Test', lastName: 'Candidate', email: `${flow}-${audition._id}@example.test`,
    birthday: '1995-01-01', address: 'Tunis', height: 1.7, gender: 'female',
    nationality: 'Tunisian', cin: '12345678', audition_id: audition._id,
  };
  let result;
  if (flow === 'validate') {
    await Candidate.create({ ...candidate, token_validate: String(audition._id) });
    result = await request('PUT', `/validate/${audition._id}`);
  } else {
    result = await request('POST', '/new', candidate);
  }
  assert.equal(result.status, flow === 'validate' ? 200 : 201);
  const saved = await Audition.findById(audition._id);
  return saved.planning[saved.planning.length - 1];
}

describe('candidate audition scheduling', () => {
  before(async () => {
    const mongoBase = process.env.SECURITY_TEST_MONGO_URI || 'mongodb://127.0.0.1:27017';
    await mongoose.connect(`${mongoBase}/orchestra_scheduling_${process.pid}_${Date.now()}`);
    server = http.createServer(app);
    await new Promise((resolve, reject) => {
      server.once('error', reject);
      server.listen(0, '127.0.0.1', resolve);
    });
  });

  after(async () => {
    if (server) await new Promise((resolve) => server.close(resolve));
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.dropDatabase();
      await mongoose.disconnect();
    }
  });

  for (const flow of ['validate', 'new']) {
    it(`${flow}: starts the first candidate at 09:00 with order 1`, async () => {
      const slot = await schedule(flow, []);
      assert.equal(slot.order, 1);
      assert.equal(slot.starting_date.toISOString(), '2024-06-10T09:00:00.000Z');
    });

    it(`${flow}: schedules order 5 after order 4's duration`, async () => {
      const slot = await schedule(flow, [{ starting_date: '2024-06-10T09:30:00.000Z', duration: 45, order: 4 }]);
      assert.equal(slot.order, 5);
      assert.equal(slot.starting_date.toISOString(), '2024-06-10T10:15:00.000Z');
    });

    it(`${flow}: starts a new day at 09:00 after order 5`, async () => {
      const slot = await schedule(flow, [{ starting_date: '2024-06-10T11:00:00.000Z', duration: 30, order: 5 }]);
      assert.equal(slot.order, 1);
      assert.equal(slot.starting_date.toISOString(), '2024-06-11T09:00:00.000Z');
    });
  }
});
