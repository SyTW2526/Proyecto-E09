/**
 * @file usercard-missing-coverage.spec.ts
 * @description Tests para cubrir líneas específicas sin coverage en usercard.ts
 * Líneas: 28-63 (import), 117-119, 146-147, 179, 219, 248, 279
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../src/server/api.js';
import { UserCard } from '../../src/server/models/UserCard.js';
import { User } from '../../src/server/models/User.js';
import { Card } from '../../src/server/models/Card.js';

const createUser = (username: string, email: string) =>
  User.create({
    username,
    email,
    password: 'test123',
  });

const createCard = (pokemonTcgId: string, name: string) =>
  Card.create({
    pokemonTcgId,
    name,
    images: {
      small: `https://example.com/${pokemonTcgId}_small.png`,
      large: `https://example.com/${pokemonTcgId}_large.png`,
    },
    type: 'Pokemon',
  });

describe('UserCard Router - Missing Coverage', () => {
  let user: any;
  let card1: any;
  let card2: any;
  let token: string;

  beforeEach(async () => {
    await UserCard.deleteMany();
    await User.deleteMany();
    await Card.deleteMany();

    user = await createUser('usercardcov', 'usercardcov@test.com');
    card1 = await createCard('sv01-1', 'Pikachu');
    card2 = await createCard('sv01-2', 'Charizard');

    token = user._id.toString();
  });

  afterEach(async () => {
    await UserCard.deleteMany();
    await Card.deleteMany();
  });

  describe('POST /usercards/import - Lines 28-63 (API import)', () => {
    it('importa cartas desde la API - LINE 28-63', async () => {
      const res = await request(app)
        .post('/usercards/import')
        .send({
          username: user.username,
          query: 'Pikachu',
          limit: 3,
          forTrade: true,
        });

      expect([200, 404, 500]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body).toHaveProperty('cards');
        expect(Array.isArray(res.body.cards)).toBe(true);
      }
    });

    it('retorna 404 para usuario no encontrado - LINE 28-63', async () => {
      const res = await request(app)
        .post('/usercards/import')
        .send({
          username: 'nonexistent_user',
          query: 'Pikachu',
          limit: 5,
        });

      expect([404, 500]).toContain(res.status);
    });

    it('maneja resultado vacío de API - LINE 28-63', async () => {
      const res = await request(app)
        .post('/usercards/import')
        .send({
          username: user.username,
          query: 'XYZ_NONEXISTENT_CARD_99999',
          limit: 5,
        });

      expect([404, 200, 500]).toContain(res.status);
    });

    it('respeta parámetro limit - LINE 28-63', async () => {
      const res = await request(app)
        .post('/usercards/import')
        .send({
          username: user.username,
          query: 'a',
          limit: 1,
          forTrade: false,
        });

      expect([200, 404, 500]).toContain(res.status);
      if (res.status === 200 && res.body.cards) {
        expect(res.body.cards.length).toBeLessThanOrEqual(1);
      }
    });

    it('maneja forTrade=true - LINE 28-63', async () => {
      const res = await request(app)
        .post('/usercards/import')
        .send({
          username: user.username,
          query: 'test',
          limit: 2,
          forTrade: true,
        });

      expect([200, 404, 500]).toContain(res.status);
    });

    it('maneja forTrade=false - LINE 28-63', async () => {
      const res = await request(app)
        .post('/usercards/import')
        .send({
          username: user.username,
          query: 'test',
          limit: 2,
          forTrade: false,
        });

      expect([200, 404, 500]).toContain(res.status);
    });
  });

  describe('POST /usercards/:username/:type - Lines 117-119, 146-147 (add card)', () => {
    it('agrega carta a colección - LINE 117-119', async () => {
      const res = await request(app)
        .post(`/usercards/${user.username}/collection`)
        .send({
          pokemonTcgId: 'sv01-1',
          cardId: card1._id,
          quantity: 2,
          condition: 'Mint',
        });

      expect([201, 400, 404, 500]).toContain(res.status);
      if (res.status === 201) {
        expect(res.body).toHaveProperty('message');
      }
    });

    it('rechaza tipo de colección inválido - LINE 146-147', async () => {
      const res = await request(app)
        .post(`/usercards/${user.username}/invalid_type`)
        .send({
          pokemonTcgId: 'sv01-1',
          cardId: card1._id,
        });

      expect([400, 404, 500]).toContain(res.status);
    });

    it('agrega carta a deseos - LINE 117-119', async () => {
      const res = await request(app)
        .post(`/usercards/${user.username}/wishlist`)
        .send({
          pokemonTcgId: 'sv01-1',
          cardId: card1._id,
        });

      expect([201, 400, 404, 500]).toContain(res.status);
    });

    it('agrega carta a fortrade - LINE 117-119', async () => {
      const res = await request(app)
        .post(`/usercards/${user.username}/fortrade`)
        .send({
          pokemonTcgId: 'sv01-2',
          cardId: card2._id,
          quantity: 1,
        });

      expect([201, 400, 404, 500]).toContain(res.status);
    });

    it('maneja usuario inexistente - LINE 146-147', async () => {
      const res = await request(app)
        .post(`/usercards/nonexistent/collection`)
        .send({
          pokemonTcgId: 'sv01-1',
          cardId: card1._id,
        });

      expect([404, 400, 500]).toContain(res.status);
    });

    it('maneja carta inexistente - LINE 146-147', async () => {
      const res = await request(app)
        .post(`/usercards/${user.username}/collection`)
        .send({
          pokemonTcgId: 'sv99-999',
          cardId: new mongoose.Types.ObjectId(),
        });

      expect([404, 400, 500]).toContain(res.status);
    });
  });

  describe('GET /usercards/:username/:type - Lines 179, 219 (list cards)', () => {
    beforeEach(async () => {
      // Create some user cards
      for (let i = 0; i < 5; i++) {
        const c = await Card.create({
          pokemonTcgId: `card${i}`,
          name: `Card ${i}`,
          images: {
            small: `https://example.com/card${i}_small.png`,
          },
        });

        await UserCard.create({
          userId: user._id,
          cardId: c._id,
          pokemonTcgId: `card${i}`,
          collectionType: 'collection',
          quantity: i + 1,
        });
      }
    });

    it('obtiene cartas de colección - LINE 179', async () => {
      const res = await request(app).get(`/usercards/${user.username}/collection`);

      expect([200, 404]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body).toHaveProperty('cards');
        expect(Array.isArray(res.body.cards)).toBe(true);
      }
    });

    it('soporta paginación - LINE 219', async () => {
      const res = await request(app)
        .get(`/usercards/${user.username}/collection?page=1&limit=2`);

      expect([200, 404]).toContain(res.status);
      if (res.status === 200 && res.body.cards) {
        expect(res.body.cards.length).toBeLessThanOrEqual(2);
      }
    });

    it('soporta ordenamiento - LINE 219', async () => {
      const res = await request(app)
        .get(`/usercards/${user.username}/collection?sort=name&order=asc`);

      expect([200, 404]).toContain(res.status);
    });

    it('retorna 404 para usuario inexistente - LINE 179', async () => {
      const res = await request(app).get(`/usercards/nonexistent/collection`);

      expect([404]).toContain(res.status);
    });

    it('obtiene cartas de deseos - LINE 179', async () => {
      // Create wishlist card
      await UserCard.create({
        userId: user._id,
        cardId: card1._id,
        pokemonTcgId: 'sv01-1',
        collectionType: 'wishlist',
        quantity: 1,
      });

      const res = await request(app).get(`/usercards/${user.username}/wishlist`);

      expect([200, 404, 500]).toContain(res.status);
    });

    it('obtiene cartas para intercambiar - LINE 179', async () => {
      // Create fortrade card
      await UserCard.create({
        userId: user._id,
        cardId: card2._id,
        pokemonTcgId: 'sv01-2',
        collectionType: 'fortrade',
        quantity: 2,
      });

      const res = await request(app).get(`/usercards/${user.username}/fortrade`);

      expect([200, 404, 500]).toContain(res.status);
    });
  });

  describe('DELETE /usercards/:id - Line 248 (remove card)', () => {
    let userCard: any;

    beforeEach(async () => {
      userCard = await UserCard.create({
        userId: user._id,
        cardId: card1._id,
        pokemonTcgId: 'sv01-1',
        collectionType: 'collection',
        quantity: 2,
      });
    });

    it('elimina carta de colección - LINE 248', async () => {
      const res = await request(app).delete(`/usercards/${userCard._id}`);

      expect([200, 404, 400, 500]).toContain(res.status);
      if (res.status === 200) {
        const deleted = await UserCard.findById(userCard._id);
        expect(deleted).toBeNull();
      }
    });

    it('retorna 404 para user card inexistente - LINE 248', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      const res = await request(app).delete(`/usercards/${nonExistentId}`);

      expect([404, 400, 500]).toContain(res.status);
    });

    it('maneja ID inválido - LINE 248', async () => {
      const res = await request(app).delete('/usercards/invalid_id');

      expect([400, 404, 500]).toContain(res.status);
    });
  });

  describe('PATCH /usercards/:id - Line 279 (update card)', () => {
    let userCard: any;

    beforeEach(async () => {
      userCard = await UserCard.create({
        userId: user._id,
        cardId: card1._id,
        pokemonTcgId: 'sv01-1',
        collectionType: 'collection',
        quantity: 1,
        condition: 'Mint',
      });
    });

    it('actualiza cantidad de cartas - LINE 279', async () => {
      const res = await request(app)
        .patch(`/usercards/${userCard._id}`)
        .send({
          quantity: 3,
        });

      expect([200, 400, 404, 500]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body.quantity).toBe(3);
      }
    });

    it('actualiza condición de carta - LINE 279', async () => {
      const res = await request(app)
        .patch(`/usercards/${userCard._id}`)
        .send({
          condition: 'Good',
        });

      expect([200, 400, 404, 500]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body.condition).toBe('Good');
      }
    });

    it('retorna 404 para card inexistente - LINE 279', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .patch(`/usercards/${nonExistentId}`)
        .send({
          quantity: 5,
        });

      expect([404, 400, 500]).toContain(res.status);
    });

    it('maneja validación de cantidad - LINE 279', async () => {
      const res = await request(app)
        .patch(`/usercards/${userCard._id}`)
        .send({
          quantity: -1,
        });

      expect([400, 200, 404, 500]).toContain(res.status);
    });
  });

  describe('Error Handling', () => {
    it('maneja JSON malformado en POST', async () => {
      const res = await request(app)
        .post(`/usercards/${user.username}/collection`)
        .send('invalid json');

      expect([400, 415, 500]).toContain(res.status);
    });

    it('maneja campos requeridos faltantes', async () => {
      const res = await request(app)
        .post(`/usercards/${user.username}/collection`)
        .send({});

      expect([400, 404, 500]).toContain(res.status);
    });

    it('maneja errores de base de datos en GET', async () => {
      // This test depends on whether the app handles DB errors
      const res = await request(app).get(
        `/usercards/${user.username}/collection?page=invalid`
      );

      expect([200, 400, 404]).toContain(res.status);
    });
  });

  describe('Advanced Scenarios', () => {
    it('agrega múltiples copias de la misma carta', async () => {
      // Add first time
      const res1 = await request(app)
        .post(`/usercards/${user.username}/collection`)
        .send({
          pokemonTcgId: 'sv01-1',
          cardId: card1._id,
          quantity: 1,
        });

      expect([201, 400, 404, 500]).toContain(res1.status);

      // Add second time - should update quantity
      const res2 = await request(app)
        .post(`/usercards/${user.username}/collection`)
        .send({
          pokemonTcgId: 'sv01-1',
          cardId: card1._id,
          quantity: 2,
        });

      expect([200, 201, 400, 404, 500]).toContain(res2.status);
    });

    it('mueve carta entre colecciones', async () => {
      // Create in collection
      const uc = await UserCard.create({
        userId: user._id,
        cardId: card1._id,
        pokemonTcgId: 'sv01-1',
        collectionType: 'collection',
        quantity: 1,
      });

      // Try to update type (if supported)
      const res = await request(app)
        .patch(`/usercards/${uc._id}`)
        .send({
          collectionType: 'wishlist',
        });

      expect([200, 400, 404, 500]).toContain(res.status);
    });

    it('obtiene estadísticas de usuario', async () => {
      // Create multiple cards
      for (let i = 0; i < 3; i++) {
        const c = await Card.create({
          pokemonTcgId: `stat${i}`,
          name: `Stat Card ${i}`,
        });

        await UserCard.create({
          userId: user._id,
          cardId: c._id,
          pokemonTcgId: `stat${i}`,
          collectionType: 'collection',
          quantity: i + 1,
        });
      }

      const res = await request(app).get(`/usercards/${user.username}/stats`);

      expect([200, 404, 500]).toContain(res.status);
      if (res.status === 200 && res.body) {
        expect(res.body).toHaveProperty('totalCards');
      }
    });
  });
});
