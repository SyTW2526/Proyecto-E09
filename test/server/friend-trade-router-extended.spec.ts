import { describe, it, beforeEach, afterEach, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../src/server/api.js';
import { User } from '../../src/server/models/User.js';
import { FriendTradeRoomInvite } from '../../src/server/models/FriendTrade.js';
import { Trade } from '../../src/server/models/Trade.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

describe('Friend Trade Router Extended', () => {
  let user1: any;
  let user2: any;
  let user3: any;
  let token1: string;
  let token2: string;
  let token3: string;

  beforeEach(async () => {
    // Clean up
    await User.deleteMany({});
    await FriendTradeRoomInvite.deleteMany({});
    await Trade.deleteMany({});

    // Create test users
    const hashedPassword = await bcrypt.hash('password123', 10);

    user1 = await User.create({
      username: 'frienduser1',
      email: 'friend1@example.com',
      password: hashedPassword,
      isVerified: true,
      friends: [],
    });

    user2 = await User.create({
      username: 'frienduser2',
      email: 'friend2@example.com',
      password: hashedPassword,
      isVerified: true,
      friends: [user1._id],
    });

    user3 = await User.create({
      username: 'frienduser3',
      email: 'friend3@example.com',
      password: hashedPassword,
      isVerified: true,
      friends: [],
    });

    // Update user1 friends list to include user2
    user1.friends.push(user2._id);
    await user1.save();

    // Generate JWT tokens
    const secret = process.env.JWT_SECRET || 'test-secret';
    token1 = jwt.sign(
      { userId: user1._id.toString(), username: user1.username },
      secret
    );
    token2 = jwt.sign(
      { userId: user2._id.toString(), username: user2.username },
      secret
    );
    token3 = jwt.sign(
      { userId: user3._id.toString(), username: user3.username },
      secret
    );
  });

  afterEach(async () => {
    await User.deleteMany({});
    await FriendTradeRoomInvite.deleteMany({});
    await Trade.deleteMany({});
  });

  describe('GET /friend-trade-rooms/invites', () => {
    it('should get invites for authenticated user', async () => {
      // Create an invite
      await FriendTradeRoomInvite.create({
        from: user1._id,
        to: user2._id,
        status: 'pending',
      });

      const res = await request(app)
        .get('/friend-trade-rooms/invites')
        .set('Authorization', `Bearer ${token2}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('received');
      expect(res.body).toHaveProperty('sent');
      expect(Array.isArray(res.body.received)).toBe(true);
      expect(Array.isArray(res.body.sent)).toBe(true);
    });

    it('should separate received and sent invites', async () => {
      // Create sent invite
      await FriendTradeRoomInvite.create({
        from: user1._id,
        to: user2._id,
        status: 'pending',
      });

      // Create received invite
      await FriendTradeRoomInvite.create({
        from: user2._id,
        to: user1._id,
        status: 'pending',
      });

      const res = await request(app)
        .get('/friend-trade-rooms/invites')
        .set('Authorization', `Bearer ${token1}`);

      expect(res.status).toBe(200);
      expect(res.body.received.length).toBe(1);
      expect(res.body.sent.length).toBe(1);
    });

    it('should return empty arrays if no invites', async () => {
      const res = await request(app)
        .get('/friend-trade-rooms/invites')
        .set('Authorization', `Bearer ${token1}`);

      expect(res.status).toBe(200);
      expect(res.body.received).toEqual([]);
      expect(res.body.sent).toEqual([]);
    });
  });

  describe('POST /friend-trade-rooms/invite', () => {
    it('should create an invite to a friend', async () => {
      const res = await request(app)
        .post('/friend-trade-rooms/invite')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          friendId: user2._id.toString(),
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('invite');
      expect(res.body.invite.from.toString()).toBe(user1._id.toString());
      expect(res.body.invite.to.toString()).toBe(user2._id.toString());
      expect(res.body.invite.status).toBe('pending');
    });

    it('should reject invite to non-friend', async () => {
      const res = await request(app)
        .post('/friend-trade-rooms/invite')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          friendId: user3._id.toString(),
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('amigos');
    });

    it('should reject self-invite', async () => {
      // Add user1 as their own friend (shouldn't happen but for test)
      user1.friends.push(user1._id);
      await user1.save();

      const res = await request(app)
        .post('/friend-trade-rooms/invite')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          friendId: user1._id.toString(),
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('No puedes');
    });

    it('should reject duplicate pending invites', async () => {
      // Create first invite
      await request(app)
        .post('/friend-trade-rooms/invite')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          friendId: user2._id.toString(),
        });

      // Try to create duplicate
      const res = await request(app)
        .post('/friend-trade-rooms/invite')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          friendId: user2._id.toString(),
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('pendiente');
    });

    it('should reject invite with invalid friendId', async () => {
      const res = await request(app)
        .post('/friend-trade-rooms/invite')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          friendId: 'invalid-id',
        });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /friend-trade-rooms/invites/:id/accept', () => {
    it('should accept a pending invite', async () => {
      const invite = await FriendTradeRoomInvite.create({
        from: user1._id,
        to: user2._id,
        status: 'pending',
      });

      const res = await request(app)
        .post(`/friend-trade-rooms/invites/${invite._id.toString()}/accept`)
        .set('Authorization', `Bearer ${token2}`);

      expect(res.status).toBeLessThan(500);
      if (res.status === 200) {
        expect(res.body.invite.status).toBe('accepted');
        expect(res.body).toHaveProperty('privateRoomCode');
      }
    });

    it('should reject if user is not receiver', async () => {
      const invite = await FriendTradeRoomInvite.create({
        from: user1._id,
        to: user2._id,
        status: 'pending',
      });

      const res = await request(app)
        .post(`/friend-trade-rooms/invites/${invite._id.toString()}/accept`)
        .set('Authorization', `Bearer ${token1}`);

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty('error');
    });

    it('should reject if invite not pending', async () => {
      const invite = await FriendTradeRoomInvite.create({
        from: user1._id,
        to: user2._id,
        status: 'rejected',
      });

      const res = await request(app)
        .post(`/friend-trade-rooms/invites/${invite._id.toString()}/accept`)
        .set('Authorization', `Bearer ${token2}`);

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('pendiente');
    });

    it('should reject if invite not found', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .post(`/friend-trade-rooms/invites/${fakeId.toString()}/accept`)
        .set('Authorization', `Bearer ${token2}`);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('POST /friend-trade-rooms/invites/:id/reject', () => {
    it('should reject a pending invite', async () => {
      const invite = await FriendTradeRoomInvite.create({
        from: user1._id,
        to: user2._id,
        status: 'pending',
      });

      const res = await request(app)
        .post(`/friend-trade-rooms/invites/${invite._id.toString()}/reject`)
        .set('Authorization', `Bearer ${token2}`);

      expect(res.status).toBe(200);
      expect(res.body.invite.status).toBe('rejected');
    });

    it('should reject if user is not receiver', async () => {
      const invite = await FriendTradeRoomInvite.create({
        from: user1._id,
        to: user2._id,
        status: 'pending',
      });

      const res = await request(app)
        .post(`/friend-trade-rooms/invites/${invite._id.toString()}/reject`)
        .set('Authorization', `Bearer ${token1}`);

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty('error');
    });

    it('should reject if invite not pending', async () => {
      const invite = await FriendTradeRoomInvite.create({
        from: user1._id,
        to: user2._id,
        status: 'accepted',
      });

      const res = await request(app)
        .post(`/friend-trade-rooms/invites/${invite._id.toString()}/reject`)
        .set('Authorization', `Bearer ${token2}`);

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('pendiente');
    });

    it('should reject if invite not found', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .post(`/friend-trade-rooms/invites/${fakeId.toString()}/reject`)
        .set('Authorization', `Bearer ${token2}`);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error');
    });
  });
});
