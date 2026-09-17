const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const express = require('express');
const mongoose = require('mongoose');
const factory = require('../services/handlersFactory');

const schema = new mongoose.Schema({
  name: { type: String, required: true, minlength: 3 },
});
let deleteQueries = 0;
let removeHooks = 0;
let saveHooks = 0;
schema.pre('findOneAndDelete', function (next) { deleteQueries += 1; next(); });
schema.pre('remove', function (next) { removeHooks += 1; next(); });
schema.pre('save', function (next) { saveHooks += 1; next(); });
const Item = mongoose.model('FactorySliceItem', schema);

const app = express();
app.use(express.json());
app.delete('/items/:id', factory.deleteOne(Item));
app.put('/items/:id', factory.updateOne(Item));
app.use((err, req, res, next) => {
  const status = err.statusCode || (err.name === 'ValidationError' ? 400 : 500);
  res.status(status).json({ error: err.message });
});
let server;
let serverReady;

async function request(method, id, body) {
  await serverReady;
  const url = new URL(`/items/${id}`, `http://127.0.0.1:${server.address().port}`);
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

describe('generic CRUD factory', () => {
  before(async () => {
    const mongoBase = process.env.SECURITY_TEST_MONGO_URI || 'mongodb://127.0.0.1:27017';
    await mongoose.connect(`${mongoBase}/orchestra_factory_${process.pid}_${Date.now()}`);
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

  it('deletes exactly once and returns 204', async () => {
    const item = await Item.create({ name: 'delete me' });
    deleteQueries = 0;
    removeHooks = 0;
    const result = await request('DELETE', item._id);
    assert.equal(result.status, 204);
    assert.equal(deleteQueries, 1);
    assert.equal(removeHooks, 0);
    assert.equal(await Item.countDocuments({ _id: item._id }), 0);
  });

  it('returns 404 when deleting a missing document', async () => {
    const result = await request('DELETE', new mongoose.Types.ObjectId());
    assert.equal(result.status, 404);
  });

  it('returns the updated document without a second save', async () => {
    const item = await Item.create({ name: 'before' });
    saveHooks = 0;
    const result = await request('PUT', item._id, { name: 'after' });
    assert.equal(result.status, 200);
    assert.equal(result.data.data.name, 'after');
    assert.equal(saveHooks, 0);
    assert.equal((await Item.findById(item._id)).name, 'after');
  });

  it('runs Mongoose validators on update', async () => {
    const item = await Item.create({ name: 'valid' });
    const result = await request('PUT', item._id, { name: 'x' });
    assert.equal(result.status, 400);
    assert.equal((await Item.findById(item._id)).name, 'valid');
  });

  it('returns 404 when updating a missing document', async () => {
    const result = await request('PUT', new mongoose.Types.ObjectId(), { name: 'valid' });
    assert.equal(result.status, 404);
  });
});
