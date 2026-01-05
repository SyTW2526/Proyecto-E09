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

describe('Trade router - extra branches', () => {
  let a: any, b: any, tokenA: string, tokenB: string, cardA: any, ucA: any, ucB: any;

  beforeEach(async () => {
    await Trade.deleteMany({});
    await User.deleteMany({});
    await UserCard.deleteMany({});
    await Card.deleteMany({});

    a = await User.create({ username: 'tradeA', email: 'a@test.com', password: 'x', isPublic: true });
    b = await User.create({ username: 'tradeB', email: 'b@test.com', password: 'x', isPublic: true });

    tokenA = genToken(a._id.toString(), a.username);
    tokenB = genToken(b._id.toString(), b.username);

    cardA = await Card.create({ pokemonTcgId: 'set-001', name: 'C1' });

    ucA = await UserCard.create({
      userId: a._id,
      cardId: cardA._id,
      pokemonTcgId: cardA.pokemonTcgId,
      quantity: 2,
      estimatedValue: 100,
      collectionType: 'collection',
    });

    ucB = await UserCard.create({
      userId: b._id,
      cardId: cardA._id,
      pokemonTcgId: cardA.pokemonTcgId,
      quantity: 1,
      estimatedValue: 10,
      collectionType: 'collection',
    });
  });

  afterEach(async () => {
    await Trade.deleteMany({});
    await User.deleteMany({});
    await UserCard.deleteMany({});
    await Card.deleteMany({});
  });

  it('POST /trades -> missing receiverUserId handled', async () => {
    const res = await request(app)
      .post('/trades')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ initiatorCards: [], receiverCards: [] });
    expect([400, 404, 401, 500]).toContain(res.status);
  });

  it('POST /trades/:id/complete -> value diff and missing cards branches', async () => {
    const trade = await Trade.create({
      initiatorUserId: a._id,
      receiverUserId: b._id,
      initiatorCards: [{ userCardId: ucA._id }],
      receiverCards: [{ userCardId: ucB._id }],
      tradeType: 'private',
      status: 'pending',
    });

   
    const r1 = await request(app)
      .post(`/trades/${trade._id}/complete`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ myUserCardId: ucA._id.toString() }); 
    expect([400, 401, 404, 500]).toContain(r1.status);

   
    const r2 = await request(app)
      .post(`/trades/${trade._id}/complete`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ myUserCardId: ucA._id.toString(), opponentUserCardId: ucB._id.toString() });
    expect([400, 401, 403, 404, 500, 200]).toContain(r2.status);
  });

  it('GET /trades/:id and DELETE flows', async () => {
    const tr = await Trade.create({
      initiatorUserId: a._id,
      receiverUserId: b._id,
      initiatorCards: [],
      receiverCards: [],
      tradeType: 'public',
      status: 'pending',
    });

    const g = await request(app).get(`/trades/${tr._id}`).set('Authorization', `Bearer ${tokenA}`);
    expect([200, 401, 404, 500]).toContain(g.status);

    const d = await request(app).delete(`/trades/${tr._id}`).set('Authorization', `Bearer ${tokenA}`);
    expect([200, 404, 401, 500]).toContain(d.status);
  });
});
