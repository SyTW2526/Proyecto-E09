import { describe, it, expect, beforeEach, vi } from "vitest";
import mongoose from "mongoose";
import { emitToUser, emitMultipleToUser } from "../../src/server/utils/socketHelpers.js";

describe("socketHelpers - Unit Tests", () => {
  let mockIo: any;

  beforeEach(() => {
    // Create mock socket.io instance
    mockIo = {
      to: vi.fn(),
    };

    // Mock the emit function
    const mockRoom = {
      emit: vi.fn(),
    };

    mockIo.to.mockReturnValue(mockRoom);
  });

  describe("emitToUser", () => {
    it("debería exportar función emitToUser", () => {
      expect(typeof emitToUser).toBe("function");
    });

    it("debería llamar a io.to con la sala correcta", () => {
      const userId = new mongoose.Types.ObjectId();
      const eventName = "test";
      const data = { test: "data" };

      emitToUser(mockIo, userId, eventName, data);

      expect(mockIo.to).toHaveBeenCalled();
      expect(mockIo.to.mock.calls[0][0]).toContain("user:");
    });

    it("debería convertir ObjectId a string", () => {
      const userId = new mongoose.Types.ObjectId().toString();
      const eventName = "test";
      const data = {};

      emitToUser(mockIo, userId, eventName, data);

      const callArg = mockIo.to.mock.calls[0][0];
      expect(callArg).toContain(userId);
    });
  });

  describe("emitMultipleToUser", () => {
    it("debería exportar función emitMultipleToUser", () => {
      expect(typeof emitMultipleToUser).toBe("function");
    });

    it("debería emitir múltiples eventos", () => {
      const userId = new mongoose.Types.ObjectId();
      const events = [
        { eventName: "event1", data: {} },
        { eventName: "event2", data: {} },
      ];

      const mockRoom = {
        emit: vi.fn(),
      };
      mockIo.to.mockReturnValue(mockRoom);

      emitMultipleToUser(mockIo, userId, events);

      expect(mockRoom.emit).toHaveBeenCalledTimes(2);
    });

    it("debería usar la misma sala para todos los eventos", () => {
      const userId = new mongoose.Types.ObjectId();
      const events = [
        { eventName: "event1", data: {} },
        { eventName: "event2", data: {} },
      ];

      const freshMockIo = {
        to: vi.fn(),
      };

      const mockRoom = {
        emit: vi.fn(),
      };
      freshMockIo.to.mockReturnValue(mockRoom);

      emitMultipleToUser(freshMockIo, userId, events);

      // io.to es llamado una vez por evento
      expect(freshMockIo.to).toHaveBeenCalledTimes(2);
      // Pero siempre con la misma sala
      expect(freshMockIo.to).toHaveBeenNthCalledWith(1, `user:${userId.toString()}`);
      expect(freshMockIo.to).toHaveBeenNthCalledWith(2, `user:${userId.toString()}`);
    });
  });
});

