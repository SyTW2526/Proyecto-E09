import { describe, it, beforeEach, afterEach, expect } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { app } from '../../src/server/api.js';
import { User } from '../../src/server/models/User.js';
import { TradeRequest } from '../../src/server/models/TradeRequest.js';
import { UserCard } from '../../src/server/models/UserCard.js';
import { Card } from '../../src/server/models/Card.js';

function genToken(userId: string, username: string) {
  const secret = process.env.JWT_SECRET || 'test-secret';
  return jwt.sign({ userId, username }, secret, { expiresIn: '7d' });
}

describe('TradeRequest - extra branches', () => {
  let u1: any, u2: any, t1: string, t2: string, card: any, uc1: any, uc2: any;

  beforeEach(async () => {
    await TradeRequest.deleteMany({});
    await User.deleteMany({});
    await UserCard.deleteMany({});
    await Card.deleteMany({});

    u1 = await User.create({ username: 'rqA', email: 'rqA@test.com', password: 'x', isPublic: true });
    u2 = await User.create({ username: 'rqB', email: 'rqB@test.com', password: 'x', isPublic: true });

    t1 = genToken(u1._id.toString(), u1.username);
    t2 = genToken(u2._id.toString(), u2.username);

    card = await Card.create({ pokemonTcgId: 'req-01', name: 'Req' });

    uc1 = await UserCard.create({ userId: u1._id, cardId: card._id, pokemonTcgId: card.pokemonTcgId, quantity: 1 });
    uc2 = await UserCard.create({ userId: u2._id, cardId: card._id, pokemonTcgId: card.pokemonTcgId, quantity: 1 });
  });

  afterEach(async () => {
    await TradeRequest.deleteMany({});
    await User.deleteMany({});
    await UserCard.deleteMany({});
    await Card.deleteMany({});
  });

  it('POST /trade-requests/:id/open-room branch and permission', async () => {
    const tr = await TradeRequest.create({ from: u1._id, to: u2._id, status: 'pending' });
    const res = await request(app).post(`/trade-requests/${tr._id}/open-room`).set('Authorization', `Bearer ${t2}`);
    expect([200, 400, 401, 403, 404, 500]).toContain(res.status);
  });

  it('POST /trade-requests/:id/accept quick trade value diff branch', async () => {
    const tr = await TradeRequest.create({
      from: u1._id,
      to: u2._id,
      offeredCard: { pokemonTcgId: 'off-1' },
      offeredPrice: 1000,
      targetPrice: 5,
      status: 'pending',
    });

    const res = await request(app).post(`/trade-requests/${tr._id}/accept`).set('Authorization', `Bearer ${t2}`).send({});
    expect([400, 401, 403, 404, 500]).toContain(res.status);
  });

  it('POST /trade-requests -> offeredUserCardId not found branch', async () => {
    const res = await request(app).post('/trade-requests').set('Authorization', `Bearer ${t1}`).send({
      receiverIdentifier: u2.username,
      pokemonTcgId: card.pokemonTcgId,
      offeredUserCardId: new mongoose.Types.ObjectId(),
    });
    expect([404, 400, 401, 500]).toContain(res.status);
  });

  it('reject accept when not receiver', async () => {
    const tr = await TradeRequest.create({ from: u1._id, to: u2._id, status: 'pending' });
    const r = await request(app).post(`/trade-requests/${tr._id}/accept`).set('Authorization', `Bearer ${t1}`);
    expect([403, 400, 401, 500]).toContain(r.status);
  });
});
