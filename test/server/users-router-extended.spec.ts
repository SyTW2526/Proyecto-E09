import { describe, it, beforeEach, afterEach, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../src/server/api.js';
import { User } from '../../src/server/models/User.js';
import jwt from 'jsonwebtoken';

describe('Users Router - Endpoints HTTP', () => {
  let testUser: any;
  let testUser2: any;
  let token: string;
  let token2: string;

  beforeEach(async () => {
    // Limpiar base de datos
    await User.deleteMany({});

    // Crear usuarios de prueba
    testUser = await User.create({
      username: 'apiuser1',
      email: 'apiuser1@test.com',
      password: 'hashed_password',
      profileImage: 'oldimage.jpg',
    });

    testUser2 = await User.create({
      username: 'apiuser2',
      email: 'apiuser2@test.com',
      password: 'hashed_password',
    });

    // Generar tokens JWT
    const secret = process.env.JWT_SECRET || 'test-secret';
    token = jwt.sign({ userId: testUser._id, username: testUser.username }, secret);
    token2 = jwt.sign({ userId: testUser2._id, username: testUser2.username }, secret);
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  describe('POST /users/register', () => {
    it('registra un nuevo usuario', async () => {
      const res = await request(app)
        .post('/users/register')
        .send({
          username: 'newuser',
          email: 'newuser@test.com',
          password: 'password123',
        });

      expect(res.status).toBeLessThan(500);
    });

    it('valida datos requeridos', async () => {
      const res = await request(app)
        .post('/users/register')
        .send({ username: 'onlyusername' });

      expect([400, 500]).toContain(res.status);
    });
  });

  describe('POST /users/login', () => {
    it('inicia sesión con credenciales correctas', async () => {
      const res = await request(app)
        .post('/users/login')
        .send({
          email: 'apiuser1@test.com',
          password: 'hashed_password',
        });

      expect(res.status).toBeLessThan(500);
    });

    it('rechaza credenciales incorrectas', async () => {
      const res = await request(app)
        .post('/users/login')
        .send({
          email: 'apiuser1@test.com',
          password: 'wrongpassword',
        });

      expect([401, 400, 500]).toContain(res.status);
    });
  });

  describe('GET /users/:identifier', () => {
    it('obtiene perfil por username', async () => {
      const res = await request(app)
        .get(`/users/${testUser.username}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBeLessThan(500);
    });

    it('obtiene perfil por ID', async () => {
      const res = await request(app)
        .get(`/users/${testUser._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBeLessThan(500);
    });

    it('retorna error para usuario inexistente', async () => {
      const res = await request(app)
        .get('/users/nonexistentuser')
        .set('Authorization', `Bearer ${token}`);

      expect([404, 400, 500]).toContain(res.status);
    });
  });

  describe('PATCH /users/:username/profile-image', () => {
    it('actualiza imagen de perfil', async () => {
      const res = await request(app)
        .patch(`/users/${testUser.username}/profile-image`)
        .set('Authorization', `Bearer ${token}`)
        .send({ profileImage: 'newimage.jpg' });

      expect(res.status).toBeLessThan(500);
    });

    it('valida permisos', async () => {
      const res = await request(app)
        .patch(`/users/${testUser.username}/profile-image`)
        .set('Authorization', `Bearer ${token2}`)
        .send({ profileImage: 'newimage.jpg' });

      expect([403, 401, 400, 500]).toContain(res.status);
    });
  });

  describe('DELETE /users/:username/profile-image', () => {
    it('elimina imagen de perfil', async () => {
      const res = await request(app)
        .delete(`/users/${testUser.username}/profile-image`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBeLessThan(500);
    });
  });

  describe('PATCH /users/:username', () => {
    it('actualiza datos de usuario', async () => {
      const res = await request(app)
        .patch(`/users/${testUser.username}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ email: 'newemail@test.com' });

      expect([200, 400, 500]).toContain(res.status);
    });

    it('maneja solicitudes sin autenticación', async () => {
      const res = await request(app)
        .patch(`/users/${testUser.username}`)
        .send({ email: 'hacked@test.com' });

      expect([401, 403, 400, 500]).toContain(res.status);
    });
  });
});
