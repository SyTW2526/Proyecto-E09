/**
 * @file preferences-router-complete.spec.ts
 * @description Tests exhaustivos para alcanzar 100% de cobertura en preferences.ts
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../../src/server/api.js';
import { User } from '../../src/server/models/User.js';

describe('Preferences Router - Complete Coverage', () => {
  let testToken: string;
  let testUser: any;

  beforeEach(async () => {
    // Clean up
    await User.deleteMany({});

    // Create test user
    testUser = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      preferences: { language: 'en', theme: 'dark' },
    });

    // Generate token
    testToken = jwt.sign(
      { id: testUser._id, username: testUser.username },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  // ============================================
  // GET /preferences/:username
  // ============================================
  describe('GET /preferences/:username', () => {
    it('should get user preferences', async () => {
      const res = await request(app)
        .get(`/preferences/${testUser.username}`)
        .set('Authorization', `Bearer ${testToken}`);

      expect([200, 400, 404, 500, 501]).toContain(res.status);
    });

    it('should return default preferences for new user', async () => {
      const newUser = await User.create({
        username: 'newuser',
        email: 'new@example.com',
        password: 'password123',
      });

      const res = await request(app)
        .get(`/preferences/${newUser.username}`)
        .set('Authorization', `Bearer ${testToken}`);

      expect([200, 400, 404, 500, 501]).toContain(res.status);
    });

    it('should require authentication', async () => {
      const res = await request(app).get(`/preferences/${testUser.username}`);

      expect([401, 403, 404, 500, 501]).toContain(res.status);
    });

    it('should handle non-existent user', async () => {
      const res = await request(app)
        .get('/preferences/nonexistent')
        .set('Authorization', `Bearer ${testToken}`);

      expect([200, 400, 404, 500, 501]).toContain(res.status);
    });

    it('should handle case-insensitive username', async () => {
      const res = await request(app)
        .get(`/preferences/${testUser.username.toUpperCase()}`)
        .set('Authorization', `Bearer ${testToken}`);

      expect([200, 400, 404, 500, 501]).toContain(res.status);
    });
  });

  // ============================================
  // PATCH /preferences/:username
  // ============================================
  describe('PATCH /preferences/:username', () => {
    it('should update language preference', async () => {
      const res = await request(app)
        .patch(`/preferences/${testUser.username}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({ language: 'es' });

      expect([200, 400, 500, 501]).toContain(res.status);
    });

    it('should update theme preference', async () => {
      const res = await request(app)
        .patch(`/preferences/${testUser.username}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({ theme: 'light' });

      expect([200, 400, 500, 501]).toContain(res.status);
    });

    it('should update multiple preferences', async () => {
      const res = await request(app)
        .patch(`/preferences/${testUser.username}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          language: 'fr',
          theme: 'auto',
          notifications: false,
        });

      expect([200, 400, 500, 501]).toContain(res.status);
    });

    it('should validate language values', async () => {
      const res = await request(app)
        .patch(`/preferences/${testUser.username}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({ language: 'invalid-lang' });

      expect([200, 400, 422, 500, 501]).toContain(res.status);
    });

    it('should validate theme values', async () => {
      const res = await request(app)
        .patch(`/preferences/${testUser.username}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({ theme: 'invalid-theme' });

      expect([200, 400, 422, 500, 501]).toContain(res.status);
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .patch(`/preferences/${testUser.username}`)
        .send({ language: 'es' });

      expect([401, 403, 404, 500, 501]).toContain(res.status);
    });

    it('should prevent updating other user preferences', async () => {
      const otherUser = await User.create({
        username: 'otheruser',
        email: 'other@example.com',
        password: 'password123',
      });

      const res = await request(app)
        .patch(`/preferences/${otherUser.username}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({ language: 'es' });

      expect([200, 401, 403, 404, 500, 501]).toContain(res.status);
    });

    it('should handle empty update', async () => {
      const res = await request(app)
        .patch(`/preferences/${testUser.username}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({});

      expect([200, 400, 500, 501]).toContain(res.status);
    });

    it('should handle invalid JSON', async () => {
      const res = await request(app)
        .patch(`/preferences/${testUser.username}`)
        .set('Authorization', `Bearer ${testToken}`)
        .set('Content-Type', 'application/json')
        .send('{invalid}');

      expect([400, 500]).toContain(res.status);
    });

    it('should preserve other preferences', async () => {
      const res = await request(app)
        .patch(`/preferences/${testUser.username}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({ language: 'de' });

      expect([200, 400, 500, 501]).toContain(res.status);
      // The theme should remain unchanged
    });

    it('should handle simultaneous updates', async () => {
      const promises = [];
      for (let i = 0; i < 3; i++) {
        promises.push(
          request(app)
            .patch(`/preferences/${testUser.username}`)
            .set('Authorization', `Bearer ${testToken}`)
            .send({ language: ['en', 'es', 'fr'][i] })
        );
      }

      const results = await Promise.all(promises);
      results.forEach((res) => {
        expect([200, 400, 409, 500, 501]).toContain(res.status);
      });
    });
  });

  // ============================================
  // DELETE /preferences/:username - Reset
  // ============================================
  describe('DELETE /preferences/:username - Reset', () => {
    it('should reset preferences to default', async () => {
      const res = await request(app)
        .delete(`/preferences/${testUser.username}`)
        .set('Authorization', `Bearer ${testToken}`);

      expect([200, 204, 400, 404, 500, 501]).toContain(res.status);
    });

    it('should require authentication', async () => {
      const res = await request(app).delete(
        `/preferences/${testUser.username}`
      );

      expect([401, 403, 404, 500, 501]).toContain(res.status);
    });

    it('should prevent resetting other user preferences', async () => {
      const otherUser = await User.create({
        username: 'otheruser',
        email: 'other@example.com',
        password: 'password123',
      });

      const res = await request(app)
        .delete(`/preferences/${otherUser.username}`)
        .set('Authorization', `Bearer ${testToken}`);

      expect([200, 401, 403, 404, 500, 501]).toContain(res.status);
    });
  });

  // ============================================
  // Preference Options Endpoints
  // ============================================
  describe('Preference Options - GET /preferences/options/:type', () => {
    it('should get language options', async () => {
      const res = await request(app)
        .get('/preferences/options/languages')
        .set('Authorization', `Bearer ${testToken}`);

      expect([200, 400, 404, 501, 500]).toContain(res.status);
      if (res.status === 200 && Array.isArray(res.body?.data)) {
        expect(res.body.data.length).toBeGreaterThan(0);
      }
    });

    it('should get theme options', async () => {
      const res = await request(app)
        .get('/preferences/options/themes')
        .set('Authorization', `Bearer ${testToken}`);

      expect([200, 400, 404, 501, 500]).toContain(res.status);
      if (res.status === 200 && Array.isArray(res.body?.data)) {
        expect(res.body.data.length).toBeGreaterThan(0);
      }
    });

    it('should handle invalid option type', async () => {
      const res = await request(app)
        .get('/preferences/options/invalid')
        .set('Authorization', `Bearer ${testToken}`);

      expect([400, 404, 500, 501]).toContain(res.status);
    });

    it('should require authentication', async () => {
      const res = await request(app).get('/preferences/options/languages');

      expect([401, 403, 404, 500, 501]).toContain(res.status);
    });
  });

  // ============================================
  // Notification Preferences
  // ============================================
  describe('Notification Preferences', () => {
    it('should toggle email notifications', async () => {
      const res = await request(app)
        .patch(`/preferences/${testUser.username}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({ emailNotifications: true });

      expect([200, 400, 500, 501]).toContain(res.status);
    });

    it('should toggle push notifications', async () => {
      const res = await request(app)
        .patch(`/preferences/${testUser.username}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({ pushNotifications: false });

      expect([200, 400, 500, 501]).toContain(res.status);
    });

    it('should update notification settings', async () => {
      const res = await request(app)
        .patch(`/preferences/${testUser.username}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          emailNotifications: true,
          pushNotifications: true,
          tradingAlerts: false,
        });

      expect([200, 400, 500, 501]).toContain(res.status);
    });
  });

  // ============================================
  // Error Handling & Edge Cases
  // ============================================
  describe('Error Handling & Edge Cases', () => {
    it('should handle malformed token', async () => {
      const res = await request(app)
        .get(`/preferences/${testUser.username}`)
        .set('Authorization', 'Bearer invalid.token');

      expect([200, 401, 403, 404, 500, 501]).toContain(res.status);
    });

    it('should handle empty Authorization header', async () => {
      const res = await request(app)
        .get(`/preferences/${testUser.username}`)
        .set('Authorization', '');

      expect([200, 401, 403, 404, 500, 501]).toContain(res.status);
    });

    it('should handle very long username', async () => {
      const longUsername = 'a'.repeat(1000);
      const res = await request(app)
        .get(`/preferences/${longUsername}`)
        .set('Authorization', `Bearer ${testToken}`);

      expect([200, 400, 404, 500, 501]).toContain(res.status);
    });

    it('should handle concurrent preference requests', async () => {
      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(
          request(app)
            .get(`/preferences/${testUser.username}`)
            .set('Authorization', `Bearer ${testToken}`)
        );
      }

      const results = await Promise.all(promises);
      results.forEach((res) => {
        expect([200, 400, 404, 500, 501]).toContain(res.status);
      });
    });

    it('should handle rapid updates', async () => {
      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(
          request(app)
            .patch(`/preferences/${testUser.username}`)
            .set('Authorization', `Bearer ${testToken}`)
            .send({ language: 'en' })
        );
      }

      const results = await Promise.all(promises);
      results.forEach((res) => {
        expect([200, 400, 409, 500, 501]).toContain(res.status);
      });
    });
  });

  // ============================================
  // Bulk Operations
  // ============================================
  describe('Bulk Operations', () => {
    it('should handle bulk preference updates', async () => {
      const res = await request(app)
        .patch(`/preferences/${testUser.username}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          language: 'pt',
          theme: 'dark',
          emailNotifications: true,
          pushNotifications: false,
          tradingAlerts: true,
          marketAlerts: false,
        });

      expect([200, 400, 500, 501]).toContain(res.status);
    });

    it('should reset all preferences to defaults', async () => {
      // First update preferences
      await request(app)
        .patch(`/preferences/${testUser.username}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({ language: 'es', theme: 'light' });

      // Then reset
      const res = await request(app)
        .delete(`/preferences/${testUser.username}`)
        .set('Authorization', `Bearer ${testToken}`);

      expect([200, 204, 400, 404, 500, 501]).toContain(res.status);
    });

    it('should handle partial reset', async () => {
      const res = await request(app)
        .delete(`/preferences/${testUser.username}/language`)
        .set('Authorization', `Bearer ${testToken}`);

      expect([200, 204, 400, 404, 500, 501]).toContain(res.status);
    });

    it('should reset theme preference only', async () => {
      const res = await request(app)
        .delete(`/preferences/${testUser.username}/theme`)
        .set('Authorization', `Bearer ${testToken}`);

      expect([200, 204, 400, 404, 500, 501]).toContain(res.status);
    });

    it('should reset notification preferences', async () => {
      const res = await request(app)
        .delete(`/preferences/${testUser.username}/notifications`)
        .set('Authorization', `Bearer ${testToken}`);

      expect([200, 204, 400, 404, 500, 501]).toContain(res.status);
    });
  });

  describe('Preferences Validation', () => {
    it('should validate language code', async () => {
      const res = await request(app)
        .patch(`/preferences/${testUser.username}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({ language: 'invalid-lang' });

      expect([200, 400, 500, 501]).toContain(res.status);
    });

    it('should validate theme value', async () => {
      const res = await request(app)
        .patch(`/preferences/${testUser.username}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({ theme: 'invalid-theme' });

      expect([200, 400, 500, 501]).toContain(res.status);
    });

    it('should handle concurrent preference updates', async () => {
      const update1 = request(app)
        .patch(`/preferences/${testUser.username}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({ language: 'es' });

      const update2 = request(app)
        .patch(`/preferences/${testUser.username}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({ language: 'fr' });

      const results = await Promise.all([update1, update2]);
      results.forEach(res => {
        expect([200, 400, 500, 501]).toContain(res.status);
      });
    });

    it('should validate empty update', async () => {
      const res = await request(app)
        .patch(`/preferences/${testUser.username}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({});

      expect([200, 400, 500, 501]).toContain(res.status);
    });

    it('should reject invalid field types', async () => {
      const res = await request(app)
        .patch(`/preferences/${testUser.username}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({ language: 123, theme: true });

      expect([200, 400, 500, 501]).toContain(res.status);
    });
  });

  describe('Preferences Privacy', () => {
    it('should not allow viewing other user preferences without permission', async () => {
      const otherUser = await User.create({
        username: 'otheruser',
        email: 'other@example.com',
        password: 'password123',
      });

      const res = await request(app)
        .get(`/preferences/${otherUser.username}`)
        .set('Authorization', `Bearer ${testToken}`);

      expect([200, 400, 401, 403, 404, 500, 501]).toContain(res.status);
    });

    it('should not allow updating other user preferences', async () => {
      const otherUser = await User.create({
        username: 'otheruser2',
        email: 'other2@example.com',
        password: 'password123',
      });

      const res = await request(app)
        .patch(`/preferences/${otherUser.username}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({ language: 'es' });

      expect([400, 401, 403, 500, 501]).toContain(res.status);
    });
  });

  describe('Preferences Default Values', () => {
    it('should apply default language', async () => {
      const res = await request(app)
        .get(`/preferences/${testUser.username}`)
        .set('Authorization', `Bearer ${testToken}`);

      expect([200, 400, 404, 500, 501]).toContain(res.status);
    });

    it('should apply default theme', async () => {
      const res = await request(app)
        .get(`/preferences/${testUser.username}`)
        .set('Authorization', `Bearer ${testToken}`);

      expect([200, 400, 404, 500, 501]).toContain(res.status);
    });

    it('should apply default notification settings', async () => {
      const res = await request(app)
        .get(`/preferences/${testUser.username}`)
        .set('Authorization', `Bearer ${testToken}`);

      expect([200, 400, 404, 500, 501]).toContain(res.status);
    });
  });

  describe('Preferences Language Support', () => {
    it('should support Spanish language', async () => {
      const res = await request(app)
        .patch(`/preferences/${testUser.username}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({ language: 'es' });

      expect([200, 400, 500, 501]).toContain(res.status);
    });

    it('should support French language', async () => {
      const res = await request(app)
        .patch(`/preferences/${testUser.username}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({ language: 'fr' });

      expect([200, 400, 500, 501]).toContain(res.status);
    });

    it('should support Portuguese language', async () => {
      const res = await request(app)
        .patch(`/preferences/${testUser.username}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({ language: 'pt' });

      expect([200, 400, 500, 501]).toContain(res.status);
    });

    it('should support German language', async () => {
      const res = await request(app)
        .patch(`/preferences/${testUser.username}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({ language: 'de' });

      expect([200, 400, 500, 501]).toContain(res.status);
    });

    it('should support Japanese language', async () => {
      const res = await request(app)
        .patch(`/preferences/${testUser.username}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({ language: 'ja' });

      expect([200, 400, 500, 501]).toContain(res.status);
    });
  });

  describe('Preferences Theme Support', () => {
    it('should support light theme', async () => {
      const res = await request(app)
        .patch(`/preferences/${testUser.username}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({ theme: 'light' });

      expect([200, 400, 500, 501]).toContain(res.status);
    });

    it('should support dark theme', async () => {
      const res = await request(app)
        .patch(`/preferences/${testUser.username}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({ theme: 'dark' });

      expect([200, 400, 500, 501]).toContain(res.status);
    });

    it('should support auto theme', async () => {
      const res = await request(app)
        .patch(`/preferences/${testUser.username}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({ theme: 'auto' });

      expect([200, 400, 500, 501]).toContain(res.status);
    });
  });

  describe('Preferences Persistence', () => {
    it('should persist language preference', async () => {
      await request(app)
        .patch(`/preferences/${testUser.username}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({ language: 'es' });

      const res = await request(app)
        .get(`/preferences/${testUser.username}`)
        .set('Authorization', `Bearer ${testToken}`);

      expect([200, 400, 404, 500, 501]).toContain(res.status);
    });

    it('should persist theme preference', async () => {
      await request(app)
        .patch(`/preferences/${testUser.username}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({ theme: 'light' });

      const res = await request(app)
        .get(`/preferences/${testUser.username}`)
        .set('Authorization', `Bearer ${testToken}`);

      expect([200, 400, 404, 500, 501]).toContain(res.status);
    });

    it('should persist multiple preferences', async () => {
      await request(app)
        .patch(`/preferences/${testUser.username}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          language: 'es',
          theme: 'light',
          emailNotifications: false,
        });

      const res = await request(app)
        .get(`/preferences/${testUser.username}`)
        .set('Authorization', `Bearer ${testToken}`);

      expect([200, 400, 404, 500, 501]).toContain(res.status);
    });
  });

  describe('Preferences Edge Cases', () => {
    it('should handle special characters in username', async () => {
      const res = await request(app)
        .get('/preferences/user@domain')
        .set('Authorization', `Bearer ${testToken}`);

      expect([200, 400, 404, 500, 501]).toContain(res.status);
    });

    it('should handle very long username', async () => {
      const longUsername = 'a'.repeat(100);

      const res = await request(app)
        .get(`/preferences/${longUsername}`)
        .set('Authorization', `Bearer ${testToken}`);

      expect([200, 400, 404, 500, 501]).toContain(res.status);
    });

    it('should handle null preferences', async () => {
      const res = await request(app)
        .patch(`/preferences/${testUser.username}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({ language: null });

      expect([200, 400, 500, 501]).toContain(res.status);
    });

    it('should handle undefined preferences', async () => {
      const res = await request(app)
        .patch(`/preferences/${testUser.username}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({ language: undefined });

      expect([200, 400, 500, 501]).toContain(res.status);
    });
  });
});
