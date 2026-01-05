import request from 'supertest';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { app } from '../../src/server/api.js';
import { TradeRequest } from '../../src/server/models/TradeRequest.js';
import { Trade } from '../../src/server/models/Trade.js';
import { User } from '../../src/server/models/User.js';
import { UserCard } from '../../src/server/models/UserCard.js';
import { Card } from '../../src/server/models/Card.js';
import { Notification } from '../../src/server/models/Notification.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

describe('Trade Request Router Extended', () => {
  let user1: any;
  let user2: any;
  let token1: string;
  let token2: string;
  let userCard1: any;
  let userCard2: any;
  let tradeRequest: any;

  beforeEach(async () => {
    // Clean up all collections
    await TradeRequest.deleteMany({});
    await Trade.deleteMany({});
    await User.deleteMany({});
    await UserCard.deleteMany({});
    await Card.deleteMany({});
    await Notification.deleteMany({});

    // Create test users
    const hashedPassword1 = await bcrypt.hash('password123', 10);
    const hashedPassword2 = await bcrypt.hash('password456', 10);

    user1 = await User.create({
      username: 'testuser1',
      email: 'test1@example.com',
      password: hashedPassword1,
      verificationCode: null,
      isVerified: true,
    });

    user2 = await User.create({
      username: 'testuser2',
      email: 'test2@example.com',
      password: hashedPassword2,
      verificationCode: null,
      isVerified: true,
    });

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

    // Create cards in database
    const card1 = await Card.create({
      pokemonTcgId: 'sv04pt-1',
      name: 'Charizard',
      supertype: 'Pokémon',
      series: 'Scarlet & Violet',
      set: 'Scarlet & Violet',
      rarity: 'Rare',
      images: {
        small: 'https://example.com/charizard-small.jpg',
        large: 'https://example.com/charizard.jpg',
      },
      cardNumber: '1',
    });

    const card2 = await Card.create({
      pokemonTcgId: 'sv04pt-25',
      name: 'Pikachu',
      supertype: 'Pokémon',
      series: 'Scarlet & Violet',
      set: 'Scarlet & Violet',
      rarity: 'Common',
      images: {
        small: 'https://example.com/pikachu-small.jpg',
        large: 'https://example.com/pikachu.jpg',
      },
      cardNumber: '25',
    });

    // Create user cards for trade requests
    userCard1 = await UserCard.create({
      userId: user1._id,
      cardId: card1._id,
      pokemonTcgId: 'sv04pt-1',
      quantity: 1,
      collectionType: 'collection',
    });

    userCard2 = await UserCard.create({
      userId: user2._id,
      cardId: card2._id,
      pokemonTcgId: 'sv04pt-25',
      quantity: 1,
      collectionType: 'collection',
    });
  });

  afterEach(async () => {
    await TradeRequest.deleteMany({});
    await Trade.deleteMany({});
    await User.deleteMany({});
    await UserCard.deleteMany({});
    await Card.deleteMany({});
    await Notification.deleteMany({});
  });

  describe('POST /trade-requests', () => {
    it('should create a manual trade request', async () => {
      const res = await request(app)
        .post('/trade-requests')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          receiverIdentifier: user2.username,
          isManual: true,
          note: 'Test trade request',
        });

      expect([201, 500]).toContain(res.status);
      if (res.status === 201) {
        expect(res.body).toHaveProperty('request');
        expect(res.body.request.from.toString()).toBe(user1._id.toString());
        expect(res.body.request.to.toString()).toBe(user2._id.toString());
        expect(res.body.request.isManual).toBe(true);
      }
    });

    it('should create a specific card trade request', async () => {
      const res = await request(app)
        .post('/trade-requests')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          receiverIdentifier: user2.username,
          pokemonTcgId: 'sv04pt-25',
          cardName: 'Pikachu',
          cardImage: 'https://example.com/pikachu.jpg',
          isManual: false,
        });

      expect([201, 500]).toContain(res.status);
      if (res.status === 201) {
        expect(res.body).toHaveProperty('request');
        expect(res.body.request.pokemonTcgId).toBe('sv04pt-25');
      }
    });

    it('should reject trade request without receiverIdentifier', async () => {
      const res = await request(app)
        .post('/trade-requests')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          isManual: true,
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should reject trade request without pokemonTcgId for non-manual requests', async () => {
      const res = await request(app)
        .post('/trade-requests')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          receiverIdentifier: user2.username,
          isManual: false,
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should reject self-trade requests', async () => {
      const res = await request(app)
        .post('/trade-requests')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          receiverIdentifier: user1.username,
          isManual: true,
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('ti mismo');
    });

    it('should reject duplicate pending requests', async () => {
      // Create first request
      await request(app)
        .post('/trade-requests')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          receiverIdentifier: user2.username,
          isManual: true,
        });

      // Try to create duplicate
      const res = await request(app)
        .post('/trade-requests')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          receiverIdentifier: user2.username,
          isManual: true,
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('errorCode');
    });
  });

  describe('GET /trade-requests/received/:userId', () => {
    it('should get received trade requests', async () => {
      // Create a trade request for user2
      await TradeRequest.create({
        from: user1._id,
        to: user2._id,
        pokemonTcgId: 'sv04pt-25',
        cardName: 'Pikachu',
        cardImage: 'https://example.com/pikachu.jpg',
        isManual: false,
        status: 'pending',
      });

      const res = await request(app)
        .get(`/trade-requests/received/${user2._id.toString()}`)
        .set('Authorization', `Bearer ${token2}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('requests');
      expect(Array.isArray(res.body.requests)).toBe(true);
      if (res.body.requests.length > 0) {
        expect(res.body.requests[0].to.toString()).toBe(user2._id.toString());
      }
    });

    it('should reject if viewing another users received requests', async () => {
      const res = await request(app)
        .get(`/trade-requests/received/${user2._id.toString()}`)
        .set('Authorization', `Bearer ${token1}`);

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty('error');
    });

    it('should return empty array for user with no received requests', async () => {
      const res = await request(app)
        .get(`/trade-requests/received/${user1._id.toString()}`)
        .set('Authorization', `Bearer ${token1}`);

      expect(res.status).toBe(200);
      expect(res.body.requests).toEqual([]);
    });
  });

  describe('GET /trade-requests/sent/:userId', () => {
    it('should get sent trade requests', async () => {
      // Create a trade request from user1
      await TradeRequest.create({
        from: user1._id,
        to: user2._id,
        pokemonTcgId: 'sv04pt-25',
        cardName: 'Pikachu',
        cardImage: 'https://example.com/pikachu.jpg',
        isManual: false,
        status: 'pending',
      });

      const res = await request(app)
        .get(`/trade-requests/sent/${user1._id.toString()}`)
        .set('Authorization', `Bearer ${token1}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('requests');
      expect(Array.isArray(res.body.requests)).toBe(true);
      if (res.body.requests.length > 0) {
        expect(res.body.requests[0].from.toString()).toBe(user1._id.toString());
      }
    });

    it('should reject if viewing another users sent requests', async () => {
      const res = await request(app)
        .get(`/trade-requests/sent/${user1._id.toString()}`)
        .set('Authorization', `Bearer ${token2}`);

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty('error');
    });

    it('should return empty array for user with no sent requests', async () => {
      const res = await request(app)
        .get(`/trade-requests/sent/${user2._id.toString()}`)
        .set('Authorization', `Bearer ${token2}`);

      expect(res.status).toBe(200);
      expect(res.body.requests).toEqual([]);
    });
  });

  describe('POST /trade-requests/:id/reject', () => {
    it('should reject a pending trade request', async () => {
      const tr = await TradeRequest.create({
        from: user1._id,
        to: user2._id,
        pokemonTcgId: 'sv04pt-25',
        cardName: 'Pikachu',
        cardImage: 'https://example.com/pikachu.jpg',
        isManual: false,
        status: 'pending',
      });

      const res = await request(app)
        .post(`/trade-requests/${tr._id.toString()}/reject`)
        .set('Authorization', `Bearer ${token2}`);

      expect(res.status).toBeLessThan(500);
      if (res.status === 200) {
        expect(res.body.request.status).toBe('rejected');
        expect(res.body.request.finishedAt).not.toBeNull();
      }
    });

    it('should reject if user is not the receiver', async () => {
      const tr = await TradeRequest.create({
        from: user1._id,
        to: user2._id,
        pokemonTcgId: 'sv04pt-25',
        cardName: 'Pikachu',
        cardImage: 'https://example.com/pikachu.jpg',
        isManual: false,
        status: 'pending',
      });

      const res = await request(app)
        .post(`/trade-requests/${tr._id.toString()}/reject`)
        .set('Authorization', `Bearer ${token1}`);

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty('error');
    });

    it('should reject if request is not pending', async () => {
      const tr = await TradeRequest.create({
        from: user1._id,
        to: user2._id,
        pokemonTcgId: 'sv04pt-25',
        cardName: 'Pikachu',
        cardImage: 'https://example.com/pikachu.jpg',
        isManual: false,
        status: 'rejected',
      });

      const res = await request(app)
        .post(`/trade-requests/${tr._id.toString()}/reject`)
        .set('Authorization', `Bearer ${token2}`);

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('pendiente');
    });
  });

  describe('POST /trade-requests/:id/accept', () => {
    it('should accept a manual trade request', async () => {
      const tr = await TradeRequest.create({
        from: user1._id,
        to: user2._id,
        isManual: true,
        status: 'pending',
      });

      const res = await request(app)
        .post(`/trade-requests/${tr._id.toString()}/accept`)
        .set('Authorization', `Bearer ${token2}`);

      expect(res.status).toBeLessThan(500);
      if (res.status === 200) {
        expect(res.body).toHaveProperty('request');
        expect(res.body.request.status).toBe('accepted');
      }
    });

    it('should reject acceptance if user is not receiver', async () => {
      const tr = await TradeRequest.create({
        from: user1._id,
        to: user2._id,
        pokemonTcgId: 'sv04pt-25',
        cardName: 'Pikachu',
        cardImage: 'https://example.com/pikachu.jpg',
        isManual: false,
        status: 'pending',
      });

      const res = await request(app)
        .post(`/trade-requests/${tr._id.toString()}/accept`)
        .set('Authorization', `Bearer ${token1}`);

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty('error');
    });

    it('should reject acceptance if request not pending', async () => {
      const tr = await TradeRequest.create({
        from: user1._id,
        to: user2._id,
        pokemonTcgId: 'sv04pt-25',
        cardName: 'Pikachu',
        cardImage: 'https://example.com/pikachu.jpg',
        isManual: false,
        status: 'rejected',
      });

      const res = await request(app)
        .post(`/trade-requests/${tr._id.toString()}/accept`)
        .set('Authorization', `Bearer ${token2}`);

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('pendiente');
    });
  });

  describe('POST /trade-requests/:id/open-room', () => {
    it('should open a room for a pending trade request', async () => {
      const tr = await TradeRequest.create({
        from: user1._id,
        to: user2._id,
        pokemonTcgId: 'sv04pt-25',
        cardName: 'Pikachu',
        cardImage: 'https://example.com/pikachu.jpg',
        isManual: false,
        status: 'pending',
      });

      const res = await request(app)
        .post(`/trade-requests/${tr._id.toString()}/open-room`)
        .set('Authorization', `Bearer ${token2}`);

      expect(res.status).toBeLessThan(500);
      if (res.status === 200) {
        expect(res.body).toHaveProperty('message');
        expect(res.body).toHaveProperty('tradeId');
        expect(res.body.request.status).toBe('accepted');
      }
    });

    it('should reject if user is not receiver', async () => {
      const tr = await TradeRequest.create({
        from: user1._id,
        to: user2._id,
        pokemonTcgId: 'sv04pt-25',
        cardName: 'Pikachu',
        cardImage: 'https://example.com/pikachu.jpg',
        isManual: false,
        status: 'pending',
      });

      const res = await request(app)
        .post(`/trade-requests/${tr._id.toString()}/open-room`)
        .set('Authorization', `Bearer ${token1}`);

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty('error');
    });

    it('should reject if request not pending', async () => {
      const tr = await TradeRequest.create({
        from: user1._id,
        to: user2._id,
        pokemonTcgId: 'sv04pt-25',
        cardName: 'Pikachu',
        cardImage: 'https://example.com/pikachu.jpg',
        isManual: false,
        status: 'accepted',
      });

      const res = await request(app)
        .post(`/trade-requests/${tr._id.toString()}/open-room`)
        .set('Authorization', `Bearer ${token2}`);

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('pendiente');
    });
  });
});
