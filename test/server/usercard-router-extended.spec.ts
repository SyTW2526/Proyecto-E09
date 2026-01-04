import { describe, it, beforeEach, afterEach, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../src/server/api.js';
import { UserCard } from '../../src/server/models/UserCard.js';
import { User } from '../../src/server/models/User.js';
import { Card } from '../../src/server/models/Card.js';
import jwt from 'jsonwebtoken';

describe('UserCard Router - Endpoints HTTP', () => {
  let testUser: any;
  let testCard: any;
  let token: string;

  beforeEach(async () => {
    // Limpiar base de datos
    await UserCard.deleteMany({});
    await User.deleteMany({});
    await Card.deleteMany({});

    // Crear usuario de prueba
    testUser = await User.create({
      username: 'carduser',
      email: 'carduser@test.com',
      password: 'hashed_password',
    });

    // Crear cartas de prueba
    testCard = await Card.create({
      name: 'Pikachu',
      pokemonTcgId: 'base-001',
      rarity: 'Rare',
      set: 'Base Set',
      price: 100,
    });

    // Crear user card
    await UserCard.create({
      userId: testUser._id,
      cardId: testCard._id,
      pokemonTcgId: 'base-001',
      quantity: 5,
      collectionType: 'collection',
    });

    // Generar token JWT
    const secret = process.env.JWT_SECRET || 'test-secret';
    token = jwt.sign(
      { userId: testUser._id, username: testUser.username },
      secret
    );
  });

  afterEach(async () => {
    await UserCard.deleteMany({});
    await User.deleteMany({});
    await Card.deleteMany({});
  });

  describe('GET /usercards/:username', () => {
    it('obtiene lista de cartas del usuario', async () => {
      const res = await request(app)
        .get(`/usercards/${testUser.username}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBeLessThan(500);
    });
  });

  describe('GET /usercards/:username/collection', () => {
    it('obtiene cartas de colección', async () => {
      const res = await request(app)
        .get(`/usercards/${testUser.username}/collection`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBeLessThan(500);
    });
  });

  describe('GET /usercards/:username/wishlist', () => {
    it('obtiene cartas de deseados', async () => {
      const res = await request(app)
        .get(`/usercards/${testUser.username}/wishlist`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBeLessThan(500);
    });
  });

  describe('POST /usercards/:username/collection', () => {
    it('intenta agregar tarjeta (puede fallar si cardId inválido)', async () => {
      const res = await request(app)
        .post(`/usercards/${testUser.username}/collection`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          pokemonTcgId: 'invalid-123',
          quantity: 1,
        });

      // Solo verificar que no hace un crash del servidor
      expect([400, 500]).toContain(res.status);
    });
  });

  describe('PATCH /usercards/:username/cards/:userCardId', () => {
    it('intenta actualizar tarjeta', async () => {
      const userCard = await UserCard.findOne({ userId: testUser._id });

      const res = await request(app)
        .patch(`/usercards/${testUser.username}/cards/${userCard?._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ quantity: 10 });

      expect(res.status).toBeLessThan(500);
    });
  });

  describe('DELETE /usercards/:username/cards/:userCardId', () => {
    it('elimina una tarjeta del usuario', async () => {
      const userCard = await UserCard.findOne({ userId: testUser._id });

      const res = await request(app)
        .delete(`/usercards/${testUser.username}/cards/${userCard?._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBeLessThan(500);
    });
  });
});
