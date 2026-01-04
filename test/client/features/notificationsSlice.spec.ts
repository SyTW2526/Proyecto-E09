import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import notificationsReducer, {
  setNotifications,
  addNotification,
  markAsRead,
  markAllAsRead,
  removeNotification,
  setLoading,
  setError,
  Notification,
} from '../../../src/client/features/notifications/notificationsSlice';

describe('notificationsSlice', () => {
  let initialState: any;

  beforeEach(() => {
    // Limpiar localStorage antes de cada test
    localStorage.clear();
    initialState = {
      notifications: [],
      unread: 0,
      loading: false,
      error: null,
    };
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('debería tener el estado inicial correcto', () => {
    const state = notificationsReducer(undefined, { type: 'unknown' });
    expect(state.notifications).toBeInstanceOf(Array);
    expect(state.unread).toBe(0);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  describe('setNotifications', () => {
    it('debería cargar notificaciones y calcular unread', () => {
      const notifications: Notification[] = [
        {
          _id: '1',
          userId: 'user1',
          type: 'trade',
          title: 'New Trade',
          message: 'Someone wants to trade',
          isRead: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          _id: '2',
          userId: 'user1',
          type: 'message',
          title: 'New Message',
          message: 'You have a new message',
          isRead: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      const state = notificationsReducer(
        initialState,
        setNotifications(notifications)
      );
      expect(state.notifications).toEqual(notifications);
      expect(state.unread).toBe(1);
    });

    it('debería manejar notificaciones vacías', () => {
      const state = notificationsReducer(initialState, setNotifications([]));
      expect(state.notifications).toEqual([]);
      expect(state.unread).toBe(0);
    });

    it('debería contar correctamente múltiples sin leer', () => {
      const notifications: Notification[] = [
        {
          _id: '1',
          userId: 'user1',
          type: 'trade',
          title: 'Trade 1',
          message: 'msg',
          isRead: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          _id: '2',
          userId: 'user1',
          type: 'trade',
          title: 'Trade 2',
          message: 'msg',
          isRead: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          _id: '3',
          userId: 'user1',
          type: 'message',
          title: 'Message',
          message: 'msg',
          isRead: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      const state = notificationsReducer(
        initialState,
        setNotifications(notifications)
      );
      expect(state.unread).toBe(2);
    });
  });

  describe('addNotification', () => {
    it('debería agregar notificación sin leer al inicio', () => {
      const notification: Notification = {
        _id: '1',
        userId: 'user1',
        type: 'trade',
        title: 'New Trade',
        message: 'msg',
        isRead: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      let state = notificationsReducer(
        initialState,
        addNotification(notification)
      );
      expect(state.notifications[0]).toEqual(notification);
      expect(state.unread).toBe(1);
    });

    it('debería agregar notificación leída sin incrementar unread', () => {
      const notification: Notification = {
        _id: '1',
        userId: 'user1',
        type: 'trade',
        title: 'New Trade',
        message: 'msg',
        isRead: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const state = notificationsReducer(
        initialState,
        addNotification(notification)
      );
      expect(state.notifications.length).toBe(1);
      expect(state.unread).toBe(0);
    });

    it('debería agregar múltiples notificaciones', () => {
      const notification1: Notification = {
        _id: '1',
        userId: 'user1',
        type: 'trade',
        title: 'Trade 1',
        message: 'msg',
        isRead: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const notification2: Notification = {
        _id: '2',
        userId: 'user1',
        type: 'message',
        title: 'Message',
        message: 'msg',
        isRead: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      let state = notificationsReducer(
        initialState,
        addNotification(notification1)
      );
      state = notificationsReducer(state, addNotification(notification2));
      expect(state.notifications.length).toBe(2);
      expect(state.unread).toBe(2);
      expect(state.notifications[0]._id).toBe('2');
    });

    it('debería guardar en localStorage después de agregar', () => {
      const notification: Notification = {
        _id: '1',
        userId: 'user1',
        type: 'trade',
        title: 'New Trade',
        message: 'msg',
        isRead: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      notificationsReducer(initialState, addNotification(notification));
      const stored = localStorage.getItem('app_notifications');
      expect(stored).toBeTruthy();
      expect(JSON.parse(stored!)).toHaveLength(1);
    });
  });

  describe('markAsRead', () => {
    it('debería marcar notificación como leída', () => {
      const notification: Notification = {
        _id: '1',
        userId: 'user1',
        type: 'trade',
        title: 'New Trade',
        message: 'msg',
        isRead: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      let state = notificationsReducer(
        initialState,
        addNotification(notification)
      );
      expect(state.unread).toBe(1);

      state = notificationsReducer(state, markAsRead('1'));
      expect(state.notifications[0].isRead).toBe(true);
      expect(state.unread).toBe(0);
    });

    it('debería no cambiar unread si ya está leída', () => {
      const notification: Notification = {
        _id: '1',
        userId: 'user1',
        type: 'trade',
        title: 'New Trade',
        message: 'msg',
        isRead: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      let state = notificationsReducer(
        initialState,
        addNotification(notification)
      );
      expect(state.unread).toBe(0);

      state = notificationsReducer(state, markAsRead('1'));
      expect(state.unread).toBe(0);
    });

    it('debería no cambiar estado si notificación no existe', () => {
      let state = notificationsReducer(initialState, markAsRead('999'));
      expect(state.unread).toBe(0);
    });

    it('debería guardar en localStorage después de marcar como leída', () => {
      const notification: Notification = {
        _id: '1',
        userId: 'user1',
        type: 'trade',
        title: 'New Trade',
        message: 'msg',
        isRead: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      let state = notificationsReducer(
        initialState,
        addNotification(notification)
      );
      state = notificationsReducer(state, markAsRead('1'));
      const stored = JSON.parse(localStorage.getItem('app_notifications')!);
      expect(stored[0].isRead).toBe(true);
    });
  });

  describe('markAllAsRead', () => {
    it('debería marcar todas las notificaciones como leídas', () => {
      const notifications: Notification[] = [
        {
          _id: '1',
          userId: 'user1',
          type: 'trade',
          title: 'Trade 1',
          message: 'msg',
          isRead: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          _id: '2',
          userId: 'user1',
          type: 'message',
          title: 'Message',
          message: 'msg',
          isRead: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      let state = notificationsReducer(
        initialState,
        setNotifications(notifications)
      );
      expect(state.unread).toBe(2);

      state = notificationsReducer(state, markAllAsRead());
      expect(state.notifications.every((n) => n.isRead)).toBe(true);
      expect(state.unread).toBe(0);
    });

    it('debería guardar en localStorage después de marcar todas', () => {
      const notifications: Notification[] = [
        {
          _id: '1',
          userId: 'user1',
          type: 'trade',
          title: 'Trade',
          message: 'msg',
          isRead: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      let state = notificationsReducer(
        initialState,
        setNotifications(notifications)
      );
      state = notificationsReducer(state, markAllAsRead());
      const stored = JSON.parse(localStorage.getItem('app_notifications')!);
      expect(stored[0].isRead).toBe(true);
    });
  });

  describe('removeNotification', () => {
    it('debería remover notificación sin leer', () => {
      const notification: Notification = {
        _id: '1',
        userId: 'user1',
        type: 'trade',
        title: 'New Trade',
        message: 'msg',
        isRead: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      let state = notificationsReducer(
        initialState,
        addNotification(notification)
      );
      expect(state.unread).toBe(1);

      state = notificationsReducer(state, removeNotification('1'));
      expect(state.notifications.length).toBe(0);
      expect(state.unread).toBe(0);
    });

    it('debería remover notificación leída sin cambiar unread', () => {
      const notification: Notification = {
        _id: '1',
        userId: 'user1',
        type: 'trade',
        title: 'New Trade',
        message: 'msg',
        isRead: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      let state = notificationsReducer(
        initialState,
        addNotification(notification)
      );
      state = notificationsReducer(state, removeNotification('1'));
      expect(state.notifications.length).toBe(0);
      expect(state.unread).toBe(0);
    });

    it('debería remover notificación específica de varias', () => {
      const notifications: Notification[] = [
        {
          _id: '1',
          userId: 'user1',
          type: 'trade',
          title: 'Trade 1',
          message: 'msg',
          isRead: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          _id: '2',
          userId: 'user1',
          type: 'trade',
          title: 'Trade 2',
          message: 'msg',
          isRead: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      let state = notificationsReducer(
        initialState,
        setNotifications(notifications)
      );
      state = notificationsReducer(state, removeNotification('1'));
      expect(state.notifications.length).toBe(1);
      expect(state.notifications[0]._id).toBe('2');
      expect(state.unread).toBe(1);
    });

    it('debería guardar en localStorage después de remover', () => {
      const notification: Notification = {
        _id: '1',
        userId: 'user1',
        type: 'trade',
        title: 'Trade',
        message: 'msg',
        isRead: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      let state = notificationsReducer(
        initialState,
        addNotification(notification)
      );
      state = notificationsReducer(state, removeNotification('1'));
      const stored = JSON.parse(localStorage.getItem('app_notifications')!);
      expect(stored.length).toBe(0);
    });
  });

  describe('setLoading', () => {
    it('debería setear loading a true', () => {
      const state = notificationsReducer(initialState, setLoading(true));
      expect(state.loading).toBe(true);
    });

    it('debería setear loading a false', () => {
      const state = notificationsReducer(
        { ...initialState, loading: true },
        setLoading(false)
      );
      expect(state.loading).toBe(false);
    });
  });

  describe('setError', () => {
    it('debería setear error', () => {
      const state = notificationsReducer(
        initialState,
        setError('Error loading notifications')
      );
      expect(state.error).toBe('Error loading notifications');
    });

    it('debería limpiar error cuando se setea null', () => {
      const state = notificationsReducer(
        { ...initialState, error: 'Previous error' },
        setError(null)
      );
      expect(state.error).toBeNull();
    });
  });

  describe('Casos combinados', () => {
    it('debería manejar flujo completo de notificaciones', () => {
      const notifications: Notification[] = [
        {
          _id: '1',
          userId: 'user1',
          type: 'trade',
          title: 'Trade',
          message: 'msg',
          isRead: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      let state = notificationsReducer(
        initialState,
        setNotifications(notifications)
      );
      expect(state.unread).toBe(1);

      const newNotif: Notification = {
        _id: '2',
        userId: 'user1',
        type: 'message',
        title: 'Message',
        message: 'msg',
        isRead: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      state = notificationsReducer(state, addNotification(newNotif));
      expect(state.notifications.length).toBe(2);
      expect(state.unread).toBe(2);

      state = notificationsReducer(state, markAsRead('1'));
      expect(state.unread).toBe(1);

      state = notificationsReducer(state, removeNotification('2'));
      expect(state.notifications.length).toBe(1);
      expect(state.unread).toBe(0);
    });
  });
});
