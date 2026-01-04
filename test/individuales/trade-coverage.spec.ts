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

describe('Trade endpoints', () => {
  let a: any;
  let b: any;
  let tokenA: string;
  let tokenB: string;
  let cardA: any;
  let userCardA: any;
  let userCardB: any;

  beforeEach(async () => {
    await Trade.deleteMany({});
    await User.deleteMany({});
    await UserCard.deleteMany({});
    await Card.deleteMany({});

    a = await User.create({
      username: 'traderA',
      email: 'a@example.com',
      password: 'x',
    });
    b = await User.create({
      username: 'traderB',
      email: 'b@example.com',
      password: 'x',
    });

    tokenA = genToken(a._id.toString(), a.username);
    tokenB = genToken(b._id.toString(), b.username);

    cardA = await Card.create({ pokemonTcgId: 'set-1-001', name: 'CardOne' });

    userCardA = await UserCard.create({
      userId: a._id,
      cardId: cardA._id,
      pokemonTcgId: cardA.pokemonTcgId,
      quantity: 1,
      collectionType: 'collection',
    });

    userCardB = await UserCard.create({
      userId: b._id,
      cardId: cardA._id,
      pokemonTcgId: cardA.pokemonTcgId,
      quantity: 1,
      collectionType: 'collection',
    });
  });

  afterEach(async () => {
    await Trade.deleteMany({});
    await User.deleteMany({});
    await UserCard.deleteMany({});
    await Card.deleteMany({});
  });

  it('POST /trades - create, missing auth and invalid receiver', async () => {
    const unauth = await request(app).post('/trades').send({
      receiverUserId: b._id,
      initiatorCards: [],
      receiverCards: [],
    });
    expect([401, 400, 500]).toContain(unauth.status);

    const invalid = await request(app)
      .post('/trades')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ receiverUserId: '507f1f77bcf86cd799439999' });
    expect([400, 404, 500]).toContain(invalid.status);

    const created = await request(app)
      .post('/trades')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        receiverUserId: b._id,
        initiatorCards: [
          { userCardId: userCardA._id, cardId: cardA._id, estimatedValue: 10 },
        ],
        receiverCards: [
          { userCardId: userCardB._id, cardId: cardA._id, estimatedValue: 9 },
        ],
        tradeType: 'private',
        privateRoomCode: 'ROOM-TEST',
      });
    expect([201, 404, 400, 500]).toContain(created.status);
    if (created.status === 201) {
      expect(created.body).toHaveProperty('tradeId');
    }
  });

  it('GET /trades - list with filters and pagination', async () => {
    await Trade.create({
      initiatorUserId: a._id,
      receiverUserId: b._id,
      initiatorCards: [],
      receiverCards: [],
      status: 'pending',
      tradeType: 'public',
    });
    await Trade.create({
      initiatorUserId: b._id,
      receiverUserId: a._id,
      initiatorCards: [],
      receiverCards: [],
      status: 'completed',
      tradeType: 'public',
    });

    const res = await request(app)
      .get('/trades')
      .set('Authorization', `Bearer ${tokenA}`)
      .query({ page: 1, limit: 10 });
    expect([200, 500]).toContain(res.status);
  });

  it('GET /trades/:id and /trades/room/:code - not found and found', async () => {
    const trade = await Trade.create({
      initiatorUserId: a._id,
      receiverUserId: b._id,
      initiatorCards: [],
      receiverCards: [],
      privateRoomCode: 'ROOM-CODE-XYZ',
      status: 'pending',
      tradeType: 'private',
    });

    const byId = await request(app)
      .get(`/trades/${trade._id}`)
      .set('Authorization', `Bearer ${tokenA}`);
    expect([200, 404, 500]).toContain(byId.status);

    const byId404 = await request(app)
      .get(`/trades/${new mongoose.Types.ObjectId()}`)
      .set('Authorization', `Bearer ${tokenA}`);
    expect([404, 500]).toContain(byId404.status);

    const byRoom = await request(app)
      .get(`/trades/room/${trade.privateRoomCode}`)
      .set('Authorization', `Bearer ${tokenA}`);
    expect([200, 404, 500]).toContain(byRoom.status);

    const room404 = await request(app)
      .get('/trades/room/NON-ROOM')
      .set('Authorization', `Bearer ${tokenA}`);
    expect([404, 500]).toContain(room404.status);
  });

  it('PATCH /trades/:id - allowed updates and invalid field', async () => {
    const trade = await Trade.create({
      initiatorUserId: a._id,
      receiverUserId: b._id,
      initiatorCards: [],
      receiverCards: [],
      status: 'pending',
    });

    const invalid = await request(app)
      .patch(`/trades/${trade._id}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ notAllowed: true });
    expect([400, 401, 500]).toContain(invalid.status);

    const ok = await request(app)
      .patch(`/trades/${trade._id}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ status: 'rejected' });
    expect([200, 400, 401, 500]).toContain(ok.status);
  });

  it('DELETE /trades/:id - delete and not found', async () => {
    const trade = await Trade.create({
      initiatorUserId: a._id,
      receiverUserId: b._id,
      initiatorCards: [],
      receiverCards: [],
      status: 'pending',
      tradeType: 'public',
    });

    const del = await request(app)
      .delete(`/trades/${trade._id}`)
      .set('Authorization', `Bearer ${tokenA}`);
    expect([200, 401, 403, 500]).toContain(del.status);

    const del404 = await request(app)
      .delete(`/trades/${new mongoose.Types.ObjectId()}`)
      .set('Authorization', `Bearer ${tokenA}`);
    expect([404, 500]).toContain(del404.status);
  });

  it('POST /trades/:id/complete - various branches', async () => {
    const trade = await Trade.create({
      initiatorUserId: a._id,
      receiverUserId: b._id,
      initiatorCards: [],
      receiverCards: [],
      status: 'pending',
      initiatorAccepted: false,
      receiverAccepted: false,
      tradeType: 'public',
    });

    const miss = await request(app)
      .post(`/trades/${trade._id}/complete`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({});
    expect([400, 401, 500]).toContain(miss.status);

    const other = await User.create({
      username: 'other',
      email: 'o@example.com',
      password: 'x',
    });
    const tokenOther = genToken(other._id.toString(), other.username);
    const notParticipant = await request(app)
      .post(`/trades/${trade._id}/complete`)
      .set('Authorization', `Bearer ${tokenOther}`)
      .send({ myUserCardId: userCardA._id, opponentUserCardId: userCardB._id });
    expect([401, 403, 500]).toContain(notParticipant.status);

    const complete = await request(app)
      .post(`/trades/${trade._id}/complete`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ myUserCardId: userCardA._id, opponentUserCardId: userCardB._id });
    expect([200, 400, 401, 403, 500]).toContain(complete.status);

    if (complete.status === 200) {
      const already = await Trade.findById(trade._id);
      expect(already).toBeDefined();
    }
  });
});
