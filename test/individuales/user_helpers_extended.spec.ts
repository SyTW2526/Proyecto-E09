import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  findUserByIdentifier,
  findUserOrFail,
  checkUserExists,
  sanitizeUserData,
  isValidCollectionType,
  getUserCardsPaginated,
  validateOwnership,
  findFriendByIdentifier,
  getCurrentUserOrFail,
} from '../../src/server/utils/userHelpers';
import { User } from '../../src/server/models/User';
import { UserCard } from '../../src/server/models/UserCard';
import { Card } from '../../src/server/models/Card';
import { Response } from 'express';

describe('userHelpers - Functional Tests', () => {
  let testUser: any, testUser2: any, testCard: any, testUserCard: any;
  let mockRes: any;

  beforeEach(async () => {
    // Clean up
    await User.deleteMany({});
    await UserCard.deleteMany({});
    await Card.deleteMany({});

    // Create test users
    testUser = await User.create({
      username: 'helpertest',
      email: 'helpertest@test.com',
      password: 'hashed_password',
      profileImage: 'profile.jpg',
    });

    testUser2 = await User.create({
      username: 'helpertest2',
      email: 'helpertest2@test.com',
      password: 'hashed_password',
    });

    // Create test card
    testCard = await Card.create({
      name: 'Helper Test Card',
      pokemonTcgId: 'test-456',
      rarity: 'Rare',
      set: 'Base Set',
      price: 75,
    });

    // Create user cards
    testUserCard = await UserCard.create({
      userId: testUser._id,
      cardId: testCard._id,
      pokemonTcgId: 'test-456',
      quantity: 3,
      collectionType: 'collection',
      forTrade: true,
    });

    // Mock Response object
    mockRes = {
      status: function(code: number) { 
        this.statusCode = code;
        return this; 
      },
      json: function(data: any) { 
        this.jsonData = data;
        return this; 
      },
      send: function(data: any) {
        this.sendData = data;
        return this;
      }
    };
  });

  afterEach(async () => {
    await User.deleteMany({});
    await UserCard.deleteMany({});
    await Card.deleteMany({});
  });

  describe('findUserByIdentifier', () => {
    it('encuentra un usuario por ID', async () => {
      const result = await findUserByIdentifier(testUser._id.toString());
      expect(result).toBeDefined();
      expect(result?.username).toBe('helpertest');
    });

    it('encuentra un usuario por username', async () => {
      const result = await findUserByIdentifier('helpertest');
      expect(result).toBeDefined();
      expect(result?._id).toEqual(testUser._id);
    });

    it('retorna null si no encuentra el usuario', async () => {
      const result = await findUserByIdentifier('nonexistent');
      expect(result).toBeNull();
    });

    it('intenta buscar por ID primero, luego por username', async () => {
      // Valid MongoDB ID format
      const result = await findUserByIdentifier(testUser._id.toString());
      expect(result).toBeDefined();
      expect(result?.username).toBe('helpertest');
    });
  });

  describe('findUserOrFail', () => {
    it('retorna el usuario si existe', async () => {
      const result = await findUserOrFail('helpertest', mockRes);
      expect(result).toBeDefined();
      expect(result?.username).toBe('helpertest');
    });

    it('retorna null si el usuario no existe', async () => {
      const result = await findUserOrFail('nonexistent', mockRes);
      expect(result).toBeNull();
    });

    it('encuentra por ID o username', async () => {
      const resultById = await findUserOrFail(testUser._id.toString(), mockRes);
      const resultByUsername = await findUserOrFail('helpertest', mockRes);
      
      expect(resultById?._id).toEqual(resultByUsername?._id);
    });
  });

  describe('checkUserExists', () => {
    it('retorna true si el username existe', async () => {
      const result = await checkUserExists('helpertest', 'newemail@test.com');
      expect(result).toBe(true);
    });

    it('retorna true si el email existe', async () => {
      const result = await checkUserExists('newusername', 'helpertest@test.com');
      expect(result).toBe(true);
    });

    it('retorna false si ni username ni email existen', async () => {
      const result = await checkUserExists('uniqueuser', 'unique@test.com');
      expect(result).toBe(false);
    });

    it('chequea ambos con OR logic', async () => {
      const result1 = await checkUserExists('helpertest', 'anything@test.com');
      const result2 = await checkUserExists('anything', 'helpertest@test.com');
      
      expect(result1).toBe(true);
      expect(result2).toBe(true);
    });
  });

  describe('sanitizeUserData', () => {
    it('elimina campos sensibles (password, __v)', () => {
      const user = {
        _id: testUser._id,
        username: 'testuser',
        email: 'test@test.com',
        password: 'secretpassword',
        __v: 0,
        createdAt: new Date(),
        profileImage: 'image.jpg',
      };

      const sanitized = sanitizeUserData(user);

      expect(sanitized).not.toHaveProperty('password');
      expect(sanitized).not.toHaveProperty('__v');
      expect(sanitized.username).toBe('testuser');
      expect(sanitized.email).toBe('test@test.com');
      expect(sanitized.id).toEqual(testUser._id);
    });

    it('mantiene campos públicos', () => {
      const sanitized = sanitizeUserData({
        _id: '123',
        username: 'test',
        email: 'test@test.com',
        profileImage: 'pic.jpg',
        createdAt: new Date(),
        password: 'hidden',
      });

      expect(sanitized.username).toBe('test');
      expect(sanitized.email).toBe('test@test.com');
      expect(sanitized.profileImage).toBe('pic.jpg');
    });

    it('llama a toObject si existe', () => {
      const user = {
        _id: '789',
        username: 'mongouser',
        email: 'mongo@test.com',
        password: 'secret',
        toObject: () => ({
          _id: '789',
          username: 'mongouser',
          email: 'mongo@test.com',
          password: 'secret',
        }),
      };

      const sanitized = sanitizeUserData(user);
      expect(sanitized.username).toBe('mongouser');
      expect(sanitized).not.toHaveProperty('password');
    });
  });

  describe('isValidCollectionType', () => {
    it('acepta "collection"', () => {
      expect(isValidCollectionType('collection')).toBe(true);
    });

    it('acepta "wishlist"', () => {
      expect(isValidCollectionType('wishlist')).toBe(true);
    });

    it('rechaza otros tipos', () => {
      expect(isValidCollectionType('archive')).toBe(false);
      expect(isValidCollectionType('invalid')).toBe(false);
      expect(isValidCollectionType('')).toBe(false);
      expect(isValidCollectionType('Collection')).toBe(false); // case sensitive
    });

    it('rechaza undefined y null', () => {
      expect(isValidCollectionType(undefined)).toBe(false);
      expect(isValidCollectionType(null)).toBe(false);
    });
  });

  describe('getUserCardsPaginated', () => {
    beforeEach(async () => {
      // Create more cards for pagination tests
      for (let i = 0; i < 5; i++) {
        const card = await Card.create({
          name: `Card ${i}`,
          pokemonTcgId: `test-${i}`,
          rarity: 'Rare',
          set: 'Base Set',
          price: 50 + i,
        });

        await UserCard.create({
          userId: testUser._id,
          cardId: card._id,
          pokemonTcgId: `test-${i}`,
          quantity: i + 1,
          collectionType: i % 2 === 0 ? 'collection' : 'wishlist',
          forTrade: i < 3,
        });
      }
    });

    it('obtiene cartas del usuario paginadas', async () => {
      const result = await getUserCardsPaginated('helpertest', {}, { page: '1', limit: 10 });

      expect(result.cards).toBeDefined();
      expect(result.pageNum).toBe(1);
      expect(result.totalPages).toBeGreaterThan(0);
      expect(result.total).toBeGreaterThan(0);
    });

    it('filtra por collectionType', async () => {
      const result = await getUserCardsPaginated(
        'helpertest',
        { collectionType: 'collection' },
        { page: '1', limit: 20 }
      );

      expect(result.cards).toBeDefined();
      if (result.cards.length > 0) {
        result.cards.forEach((card: any) => {
          expect(card.collectionType).toBe('collection');
        });
      }
    });

    it('respeta el límite de resultados', async () => {
      const result = await getUserCardsPaginated('helpertest', {}, { page: '1', limit: 2 });

      expect(result.cards.length).toBeLessThanOrEqual(2);
    });

    it('retorna error si el usuario no existe', async () => {
      const result = await getUserCardsPaginated('nonexistentuser', {}, { page: '1', limit: 10 });

      expect(result.error).toBe('Usuario no encontrado');
      expect(result.statusCode).toBe(404);
    });

    it('filtra por forTrade', async () => {
      const result = await getUserCardsPaginated(
        'helpertest',
        {},
        { page: '1', limit: 20, forTrade: 'true' }
      );

      expect(result.cards).toBeDefined();
      if (result.cards.length > 0) {
        result.cards.forEach((card: any) => {
          expect(card.forTrade).toBe(true);
        });
      }
    });

    it('calcula totalPages correctamente', async () => {
      const result1 = await getUserCardsPaginated('helpertest', {}, { page: '1', limit: 2 });
      const total = result1.total;
      const expectedPages = Math.ceil(total / 2);

      expect(result1.totalPages).toBe(expectedPages);
    });
  });

  describe('validateOwnership', () => {
    it('retorna true si los IDs coinciden', () => {
      const userId = testUser._id.toString();
      const resourceUserId = testUser._id.toString();

      expect(validateOwnership(userId, resourceUserId)).toBe(true);
    });

    it('retorna true si los ObjectIds son iguales', () => {
      expect(validateOwnership(testUser._id, testUser._id)).toBe(true);
    });

    it('retorna false si los IDs no coinciden', () => {
      expect(validateOwnership(testUser._id, testUser2._id)).toBe(false);
    });

    it('maneja null y undefined', () => {
      expect(validateOwnership(null, 'some-id')).toBe(false);
      expect(validateOwnership(undefined, 'some-id')).toBe(false);
      expect(validateOwnership('some-id', null)).toBe(false);
    });

    it('compara mediante toString()', () => {
      expect(validateOwnership(testUser._id, testUser._id.toString())).toBe(true);
    });
  });

  describe('findFriendByIdentifier', () => {
    it('encuentra un amigo por ID', async () => {
      const result = await findFriendByIdentifier(testUser._id.toString());
      expect(result).toBeDefined();
      expect(result?.username).toBe('helpertest');
    });

    it('encuentra un amigo por username', async () => {
      const result = await findFriendByIdentifier('helpertest');
      expect(result).toBeDefined();
      expect(result?._id).toEqual(testUser._id);
    });

    it('retorna null si no existe', async () => {
      const result = await findFriendByIdentifier('nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('getCurrentUserOrFail', () => {
    it('retorna el usuario actual si existe', async () => {
      const result = await getCurrentUserOrFail(testUser._id);
      expect(result).toBeDefined();
      expect(result?.username).toBe('helpertest');
    });

    it('retorna null si userId es falsy', async () => {
      const result = await getCurrentUserOrFail(null, mockRes);
      expect(result).toBeNull();
    });

    it('retorna null si el usuario no existe', async () => {
      const result = await getCurrentUserOrFail('507f1f77bcf86cd799439999', mockRes);
      expect(result).toBeNull();
    });

    it('maneja undefined userId', async () => {
      const result = await getCurrentUserOrFail(undefined, mockRes);
      expect(result).toBeNull();
    });
  });

  describe('User Data Validation and Sanitization', () => {
    it('sanitiza datos de usuario completamente', async () => {
      const userData = {
        username: 'test',
        email: 'test@test.com',
        password: 'secret',
        __v: 1,
      };
      const sanitized = sanitizeUserData(userData);
      expect(sanitized.password).toBeUndefined();
      expect(sanitized.__v).toBeUndefined();
    });

    it('preserva información válida al sanitizar', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@test.com',
        profileImage: 'profile.jpg',
      };
      const sanitized = sanitizeUserData(userData);
      expect(sanitized.username).toBe('testuser');
      expect(sanitized.email).toBe('test@test.com');
    });

    it('valida tipos de colección válidos', async () => {
      expect(isValidCollectionType('collection')).toBe(true);
      expect(isValidCollectionType('wishlist')).toBe(true);
    });

    it('rechaza tipos de colección inválidos', async () => {
      expect(isValidCollectionType('invalid')).toBe(false);
      expect(isValidCollectionType('pokemon')).toBe(false);
    });

    it('maneja colección type undefined', async () => {
      expect(isValidCollectionType(undefined as any)).toBe(false);
      expect(isValidCollectionType(null as any)).toBe(false);
    });
  });

  describe('User Search and Identification', () => {
    it('encuentra usuario por ID válido', async () => {
      const result = await findUserByIdentifier(testUser._id.toString());
      expect(result).toBeDefined();
      expect(result?.username).toBe('helpertest');
    });

    it('encuentra usuario por username', async () => {
      const result = await findUserByIdentifier('helpertest');
      expect(result).toBeDefined();
      expect(result?.email).toBe('helpertest@test.com');
    });

    it('no encuentra usuario inexistente por username', async () => {
      const result = await findUserByIdentifier('nonexistent');
      expect(result).toBeNull();
    });

    it('no encuentra usuario con ID inválido', async () => {
      const result = await findUserByIdentifier('507f1f77bcf86cd799439999');
      expect(result).toBeNull();
    });
  });

  describe('User Existence Checking', () => {
    it('confirma que usuario existe por username y email', async () => {
      const result = await checkUserExists('helpertest', 'helpertest@test.com');
      expect(result).toBe(true);
    });

    it('confirma que usuario no existe', async () => {
      const result = await checkUserExists('nonexistentuser', 'nonexistent@test.com');
      expect(result).toBe(false);
    });

    it('encuentra usuario por username', async () => {
      const result = await checkUserExists('helpertest', 'different@test.com');
      expect(result).toBe(true);
    });

    it('encuentra usuario por email', async () => {
      const result = await checkUserExists('different', 'helpertest@test.com');
      expect(result).toBe(true);
    });
  });

  describe('User Failure Handling', () => {
    it('retorna usuario si existe', async () => {
      const result = await findUserOrFail(testUser._id.toString(), mockRes);
      expect(result).toBeDefined();
      expect(result?.username).toBe('helpertest');
    });

    it('retorna null y envía error si usuario no existe', async () => {
      const result = await findUserOrFail('nonexistent', mockRes);
      expect(result).toBeNull();
    });
  });

  describe('User Sanitization Edge Cases', () => {
    it('maneja sanitización de usuario con toObject', async () => {
      const user = testUser;
      const sanitized = sanitizeUserData(user);
      expect(sanitized.id).toBeDefined();
      expect(sanitized.username).toBe('helpertest');
      expect(sanitized.password).toBeUndefined();
    });

    it('maneja sanitización de objeto plano', async () => {
      const userData = {
        _id: testUser._id,
        username: 'test',
        email: 'test@test.com',
        password: 'secret',
        __v: 0,
      };
      const sanitized = sanitizeUserData(userData);
      expect(sanitized.password).toBeUndefined();
      expect(sanitized.__v).toBeUndefined();
    });

    it('incluye profileImage cuando existe', async () => {
      const userData = {
        _id: testUser._id,
        username: 'test',
        email: 'test@test.com',
        profileImage: 'https://example.com/image.jpg',
      };
      const sanitized = sanitizeUserData(userData);
      expect(sanitized.profileImage).toBe('https://example.com/image.jpg');
    });

    it('usa string vacío para profileImage inexistente', async () => {
      const userData = {
        _id: testUser._id,
        username: 'test',
        email: 'test@test.com',
      };
      const sanitized = sanitizeUserData(userData);
      expect(sanitized.profileImage).toBe('');
    });
  });

  describe('User Multiple Lookup Scenarios', () => {
    it('encuentra usuario existente por ObjectId', async () => {
      const result = await findUserByIdentifier(testUser._id.toString());
      expect(result?._id).toEqual(testUser._id);
    });

    it('intenta búsqueda por ObjectId primero', async () => {
      const validObjectId = '507f1f77bcf86cd799439011';
      const result = await findUserByIdentifier(validObjectId);
      // Should be null if that ID doesn't exist
      expect(result).toBeNull();
    });

    it('fallback a búsqueda por username después de ObjectId', async () => {
      const result = await findUserByIdentifier('helpertest');
      expect(result?.username).toBe('helpertest');
    });

    it('maneja búsqueda de múltiples usuarios sin conflicto', async () => {
      const newUser = await User.create({
        username: 'newuser',
        email: 'newuser@test.com',
        password: 'hash',
      });

      const result1 = await findUserByIdentifier('helpertest');
      const result2 = await findUserByIdentifier('newuser');

      expect(result1?.username).toBe('helpertest');
      expect(result2?.username).toBe('newuser');
    });
  });
});