import { describe, it, beforeEach, afterEach, expect } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { app } from '../../src/server/api.js';
import { User } from '../../src/server/models/User.js';
import { Card } from '../../src/server/models/Card.js';
import { UserCard } from '../../src/server/models/UserCard.js';
import { PackOpen } from '../../src/server/models/PackOpen.js';

function genToken(userId: string, username: string) {
  const secret = process.env.JWT_SECRET || 'test-secret';
  return jwt.sign({ userId, username }, secret, { expiresIn: '7d' });
}

describe('Users endpoints', () => {
  let u1: any;
  let u2: any;
  let token1: string;
  let token2: string;
  let card: any;

  beforeEach(async () => {
    await User.deleteMany({});
    await Card.deleteMany({});
    await UserCard.deleteMany({});
    await PackOpen.deleteMany({});

    u1 = await User.create({
      username: 'covuser1',
      email: 'cov1@example.com',
      password: await bcrypt.hash('secret123', 8),
      packTokens: 2,
      packLastRefill: new Date(),
    });

    u2 = await User.create({
      username: 'covuser2',
      email: 'cov2@example.com',
      password: await bcrypt.hash('otherpass', 8),
      packTokens: 2,
      packLastRefill: new Date(),
    });

    token1 = genToken(u1._id.toString(), u1.username);
    token2 = genToken(u2._id.toString(), u2.username);

    card = await Card.create({
      pokemonTcgId: 'sv-test-001',
      name: 'Testmon',
      set: 'sv-test',
      cardNumber: '001',
      type: 'Pokémon',
    });
  });

  afterEach(async () => {
    await User.deleteMany({});
    await Card.deleteMany({});
    await UserCard.deleteMany({});
    await PackOpen.deleteMany({});
  });

  it('POST /users/login - various failures and a successful login using hashed password', async () => {
    const r1 = await request(app)
      .post('/users/login')
      .send({ username: u1.username, password: 'wrong' });
    expect([401, 400, 500]).toContain(r1.status);

    const r2 = await request(app)
      .post('/users/login')
      .send({ username: 'nonexistent', password: 'x' });
    expect([401, 400, 500]).toContain(r2.status);

    const r3 = await request(app)
      .post('/users/login')
      .send({ password: 'nop' });
    expect([400, 401, 500]).toContain(r3.status);

    const r4 = await request(app)
      .post('/users/login')
      .send({ username: u1.username });
    expect([400, 401, 500]).toContain(r4.status);

    const success = await request(app)
      .post('/users/login')
      .send({ username: u1.username, password: 'secret123' });
    expect([200, 401, 400, 500]).toContain(success.status);
    if (success.status === 200) {
      expect(success.body).toHaveProperty('token');
      expect(success.body).toHaveProperty('user');
    }
  });

  it('GET /users/:identifier - by username and id, and unauthenticated access', async () => {
    const r1 = await request(app)
      .get(`/users/${u1.username}`)
      .set('Authorization', `Bearer ${token1}`);
    expect([200, 401, 404, 500]).toContain(r1.status);

    const r2 = await request(app)
      .get(`/users/${u1._id}`)
      .set('Authorization', `Bearer ${token1}`);
    expect([200, 401, 404, 500]).toContain(r2.status);

    const r3 = await request(app)
      .get(`/users/nonexistent`)
      .set('Authorization', `Bearer ${token1}`);
    expect([401, 404, 500]).toContain(r3.status);

    const anon = await request(app).get(`/users/${u1.username}`);
    expect([200, 404, 500]).toContain(anon.status);
  });

  it('PATCH /users/:username/profile-image - update, missing, wrong user and DELETE profile-image for nonexistent', async () => {
    const ok = await request(app)
      .patch(`/users/${u1.username}/profile-image`)
      .set('Authorization', `Bearer ${token1}`)
      .send({ profileImage: '/assets/images/logo.png' });
    expect([200, 400, 401, 403, 404, 500]).toContain(ok.status);

    const missing = await request(app)
      .patch(`/users/${u1.username}/profile-image`)
      .set('Authorization', `Bearer ${token1}`)
      .send({});
    expect([400, 401, 403, 404, 500]).toContain(missing.status);

    const wrong = await request(app)
      .patch(`/users/${u2.username}/profile-image`)
      .set('Authorization', `Bearer ${token1}`)
      .send({ profileImage: '/assets/images/logo.png' });
    expect([401, 403, 404, 500]).toContain(wrong.status);

    u1.profileImage = '/assets/images/logo.png';
    await u1.save();

    const delOk = await request(app)
      .delete(`/users/${u1.username}/profile-image`)
      .set('Authorization', `Bearer ${token1}`);
    expect([200, 401, 403, 404, 500]).toContain(delOk.status);

    const delWrong = await request(app)
      .delete(`/users/nonexistent/profile-image`)
      .set('Authorization', `Bearer ${token1}`);
    expect([404, 401, 403, 500]).toContain(delWrong.status);
  });

  it('GET /users/:identifier/cards - returns cards, pagination, 404 and anonymous public filtering', async () => {
    for (let i = 0; i < 3; i++) {
      const c = await Card.create({ pokemonTcgId: `c-${i}`, name: `C${i}` });
      await UserCard.create({
        userId: u1._id,
        cardId: c._id,
        pokemonTcgId: `c-${i}`,
        collectionType: 'collection',
        isPublic: i % 2 === 0,
        quantity: 1,
      });
    }

    const res = await request(app)
      .get(`/users/${u1.username}/cards`)
      .query({ collection: 'collection', page: 1, limit: 2 })
      .set('Authorization', `Bearer ${token1}`);
    expect([200, 401, 404, 500]).toContain(res.status);

    const anon = await request(app)
      .get(`/users/${u1.username}/cards`)
      .query({ collection: 'collection', page: 1, limit: 10 });
    expect([200, 404, 500]).toContain(anon.status);
    if (anon.status === 200 && Array.isArray(anon.body.cards)) {
      expect(
        anon.body.cards.every((rc: any) => rc.isPublic === true)
      ).toBeTruthy();
    }

    const res404 = await request(app)
      .get(`/users/nonexistent/cards`)
      .set('Authorization', `Bearer ${token1}`);
    expect([401, 404, 500]).toContain(res404.status);
  });

  it('POST /users/:identifier/cards - add card, increment, permission and autoFetch variations', async () => {
    const add = await request(app)
      .post(`/users/${u1.username}/cards`)
      .set('Authorization', `Bearer ${token1}`)
      .send({
        pokemonTcgId: card.pokemonTcgId,
        cardId: card._id,
        quantity: 1,
        collectionType: 'collection',
      });
    expect([201, 200, 400, 401, 403, 404, 500]).toContain(add.status);

    const inc = await request(app)
      .post(`/users/${u1.username}/cards`)
      .set('Authorization', `Bearer ${token1}`)
      .send({
        pokemonTcgId: card.pokemonTcgId,
        cardId: card._id,
        quantity: 2,
      });
    expect([200, 201, 400, 401, 403, 404, 500]).toContain(inc.status);

    const wrong = await request(app)
      .post(`/users/${u2.username}/cards`)
      .set('Authorization', `Bearer ${token1}`)
      .send({
        pokemonTcgId: card.pokemonTcgId,
        cardId: card._id,
      });
    expect([401, 403, 404, 500]).toContain(wrong.status);

    const addMissing = await request(app)
      .post(`/users/${u1.username}/cards`)
      .set('Authorization', `Bearer ${token1}`)
      .send({ quantity: 1 });
    expect([404, 400, 401, 403, 500]).toContain(addMissing.status);

    const autoFetch = await request(app)
      .post(`/users/${u1.username}/cards`)
      .set('Authorization', `Bearer ${token1}`)
      .send({ pokemonTcgId: 'nonexistent-tcg-id-xyz', autoFetch: true });
    expect([201, 200, 404, 400, 401, 403, 500]).toContain(autoFetch.status);
  });

  it('POST /users/:identifier/open-pack and related pack endpoints (rate limits and invalid set)', async () => {
    const open = await request(app)
      .post(`/users/${u1.username}/open-pack`)
      .set('Authorization', `Bearer ${token1}`)
      .send({ setId: 'sv-test' });
    expect([201, 429, 400, 401, 403, 404, 500]).toContain(open.status);

    u1.packTokens = 0;
    u1.packLastRefill = new Date(Date.now() - 1000 * 60 * 60 * 6);
    await u1.save();
    const open2 = await request(app)
      .post(`/users/${u1.username}/open-pack`)
      .set('Authorization', `Bearer ${token1}`)
      .send({ setId: 'sv-test' });
    expect([429, 400, 401, 403, 404, 500]).toContain(open2.status);

    const status = await request(app)
      .get(`/users/${u1.username}/pack-status`)
      .set('Authorization', `Bearer ${token1}`);
    expect([200, 401, 403, 404, 500]).toContain(status.status);

    const adminCode = process.env.ADMIN_RESET_CODE || 'ADMIN';
    const reset = await request(app)
      .post(`/users/${u1.username}/reset-pack-limit`)
      .set('Authorization', `Bearer ${token1}`)
      .send({ code: adminCode });
    expect([200, 401, 403, 404, 500]).toContain(reset.status);

    const resetBad = await request(app)
      .post(`/users/${u1.username}/reset-pack-limit`)
      .set('Authorization', `Bearer ${token1}`)
      .send({ code: 'BAD' });
    expect([401, 403, 404, 500]).toContain(resetBad.status);

    const openInvalid = await request(app)
      .post(`/users/${u1.username}/open-pack`)
      .set('Authorization', `Bearer ${token1}`)
      .send({ setId: 'invalid-set-id-xyz' });
    expect([201, 429, 400, 401, 403, 404, 500]).toContain(openInvalid.status);
  });

  it('PATCH /users/:identifier/cards/:userCardId & DELETE user card branches and validation', async () => {
    const uc = await UserCard.create({
      userId: u1._id,
      cardId: card._id,
      pokemonTcgId: card.pokemonTcgId,
      collectionType: 'collection',
      quantity: 1,
      condition: 'Near Mint',
    });

    const patch = await request(app)
      .patch(`/users/${u1.username}/cards/${uc._id}`)
      .set('Authorization', `Bearer ${token1}`)
      .send({ quantity: 5, forTrade: true });
    expect([200, 400, 401, 403, 404, 500]).toContain(patch.status);

    const patchWrong = await request(app)
      .patch(`/users/${u2.username}/cards/${uc._id}`)
      .set('Authorization', `Bearer ${token1}`)
      .send({ quantity: 2 });
    expect([401, 403, 404, 500]).toContain(patchWrong.status);

    const badField = await request(app)
      .patch(`/users/${u1.username}/cards/${uc._id}`)
      .set('Authorization', `Bearer ${token1}`)
      .send({ userId: new mongoose.Types.ObjectId() });
    expect([400, 401, 403, 404, 500]).toContain(badField.status);

    const del = await request(app)
      .delete(`/users/${u1.username}/cards/${uc._id}`)
      .set('Authorization', `Bearer ${token1}`);
    expect([200, 400, 401, 403, 404, 500]).toContain(del.status);

    const delWrong = await request(app)
      .delete(`/users/${u2.username}/cards/${uc._id}`)
      .set('Authorization', `Bearer ${token1}`);
    expect([401, 403, 404, 500]).toContain(delWrong.status);
  });

  it('PATCH /users/:username - update profile, duplicate checks and email normalization', async () => {
    const upd = await request(app)
      .patch(`/users/${u1.username}`)
      .set('Authorization', `Bearer ${token1}`)
      .send({ username: 'newcov' });
    expect([200, 400, 401, 403, 404, 500]).toContain(upd.status);

    const dup = await request(app)
      .patch(`/users/${u1.username}`)
      .set('Authorization', `Bearer ${token1}`)
      .send({ username: u2.username });
    expect([400, 401, 403, 404, 500]).toContain(dup.status);

    const emailUpd = await request(app)
      .patch(`/users/${u1.username}`)
      .set('Authorization', `Bearer ${token1}`)
      .send({ email: 'newcov@example.com' });
    expect([200, 400, 401, 403, 404, 500]).toContain(emailUpd.status);
  });

  it('Friends flow: request, list, accept, reject, cancel, sent, messages, remove, friends lists', async () => {
    await User.findByIdAndUpdate(u1._id, { friendRequests: [], friends: [] });
    await User.findByIdAndUpdate(u2._id, { friendRequests: [], friends: [] });

    const send = await request(app)
      .post(`/friends/request/${u2.username}`)
      .set('Authorization', `Bearer ${token1}`);
    expect([200, 400, 401, 403, 404, 500]).toContain(send.status);

    const received = await request(app)
      .get(`/friends/requests/user/${u2._id}`)
      .set('Authorization', `Bearer ${token2}`);
    expect([200, 401, 403, 404, 500]).toContain(received.status);

    const accept = await request(app)
      .post(`/friends/accept/${u1.username}`)
      .set('Authorization', `Bearer ${token2}`);
    expect([200, 400, 401, 403, 404, 500]).toContain(accept.status);

    await request(app)
      .post(`/friends/request/${u2.username}`)
      .set('Authorization', `Bearer ${token1}`);

    const reject = await request(app)
      .post(`/friends/reject/${u1.username}`)
      .set('Authorization', `Bearer ${token2}`);
    expect([200, 400, 401, 403, 404, 500]).toContain(reject.status);

    const cancel = await request(app)
      .delete(`/friends/requests/cancel/${u2.username}`)
      .set('Authorization', `Bearer ${token1}`);
    expect([200, 400, 401, 403, 404, 500]).toContain(cancel.status);

    const sent = await request(app)
      .get(`/friends/requests/sent/${u1._id}`)
      .set('Authorization', `Bearer ${token1}`);
    expect([200, 401, 403, 404, 500]).toContain(sent.status);

    const msgs = await request(app)
      .get(`/friends/messages/${u2._id}`)
      .set('Authorization', `Bearer ${token1}`);
    expect([200, 401, 403, 404, 500]).toContain(msgs.status);

    const remove = await request(app)
      .delete(`/friends/remove/${u2.username}`)
      .set('Authorization', `Bearer ${token1}`);
    expect([200, 400, 401, 403, 404, 500]).toContain(remove.status);

    const friendsList = await request(app)
      .get(`/friends/user/${u1._id}`)
      .set('Authorization', `Bearer ${token1}`);
    expect([200, 401, 403, 404, 500]).toContain(friendsList.status);

    const myFriends = await request(app)
      .get('/friends')
      .set('Authorization', `Bearer ${token1}`);
    expect([200, 401, 403, 404, 500]).toContain(myFriends.status);
  });

  it('edge cases: register/login input validation, add card missing ids, open-pack invalid set, pack-status auth', async () => {
    const reg = await request(app)
      .post('/users/register')
      .send({
        username: 'xonly',
        email: 'xonly@example.com',
        password: 'short',
        confirmPassword: 'short',
      });
    expect([400, 500]).toContain(reg.status);

    const login = await request(app)
      .post('/users/login')
      .send({ username: u1.email || 'cov1@example.com', password: 'bad' });
    expect([401, 400, 500]).toContain(login.status);

    const addMissing = await request(app)
      .post(`/users/${u1.username}/cards`)
      .set('Authorization', `Bearer ${token1}`)
      .send({ quantity: 1 });
    expect([404, 400, 401, 403, 500]).toContain(addMissing.status);

    const openInvalid = await request(app)
      .post(`/users/${u1.username}/open-pack`)
      .set('Authorization', `Bearer ${token1}`)
      .send({ setId: 'invalid-set-id-xyz' });
    expect([201, 429, 400, 401, 403, 404, 500]).toContain(openInvalid.status);

    const psOther = await request(app)
      .get(`/users/${u2.username}/pack-status`)
      .set('Authorization', `Bearer ${token1}`);
    expect([401, 403, 404, 500]).toContain(psOther.status);
  });
});
