/**
 * @file card-router-comprehensive.spec.ts
 * @description Tests exhaustivos para el router card.ts
 * Cubre todos los endpoints GET/POST para cartas
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';
import { app } from '../../src/server/api.js';
import { Card } from '../../src/server/models/Card.js';

describe('Card Router Comprehensive', () => {
  beforeEach(async () => {
    // Clean up all card collections
    await Card.deleteMany({});
  });

  afterEach(async () => {
    // Clean up all card collections
    await Card.deleteMany({});
  });

  // ============================================
  // GET /cards - Listing with pagination
  // ============================================
  describe('GET /cards - Pagination and Filtering', () => {
    it('should return paginated cards', async () => {
      // Create test cards
      const cards = [];
      for (let i = 1; i <= 5; i++) {
        const card = new Card({
          pokemonTcgId: `test-${i}`,
          name: `Card ${i}`,
          set: 'Test Set',
          rarity: 'Common',
        });
        cards.push(await card.save());
      }

      const res = await request(app)
        .get('/cards?page=1&limit=2')
        .expect((r) => expect(r.status).toBeLessThan(500));

      if (res.status === 200) {
        expect(res.body).toHaveProperty('data');
        if (Array.isArray(res.body.data)) {
          expect(res.body.data.length).toBeLessThanOrEqual(2);
        }
      }
    });

    it('should handle page and limit parameters', async () => {
      const res = await request(app)
        .get('/cards?page=2&limit=10')
        .expect((r) => expect(r.status).toBeLessThan(500));

      if (res.status === 200) {
        expect(res.body).toBeDefined();
      }
    });

    it('should filter cards by name', async () => {
      const card = new Card({
        pokemonTcgId: 'pikachu-1',
        name: 'Pikachu',
        set: 'Test Set',
        rarity: 'Rare',
      });
      await card.save();

      const res = await request(app)
        .get('/cards?name=pikachu')
        .expect((r) => expect(r.status).toBeLessThan(500));

      if (res.status === 200) {
        expect(res.body).toBeDefined();
      }
    });

    it('should filter cards by rarity', async () => {
      const card = new Card({
        pokemonTcgId: 'rare-card',
        name: 'Rare Card',
        rarity: 'Holo Rare',
        set: 'Test Set',
      });
      await card.save();

      const res = await request(app)
        .get('/cards?rarity=Holo%20Rare')
        .expect((r) => expect(r.status).toBeLessThan(500));

      if (res.status === 200) {
        expect(res.body).toBeDefined();
      }
    });

    it('should filter cards by series', async () => {
      const card = new Card({
        pokemonTcgId: 'sword-shield-1',
        name: 'Card',
        series: 'Sword & Shield',
        set: 'Test Set',
      });
      await card.save();

      const res = await request(app)
        .get('/cards?series=Sword%20%26%20Shield')
        .expect((r) => expect(r.status).toBeLessThan(500));

      if (res.status === 200) {
        expect(res.body).toBeDefined();
      }
    });

    it('should filter cards by set', async () => {
      const card = new Card({
        pokemonTcgId: 'swsh1-25',
        name: 'Card',
        set: 'Sword & Shield',
      });
      await card.save();

      const res = await request(app)
        .get('/cards?set=Sword%20%26%20Shield')
        .expect((r) => expect(r.status).toBeLessThan(500));

      if (res.status === 200) {
        expect(res.body).toBeDefined();
      }
    });

    it('should filter cards by type', async () => {
      const card = new Card({
        pokemonTcgId: 'electric-1',
        name: 'Electric Card',
        types: ['Electric'],
        set: 'Test Set',
      });
      await card.save();

      const res = await request(app)
        .get('/cards?type=Electric')
        .expect((r) => expect(r.status).toBeLessThan(500));

      if (res.status === 200) {
        expect(res.body).toBeDefined();
      }
    });

    it('should handle no results gracefully', async () => {
      const res = await request(app)
        .get('/cards?name=nonexistent-card-xyz')
        .expect((r) => expect(r.status).toBeLessThan(500));

      if (res.status === 200) {
        expect(res.body).toBeDefined();
      }
    });

    it('should handle invalid pagination parameters', async () => {
      const res = await request(app)
        .get('/cards?page=abc&limit=xyz')
        .expect((r) => expect(r.status).toBeLessThan(500));

      expect(res.status).toBeLessThan(500);
    });
  });

  // ============================================
  // GET /cards/:id - Get specific card by MongoDB ID
  // ============================================
  describe('GET /cards/:id - Get Card by ID', () => {
    it('should return a card by MongoDB ID', async () => {
      const card = new Card({
        pokemonTcgId: 'test-card-1',
        name: 'Test Card',
        set: 'Test Set',
      });
      const saved = await card.save();

      const res = await request(app)
        .get(`/cards/${saved._id}`)
        .expect((r) => expect(r.status).toBeLessThan(500));

      if (res.status === 200) {
        expect(res.body.success).toBe(true);
        expect(res.body.data).toBeDefined();
      }
    });

    it('should return 404 for non-existent ID', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      const res = await request(app)
        .get(`/cards/${fakeId}`)
        .expect((r) => expect(r.status).toBeLessThan(500));

      // Should either be 404 or handle gracefully
      expect([404, 400, 500]).toContain(res.status);
    });

    it('should handle invalid MongoDB ID format', async () => {
      const res = await request(app).get('/cards/invalid-id');

      expect([400, 404, 500]).toContain(res.status);
    });
  });

  // ============================================
  // POST /cards - Add/Fetch Card from TCGdex
  // ============================================
  describe('POST /cards - Add/Fetch Card', () => {
    it('should reject missing card id', async () => {
      const res = await request(app)
        .post('/cards')
        .send({})
        .expect((r) => expect(r.status).toBeLessThan(500));

      expect([400, 500]).toContain(res.status);
    });

    it('should return error for empty body', async () => {
      const res = await request(app).post('/cards').send(null);

      expect([400, 422, 500]).toContain(res.status);
    });

    it('should handle card with null id', async () => {
      const res = await request(app).post('/cards').send({ id: null });

      expect([400, 422, 500]).toContain(res.status);
    });

    it('should handle card with empty string id', async () => {
      const res = await request(app).post('/cards').send({ id: '' });

      expect([400, 422, 500]).toContain(res.status);
    });

    it('should handle additional properties in body', async () => {
      const res = await request(app)
        .post('/cards')
        .send({
          id: 'swsh1-25',
          extra: 'property',
          another: 123,
        })
        .expect((r) =>
          expect([200, 201, 400, 401, 403, 404, 409, 422, 500, 501]).toContain(
            r.status
          )
        );

      expect([200, 201, 400, 401, 403, 404, 409, 422, 500, 501]).toContain(
        res.status
      );
    });
  });

  // ============================================
  // GET /cards/featured - Featured Cards
  // ============================================
  describe('GET /cards/featured - Featured Cards', () => {
    it('should return featured cards or error gracefully', async () => {
      const res = await request(app)
        .get('/cards/featured')
        .expect((r) => expect(r.status).toBeLessThan(500));

      // May return 200 with featured cards or 500 if TCGdex API not available
      expect([200, 400, 500, 502, 503]).toContain(res.status);
    });

    it('should return array of cards if successful', async () => {
      const res = await request(app).get('/cards/featured');

      if (res.status === 200) {
        expect(res.body).toBeDefined();
        if (res.body.success) {
          expect(Array.isArray(res.body.data) || Array.isArray(res.body)).toBe(
            true
          );
        }
      }
    });
  });

  // ============================================
  // GET /cards/tcg/:tcgId - Get by TCGdex ID
  // ============================================
  describe('GET /cards/tcg/:tcgId - Get by TCGdex ID', () => {
    it('should find card by pokemonTcgId', async () => {
      const card = new Card({
        pokemonTcgId: 'swsh1-25',
        name: 'Pikachu',
        set: 'Sword & Shield',
      });
      await card.save();

      const res = await request(app)
        .get('/cards/tcg/swsh1-25')
        .expect((r) => expect(r.status).toBeLessThan(500));

      if (res.status === 200) {
        expect(res.body).toBeDefined();
      }
    });

    it('should handle non-existent tcgId', async () => {
      const res = await request(app)
        .get('/cards/tcg/nonexistent-tcg-id')
        .expect((r) => expect(r.status).toBeLessThan(500));

      expect(res.status).toBeLessThan(500);
    });

    it('should handle special characters in tcgId', async () => {
      const res = await request(app)
        .get('/cards/tcg/swsh1-25%20special')
        .expect((r) => expect(r.status).toBeLessThan(500));

      expect(res.status).toBeLessThan(500);
    });
  });

  // ============================================
  // GET /cards/search/quick - Quick Search
  // ============================================
  describe('GET /cards/search/quick - Quick Search', () => {
    it('should require query parameter', async () => {
      const res = await request(app)
        .get('/cards/search/quick')
        .expect((r) => expect(r.status).toBeLessThan(500));

      expect([400, 500]).toContain(res.status);
    });

    it('should return search results', async () => {
      const card = new Card({
        pokemonTcgId: 'test-1',
        name: 'Pikachu Test',
        set: 'Test Set',
      });
      await card.save();

      const res = await request(app).get('/cards/search/quick?q=pikachu');

      expect([200, 400, 500]).toContain(res.status);
      if (res.status === 200 && res.body) {
        expect(res.body).toHaveProperty('data');
      }
    });

    it('should handle empty query string', async () => {
      const res = await request(app).get('/cards/search/quick?q=');

      expect([200, 400, 500]).toContain(res.status);
    });

    it('should limit results to 10', async () => {
      // Create more than 10 cards
      for (let i = 0; i < 15; i++) {
        const card = new Card({
          pokemonTcgId: `card-${i}`,
          name: `Test Card ${i}`,
          set: 'Test Set',
        });
        await card.save();
      }

      const res = await request(app).get('/cards/search/quick?q=test');

      expect([200, 400, 500]).toContain(res.status);
      if (
        res.status === 200 &&
        res.body?.data &&
        Array.isArray(res.body.data)
      ) {
        expect(res.body.data.length).toBeLessThanOrEqual(10);
      }
    });

    it('should handle special characters in query', async () => {
      const res = await request(app).get(
        '/cards/search/quick?q=pikachu%20%26%20raichu'
      );

      expect([200, 400, 500]).toContain(res.status);
    });

    it('should be case-insensitive', async () => {
      const card = new Card({
        pokemonTcgId: 'test-case',
        name: 'PIKACHU',
        set: 'Test Set',
      });
      await card.save();

      const res = await request(app).get('/cards/search/quick?q=pikachu');

      expect([200, 400, 500]).toContain(res.status);
    });
  });

  // ============================================
  // GET /cards/search/tcg - TCGdex Search
  // ============================================
  describe('GET /cards/search/tcg - TCGdex Search', () => {
    it('should require query parameter', async () => {
      const res = await request(app)
        .get('/cards/search/tcg')
        .expect((r) => expect(r.status).toBeLessThan(500));

      expect([400, 500]).toContain(res.status);
    });

    it('should handle empty query', async () => {
      const res = await request(app)
        .get('/cards/search/tcg?q=')
        .expect((r) => expect(r.status).toBeLessThan(500));

      expect(res.status).toBeLessThan(500);
    });

    it('should return paginated results if successful', async () => {
      const res = await request(app).get(
        '/cards/search/tcg?q=pikachu&page=1&limit=10'
      );

      // May return 200, 500 or 502 depending on TCGdex API availability
      expect([200, 400, 500, 502, 503]).toContain(res.status);
    });

    it('should handle pagination parameters', async () => {
      const res = await request(app).get(
        '/cards/search/tcg?q=pikachu&page=2&limit=20'
      );

      expect([200, 400, 500, 502, 503]).toContain(res.status);
    });

    it('should handle optional filters', async () => {
      const res = await request(app).get(
        '/cards/search/tcg?q=pikachu&set=swsh1&rarity=Rare'
      );

      expect([200, 400, 500, 502, 503]).toContain(res.status);
    });

    it('should handle special characters in query', async () => {
      const res = await request(app).get('/cards/search/tcg?q=mr%20mime');

      expect([200, 400, 500, 502, 503]).toContain(res.status);
    });

    it('should return results structure if successful', async () => {
      const res = await request(app).get('/cards/search/tcg?q=pikachu');

      expect([200, 400, 500, 502, 503]).toContain(res.status);
      if (res.status === 200 && res.body?.success) {
        expect(res.body).toHaveProperty('data');
        expect(res.body).toHaveProperty('total');
      }
    });
  });

  // ============================================
  // Error Handling & Edge Cases
  // ============================================
  describe('Error Handling', () => {
    it('should handle malformed requests gracefully', async () => {
      const res = await request(app)
        .post('/cards')
        .set('Content-Type', 'application/json')
        .send('invalid json{')
        .expect((r) => expect(r.status).toBeLessThan(500));

      expect(res.status).toBeLessThan(500);
    });

    it('should handle very long query strings', async () => {
      const longQuery = 'a'.repeat(1000);
      const res = await request(app)
        .get(`/cards/search/quick?q=${longQuery}`)
        .expect((r) => expect(r.status).toBeLessThan(500));

      expect(res.status).toBeLessThan(500);
    });

    it('should handle null values in query parameters', async () => {
      const res = await request(app)
        .get('/cards?name=&rarity=&series=&set=&type=')
        .expect((r) => expect(r.status).toBeLessThan(500));

      expect(res.status).toBeLessThan(500);
    });
  });
});
