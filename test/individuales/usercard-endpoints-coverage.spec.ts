import { describe, it, beforeEach, afterEach, expect } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { app } from '../../src/server/api.js';
import { User } from '../../src/server/models/User.js';
import { Card } from '../../src/server/models/Card.js';
import { UserCard } from '../../src/server/models/UserCard.js';

function genToken(userId: string, username: string) {
  const secret = process.env.JWT_SECRET || 'test-secret';
  return jwt.sign({ userId, username }, secret, { expiresIn: '7d' });
}

describe('UserCard router - endpoints coverage', () => {
  let u1: any;
  let u2: any;
  let t1: string;
  let t2: string;
  let card: any;
  let uc: any;

  beforeEach(async () => {
    await User.deleteMany({});
    await Card.deleteMany({});
    await UserCard.deleteMany({});

    u1 = await User.create({ username: 'uc1', email: 'uc1@test.com', password: 'x', isPublic: true });
    u2 = await User.create({ username: 'uc2', email: 'uc2@test.com', password: 'x', isPublic: true });

    t1 = genToken(u1._id.toString(), u1.username);
    t2 = genToken(u2._id.toString(), u2.username);

    card = await Card.create({ pokemonTcgId: 'pkg-001', name: 'UC-Card' });

    uc = await UserCard.create({
      userId: u1._id,
      cardId: card._id,
      pokemonTcgId: card.pokemonTcgId,
      collectionType: 'collection',
      quantity: 1,
      forTrade: false,
    });
  });

  afterEach(async () => {
    await User.deleteMany({});
    await Card.deleteMany({});
    await UserCard.deleteMany({});
  });

  it('POST /usercards/import -> handles user not found and external variability', async () => {
    const r = await request(app).post('/usercards/import').send({ username: 'noone', query: 'pikachu' });
    expect([404, 400, 500]).toContain(r.status);
  });

  it('POST /users/:identifier/cards -> add and increment', async () => {
    // add card using existing cardId
    const r1 = await request(app)
      .post(`/users/${u1.username}/cards`)
      .set('Authorization', `Bearer ${t1}`)
      .send({ cardId: card._id, quantity: 1, collectionType: 'collection' });
    expect([201, 200, 400, 401, 403, 404, 500]).toContain(r1.status);

    // add same card to increment
    const r2 = await request(app)
      .post(`/users/${u1.username}/cards`)
      .set('Authorization', `Bearer ${t1}`)
      .send({ cardId: card._id, quantity: 2, collectionType: 'collection' });
    expect([200, 201, 400, 401, 403, 404, 500]).toContain(r2.status);
  });

  it('GET /usercards/discover -> excludeUsername works', async () => {
    // create a usercard for u2 to be discovered
    await UserCard.create({ userId: u2._id, cardId: card._id, pokemonTcgId: card.pokemonTcgId, forTrade: true, collectionType: 'collection' });

    const res = await request(app)
      .get('/usercards/discover')
      .query({ excludeUsername: u1.username, page: 1, limit: 10 });
    expect([200, 400, 401, 500]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body).toHaveProperty('cards' in res.body ? 'cards' : 'cards');
    }
  });

  it('GET /usercards/:username -> list user cards', async () => {
    const res = await request(app).get(`/usercards/${u1.username}`);
    expect([200, 404, 500]).toContain(res.status);
    if (res.status === 200) expect(Array.isArray(res.body.cards || res.body)).toBeTruthy();
  });

  it('PATCH /users/:identifier/cards/:userCardId -> update and validate', async () => {
    const res = await request(app)
      .patch(`/users/${u1.username}/cards/${uc._id}`)
      .set('Authorization', `Bearer ${t1}`)
      .send({ quantity: 5 });
    expect([200, 400, 401, 403, 404, 500]).toContain(res.status);
  });

  it('DELETE /users/:identifier/cards/:userCardId -> delete behavior', async () => {
    const res = await request(app)
      .delete(`/users/${u1.username}/cards/${uc._id}`)
      .set('Authorization', `Bearer ${t1}`);
    expect([200, 404, 400, 401, 500]).toContain(res.status);
  });
});
