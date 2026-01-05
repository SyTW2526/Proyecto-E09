import { describe, it, expect, vi } from 'vitest';
import mongoose from 'mongoose';
import { validateObjectId } from '../../src/server/utils/mongoHelpers';

vi.mock('../../src/server/utils/responseHelpers.js', () => ({
  sendError: vi.fn(),
}));

describe('mongoHelpers', () => {
  describe('validateObjectId', () => {
    it('retorna true para un ObjectId válido', () => {
      const validId = new mongoose.Types.ObjectId().toString();
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn(),
      };

      const result = validateObjectId(validId, mockRes as any);

      expect(result).toBe(true);
    });

    it('retorna false para un ID inválido', () => {
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn(),
      };

      const result = validateObjectId('invalid-id', mockRes as any);

      expect(result).toBe(false);
    });

    it('reconoce ObjectIds hexadecimales válidos (24 caracteres)', () => {
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn(),
      };

      const hexId = '507f1f77bcf86cd799439011';
      const result = validateObjectId(hexId, mockRes as any);

      expect(result).toBe(true);
    });

    it('rechaza strings que no son ObjectIds válidos', () => {
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn(),
      };

      const result = validateObjectId('this-is-not-a-valid-id', mockRes as any);

      expect(result).toBe(false);
    });

    it('maneja strings vacíos como inválidos', () => {
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn(),
      };

      const result = validateObjectId('', mockRes as any);

      expect(result).toBe(false);
    });
  });
});
