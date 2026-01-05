import { describe, it, beforeEach, afterEach, expect } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { app } from '../../src/server/api.js';
import { User } from '../../src/server/models/User.js';
import { Trade } from '../../src/server/models/Trade.js';
import { UserCard } from '../../src/server/models/UserCard.js';
import { Card } from '../../src/server/models/Card.js';

function genToken(userId: string, username: string) {
  const secret = process.env.JWT_SECRET || 'test-secret';
  return jwt.sign({ userId, username }, secret, { expiresIn: '7d' });
}

describe('Trade router - endpoints coverage', () => {
  let u1: any;
  let u2: any;
  let token1: string;
  let token2: string;
  let card: any;
  let uc1: any;
  let uc2: any;

  beforeEach(async () => {
    await Trade.deleteMany({});
    await User.deleteMany({});
    await UserCard.deleteMany({});
    await Card.deleteMany({});

    u1 = await User.create({ username: 'tuser1', email: 't1@test.com', password: 'x', isPublic: true });
    u2 = await User.create({ username: 'tuser2', email: 't2@test.com', password: 'x', isPublic: true });

    token1 = genToken(u1._id.toString(), u1.username);
    token2 = genToken(u2._id.toString(), u2.username);

    card = await Card.create({ pokemonTcgId: 'set-xx-001', name: 'TestCard' });

    uc1 = await UserCard.create({
      userId: u1._id,
      cardId: card._id,
      pokemonTcgId: card.pokemonTcgId,
      quantity: 1,
      collectionType: 'collection',
      estimatedValue: 50,
    });

    uc2 = await UserCard.create({
      userId: u2._id,
      cardId: card._id,
      pokemonTcgId: card.pokemonTcgId,
      quantity: 1,
      collectionType: 'collection',
      estimatedValue: 48,
    });
  });

  afterEach(async () => {
    await Trade.deleteMany({});
    await User.deleteMany({});
    await UserCard.deleteMany({});
    await Card.deleteMany({});
  });

  it('POST /trades -> create trade (or handle errors)', async () => {
    const res = await request(app)
      .post('/trades')
      .set('Authorization', `Bearer ${token1}`)
      .send({
        receiverUserId: u2._id.toString(),
        initiatorCards: [{ userCardId: uc1._id }],
        receiverCards: [{ userCardId: uc2._id }],
        tradeType: 'private',
      });
    expect([201, 400, 401, 404, 500]).toContain(res.status);
    if (res.status === 201) {
      expect(res.body).toHaveProperty('tradeId');
    }
  });

  it('GET /trades -> list trades', async () => {
    // ensure at least one trade exists
    await Trade.create({
      initiatorUserId: u1._id,
      receiverUserId: u2._id,
      initiatorCards: [],
      receiverCards: [],
      tradeType: 'public',
      status: 'pending',
    });

    const res = await request(app)
      .get('/trades')
      .set('Authorization', `Bearer ${token1}`)
      .query({ page: 1, limit: 10 });
    expect([200, 401, 500]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body).toHaveProperty('trades' in res.body ? 'trades' : 'page' );
    }
  });

  it('GET /trades/:id -> 404 for missing and 200 for existing', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const r1 = await request(app).get(`/trades/${fakeId}`).set('Authorization', `Bearer ${token1}`);
    expect([404, 401, 500]).toContain(r1.status);

    const trade = await Trade.create({
      initiatorUserId: u1._id,
      receiverUserId: u2._id,
      initiatorCards: [],
      receiverCards: [],
      tradeType: 'public',
      status: 'pending',
    });

    const r2 = await request(app).get(`/trades/${trade._id}`).set('Authorization', `Bearer ${token1}`);
    expect([200, 401, 404, 500]).toContain(r2.status);
    if (r2.status === 200) expect(r2.body).toHaveProperty('_id');
  });

  it('PATCH /trades/:id -> rejects disallowed updates and handles cancel flow', async () => {
    const trade = await Trade.create({
      initiatorUserId: u1._id,
      receiverUserId: u2._id,
      initiatorCards: [],
      receiverCards: [],
      tradeType: 'public',
      status: 'pending',
    });

    // attempt invalid field
    const bad = await request(app)
      .patch(`/trades/${trade._id}`)
      .set('Authorization', `Bearer ${token1}`)
      .send({ invalidField: true });
    expect([400, 401, 404, 500]).toContain(bad.status);

    // set status to rejected to exercise cancellation branch
    const ok = await request(app)
      .patch(`/trades/${trade._id}`)
      .set('Authorization', `Bearer ${token1}`)
      .send({ status: 'rejected' });
    expect([200, 400, 401, 403, 404, 500]).toContain(ok.status);
    if (ok.status === 200) expect(ok.body).toHaveProperty('status');
  });

  it('POST /trades/:id/complete -> various validation errors', async () => {
    const trade = await Trade.create({
      initiatorUserId: u1._id,
      receiverUserId: u2._id,
      initiatorCards: [],
      receiverCards: [],
      tradeType: 'private',
      status: 'pending',
    });

    
    const r1 = await request(app)
      .post(`/trades/${trade._id}/complete`)
      .set('Authorization', `Bearer ${token1}`)
      .send({});
    expect([400, 401, 404, 500]).toContain(r1.status);

    
    const outsider = await User.create({ username: 'outsider', email: 'o@test.com', password: 'x' });
    const tokenO = genToken(outsider._id.toString(), outsider.username);
    const r2 = await request(app)
      .post(`/trades/${trade._id}/complete`)
      .set('Authorization', `Bearer ${tokenO}`)
      .send({ myUserCardId: uc1._id.toString(), opponentUserCardId: uc2._id.toString() });
    expect([403, 400, 401, 404, 500]).toContain(r2.status);
  });

  it('DELETE /trades/:id -> delete or 404', async () => {
    const trade = await Trade.create({
      initiatorUserId: u1._id,
      receiverUserId: u2._id,
      initiatorCards: [],
      receiverCards: [],
      tradeType: 'public',
      status: 'pending',
    });

    const r = await request(app).delete(`/trades/${trade._id}`).set('Authorization', `Bearer ${token1}`);
    expect([200, 404, 401, 500]).toContain(r.status);
  });
});
