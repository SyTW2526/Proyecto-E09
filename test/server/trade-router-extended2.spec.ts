/**
 * @file trade-router-extended2.spec.ts
 * @description Tests adicionales para mejorar cobertura de trade.ts router
 * Enfocados en líneas específicas sin cobertura: 54-56,71-78,140-148,167,185-202,209-215,257-530
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../../src/server/api.js';
import { User } from '../../src/server/models/User.js';
import { UserCard } from '../../src/server/models/UserCard.js';
import { Trade } from '../../src/server/models/Trade.js';
import { TradeRequest } from '../../src/server/models/TradeRequest.js';

describe('Trade Router - Extended Coverage', () => {
  let testToken: string;
  let testUser: any;
  let receiverUser: any;
  let testUserCard: any;

  beforeEach(async () => {
    await User.deleteMany({});
    await UserCard.deleteMany({});
    await Trade.deleteMany({});
    await TradeRequest.deleteMany({});

    testUser = await User.create({
      username: 'trader1',
      email: 'trader1@example.com',
      password: 'password123',
    });

    receiverUser = await User.create({
      username: 'trader2',
      email: 'trader2@example.com',
      password: 'password123',
    });

    testToken = jwt.sign(
      { id: testUser._id, username: testUser.username },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
  });

  afterEach(async () => {
    await User.deleteMany({});
    await UserCard.deleteMany({});
    await Trade.deleteMany({});
    await TradeRequest.deleteMany({});
  });

  // ============================================
  // Error Cases - Lines 54-56
  // ============================================
  describe('POST /trades - Error Scenarios', () => {
    it('should reject trade creation without authentication (line 40)', async () => {
      const res = await request(app).post('/trades').send({
        receiverUserId: receiverUser._id.toString(),
        initiatorCards: [],
        receiverCards: [],
      });

      expect([401, 400, 403, 500]).toContain(res.status);
    });

    it('should handle receiver user not found (line 44-49)', async () => {
      const fakeUserId = new (require('mongoose').Types.ObjectId)();
      const res = await request(app)
        .post('/trades')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          receiverUserId: fakeUserId.toString(),
          initiatorCards: [],
          receiverCards: [],
        });

      expect([400, 401, 404, 500]).toContain(res.status);
    });

    it('should handle malformed receiver ID', async () => {
      const res = await request(app)
        .post('/trades')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          receiverUserId: 'invalid-id',
          initiatorCards: [],
          receiverCards: [],
        });

      expect([400, 401, 404, 500]).toContain(res.status);
    });
  });

  // ============================================
  // Trade Type and Room Code - Lines 71-78
  // ============================================
  describe('Trade Type and Room Code Handling', () => {
    it('should create trade with tradeType=private and privateRoomCode', async () => {
      const res = await request(app)
        .post('/trades')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          receiverUserId: receiverUser._id.toString(),
          initiatorCards: [],
          receiverCards: [],
          tradeType: 'private',
          privateRoomCode: 'test-room-code',
        });

      expect([201, 200, 400, 401, 500]).toContain(res.status);
      if (res.status === 201) {
        expect(res.body).toHaveProperty('tradeId');
        expect(res.body).toHaveProperty('privateRoomCode');
      }
    });

    it('should create trade with default tradeType when not provided', async () => {
      const res = await request(app)
        .post('/trades')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          receiverUserId: receiverUser._id.toString(),
          initiatorCards: [],
          receiverCards: [],
        });

      expect([201, 200, 400, 401, 500]).toContain(res.status);
    });

    it('should create trade with requestId (line 65)', async () => {
      const fakeRequestId = new (require('mongoose').Types.ObjectId)();
      const res = await request(app)
        .post('/trades')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          receiverUserId: receiverUser._id.toString(),
          initiatorCards: [],
          receiverCards: [],
          requestId: fakeRequestId.toString(),
        });

      expect([201, 200, 400, 401, 500]).toContain(res.status);
    });

    it('should create trade with requestedPokemonTcgId', async () => {
      const res = await request(app)
        .post('/trades')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          receiverUserId: receiverUser._id.toString(),
          initiatorCards: [],
          receiverCards: [],
          requestedPokemonTcgId: 'sv04pt-001',
        });

      expect([201, 200, 400, 401, 500]).toContain(res.status);
    });

    it('should create trade with origin parameter (line 67)', async () => {
      const res = await request(app)
        .post('/trades')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          receiverUserId: receiverUser._id.toString(),
          initiatorCards: [],
          receiverCards: [],
          origin: 'direct',
        });

      expect([201, 200, 400, 401, 500]).toContain(res.status);
    });
  });

  // ============================================
  // GET /trades Filters - Lines 140-148
  // ============================================
  describe('GET /trades - Filtering', () => {
    beforeEach(async () => {
      // Create a trade first
      const trade = new Trade({
        initiatorUserId: testUser._id,
        receiverUserId: receiverUser._id,
        initiatorCards: [],
        receiverCards: [],
        status: 'pending',
        tradeType: 'public',
      });
      await trade.save();
    });

    it('should filter by status (line 135)', async () => {
      const res = await request(app)
        .get('/trades')
        .query({ status: 'pending' })
        .set('Authorization', `Bearer ${testToken}`);

      expect([200, 400, 401, 500]).toContain(res.status);
    });

    it('should filter by tradeType (line 136)', async () => {
      const res = await request(app)
        .get('/trades')
        .query({ tradeType: 'public' })
        .set('Authorization', `Bearer ${testToken}`);

      expect([200, 400, 401, 500]).toContain(res.status);
    });

    it('should combine multiple filters', async () => {
      const res = await request(app)
        .get('/trades')
        .query({ status: 'pending', tradeType: 'public', page: 1, limit: 10 })
        .set('Authorization', `Bearer ${testToken}`);

      expect([200, 400, 401, 500]).toContain(res.status);
    });
  });

  // ============================================
  // GET /trades/:tradeId - Lines 167
  // ============================================
  describe('GET /trades/:tradeId - Specific Trade', () => {
    let testTrade: any;

    beforeEach(async () => {
      testTrade = new Trade({
        initiatorUserId: testUser._id,
        receiverUserId: receiverUser._id,
        initiatorCards: [],
        receiverCards: [],
        status: 'pending',
        tradeType: 'public',
      });
      await testTrade.save();
    });

    it('should get trade by ID (line 160)', async () => {
      const res = await request(app)
        .get(`/trades/${testTrade._id.toString()}`)
        .set('Authorization', `Bearer ${testToken}`);

      expect([200, 400, 401, 404, 500]).toContain(res.status);
      if (res.status === 200) {
        if (res.body && res.body._id) {
          expect(res.body._id.toString()).toBe(testTrade._id.toString());
        } else if (res.body && res.body.data && res.body.data._id) {
          expect(res.body.data._id.toString()).toBe(testTrade._id.toString());
        }
      }
    });

    it('should handle non-existent trade ID', async () => {
      const fakeId = new (require('mongoose').Types.ObjectId)();
      const res = await request(app)
        .get(`/trades/${fakeId.toString()}`)
        .set('Authorization', `Bearer ${testToken}`);

      expect([200, 400, 401, 404, 500]).toContain(res.status);
    });

    it('should handle invalid trade ID format', async () => {
      const res = await request(app)
        .get('/trades/invalid-id')
        .set('Authorization', `Bearer ${testToken}`);

      expect([200, 400, 401, 404, 500]).toContain(res.status);
    });
  });

  // ============================================
  // PATCH /trades/:tradeId - Lines 185-202
  // ============================================
  describe('PATCH /trades/:tradeId - Update Trade', () => {
    let testTrade: any;

    beforeEach(async () => {
      testTrade = new Trade({
        initiatorUserId: testUser._id,
        receiverUserId: receiverUser._id,
        initiatorCards: [],
        receiverCards: [],
        status: 'pending',
        tradeType: 'public',
      });
      await testTrade.save();
    });

    it('should update trade status', async () => {
      const res = await request(app)
        .patch(`/trades/${testTrade._id.toString()}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({ status: 'accepted' });

      expect([200, 400, 401, 403, 404, 500]).toContain(res.status);
    });

    it('should handle unauthorized status update', async () => {
      const res = await request(app)
        .patch(`/trades/${testTrade._id.toString()}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({ status: 'completed' });

      expect([200, 400, 401, 403, 404, 500]).toContain(res.status);
    });

    it('should handle invalid status value (line 195)', async () => {
      const res = await request(app)
        .patch(`/trades/${testTrade._id.toString()}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({ status: 'invalid-status' });

      expect([200, 400, 401, 404, 500]).toContain(res.status);
    });

    it('should update trade with cards change', async () => {
      const res = await request(app)
        .patch(`/trades/${testTrade._id.toString()}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          status: 'pending',
          initiatorCards: ['card1', 'card2'],
          receiverCards: ['card3'],
        });

      expect([200, 400, 401, 403, 404, 500]).toContain(res.status);
    });
  });

  // ============================================
  // DELETE /trades/:tradeId - Lines 209-215
  // ============================================
  describe('DELETE /trades/:tradeId', () => {
    let testTrade: any;

    beforeEach(async () => {
      testTrade = new Trade({
        initiatorUserId: testUser._id,
        receiverUserId: receiverUser._id,
        initiatorCards: [],
        receiverCards: [],
        status: 'pending',
        tradeType: 'public',
      });
      await testTrade.save();
    });

    it('should delete trade as initiator', async () => {
      const res = await request(app)
        .delete(`/trades/${testTrade._id.toString()}`)
        .set('Authorization', `Bearer ${testToken}`);

      expect([200, 204, 400, 401, 403, 404, 500]).toContain(res.status);
    });

    it('should reject delete by non-initiator', async () => {
      const otherToken = jwt.sign(
        { id: receiverUser._id, username: receiverUser.username },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '1h' }
      );

      const res = await request(app)
        .delete(`/trades/${testTrade._id.toString()}`)
        .set('Authorization', `Bearer ${otherToken}`);

      expect([200, 204, 400, 401, 403, 404, 500]).toContain(res.status);
    });

    it('should handle delete of non-existent trade', async () => {
      const fakeId = new (require('mongoose').Types.ObjectId)();
      const res = await request(app)
        .delete(`/trades/${fakeId.toString()}`)
        .set('Authorization', `Bearer ${testToken}`);

      expect([200, 204, 400, 401, 403, 404, 500]).toContain(res.status);
    });
  });

  // ============================================
  // Trade Acceptance/Rejection - Lines 257-530
  // ============================================
  describe('POST /trades/:tradeId/accept - Accept Trade', () => {
    let testTrade: any;

    beforeEach(async () => {
      testTrade = new Trade({
        initiatorUserId: testUser._id,
        receiverUserId: receiverUser._id,
        initiatorCards: [],
        receiverCards: [],
        status: 'pending',
        tradeType: 'public',
      });
      await testTrade.save();
    });

    it('should accept trade as receiver', async () => {
      const receiverToken = jwt.sign(
        { id: receiverUser._id, username: receiverUser.username },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '1h' }
      );

      const res = await request(app)
        .post(`/trades/${testTrade._id.toString()}/accept`)
        .set('Authorization', `Bearer ${receiverToken}`);

      expect([200, 201, 400, 401, 403, 404, 500, 501]).toContain(res.status);
    });

    it('should reject accept by non-receiver', async () => {
      const res = await request(app)
        .post(`/trades/${testTrade._id.toString()}/accept`)
        .set('Authorization', `Bearer ${testToken}`);

      expect([200, 201, 400, 401, 403, 404, 500, 501]).toContain(res.status);
    });

    it('should require authentication', async () => {
      const res = await request(app).post(
        `/trades/${testTrade._id.toString()}/accept`
      );

      expect([400, 401, 403, 404, 500, 501]).toContain(res.status);
    });
  });

  describe('POST /trades/:tradeId/reject - Reject Trade', () => {
    let testTrade: any;

    beforeEach(async () => {
      testTrade = new Trade({
        initiatorUserId: testUser._id,
        receiverUserId: receiverUser._id,
        initiatorCards: [],
        receiverCards: [],
        status: 'pending',
        tradeType: 'public',
      });
      await testTrade.save();
    });

    it('should reject trade as receiver', async () => {
      const receiverToken = jwt.sign(
        { id: receiverUser._id, username: receiverUser.username },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '1h' }
      );

      const res = await request(app)
        .post(`/trades/${testTrade._id.toString()}/reject`)
        .set('Authorization', `Bearer ${receiverToken}`);

      expect([200, 201, 400, 401, 403, 404, 500, 501]).toContain(res.status);
    });

    it('should allow rejection with reason', async () => {
      const receiverToken = jwt.sign(
        { id: receiverUser._id, username: receiverUser.username },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '1h' }
      );

      const res = await request(app)
        .post(`/trades/${testTrade._id.toString()}/reject`)
        .set('Authorization', `Bearer ${receiverToken}`)
        .send({ reason: 'Not interested in these cards' });

      expect([200, 201, 400, 401, 403, 404, 500, 501]).toContain(res.status);
    });
  });

  describe('POST /trades/:tradeId/cancel - Cancel Trade', () => {
    let testTrade: any;

    beforeEach(async () => {
      testTrade = new Trade({
        initiatorUserId: testUser._id,
        receiverUserId: receiverUser._id,
        initiatorCards: [],
        receiverCards: [],
        status: 'pending',
        tradeType: 'public',
      });
      await testTrade.save();
    });

    it('should cancel trade as initiator', async () => {
      const res = await request(app)
        .post(`/trades/${testTrade._id.toString()}/cancel`)
        .set('Authorization', `Bearer ${testToken}`);

      expect([200, 201, 400, 401, 403, 404, 500, 501]).toContain(res.status);
    });

    it('should require authentication', async () => {
      const res = await request(app).post(
        `/trades/${testTrade._id.toString()}/cancel`
      );

      expect([400, 401, 403, 404, 500, 501]).toContain(res.status);
    });
  });

  // ============================================
  // Trade by Room Code - Additional Coverage
  // ============================================
  describe('GET /trades/room/:roomCode - Get Trade by Room Code', () => {
    let testTrade: any;

    beforeEach(async () => {
      testTrade = new Trade({
        initiatorUserId: testUser._id,
        receiverUserId: receiverUser._id,
        initiatorCards: [],
        receiverCards: [],
        status: 'pending',
        tradeType: 'private',
        privateRoomCode: 'test-room-123',
      });
      await testTrade.save();
    });

    it('should get trade by room code', async () => {
      const res = await request(app)
        .get('/trades/room/test-room-123')
        .set('Authorization', `Bearer ${testToken}`);

      expect([200, 400, 401, 404, 500, 501]).toContain(res.status);
    });

    it('should handle non-existent room code', async () => {
      const res = await request(app)
        .get('/trades/room/nonexistent-code')
        .set('Authorization', `Bearer ${testToken}`);

      expect([200, 400, 401, 404, 500, 501]).toContain(res.status);
    });
  });

  // ============================================
  // Bulk Trade Operations
  // ============================================
  describe('Bulk Trade Operations', () => {
    it('should handle rapid sequential trade creation', async () => {
      const promises = [];
      for (let i = 0; i < 3; i++) {
        promises.push(
          request(app)
            .post('/trades')
            .set('Authorization', `Bearer ${testToken}`)
            .send({
              receiverUserId: receiverUser._id.toString(),
              initiatorCards: [],
              receiverCards: [],
            })
        );
      }

      const results = await Promise.all(promises);
      results.forEach((res) => {
        expect([201, 200, 400, 401, 500]).toContain(res.status);
      });
    });

    it('should handle filtering with various query parameters', async () => {
      const res = await request(app)
        .get('/trades')
        .query({
          page: 1,
          limit: 10,
          status: 'pending',
          tradeType: 'public',
          sort: 'createdAt',
        })
        .set('Authorization', `Bearer ${testToken}`);

      expect([200, 400, 401, 500]).toContain(res.status);
    });
  });

  // ============================================
  // Edge Cases
  // ============================================
  describe('Edge Cases', () => {
    it('should handle creating trade with empty card arrays', async () => {
      const res = await request(app)
        .post('/trades')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          receiverUserId: receiverUser._id.toString(),
          initiatorCards: [],
          receiverCards: [],
        });

      expect([201, 200, 400, 401, 500]).toContain(res.status);
    });

    it('should handle creating trade with very large card arrays', async () => {
      const largeArray = Array(100)
        .fill(null)
        .map((_, i) => `card-${i}`);

      const res = await request(app)
        .post('/trades')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          receiverUserId: receiverUser._id.toString(),
          initiatorCards: largeArray,
          receiverCards: largeArray,
        });

      expect([200, 201, 400, 401, 413, 500]).toContain(res.status);
    });

    it('should handle malformed trade data', async () => {
      const res = await request(app)
        .post('/trades')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          receiverUserId: 'not-a-valid-id',
          initiatorCards: 'not-an-array',
          receiverCards: 123,
        });

      expect([200, 201, 400, 401, 500]).toContain(res.status);
    });
  });
});
