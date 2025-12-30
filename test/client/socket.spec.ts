import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

/**
 * @vitest environment jsdom
 */

// Mock de socket.io-client ANTES de importar socket.ts
const mockSocketOn = vi.fn();
const mockSocketOff = vi.fn();
const mockSocketEmit = vi.fn();
const mockSocketDisconnect = vi.fn();

const mockSocket = {
  id: 'socket-123',
  on: mockSocketOn,
  off: mockSocketOff,
  emit: mockSocketEmit,
  disconnect: mockSocketDisconnect,
  connected: true,
};

vi.mock('socket.io-client', () => ({
  io: vi.fn(() => mockSocket),
}));

// Mock de store
vi.mock('@/store/store', () => ({
  store: {
    dispatch: vi.fn(),
  },
}));

// Mock de ToastManager
vi.mock('@/components/ToastManager', () => ({
  toast: {
    push: vi.fn(),
  },
}));

describe('socket.ts', () => {
  beforeEach(() => {
    // Limpiar localStorage antes de cada test
    localStorage.clear();
    
    // Resetear todos los mocks
    vi.clearAllMocks();
    mockSocketOn.mockClear();
    mockSocketOff.mockClear();
    mockSocketEmit.mockClear();
    mockSocketDisconnect.mockClear();

    // Importar socket funciones después de limpiar mocks
    // Esto evita issues con módulos cacheados
    delete require.cache[require.resolve('../../src/client/socket')];
  });

  afterEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('initSocket', () => {
    it('retorna null si no hay token en localStorage', () => {
      const { initSocket } = require('../../src/client/socket');
      
      const result = initSocket();

      expect(result).toBeNull();
    });

    it('inicializa socket con token válido', () => {
      localStorage.setItem('token', 'jwt-token-123');
      const { initSocket } = require('../../src/client/socket');

      const result = initSocket();

      expect(result).toBeDefined();
      expect(result).not.toBeNull();
    });

    it('registra evento de conexión', () => {
      localStorage.setItem('token', 'jwt-token-123');
      const { initSocket } = require('../../src/client/socket');

      initSocket();

      expect(mockSocketOn).toHaveBeenCalledWith('connect', expect.any(Function));
    });

    it('registra evento de notificación', () => {
      localStorage.setItem('token', 'jwt-token-123');
      const { initSocket } = require('../../src/client/socket');

      initSocket();

      expect(mockSocketOn).toHaveBeenCalledWith('notification', expect.any(Function));
    });

    it('registra evento de desconexión', () => {
      localStorage.setItem('token', 'jwt-token-123');
      const { initSocket } = require('../../src/client/socket');

      initSocket();

      expect(mockSocketOn).toHaveBeenCalledWith('disconnect', expect.any(Function));
    });
  });

  describe('getSocket', () => {
    it('retorna la instancia del socket después de inicializar', () => {
      localStorage.setItem('token', 'jwt-token-123');
      const { initSocket, getSocket } = require('../../src/client/socket');

      initSocket();
      const result = getSocket();

      expect(result).toBeDefined();
      expect(result).not.toBeNull();
    });

    it('retorna la misma instancia que initSocket', () => {
      localStorage.setItem('token', 'jwt-token-123');
      const { initSocket, getSocket } = require('../../src/client/socket');

      const initialized = initSocket();
      const retrieved = getSocket();

      expect(initialized).toBe(retrieved);
    });
  });

  describe('disconnectSocket', () => {
    it('desconecta el socket', () => {
      localStorage.setItem('token', 'jwt-token-123');
      const { initSocket, disconnectSocket } = require('../../src/client/socket');

      initSocket();
      disconnectSocket();

      expect(mockSocketDisconnect).toHaveBeenCalled();
    });

    it('no lanza error si socket no está inicializado', () => {
      const { disconnectSocket } = require('../../src/client/socket');

      expect(() => disconnectSocket()).not.toThrow();
    });

    it('llama a socket.disconnect correctamente', () => {
      localStorage.setItem('token', 'jwt-token-123');
      const { initSocket, disconnectSocket } = require('../../src/client/socket');

      initSocket();
      disconnectSocket();

      expect(mockSocketDisconnect).toHaveBeenCalledTimes(1);
    });
  });

  describe('Socket connection lifecycle', () => {
    it('inicializa, obtiene y desconecta correctamente', () => {
      localStorage.setItem('token', 'jwt-token-123');
      const { initSocket, getSocket, disconnectSocket } = require('../../src/client/socket');

      const initialized = initSocket();
      expect(initialized).not.toBeNull();

      const retrieved = getSocket();
      expect(retrieved).toBe(initialized);

      expect(() => disconnectSocket()).not.toThrow();
      expect(mockSocketDisconnect).toHaveBeenCalled();
    });

    it('puede reinicializar después de desconectar', () => {
      localStorage.setItem('token', 'jwt-token-123');
      const { initSocket, disconnectSocket } = require('../../src/client/socket');

      // Primera inicialización
      const first = initSocket();
      expect(first).not.toBeNull();

      // Desconectar
      disconnectSocket();
      expect(mockSocketDisconnect).toHaveBeenCalledTimes(1);

      // Segunda inicialización
      vi.clearAllMocks();
      const second = initSocket();
      expect(second).not.toBeNull();
    });
  });
});

