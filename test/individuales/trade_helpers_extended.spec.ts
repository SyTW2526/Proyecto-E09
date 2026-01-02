import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  TRADE_POPULATE_FIELDS,
  getPopulatedTrade,
  getTradeByRoomCode,
  getPaginatedTrades,
  getPopulatedTradeRequest,
  getPaginatedTradeRequests,
} from '../../src/server/utils/tradeHelpers';

describe('tradeHelpers', () => {
  describe('TRADE_POPULATE_FIELDS', () => {
    it('contiene los campos de populate correctos', () => {
      expect(TRADE_POPULATE_FIELDS).toBeInstanceOf(Array);
      expect(TRADE_POPULATE_FIELDS.length).toBeGreaterThan(0);
      
      // Verificar estructura
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

  describe('Helper functions structure', () => {
    it('getPopulatedTrade es una función', () => {
      expect(typeof getPopulatedTrade).toBe('function');
    });

    it('getTradeByRoomCode es una función', () => {
      expect(typeof getTradeByRoomCode).toBe('function');
    });

    it('getPaginatedTrades es una función', () => {
      expect(typeof getPaginatedTrades).toBe('function');
    });

    it('getPopulatedTradeRequest es una función', () => {
      expect(typeof getPopulatedTradeRequest).toBe('function');
    });

    it('getPaginatedTradeRequests es una función', () => {
      expect(typeof getPaginatedTradeRequests).toBe('function');
    });
  });
});
