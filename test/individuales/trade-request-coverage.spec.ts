import { describe, it, beforeEach, expect } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { app } from '../../src/server/api';

import { User } from '../../src/server/models/User';
import { TradeRequest } from '../../src/server/models/TradeRequest';
import { Trade } from '../../src/server/models/Trade';
import { UserCard } from '../../src/server/models/UserCard';

let tokenUser1: string;
let tokenUser2: string;
let user1: any;
let user2: any;

beforeEach(async () => {
  await User.deleteMany();
  await TradeRequest.deleteMany();
  await Trade.deleteMany();
  await UserCard.deleteMany();

  user1 = await new User({
    username: 'user1',
    email: 'u1@test.com',
    password: '123456',
  }).save();

  user2 = await new User({
    username: 'user2',
    email: 'u2@test.com',
    password: '123456',
  }).save();

  const secret = process.env.JWT_SECRET || 'test-secret';
  tokenUser1 = jwt.sign(
    { userId: user1._id.toString(), username: user1.username },
    secret,
    { expiresIn: '7d' }
  );
  tokenUser2 = jwt.sign(
    { userId: user2._id.toString(), username: user2.username },
    secret,
    { expiresIn: '7d' }
  );
});

describe('POST /trade-requests – coverage', () => {
  it('400 si falta receiverIdentifier (linea 58)', async () => {
    const res = await request(app)
      .post('/trade-requests')
      .set('Authorization', `Bearer ${tokenUser1}`)
      .send({ pokemonTcgId: 'pkm-1' });

    expect(res.status).toBe(400);
  });

  it('400 si no es manual y falta pokemonTcgId (linea 84)', async () => {
    const res = await request(app)
      .post('/trade-requests')
      .set('Authorization', `Bearer ${tokenUser1}`)
      .send({ receiverIdentifier: user2.username });

    expect(res.status).toBe(400);
  });

  it('rechaza solicitud duplicada pendiente (108-133)', async () => {
    await TradeRequest.create({
      from: user1._id,
      to: user2._id,
      pokemonTcgId: 'pkm-1',
      status: 'pending',
      isManual: false,
    });

    const res = await request(app)
      .post('/trade-requests')
      .set('Authorization', `Bearer ${tokenUser1}`)
      .send({
        receiverIdentifier: user2.username,
        pokemonTcgId: 'pkm-1',
      });

    expect(res.status).toBe(400);
    expect(res.body.errorCode).toBe('TRADE_ALREADY_EXISTS');
  });

  it('404 si offeredUserCardId no existe (linea 146)', async () => {
    const res = await request(app)
      .post('/trade-requests')
      .set('Authorization', `Bearer ${tokenUser1}`)
      .send({
        receiverIdentifier: user2.username,
        pokemonTcgId: 'pkm-target',
        offeredCard: { pokemonTcgId: 'pkm-offer' },
        offeredUserCardId: new mongoose.Types.ObjectId(),
      });

    expect(res.status).toBe(404);
  });

  it('400 si offeredUserCard no pertenece al emisor (150)', async () => {
    const uc = await UserCard.create({
      userId: user2._id,
      cardId: new mongoose.Types.ObjectId(),
      pokemonTcgId: 'pkm-offer',
      quantity: 1,
    });

    const res = await request(app)
      .post('/trade-requests')
      .set('Authorization', `Bearer ${tokenUser1}`)
      .send({
        receiverIdentifier: user2.username,
        pokemonTcgId: 'pkm-target',
        offeredCard: { pokemonTcgId: 'pkm-offer' },
        offeredUserCardId: uc._id,
      });

    expect(res.status).toBe(400);
  });
});

describe('GET trade-requests received/sent', () => {
  it('403 si intentas ver received de otro usuario (264)', async () => {
    const res = await request(app)
      .get(`/trade-requests/received/${user2._id}`)
      .set('Authorization', `Bearer ${tokenUser1}`);

    expect(res.status).toBe(403);
  });

  it('devuelve solicitudes enviadas (281)', async () => {
    await TradeRequest.create({
      from: user1._id,
      to: user2._id,
      pokemonTcgId: 'pkm-1',
      status: 'pending',
    });

    const res = await request(app)
      .get(`/trade-requests/sent/${user1._id}`)
      .set('Authorization', `Bearer ${tokenUser1}`);

    expect(res.status).toBe(200);
    expect(res.body.requests.length).toBe(1);
  });
});

describe('POST /trade-requests/:id/open-room', () => {
  it('crea sala correctamente (354)', async () => {
    const tr = await TradeRequest.create({
      from: user1._id,
      to: user2._id,
      pokemonTcgId: 'pkm-1',
      status: 'pending',
    });

    const res = await request(app)
      .post(`/trade-requests/${tr._id}/open-room`)
      .set('Authorization', `Bearer ${tokenUser2}`);

    expect(res.status).toBe(200);
    expect(await Trade.countDocuments()).toBe(1);
  });
});

describe('POST /trade-requests/:id/reject', () => {
  it('rechaza solicitud pendiente', async () => {
    const tr = await TradeRequest.create({
      from: user1._id,
      to: user2._id,
      pokemonTcgId: 'pkm-1',
      status: 'pending',
    });

    const res = await request(app)
      .post(`/trade-requests/${tr._id}/reject`)
      .set('Authorization', `Bearer ${tokenUser2}`);

    expect(res.status).toBe(200);
  });
});

describe('POST /trade-requests/:id/accept – quick', () => {
  it('rechaza quick trade por diferencia de precio (506-618)', async () => {
    const offered = await UserCard.create({
      userId: user1._id,
      cardId: new mongoose.Types.ObjectId(),
      pokemonTcgId: 'pkm-offer',
      quantity: 1,
    });

    const target = await UserCard.create({
      userId: user2._id,
      cardId: new mongoose.Types.ObjectId(),
      pokemonTcgId: 'pkm-target',
      quantity: 1,
    });

    const tr = await TradeRequest.create({
      from: user1._id,
      to: user2._id,
      pokemonTcgId: 'pkm-target',
      offeredCard: { pokemonTcgId: 'pkm-offer' },
      offeredPrice: 100,
      targetPrice: 10,
      status: 'pending',
    });

    const res = await request(app)
      .post(`/trade-requests/${tr._id}/accept`)
      .set('Authorization', `Bearer ${tokenUser2}`);

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('TRADE_VALUE_DIFF_TOO_HIGH');
  });
});

describe('DELETE /trade-requests/:id/cancel', () => {
  it('cancela solicitud pendiente', async () => {
    const tr = await TradeRequest.create({
      from: user1._id,
      to: user2._id,
      pokemonTcgId: 'pkm-1',
      status: 'pending',
    });

    const res = await request(app)
      .delete(`/trade-requests/${tr._id}/cancel`)
      .set('Authorization', `Bearer ${tokenUser1}`);

    expect(res.status).toBe(200);
  });
});
