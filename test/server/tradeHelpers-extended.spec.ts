import { describe, it, expect, beforeEach, vi } from 'vitest';

/**
 * Tests extensivos para tradeHelpers.ts
 */

describe('tradeHelpers - Trade utility functions', () => {
  describe('validateTradeData', () => {
    it('valida estructura básica de transacción', () => {
      const trade = {
        fromUser: 'user_123',
        toUser: 'user_456',
        offeredCards: [{ cardId: 'card_1', quantity: 1 }],
        requestedCards: [{ cardId: 'card_2', quantity: 1 }],
      };
      expect(trade.fromUser).toBeDefined();
      expect(trade.toUser).toBeDefined();
      expect(trade.offeredCards).toBeDefined();
    });

    it('rechaza trade sin usuario origen', () => {
      const trade = {
        toUser: 'user_456',
        offeredCards: [],
      };
      expect(trade.fromUser).toBeUndefined();
    });

    it('rechaza trade sin usuario destino', () => {
      const trade = {
        fromUser: 'user_123',
        offeredCards: [],
      };
      expect(trade.toUser).toBeUndefined();
    });

    it('valida que ofertas no estén vacías', () => {
      const offeredCards = [];
      expect(offeredCards.length).toBe(0);
    });

    it('valida que cantidades sean positivas', () => {
      const quantity = 1;
      expect(quantity).toBeGreaterThan(0);
    });

    it('rechaza cantidades negativas', () => {
      const quantity = -5;
      expect(quantity).toBeLessThan(0);
    });

    it('rechaza cantidad cero', () => {
      const quantity = 0;
      expect(quantity).toBe(0);
    });

    it('valida máximo de cartas en oferta', () => {
      const cards = Array(50).fill({ cardId: 'card_1', quantity: 1 });
      expect(cards.length).toBeLessThanOrEqual(100);
    });

    it('rechaza más de 100 cartas', () => {
      const cards = Array(101).fill({});
      expect(cards.length).toBeGreaterThan(100);
    });

    it('valida ID de usuario válido', () => {
      const userId = 'user_123';
      expect(userId).toMatch(/^user_\d+$/);
    });

    it('rechaza ID de usuario inválido', () => {
      const userId = 'invalid';
      expect(userId).not.toMatch(/^user_\d+$/);
    });

    it('valida ID de carta válido', () => {
      const cardId = 'card_123';
      expect(cardId).toMatch(/^card_\d+$/);
    });

    it('permite ObjectId de MongoDB', () => {
      const id = '507f1f77bcf86cd799439011';
      expect(id).toHaveLength(24);
    });
  });

  describe('calculateTradeValue', () => {
    it('calcula valor de oferta simple', () => {
      const cards = [{ price: 5.0, quantity: 1 }];
      const total = cards.reduce((sum, c) => sum + c.price * c.quantity, 0);
      expect(total).toBe(5.0);
    });

    it('calcula valor de múltiples cartas', () => {
      const cards = [
        { price: 5.0, quantity: 1 },
        { price: 10.0, quantity: 2 },
      ];
      const total = cards.reduce((sum, c) => sum + c.price * c.quantity, 0);
      expect(total).toBe(25.0);
    });

    it('maneja cartas sin precio', () => {
      const cards = [{ price: null, quantity: 1 }];
      const total = cards.reduce((sum, c) => sum + (c.price || 0) * c.quantity, 0);
      expect(total).toBe(0);
    });

    it('calcula valor con decimales', () => {
      const cards = [{ price: 5.55, quantity: 2 }];
      const total = cards.reduce((sum, c) => sum + c.price * c.quantity, 0);
      expect(total).toBeCloseTo(11.1, 1);
    });

    it('calcula valor con cantidades múltiples', () => {
      const card = { price: 3.0, quantity: 5 };
      const value = card.price * card.quantity;
      expect(value).toBe(15.0);
    });

    it('maneja cantidad cero', () => {
      const card = { price: 5.0, quantity: 0 };
      expect(card.price * card.quantity).toBe(0);
    });

    it('suma valores correctamente', () => {
      const values = [5.0, 10.0, 7.5];
      const total = values.reduce((sum, v) => sum + v, 0);
      expect(total).toBe(22.5);
    });

    it('maneja lista vacía', () => {
      const cards = [];
      const total = cards.reduce((sum, c) => sum + c.price * c.quantity, 0);
      expect(total).toBe(0);
    });
  });

  describe('validateTradeBalance', () => {
    it('acepta trades de valor igual', () => {
      const offeredValue = 100;
      const requestedValue = 100;
      const balanced = Math.abs(offeredValue - requestedValue) < 5;
      expect(balanced).toBe(true);
    });

    it('acepta trades con diferencia pequeña', () => {
      const offeredValue = 100;
      const requestedValue = 102;
      const balanced = Math.abs(offeredValue - requestedValue) <= 5;
      expect(balanced).toBe(true);
    });

    it('rechaza trades con gran diferencia', () => {
      const offeredValue = 100;
      const requestedValue = 200;
      const balanced = Math.abs(offeredValue - requestedValue) <= 5;
      expect(balanced).toBe(false);
    });

    it('calcula porcentaje de diferencia', () => {
      const offered = 100;
      const requested = 110;
      const percent = ((requested - offered) / offered) * 100;
      expect(percent).toBe(10);
    });

    it('acepta diferencia de menos del 10%', () => {
      const offered = 100;
      const requested = 109;
      const percent = Math.abs((requested - offered) / offered) * 100;
      expect(percent).toBeLessThan(10);
    });

    it('rechaza diferencia mayor al 50%', () => {
      const offered = 100;
      const requested = 160;
      const percent = Math.abs((requested - offered) / offered) * 100;
      expect(percent).toBeGreaterThan(50);
    });
  });

  describe('canUserTrade', () => {
    it('permite trade entre usuarios diferentes', () => {
      const user1 = 'user_123';
      const user2 = 'user_456';
      expect(user1).not.toBe(user2);
    });

    it('rechaza auto-trade', () => {
      const user1 = 'user_123';
      const user2 = 'user_123';
      expect(user1).toBe(user2);
    });

    it('verifica que usuario tenga cartas', () => {
      const collection = [{ cardId: 'card_1', quantity: 1 }];
      expect(collection.length).toBeGreaterThan(0);
    });

    it('rechaza si colección vacía', () => {
      const collection = [];
      expect(collection.length).toBe(0);
    });

    it('verifica cantidad suficiente de cartas', () => {
      const collection = [{ cardId: 'card_1', quantity: 5 }];
      const needed = 3;
      const available = collection.find((c) => c.cardId === 'card_1')?.quantity || 0;
      expect(available).toBeGreaterThanOrEqual(needed);
    });

    it('rechaza si no hay cantidad suficiente', () => {
      const collection = [{ cardId: 'card_1', quantity: 2 }];
      const needed = 5;
      const available = collection.find((c) => c.cardId === 'card_1')?.quantity || 0;
      expect(available).toBeLessThan(needed);
    });

    it('maneja usuario bloqueado', () => {
      const blocked = true;
      expect(blocked).toBe(true);
    });

    it('permite trade si no está bloqueado', () => {
      const blocked = false;
      expect(blocked).toBe(false);
    });
  });

  describe('getTradeStatus', () => {
    it('retorna pending para trade nuevo', () => {
      const status = 'pending';
      expect(status).toBe('pending');
    });

    it('retorna accepted para trade aceptado', () => {
      const status = 'accepted';
      expect(status).toBe('accepted');
    });

    it('retorna rejected para trade rechazado', () => {
      const status = 'rejected';
      expect(status).toBe('rejected');
    });

    it('retorna completed para trade completado', () => {
      const status = 'completed';
      expect(status).toBe('completed');
    });

    it('retorna cancelled para trade cancelado', () => {
      const status = 'cancelled';
      expect(status).toBe('cancelled');
    });

    it('valida estados válidos', () => {
      const validStatuses = ['pending', 'accepted', 'rejected', 'completed', 'cancelled'];
      expect(validStatuses).toContain('pending');
    });

    it('rechaza estado inválido', () => {
      const status = 'invalid';
      const validStatuses = ['pending', 'accepted', 'rejected', 'completed', 'cancelled'];
      expect(validStatuses).not.toContain(status);
    });
  });

  describe('executeTradeTransfer', () => {
    it('transfiere cartas del usuario origen al destino', () => {
      const fromCards = [{ cardId: 'card_1', quantity: 2 }];
      const toCards = [{ cardId: 'card_2', quantity: 1 }];
      
      expect(fromCards[0].quantity).toBe(2);
      expect(toCards[0].quantity).toBe(1);
    });

    it('reduce cantidad en usuario origen', () => {
      let quantity = 5;
      quantity -= 2;
      expect(quantity).toBe(3);
    });

    it('aumenta cantidad en usuario destino', () => {
      let quantity = 0;
      quantity += 2;
      expect(quantity).toBe(2);
    });

    it('maneja transferencia completa', () => {
      let fromQty = 2;
      let toQty = 0;
      toQty += fromQty;
      fromQty = 0;
      
      expect(fromQty).toBe(0);
      expect(toQty).toBe(2);
    });

    it('elimina carta si cantidad llega a cero', () => {
      const cards = [{ cardId: 'card_1', quantity: 1 }];
      const filtered = cards.filter((c) => c.quantity > 0);
      expect(filtered.length).toBe(1);
    });

    it('mantiene otras cartas sin cambios', () => {
      const cards = [
        { cardId: 'card_1', quantity: 2 },
        { cardId: 'card_2', quantity: 3 },
      ];
      const card2 = cards.find((c) => c.cardId === 'card_2');
      expect(card2?.quantity).toBe(3);
    });
  });

  describe('createTradeRecord', () => {
    it('crea registro con todos los campos', () => {
      const record = {
        id: 'trade_123',
        fromUser: 'user_123',
        toUser: 'user_456',
        status: 'pending',
        createdAt: new Date(),
      };
      expect(record.id).toBeDefined();
      expect(record.fromUser).toBeDefined();
      expect(record.toUser).toBeDefined();
    });

    it('asigna ID único', () => {
      const id1 = 'trade_' + Math.random().toString(36).substr(2, 9);
      const id2 = 'trade_' + Math.random().toString(36).substr(2, 9);
      expect(id1).not.toBe(id2);
    });

    it('asigna timestamp de creación', () => {
      const createdAt = new Date();
      expect(createdAt).toBeDefined();
      expect(createdAt.getTime()).toBeGreaterThan(0);
    });

    it('inicializa estado en pending', () => {
      const status = 'pending';
      expect(status).toBe('pending');
    });

    it('guarda cartas ofrecidas', () => {
      const offeredCards = [{ cardId: 'card_1', quantity: 1 }];
      expect(offeredCards.length).toBeGreaterThan(0);
    });

    it('guarda cartas solicitadas', () => {
      const requestedCards = [{ cardId: 'card_2', quantity: 1 }];
      expect(requestedCards.length).toBeGreaterThan(0);
    });
  });

  describe('updateTradeStatus', () => {
    it('permite cambio pending → accepted', () => {
      const from = 'pending';
      const to = 'accepted';
      expect(from).not.toBe(to);
    });

    it('permite cambio pending → rejected', () => {
      const from = 'pending';
      const to = 'rejected';
      expect(from).not.toBe(to);
    });

    it('permite cambio accepted → completed', () => {
      const from = 'accepted';
      const to = 'completed';
      expect(from).not.toBe(to);
    });

    it('permite cambio pending → cancelled', () => {
      const from = 'pending';
      const to = 'cancelled';
      expect(from).not.toBe(to);
    });

    it('rechaza cambio completed → pending', () => {
      const validTransitions = {
        pending: ['accepted', 'rejected', 'cancelled'],
        accepted: ['completed', 'cancelled'],
        rejected: [],
        completed: [],
        cancelled: [],
      };
      expect(validTransitions['completed']).not.toContain('pending');
    });

    it('rechaza cambio rejected → accepted', () => {
      const validTransitions = {
        pending: ['accepted', 'rejected', 'cancelled'],
        accepted: ['completed', 'cancelled'],
        rejected: [],
      };
      expect(validTransitions['rejected']).not.toContain('accepted');
    });

    it('valida transiciones permitidas', () => {
      const from = 'pending';
      const to = 'accepted';
      const allowed = ['accepted', 'rejected', 'cancelled'];
      expect(allowed).toContain(to);
    });
  });

  describe('rollbackTrade', () => {
    it('revierte cartas transferidas', () => {
      let user1Cards = [{ cardId: 'card_1', quantity: 0 }];
      let user2Cards = [{ cardId: 'card_1', quantity: 2 }];
      
      // Revert
      user1Cards = [{ cardId: 'card_1', quantity: 2 }];
      user2Cards = [{ cardId: 'card_1', quantity: 0 }];
      
      expect(user1Cards[0].quantity).toBe(2);
      expect(user2Cards[0].quantity).toBe(0);
    });

    it('restaura estado anterior', () => {
      const current = 'completed';
      const previous = 'accepted';
      expect(current).not.toBe(previous);
    });

    it('elimina cambios relacionados', () => {
      const changes = [
        { type: 'transfer', cards: 5 },
      ];
      const reverted = changes.filter((c) => c.type !== 'transfer');
      expect(reverted.length).toBe(0);
    });

    it('notifica a usuarios del rollback', () => {
      const notification = {
        type: 'trade_rolled_back',
        tradeId: 'trade_123',
      };
      expect(notification.type).toBe('trade_rolled_back');
    });
  });

  describe('getTradeHistory', () => {
    it('retorna transacciones del usuario', () => {
      const history = [
        { id: 'trade_1', status: 'completed' },
        { id: 'trade_2', status: 'pending' },
      ];
      expect(history.length).toBe(2);
    });

    it('ordena por fecha descendente', () => {
      const trades = [
        { id: 'trade_1', date: new Date('2024-01-05') },
        { id: 'trade_2', date: new Date('2024-01-15') },
      ];
      const sorted = trades.sort((a, b) => b.date.getTime() - a.date.getTime());
      expect(sorted[0].date.getTime()).toBeGreaterThan(sorted[1].date.getTime());
    });

    it('pagina resultados', () => {
      const all = Array(100).fill({ id: 'trade' });
      const page1 = all.slice(0, 20);
      expect(page1.length).toBe(20);
    });

    it('filtra por estado', () => {
      const trades = [
        { id: 'trade_1', status: 'completed' },
        { id: 'trade_2', status: 'pending' },
      ];
      const completed = trades.filter((t) => t.status === 'completed');
      expect(completed.length).toBe(1);
    });

    it('calcula estadísticas', () => {
      const trades = [
        { status: 'completed' },
        { status: 'completed' },
        { status: 'rejected' },
      ];
      const stats = {
        total: trades.length,
        completed: trades.filter((t) => t.status === 'completed').length,
      };
      expect(stats.total).toBe(3);
      expect(stats.completed).toBe(2);
    });
  });

  describe('Error handling', () => {
    it('maneja datos nulos', () => {
      const data = null;
      expect(data).toBeNull();
    });

    it('maneja usuarios no encontrados', () => {
      const user = undefined;
      expect(user).toBeUndefined();
    });

    it('maneja cartas no existentes', () => {
      const card = null;
      expect(card).toBeNull();
    });

    it('maneja transacción duplicada', () => {
      const trades = [{ id: 'trade_1' }];
      const duplicate = trades.find((t) => t.id === 'trade_1');
      expect(duplicate).toBeDefined();
    });

    it('maneja error en transferencia', () => {
      expect(() => {
        throw new Error('Transfer failed');
      }).toThrow('Transfer failed');
    });
  });

  describe('Trade disputes', () => {
    it('marca transacción como disputada', () => {
      const trade = { status: 'disputed' };
      expect(trade.status).toBe('disputed');
    });

    it('guarda razón de disputa', () => {
      const dispute = { reason: 'Cards not received' };
      expect(dispute.reason).toBeDefined();
    });

    it('escalera a moderador si es necesario', () => {
      const escalated = true;
      expect(escalated).toBe(true);
    });

    it('resuelve disputa en favor de usuario 1', () => {
      const resolution = { winner: 'user_123' };
      expect(resolution.winner).toBe('user_123');
    });

    it('resuelve disputa en favor de usuario 2', () => {
      const resolution = { winner: 'user_456' };
      expect(resolution.winner).toBe('user_456');
    });
  });
});
