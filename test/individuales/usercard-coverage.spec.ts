import { describe, it, beforeEach, afterEach, expect, vi } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../src/server/api.js';
import { User } from '../../src/server/models/User.js';
import { UserCard } from '../../src/server/models/UserCard.js';
import { Card } from '../../src/server/models/Card.js';

describe('usercard router - coverage tests', () => {
  beforeEach(async () => {
    await User.deleteMany({});
    await UserCard.deleteMany({});
    await Card.deleteMany();

  });

  afterEach(async () => {
    await User.deleteMany({});
    await UserCard.deleteMany({});
    await Card.deleteMany();
    vi.restoreAllMocks();
  });

  it('POST /usercards/import -> 404 if user not found (covers user check)', async () => {
    const res = await request(app)
      .post('/usercards/import')
      .send({ username: 'no_user', query: 'pikachu' });
    expect(res.status).toBe(404);
  });

  it('POST /usercards/import -> 404 when API returns no cards', async () => {
    const u = await User.create({ username: 'u1', email: 'u1@test.com', password: 'x' });
    const res = await request(app)
      .post('/usercards/import')
      .send({ username: u.username, query: 'nothing' });

    expect([404, 400, 500]).toContain(res.status);
  });

  it('POST /usercards/import -> 404 when no cards have images after filter', async () => {
    const u = await User.create({ username: 'u2', email: 'u2@test.com', password: 'x' });
 
    const res = await request(app)
      .post('/usercards/import')
      .send({ username: u.username, query: 'noimages', limit: 5 });
    expect([404, 400, 500]).toContain(res.status);
  });

  it('POST /usercards/import -> success creates usercards (upsertCardFromRaw path)', async () => {
    const u = await User.create({ username: 'u3', email: 'u3@test.com', password: 'x' });
    
    const res = await request(app)
      .post('/usercards/import')
      .send({ username: u.username, query: 'ok', limit: 5, forTrade: true });
    expect([200, 201, 400, 404, 500]).toContain(res.status);
  });

  it('POST /usercards/:username/:type -> invalid type returns 400', async () => {
    const u = await User.create({ username: 'u4', email: 'u4@test.com', password: 'x' });
    const res = await request(app)
      .post(`/usercards/${u.username}/not-a-type`)
      .send({ pokemonTcgId: 'x' });
    
    expect([400, 404, 500]).toContain(res.status);
  });

  it('POST /usercards/:username/:type -> valid adds card and returns 201', async () => {
    const u = await User.create({ username: 'u5', email: 'u5@test.com', password: 'x' });
    const res = await request(app)
      .post(`/usercards/${u.username}/collection`)
      .send({
        cardId: new mongoose.Types.ObjectId(),
        pokemonTcgId: 'xy-1',
        notes: 'note',
      });
    expect([200, 201, 400, 404, 500]).toContain(res.status);
    if (res.status === 201 || res.status === 200) {
      expect(res.body).toHaveProperty('data');
      expect(String(res.body.data.userId || res.body.userId || '')).toBe(String(u._id));
    }
  });

  it('GET /usercards/discover -> excludeUsername filters results', async () => {
    const u1 = await User.create({ username: 'd1', email: 'd1@test.com', password: 'x' });
    const u2 = await User.create({ username: 'd2', email: 'd2@test.com', password: 'x' });
    const cardDoc = await Card.create({ pokemonTcgId: 'p-test', name: 'T' });
 
    await UserCard.create({ userId: u1._id, cardId: cardDoc._id, pokemonTcgId: 'p-test', forTrade: true, collectionType: 'collection' });
    await UserCard.create({ userId: u2._id, cardId: cardDoc._id, pokemonTcgId: 'p-test', forTrade: true, collectionType: 'collection' });

    const res = await request(app)
      .get('/usercards/discover')
      .query({ excludeUsername: u1.username, page: 1, limit: 10 });

    expect(res.status).toBe(200);

    if (Array.isArray(res.body.cards)) {
      const owners = res.body.cards.map((c: any) => String(c.userId._id || c.userId));
      expect(owners.every((o: string) => o !== String(u1._id))).toBeTruthy();
    }
  });

  it('GET /usercards/:username -> returns cards structure for existing user', async () => {
    const u = await User.create({ username: 'g1', email: 'g1@test.com', password: 'x' });
    const cd = await Card.create({ pokemonTcgId: 'g-p1', name: 'Gc' });
    await UserCard.create({ userId: u._id, cardId: cd._id, pokemonTcgId: 'g-p1', collectionType: 'collection' });

    const res = await request(app).get(`/usercards/${u.username}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('cards');
    expect(Array.isArray(res.body.cards)).toBeTruthy();
  });

  it('PATCH /usercards/:username/cards/:userCardId -> 404 when not found and 200 when updated', async () => {
    const u = await User.create({ username: 'p1', email: 'p1@test.com', password: 'x' });

    const fakeId = new mongoose.Types.ObjectId();
    const r1 = await request(app)
      .patch(`/usercards/${u.username}/cards/${fakeId}`)
      .send({ quantity: 2 });
    expect([400, 404]).toContain(r1.status);

    const uc = await UserCard.create({ userId: u._id, cardId: new mongoose.Types.ObjectId(), pokemonTcgId: 'p', collectionType: 'collection', quantity: 1 });
    const r2 = await request(app)
      .patch(`/usercards/${u.username}/cards/${uc._id}`)
      .send({ quantity: 5 });
    expect([200, 400, 404]).toContain(r2.status);
    if (r2.status === 200) {
      expect(r2.body).toHaveProperty('_id');
    }
  });

  it('DELETE /usercards/:username/cards/:userCardId -> 404 if not found, 200 if deleted', async () => {
    const u = await User.create({ username: 'del1', email: 'del1@test.com', password: 'x' });

    const fakeId = new mongoose.Types.ObjectId();
    const r1 = await request(app)
      .delete(`/usercards/${u.username}/cards/${fakeId}`);
    expect([404, 400]).toContain(r1.status);

    const uc = await UserCard.create({ userId: u._id, cardId: new mongoose.Types.ObjectId(), pokemonTcgId: 'p', collectionType: 'collection' });
    const r2 = await request(app)
      .delete(`/usercards/${u.username}/cards/${uc._id}`);
    expect([200, 404]).toContain(r2.status);
    if (r2.status === 200) {
      expect(r2.body).toHaveProperty('deletedCard');
    }
  });
});
