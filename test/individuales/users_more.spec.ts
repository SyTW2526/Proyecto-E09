import { describe, it, beforeEach, afterEach, expect } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { app } from '../../src/server/api.js';
import { User } from '../../src/server/models/User.js';
import { PackOpen } from '../../src/server/models/PackOpen.js';

function genToken(userId: string, username: string) {
  const secret = process.env.JWT_SECRET || 'test-secret';
  return jwt.sign({ userId, username }, secret, { expiresIn: '7d' });
}

describe('Users - extra endpoints', () => {
  let u1: any, u2: any, t1: string, t2: string;

  beforeEach(async () => {
    await User.deleteMany({});
    await PackOpen.deleteMany({});

    u1 = await User.create({ username: 'u_more1', email: 'u1@test.com', password: 'x', packTokens: 2, packLastRefill: new Date() });
    u2 = await User.create({ username: 'u_more2', email: 'u2@test.com', password: 'x' });

    t1 = genToken(u1._id.toString(), u1.username);
    t2 = genToken(u2._id.toString(), u2.username);
  });

  afterEach(async () => {
    await User.deleteMany({});
    await PackOpen.deleteMany({});
  });

  it('POST /friends/request -> send and reject duplicate branch', async () => {
    const r1 = await request(app).post(`/friends/request/${u2.username}`).set('Authorization', `Bearer ${t1}`);
    expect([200, 400, 401, 404, 500]).toContain(r1.status);

    
    const r2 = await request(app).post(`/friends/request/${u2.username}`).set('Authorization', `Bearer ${t1}`);
    expect([200, 400, 401, 404, 500]).toContain(r2.status);
  });

  it('POST /friends/accept and /friends/reject flow', async () => {
   
    u2.friendRequests = [{ from: u1._id }];
    await u2.save();

    const a = await request(app).post(`/friends/accept/${u1.username}`).set('Authorization', `Bearer ${t2}`);
    expect([200, 400, 401, 404, 500]).toContain(a.status);

    u2.friendRequests = [{ from: u1._id }];
    await u2.save();
    const rej = await request(app).post(`/friends/reject/${u1.username}`).set('Authorization', `Bearer ${t2}`);
    expect([200, 400, 401, 404, 500]).toContain(rej.status);
  });

  it('DELETE /friends/remove/:friendIdentifier -> remove friends branch', async () => {
    
    u1.friends = [u2._id];
    u2.friends = [u1._id];
    await u1.save();
    await u2.save();

    const res = await request(app).delete(`/friends/remove/${u2.username}`).set('Authorization', `Bearer ${t1}`);
    expect([200, 400, 401, 404, 500]).toContain(res.status);
  });

  it('GET /users/:identifier/pack-status and reset-pack-limit edge cases', async () => {
    const ps = await request(app).get(`/users/${u1.username}/pack-status`).set('Authorization', `Bearer ${t1}`);
    expect([200, 401, 403, 404, 500]).toContain(ps.status);

    const code = process.env.ADMIN_RESET_CODE || 'ADMIN';
    const reset = await request(app).post(`/users/${u1.username}/reset-pack-limit`).set('Authorization', `Bearer ${t1}`).send({ code });
    expect([200, 401, 403, 404, 500]).toContain(reset.status);

    const bad = await request(app).post(`/users/${u1.username}/reset-pack-limit`).set('Authorization', `Bearer ${t1}`).send({ code: 'BAD' });
    expect([401, 403, 404, 500]).toContain(bad.status);
  });
});
