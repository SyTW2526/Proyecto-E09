import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { authService } from '../../src/client/services/authService';

/**
 * @vitest environment jsdom
 */

// Mock de localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
});

describe('authService', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('register', () => {
    it('registra un usuario exitosamente', async () => {
      const mockUser = {
        id: '123',
        username: 'testuser',
        email: 'test@example.com',
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          message: 'Usuario registrado',
          user: mockUser,
          token: 'jwt-token-123',
        }),
      });

      const result = await authService.register({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      });

      expect(result.user).toEqual(mockUser);
      expect(result.token).toBe('jwt-token-123');
    });

    it('lanza error en registro fallido', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          error: 'Usuario ya existe',
        }),
      });

      await expect(
        authService.register({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
          confirmPassword: 'password123',
        })
      ).rejects.toThrow('Usuario ya existe');
    });

    it('maneja errores de respuesta sin error message', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      });

      await expect(
        authService.register({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
          confirmPassword: 'password123',
        })
      ).rejects.toThrow('Error al registrarse');
    });
  });

  describe('login', () => {
    it('inicia sesión exitosamente', async () => {
      const mockUser = {
        id: '123',
        username: 'testuser',
        email: 'test@example.com',
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          message: 'Sesión iniciada',
          user: mockUser,
          token: 'jwt-token-123',
        }),
      });

      const result = await authService.login({
        username: 'testuser',
        password: 'password123',
      });

      expect(result.user).toEqual(mockUser);
      expect(result.token).toBe('jwt-token-123');
    });

    it('lanza error en login fallido', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          error: 'Credenciales inválidas',
        }),
      });

      await expect(
        authService.login({
          username: 'testuser',
          password: 'wrongpassword',
        })
      ).rejects.toThrow('Credenciales inválidas');
    });

    it('maneja error por defecto en login', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      });

      await expect(
        authService.login({
          username: 'testuser',
          password: 'wrongpassword',
        })
      ).rejects.toThrow('Error al iniciar sesión');
    });
  });

  describe('updateProfileImage', () => {
    it('actualiza la imagen de perfil', async () => {
      const token = 'jwt-token-123';
      localStorage.setItem('token', token);

      const mockUser = {
        id: '123',
        username: 'testuser',
        email: 'test@example.com',
        profileImage: 'https://example.com/image.jpg',
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          message: 'Imagen actualizada',
          data: {
            user: mockUser,
          },
        }),
      });

      const result = await authService.updateProfileImage(
        'testuser',
        'https://example.com/image.jpg'
      );

      expect(result).toEqual(mockUser);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/users/testuser/profile-image',
        expect.objectContaining({
          method: 'PATCH',
          headers: expect.objectContaining({
            Authorization: `Bearer ${token}`,
          }),
        })
      );
    });

    it('guarda el usuario actualizado en localStorage', async () => {
      localStorage.setItem('token', 'jwt-token-123');

      const mockUser = {
        id: '123',
        username: 'testuser',
        email: 'test@example.com',
        profileImage: 'https://example.com/image.jpg',
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          message: 'Imagen actualizada',
          data: {
            user: mockUser,
          },
        }),
      });

      await authService.updateProfileImage(
        'testuser',
        'https://example.com/image.jpg'
      );

      const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
      expect(savedUser.username).toBe('testuser');
    });

    it('lanza error si la actualización falla', async () => {
      localStorage.setItem('token', 'jwt-token-123');

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          error: 'No autorizado',
        }),
      });

      await expect(
        authService.updateProfileImage(
          'testuser',
          'https://example.com/image.jpg'
        )
      ).rejects.toThrow('No autorizado');
    });
  });

  describe('updateProfile', () => {
    it('actualiza el perfil del usuario', async () => {
      localStorage.setItem('token', 'jwt-token-123');

      const mockUser = {
        id: '123',
        username: 'newusername',
        email: 'newemail@example.com',
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          message: 'Perfil actualizado',
          data: {
            user: mockUser,
            token: 'new-jwt-token-456',
          },
        }),
      });

      const result = await authService.updateProfile('oldusername', {
        username: 'newusername',
        email: 'newemail@example.com',
      });

      expect(result.username).toBe('newusername');
      expect(result.email).toBe('newemail@example.com');
    });

    it('actualiza el token si se devuelve uno nuevo', async () => {
      localStorage.setItem('token', 'jwt-token-123');

      const mockUser = {
        id: '123',
        username: 'testuser',
        email: 'test@example.com',
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          message: 'Perfil actualizado',
          data: {
            user: mockUser,
            token: 'new-jwt-token-456',
          },
        }),
      });

      await authService.updateProfile('testuser', { username: 'testuser' });

      expect(localStorage.getItem('token')).toBe('new-jwt-token-456');
    });

    it('lanza error en actualización fallida', async () => {
      localStorage.setItem('token', 'jwt-token-123');

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          error: 'Correo ya en uso',
        }),
      });

      await expect(
        authService.updateProfile('testuser', {
          email: 'taken@example.com',
        })
      ).rejects.toThrow('Correo ya en uso');
    });
  });

  describe('deleteProfileImage', () => {
    it('elimina la imagen de perfil', async () => {
      localStorage.setItem('token', 'jwt-token-123');

      const mockUser = {
        id: '123',
        username: 'testuser',
        email: 'test@example.com',
        profileImage: undefined,
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          message: 'Imagen eliminada',
          data: {
            user: mockUser,
          },
        }),
      });

      const result = await authService.deleteProfileImage('testuser');

      expect(result.profileImage).toBeUndefined();
    });

    it('lanza error si la eliminación falla', async () => {
      localStorage.setItem('token', 'jwt-token-123');

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          error: 'No hay imagen que eliminar',
        }),
      });

      await expect(authService.deleteProfileImage('testuser')).rejects.toThrow(
        'No hay imagen que eliminar'
      );
    });
  });

  describe('deleteAccount', () => {
    it('elimina la cuenta del usuario', async () => {
      localStorage.setItem('token', 'jwt-token-123');
      localStorage.setItem(
        'user',
        JSON.stringify({
          id: '123',
          username: 'testuser',
        })
      );

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          message: 'Cuenta eliminada',
        }),
      });

      await authService.deleteAccount('testuser');

      expect(localStorage.getItem('user')).toBeNull();
      expect(localStorage.getItem('token')).toBeNull();
    });

    it('lanza error si la eliminación de cuenta falla', async () => {
      localStorage.setItem('token', 'jwt-token-123');

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          error: 'No se puede eliminar cuenta',
        }),
      });

      await expect(authService.deleteAccount('testuser')).rejects.toThrow(
        'No se puede eliminar cuenta'
      );
    });
  });

  describe('saveUser y getUser', () => {
    it('guarda y recupera el usuario de localStorage', () => {
      const user = {
        id: '123',
        username: 'testuser',
        email: 'test@example.com',
        profileImage: 'https://example.com/image.jpg',
      };

      authService.saveUser(user);

      const retrieved = authService.getUser();
      expect(retrieved).toEqual(user);
    });

    it('retorna null si no hay usuario guardado', () => {
      const retrieved = authService.getUser();
      expect(retrieved).toBeNull();
    });

    it('actualiza la bandera isAuthenticated', () => {
      const user = {
        id: '123',
        username: 'testuser',
        email: 'test@example.com',
      };

      authService.saveUser(user);

      expect(localStorage.getItem('isAuthenticated')).toBe('true');
    });
  });

  describe('saveToken y getToken', () => {
    it('guarda y recupera el token de localStorage', () => {
      const token = 'jwt-token-123';

      authService.saveToken(token);

      expect(authService.getToken()).toBe(token);
    });

    it('retorna null si no hay token guardado', () => {
      const token = authService.getToken();
      expect(token).toBeNull();
    });
  });

  describe('getAuthHeaders', () => {
    it('retorna headers con Authorization si hay token', () => {
      const token = 'jwt-token-123';
      authService.saveToken(token);

      const headers = authService.getAuthHeaders();

      expect(headers).toEqual({
        Authorization: `Bearer ${token}`,
      });
    });

    it('retorna objeto vacío si no hay token', () => {
      const headers = authService.getAuthHeaders();

      expect(headers).toEqual({});
    });
  });

  describe('isAuthenticated', () => {
    it('retorna true si el usuario está autenticado', () => {
      const user = {
        id: '123',
        username: 'testuser',
        email: 'test@example.com',
      };

      authService.saveUser(user);
      authService.saveToken('jwt-token-123');

      expect(authService.isAuthenticated()).toBe(true);
    });

    it('retorna false si no hay usuario', () => {
      authService.saveToken('jwt-token-123');

      expect(authService.isAuthenticated()).toBe(false);
    });

    it('retorna false si no hay token', () => {
      const user = {
        id: '123',
        username: 'testuser',
        email: 'test@example.com',
      };

      authService.saveUser(user);

      expect(authService.isAuthenticated()).toBe(false);
    });

    it('retorna false si no hay ni usuario ni token', () => {
      expect(authService.isAuthenticated()).toBe(false);
    });
  });

  describe('logout', () => {
    it('limpia el localStorage al cerrar sesión', () => {
      const user = {
        id: '123',
        username: 'testuser',
        email: 'test@example.com',
      };

      authService.saveUser(user);
      authService.saveToken('jwt-token-123');

      authService.logout();

      expect(localStorage.getItem('user')).toBeNull();
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('isAuthenticated')).toBeNull();
    });
  });
});
