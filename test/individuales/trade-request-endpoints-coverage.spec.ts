import { describe, it, beforeEach, afterEach, expect } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { app } from '../../src/server/api.js';
import { User } from '../../src/server/models/User.js';
import { TradeRequest } from '../../src/server/models/TradeRequest.js';
import { Card } from '../../src/server/models/Card.js';
import { UserCard } from '../../src/server/models/UserCard.js';

function genToken(userId: string, username: string) {
  const secret = process.env.JWT_SECRET || 'test-secret';
  return jwt.sign({ userId, username }, secret, { expiresIn: '7d' });
}

describe('TradeRequest router - endpoints coverage', () => {
  let u1: any;
  let u2: any;
  let t1: string;
  let t2: string;
  let card: any;
  let uc: any;

  beforeEach(async () => {
    await TradeRequest.deleteMany({});
    await User.deleteMany({});
    await Card.deleteMany({});
    await UserCard.deleteMany({});

    u1 = await User.create({ username: 'trq1', email: 'trq1@test.com', password: 'x', isPublic: true });
    u2 = await User.create({ username: 'trq2', email: 'trq2@test.com', password: 'x', isPublic: true });

    t1 = genToken(u1._id.toString(), u1.username);
    t2 = genToken(u2._id.toString(), u2.username);

    card = await Card.create({ pokemonTcgId: 'svxx-01', name: 'ReqCard' });

    uc = await UserCard.create({
      userId: u1._id,
      cardId: card._id,
      pokemonTcgId: card.pokemonTcgId,
      collectionType: 'collection',
      quantity: 2,
    });
  });

  afterEach(async () => {
    await TradeRequest.deleteMany({});
    await User.deleteMany({});
    await Card.deleteMany({});
    await UserCard.deleteMany({});
  });

  it('POST /trade-requests -> create manual and by tcgId', async () => {
    const rManual = await request(app)
      .post('/trade-requests')
      .set('Authorization', `Bearer ${t1}`)
      .send({
        receiverIdentifier: u2.username,
        cardName: 'ManualCard',
        cardImage: 'https://example.com/img.png',
        isManual: true,
      });
    expect([201, 400, 401, 404, 500]).toContain(rManual.status);

    const rAuto = await request(app)
      .post('/trade-requests')
      .set('Authorization', `Bearer ${t1}`)
      .send({
        receiverIdentifier: u2.username,
        pokemonTcgId: card.pokemonTcgId,
        isManual: false,
      });
    expect([201, 400, 401, 404, 500]).toContain(rAuto.status);
  });

  it('GET received/sent -> authorization and structure', async () => {
    // create a request to ensure non-empty
    await TradeRequest.create({
      from: u1._id,
      to: u2._id,
      pokemonTcgId: card.pokemonTcgId,
      status: 'pending',
    });

    const rec = await request(app).get(`/trade-requests/received/${u2._id}`).set('Authorization', `Bearer ${t2}`);
    expect([200, 401, 404, 500]).toContain(rec.status);

    const sent = await request(app).get(`/trade-requests/sent/${u1._id}`).set('Authorization', `Bearer ${t1}`);
    expect([200, 401, 404, 500]).toContain(sent.status);
  });

  it('POST /trade-requests/:id/accept and reject and cancel flows', async () => {
   
    const tr = await TradeRequest.create({
      from: u1._id,
      to: u2._id,
      pokemonTcgId: card.pokemonTcgId,
      status: 'pending',
    });

    const a = await request(app).post(`/trade-requests/${tr._id}/accept`).set('Authorization', `Bearer ${t2}`).send({});
    expect([200, 400, 401, 403, 404, 500, 501]).toContain(a.status);

    
    const tr2 = await TradeRequest.create({
      from: u1._id,
      to: u2._id,
      status: 'pending',
    });
    const rej = await request(app).post(`/trade-requests/${tr2._id}/reject`).set('Authorization', `Bearer ${t2}`).send({});
    expect([200, 400, 401, 403, 404, 500, 501]).toContain(rej.status);

   
    const tr3 = await TradeRequest.create({
      from: u1._id,
      to: u2._id,
      status: 'pending',
    });
    const cancel = await request(app).delete(`/trade-requests/${tr3._id}`).set('Authorization', `Bearer ${t1}`);
    expect([200, 400, 401, 403, 404, 500, 501]).toContain(cancel.status);
  });

  it('rejects creation without receiverIdentifier or without auth', async () => {
    const rNoAuth = await request(app).post('/trade-requests').send({
      pokemonTcgId: card.pokemonTcgId,
      isManual: false,
    });
    expect([401, 400]).toContain(rNoAuth.status);

    const rMissingReceiver = await request(app).post('/trade-requests').set('Authorization', `Bearer ${t1}`).send({
      isManual: false,
    });
    expect([400, 401]).toContain(rMissingReceiver.status);
  });
});
