import { describe, it, beforeEach, afterEach, expect } from 'vitest';
import mongoose from 'mongoose';
import {
  TRADE_POPULATE_FIELDS,
  getPopulatedTrade,
  getTradeByRoomCode,
  getPaginatedTrades,
  getPopulatedTradeRequest,
  getPaginatedTradeRequests,
} from '../../src/server/utils/tradeHelpers.js';
import { Trade } from '../../src/server/models/Trade.js';
import { TradeRequest } from '../../src/server/models/TradeRequest.js';
import { User } from '../../src/server/models/User.js';

/**
 * Tests exhaustivos para tradeHelpers.ts
 */

beforeEach(async () => {
  await Trade.deleteMany();
  await TradeRequest.deleteMany();
  await User.deleteMany();
});

afterEach(async () => {
  await Trade.deleteMany();
  await TradeRequest.deleteMany();
  await User.deleteMany();
});

describe('Trade Helpers', () => {
  const user1Data = {
    username: 'trader1',
    email: 'trader1@example.com',
    password: 'pass123',
  };

  const user2Data = {
    username: 'trader2',
    email: 'trader2@example.com',
    password: 'pass456',
  };

  describe('TRADE_POPULATE_FIELDS', () => {
    it('contiene los campos de populate esperados', () => {
      expect(TRADE_POPULATE_FIELDS).toBeInstanceOf(Array);
      expect(TRADE_POPULATE_FIELDS.length).toBeGreaterThan(0);
      expect(TRADE_POPULATE_FIELDS[0]).toHaveProperty('path');
      expect(TRADE_POPULATE_FIELDS[0]).toHaveProperty('select');
    });
  });

  describe('getPopulatedTrade', () => {
    it('obtiene un trade con populate completo', async () => {
      const user1 = await User.create(user1Data);
      const user2 = await User.create(user2Data);

      const trade = await Trade.create({
        initiatorUserId: user1._id,
        receiverUserId: user2._id,
        tradeType: 'public',
        status: 'pending',
        initiatorCards: [],
        receiverCards: [],
      });

      const result = await getPopulatedTrade(String(trade._id));

      expect(result).toBeDefined();
      expect(result?._id).toEqual(trade._id);
      expect(result?.initiatorUserId).toBeDefined();
    });

    it('retorna null si el trade no existe', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const result = await getPopulatedTrade(String(fakeId));

      expect(result).toBeNull();
    });
  });

  describe('getTradeByRoomCode', () => {
    it('obtiene un trade por código de sala', async () => {
      const user1 = await User.create(user1Data);
      const user2 = await User.create(user2Data);

      const trade = await Trade.create({
        initiatorUserId: user1._id,
        receiverUserId: user2._id,
        tradeType: 'private',
        status: 'pending',
        privateRoomCode: 'TEST123',
        initiatorCards: [],
        receiverCards: [],
      });

      const result = await getTradeByRoomCode('TEST123');

      expect(result).toBeDefined();
      expect(result?._id).toEqual(trade._id);
    });

    it('retorna null si el código de sala no existe', async () => {
      const result = await getTradeByRoomCode('NONEXISTENT');

      expect(result).toBeNull();
    });
  });

  describe('getPaginatedTrades', () => {
    it('obtiene trades con paginación', async () => {
      const user1 = await User.create(user1Data);
      const user2 = await User.create(user2Data);

      await Trade.create({
        initiatorUserId: user1._id,
        receiverUserId: user2._id,
        tradeType: 'public',
        status: 'pending',
        initiatorCards: [],
        receiverCards: [],
      });

      const result = await getPaginatedTrades({}, 1, 10);

      expect(result).toBeDefined();
      expect(result.trades).toBeInstanceOf(Array);
      expect(result.page).toBe(1);
      expect(result.totalResults).toBe(1);
      expect(result.totalPages).toBe(1);
    });

    it('filtra trades por estado', async () => {
      const user1 = await User.create(user1Data);
      const user2 = await User.create(user2Data);

      await Trade.create({
        initiatorUserId: user1._id,
        receiverUserId: user2._id,
        tradeType: 'public',
        status: 'pending',
        initiatorCards: [],
        receiverCards: [],
      });

      await Trade.create({
        initiatorUserId: user1._id,
        receiverUserId: user2._id,
        tradeType: 'public',
        status: 'completed',
        initiatorCards: [],
        receiverCards: [],
      });

      const result = await getPaginatedTrades({ status: 'pending' }, 1, 10);

      expect(result.trades.length).toBe(1);
      expect(result.trades[0].status).toBe('pending');
    });

    it('respeta el límite de resultados por página', async () => {
      const user1 = await User.create(user1Data);
      const user2 = await User.create(user2Data);

      for (let i = 0; i < 5; i++) {
        await Trade.create({
          initiatorUserId: user1._id,
          receiverUserId: user2._id,
          tradeType: 'public',
          status: 'pending',
          initiatorCards: [],
          receiverCards: [],
        });
      }

      const result = await getPaginatedTrades({}, 1, 2);

      expect(result.trades.length).toBe(2);
      expect(result.totalResults).toBe(5);
      expect(result.totalPages).toBe(3);
    });

    it('pagina correctamente', async () => {
      const user1 = await User.create(user1Data);
      const user2 = await User.create(user2Data);

      for (let i = 0; i < 5; i++) {
        await Trade.create({
          initiatorUserId: user1._id,
          receiverUserId: user2._id,
          tradeType: 'public',
          status: 'pending',
          initiatorCards: [],
          receiverCards: [],
        });
      }

      const page2 = await getPaginatedTrades({}, 2, 2);

      expect(page2.trades.length).toBe(2);
      expect(page2.page).toBe(2);
    });
  });

  describe('getPopulatedTradeRequest', () => {
    it('obtiene una solicitud de intercambio con populate', async () => {
      const user1 = await User.create(user1Data);
      const user2 = await User.create(user2Data);

      const request = await TradeRequest.create({
        senderId: user1._id,
        receiverId: user2._id,
        cardName: 'Pikachu',
        isManual: true,
      });

      const result = await getPopulatedTradeRequest(String(request._id));

      expect(result).toBeDefined();
      expect(result?._id).toEqual(request._id);
    });

    it('retorna null si la solicitud no existe', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const result = await getPopulatedTradeRequest(String(fakeId));

      expect(result).toBeNull();
    });
  });

  describe('getPaginatedTradeRequests', () => {
    it('obtiene solicitudes con paginación', async () => {
      const user1 = await User.create(user1Data);
      const user2 = await User.create(user2Data);

      await TradeRequest.create({
        senderId: user1._id,
        receiverId: user2._id,
        cardName: 'Charizard',
        isManual: true,
      });

      const result = await getPaginatedTradeRequests({}, 1, 10);

      expect(result).toBeDefined();
      expect(result.requests).toBeInstanceOf(Array);
      expect(result.totalResults).toBe(1);
      expect(result.totalPages).toBe(1);
    });

    it('filtra solicitudes por estado', async () => {
      const user1 = await User.create(user1Data);
      const user2 = await User.create(user2Data);

      await TradeRequest.create({
        senderId: user1._id,
        receiverId: user2._id,
        cardName: 'Blastoise',
        isManual: true,
        status: 'pending',
      });

      await TradeRequest.create({
        senderId: user1._id,
        receiverId: user2._id,
        cardName: 'Venusaur',
        isManual: true,
        status: 'accepted',
      });

      const result = await getPaginatedTradeRequests(
        { status: 'accepted' },
        1,
        10
      );

      expect(result.requests.length).toBe(1);
      expect(result.requests[0].status).toBe('accepted');
    });

    it('respeta el límite de resultados', async () => {
      const user1 = await User.create(user1Data);
      const user2 = await User.create(user2Data);

      for (let i = 0; i < 5; i++) {
        await TradeRequest.create({
          senderId: user1._id,
          receiverId: user2._id,
          cardName: `Card${i}`,
          isManual: true,
        });
      }

      const result = await getPaginatedTradeRequests({}, 1, 2);

      expect(result.requests.length).toBe(2);
      expect(result.totalResults).toBe(5);
      expect(result.totalPages).toBe(3);
    });
  });
});
