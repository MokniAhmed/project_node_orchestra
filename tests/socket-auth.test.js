const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET_KEY = 'socket-auth-test-secret';

const User = require('../models/userModel');
const { protectSocket } = require('../middlewares/authMiddleware');

async function authenticate(authorization) {
  const socket = { handshake: { headers: {} } };
  if (authorization !== undefined) socket.handshake.headers.authorization = authorization;
  const calls = [];
  await protectSocket(socket, (error) => { calls.push(error); });
  return { socket, calls };
}

describe('protectSocket', () => {
  let user;

  before(async () => {
    const mongoBase = process.env.SECURITY_TEST_MONGO_URI || 'mongodb://127.0.0.1:27017';
    await mongoose.connect(`${mongoBase}/orchestra_socket_auth_${process.pid}_${Date.now()}`);
    user = await User.create({
      firstName: 'Socket', lastName: 'User', birthday: '1990-01-01', height: 1.7,
      gender: 'female', nationality: 'Tunisian', address: 'Tunis',
      email: 'socket-user@example.test', password: 'initialPass123', role: 'chorist',
      group_pupitre: 'first', list_muted: ['2025-01-01'],
    });
  });

  after(async () => {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.dropDatabase();
      await mongoose.disconnect();
    }
  });

  it('calls next once with Unauthorized when Authorization is missing', async () => {
    const { socket, calls } = await authenticate();
    assert.equal(calls.length, 1);
    assert.ok(calls[0] instanceof Error);
    assert.equal(calls[0].statusCode, 401);
    assert.match(calls[0].message, /Unauthorized/i);
    assert.equal(socket.user, undefined);
  });

  it('calls next once with an error for an invalid JWT', async () => {
    const { socket, calls } = await authenticate('Bearer invalid.jwt.token');
    assert.equal(calls.length, 1);
    assert.ok(calls[0] instanceof Error);
    assert.equal(socket.user, undefined);
  });

  it('calls next once with an error for a JWT belonging to a missing user', async () => {
    const missingId = new mongoose.Types.ObjectId();
    const token = jwt.sign({ userId: missingId }, process.env.JWT_SECRET_KEY);
    const { socket, calls } = await authenticate(`Bearer ${token}`);
    assert.equal(calls.length, 1);
    assert.ok(calls[0] instanceof Error);
    assert.equal(calls[0].statusCode, 401);
    assert.equal(socket.user, undefined);
  });

  it('calls next once and attaches selected User fields for a valid JWT', async () => {
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET_KEY);
    const { socket, calls } = await authenticate(`Bearer ${token}`);
    assert.equal(calls.length, 1);
    assert.equal(calls[0], undefined);
    assert.equal(socket.user.id, user.id);
    assert.equal(socket.user.role, 'chorist');
    assert.equal(socket.user.group_pupitre, 'first');
    assert.ok(Array.isArray(socket.user.list_muted));
    assert.equal(socket.user.list_muted.length, 1);
    assert.equal(socket.user.email, 'socket-user@example.test');
  });

  it('rejects a socket JWT issued before passwordChangedAt', async () => {
    const changedAtSeconds = Math.floor(Date.now() / 1000);
    const passwordChangedUser = await User.create({
      firstName: 'Changed', lastName: 'Password', birthday: '1990-01-01', height: 1.7,
      gender: 'female', nationality: 'Tunisian', address: 'Tunis',
      email: 'socket-old-token@example.test', password: 'initialPass123', role: 'chorist',
    });
    await User.findByIdAndUpdate(passwordChangedUser.id, {
      passwordChangedAt: new Date(changedAtSeconds * 1000),
    });
    const token = jwt.sign(
      { userId: passwordChangedUser.id, iat: changedAtSeconds - 60 },
      process.env.JWT_SECRET_KEY
    );
    const { socket, calls } = await authenticate(`Bearer ${token}`);
    assert.equal(calls.length, 1);
    assert.ok(calls[0] instanceof Error);
    assert.equal(calls[0].statusCode, 401);
    assert.equal(socket.user, undefined);
  });

  it('accepts a socket JWT issued after passwordChangedAt', async () => {
    const issuedAtSeconds = Math.floor(Date.now() / 1000);
    const passwordChangedUser = await User.create({
      firstName: 'Fresh', lastName: 'Token', birthday: '1990-01-01', height: 1.7,
      gender: 'female', nationality: 'Tunisian', address: 'Tunis',
      email: 'socket-fresh-token@example.test', password: 'initialPass123', role: 'chorist',
    });
    await User.findByIdAndUpdate(passwordChangedUser.id, {
      passwordChangedAt: new Date((issuedAtSeconds - 60) * 1000),
    });
    const token = jwt.sign(
      { userId: passwordChangedUser.id, iat: issuedAtSeconds },
      process.env.JWT_SECRET_KEY
    );
    const { socket, calls } = await authenticate(`Bearer ${token}`);
    assert.equal(calls.length, 1);
    assert.equal(calls[0], undefined);
    assert.equal(socket.user.id, passwordChangedUser.id);
  });
});
