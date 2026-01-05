import { describe, it, expect, beforeEach, vi } from 'vitest';

/**
 * @vitest environment jsdom
 */

// Mock de socket.io-client
const mockSocketOn = vi.fn();
const mockSocketEmit = vi.fn();
const mockSocketDisconnect = vi.fn();

const mockSocket = {
  id: 'socket-123',
  on: mockSocketOn,
  emit: mockSocketEmit,
  disconnect: mockSocketDisconnect,
  connect: vi.fn(),
  connected: true,
};

const mockIO = vi.fn(() => mockSocket);

vi.mock('socket.io-client', () => ({
  io: mockIO,
}));

vi.mock('@/store/store', () => ({
  store: {
    dispatch: vi.fn(),
  },
}));

vi.mock('@/components/ToastManager', () => ({
  toast: {
    push: vi.fn(),
  },
}));

describe('socket.ts', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('initSocket', () => {
    it('retorna null si no hay token', async () => {
      const { initSocket } = await import('../../src/client/socket');
      expect(initSocket()).toBeNull();
    });

    it('inicializa socket con token válido', async () => {
      localStorage.setItem('token', 'test-token');
      const { initSocket } = await import('../../src/client/socket');

      const result = initSocket();
      expect(result).toBeDefined();
      expect(result?.id).toBeDefined();
    });
  });

  describe('getSocket', () => {
    it('retorna la instancia del socket después de inicializar', async () => {
      localStorage.setItem('token', 'test-token');
      const { initSocket, getSocket } = await import('../../src/client/socket');

      initSocket();
      const result = getSocket();
      expect(result).toBeDefined();
      expect(result?.id).toBe('socket-123');
    });
  });
});
