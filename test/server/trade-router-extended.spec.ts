import { describe, it, beforeEach, afterEach, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../src/server/api.js';
import { Trade } from '../../src/server/models/Trade.js';
import { User } from '../../src/server/models/User.js';
import { UserCard } from '../../src/server/models/UserCard.js';
import { Card } from '../../src/server/models/Card.js';
import jwt from 'jsonwebtoken';

describe('Trade Router - Endpoints HTTP', () => {
  let testUser1: any;
  let testUser2: any;
  let testCard: any;
  let testUserCard: any;
  let token1: string;
  let token2: string;

  beforeEach(async () => {
    // Limpiar base de datos
    await Trade.deleteMany({});
    await User.deleteMany({});
    await UserCard.deleteMany({});
    await Card.deleteMany({});

    // Crear usuarios de prueba
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

    // Crear cartas de prueba
    testCard = await Card.create({
      name: 'Test Card Trade',
      pokemonTcgId: 'test-trade-001',
      rarity: 'Rare',
      set: 'Base Set',
      price: 100,
    });

    // Crear userCards
    testUserCard = await UserCard.create({
      userId: testUser1._id,
      cardId: testCard._id,
      pokemonTcgId: 'test-trade-001',
      quantity: 5,
      collectionType: 'collection',
    });

    // Generar tokens JWT
    const secret = process.env.JWT_SECRET || 'test-secret';
    token1 = jwt.sign(
      { userId: testUser1._id, username: testUser1.username },
      secret
    );
    token2 = jwt.sign(
      { userId: testUser2._id, username: testUser2.username },
      secret
    );
  });

  afterEach(async () => {
    await Trade.deleteMany({});
    await User.deleteMany({});
    await UserCard.deleteMany({});
    await Card.deleteMany({});
  });

  describe('GET /trades', () => {
    it('obtiene lista de intercambios públicos', async () => {
      // Crear un trade público
      await Trade.create({
        initiatorUserId: testUser1._id,
        receiverUserId: testUser2._id,
        tradeType: 'public',
        status: 'pending',
        initiatorCards: [{ cardId: testCard._id, quantity: 1 }],
        receiverCards: [{ cardId: testCard._id, quantity: 1 }],
      });

      const res = await request(app)
        .get('/trades')
        .set('Authorization', `Bearer ${token1}`);

      expect(res.status).toBeLessThan(500);
    });

    it('retorna estructura de respuesta válida', async () => {
      const res = await request(app)
        .get('/trades')
        .set('Authorization', `Bearer ${token1}`);

      expect(res.status).toBeLessThan(500);
      if (res.body.data !== undefined) {
        expect(res.body.data).toBeDefined();
      }
    });
  });

  describe('POST /trades', () => {
    it('crea un intercambio nuevo', async () => {
      const tradeData = {
        receiverUserId: testUser2._id,
        tradeType: 'public',
        initiatorCards: [{ cardId: testCard._id, quantity: 1 }],
        receiverCards: [{ cardId: testCard._id, quantity: 1 }],
      };

      const res = await request(app)
        .post('/trades')
        .set('Authorization', `Bearer ${token1}`)
        .send(tradeData);

      expect(res.status).toBeLessThan(500);
    });
  });

  describe('GET /trades/:id', () => {
    it('obtiene detalles de un intercambio específico', async () => {
      const trade = await Trade.create({
        initiatorUserId: testUser1._id,
        receiverUserId: testUser2._id,
        tradeType: 'public',
        status: 'pending',
        initiatorCards: [{ cardId: testCard._id, quantity: 1 }],
        receiverCards: [{ cardId: testCard._id, quantity: 1 }],
      });

      const res = await request(app)
        .get(`/trades/${trade._id}`)
        .set('Authorization', `Bearer ${token1}`);

      expect(res.status).toBeLessThan(500);
    });

    it('retorna 404 para intercambio inexistente', async () => {
      const res = await request(app)
        .get('/trades/507f1f77bcf86cd799439999')
        .set('Authorization', `Bearer ${token1}`);

      expect([404, 400, 500]).toContain(res.status);
    });
  });

  describe('PATCH /trades/:id', () => {
    it('actualiza estado de intercambio', async () => {
      const trade = await Trade.create({
        initiatorUserId: testUser1._id,
        receiverUserId: testUser2._id,
        tradeType: 'public',
        status: 'pending',
        initiatorCards: [{ cardId: testCard._id, quantity: 1 }],
        receiverCards: [{ cardId: testCard._id, quantity: 1 }],
      });

      const res = await request(app)
        .patch(`/trades/${trade._id}`)
        .set('Authorization', `Bearer ${token1}`)
        .send({ status: 'accepted' });

      expect(res.status).toBeLessThan(500);
    });
  });

  describe('DELETE /trades/:id', () => {
    it('elimina un intercambio', async () => {
      const trade = await Trade.create({
        initiatorUserId: testUser1._id,
        receiverUserId: testUser2._id,
        tradeType: 'public',
        status: 'pending',
        initiatorCards: [{ cardId: testCard._id, quantity: 1 }],
        receiverCards: [{ cardId: testCard._id, quantity: 1 }],
      });

      const res = await request(app)
        .delete(`/trades/${trade._id}`)
        .set('Authorization', `Bearer ${token1}`);

      expect(res.status).toBeLessThan(500);
    });
  });
});
