import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  isValidCollectionType,
  validateOwnership,
  sanitizeUserData,
} from '../../src/server/utils/userHelpers';

describe('userHelpers', () => {
  describe('isValidCollectionType', () => {
    it('retorna true para "collection"', () => {
      expect(isValidCollectionType('collection')).toBe(true);
    });

    it('retorna true para "wishlist"', () => {
      expect(isValidCollectionType('wishlist')).toBe(true);
    });

    it('retorna false para tipos inválidos', () => {
      expect(isValidCollectionType('invalid')).toBe(false);
      expect(isValidCollectionType('archive')).toBe(false);
      expect(isValidCollectionType('')).toBe(false);
    });

    it('retorna false para undefined', () => {
      expect(isValidCollectionType(undefined)).toBe(false);
    });
  });

  describe('validateOwnership', () => {
    it('retorna true si los IDs coinciden como strings', () => {
      const userId = '507f1f77bcf86cd799439011';
      const resourceUserId = '507f1f77bcf86cd799439011';

      expect(validateOwnership(userId, resourceUserId)).toBe(true);
    });

    it('retorna false si los IDs no coinciden', () => {
      const userId = '507f1f77bcf86cd799439011';
      const resourceUserId = '507f1f77bcf86cd799439012';

      expect(validateOwnership(userId, resourceUserId)).toBe(false);
    });

    it('maneja ObjectIds con método toString()', () => {
      const userId = { toString: () => '507f1f77bcf86cd799439011' };
      const resourceUserId = { toString: () => '507f1f77bcf86cd799439011' };

      expect(validateOwnership(userId, resourceUserId)).toBe(true);
    });

    it('retorna false si userId es undefined', () => {
      expect(validateOwnership(undefined, 'some-id')).toBe(false);
    });
  });

  describe('sanitizeUserData', () => {
    it('elimina el campo password', () => {
      const user = {
        _id: '123',
        username: 'testuser',
        email: 'test@test.com',
        password: 'secretpassword',
        createdAt: new Date(),
        __v: 0,
      };

      const sanitized = sanitizeUserData(user);

      expect(sanitized).not.toHaveProperty('password');
      expect(sanitized).not.toHaveProperty('__v');
    });

    it('mantiene campos públicos', () => {
      const user = {
        _id: '123',
        username: 'testuser',
        email: 'test@test.com',
        profileImage: 'image.jpg',
        password: 'secret',
        createdAt: new Date(),
      };

      const sanitized = sanitizeUserData(user);

      expect(sanitized.username).toBe('testuser');
      expect(sanitized.email).toBe('test@test.com');
      expect(sanitized.id).toBe('123');
    });

    it('convierte a objeto si tiene toObject()', () => {
      const user = {
        _id: '123',
        username: 'testuser',
        password: 'secret',
        toObject: vi.fn().mockReturnValue({
          _id: '123',
          username: 'testuser',
          email: 'test@test.com',
          password: 'secret',
        }),
      };

      const sanitized = sanitizeUserData(user);

      expect(user.toObject).toHaveBeenCalled();
      expect(sanitized.username).toBe('testuser');
    });

    it('copia propiedades en caso contrario', () => {
      const user = {
        _id: '456',
        username: 'plainuser',
        password: 'hidden',
        email: 'plain@test.com',
      };

      const sanitized = sanitizeUserData(user);

      expect(sanitized.username).toBe('plainuser');
      expect(sanitized.id).toBe('456');
      expect(sanitized).not.toHaveProperty('password');
    });
  });
});
