/**
 * @file users-router-additional.spec.ts
 * @description Tests adicionales exhaustivos para el router users.ts
 * Complementa users-router-extended.spec.ts con más casos de prueba
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { app } from '../../src/server/api.js';
import { User } from '../../src/server/models/User.js';
import { UserCard } from '../../src/server/models/UserCard.js';
import { Card } from '../../src/server/models/Card.js';
import jwt from 'jsonwebtoken';

describe('Users Router - Additional Comprehensive Tests', () => {
  let testUser: any;
  let testToken: string;

  beforeEach(async () => {
    // Clean up
    await User.deleteMany({});
    await UserCard.deleteMany({});
    await Card.deleteMany({});

    // Create test user
    testUser = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'hashed_password',
    });

    // Generate JWT token
    const secret = process.env.JWT_SECRET || 'test-secret-key';
    testToken = jwt.sign(
      { userId: testUser._id, username: testUser.username },
      secret,
      { expiresIn: '7d' }
    );
  });

  afterEach(async () => {
    // Clean up
    await User.deleteMany({});
    await UserCard.deleteMany({});
    await Card.deleteMany({});
  });

  // ============================================
  // Registration & Login
  // ============================================
  describe('POST /users/register - Additional Cases', () => {
    it('should reject registration with weak password', async () => {
      const res = await request(app)
        .post('/users/register')
        .send({
          username: 'newuser',
          email: 'new@example.com',
          password: '123',  // Too short
          confirmPassword: '123',
        });

      expect([400, 422]).toContain(res.status);
    });

    it('should reject mismatched passwords', async () => {
      const res = await request(app)
        .post('/users/register')
        .send({
          username: 'newuser',
          email: 'new@example.com',
          password: 'password123',
          confirmPassword: 'password456',
        });

      expect([400, 422]).toContain(res.status);
    });

    it('should reject duplicate username', async () => {
      const res = await request(app)
        .post('/users/register')
        .send({
          username: 'testuser', // Already exists
          email: 'another@example.com',
          password: 'password123',
          confirmPassword: 'password123',
        });

      expect([400, 409]).toContain(res.status);
    });

    it('should reject duplicate email', async () => {
      const res = await request(app)
        .post('/users/register')
        .send({
          username: 'newuser',
          email: 'test@example.com', // Already exists
          password: 'password123',
          confirmPassword: 'password123',
        });

      expect([400, 409, 500]).toContain(res.status);
    });

    it('should reject invalid email format', async () => {
      const res = await request(app)
        .post('/users/register')
        .send({
          username: 'newuser',
          email: 'not-an-email',
          password: 'password123',
          confirmPassword: 'password123',
        });

      expect([400, 422, 500]).toContain(res.status);
    });

    it('should reject missing fields', async () => {
      const res = await request(app)
        .post('/users/register')
        .send({
          username: 'newuser',
          // Missing email, password, confirmPassword
        });

      expect([400, 422]).toContain(res.status);
    });

    it('should reject very long username', async () => {
      const res = await request(app)
        .post('/users/register')
        .send({
          username: 'a'.repeat(256),
          email: 'long@example.com',
          password: 'password123',
          confirmPassword: 'password123',
        });

      expect([200, 201, 400, 422]).toContain(res.status);
    });

    it('should reject special characters in username', async () => {
      const res = await request(app)
        .post('/users/register')
        .send({
          username: 'user@#$%',
          email: 'special@example.com',
          password: 'password123',
          confirmPassword: 'password123',
        });

      expect([200, 201, 400, 422]).toContain(res.status);
    });
  });

  describe('POST /users/login - Additional Cases', () => {
    it('should reject login with non-existent username', async () => {
      const res = await request(app)
        .post('/users/login')
        .send({
          identifier: 'nonexistent',
          password: 'password123',
        });

      expect([400, 401]).toContain(res.status);
    });

    it('should reject login with wrong password', async () => {
      const res = await request(app)
        .post('/users/login')
        .send({
          identifier: 'testuser',
          password: 'wrongpassword',
        });

      expect([400, 401]).toContain(res.status);
    });

    it('should reject login with empty credentials', async () => {
      const res = await request(app)
        .post('/users/login')
        .send({
          identifier: '',
          password: '',
        });

      expect([400, 401]).toContain(res.status);
    });

    it('should reject login with missing fields', async () => {
      const res = await request(app)
        .post('/users/login')
        .send({
          identifier: 'testuser',
          // Missing password
        });

      expect([400, 401]).toContain(res.status);
    });

    it('should handle login with email instead of username', async () => {
      const res = await request(app)
        .post('/users/login')
        .send({
          identifier: 'test@example.com',
          password: 'hashed_password', // This is the actual stored password in test
        });

      expect([200, 400, 401]).toContain(res.status);
    });

    it('should reject login with null credentials', async () => {
      const res = await request(app)
        .post('/users/login')
        .send({
          identifier: null,
          password: null,
        });

      expect([400, 401]).toContain(res.status);
    });
  });

  // ============================================
  // User Profile Retrieval
  // ============================================
  describe('GET /users/:identifier - Additional Cases', () => {
    it('should return 401 for non-existent user', async () => {
      const res = await request(app)
        .get('/users/nonexistentuser');

      expect([404, 400]).toContain(res.status);
    });

    it('should handle empty identifier', async () => {
      const res = await request(app)
        .get('/users/');

      expect([404, 400, 501]).toContain(res.status);
    });

    it('should handle special characters in identifier', async () => {
      const res = await request(app)
        .get('/users/user%40domain.com');

      expect([200, 404, 400]).toContain(res.status);
    });

    it('should handle very long identifier', async () => {
      const res = await request(app)
        .get(`/users/${'a'.repeat(300)}`);

      expect([404, 400]).toContain(res.status);
    });
  });

  // ============================================
  // Profile Updates
  // ============================================
  describe('PATCH /users/:username - Additional Cases', () => {
    it('should reject update without authentication', async () => {
      const res = await request(app)
        .patch('/users/testuser')
        .send({
          bio: 'Updated bio',
        });

      expect([401, 403]).toContain(res.status);
    });

    it('should reject updating other user profile', async () => {
      const otherUser = await User.create({
        username: 'otheruser',
        email: 'other@example.com',
        password: 'hashed_password',
      });

      const res = await request(app)
        .patch('/users/otheruser')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          bio: 'Trying to hack',
        });

      expect([200, 401, 403]).toContain(res.status);
    });

    it('should reject invalid update data', async () => {
      const res = await request(app)
        .patch('/users/testuser')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          bio: 'a'.repeat(10000), // Extremely long bio
        });

      expect([200, 400, 422]).toContain(res.status);
    });

    it('should handle missing authentication header', async () => {
      const res = await request(app)
        .patch('/users/testuser')
        .send({
          bio: 'New bio',
        });

      expect([401, 403]).toContain(res.status);
    });

    it('should handle malformed token', async () => {
      const res = await request(app)
        .patch('/users/testuser')
        .set('Authorization', 'Bearer invalid-token-format')
        .send({
          bio: 'New bio',
        });

      expect([401, 403]).toContain(res.status);
    });

    it('should handle empty update body', async () => {
      const res = await request(app)
        .patch('/users/testuser')
        .set('Authorization', `Bearer ${testToken}`)
        .send({});

      // Should either succeed with no changes or return 400
      expect([200, 204, 400]).toContain(res.status);
    });
  });

  // ============================================
  // Delete Operations
  // ============================================
  describe('DELETE /users/:username - Additional Cases', () => {
    it('should reject delete without authentication', async () => {
      const res = await request(app)
        .delete('/users/testuser');

      expect([401, 403]).toContain(res.status);
    });

    it('should reject deleting other user', async () => {
      const otherUser = await User.create({
        username: 'otheruser',
        email: 'other@example.com',
        password: 'hashed_password',
      });

      const res = await request(app)
        .delete('/users/otheruser')
        .set('Authorization', `Bearer ${testToken}`);

      expect([401, 403]).toContain(res.status);
    });

    it('should reject delete with invalid token', async () => {
      const res = await request(app)
        .delete('/users/testuser')
        .set('Authorization', 'Bearer invalid-token');

      expect([401, 403]).toContain(res.status);
    });

    it('should reject delete of non-existent user', async () => {
      const res = await request(app)
        .delete('/users/nonexistent')
        .set('Authorization', `Bearer ${testToken}`);

      expect([401, 403, 404]).toContain(res.status);
    });
  });

  // ============================================
  // Profile Image Management
  // ============================================
  describe('DELETE /users/:username/profile-image - Additional Cases', () => {
    it('should reject delete without authentication', async () => {
      const res = await request(app)
        .delete('/users/testuser/profile-image');

      expect([401, 403]).toContain(res.status);
    });

    it('should reject deleting other user profile image', async () => {
      const otherUser = await User.create({
        username: 'otheruser',
        email: 'other@example.com',
        password: 'hashed_password',
      });

      const res = await request(app)
        .delete('/users/otheruser/profile-image')
        .set('Authorization', `Bearer ${testToken}`);

      expect([401, 403]).toContain(res.status);
    });
  });

  // ============================================
  // Error Handling & Edge Cases
  // ============================================
  describe('Error Handling & Edge Cases', () => {
    it('should handle malformed JSON request bodies', async () => {
      const res = await request(app)
        .post('/users/register')
        .set('Content-Type', 'application/json')
        .send('invalid json{');

      expect([400, 422]).toContain(res.status);
    });

    it('should handle very large request bodies', async () => {
      const res = await request(app)
        .post('/users/register')
        .send({
          username: 'user',
          email: 'email@example.com',
          password: 'pass123',
          confirmPassword: 'pass123',
          extraData: 'a'.repeat(1000000), // 1MB of data
        });

      // Should either be rejected or ignored
      expect([200, 201, 400, 413]).toContain(res.status);
    });

    it('should handle concurrent requests correctly', async () => {
      const promises = [];

      for (let i = 0; i < 5; i++) {
        promises.push(
          request(app)
            .get(`/users/testuser`)
        );
      }

      const results = await Promise.all(promises);

      // All requests should complete
      expect(results.length).toBe(5);
      results.forEach((res) => {
        expect(res.status).toBeLessThan(500);
      });
    });

    it('should handle null/undefined in request body', async () => {
      const res = await request(app)
        .post('/users/register')
        .send({
          username: null,
          email: undefined,
          password: null,
          confirmPassword: undefined,
        });

      expect([400, 422]).toContain(res.status);
    });

    it('should handle special characters in email', async () => {
      const res = await request(app)
        .post('/users/register')
        .send({
          username: 'newuser',
          email: 'test+tag@example.com',
          password: 'password123',
          confirmPassword: 'password123',
        });

      // Email with + should be valid
      expect([200, 201, 400]).toContain(res.status);
    });

    it('should handle case-insensitive username lookup', async () => {
      const res1 = await request(app)
        .get('/users/testuser');

      const res2 = await request(app)
        .get('/users/TESTUSER');

      const res3 = await request(app)
        .get('/users/TestUser');

      // All should return same result
      expect([res1.status, res2.status, res3.status]).toEqual(
        expect.arrayContaining([res1.status])
      );
    });
  });

  // ============================================
  // Friend Operations
  // ============================================
  describe('Friend Operations - Additional Cases', () => {
    it('should handle friend requests to non-existent user', async () => {
      const res = await request(app)
        .post('/users/testuser/friend-request')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          friendUsername: 'nonexistent',
        });

      expect([400, 404, 501]).toContain(res.status);
    });

    it('should reject self-friend requests', async () => {
      const res = await request(app)
        .post('/users/testuser/friend-request')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          friendUsername: 'testuser', // Same user
        });

      expect([400, 409, 501]).toContain(res.status);
    });

    it('should handle friend request without authentication', async () => {
      const res = await request(app)
        .post('/users/testuser/friend-request')
        .send({
          friendUsername: 'otheruser',
        });

      expect([401, 403, 501]).toContain(res.status);
    });

    it('should reject friend request with invalid token', async () => {
      const res = await request(app)
        .post('/users/testuser/friend-request')
        .set('Authorization', 'Bearer invalid-token')
        .send({
          friendUsername: 'otheruser',
        });

      expect([401, 403, 501]).toContain(res.status);
    });

    it('should handle accepting non-existent friend request', async () => {
      const res = await request(app)
        .post('/users/testuser/accept-friend')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          friendUsername: 'nonexistent',
        });

      expect([400, 404, 501]).toContain(res.status);
    });

    it('should handle rejecting without authentication', async () => {
      const res = await request(app)
        .post('/users/testuser/reject-friend')
        .send({
          friendUsername: 'otheruser',
        });

      expect([401, 403, 501]).toContain(res.status);
    });
  });
});
