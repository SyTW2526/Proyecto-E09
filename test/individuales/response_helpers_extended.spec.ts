import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  sendSuccess,
  sendError,
  handleMongooseError,
  sendPaginated,
  validateRequiredFields,
  ensureResourceExists,
} from '../../src/server/utils/responseHelpers';

describe('responseHelpers', () => {
  let mockRes: any;

  beforeEach(() => {
    mockRes = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
    };
  });

  describe('sendSuccess', () => {
    it('envía respuesta exitosa con datos', () => {
      const data = { id: 1, name: 'test' };

      sendSuccess(mockRes, data);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.send).toHaveBeenCalledWith({
        success: true,
        data,
      });
    });

    it('incluye mensaje si se proporciona', () => {
      const data = { id: 1 };

      sendSuccess(mockRes, data, 'Operación exitosa');

      expect(mockRes.send).toHaveBeenCalledWith({
        success: true,
        message: 'Operación exitosa',
        data,
      });
    });

    it('usa código de estado personalizado', () => {
      const data = { id: 1 };

      sendSuccess(mockRes, data, undefined, 201);

      expect(mockRes.status).toHaveBeenCalledWith(201);
    });
  });

  describe('sendError', () => {
    it('envía respuesta de error con string', () => {
      sendError(mockRes, 'Error de prueba');

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.send).toHaveBeenCalledWith({
        success: false,
        error: 'Error de prueba',
      });
    });

    it('envía respuesta de error con objeto Error', () => {
      const error = new Error('Error de prueba');

      sendError(mockRes, error);

      expect(mockRes.send).toHaveBeenCalledWith({
        success: false,
        error: 'Error de prueba',
      });
    });

    it('usa código de estado personalizado', () => {
      sendError(mockRes, 'Not found', 404);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });
  });

  describe('handleMongooseError', () => {
    it('maneja ValidationError correctamente', () => {
      const error = { name: 'ValidationError', message: 'Validation failed' };

      handleMongooseError(mockRes, error);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.send).toHaveBeenCalledWith({
        success: false,
        error: 'Datos de validación incorrectos',
      });
    });

    it('maneja CastError correctamente', () => {
      const error = { name: 'CastError', message: 'Invalid ID' };

      handleMongooseError(mockRes, error);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.send).toHaveBeenCalledWith({
        success: false,
        error: 'ID inválido',
      });
    });

    it('maneja error de duplicado (code 11000)', () => {
      const error = { code: 11000, message: 'Duplicate key' };

      handleMongooseError(mockRes, error);

      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.send).toHaveBeenCalledWith({
        success: false,
        error: 'El recurso ya existe',
      });
    });

    it('maneja otros errores genéricamente', () => {
      const error = { message: 'Unknown error' };

      handleMongooseError(mockRes, error);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  describe('sendPaginated', () => {
    it('envía respuesta paginada correcta', () => {
      const data = [{ id: 1 }, { id: 2 }];

      sendPaginated(mockRes, data, 1, 10, 25);

      expect(mockRes.send).toHaveBeenCalledWith({
        success: true,
        data: {
          items: data,
          pagination: {
            page: 1,
            limit: 10,
            total: 25,
            totalPages: 3,
            hasNextPage: true,
            hasPrevPage: false,
          },
        },
      });
    });

    it('calcula hasNextPage como false en última página', () => {
      const data: any[] = [];

      sendPaginated(mockRes, data, 3, 10, 25);

      const callArg = mockRes.send.mock.calls[0][0];
      expect(callArg.data.pagination.hasNextPage).toBe(false);
    });

    it('calcula hasPrevPage como true en página > 1', () => {
      const data: any[] = [];

      sendPaginated(mockRes, data, 2, 10, 25);

      const callArg = mockRes.send.mock.calls[0][0];
      expect(callArg.data.pagination.hasPrevPage).toBe(true);
    });
  });

  describe('validateRequiredFields', () => {
    it('retorna true si todos los campos están presentes', () => {
      const body = { name: 'test', email: 'test@test.com' };

      const result = validateRequiredFields(body, ['name', 'email'], mockRes);

      expect(result).toBe(true);
      expect(mockRes.send).not.toHaveBeenCalled();
    });

    it('retorna false y envía error si faltan campos', () => {
      const body = { name: 'test' };

      const result = validateRequiredFields(body, ['name', 'email'], mockRes);

      expect(result).toBe(false);
      expect(mockRes.send).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('lista los campos faltantes en el error', () => {
      const body = { name: 'test' };

      validateRequiredFields(body, ['name', 'email', 'age'], mockRes);

      const callArg = mockRes.send.mock.calls[0][0];
      expect(callArg.error).toContain('email');
      expect(callArg.error).toContain('age');
    });
  });

  describe('ensureResourceExists', () => {
    it('retorna true si el recurso existe', () => {
      const resource = { id: 1, name: 'test' };

      const result = ensureResourceExists(mockRes, resource);

      expect(result).toBe(true);
      expect(mockRes.send).not.toHaveBeenCalled();
    });

    it('retorna false y envía error 404 si recurso es null', () => {
      const result = ensureResourceExists(mockRes, null, 'Usuario');

      expect(result).toBe(false);
      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it('usa nombre personalizado en el mensaje de error', () => {
      ensureResourceExists(mockRes, null, 'Producto');

      const callArg = mockRes.send.mock.calls[0][0];
      expect(callArg.error).toContain('Producto');
    });

    it('usa nombre por defecto si no se especifica', () => {
      ensureResourceExists(mockRes, null);

      const callArg = mockRes.send.mock.calls[0][0];
      expect(callArg.error).toContain('Recurso');
    });
  });
});
