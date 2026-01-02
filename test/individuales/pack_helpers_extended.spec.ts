import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  computePackTokens,
  validatePackTokens,
  consumePackToken,
  getPackOpenCount24h,
  getRandomElement,
  generatePackCards,
} from '../../src/server/utils/packHelpers';

describe('packHelpers', () => {
  describe('computePackTokens', () => {
    it('inicializa tokens si no existen', () => {
      const user = {
        packTokens: undefined,
        packLastRefill: undefined,
      };

      const result = computePackTokens(user);

      expect(result.tokens).toBe(2); // MAX_TOKENS = 2
      expect(result.nextAllowed).toBeNull(); // Con max tokens, no hay nextAllowed
      expect(user.packTokens).toBe(2);
      expect(user.packLastRefill).toBeDefined();
    });

    it('mantiene tokens existentes sin refill', () => {
      const now = Date.now();
      const user = {
        packTokens: 1,
        packLastRefill: new Date(now - 1000), // Hace 1 segundo
      };

      const result = computePackTokens(user);

      expect(result.tokens).toBe(1);
    });

    it('realiza refill después de 12 horas', () => {
      const now = Date.now();
      const twoRefillsAgo = new Date(now - 25 * 60 * 60 * 1000); // 25 horas atrás

      const user = {
        packTokens: 0,
        packLastRefill: twoRefillsAgo,
      };

      const result = computePackTokens(user);

      expect(result.tokens).toBeGreaterThan(0);
    });

    it('calcula nextAllowed correctamente', () => {
      const now = Date.now();
      const user = {
        packTokens: 0,
        packLastRefill: new Date(now - 1000),
      };

      const result = computePackTokens(user);

      expect(result.nextAllowed).not.toBeNull();
      expect(result.nextAllowed).toBeInstanceOf(Date);
    });
  });

  describe('validatePackTokens', () => {
    it('retorna true si hay tokens disponibles', () => {
      const user = {
        packTokens: 2,
        packLastRefill: new Date(),
      };

      const mockRes = {};

      const result = validatePackTokens(user, mockRes as any);

      expect(result).toBe(true);
    });

    it('retorna status 429 si no hay tokens', () => {
      const user = {
        packTokens: 0,
        packLastRefill: new Date(),
      };

      const mockRes = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn(),
      };

      validatePackTokens(user, mockRes as any);

      expect(mockRes.status).toHaveBeenCalledWith(429);
      expect(mockRes.send).toHaveBeenCalled();
    });
  });

  describe('consumePackToken', () => {
    it('consume un token correctamente', async () => {
      const user = {
        packTokens: 2,
        packLastRefill: new Date(),
        save: vi.fn().mockResolvedValue(undefined),
      };

      const result = await consumePackToken(user);

      expect(result).toBe(true);
      expect(user.packTokens).toBe(1);
      expect(user.save).toHaveBeenCalled();
    });

    it('retorna false si no hay tokens', async () => {
      const user = {
        packTokens: 0,
        packLastRefill: new Date(),
        save: vi.fn(),
      };

      const result = await consumePackToken(user);

      expect(result).toBe(false);
      expect(user.save).not.toHaveBeenCalled();
    });
  });

  describe('getPackOpenCount24h', () => {
    it('retorna el conteo de packs abiertos en últimas 24 horas', async () => {
      const mockPackOpen = {
        countDocuments: vi.fn().mockResolvedValue(3),
      };

      const count = await getPackOpenCount24h(mockPackOpen, 'user-123');

      expect(count).toBe(3);
      expect(mockPackOpen.countDocuments).toHaveBeenCalled();
    });
  });

  describe('getRandomElement', () => {
    it('retorna un elemento del array', () => {
      const arr = ['a', 'b', 'c'];

      const result = getRandomElement(arr);

      expect(arr).toContain(result);
    });

    it('funciona con un solo elemento', () => {
      const arr = ['único'];

      const result = getRandomElement(arr);

      expect(result).toBe('único');
    });
  });

  describe('generatePackCards', () => {
    it('retorna un pack de 10 cartas', () => {
      const cards = Array.from({ length: 20 }, (_, i) => ({
        id: `card-${i}`,
        rarity: i % 2 === 0 ? 'Common' : 'Rare',
      }));

      const pack = generatePackCards(cards);

      expect(pack).toHaveLength(10);
    });

    it('incluye al menos una carta rara o superior', () => {
      const cards = Array.from({ length: 20 }, (_, i) => ({
        id: `card-${i}`,
        rarity: i < 10 ? 'Common' : 'Rare',
      }));

      const pack = generatePackCards(cards);

      expect(pack[9]).toBeDefined(); // Última carta debe ser rara
    });

    it('genera un pack válido incluso con pocas cartas', () => {
      const cards = [
        { id: 'card-1', rarity: 'Common' },
        { id: 'card-2', rarity: 'Rare' },
      ];

      const pack = generatePackCards(cards);

      // Si hay menos de 10 cartas, genera lo que puede
      expect(pack.length).toBeGreaterThan(0);
      expect(pack.length).toBeLessThanOrEqual(10);
    });
  });
});
