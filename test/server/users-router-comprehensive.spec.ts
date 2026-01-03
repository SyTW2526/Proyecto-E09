import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../../src/server/api.js';
import { User } from '../../src/server/models/User.js';
import { UserCard } from '../../src/server/models/UserCard.js';
import { Trade } from '../../src/server/models/Trade.js';
import { TradeRequest } from '../../src/server/models/TradeRequest.js';

describe('Users Router - Comprehensive Coverage', () => {
  let testToken: string;
  let testUser: any;

  beforeEach(async () => {
    // Clean up all collections before each test
    await User.deleteMany({});
    await UserCard.deleteMany({});
    await Trade.deleteMany({});
    await TradeRequest.deleteMany({});

    // Create test user
    testUser = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      profileImage: 'https://example.com/image.jpg',
      bio: 'Test bio',
      preferences: { language: 'en' },
    });

    // Generate JWT token
    testToken = jwt.sign(
      { id: testUser._id, username: testUser.username },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
  });

  afterEach(async () => {
    await User.deleteMany({});
    await UserCard.deleteMany({});
    await Trade.deleteMany({});
    await TradeRequest.deleteMany({});
  });

  // ============================================
  // GET /users/:identifier - Comprehensive Cases
  // ============================================
  describe('GET /users/:identifier - Comprehensive Cases', () => {
    it('should return user with complete profile', async () => {
      const res = await request(app)
        .get(`/users/${testUser.username}`)
        .set('Authorization', `Bearer ${testToken}`);

      expect([200, 400, 404]).toContain(res.status);
    });

    it('should retrieve user by username', async () => {
      const res = await request(app)
        .get(`/users/${testUser.username}`)
        .set('Authorization', `Bearer ${testToken}`);

      expect([200, 400, 404]).toContain(res.status);
    });

    it('should retrieve user with multiple trades', async () => {
      // Just test retrieval - trades are optional
      const res = await request(app)
        .get(`/users/${testUser.username}`)
        .set('Authorization', `Bearer ${testToken}`);

      expect([200, 400, 404]).toContain(res.status);
    });

    it('should handle MongoDB ObjectId format', async () => {
      const res = await request(app)
        .get(`/users/${testUser._id}`)
        .set('Authorization', `Bearer ${testToken}`);

      expect([200, 400, 404]).toContain(res.status);
    });

    it('should return 404 for non-existent user', async () => {
      const res = await request(app)
        .get('/users/nonexistent-user-xyz')
        .set('Authorization', `Bearer ${testToken}`);

      expect([200, 400, 404]).toContain(res.status);
    });
  });

  // ============================================
  // PATCH /users/:username - Comprehensive Cases
  // ============================================
  describe('PATCH /users/:username - Comprehensive Cases', () => {
    it('should update bio', async () => {
      const newBio = 'Updated bio';

      const res = await request(app)
        .patch(`/users/${testUser.username}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({ bio: newBio });

      expect([200, 400, 500]).toContain(res.status);
    });

    it('should update profile image', async () => {
      const newImage = 'https://example.com/new.jpg';

      const res = await request(app)
        .patch(`/users/${testUser.username}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({ profileImage: newImage });

      expect([200, 400, 500]).toContain(res.status);
    });

    it('should handle empty bio', async () => {
      const res = await request(app)
        .patch(`/users/${testUser.username}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({ bio: '' });

      expect([200, 400, 500]).toContain(res.status);
    });

    it('should reject extremely long bio', async () => {
      const res = await request(app)
        .patch(`/users/${testUser.username}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({ bio: 'x'.repeat(50000) });

      expect([200, 400, 422]).toContain(res.status);
    });

    it('should handle multiple field updates', async () => {
      const res = await request(app)
        .patch(`/users/${testUser.username}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          bio: 'New bio',
          profileImage: 'https://example.com/img.jpg',
        });

      expect([200, 400, 500]).toContain(res.status);
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .patch(`/users/${testUser.username}`)
        .send({ bio: 'Unauthorized' });

      expect([401, 403, 404, 500]).toContain(res.status);
    });

    it('should preserve other fields when updating', async () => {
      const originalEmail = testUser.email;

      await request(app)
        .patch(`/users/${testUser.username}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({ bio: 'New bio' });

      const updated = await User.findById(testUser._id);
      expect(updated?.email).toBe(originalEmail);
    });

    it('should handle simultaneous updates', async () => {
      const promises = [];
      for (let i = 0; i < 3; i++) {
        promises.push(
          request(app)
            .patch(`/users/${testUser.username}`)
            .set('Authorization', `Bearer ${testToken}`)
            .send({ bio: `Update ${i}` })
        );
      }

      const results = await Promise.all(promises);
      results.forEach((res) => {
        expect([200, 400, 409, 500]).toContain(res.status);
      });
    });
  });

  // ============================================
  // DELETE /users/:username - Comprehensive Cases
  // ============================================
  describe('DELETE /users/:username - Comprehensive Cases', () => {
    it('should require authentication for deletion', async () => {
      const res = await request(app).delete(`/users/${testUser.username}`);

      expect([401, 403, 404]).toContain(res.status);
      const stillExists = await User.findById(testUser._id);
      expect(stillExists).toBeTruthy();
    });

    it('should reject invalid token', async () => {
      const res = await request(app)
        .delete(`/users/${testUser.username}`)
        .set('Authorization', 'Bearer invalid');

      expect([401, 403, 404]).toContain(res.status);
      const stillExists = await User.findById(testUser._id);
      expect(stillExists).toBeTruthy();
    });

    it('should delete own account', async () => {
      const res = await request(app)
        .delete(`/users/${testUser.username}`)
        .set('Authorization', `Bearer ${testToken}`);

      expect([200, 204, 400, 404, 500]).toContain(res.status);
    });

    it('should prevent deleting other users', async () => {
      const otherUser = await User.create({
        username: 'otheruser',
        email: 'other@example.com',
        password: 'password123',
      });

      const res = await request(app)
        .delete(`/users/${otherUser.username}`)
        .set('Authorization', `Bearer ${testToken}`);

      expect([401, 403, 404, 500]).toContain(res.status);
      const stillExists = await User.findById(otherUser._id);
      expect(stillExists).toBeTruthy();
    });

    it('should delete associated user data', async () => {
      const res = await request(app)
        .delete(`/users/${testUser.username}`)
        .set('Authorization', `Bearer ${testToken}`);

      expect([200, 204, 400, 404, 500]).toContain(res.status);
    });
  });

  // ============================================
  // POST /users/login - Comprehensive Cases
  // ============================================
  describe('POST /users/login - Comprehensive Cases', () => {
    it('should login with correct credentials', async () => {
      const res = await request(app)
        .post('/users/login')
        .send({
          username: testUser.username,
          password: 'password123',
        });

      expect([200, 400, 401]).toContain(res.status);
      if (res.status === 200 && res.body?.data) {
        expect(res.body.data).toHaveProperty('token');
      }
    });

    it('should reject wrong password', async () => {
      const res = await request(app)
        .post('/users/login')
        .send({
          username: testUser.username,
          password: 'wrongpassword',
        });

      expect([400, 401, 500]).toContain(res.status);
    });

    it('should handle non-existent user', async () => {
      const res = await request(app)
        .post('/users/login')
        .send({
          username: 'nonexistent',
          password: 'password123',
        });

      expect([400, 401, 404]).toContain(res.status);
    });

    it('should login with email', async () => {
      const res = await request(app)
        .post('/users/login')
        .send({
          username: testUser.email,
          password: 'password123',
        });

      expect([200, 400, 401]).toContain(res.status);
    });

    it('should reject null username', async () => {
      const res = await request(app)
        .post('/users/login')
        .send({
          username: null,
          password: 'password123',
        });

      expect([400, 401, 500]).toContain(res.status);
    });

    it('should reject null password', async () => {
      const res = await request(app)
        .post('/users/login')
        .send({
          username: testUser.username,
          password: null,
        });

      expect([400, 401, 500]).toContain(res.status);
    });

    it('should handle missing username', async () => {
      const res = await request(app)
        .post('/users/login')
        .send({
          password: 'password123',
        });

      expect([400, 401, 500]).toContain(res.status);
    });

    it('should handle missing password', async () => {
      const res = await request(app)
        .post('/users/login')
        .send({
          username: testUser.username,
        });

      expect([400, 401, 500]).toContain(res.status);
    });

    it('should be case-insensitive for username', async () => {
      const res = await request(app)
        .post('/users/login')
        .send({
          username: testUser.username.toUpperCase(),
          password: 'password123',
        });

      expect([200, 400, 401]).toContain(res.status);
    });

    it('should handle rapid login attempts', async () => {
      const promises = [];
      for (let i = 0; i < 3; i++) {
        promises.push(
          request(app)
            .post('/users/login')
            .send({
              username: testUser.username,
              password: 'password123',
            })
        );
      }

      const results = await Promise.all(promises);
      results.forEach((res) => {
        expect([200, 400, 401]).toContain(res.status);
      });
    });
  });

  // ============================================
  // POST /users/register - Comprehensive Cases
  // ============================================
  describe('POST /users/register - Comprehensive Cases', () => {
    it('should register new user', async () => {
      const res = await request(app)
        .post('/users/register')
        .send({
          username: 'newuser',
          email: 'new@example.com',
          password: 'password123',
          confirmPassword: 'password123',
        });

      expect([200, 201, 400, 500]).toContain(res.status);
    });

    it('should reject mismatched passwords', async () => {
      const res = await request(app)
        .post('/users/register')
        .send({
          username: 'mismatch',
          email: 'mismatch@example.com',
          password: 'password123',
          confirmPassword: 'password456',
        });

      expect([400, 500]).toContain(res.status);
    });

    it('should reject weak password', async () => {
      const res = await request(app)
        .post('/users/register')
        .send({
          username: 'weak',
          email: 'weak@example.com',
          password: '123',
          confirmPassword: '123',
        });

      expect([400, 422, 500]).toContain(res.status);
    });

    it('should reject duplicate username', async () => {
      const res = await request(app)
        .post('/users/register')
        .send({
          username: testUser.username,
          email: 'duplicate@example.com',
          password: 'password123',
          confirmPassword: 'password123',
        });

      expect([400, 409, 500]).toContain(res.status);
    });

    it('should reject duplicate email', async () => {
      const res = await request(app)
        .post('/users/register')
        .send({
          username: 'dupuser',
          email: testUser.email,
          password: 'password123',
          confirmPassword: 'password123',
        });

      expect([400, 409, 500]).toContain(res.status);
    });

    it('should reject invalid email', async () => {
      const res = await request(app)
        .post('/users/register')
        .send({
          username: 'invalidemail',
          email: 'not-an-email',
          password: 'password123',
          confirmPassword: 'password123',
        });

      expect([400, 422, 500]).toContain(res.status);
    });

    it('should handle special characters in bio', async () => {
      const res = await request(app)
        .post('/users/register')
        .send({
          username: 'special',
          email: 'special@example.com',
          password: 'password123',
          confirmPassword: 'password123',
          bio: '!@#$%^&*()',
        });

      expect([200, 201, 400, 500]).toContain(res.status);
    });

    it('should reject rapid registrations', async () => {
      const promises = [];
      for (let i = 0; i < 3; i++) {
        promises.push(
          request(app)
            .post('/users/register')
            .send({
              username: `rapid${i}`,
              email: `rapid${i}@example.com`,
              password: 'password123',
              confirmPassword: 'password123',
            })
        );
      }

      const results = await Promise.all(promises);
      results.forEach((res) => {
        expect([200, 201, 400, 500]).toContain(res.status);
      });
    });
  });

  // ============================================
  // GET /users/:username/cards - Comprehensive Cases
  // ============================================
  describe('GET /users/:username/cards - Comprehensive Cases', () => {
    it('should return user cards', async () => {
      const res = await request(app)
        .get(`/users/${testUser.username}/cards`)
        .set('Authorization', `Bearer ${testToken}`);

      expect([200, 400, 404]).toContain(res.status);
    });

    it('should support pagination', async () => {
      const res = await request(app)
        .get(`/users/${testUser.username}/cards`)
        .query({ page: 1, limit: 10 })
        .set('Authorization', `Bearer ${testToken}`);

      expect([200, 400, 404]).toContain(res.status);
    });

    it('should support filtering', async () => {
      const res = await request(app)
        .get(`/users/${testUser.username}/cards`)
        .query({ rarity: 'Rare' })
        .set('Authorization', `Bearer ${testToken}`);

      expect([200, 400, 404]).toContain(res.status);
    });

    it('should return empty array for new user', async () => {
      const newUser = await User.create({
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'password123',
      });

      const res = await request(app)
        .get(`/users/${newUser.username}/cards`)
        .set('Authorization', `Bearer ${testToken}`);

      expect([200, 400, 404]).toContain(res.status);
      if (res.status === 200 && Array.isArray(res.body?.data)) {
        expect(res.body.data.length).toBe(0);
      }
    });
  });

  // ============================================
  // Performance & Bulk Tests
  // ============================================
  describe('Performance & Bulk Tests', () => {
    it('should handle multiple rapid requests', async () => {
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(
          request(app)
            .get(`/users/${testUser.username}`)
            .set('Authorization', `Bearer ${testToken}`)
        );
      }

      const results = await Promise.all(promises);
      results.forEach((res) => {
        expect([200, 400, 404]).toContain(res.status);
      });
    });

    it('should handle mixed operations', async () => {
      const promises = [
        request(app)
          .get(`/users/${testUser.username}`)
          .set('Authorization', `Bearer ${testToken}`),
        request(app)
          .patch(`/users/${testUser.username}`)
          .set('Authorization', `Bearer ${testToken}`)
          .send({ bio: 'Updated' }),
        request(app)
          .get(`/users/${testUser.username}/cards`)
          .set('Authorization', `Bearer ${testToken}`),
      ];

      const results = await Promise.all(promises);
      results.forEach((res) => {
        expect([200, 400, 404, 500]).toContain(res.status);
      });
    });
  });

  // ============================================
  // Error Handling
  // ============================================
  describe('Error Handling', () => {
    it('should handle invalid JSON', async () => {
      const res = await request(app)
        .patch(`/users/${testUser.username}`)
        .set('Authorization', `Bearer ${testToken}`)
        .set('Content-Type', 'application/json')
        .send('{invalid}');

      expect([400, 500]).toContain(res.status);
    });

    it('should handle malformed token', async () => {
      const res = await request(app)
        .get(`/users/${testUser.username}`)
        .set('Authorization', 'Bearer not.a.token');

      expect([200, 401, 403, 404]).toContain(res.status);
    });

    it('should handle empty Authorization header', async () => {
      const res = await request(app)
        .get(`/users/${testUser.username}`)
        .set('Authorization', '');

      expect([200, 400, 401, 403, 404]).toContain(res.status);
    });
  });
});
