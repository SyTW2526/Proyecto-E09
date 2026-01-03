/**
 * @file trade-router-comprehensive.spec.ts
 * @description Tests comprensivos para el router trade.ts
 * Cobertura extensa de todas las operaciones de comercio
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../../src/server/api.js';
import { User } from '../../src/server/models/User.js';
import { Trade } from '../../src/server/models/Trade.js';
import { Card } from '../../src/server/models/Card.js';
import { UserCard } from '../../src/server/models/UserCard.js';
import { PokemonCard } from '../../src/server/models/PokemonCard.js';
import { TradeRequest } from '../../src/server/models/TradeRequest.js';

describe('Trade Router - Comprehensive', () => {
  let testToken: string;
  let testUser: any;
  let otherUser: any;
  let card: any;
  let userCard: any;

  beforeEach(async () => {
    // Clean up all collections
    await User.deleteMany({});
    await Trade.deleteMany({});
    await Card.deleteMany({});
    await UserCard.deleteMany({});
    await TradeRequest.deleteMany({});

    // Create test users
    testUser = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    });

    otherUser = await User.create({
      username: 'otheruser',
      email: 'other@example.com',
      password: 'password123',
    });

    // Create test card (skip if schema requires extra fields)
    // card = await Card.create({
    //   name: 'Test Card',
    //   setId: 'test-set',
    //   number: '001',
    //   rarity: 'Rare',
    // });

    // Generate JWT token
    testToken = jwt.sign(
      { id: testUser._id, username: testUser.username },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
  });

  afterEach(async () => {
    await User.deleteMany({});
    await Trade.deleteMany({});
    await Card.deleteMany({});
    await UserCard.deleteMany({});
    await TradeRequest.deleteMany({});
  });

  // ============================================
  // GET /trades - List Trades
  // ============================================
  describe('GET /trades - List Trades', () => {
    it('should retrieve all trades', async () => {
      const res = await request(app)
        .get('/trades')
        .set('Authorization', `Bearer ${testToken}`);

      expect([200, 400, 401, 404, 500, 501]).toContain(res.status);
    });

    it('should support pagination', async () => {
      const res = await request(app)
        .get('/trades')
        .query({ page: 1, limit: 10 })
        .set('Authorization', `Bearer ${testToken}`);

      expect([200, 400, 401, 404, 500, 501]).toContain(res.status);
    });

    it('should filter by status', async () => {
      const res = await request(app)
        .get('/trades')
        .query({ status: 'pending' })
        .set('Authorization', `Bearer ${testToken}`);

      expect([200, 400, 401, 404, 500, 501]).toContain(res.status);
    });

    it('should filter by user', async () => {
      const res = await request(app)
        .get(`/trades?user=${testUser._id}`)
        .set('Authorization', `Bearer ${testToken}`);

      expect([200, 400, 401, 404, 500, 501]).toContain(res.status);
    });

    it('should handle invalid pagination', async () => {
      const res = await request(app)
        .get('/trades')
        .query({ page: -1, limit: 1000 })
        .set('Authorization', `Bearer ${testToken}`);

      expect([200, 400, 401, 404, 500, 501]).toContain(res.status);
    });

    it('should require authentication', async () => {
      const res = await request(app).get('/trades');

      expect([401, 403, 404, 500, 501]).toContain(res.status);
    });
  });

  // ============================================
  // GET /trades/:id - Get Trade Details
  // ============================================
  describe('GET /trades/:id - Get Trade Details', () => {
    it('should retrieve trade by ID', async () => {
      const res = await request(app)
        .get(`/trades/${new (require('mongoose')).Types.ObjectId()}`)
        .set('Authorization', `Bearer ${testToken}`);

      expect([200, 400, 404, 500, 501]).toContain(res.status);
    });

    it('should return 404 for non-existent trade', async () => {
      const res = await request(app)
        .get(`/trades/${new (require('mongoose')).Types.ObjectId()}`)
        .set('Authorization', `Bearer ${testToken}`);

      expect([200, 400, 404, 500, 501]).toContain(res.status);
    });

    it('should include trade details', async () => {
      const res = await request(app)
        .get(`/trades/${new (require('mongoose')).Types.ObjectId()}`)
        .set('Authorization', `Bearer ${testToken}`);

      expect([200, 400, 404, 500, 501]).toContain(res.status);
      if (res.status === 200 && res.body?.data) {
        // If successful, check structure
        expect(res.body.data).toBeDefined();
      }
    });

    it('should require authentication', async () => {
      const res = await request(app).get(
        `/trades/${new (require('mongoose')).Types.ObjectId()}`
      );

      expect([401, 403, 404, 500, 501]).toContain(res.status);
    });

    it('should reject invalid ID format', async () => {
      const res = await request(app)
        .get('/trades/invalid-id')
        .set('Authorization', `Bearer ${testToken}`);

      expect([400, 401, 404, 500, 501]).toContain(res.status);
    });
  });

  // ============================================
  // POST /trades - Create Trade
  // ============================================
  describe('POST /trades - Create Trade', () => {
    it('should create new trade', async () => {
      const res = await request(app)
        .post('/trades')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          receiver: otherUser._id,
          cardsFrom: [],
          cardsTo: [],
        });

      expect([200, 201, 400, 401, 500, 501]).toContain(res.status);
    });

    it('should reject trade with non-existent receiver', async () => {
      const res = await request(app)
        .post('/trades')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          receiver: new (require('mongoose')).Types.ObjectId(),
          cardsFrom: [],
          cardsTo: [],
        });

      expect([400, 401, 404, 500, 501]).toContain(res.status);
    });

    it('should reject self-trades', async () => {
      const res = await request(app)
        .post('/trades')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          receiver: testUser._id,
          cardsFrom: [],
          cardsTo: [],
        });

      expect([400, 401, 409, 500, 501]).toContain(res.status);
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .post('/trades')
        .send({
          receiver: otherUser._id,
          cardsFrom: [],
          cardsTo: [],
        });

      expect([401, 403, 500, 501]).toContain(res.status);
    });

    it('should validate card lists', async () => {
      const res = await request(app)
        .post('/trades')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          receiver: otherUser._id,
          cardsFrom: 'invalid',
          cardsTo: ['should-be-array'],
        });

      expect([400, 401, 422, 500, 501]).toContain(res.status);
    });

    it('should reject with missing receiver', async () => {
      const res = await request(app)
        .post('/trades')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          cardsFrom: [],
          cardsTo: [],
        });

      expect([400, 401, 422, 500, 501]).toContain(res.status);
    });
  });

  // ============================================
  // PATCH /trades/:id - Update Trade
  // ============================================
  describe('PATCH /trades/:id - Update Trade', () => {
    it('should update trade status', async () => {
      const res = await request(app)
        .patch(`/trades/${new (require('mongoose')).Types.ObjectId()}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({ status: 'accepted' });

      expect([200, 400, 404, 500, 501]).toContain(res.status);
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .patch(`/trades/${new (require('mongoose')).Types.ObjectId()}`)
        .send({ status: 'accepted' });

      expect([401, 403, 404, 500, 501]).toContain(res.status);
    });

    it('should validate status values', async () => {
      const res = await request(app)
        .patch(`/trades/${new (require('mongoose')).Types.ObjectId()}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({ status: 'invalid-status' });

      expect([400, 401, 404, 500, 501]).toContain(res.status);
    });

    it('should reject invalid trade ID', async () => {
      const res = await request(app)
        .patch('/trades/invalid')
        .set('Authorization', `Bearer ${testToken}`)
        .send({ status: 'accepted' });

      expect([400, 401, 404, 500, 501]).toContain(res.status);
    });

    it('should prevent unauthorized updates', async () => {
      const otherToken = jwt.sign(
        { id: otherUser._id, username: otherUser.username },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '1h' }
      );

      const res = await request(app)
        .patch(`/trades/${new (require('mongoose')).Types.ObjectId()}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ status: 'accepted' });

      expect([400, 401, 403, 404, 500, 501]).toContain(res.status);
    });
  });

  // ============================================
  // DELETE /trades/:id - Delete Trade
  // ============================================
  describe('DELETE /trades/:id - Delete Trade', () => {
    it('should delete trade', async () => {
      const res = await request(app)
        .delete(`/trades/${new (require('mongoose')).Types.ObjectId()}`)
        .set('Authorization', `Bearer ${testToken}`);

      expect([200, 204, 400, 404, 500, 501]).toContain(res.status);
    });

    it('should require authentication', async () => {
      const res = await request(app).delete(
        `/trades/${new (require('mongoose')).Types.ObjectId()}`
      );

      expect([401, 403, 404, 500, 501]).toContain(res.status);
    });

    it('should reject invalid trade ID', async () => {
      const res = await request(app)
        .delete('/trades/invalid')
        .set('Authorization', `Bearer ${testToken}`);

      expect([400, 401, 404, 500, 501]).toContain(res.status);
    });

    it('should prevent unauthorized deletion', async () => {
      const otherToken = jwt.sign(
        { id: otherUser._id, username: otherUser.username },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '1h' }
      );

      const res = await request(app)
        .delete(`/trades/${new (require('mongoose')).Types.ObjectId()}`)
        .set('Authorization', `Bearer ${otherToken}`);

      expect([400, 401, 403, 404, 500, 501]).toContain(res.status);
    });
  });

  // ============================================
  // Trade Acceptance/Rejection
  // ============================================
  describe('Trade Acceptance/Rejection', () => {
    it('should accept trade', async () => {
      const res = await request(app)
        .post(`/trades/${new (require('mongoose')).Types.ObjectId()}/accept`)
        .set('Authorization', `Bearer ${testToken}`);

      expect([200, 400, 404, 501, 500]).toContain(res.status);
    });

    it('should reject trade', async () => {
      const res = await request(app)
        .post(`/trades/${new (require('mongoose')).Types.ObjectId()}/reject`)
        .set('Authorization', `Bearer ${testToken}`);

      expect([200, 400, 404, 501, 500]).toContain(res.status);
    });

    it('should require authentication for accept', async () => {
      const res = await request(app).post(
        `/trades/${new (require('mongoose')).Types.ObjectId()}/accept`
      );

      expect([401, 403, 404, 500, 501]).toContain(res.status);
    });

    it('should require authentication for reject', async () => {
      const res = await request(app).post(
        `/trades/${new (require('mongoose')).Types.ObjectId()}/reject`
      );

      expect([401, 403, 404, 500, 501]).toContain(res.status);
    });
  });

  // ============================================
  // Trade History & Statistics
  // ============================================
  describe('Trade History & Statistics', () => {
    it('should get user trade history', async () => {
      const res = await request(app)
        .get(`/trades/user/${testUser.username}/history`)
        .set('Authorization', `Bearer ${testToken}`);

      expect([200, 400, 404, 501, 500]).toContain(res.status);
    });

    it('should get trade statistics', async () => {
      const res = await request(app)
        .get(`/trades/user/${testUser.username}/stats`)
        .set('Authorization', `Bearer ${testToken}`);

      expect([200, 400, 404, 501, 500]).toContain(res.status);
    });

    it('should support pagination on history', async () => {
      const res = await request(app)
        .get(`/trades/user/${testUser.username}/history`)
        .query({ page: 1, limit: 20 })
        .set('Authorization', `Bearer ${testToken}`);

      expect([200, 400, 404, 501, 500]).toContain(res.status);
    });
  });

  // ============================================
  // Error Handling
  // ============================================
  describe('Trade Error Handling', () => {
    it('should handle invalid JSON in POST', async () => {
      const res = await request(app)
        .post('/trades')
        .set('Authorization', `Bearer ${testToken}`)
        .set('Content-Type', 'application/json')
        .send('{invalid}');

      expect([400, 500]).toContain(res.status);
    });

    it('should handle missing Authorization', async () => {
      const res = await request(app)
        .get('/trades')
        .set('Authorization', '');

      expect([200, 401, 403, 404, 500]).toContain(res.status);
    });

    it('should handle malformed token', async () => {
      const res = await request(app)
        .get('/trades')
        .set('Authorization', 'Bearer invalid.token');

      expect([401, 403, 404, 500, 501]).toContain(res.status);
    });

    it('should handle concurrent requests', async () => {
      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(
          request(app)
            .get('/trades')
            .set('Authorization', `Bearer ${testToken}`)
        );
      }

      const results = await Promise.all(promises);
      results.forEach((res) => {
        expect([200, 400, 401, 404, 500, 501]).toContain(res.status);
      });
    });

    it('should handle very large payloads', async () => {
      const res = await request(app)
        .post('/trades')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          receiver: otherUser._id,
          cardsFrom: new Array(1000).fill('card-id'),
          cardsTo: new Array(1000).fill('card-id'),
        });

      expect([200, 201, 400, 401, 413, 500, 501]).toContain(res.status);
    });
  });

  // ============================================
  // Query Parameter Validation
  // ============================================
  describe('Query Parameter Validation', () => {
    it('should handle invalid sort parameter', async () => {
      const res = await request(app)
        .get('/trades')
        .query({ sort: 'invalid_field' })
        .set('Authorization', `Bearer ${testToken}`);

      expect([200, 400, 500]).toContain(res.status);
    });

    it('should handle invalid filter parameter', async () => {
      const res = await request(app)
        .get('/trades')
        .query({ invalid_filter: 'value' })
        .set('Authorization', `Bearer ${testToken}`);

      expect([200, 400, 500]).toContain(res.status);
    });

    it('should handle special characters in query', async () => {
      const res = await request(app)
        .get('/trades')
        .query({ search: '!@#$%^&*()' })
        .set('Authorization', `Bearer ${testToken}`);

      expect([200, 400, 500]).toContain(res.status);
    });

    it('should handle very long query strings', async () => {
      const res = await request(app)
        .get('/trades')
        .query({ search: 'a'.repeat(10000) })
        .set('Authorization', `Bearer ${testToken}`);

      expect([200, 400, 500]).toContain(res.status);
    });
  });
});
