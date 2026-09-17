const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const express = require('express');
const mongoose = require('mongoose');
const factory = require('../services/handlersFactory');

const Item = mongoose.model('PaginationSliceItem', new mongoose.Schema({
  name: String,
  category: String,
  price: Number,
  createdAt: Date,
}));
const app = express();
app.get('/items', (req, res, next) => {
  req.filterObj = { category: 'active' };
  next();
}, factory.getAll(Item));
app.use((err, req, res, next) => res.status(err.statusCode || 500).json({ error: err.message }));
let server;
let serverReady;

async function list(query = '') {
  await serverReady;
  const url = new URL(`/items${query}`, `http://127.0.0.1:${server.address().port}`);
  return new Promise((resolve, reject) => {
    const call = http.request(url, (response) => {
      let raw = '';
      response.on('data', (chunk) => { raw += chunk; });
      response.on('end', () => resolve(JSON.parse(raw)));
    });
    call.on('error', reject);
    call.end();
  });
}

describe('generic list pagination', () => {
  before(async () => {
    const mongoBase = process.env.SECURITY_TEST_MONGO_URI || 'mongodb://127.0.0.1:27017';
    await mongoose.connect(`${mongoBase}/orchestra_pagination_${process.pid}_${Date.now()}`);
    await Item.create([
      { name: 'alpha-old', category: 'active', price: 10, createdAt: '2024-01-01' },
      { name: 'alpha-mid', category: 'active', price: 20, createdAt: '2024-02-01' },
      { name: 'alpha-new', category: 'active', price: 30, createdAt: '2024-03-01' },
      { name: 'alpha-top', category: 'inactive', price: 40, createdAt: '2024-04-01' },
      { name: 'beta-new', category: 'active', price: 30, createdAt: '2024-05-01' },
      { name: 'beta-top', category: 'active', price: 40, createdAt: '2024-06-01' },
    ]);
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

  it('counts only documents matching base filter, range filter, and keyword', async () => {
    const result = await list('?keyword=alpha&price[gte]=20&limit=1&page=1');
    assert.equal(result.results, 1);
    assert.equal(result.data[0].name, 'alpha-new');
    assert.equal(result.paginationResult.numberOfPages, 2);
    assert.equal(result.paginationResult.next, 2);
    assert.equal(result.paginationResult.prev, undefined);
  });

  it('reports previous but no next page on the last filtered page', async () => {
    const result = await list('?keyword=alpha&price[gte]=20&limit=1&page=2');
    assert.equal(result.results, 1);
    assert.equal(result.data[0].name, 'alpha-mid');
    assert.equal(result.paginationResult.numberOfPages, 2);
    assert.equal(result.paginationResult.prev, 1);
    assert.equal(result.paginationResult.next, undefined);
  });

  it('sorts newest first by createdAt when no sort is supplied', async () => {
    const result = await list('?limit=3');
    assert.deepEqual(result.data.map((item) => item.name), ['beta-top', 'beta-new', 'alpha-new']);
  });

  it('falls back to page 1 for zero and negative page values', async () => {
    for (const page of ['0', '-2']) {
      const result = await list(`?page=${page}&limit=2`);
      assert.equal(result.paginationResult.currentPage, 1);
      assert.equal(result.results, 2);
      assert.equal(result.paginationResult.prev, undefined);
    }
  });

  it('falls back safely for invalid limit and caps excessive limit at 100', async () => {
    for (const limit of ['0', '-5', 'oops']) {
      const result = await list(`?limit=${limit}`);
      assert.equal(result.paginationResult.limit, 13);
      assert.equal(result.results, 5);
    }
    const capped = await list('?limit=999');
    assert.equal(capped.paginationResult.limit, 100);
    assert.equal(capped.paginationResult.numberOfPages, 1);
    assert.equal(capped.results, 5);
  });

  it('keeps comparison filters, explicit sort, and field selection', async () => {
    const result = await list('?price[gt]=10&price[lte]=30&sort=price&fields=name,price');
    assert.deepEqual(result.data.map((item) => item.name).sort(), ['alpha-mid', 'alpha-new', 'beta-new']);
    assert.equal(result.paginationResult.numberOfPages, 1);
    assert.equal(result.data[0].category, undefined);
  });
});
