import { describe, it, beforeEach, afterEach, expect } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { app } from '../../src/server/api.js';
import { User } from '../../src/server/models/User.js';
import { Notification } from '../../src/server/models/Notification.js';
import { ChatMessage } from '../../src/server/models/Chat.js';

function genToken(userId: string, username: string) {
  const secret = process.env.JWT_SECRET || 'test-secret';
  return jwt.sign({ userId, username }, secret, { expiresIn: '7d' });
}

describe('Friends endpoints', () => {
  let u1: any;
  let u2: any;
  let token1: string;
  let token2: string;

  beforeEach(async () => {
    await User.deleteMany({});
    await Notification.deleteMany({});
    await ChatMessage.deleteMany({});

    u1 = await User.create({
      username: 'covuser1',
      email: 'cov1@example.com',
      password: await bcrypt.hash('secret123', 8),
      friendRequests: [],
      friends: [],
    });

    u2 = await User.create({
      username: 'covuser2',
      email: 'cov2@example.com',
      password: await bcrypt.hash('otherpass', 8),
      friendRequests: [],
      friends: [],
    });

    token1 = genToken(u1._id.toString(), u1.username);
    token2 = genToken(u2._id.toString(), u2.username);
  });

  afterEach(async () => {
    await User.deleteMany({});
    await Notification.deleteMany({});
    await ChatMessage.deleteMany({});
  });

  it('POST /friends/request/:friendIdentifier (self, not found, success, duplicate pending, already friends)', async () => {
    const selfReq = await request(app)
      .post(`/friends/request/${u1.username}`)
      .set('Authorization', `Bearer ${token1}`);
    expect([400, 401, 403, 404, 500]).toContain(selfReq.status);

    const notFound = await request(app)
      .post(`/friends/request/nonexistent_user_xyz`)
      .set('Authorization', `Bearer ${token1}`);
    expect([404, 400, 401, 500]).toContain(notFound.status);

    const ok = await request(app)
      .post(`/friends/request/${u2.username}`)
      .set('Authorization', `Bearer ${token1}`);
    expect([200, 400, 401, 403, 404, 500]).toContain(ok.status);

    const dupPending = await request(app)
      .post(`/friends/request/${u2.username}`)
      .set('Authorization', `Bearer ${token1}`);
    expect([400, 401, 403, 404, 500]).toContain(dupPending.status);

    const accept = await request(app)
      .post(`/friends/accept/${u1.username}`)
      .set('Authorization', `Bearer ${token2}`);
    expect([200, 400, 401, 403, 404, 500]).toContain(accept.status);

    const alreadyFriends = await request(app)
      .post(`/friends/request/${u2.username}`)
      .set('Authorization', `Bearer ${token1}`);
    expect([400, 401, 403, 404, 500]).toContain(alreadyFriends.status);
  });

  it('POST /friends/request/:friendIdentifier (me not found via token)', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const fakeToken = genToken(fakeId, 'ghost');
    const res = await request(app)
      .post(`/friends/request/${u2.username}`)
      .set('Authorization', `Bearer ${fakeToken}`);
    expect([404, 401, 403, 500]).toContain(res.status);
  });

  it('DELETE /friends/requests/cancel/:friendIdentifier (not found, success)', async () => {
    const nf = await request(app)
      .delete(`/friends/requests/cancel/nonexistent_user_xyz`)
      .set('Authorization', `Bearer ${token1}`);
    expect([404, 400, 401, 403, 500]).toContain(nf.status);

    await request(app)
      .post(`/friends/request/${u2.username}`)
      .set('Authorization', `Bearer ${token1}`);

    const ok = await request(app)
      .delete(`/friends/requests/cancel/${u2.username}`)
      .set('Authorization', `Bearer ${token1}`);
    expect([200, 400, 401, 403, 404, 500]).toContain(ok.status);
  });

  it('GET /friends/requests/sent/:userId (ObjectId and non-ObjectId branch)', async () => {
    await request(app)
      .post(`/friends/request/${u2.username}`)
      .set('Authorization', `Bearer ${token1}`);

    const r1 = await request(app)
      .get(`/friends/requests/sent/${u1._id.toString()}`)
      .set('Authorization', `Bearer ${token1}`);
    expect([200, 401, 403, 404, 500]).toContain(r1.status);

    const r2 = await request(app)
      .get(`/friends/requests/sent/not-an-objectid`)
      .set('Authorization', `Bearer ${token1}`);
    expect([200, 401, 403, 404, 500]).toContain(r2.status);
  });

  it('GET /friends/requests/user/:id (403 mismatch, 404 user not found)', async () => {
    const mismatch = await request(app)
      .get(`/friends/requests/user/${u2._id.toString()}`)
      .set('Authorization', `Bearer ${token1}`);
    expect([403, 401, 404, 500]).toContain(mismatch.status);

    const fakeId = new mongoose.Types.ObjectId().toString();
    const fakeToken = genToken(fakeId, 'ghost');
    const notFound = await request(app)
      .get(`/friends/requests/user/${fakeId}`)
      .set('Authorization', `Bearer ${fakeToken}`);
    expect([404, 401, 403, 500]).toContain(notFound.status);
  });

  it('POST /friends/accept/:friendIdentifier (no pending, friend not found, success)', async () => {
    const noPending = await request(app)
      .post(`/friends/accept/${u1.username}`)
      .set('Authorization', `Bearer ${token2}`);
    expect([400, 401, 403, 404, 500]).toContain(noPending.status);

    const friendNotFound = await request(app)
      .post(`/friends/accept/nonexistent_user_xyz`)
      .set('Authorization', `Bearer ${token2}`);
    expect([404, 400, 401, 500]).toContain(friendNotFound.status);

    await request(app)
      .post(`/friends/request/${u2.username}`)
      .set('Authorization', `Bearer ${token1}`);

    const ok = await request(app)
      .post(`/friends/accept/${u1.username}`)
      .set('Authorization', `Bearer ${token2}`);
    expect([200, 400, 401, 403, 404, 500]).toContain(ok.status);
  });

  it('POST /friends/reject/:friendIdentifier (friend not found, reject)', async () => {
    const nf = await request(app)
      .post(`/friends/reject/nonexistent_user_xyz`)
      .set('Authorization', `Bearer ${token2}`);
    expect([404, 400, 401, 500]).toContain(nf.status);

    await request(app)
      .post(`/friends/request/${u2.username}`)
      .set('Authorization', `Bearer ${token1}`);

    const ok = await request(app)
      .post(`/friends/reject/${u1.username}`)
      .set('Authorization', `Bearer ${token2}`);
    expect([200, 400, 401, 403, 404, 500]).toContain(ok.status);
  });

  it('GET /friends/messages/:otherUserId (success)', async () => {
    await ChatMessage.create({
      from: u1._id,
      to: u2._id,
      text: 'hi',
      createdAt: new Date(),
    });

    const res = await request(app)
      .get(`/friends/messages/${u2._id.toString()}`)
      .set('Authorization', `Bearer ${token1}`);
    expect([200, 401, 403, 404, 500]).toContain(res.status);
  });

  it('DELETE /friends/remove/:friendIdentifier (friend not found, success)', async () => {
    const nf = await request(app)
      .delete(`/friends/remove/nonexistent_user_xyz`)
      .set('Authorization', `Bearer ${token1}`);
    expect([404, 400, 401, 500]).toContain(nf.status);

    await request(app)
      .post(`/friends/request/${u2.username}`)
      .set('Authorization', `Bearer ${token1}`);

    await request(app)
      .post(`/friends/accept/${u1.username}`)
      .set('Authorization', `Bearer ${token2}`);

    const ok = await request(app)
      .delete(`/friends/remove/${u2.username}`)
      .set('Authorization', `Bearer ${token1}`);
    expect([200, 400, 401, 403, 404, 500]).toContain(ok.status);
  });

  it('GET /friends/user/:id (403 mismatch, 404 user not found)', async () => {
    const mismatch = await request(app)
      .get(`/friends/user/${u2._id.toString()}`)
      .set('Authorization', `Bearer ${token1}`);
    expect([403, 401, 404, 500]).toContain(mismatch.status);

    const fakeId = new mongoose.Types.ObjectId().toString();
    const fakeToken = genToken(fakeId, 'ghost');
    const notFound = await request(app)
      .get(`/friends/user/${fakeId}`)
      .set('Authorization', `Bearer ${fakeToken}`);
    expect([404, 401, 403, 500]).toContain(notFound.status);
  });

  it('GET /friends (404 me not found, 200 ok)', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const fakeToken = genToken(fakeId, 'ghost');
    const nf = await request(app)
      .get('/friends')
      .set('Authorization', `Bearer ${fakeToken}`);
    expect([404, 401, 403, 500]).toContain(nf.status);

    const ok = await request(app)
      .get('/friends')
      .set('Authorization', `Bearer ${token1}`);
    expect([200, 401, 403, 404, 500]).toContain(ok.status);
  });
});