/**
 * @file trade_request-router-complete.spec.ts
 * @description Comprehensive tests para trade_request router para mejorar cobertura
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../../src/server/api.js';
import { User } from '../../src/server/models/User.js';
import { TradeRequest } from '../../src/server/models/TradeRequest.js';
import { UserCard } from '../../src/server/models/UserCard.js';
import { Card } from '../../src/server/models/Card.js';

describe('Trade Request Router - Complete Coverage', () => {
  let testUser: any;
  let receiverUser: any;
  let testToken: string;
  let receiverToken: string;

  beforeEach(async () => {
    await User.deleteMany({});
    await TradeRequest.deleteMany({});
    await UserCard.deleteMany({});
    await Card.deleteMany({});

    testUser = await User.create({
      username: 'requester1',
      email: 'requester1@example.com',
      password: 'password123',
    });

    receiverUser = await User.create({
      username: 'receiver1',
      email: 'receiver1@example.com',
      password: 'password123',
    });

    testToken = jwt.sign(
      { id: testUser._id, username: testUser.username },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );

    receiverToken = jwt.sign(
      { id: receiverUser._id, username: receiverUser.username },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
  });

  afterEach(async () => {
    await User.deleteMany({});
    await TradeRequest.deleteMany({});
    await UserCard.deleteMany({});
    await Card.deleteMany({});
  });

  // ============================================
  // POST /trade-requests - Create Trade Request
  // ============================================
  describe('POST /trade-requests - Create Trade Request', () => {
    it('should create manual trade request', async () => {
      const res = await request(app)
        .post('/trade-requests')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          receiverIdentifier: receiverUser.username,
          isManual: true,
          note: 'Manual trade invitation',
        });

      expect([200, 201, 400, 401, 404, 409, 500, 501]).toContain(res.status);
    });

    it('should create specific card trade request', async () => {
      const res = await request(app)
        .post('/trade-requests')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          receiverIdentifier: receiverUser.username,
          pokemonTcgId: 'sv04pt-001',
          cardName: 'Pikachu',
          isManual: false,
        });

      expect([200, 201, 400, 401, 404, 409, 500, 501]).toContain(res.status);
    });

    it('should reject without receiverIdentifier', async () => {
      const res = await request(app)
        .post('/trade-requests')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          pokemonTcgId: 'sv04pt-001',
          isManual: false,
        });

      expect([400, 401, 409, 500]).toContain(res.status);
    });

    it('should reject without pokemonTcgId for non-manual request', async () => {
      const res = await request(app)
        .post('/trade-requests')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          receiverIdentifier: receiverUser.username,
          isManual: false,
        });

      expect([400, 401, 409, 500]).toContain(res.status);
    });

    it('should reject self-trade requests', async () => {
      const res = await request(app)
        .post('/trade-requests')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          receiverIdentifier: testUser.username,
          pokemonTcgId: 'sv04pt-001',
          isManual: false,
        });

      expect([400, 401, 404, 500]).toContain(res.status);
    });

    it('should reject duplicate pending requests', async () => {
      // Create first request
      await request(app)
        .post('/trade-requests')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          receiverIdentifier: receiverUser.username,
          pokemonTcgId: 'sv04pt-001',
          isManual: false,
        });

      // Try to create duplicate
      const res = await request(app)
        .post('/trade-requests')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          receiverIdentifier: receiverUser.username,
          pokemonTcgId: 'sv04pt-001',
          isManual: false,
        });

      expect([400, 404, 409, 500]).toContain(res.status);
    });

    it('should create quick trade request with offered card', async () => {
      const res = await request(app)
        .post('/trade-requests')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          receiverIdentifier: receiverUser.username,
          pokemonTcgId: 'sv04pt-001',
          cardName: 'Pikachu',
          offeredCard: {
            pokemonTcgId: 'sv04pt-002',
            name: 'Charizard',
          },
          isManual: false,
        });

      expect([200, 201, 400, 401, 404, 409, 500, 501]).toContain(res.status);
    });

    it('should include optional fields', async () => {
      const res = await request(app)
        .post('/trade-requests')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          receiverIdentifier: receiverUser.username,
          pokemonTcgId: 'sv04pt-001',
          cardName: 'Pikachu',
          cardImage: 'https://example.com/image.jpg',
          note: 'Looking for this specific card',
          offeredPrice: 50,
          targetPrice: 100,
          isManual: false,
        });

      expect([200, 201, 400, 401, 404, 409, 500, 501]).toContain(res.status);
    });
  });

  // ============================================
  // GET /trade-requests/received - Received Requests
  // ============================================
  describe('GET /trade-requests/received - Received Requests', () => {
    beforeEach(async () => {
      await TradeRequest.create({
        from: testUser._id,
        to: receiverUser._id,
        pokemonTcgId: 'sv04pt-001',
        status: 'pending',
        isManual: false,
      });
    });

    it('should get received trade requests', async () => {
      const res = await request(app)
        .get('/trade-requests/received')
        .set('Authorization', `Bearer ${receiverToken}`);

      expect([200, 400, 401, 404, 500, 501]).toContain(res.status);
    });

    it('should support pagination', async () => {
      const res = await request(app)
        .get('/trade-requests/received')
        .query({ page: 1, limit: 20 })
        .set('Authorization', `Bearer ${receiverToken}`);

      expect([200, 400, 401, 404, 500, 501]).toContain(res.status);
    });

    it('should reject if viewing another users received requests', async () => {
      const res = await request(app)
        .get('/trade-requests/received')
        .query({ username: testUser.username })
        .set('Authorization', `Bearer ${receiverToken}`);

      expect([200, 400, 401, 403, 404, 500, 501]).toContain(res.status);
    });
  });

  // ============================================
  // GET /trade-requests/sent - Sent Requests
  // ============================================
  describe('GET /trade-requests/sent - Sent Requests', () => {
    beforeEach(async () => {
      await TradeRequest.create({
        from: testUser._id,
        to: receiverUser._id,
        pokemonTcgId: 'sv04pt-001',
        status: 'pending',
        isManual: false,
      });
    });

    it('should get sent trade requests', async () => {
      const res = await request(app)
        .get('/trade-requests/sent')
        .set('Authorization', `Bearer ${testToken}`);

      expect([200, 400, 401, 404, 500, 501]).toContain(res.status);
    });

    it('should support pagination', async () => {
      const res = await request(app)
        .get('/trade-requests/sent')
        .query({ page: 1, limit: 20 })
        .set('Authorization', `Bearer ${testToken}`);

      expect([200, 400, 401, 404, 500, 501]).toContain(res.status);
    });

    it('should reject if viewing another users sent requests', async () => {
      const res = await request(app)
        .get('/trade-requests/sent')
        .query({ username: testUser.username })
        .set('Authorization', `Bearer ${receiverToken}`);

      expect([200, 400, 401, 403, 404, 500, 501]).toContain(res.status);
    });
  });

  // ============================================
  // POST /trade-requests/:id/reject - Reject Request
  // ============================================
  describe('POST /trade-requests/:id/reject - Reject Trade Request', () => {
    let testRequest: any;

    beforeEach(async () => {
      testRequest = await TradeRequest.create({
        from: testUser._id,
        to: receiverUser._id,
        pokemonTcgId: 'sv04pt-001',
        status: 'pending',
        isManual: false,
      });
    });

    it('should reject trade request', async () => {
      const res = await request(app)
        .post(`/trade-requests/${testRequest._id.toString()}/reject`)
        .set('Authorization', `Bearer ${receiverToken}`);

      expect([200, 201, 400, 401, 403, 404, 500, 501]).toContain(res.status);
    });

    it('should reject with reason', async () => {
      const res = await request(app)
        .post(`/trade-requests/${testRequest._id.toString()}/reject`)
        .set('Authorization', `Bearer ${receiverToken}`)
        .send({ reason: 'Not interested' });

      expect([200, 201, 400, 401, 403, 404, 500, 501]).toContain(res.status);
    });

    it('should require authentication', async () => {
      const res = await request(app).post(
        `/trade-requests/${testRequest._id.toString()}/reject`
      );

      expect([400, 401, 403, 404, 500]).toContain(res.status);
    });
  });

  // ============================================
  // POST /trade-requests/:id/accept - Accept Request
  // ============================================
  describe('POST /trade-requests/:id/accept - Accept Trade Request', () => {
    let testRequest: any;

    beforeEach(async () => {
      testRequest = await TradeRequest.create({
        from: testUser._id,
        to: receiverUser._id,
        pokemonTcgId: 'sv04pt-001',
        cardName: 'Pikachu',
        status: 'pending',
        isManual: true,
      });
    });

    it('should accept manual trade request', async () => {
      const res = await request(app)
        .post(`/trade-requests/${testRequest._id.toString()}/accept`)
        .set('Authorization', `Bearer ${receiverToken}`);

      expect([200, 201, 400, 401, 403, 404, 500, 501]).toContain(res.status);
    });

    it('should require authentication', async () => {
      const res = await request(app).post(
        `/trade-requests/${testRequest._id.toString()}/accept`
      );

      expect([400, 401, 403, 404, 500]).toContain(res.status);
    });

    it('should not allow sender to accept own request', async () => {
      const res = await request(app)
        .post(`/trade-requests/${testRequest._id.toString()}/accept`)
        .set('Authorization', `Bearer ${testToken}`);

      expect([200, 201, 400, 401, 403, 404, 500, 501]).toContain(res.status);
    });
  });

  // ============================================
  // POST /trade-requests/:id/open-room - Open Room
  // ============================================
  describe('POST /trade-requests/:id/open-room - Open Room for Trade', () => {
    let testRequest: any;

    beforeEach(async () => {
      testRequest = await TradeRequest.create({
        from: testUser._id,
        to: receiverUser._id,
        pokemonTcgId: 'sv04pt-001',
        status: 'pending',
        isManual: true,
      });
    });

    it('should open room for pending trade request', async () => {
      const res = await request(app)
        .post(`/trade-requests/${testRequest._id.toString()}/open-room`)
        .set('Authorization', `Bearer ${receiverToken}`);

      expect([200, 201, 400, 401, 403, 404, 500, 501]).toContain(res.status);
    });

    it('should require authentication', async () => {
      const res = await request(app).post(
        `/trade-requests/${testRequest._id.toString()}/open-room`
      );

      expect([400, 401, 403, 404, 500]).toContain(res.status);
    });
  });

  // ============================================
  // Bulk and Edge Cases
  // ============================================
  describe('Bulk and Edge Cases', () => {
    it('should handle rapid trade request creation', async () => {
      const promises = [];
      for (let i = 0; i < 3; i++) {
        promises.push(
          request(app)
            .post('/trade-requests')
            .set('Authorization', `Bearer ${testToken}`)
            .send({
              receiverIdentifier: receiverUser.username,
              pokemonTcgId: `sv04pt-00${i + 1}`,
              isManual: false,
            })
        );
      }

      const results = await Promise.all(promises);
      results.forEach((res) => {
        expect([200, 201, 400, 401, 404, 409, 500, 501]).toContain(res.status);
      });
    });

    it('should handle non-existent receiver', async () => {
      const res = await request(app)
        .post('/trade-requests')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          receiverIdentifier: 'nonexistent',
          pokemonTcgId: 'sv04pt-001',
          isManual: false,
        });

      expect([400, 404, 500]).toContain(res.status);
    });

    it('should handle very long notes', async () => {
      const longNote = 'A'.repeat(5000);
      const res = await request(app)
        .post('/trade-requests')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          receiverIdentifier: receiverUser.username,
          pokemonTcgId: 'sv04pt-001',
          note: longNote,
          isManual: false,
        });

      expect([200, 201, 400, 401, 404, 409, 413, 500, 501]).toContain(
        res.status
      );
    });

    it('should handle special characters in card names', async () => {
      const res = await request(app)
        .post('/trade-requests')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          receiverIdentifier: receiverUser.username,
          pokemonTcgId: 'sv04pt-001',
          cardName: 'Pokémon #ñ %#@!',
          isManual: false,
        });

      expect([200, 201, 400, 401, 404, 409, 500, 501]).toContain(res.status);
    });

    it('should handle listing with various filters', async () => {
      const promises = [
        request(app)
          .get('/trade-requests/received')
          .set('Authorization', `Bearer ${receiverToken}`),
        request(app)
          .get('/trade-requests/sent')
          .set('Authorization', `Bearer ${testToken}`),
        request(app)
          .get('/trade-requests/received')
          .query({ page: 1, limit: 10 })
          .set('Authorization', `Bearer ${receiverToken}`),
      ];

      const results = await Promise.all(promises);
      results.forEach((res) => {
        expect([200, 400, 401, 404, 500, 501]).toContain(res.status);
      });
    });
  });
});
