import { describe, it, expect, beforeEach, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';

// Mock localStorage before importing the slice (initial load reads it)
const storage: Record<string, string> = {};
const ls = {
  getItem: vi.fn((k: string) => (k in storage ? storage[k] : null)),
  setItem: vi.fn((k: string, v: string) => {
    storage[k] = v;
  }),
};
vi.stubGlobal('localStorage', ls);

describe('notificationsSlice - cobertura principal', () => {
  let reducer: any;
  let actions: any;
  let store: any;

  beforeEach(async () => {
    const mod =
      await import('../../src/client/features/notifications/notificationsSlice');
    reducer = mod.default;
    actions = mod;
    store = configureStore({ reducer: { notifications: reducer } });
    // Reset storage spies between tests
    ls.getItem.mockClear();
    ls.setItem.mockClear();
  });

  const sample = (overrides: Partial<ReturnType<() => any>> = {}) => ({
    _id: 'n1',
    userId: 'u1',
    type: 'system',
    title: 'Hola',
    message: 'Mundo',
    isRead: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  });

  it('setNotifications calcula unread y guarda en estado', () => {
    const list = [
      sample({ _id: 'a', isRead: false }),
      sample({ _id: 'b', isRead: true }),
    ];
    store.dispatch(actions.setNotifications(list));
    const s = store.getState().notifications;
    expect(s.notifications.length).toBe(2);
    expect(s.unread).toBe(1);
  });

  it('addNotification incrementa unread y persiste', () => {
    store.dispatch(
      actions.addNotification(sample({ _id: 'x', isRead: false }))
    );
    const s = store.getState().notifications;
    expect(s.unread).toBe(1);
    expect(ls.setItem).toHaveBeenCalled();
  });

  it('markAsRead reduce unread y persiste', () => {
    const n = sample({ _id: 'm', isRead: false });
    store.dispatch(actions.addNotification(n));
    store.dispatch(actions.markAsRead('m'));
    const s = store.getState().notifications;
    expect(s.unread).toBe(0);
    expect(s.notifications.find((x: any) => x._id === 'm')!.isRead).toBe(true);
    expect(ls.setItem).toHaveBeenCalled();
  });

  it('markAllAsRead pone unread a 0', () => {
    store.dispatch(
      actions.setNotifications([
        sample({ _id: '1', isRead: false }),
        sample({ _id: '2', isRead: false }),
      ])
    );
    store.dispatch(actions.markAllAsRead());
    const s = store.getState().notifications;
    expect(s.unread).toBe(0);
    expect(s.notifications.every((n: any) => n.isRead)).toBe(true);
  });

  it('removeNotification elimina y ajusta unread si aplica', () => {
    store.dispatch(
      actions.setNotifications([
        sample({ _id: '1', isRead: false }),
        sample({ _id: '2', isRead: true }),
      ])
    );
    store.dispatch(actions.removeNotification('1'));
    const s = store.getState().notifications;
    expect(s.unread).toBe(0);
    expect(s.notifications.find((n: any) => n._id === '1')).toBeUndefined();
  });

  it('setLoading y setError establecen flags', () => {
    store.dispatch(actions.setLoading(true));
    store.dispatch(actions.setError('oops'));
    const s = store.getState().notifications;
    expect(s.loading).toBe(true);
    expect(s.error).toBe('oops');
  });
});
