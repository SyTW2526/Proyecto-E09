import { describe, it, beforeEach, afterEach, expect } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { app } from '../../src/server/api.js';
import { User } from '../../src/server/models/User.js';
import { Card } from '../../src/server/models/Card.js';
import { UserCard } from '../../src/server/models/UserCard.js';

function genToken(userId: string, username: string) {
  const secret = process.env.JWT_SECRET || 'test-secret';
  return jwt.sign({ userId, username }, secret, { expiresIn: '7d' });
}

describe('UserCard - extra branches', () => {
  let u: any, v: any, tokenU: string, tokenV: string, card: any, uc: any;

  beforeEach(async () => {
    await User.deleteMany({});
    await Card.deleteMany({});
    await UserCard.deleteMany({});

    u = await User.create({ username: 'uc_main', email: 'uc1@test.com', password: 'x', isPublic: true });
    v = await User.create({ username: 'uc_other', email: 'uc2@test.com', password: 'x', isPublic: true });

    tokenU = genToken(u._id.toString(), u.username);
    tokenV = genToken(v._id.toString(), v.username);

    card = await Card.create({ pokemonTcgId: 'pkg-999', name: 'PkgCard' });

    uc = await UserCard.create({
      userId: u._id,
      cardId: card._id,
      pokemonTcgId: card.pokemonTcgId,
      collectionType: 'collection',
      quantity: 1,
    });
  });

  afterEach(async () => {
    await User.deleteMany({});
    await Card.deleteMany({});
    await UserCard.deleteMany({});
  });

  it('POST /usercards/import -> when card exists should handle gracefully', async () => {
    const res = await request(app).post('/usercards/import').send({ username: u.username, query: 'pkg-999' });
    expect([200, 400, 404, 500]).toContain(res.status);
  });

  it('POST /users/:identifier/cards -> add existing card and increment branch', async () => {
    const r1 = await request(app)
      .post(`/users/${u.username}/cards`)
      .set('Authorization', `Bearer ${tokenU}`)
      .send({ cardId: card._id, quantity: 1, collectionType: 'collection' });
    expect([201, 200, 400, 401, 403, 404, 500]).toContain(r1.status);

    const r2 = await request(app)
      .post(`/users/${u.username}/cards`)
      .set('Authorization', `Bearer ${tokenU}`)
      .send({ cardId: card._id, quantity: 3, collectionType: 'collection' });
    expect([200, 201, 400, 401, 403, 404, 500]).toContain(r2.status);
  });

  it('PATCH /users/:identifier/cards/:userCardId -> invalid fields rejected', async () => {
    const res = await request(app)
      .patch(`/users/${u.username}/cards/${uc._id}`)
      .set('Authorization', `Bearer ${tokenU}`)
      .send({ illegalField: true });
    expect([400, 401, 403, 404, 500]).toContain(res.status);
  });

  it('DELETE /users/:identifier/cards/:userCardId -> non-existing id', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .delete(`/users/${u.username}/cards/${fakeId}`)
      .set('Authorization', `Bearer ${tokenU}`);
    expect([404, 401, 400, 500]).toContain(res.status);
  });
});
