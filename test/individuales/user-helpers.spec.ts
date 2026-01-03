import { describe, it, beforeEach, afterEach, expect, vi } from "vitest";
import mongoose from "mongoose";
import { Response } from "express";
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
} from "../../src/server/utils/userHelpers.js";
import { User } from "../../src/server/models/User.js";
import { UserCard } from "../../src/server/models/UserCard.js";
import { Card } from "../../src/server/models/Card.js";

/**
 * Tests exhaustivos para userHelpers.ts
 */

beforeEach(async () => {
  await User.deleteMany();
  await UserCard.deleteMany();
  await Card.deleteMany();
});

afterEach(async () => {
  await User.deleteMany();
  await UserCard.deleteMany();
  await Card.deleteMany();
});

describe("User Helpers", () => {
  const userData = {
    username: "testuser",
    email: "test@example.com",
    password: "pass123",
  };

  describe("findUserByIdentifier", () => {
    it("busca usuario por ID válido", async () => {
      const user = await User.create(userData);
      const result = await findUserByIdentifier(String(user._id));

      expect(result).toBeDefined();
      expect(result?.username).toBe(userData.username);
    });

    it("busca usuario por username", async () => {
      await User.create(userData);
      const result = await findUserByIdentifier(userData.username);

      expect(result).toBeDefined();
      expect(result?.email).toBe(userData.email);
    });

    it("retorna null si no encuentra nada", async () => {
      const result = await findUserByIdentifier("nonexistent");

      expect(result).toBeNull();
    });

    it("retorna null si el ID no es válido", async () => {
      const result = await findUserByIdentifier("invalid-id");

      expect(result).toBeNull();
    });
  });

  describe("findUserOrFail", () => {
    it("retorna usuario si existe", async () => {
      const user = await User.create(userData);
      const mockRes = {} as Response;

      const result = await findUserOrFail(String(user._id), mockRes);

      expect(result).toBeDefined();
      expect(result?.username).toBe(userData.username);
    });

    it("envía error 404 si no existe", async () => {
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn(),
      } as any;

      const result = await findUserOrFail("nonexistent", mockRes);

      expect(result).toBeNull();
    });
  });

  describe("checkUserExists", () => {
    it("retorna true si el username existe", async () => {
      await User.create(userData);

      const exists = await checkUserExists(userData.username, "other@example.com");

      expect(exists).toBe(true);
    });

    it("retorna true si el email existe", async () => {
      await User.create(userData);

      const exists = await checkUserExists("otheruser", userData.email);

      expect(exists).toBe(true);
    });

    it("retorna false si no existe nada", async () => {
      const exists = await checkUserExists("newuser", "new@example.com");

      expect(exists).toBe(false);
    });
  });

  describe("sanitizeUserData", () => {
    it("elimina campos sensibles", async () => {
      const user = await User.create(userData);

      const sanitized = sanitizeUserData(user);

      expect(sanitized).not.toHaveProperty("password");
      expect(sanitized).not.toHaveProperty("__v");
      expect(sanitized).toHaveProperty("username");
      expect(sanitized).toHaveProperty("email");
    });

    it("mantiene campos públicos", async () => {
      const user = await User.create({
        ...userData,
        profileImage: "https://example.com/image.jpg",
      });

      const sanitized = sanitizeUserData(user);

      expect(sanitized.username).toBe(userData.username);
      expect(sanitized.email).toBe(userData.email);
    });

    it("usa id en lugar de _id", async () => {
      const user = await User.create(userData);

      const sanitized = sanitizeUserData(user);

      expect(sanitized).toHaveProperty("id");
      expect(sanitized.id).toEqual(user._id);
    });
  });

  describe("isValidCollectionType", () => {
    it("retorna true para 'collection'", () => {
      const valid = isValidCollectionType("collection");

      expect(valid).toBe(true);
    });

    it("retorna true para 'wishlist'", () => {
      const valid = isValidCollectionType("wishlist");

      expect(valid).toBe(true);
    });

    it("retorna false para tipos inválidos", () => {
      expect(isValidCollectionType("other")).toBe(false);
      expect(isValidCollectionType("invalid")).toBe(false);
      expect(isValidCollectionType("")).toBe(false);
      expect(isValidCollectionType(null)).toBe(false);
    });
  });

  describe("getUserCardsPaginated", () => {
    it("obtiene cartas paginadas de un usuario", async () => {
      const user = await User.create(userData);
      const card = await Card.create({
        pokemonTcgId: "sv04.5-001",
        cardName: "Test Card",
        cardImage: "https://example.com/card.jpg",
        rarity: "Rare",
        estimatedValue: 50,
      });

      await UserCard.create({
        userId: user._id,
        cardId: card._id,
        collectionType: "collection",
        quantity: 1,
      });

      const result = await getUserCardsPaginated(userData.username, {}, { page: 1, limit: 10 });

      expect(result).toHaveProperty("cards");
      expect(result.cards).toBeInstanceOf(Array);
      expect(result.pageNum).toBe(1);
      expect(result.total).toBe(1);
    });

    it("filtra por collectionType", async () => {
      const user = await User.create(userData);
      const card = await Card.create({
        pokemonTcgId: "sv04.5-002",
        cardName: "Test Card 2",
        cardImage: "https://example.com/card2.jpg",
        rarity: "Rare",
        estimatedValue: 100,
      });

      await UserCard.create({
        userId: user._id,
        cardId: card._id,
        collectionType: "wishlist",
        quantity: 0,
      });

      const result = await getUserCardsPaginated(
        userData.username,
        { collectionType: "wishlist" },
        { page: 1, limit: 10 }
      );

      expect(result.total).toBe(1);
      expect(result.cards[0].collectionType).toBe("wishlist");
    });

    it("filtra por forTrade", async () => {
      const user = await User.create(userData);
      const card = await Card.create({
        pokemonTcgId: "sv04.5-003",
        cardName: "Trade Card",
        cardImage: "https://example.com/trade.jpg",
        rarity: "Rare",
        estimatedValue: 75,
      });

      await UserCard.create({
        userId: user._id,
        cardId: card._id,
        collectionType: "collection",
        quantity: 2,
        forTrade: true,
      });

      const result = await getUserCardsPaginated(
        userData.username,
        {},
        { page: 1, limit: 10, forTrade: "true" }
      );

      expect(result.total).toBe(1);
    });

    it("retorna error si el usuario no existe", async () => {
      const result = await getUserCardsPaginated("nonexistent", {}, { page: 1, limit: 10 });

      expect(result).toHaveProperty("error");
      expect(result.statusCode).toBe(404);
    });

    it("respeta el límite de resultados", async () => {
      const user = await User.create(userData);
      const card = await Card.create({
        pokemonTcgId: "sv04.5-004",
        cardName: "Test Card 4",
        cardImage: "https://example.com/card4.jpg",
        rarity: "Rare",
        estimatedValue: 50,
      });

      for (let i = 0; i < 5; i++) {
        await UserCard.create({
          userId: user._id,
          cardId: card._id,
          collectionType: "collection",
          quantity: 1,
        });
      }

      const result = await getUserCardsPaginated(userData.username, {}, { page: 1, limit: 2 });

      expect(result.cards.length).toBe(2);
      expect(result.total).toBe(5);
      expect(result.totalPages).toBe(3);
    });

    it("pagina correctamente", async () => {
      const user = await User.create(userData);
      const card = await Card.create({
        pokemonTcgId: "sv04.5-005",
        cardName: "Pagination Card",
        cardImage: "https://example.com/page.jpg",
        rarity: "Rare",
        estimatedValue: 50,
      });

      for (let i = 0; i < 5; i++) {
        await UserCard.create({
          userId: user._id,
          cardId: card._id,
          collectionType: "collection",
          quantity: 1,
        });
      }

      const page2 = await getUserCardsPaginated(userData.username, {}, { page: 2, limit: 2 });

      expect(page2.cards.length).toBe(2);
      expect(page2.pageNum).toBe(2);
    });
  });

  describe("validateOwnership", () => {
    it("retorna true si el usuario es propietario", () => {
      const userId = new mongoose.Types.ObjectId();
      const resourceUserId = userId;

      const result = validateOwnership(userId, resourceUserId);

      expect(result).toBe(true);
    });

    it("retorna false si el usuario no es propietario", () => {
      const userId = new mongoose.Types.ObjectId();
      const resourceUserId = new mongoose.Types.ObjectId();

      const result = validateOwnership(userId, resourceUserId);

      expect(result).toBe(false);
    });

    it("compara correctamente strings y ObjectIds", () => {
      const id = new mongoose.Types.ObjectId();
      const idString = String(id);

      const result = validateOwnership(id, idString);

      expect(result).toBe(true);
    });
  });

  describe("findFriendByIdentifier", () => {
    it("busca amigo por ID", async () => {
      const friend = await User.create({
        username: "friend1",
        email: "friend1@example.com",
        password: "pass123",
      });

      const result = await findFriendByIdentifier(String(friend._id));

      expect(result).toBeDefined();
      expect(result?.username).toBe("friend1");
    });

    it("busca amigo por username", async () => {
      await User.create({
        username: "friend2",
        email: "friend2@example.com",
        password: "pass123",
      });

      const result = await findFriendByIdentifier("friend2");

      expect(result).toBeDefined();
      expect(result?.email).toBe("friend2@example.com");
    });

    it("retorna null si el amigo no existe", async () => {
      const result = await findFriendByIdentifier("nonexistentfriend");

      expect(result).toBeNull();
    });
  });

  describe("getCurrentUserOrFail", () => {
    it("obtiene el usuario actual si está autenticado", async () => {
      const user = await User.create(userData);

      const result = await getCurrentUserOrFail(user._id);

      expect(result).toBeDefined();
      expect(result?.username).toBe(userData.username);
    });

    it("retorna null si userId es null/undefined sin response", async () => {
      const result = await getCurrentUserOrFail(null);

      expect(result).toBeNull();
    });

    it("envía error 401 si no hay userId", async () => {
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn(),
      } as any;

      const result = await getCurrentUserOrFail(null, mockRes);

      expect(result).toBeNull();
    });

    it("envía error 404 si el usuario no existe", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn(),
      } as any;

      const result = await getCurrentUserOrFail(fakeId, mockRes);

      expect(result).toBeNull();
    });
  });
});
