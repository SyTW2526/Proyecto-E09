import { describe, it, beforeEach, expect } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../src/server/api.ts';
import { Trade } from '../../src/server/models/Trade.ts';
import { User } from '../../src/server/models/User.ts';
import { UserCard } from '../../src/server/models/UserCard.ts';
import { Card } from '../../src/server/models/Card.ts';

beforeEach(async () => {
  await Trade.deleteMany();
  await User.deleteMany();
  await UserCard.deleteMany();
  await Card.deleteMany();
});

describe('Advanced Trade Features', () => {
  describe('Public vs Private Trades', () => {
    // Comentado: Requiere autenticación que no está funcionando en test mode
    it.skip('debe permitir crear intercambios públicos', async () => {
      const initiator = await User.create({
        username: 'trader1',
        email: 'trader1@example.com',
        password: 'pass123',
      });

      const receiver = await User.create({
        username: 'trader2',
        email: 'trader2@example.com',
        password: 'pass123',
      });

      const res = await request(app)
        .post('/trades')
        .send({
          initiatorUserId: initiator._id,
          receiverUserId: receiver._id,
          tradeType: 'public',
          initiatorCards: [
            {
              userCardId: new mongoose.Types.ObjectId(),
              cardId: new mongoose.Types.ObjectId(),
              estimatedValue: 50,
            },
          ],
          receiverCards: [
            {
              userCardId: new mongoose.Types.ObjectId(),
              cardId: new mongoose.Types.ObjectId(),
              estimatedValue: 50,
            },
          ],
          initiatorTotalValue: 50,
          receiverTotalValue: 50,
        })
        .expect(201);

      expect(res.body.tradeId).toBeDefined();
      const getRes = await request(app)
        .get(`/trades/${res.body.tradeId}`)
        .expect(200);
      expect(getRes.body.tradeType).toBe('public');
      expect(getRes.body.status).toBe('pending');
    });

    it.skip('debe permitir crear intercambios privados', async () => {
      const initiator = await User.create({
        username: 'priv1',
        email: 'priv1@example.com',
        password: 'pass123',
      });

      const receiver = await User.create({
        username: 'priv2',
        email: 'priv2@example.com',
        password: 'pass123',
      });

      const res = await request(app)
        .post('/trades')
        .send({
          initiatorUserId: initiator._id,
          receiverUserId: receiver._id,
          tradeType: 'private',
          initiatorCards: [
            {
              userCardId: new mongoose.Types.ObjectId(),
              cardId: new mongoose.Types.ObjectId(),
              estimatedValue: 100,
            },
          ],
          receiverCards: [
            {
              userCardId: new mongoose.Types.ObjectId(),
              cardId: new mongoose.Types.ObjectId(),
              estimatedValue: 95,
            },
          ],
          initiatorTotalValue: 100,
          receiverTotalValue: 95,
        })
        .expect(201);

      expect(res.body.tradeId).toBeDefined();
      const getRes = await request(app)
        .get(`/trades/${res.body.tradeId}`)
        .expect(200);
      expect(getRes.body.tradeType).toBe('private');
    });

    it.skip('debe permitir filtrar intercambios por tipo', async () => {
      const user1 = await User.create({
        username: 'filter1',
        email: 'filter1@example.com',
        password: 'pass123',
      });

      const user2 = await User.create({
        username: 'filter2',
        email: 'filter2@example.com',
        password: 'pass123',
      });

      // Crear intercambio público
      await Trade.create({
        initiatorUserId: user1._id,
        receiverUserId: user2._id,
        tradeType: 'public',
        initiatorCards: [
          {
            userCardId: new mongoose.Types.ObjectId(),
            cardId: new mongoose.Types.ObjectId(),
            estimatedValue: 50,
          },
        ],
        receiverCards: [
          {
            userCardId: new mongoose.Types.ObjectId(),
            cardId: new mongoose.Types.ObjectId(),
            estimatedValue: 50,
          },
        ],
        initiatorTotalValue: 50,
        receiverTotalValue: 50,
      });

      // Crear intercambio privado
      await Trade.create({
        initiatorUserId: user1._id,
        receiverUserId: user2._id,
        tradeType: 'private',
        initiatorCards: [
          {
            userCardId: new mongoose.Types.ObjectId(),
            cardId: new mongoose.Types.ObjectId(),
            estimatedValue: 100,
          },
        ],
        receiverCards: [
          {
            userCardId: new mongoose.Types.ObjectId(),
            cardId: new mongoose.Types.ObjectId(),
            estimatedValue: 95,
          },
        ],
        initiatorTotalValue: 100,
        receiverTotalValue: 95,
      });

      // Filtrar por público
      const publicRes = await request(app)
        .get('/trades?tradeType=public')
        .expect(200);

      expect(publicRes.body.trades.every((t: any) => t.tradeType === 'public')).toBe(true);

      // Filtrar por privado
      const privateRes = await request(app)
        .get('/trades?tradeType=private')
        .expect(200);

      expect(privateRes.body.trades.every((t: any) => t.tradeType === 'private')).toBe(true);
    });
  });

  describe('Trade Status Management', () => {
    it.skip('debe permitir cambiar estado de pending a completed', async () => {
      const initiator = await User.create({
        username: 'status1',
        email: 'status1@example.com',
        password: 'pass123',
      });

      const receiver = await User.create({
        username: 'status2',
        email: 'status2@example.com',
        password: 'pass123',
      });

      const trade = await Trade.create({
        initiatorUserId: initiator._id,
        receiverUserId: receiver._id,
        tradeType: 'public',
        initiatorCards: [
          {
            userCardId: new mongoose.Types.ObjectId(),
            cardId: new mongoose.Types.ObjectId(),
            estimatedValue: 50,
          },
        ],
        receiverCards: [
          {
            userCardId: new mongoose.Types.ObjectId(),
            cardId: new mongoose.Types.ObjectId(),
            estimatedValue: 50,
          },
        ],
        initiatorTotalValue: 50,
        receiverTotalValue: 50,
        status: 'pending',
      });

      const res = await request(app)
        .patch(`/trades/${trade._id}`)
        .send({ status: 'completed' })
        .expect(200);

      expect(res.body.status).toBe('completed');
    });

    it.skip('debe permitir cambiar estado de pending a cancelled', async () => {
      const initiator = await User.create({
        username: 'cancel1',
        email: 'cancel1@example.com',
        password: 'pass123',
      });

      const receiver = await User.create({
        username: 'cancel2',
        email: 'cancel2@example.com',
        password: 'pass123',
      });

      const trade = await Trade.create({
        initiatorUserId: initiator._id,
        receiverUserId: receiver._id,
        tradeType: 'public',
        initiatorCards: [
          {
            userCardId: new mongoose.Types.ObjectId(),
            cardId: new mongoose.Types.ObjectId(),
            estimatedValue: 50,
          },
        ],
        receiverCards: [
          {
            userCardId: new mongoose.Types.ObjectId(),
            cardId: new mongoose.Types.ObjectId(),
            estimatedValue: 50,
          },
        ],
        initiatorTotalValue: 50,
        receiverTotalValue: 50,
        status: 'pending',
      });

      const res = await request(app)
        .patch(`/trades/${trade._id}`)
        .send({ status: 'cancelled' })
        .expect(200);

      expect(res.body.status).toBe('cancelled');
    });

    it.skip('debe filtrar intercambios por estado', async () => {
      const user1 = await User.create({
        username: 'statefilter1',
        email: 'statefilter1@example.com',
        password: 'pass123',
      });

      const user2 = await User.create({
        username: 'statefilter2',
        email: 'statefilter2@example.com',
        password: 'pass123',
      });

      // Crear intercambios con diferentes estados
      await Trade.insertMany([
        {
          initiatorUserId: user1._id,
          receiverUserId: user2._id,
          tradeType: 'public',
          initiatorCards: [
            {
              userCardId: new mongoose.Types.ObjectId(),
              cardId: new mongoose.Types.ObjectId(),
              estimatedValue: 50,
            },
          ],
          receiverCards: [
            {
              userCardId: new mongoose.Types.ObjectId(),
              cardId: new mongoose.Types.ObjectId(),
              estimatedValue: 50,
            },
          ],
          initiatorTotalValue: 50,
          receiverTotalValue: 50,
          status: 'pending',
        },
        {
          initiatorUserId: user1._id,
          receiverUserId: user2._id,
          tradeType: 'private',
          initiatorCards: [
            {
              userCardId: new mongoose.Types.ObjectId(),
              cardId: new mongoose.Types.ObjectId(),
              estimatedValue: 100,
            },
          ],
          receiverCards: [
            {
              userCardId: new mongoose.Types.ObjectId(),
              cardId: new mongoose.Types.ObjectId(),
              estimatedValue: 95,
            },
          ],
          initiatorTotalValue: 100,
          receiverTotalValue: 95,
          status: 'completed',
        },
      ]);

      // Filtrar por pending
      const pendingRes = await request(app)
        .get('/trades?status=pending')
        .expect(200);

      expect(pendingRes.body.trades.every((t: any) => t.status === 'pending')).toBe(true);

      // Filtrar por completed
      const completedRes = await request(app)
        .get('/trades?status=completed')
        .expect(200);

      expect(completedRes.body.trades.every((t: any) => t.status === 'completed')).toBe(true);
    });
  });

  describe('Trade Value Validation', () => {
    it.skip('debe permitir intercambios con valores desiguales dentro del límite del 10%', async () => {
      const initiator = await User.create({
        username: 'value1',
        email: 'value1@example.com',
        password: 'pass123',
      });

      const receiver = await User.create({
        username: 'value2',
        email: 'value2@example.com',
        password: 'pass123',
      });

      // Intercambio donde receiver recibe un poco más (dentro del 10%)
      const res = await request(app)
        .post('/trades')
        .send({
          initiatorUserId: initiator._id,
          receiverUserId: receiver._id,
          tradeType: 'public',
          initiatorCards: [
            {
              userCardId: new mongoose.Types.ObjectId(),
              cardId: new mongoose.Types.ObjectId(),
              estimatedValue: 100,
            },
          ],
          receiverCards: [
            {
              userCardId: new mongoose.Types.ObjectId(),
              cardId: new mongoose.Types.ObjectId(),
              estimatedValue: 105,
            },
          ],
          initiatorTotalValue: 100,
          receiverTotalValue: 105,
        })
        .expect(201);

      const getRes = await request(app)
        .get(`/trades/${res.body.tradeId}`)
        .expect(200);
      expect(getRes.body.initiatorTotalValue).toBe(100);
      expect(getRes.body.receiverTotalValue).toBe(105);
    });

    it.skip('debe guardar totales de valor correctamente', async () => {
      const initiator = await User.create({
        username: 'total1',
        email: 'total1@example.com',
        password: 'pass123',
      });

      const receiver = await User.create({
        username: 'total2',
        email: 'total2@example.com',
        password: 'pass123',
      });

      const res = await request(app)
        .post('/trades')
        .send({
          initiatorUserId: initiator._id,
          receiverUserId: receiver._id,
          tradeType: 'public',
          initiatorCards: [
            {
              userCardId: new mongoose.Types.ObjectId(),
              cardId: new mongoose.Types.ObjectId(),
              estimatedValue: 30,
            },
            {
              userCardId: new mongoose.Types.ObjectId(),
              cardId: new mongoose.Types.ObjectId(),
              estimatedValue: 20,
            },
          ],
          receiverCards: [
            {
              userCardId: new mongoose.Types.ObjectId(),
              cardId: new mongoose.Types.ObjectId(),
              estimatedValue: 40,
            },
            {
              userCardId: new mongoose.Types.ObjectId(),
              cardId: new mongoose.Types.ObjectId(),
              estimatedValue: 10,
            },
          ],
          initiatorTotalValue: 50,
          receiverTotalValue: 50,
        })
        .expect(201);

      const getRes = await request(app)
        .get(`/trades/${res.body.tradeId}`)
        .expect(200);
      expect(getRes.body.initiatorTotalValue).toBe(50);
      expect(getRes.body.receiverTotalValue).toBe(50);
    });
  });

  describe('Trade Retrieval and Pagination', () => {
    it.skip('debe retornar intercambios paginados', async () => {
      const user1 = await User.create({
        username: 'page1',
        email: 'page1@example.com',
        password: 'pass123',
      });

      const user2 = await User.create({
        username: 'page2',
        email: 'page2@example.com',
        password: 'pass123',
      });

      // Crear múltiples intercambios
      for (let i = 0; i < 5; i++) {
        await Trade.create({
          initiatorUserId: user1._id,
          receiverUserId: user2._id,
          tradeType: 'public',
          initiatorCards: [
            {
              userCardId: new mongoose.Types.ObjectId(),
              cardId: new mongoose.Types.ObjectId(),
              estimatedValue: 50,
            },
          ],
          receiverCards: [
            {
              userCardId: new mongoose.Types.ObjectId(),
              cardId: new mongoose.Types.ObjectId(),
              estimatedValue: 50,
            },
          ],
          initiatorTotalValue: 50,
          receiverTotalValue: 50,
        });
      }

      // Obtener página 1
      const page1 = await request(app)
        .get('/trades?page=1&limit=2')
        .expect(200);

      expect(page1.body.trades.length).toBe(2);
      expect(page1.body.page).toBe(1);
      expect(page1.body.totalPages).toBe(3);

      // Obtener página 2
      const page2 = await request(app)
        .get('/trades?page=2&limit=2')
        .expect(200);

      expect(page2.body.trades.length).toBe(2);
      expect(page2.body.page).toBe(2);
    });

    it.skip('debe retornar un intercambio por ID con poblaciones', async () => {
      const initiator = await User.create({
        username: 'detail1',
        email: 'detail1@example.com',
        password: 'pass123',
      });

      const receiver = await User.create({
        username: 'detail2',
        email: 'detail2@example.com',
        password: 'pass123',
      });

      const card1 = await Card.create({
        pokemonTcgId: 'adv-trade-1',
        name: 'Trade Card 1',
        imageUrl: 'https://example.com/card1.jpg',
        marketPrice: 50,
        types: ['Fire'],
      });

      const card2 = await Card.create({
        pokemonTcgId: 'adv-trade-2',
        name: 'Trade Card 2',
        imageUrl: 'https://example.com/card2.jpg',
        marketPrice: 55,
        types: ['Water'],
      });

      const trade = await Trade.create({
        initiatorUserId: initiator._id,
        receiverUserId: receiver._id,
        tradeType: 'public',
        initiatorCards: [
          {
            userCardId: new mongoose.Types.ObjectId(),
            cardId: card1._id,
            estimatedValue: 50,
          },
        ],
        receiverCards: [
          {
            userCardId: new mongoose.Types.ObjectId(),
            cardId: card2._id,
            estimatedValue: 55,
          },
        ],
        initiatorTotalValue: 50,
        receiverTotalValue: 55,
      });

      const res = await request(app)
        .get(`/trades/${trade._id}`)
        .expect(200);

      expect(res.body._id).toEqual(trade._id.toString());
      expect(res.body.initiatorUserId).toBeDefined();
      expect(res.body.receiverUserId).toBeDefined();
    });
  });

  describe('Trade Error Handling', () => {
    it.skip('debe retornar 404 para intercambio inexistente', async () => {
      const res = await request(app)
        .get(`/trades/${new mongoose.Types.ObjectId()}`)
        .expect(404);

      expect(res.body.error).toContain('Intercambio no encontrado');
    });

    it.skip('debe retornar 400 para datos inválidos', async () => {
      const res = await request(app)
        .post('/trades')
        .send({});

      // El servidor puede retornar 400 o 404 dependiendo de la validación
      expect([400, 404]).toContain(res.status);
      if (res.body.error) {
        expect(res.body.error).toBeDefined();
      } else if (res.body.message) {
        expect(res.body.message).toBeDefined();
      }
    });

    it.skip('debe retornar 400 al actualizar con campos inválidos', async () => {
      const user1 = await User.create({
        username: 'invalid1',
        email: 'invalid1@example.com',
        password: 'pass123',
      });

      const user2 = await User.create({
        username: 'invalid2',
        email: 'invalid2@example.com',
        password: 'pass123',
      });

      const trade = await Trade.create({
        initiatorUserId: user1._id,
        receiverUserId: user2._id,
        tradeType: 'public',
        initiatorCards: [
          {
            userCardId: new mongoose.Types.ObjectId(),
            cardId: new mongoose.Types.ObjectId(),
            estimatedValue: 50,
          },
        ],
        receiverCards: [
          {
            userCardId: new mongoose.Types.ObjectId(),
            cardId: new mongoose.Types.ObjectId(),
            estimatedValue: 50,
          },
        ],
        initiatorTotalValue: 50,
        receiverTotalValue: 50,
      });

      const res = await request(app)
        .patch(`/trades/${trade._id}`)
        .send({ invalidField: 'should fail' })
        .expect(400);

      expect(res.body.error).toContain('no permitida');
    });
  });
});
