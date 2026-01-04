import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  removeFriendRequest,
  hasPendingFriendRequest,
  addFriendBidirectional,
  removeFriendBidirectional,
  getChatHistoryBetween,
  deleteChatHistoryBetween,
} from '../../src/server/utils/friendHelpers';

describe('friendHelpers', () => {
  describe('removeFriendRequest', () => {
    it('elimina una solicitud de amistad específica', () => {
      const user = {
        friendRequests: [{ from: '123' }, { from: '456' }, { from: '789' }],
      };

      removeFriendRequest(user, '456');

      expect(user.friendRequests).toHaveLength(2);
      expect(user.friendRequests.map((r: any) => r.from)).toEqual([
        '123',
        '789',
      ]);
    });

    it('no afecta otras solicitudes', () => {
      const user = {
        friendRequests: [{ from: '123' }, { from: '456' }],
      };

      removeFriendRequest(user, '999');

      expect(user.friendRequests).toHaveLength(2);
    });
  });

  describe('hasPendingFriendRequest', () => {
    it('retorna true si hay solicitud pendiente', () => {
      const user = {
        friendRequests: [{ from: '123' }, { from: '456' }],
      };

      const result = hasPendingFriendRequest(user, '123');

      expect(result).toBe(true);
    });

    it('retorna false si no hay solicitud pendiente', () => {
      const user = {
        friendRequests: [{ from: '123' }],
      };

      const result = hasPendingFriendRequest(user, '999');

      expect(result).toBe(false);
    });
  });

  describe('addFriendBidirectional', () => {
    it('agrega amistad bidireccional correctamente', () => {
      const user1 = { _id: '123', friends: [] };
      const user2 = { _id: '456', friends: [] };

      addFriendBidirectional(user1, user2);

      expect(user1.friends).toContain('456');
      expect(user2.friends).toContain('123');
    });

    it('no agrega duplicados', () => {
      const user1 = { _id: '123', friends: ['456'] };
      const user2 = { _id: '456', friends: ['123'] };

      addFriendBidirectional(user1, user2);

      expect(user1.friends).toEqual(['456']);
      expect(user2.friends).toEqual(['123']);
    });
  });

  describe('removeFriendBidirectional', () => {
    it('elimina amistad bidireccional correctamente', () => {
      const user1 = { _id: '123', friends: ['456', '789'] };
      const user2 = { _id: '456', friends: ['123', '999'] };

      removeFriendBidirectional(user1, user2);

      expect(user1.friends).toEqual(['789']);
      expect(user2.friends).toEqual(['999']);
    });

    it('maneja IDs como ObjectId', () => {
      const user1 = { _id: '123', friends: [{ toString: () => '456' }, '789'] };
      const user2 = { _id: '456', friends: [{ toString: () => '123' }, '999'] };

      removeFriendBidirectional(user1, user2);

      expect(user1.friends).toHaveLength(1);
      expect(user2.friends).toHaveLength(1);
    });
  });

  describe('getChatHistoryBetween', () => {
    it('obtiene mensajes entre dos usuarios', async () => {
      const mockMessages = [
        { from: '123', to: '456', text: 'Hola' },
        { from: '456', to: '123', text: 'Hola!' },
      ];

      const mockChatMessage = {
        find: vi.fn().mockReturnThis(),
        sort: vi.fn().mockResolvedValue(mockMessages),
      };

      const result = await getChatHistoryBetween(mockChatMessage, '123', '456');

      expect(result).toEqual(mockMessages);
      expect(mockChatMessage.find).toHaveBeenCalledWith({
        $or: [
          { from: '123', to: '456' },
          { from: '456', to: '123' },
        ],
      });
    });
  });

  describe('deleteChatHistoryBetween', () => {
    it('elimina mensajes entre dos usuarios', async () => {
      const mockChatMessage = {
        deleteMany: vi.fn().mockResolvedValue({ deletedCount: 2 }),
      };

      await deleteChatHistoryBetween(mockChatMessage, '123', '456');

      expect(mockChatMessage.deleteMany).toHaveBeenCalledWith({
        $or: [
          { from: '123', to: '456' },
          { from: '456', to: '123' },
        ],
      });
    });
  });
});
