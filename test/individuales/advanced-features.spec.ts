import { describe, it, beforeEach, expect } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../src/server/api.js';
import { User } from '../../src/server/models/User.js';
import { Card } from '../../src/server/models/Card.js';
import { UserCard } from '../../src/server/models/UserCard.js';
import { Trade } from '../../src/server/models/Trade.js';
import { Notification } from '../../src/server/models/Notification.js';

beforeEach(async () => {
  await User.deleteMany();
  await Card.deleteMany();
  await UserCard.deleteMany();
  await Trade.deleteMany();
  await Notification.deleteMany();
});

describe('Advanced User Features - Amigos y Bloqueos', () => {
  describe('Sistema de Amigos Avanzado', () => {
    it('debe permitir que dos usuarios se agreguen mutuamente como amigos', async () => {
      const user1 = await User.create({
        username: 'alice',
        email: 'alice@example.com',
        password: 'pass123',
      });

      const user2 = await User.create({
        username: 'bob',
        email: 'bob@example.com',
        password: 'pass123',
      });

      // Alice agrega a Bob
      const res1 = await request(app)
        .post(`/users/${user1._id}/friends/${user2._id}`)
        .expect(200);

      expect(res1.body.message).toContain('Amigo agregado');

      // Bob agrega a Alice
      const res2 = await request(app)
        .post(`/users/${user2._id}/friends/${user1._id}`)
        .expect(200);

      expect(res2.body.message).toContain('Amigo agregado');

      // Verificar que ambos están en la lista de amigos
      const aliceData = await request(app)
        .get(`/users/${user1._id}`)
        .expect(200);

      const bobData = await request(app)
        .get(`/users/${user2._id}`)
        .expect(200);

      expect(aliceData.body.friends.length).toBe(1);
      expect(bobData.body.friends.length).toBe(1);
    });

    it('no debe permitir agregar el mismo amigo dos veces', async () => {
      const user1 = await User.create({
        username: 'charlie',
        email: 'charlie@example.com',
        password: 'pass123',
      });

      const user2 = await User.create({
        username: 'diana',
        email: 'diana@example.com',
        password: 'pass123',
      });

      // Primera vez funciona
      await request(app)
        .post(`/users/${user1._id}/friends/${user2._id}`)
        .expect(200);

      // Segunda vez también funciona (el endpoint no genera error)
      const res = await request(app)
        .post(`/users/${user1._id}/friends/${user2._id}`)
        .expect(200);

      // Pero user1 solo debe tener un amigo
      const userData = await request(app)
        .get(`/users/${user1._id}`)
        .expect(200);

      expect(userData.body.friends.length).toBe(1);
    });

    it('debe permitir eliminar un amigo', async () => {
      const user1 = await User.create({
        username: 'eve',
        email: 'eve@example.com',
        password: 'pass123',
      });

      const user2 = await User.create({
        username: 'frank',
        email: 'frank@example.com',
        password: 'pass123',
      });

      // Agregar amigo
      await request(app)
        .post(`/users/${user1._id}/friends/${user2._id}`)
        .expect(200);

      // Verificar que está agregado
      let userData = await request(app)
        .get(`/users/${user1._id}`)
        .expect(200);
      expect(userData.body.friends.length).toBe(1);

      // Eliminar amigo
      const res = await request(app)
        .delete(`/users/${user1._id}/friends/${user2._id}`)
        .expect(200);

      expect(res.body.message).toContain('Amigo eliminado');

      // Verificar que fue eliminado
      userData = await request(app)
        .get(`/users/${user1._id}`)
        .expect(200);
      expect(userData.body.friends.length).toBe(0);
    });

    it('debe permitir usar username o ID al agregar amigos', async () => {
      const user1 = await User.create({
        username: 'grace',
        email: 'grace@example.com',
        password: 'pass123',
      });

      const user2 = await User.create({
        username: 'henry',
        email: 'henry@example.com',
        password: 'pass123',
      });

      // Agregar usando username
      const res1 = await request(app)
        .post(`/users/grace/friends/henry`)
        .expect(200);
      expect(res1.body.message).toContain('Amigo agregado');

      // Crear otro usuario y agregar usando ID
      const user3 = await User.create({
        username: 'iris',
        email: 'iris@example.com',
        password: 'pass123',
      });

      const res2 = await request(app)
        .post(`/users/${user1._id}/friends/${user3._id}`)
        .expect(200);
      expect(res2.body.message).toContain('Amigo agregado');

      // Verificar ambos fueron agregados
      const userData = await request(app)
        .get(`/users/${user1._id}`)
        .expect(200);
      expect(userData.body.friends.length).toBe(2);
    });
  });

  describe('Sistema de Bloqueos Avanzado', () => {
    it('debe permitir bloquear a un usuario', async () => {
      const user1 = await User.create({
        username: 'jack',
        email: 'jack@example.com',
        password: 'pass123',
      });

      const user2 = await User.create({
        username: 'kate',
        email: 'kate@example.com',
        password: 'pass123',
      });

      const res = await request(app)
        .post(`/users/${user1._id}/block/${user2._id}`)
        .expect(200);

      expect(res.body.message).toContain('Usuario bloqueado');

      // Verificar que está bloqueado
      const userData = await request(app)
        .get(`/users/${user1._id}`)
        .expect(200);

      expect(userData.body.blockedUsers.length).toBe(1);
    });

    it('debe permitir desbloquear a un usuario', async () => {
      const user1 = await User.create({
        username: 'leo',
        email: 'leo@example.com',
        password: 'pass123',
      });

      const user2 = await User.create({
        username: 'mia',
        email: 'mia@example.com',
        password: 'pass123',
      });

      // Bloquear usuario
      await request(app)
        .post(`/users/${user1._id}/block/${user2._id}`)
        .expect(200);

      // Verificar que está bloqueado
      let userData = await request(app)
        .get(`/users/${user1._id}`)
        .expect(200);
      expect(userData.body.blockedUsers.length).toBe(1);

      // Desbloquear usuario
      const res = await request(app)
        .delete(`/users/${user1._id}/block/${user2._id}`)
        .expect(200);

      expect(res.body.message).toContain('Usuario desbloqueado');

      // Verificar que fue desbloqueado
      userData = await request(app)
        .get(`/users/${user1._id}`)
        .expect(200);
      expect(userData.body.blockedUsers.length).toBe(0);
    });

    it('debe permitir bloquear múltiples usuarios', async () => {
      const user1 = await User.create({
        username: 'noah',
        email: 'noah@example.com',
        password: 'pass123',
      });

      const user2 = await User.create({
        username: 'olivia',
        email: 'olivia@example.com',
        password: 'pass123',
      });

      const user3 = await User.create({
        username: 'peter',
        email: 'peter@example.com',
        password: 'pass123',
      });

      // Bloquear múltiples usuarios
      await request(app)
        .post(`/users/${user1._id}/block/${user2._id}`)
        .expect(200);

      await request(app)
        .post(`/users/${user1._id}/block/${user3._id}`)
        .expect(200);

      // Verificar que ambos están bloqueados
      const userData = await request(app)
        .get(`/users/${user1._id}`)
        .expect(200);

      expect(userData.body.blockedUsers.length).toBe(2);
    });
  });

  describe('Interacción entre Amigos y Bloqueos', () => {
    it('debe permitir ser amigos y también tener bloqueados', async () => {
      const user1 = await User.create({
        username: 'quinn',
        email: 'quinn@example.com',
        password: 'pass123',
      });

      const user2 = await User.create({
        username: 'rachel',
        email: 'rachel@example.com',
        password: 'pass123',
      });

      const user3 = await User.create({
        username: 'steve',
        email: 'steve@example.com',
        password: 'pass123',
      });

      // user1 agrega a user2 como amigo
      await request(app)
        .post(`/users/${user1._id}/friends/${user2._id}`)
        .expect(200);

      // user1 bloquea a user3
      await request(app)
        .post(`/users/${user1._id}/block/${user3._id}`)
        .expect(200);

      // Verificar el estado final
      const userData = await request(app)
        .get(`/users/${user1._id}`)
        .expect(200);

      expect(userData.body.friends.length).toBe(1);
      expect(userData.body.blockedUsers.length).toBe(1);
    });
  });

  describe('Validaciones de Settings y Preferencias', () => {
    it('debe mantener las preferencias correctas por defecto', async () => {
      const user = await User.create({
        username: 'tina',
        email: 'tina@example.com',
        password: 'pass123',
      });

      const res = await request(app)
        .get(`/users/${user._id}`)
        .expect(200);

      expect(res.body.settings.language).toBe('es');
      expect(res.body.settings.darkMode).toBe(false);
      expect(res.body.settings.notifications.trades).toBe(true);
      expect(res.body.settings.notifications.messages).toBe(true);
      expect(res.body.settings.notifications.friendRequests).toBe(true);
      expect(res.body.settings.privacy.showCollection).toBe(true);
      expect(res.body.settings.privacy.showWishlist).toBe(true);
    });

    it.skip('debe permitir actualizar preferencias de idioma y dark mode', async () => {
      const user = await User.create({
        username: 'uma',
        email: 'uma@example.com',
        password: 'pass123',
      });

      const res = await request(app)
        .patch(`/users/${user._id}`)
        .send({
          settings: {
            language: 'en',
            darkMode: true,
            notifications: {
              trades: false,
              messages: true,
              friendRequests: false,
            },
            privacy: {
              showCollection: false,
              showWishlist: true,
            },
          },
        })
        .expect(200);

      expect(res.body.settings.language).toBe('en');
      expect(res.body.settings.darkMode).toBe(true);
      expect(res.body.settings.notifications.trades).toBe(false);
      expect(res.body.settings.privacy.showCollection).toBe(false);
    });
  });
});
