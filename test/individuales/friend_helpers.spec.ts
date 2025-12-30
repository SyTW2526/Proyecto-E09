import { describe, it, beforeEach, expect, afterEach } from "vitest";
import mongoose from "mongoose";
import { User } from "../../src/server/models/User.js";
import {
  removeFriendRequest,
  hasPendingFriendRequest,
  addFriendBidirectional,
  removeFriendBidirectional,
  getChatHistoryBetween,
  deleteChatHistoryBetween,
} from "../../src/server/utils/friendHelpers.js";

const testUser1 = {
  username: "friendhelper1",
  email: "friendhelper1@example.com",
  password: "password123",
};

const testUser2 = {
  username: "friendhelper2",
  email: "friendhelper2@example.com",
  password: "password123",
};

let user1: any;
let user2: any;

beforeEach(async () => {
  await User.deleteMany();
  user1 = await User.create(testUser1);
  user2 = await User.create(testUser2);
});

afterEach(async () => {
  await User.deleteMany();
});

describe("friendHelpers", () => {
  describe("removeFriendRequest", () => {
    it("elimina solicitud de amistad correctamente", () => {
      // Add a friend request
      user1.friendRequests = [
        { from: user2._id },
        { from: new mongoose.Types.ObjectId() },
      ];

      removeFriendRequest(user1, user2._id);

      expect(user1.friendRequests.length).toBe(1);
      expect(user1.friendRequests[0].from.toString()).not.toBe(user2._id.toString());
    });

    it("no afecta si no existe la solicitud", () => {
      user1.friendRequests = [{ from: new mongoose.Types.ObjectId() }];
      const initialLength = user1.friendRequests.length;

      removeFriendRequest(user1, user2._id);

      expect(user1.friendRequests.length).toBe(initialLength);
    });

    it("maneja lista vacía de solicitudes", () => {
      user1.friendRequests = [];

      removeFriendRequest(user1, user2._id);

      expect(user1.friendRequests.length).toBe(0);
    });

    it("elimina múltiples solicitudes del mismo usuario si existen", () => {
      user1.friendRequests = [
        { from: user2._id },
        { from: user2._id },
        { from: new mongoose.Types.ObjectId() },
      ];

      removeFriendRequest(user1, user2._id);

      expect(user1.friendRequests.length).toBe(1);
      expect(user1.friendRequests[0].from.toString()).not.toBe(user2._id.toString());
    });

    it("compara ObjectIds correctamente", () => {
      const objectId = new mongoose.Types.ObjectId();
      const objectIdString = objectId.toString();
      const objectIdConverted = new mongoose.Types.ObjectId(objectIdString);

      user1.friendRequests = [{ from: objectId }];

      removeFriendRequest(user1, objectIdConverted);

      expect(user1.friendRequests.length).toBe(0);
    });
  });

  describe("hasPendingFriendRequest", () => {
    it("devuelve true si existe solicitud pendiente", () => {
      user1.friendRequests = [{ from: user2._id }];

      const result = hasPendingFriendRequest(user1, user2._id);

      expect(result).toBe(true);
    });

    it("devuelve false si no existe solicitud", () => {
      user1.friendRequests = [];

      const result = hasPendingFriendRequest(user1, user2._id);

      expect(result).toBe(false);
    });

    it("devuelve false si la solicitud es de otro usuario", () => {
      const otherId = new mongoose.Types.ObjectId();
      user1.friendRequests = [{ from: otherId }];

      const result = hasPendingFriendRequest(user1, user2._id);

      expect(result).toBe(false);
    });

    it("devuelve true si hay múltiples solicitudes incluyendo la buscada", () => {
      user1.friendRequests = [
        { from: new mongoose.Types.ObjectId() },
        { from: user2._id },
        { from: new mongoose.Types.ObjectId() },
      ];

      const result = hasPendingFriendRequest(user1, user2._id);

      expect(result).toBe(true);
    });

    it("maneja comparación de ObjectIds", () => {
      const objectId = new mongoose.Types.ObjectId();
      const objectIdConverted = new mongoose.Types.ObjectId(objectId.toString());

      user1.friendRequests = [{ from: objectId }];

      const result = hasPendingFriendRequest(user1, objectIdConverted);

      expect(result).toBe(true);
    });
  });

  describe("addFriendBidirectional", () => {
    it("agrega amistad bidireccional correctamente", () => {
      addFriendBidirectional(user1, user2);

      expect(user1.friends).toContainEqual(user2._id);
      expect(user2.friends).toContainEqual(user1._id);
    });

    it("no agrega duplicados si ya son amigos", () => {
      user1.friends.push(user2._id);
      user2.friends.push(user1._id);

      addFriendBidirectional(user1, user2);

      expect(user1.friends.filter((id: any) => id.toString() === user2._id.toString()).length).toBe(1);
      expect(user2.friends.filter((id: any) => id.toString() === user1._id.toString()).length).toBe(1);
    });

    it("maneja usuario sin lista de amigos", () => {
      user1.friends = [];
      user2.friends = [];

      addFriendBidirectional(user1, user2);

      expect(user1.friends.length).toBe(1);
      expect(user2.friends.length).toBe(1);
    });

    it("agrega correctamente cuando uno ya tiene amigos", () => {
      const otherId = new mongoose.Types.ObjectId();
      user1.friends.push(otherId);

      addFriendBidirectional(user1, user2);

      expect(user1.friends.length).toBe(2);
      expect(user2.friends.length).toBe(1);
    });

    it("maneja amistad mutua que ya existe parcialmente", () => {
      user1.friends.push(user2._id);
      // user2 no tiene a user1 aún

      addFriendBidirectional(user1, user2);

      expect(user1.friends.filter((id: any) => id.toString() === user2._id.toString()).length).toBe(1);
      expect(user2.friends.filter((id: any) => id.toString() === user1._id.toString()).length).toBe(1);
    });
  });

  describe("removeFriendBidirectional", () => {
    it("elimina amistad bidireccional correctamente", () => {
      user1.friends.push(user2._id);
      user2.friends.push(user1._id);

      removeFriendBidirectional(user1, user2);

      expect(user1.friends.some((id: any) => id.toString() === user2._id.toString())).toBe(false);
      expect(user2.friends.some((id: any) => id.toString() === user1._id.toString())).toBe(false);
    });

    it("no afecta si no son amigos", () => {
      const initialUser1Length = user1.friends.length;
      const initialUser2Length = user2.friends.length;

      removeFriendBidirectional(user1, user2);

      expect(user1.friends.length).toBe(initialUser1Length);
      expect(user2.friends.length).toBe(initialUser2Length);
    });

    it("mantiene otros amigos intactos", () => {
      const otherId = new mongoose.Types.ObjectId();
      user1.friends.push(otherId);
      user1.friends.push(user2._id);
      user2.friends.push(user1._id);

      removeFriendBidirectional(user1, user2);

      expect(user1.friends.some((id: any) => id.toString() === otherId.toString())).toBe(true);
      expect(user1.friends.some((id: any) => id.toString() === user2._id.toString())).toBe(false);
    });

    it("maneja lista vacía de amigos", () => {
      user1.friends = [];
      user2.friends = [];

      removeFriendBidirectional(user1, user2);

      expect(user1.friends.length).toBe(0);
      expect(user2.friends.length).toBe(0);
    });

    it("elimina correctamente con múltiples amigos", () => {
      const otherId1 = new mongoose.Types.ObjectId();
      const otherId2 = new mongoose.Types.ObjectId();
      user1.friends.push(otherId1, user2._id, otherId2);
      user2.friends.push(otherId1, user1._id, otherId2);

      removeFriendBidirectional(user1, user2);

      expect(user1.friends.length).toBe(2);
      expect(user2.friends.length).toBe(2);
      expect(user1.friends.some((id: any) => id.toString() === user2._id.toString())).toBe(false);
      expect(user2.friends.some((id: any) => id.toString() === user1._id.toString())).toBe(false);
    });
  });

  describe("getChatHistoryBetween", () => {
    it("obtiene historial de chat entre dos usuarios", async () => {
      // Mock ChatMessage model
      const mockMessages = [
        { from: user1._id, to: user2._id, content: "Hola", createdAt: new Date() },
        { from: user2._id, to: user1._id, content: "Hola!", createdAt: new Date() },
      ];

      const mockChatMessage = {
        find: async () => ({
          sort: async () => mockMessages,
        }),
      };

      const result = await getChatHistoryBetween(
        mockChatMessage,
        user1._id,
        user2._id
      );

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);
    });

    it("obtiene mensajes en orden cronológico", async () => {
      const date1 = new Date("2024-01-01");
      const date2 = new Date("2024-01-02");

      const mockMessages = [
        { from: user1._id, to: user2._id, content: "Mensaje 1", createdAt: date1 },
        { from: user2._id, to: user1._id, content: "Mensaje 2", createdAt: date2 },
      ];

      const mockChatMessage = {
        find: async () => ({
          sort: async () => mockMessages,
        }),
      };

      const result = await getChatHistoryBetween(
        mockChatMessage,
        user1._id,
        user2._id
      );

      expect(result[0].createdAt.getTime()).toBeLessThan(result[1].createdAt.getTime());
    });

    it("maneja historial vacío", async () => {
      const mockChatMessage = {
        find: async () => ({
          sort: async () => [],
        }),
      };

      const result = await getChatHistoryBetween(
        mockChatMessage,
        user1._id,
        user2._id
      );

      expect(result.length).toBe(0);
    });
  });

  describe("deleteChatHistoryBetween", () => {
    it("elimina historial de chat entre dos usuarios", async () => {
      let deletedCount = 0;

      const mockChatMessage = {
        deleteMany: async () => {
          deletedCount = 2;
          return { deletedCount: 2 };
        },
      };

      await deleteChatHistoryBetween(mockChatMessage, user1._id, user2._id);

      expect(deletedCount).toBe(2);
    });

    it("maneja eliminación cuando no hay mensajes", async () => {
      const mockChatMessage = {
        deleteMany: async () => {
          return { deletedCount: 0 };
        },
      };

      await deleteChatHistoryBetween(mockChatMessage, user1._id, user2._id);

      // Should not throw error
      expect(true).toBe(true);
    });

    it("construye query correcta para eliminar bidireccional", async () => {
      let lastQuery: any;

      const mockChatMessage = {
        deleteMany: async (query: any) => {
          lastQuery = query;
          return { deletedCount: 2 };
        },
      };

      await deleteChatHistoryBetween(mockChatMessage, user1._id, user2._id);

      expect(lastQuery.$or).toBeDefined();
      expect(lastQuery.$or.length).toBe(2);
    });
  });
});
