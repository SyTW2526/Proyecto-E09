import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Stub localStorage token
const localStorageMock = {
  store: new Map<string, string>(),
  getItem(key: string) {
    return this.store.get(key) || null;
  },
  setItem(key: string, value: string) {
    this.store.set(key, value);
  },
  removeItem(key: string) {
    this.store.delete(key);
  },
};
// Guarded localStorage setup for Node test env
if (!('localStorage' in global)) {
  Object.defineProperty(global, 'localStorage', {
    value: localStorageMock as any,
    configurable: true,
    writable: false,
  });
}
(global as any).localStorage.setItem('token', 't');

// Mock store and notifications
vi.mock('@/store/store', () => ({
  store: { dispatch: vi.fn() },
}));
vi.mock('../../src/client/features/notifications/notificationsSlice', () => ({
  addNotification: (n: any) => ({ type: 'notifications/add', payload: n }),
}));
vi.mock('../../src/client/components/ToastManager', () => ({
  toast: { push: vi.fn() },
}));

// Mock socket.io-client
const handlers: Record<string, Function[]> = {};
const fakeSocket = {
  id: 'socket-1',
  on: (event: string, cb: Function) => {
    if (!handlers[event]) handlers[event] = [];
    handlers[event].push(cb);
  },
  emit: (event: string, payload: any) => {
    (handlers[event] || []).forEach((cb) => cb(payload));
  },
  connect: vi.fn(),
  disconnect: vi.fn(),
};

vi.mock('socket.io-client', () => ({ io: vi.fn(() => fakeSocket) }));

import {
  initSocket,
  getSocket,
  disconnectSocket,
} from '../../src/client/socket';
import { store as mockedStore } from '@/store/store';

describe('socket - real init with mocks', () => {
  beforeEach(() => {
    // reset handlers
    for (const k of Object.keys(handlers)) delete handlers[k];
    mockedStore.dispatch.mockClear();
  });

  it('initializes socket when token present, registers handlers, and connects', () => {
    const s = initSocket();
    expect(s).toBeTruthy();
    expect(fakeSocket.connect).toHaveBeenCalled();
    expect(getSocket()).toBe(s);

    // simulate server notification
    const notif = { title: 'Hi', message: 'Test' };
    fakeSocket.emit('notification', notif);
    expect(mockedStore.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'notifications/add' })
    );
  });

  it('disconnectSocket closes and clears instance', () => {
    const s = initSocket();
    expect(s).toBeTruthy();
    disconnectSocket();
    expect(fakeSocket.disconnect).toHaveBeenCalled();
    expect(getSocket()).toBeNull();
  });
});
