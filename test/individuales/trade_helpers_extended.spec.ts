import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  TRADE_POPULATE_FIELDS,
  getPopulatedTrade,
  getTradeByRoomCode,
  getPaginatedTrades,
  getPopulatedTradeRequest,
  getPaginatedTradeRequests,
} from '../../src/server/utils/tradeHelpers';
import { Trade } from '../../src/server/models/Trade';
import { TradeRequest } from '../../src/server/models/TradeRequest';
import { User } from '../../src/server/models/User';
import { Card } from '../../src/server/models/Card';
import { UserCard } from '../../src/server/models/UserCard';

describe('tradeHelpers - Functional Tests', () => {
  let testUser1: any, testUser2: any, testCard: any, testUserCard1: any, testUserCard2: any;
  let testTrade: any, testTradeRequest: any;

  beforeEach(async () => {
    // Clean up
    await Trade.deleteMany({});
    await TradeRequest.deleteMany({});
    await UserCard.deleteMany({});
    await Card.deleteMany({});
    await User.deleteMany({});

    // Create test users
    testUser1 = await User.create({
      username: 'tradeuser1',
      email: 'tradeuser1@test.com',
      password: 'hashed_password',
    });

    testUser2 = await User.create({
      username: 'tradeuser2',
      email: 'tradeuser2@test.com',
      password: 'hashed_password',
    });

    // Create test card
    testCard = await Card.create({
      name: 'Test Card',
      pokemonTcgId: 'test-123',
      rarity: 'Rare',
      set: 'Base Set',
      price: 50,
    });

    // Create user cards
    testUserCard1 = await UserCard.create({
      userId: testUser1._id,
      cardId: testCard._id,
      pokemonTcgId: 'test-123',
      quantity: 2,
      collectionType: 'collection',
    });

    testUserCard2 = await UserCard.create({
      userId: testUser2._id,
      cardId: testCard._id,
      pokemonTcgId: 'test-123',
      quantity: 1,
      collectionType: 'collection',
    });

    // Create test trade
    testTrade = await Trade.create({
      initiatorUserId: testUser1._id,
      receiverUserId: testUser2._id,
      initiatorCards: [{ cardId: testUserCard1._id, quantity: 1 }],
      receiverCards: [{ cardId: testUserCard2._id, quantity: 1 }],
      tradeType: 'private',
      status: 'pending',
      privateRoomCode: 'TRADE-ABC-123',
    });

    // Create test trade request
    testTradeRequest = await TradeRequest.create({
      from: testUser1._id,
      to: testUser2._id,
      note: 'Would you like to trade?',
      status: 'pending',
    });
  });

  afterEach(async () => {
    await Trade.deleteMany({});
    await TradeRequest.deleteMany({});
    await UserCard.deleteMany({});
    await Card.deleteMany({});
    await User.deleteMany({});
  });

  describe('TRADE_POPULATE_FIELDS', () => {
    it('contiene los campos de populate correctos', () => {
      expect(TRADE_POPULATE_FIELDS).toBeInstanceOf(Array);
      expect(TRADE_POPULATE_FIELDS.length).toBeGreaterThan(0);
      
      TRADE_POPULATE_FIELDS.forEach(field => {
        expect(field).toHaveProperty('path');
        expect(field).toHaveProperty('select');
        expect(typeof field.path).toBe('string');
        expect(typeof field.select).toBe('string');
      });
    });

    it('incluye campos para iniciador y receptor', () => {
      const paths = TRADE_POPULATE_FIELDS.map(f => f.path);
      expect(paths).toContain('initiatorUserId');
      expect(paths).toContain('receiverUserId');
    });

    it('incluye campos para cartas del iniciador y receptor', () => {
      const paths = TRADE_POPULATE_FIELDS.map(f => f.path);
      expect(paths).toContain('initiatorCards.cardId');
      expect(paths).toContain('receiverCards.cardId');
    });
  });

  describe('getPopulatedTrade', () => {
    it('retorna un trade poblado por ID', async () => {
      const result = await getPopulatedTrade(testTrade._id.toString());
      
      expect(result).toBeDefined();
      expect(result?.status).toBe('pending');
      expect(result?.initiatorUserId).toBeDefined();
      expect(result?.receiverUserId).toBeDefined();
    });

    it('retorna null si el trade no existe', async () => {
      const result = await getPopulatedTrade('507f1f77bcf86cd799439999');
      expect(result).toBeNull();
    });

    it('popula correctamente los usuarios', async () => {
      const result = await getPopulatedTrade(testTrade._id.toString());
      
      expect(result?.initiatorUserId).toBeDefined();
      expect((result?.initiatorUserId as any).username).toBe('tradeuser1');
      expect((result?.receiverUserId as any).username).toBe('tradeuser2');
    });
  });

  describe('getTradeByRoomCode', () => {
    it('retorna un trade por código de sala', async () => {
      const result = await getTradeByRoomCode('TRADE-ABC-123');
      
      expect(result).toBeDefined();
      expect(result?.status).toBe('pending');
    });

    it('retorna null si el código de sala no existe', async () => {
      const result = await getTradeByRoomCode('NONEXISTENT-CODE');
      expect(result).toBeNull();
    });

    it('popula correctamente los datos con roomCode', async () => {
      const result = await getTradeByRoomCode('TRADE-ABC-123');
      
      expect(result?.initiatorUserId).toBeDefined();
      expect((result?.initiatorUserId as any).email).toBe('tradeuser1@test.com');
    });
  });

  describe('getPaginatedTrades', () => {
    it('retorna trades con paginación correcta', async () => {
      const result = await getPaginatedTrades(
        { status: 'pending' },
        1,
        10
      );

      expect(result.trades).toBeInstanceOf(Array);
      expect(result.page).toBe(1);
      expect(result.totalPages).toBeGreaterThan(0);
      expect(result.resultsPerPage).toBe(10);
    });

    it('respeta el límite de resultados', async () => {
      // Create multiple trades
      for (let i = 0; i < 5; i++) {
        await Trade.create({
          initiatorUserId: testUser1._id,
          receiverUserId: testUser2._id,
          initiatorCards: [{ cardId: testUserCard1._id, quantity: 1 }],
          receiverCards: [{ cardId: testUserCard2._id, quantity: 1 }],
          tradeType: 'public',
          status: 'pending',
        });
      }

      const result = await getPaginatedTrades({ status: 'pending' }, 1, 3);
      expect(result.trades.length).toBeLessThanOrEqual(3);
    });

    it('ordena por createdAt descendente', async () => {
      const result = await getPaginatedTrades({ status: 'pending' }, 1, 20);

      if (result.trades.length > 1) {
        for (let i = 0; i < result.trades.length - 1; i++) {
          const current = new Date(result.trades[i].createdAt).getTime();
          const next = new Date(result.trades[i + 1].createdAt).getTime();
          expect(current).toBeGreaterThanOrEqual(next);
        }
      }
    });

    it('calcula totalPages correctamente', async () => {
      const result = await getPaginatedTrades({ status: 'pending' }, 1, 1);
      expect(result.totalPages).toBeGreaterThan(0);
    });
  });

  describe('getPopulatedTradeRequest', () => {
    it('retorna null si la solicitud no existe', async () => {
      const result = await getPopulatedTradeRequest('507f1f77bcf86cd799439999');
      expect(result).toBeNull();
    });
  });

  describe('getPaginatedTradeRequests', () => {
    it('no lanza errores cuando se llama sin TradeRequests', async () => {
      const result = await getPaginatedTradeRequests(
        { status: 'nonexistent' },
        1,
        10
      );

      expect(result).toBeDefined();
      expect(result.page).toBe(1);
      expect(result.requests).toBeInstanceOf(Array);
    });
  });
});
