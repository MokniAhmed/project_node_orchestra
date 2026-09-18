const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const express = require('express');
const mongoose = require('mongoose');
const factory = require('../services/handlersFactory');

const Item = mongoose.model('QueryFilterSecurityItem', new mongoose.Schema({
  name: String,
  category: String,
  role: String,
  price: Number,
  profile: { role: String },
  createdAt: Date,
}));
const app = express();
app.get('/items', factory.getAll(Item));
app.use((err, req, res, next) => res.status(err.statusCode || 500).json({ error: err.message }));
let server;

async function list(query) {
  const url = new URL(`/items${query}`, `http://127.0.0.1:${server.address().port}`);
  return new Promise((resolve, reject) => {
    http.get(url, (response) => {
      let raw = '';
      response.on('data', (chunk) => { raw += chunk; });
      response.on('end', () => resolve({ status: response.statusCode, body: JSON.parse(raw) }));
    }).on('error', reject);
  });
}

describe('generic query filter security', () => {
  before(async () => {
    const mongoBase = process.env.SECURITY_TEST_MONGO_URI || 'mongodb://127.0.0.1:27017';
    await mongoose.connect(`${mongoBase}/orchestra_query_filter_${process.pid}_${Date.now()}`);
    await Item.create([
      { name: 'alpha', category: 'active', role: 'chorist', price: 10, profile: { role: 'user' }, createdAt: '2024-01-01' },
      { name: 'beta', category: 'active', role: 'admin', price: 20, profile: { role: 'admin' }, createdAt: '2024-02-01' },
      { name: 'gamma', category: 'inactive', role: 'chorist', price: 30, profile: { role: 'user' }, createdAt: '2024-03-01' },
    ]);
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

  for (const query of [
    '?role[$ne]=chorist',
    '?price[$regex]=.*',
    '?$where=...',
    '?profile.role=admin',
    '?price[foo]=20',
    '?price[gte][$ne]=20',
  ]) {
    it(`rejects ${query} with HTTP 400`, async () => {
      const result = await list(query);
      assert.equal(result.status, 400);
      assert.equal(result.body.data, undefined);
    });
  }

  it('keeps equality and supported comparisons', async () => {
    assert.deepEqual((await list('?category=active')).body.data.map((item) => item.name), ['beta', 'alpha']);
    assert.deepEqual((await list('?price[gte]=20')).body.data.map((item) => item.name), ['gamma', 'beta']);
    assert.deepEqual((await list('?price[gt]=10&price[lte]=30')).body.data.map((item) => item.name), ['gamma', 'beta']);
  });

  it('excludes pagination parameters from filtering', async () => {
    const result = await list('?category=active&page=2&limit=1');
    assert.equal(result.status, 200);
    assert.deepEqual(result.body.data.map((item) => item.name), ['alpha']);
    assert.equal(result.body.paginationResult.numberOfPages, 2);
  });

  it('keeps sort, fields, and keyword behavior', async () => {
    const result = await list('?keyword=beta&sort=price&fields=name,price');
    assert.equal(result.status, 200);
    assert.deepEqual(result.body.data.map((item) => item.name), ['beta']);
    assert.equal(result.body.data[0].category, undefined);
  });
});
