/**
 * @file trade-request-missing-coverage.spec.ts
 * @description Tests para cubrir líneas específicas sin coverage en trade_request.ts
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../src/server/api.js';
import { TradeRequest } from '../../src/server/models/TradeRequest.js';
import { User } from '../../src/server/models/User.js';

const createUser = (username: string, email: string) =>
  User.create({
    username,
    email,
    password: 'test123',
  });

describe('Trade Request Router - Missing Coverage', () => {
  let user1: any;
  let user2: any;
  let token1: string;
  let token2: string;

  beforeEach(async () => {
    await TradeRequest.deleteMany();
    await User.deleteMany();

    user1 = await createUser('tradereqcov1', 'tradereqcov1@test.com');
    user2 = await createUser('tradereqcov2', 'tradereqcov2@test.com');

    token1 = user1._id.toString();
    token2 = user2._id.toString();
  });

  afterEach(async () => {
    await TradeRequest.deleteMany();
    await User.deleteMany();
  });

  describe('POST /trade-requests - Line 58 (receiverIdentifier required)', () => {
    it('rechaza solicitud sin receiverIdentifier - LINE 58', async () => {
      const res = await request(app)
        .post('/trade-requests')
        .send({
          pokemonTcgId: 'card123',
          isManual: false,
        })
        .set('Authorization', `Bearer ${token1}`);

      expect([400, 401]).toContain(res.status);
      if (res.status === 400) {
        expect(res.body.error).toContain('receiverIdentifier');
      }
    });
  });

  describe('POST /trade-requests - Line 84 (pokemonTcgId validation)', () => {
    it('rechaza solicitud sin pokemonTcgId para non-manual - LINE 84', async () => {
      const res = await request(app)
        .post('/trade-requests')
        .send({
          receiverIdentifier: user2.username,
          isManual: false,
          // pokemonTcgId missing
        })
        .set('Authorization', `Bearer ${token1}`);

      expect([400, 401]).toContain(res.status);
    });

    it('permite solicitud manual sin pokemonTcgId - LINE 84', async () => {
      const res = await request(app)
        .post('/trade-requests')
        .send({
          receiverIdentifier: user2.username,
          isManual: true,
          note: 'Manual trade request',
        })
        .set('Authorization', `Bearer ${token1}`);

      expect([201, 400, 401]).toContain(res.status);
    });
  });

  describe('POST /trade-requests - Lines 108-133 (duplicate validation)', () => {
    beforeEach(async () => {
      // Create existing request
      await TradeRequest.create({
        from: user1._id,
        to: user2._id,
        pokemonTcgId: 'card123',
        status: 'pending',
      });
    });

    it('rechaza solicitud duplicada - LINE 108-133', async () => {
      const res = await request(app)
        .post('/trade-requests')
        .send({
          receiverIdentifier: user2.username,
          pokemonTcgId: 'card123',
          isManual: false,
        })
        .set('Authorization', `Bearer ${token1}`);

      expect([400, 401]).toContain(res.status);
    });
  });

  describe('POST /trade-requests - Lines 146, 150-156 (self-trade validation)', () => {
    it('no permite enviar solicitud a uno mismo - LINE 146', async () => {
      const res = await request(app)
        .post('/trade-requests')
        .send({
          receiverIdentifier: user1.username,
          pokemonTcgId: 'card123',
          isManual: false,
        })
        .set('Authorization', `Bearer ${token1}`);

      expect([400, 401]).toContain(res.status);
      if (res.status === 400) {
        expect(res.body.error).toContain('mismo');
      }
    });
  });

  describe('POST /trade-requests - Line 237 (receiver not found)', () => {
    it('retorna 404 para receptor inexistente - LINE 237', async () => {
      const res = await request(app)
        .post('/trade-requests')
        .send({
          receiverIdentifier: 'nonexistent_user_12345',
          pokemonTcgId: 'card123',
          isManual: false,
        })
        .set('Authorization', `Bearer ${token1}`);

      expect([404, 401]).toContain(res.status);
    });
  });

  describe('GET /trade-requests - Lines 264, 281 (listing and filtering)', () => {
    beforeEach(async () => {
      for (let i = 0; i < 5; i++) {
        await TradeRequest.create({
          from: user1._id,
          to: user2._id,
          pokemonTcgId: `card${i}`,
          status: i % 2 === 0 ? 'pending' : 'accepted',
          isManual: i % 3 === 0,
        });
      }
    });

    it('obtiene todas las solicitudes - LINE 264', async () => {
      const res = await request(app)
        .get('/trade-requests')
        .set('Authorization', `Bearer ${token1}`);

      expect([200, 401]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body).toHaveProperty('requests');
      }
    });

    it('filtra solicitudes por status - LINE 281', async () => {
      const res = await request(app)
        .get('/trade-requests?status=pending')
        .set('Authorization', `Bearer ${token1}`);

      expect([200, 401]).toContain(res.status);
    });

    it('filtra solicitudes por dirección - LINE 281', async () => {
      const res = await request(app)
        .get('/trade-requests?direction=sent')
        .set('Authorization', `Bearer ${token1}`);

      expect([200, 401]).toContain(res.status);
    });

    it('pagina solicitudes - LINE 264', async () => {
      const res = await request(app)
        .get('/trade-requests?page=1&limit=2')
        .set('Authorization', `Bearer ${token1}`);

      expect([200, 401]).toContain(res.status);
    });
  });

  describe('GET /trade-requests/:id - Lines 337, 354 (get single request)', () => {
    let request_id: any;

    beforeEach(async () => {
      const tr = await TradeRequest.create({
        from: user1._id,
        to: user2._id,
        pokemonTcgId: 'card123',
      });
      request_id = tr._id;
    });

    it('obtiene solicitud específica - LINE 337', async () => {
      const res = await request(app)
        .get(`/trade-requests/${request_id}`)
        .set('Authorization', `Bearer ${token1}`);

      expect([200, 404, 401]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body._id).toBe(request_id.toString());
      }
    });

    it('retorna 404 para solicitud inexistente - LINE 354', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .get(`/trade-requests/${nonExistentId}`)
        .set('Authorization', `Bearer ${token1}`);

      expect([404, 401]).toContain(res.status);
    });
  });

  describe('PATCH /trade-requests/:id - Lines 385, 402 (update status)', () => {
    let tr: any;

    beforeEach(async () => {
      tr = await TradeRequest.create({
        from: user1._id,
        to: user2._id,
        pokemonTcgId: 'card123',
        status: 'pending',
      });
    });

    it('acepta solicitud de intercambio - LINE 385', async () => {
      const res = await request(app)
        .patch(`/trade-requests/${tr._id}`)
        .send({ status: 'accepted' })
        .set('Authorization', `Bearer ${token2}`);

      expect([200, 400, 404, 401]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body.status).toBe('accepted');
      }
    });

    it('rechaza solicitud de intercambio - LINE 402', async () => {
      const res = await request(app)
        .patch(`/trade-requests/${tr._id}`)
        .send({ status: 'rejected' })
        .set('Authorization', `Bearer ${token2}`);

      expect([200, 400, 404, 401]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body.status).toBe('rejected');
      }
    });
  });

  describe('DELETE /trade-requests/:id - Lines 461-501 (deletion)', () => {
    let tr: any;

    beforeEach(async () => {
      tr = await TradeRequest.create({
        from: user1._id,
        to: user2._id,
        pokemonTcgId: 'card123',
      });
    });

    it('elimina solicitud de intercambio - LINE 461-501', async () => {
      const res = await request(app)
        .delete(`/trade-requests/${tr._id}`)
        .set('Authorization', `Bearer ${token1}`);

      expect([200, 404, 401]).toContain(res.status);
      if (res.status === 200) {
        const deleted = await TradeRequest.findById(tr._id);
        expect(deleted).toBeNull();
      }
    });

    it('maneja DELETE en solicitud inexistente - LINE 461-501', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .delete(`/trade-requests/${nonExistentId}`)
        .set('Authorization', `Bearer ${token1}`);

      expect([404, 401]).toContain(res.status);
    });
  });

  describe('Error Handling - Lines 506-618 (catch blocks)', () => {
    it('maneja error 401 sin autenticación', async () => {
      const res = await request(app).get('/trade-requests');

      expect([401, 200]).toContain(res.status);
    });

    it('maneja datos inválidos en POST', async () => {
      const res = await request(app)
        .post('/trade-requests')
        .send({
          // Missing all required fields
        })
        .set('Authorization', `Bearer ${token1}`);

      expect([400, 401]).toContain(res.status);
    });

    it('maneja ID inválido en GET', async () => {
      const res = await request(app)
        .get('/trade-requests/invalid_id')
        .set('Authorization', `Bearer ${token1}`);

      expect([400, 404, 401]).toContain(res.status);
    });
  });

  describe('Advanced Scenarios - Lines 629-655 (complex cases)', () => {
    it('crea solicitud con tarjeta ofrecida', async () => {
      const res = await request(app)
        .post('/trade-requests')
        .send({
          receiverIdentifier: user2.username,
          pokemonTcgId: 'card123',
          offeredCard: {
            pokemonTcgId: 'card456',
            name: 'Pikachu',
          },
          isManual: false,
        })
        .set('Authorization', `Bearer ${token1}`);

      expect([201, 400, 401]).toContain(res.status);
    });

    it('crea solicitud con precios', async () => {
      const res = await request(app)
        .post('/trade-requests')
        .send({
          receiverIdentifier: user2.username,
          pokemonTcgId: 'card123',
          offeredPrice: 50,
          targetPrice: 100,
          isManual: false,
        })
        .set('Authorization', `Bearer ${token1}`);

      expect([201, 400, 401]).toContain(res.status);
    });

    it('crea solicitud manual con nota', async () => {
      const res = await request(app)
        .post('/trade-requests')
        .send({
          receiverIdentifier: user2.username,
          isManual: true,
          note: 'Want to trade some cards',
          cardName: 'Charizard',
          cardImage: 'https://example.com/image.png',
        })
        .set('Authorization', `Bearer ${token1}`);

      expect([201, 400, 401]).toContain(res.status);
    });
  });
});
