import { describe, it, expect, beforeEach, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import cardsReducer, {
  fetchFeaturedCards,
  searchCards,
  fetchCardById,
} from '../../src/client/features/cards/cardsSlice';
import collectionReducer, {
  fetchUserCollection,
  addToCollection,
  removeFromCollection,
} from '../../src/client/features/collection/collectionSlice';
import notificationsReducer, {
  setNotifications,
  setLoading as setNotificationsLoading,
  setError,
  addNotification,
  markAsRead,
  markAllAsRead,
  removeNotification,
} from '../../src/client/features/notifications/notificationsSlice';
import preferencesReducer, {
  setLanguage,
  setDarkMode,
  setNotificationPreferences,
  setPrivacyPreferences,
  setLoading as setPreferencesLoading,
  setError as setPreferencesError,
} from '../../src/client/features/preferences/preferencesSlice';
import tradesReducer, {
  fetchUserTrades,
  createTrade,
  updateTradeStatus,
} from '../../src/client/features/trades/tradesSlice';
import usersReducer, {
  fetchUserById,
  fetchUserFriends,
  addFriend,
  removeFriend,
  logoutUser,
} from '../../src/client/features/users/usersSlice';
import whislistReducer, {
  fetchWishlist,
  addToWishlist,
  removeFromWishlist,
} from '../../src/client/features/whislist/whislistSlice';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

// @ts-ignore
global.localStorage = localStorageMock;

/**
 * Comprehensive Redux Slices Coverage Tests
 * Tests for all reducer cases, async thunk states, and edge cases
 */

// ==================== NOTIFICATIONS SLICE ====================
describe('Notifications Slice - Comprehensive', () => {
  let store: any;

  beforeEach(() => {
    localStorageMock.clear();
    store = configureStore({
      reducer: { notifications: notificationsReducer },
    });
  });

  describe('setNotifications reducer', () => {
    it('carga notificaciones vacías', () => {
      store.dispatch(setNotifications([]));
      const state = store.getState().notifications;
      expect(state.notifications).toHaveLength(0);
      expect(state.unread).toBe(0);
    });

    it('carga notificaciones sin leer', () => {
      const notif = {
        _id: 'n1',
        userId: 'u1',
        type: 'trade' as const,
        title: 'Trade',
        message: 'msg',
        isRead: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      store.dispatch(setNotifications([notif]));
      expect(store.getState().notifications.unread).toBe(1);
    });

    it('carga notificaciones leídas', () => {
      const notif = {
        _id: 'n1',
        userId: 'u1',
        type: 'trade' as const,
        title: 'Trade',
        message: 'msg',
        isRead: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      store.dispatch(setNotifications([notif]));
      expect(store.getState().notifications.unread).toBe(0);
    });

    it('carga múltiples notificaciones con conteo correcto', () => {
      const notifs = [
        {
          _id: 'n1',
          userId: 'u1',
          type: 'trade' as const,
          title: 'T1',
          message: 'm1',
          isRead: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          _id: 'n2',
          userId: 'u1',
          type: 'message' as const,
          title: 'T2',
          message: 'm2',
          isRead: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      store.dispatch(setNotifications(notifs));
      expect(store.getState().notifications.unread).toBe(1);
      expect(store.getState().notifications.notifications).toHaveLength(2);
    });
  });

  describe('addNotification reducer', () => {
    it('agrega notificación no leída', () => {
      const notif = {
        _id: 'n1',
        userId: 'u1',
        type: 'trade' as const,
        title: 'Trade',
        message: 'msg',
        isRead: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      store.dispatch(addNotification(notif));
      const state = store.getState().notifications;
      expect(state.notifications[0]).toEqual(notif);
      expect(state.unread).toBe(1);
    });

    it('agrega notificación leída', () => {
      const notif = {
        _id: 'n1',
        userId: 'u1',
        type: 'trade' as const,
        title: 'Trade',
        message: 'msg',
        isRead: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      store.dispatch(addNotification(notif));
      const state = store.getState().notifications;
      expect(state.unread).toBe(0);
    });

    it('agrega múltiples notificaciones en orden', () => {
      const n1 = {
        _id: 'n1',
        userId: 'u1',
        type: 'trade' as const,
        title: 'T1',
        message: 'm1',
        isRead: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const n2 = {
        _id: 'n2',
        userId: 'u1',
        type: 'trade' as const,
        title: 'T2',
        message: 'm2',
        isRead: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      store.dispatch(addNotification(n1));
      store.dispatch(addNotification(n2));
      const state = store.getState().notifications;
      expect(state.notifications[0]._id).toBe('n2'); // n2 debe estar primero (unshift)
      expect(state.notifications[1]._id).toBe('n1');
    });
  });

  describe('markAsRead reducer', () => {
    beforeEach(() => {
      const notif = {
        _id: 'n1',
        userId: 'u1',
        type: 'trade' as const,
        title: 'Trade',
        message: 'msg',
        isRead: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      store.dispatch(setNotifications([notif]));
    });

    it('marca notificación como leída', () => {
      store.dispatch(markAsRead('n1'));
      const state = store.getState().notifications;
      expect(state.notifications[0].isRead).toBe(true);
      expect(state.unread).toBe(0);
    });

    it('no cambia estado si notificación ya está leída', () => {
      store.dispatch(markAsRead('n1'));
      store.dispatch(markAsRead('n1'));
      expect(store.getState().notifications.unread).toBe(0);
    });

    it('ignora ID inexistente', () => {
      const before = store.getState().notifications.unread;
      store.dispatch(markAsRead('nonexistent'));
      expect(store.getState().notifications.unread).toBe(before);
    });
  });

  describe('markAllAsRead reducer', () => {
    it('marca todas las notificaciones como leídas', () => {
      const notifs = [
        {
          _id: 'n1',
          userId: 'u1',
          type: 'trade' as const,
          title: 'T1',
          message: 'm1',
          isRead: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          _id: 'n2',
          userId: 'u1',
          type: 'trade' as const,
          title: 'T2',
          message: 'm2',
          isRead: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      store.dispatch(setNotifications(notifs));
      store.dispatch(markAllAsRead());
      const state = store.getState().notifications;
      expect(state.unread).toBe(0);
      expect(state.notifications.every((n) => n.isRead)).toBe(true);
    });
  });

  describe('removeNotification reducer', () => {
    beforeEach(() => {
      const notifs = [
        {
          _id: 'n1',
          userId: 'u1',
          type: 'trade' as const,
          title: 'T1',
          message: 'm1',
          isRead: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          _id: 'n2',
          userId: 'u1',
          type: 'trade' as const,
          title: 'T2',
          message: 'm2',
          isRead: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      store.dispatch(setNotifications(notifs));
    });

    it('elimina notificación sin leer y decrementa unread', () => {
      store.dispatch(removeNotification('n1'));
      const state = store.getState().notifications;
      expect(state.notifications).toHaveLength(1);
      expect(state.notifications[0]._id).toBe('n2');
      expect(state.unread).toBe(0);
    });

    it('elimina notificación leída sin afectar unread', () => {
      store.dispatch(removeNotification('n2'));
      const state = store.getState().notifications;
      expect(state.unread).toBe(1);
    });

    it('ignora ID inexistente', () => {
      const before = store.getState().notifications.notifications.length;
      store.dispatch(removeNotification('nonexistent'));
      expect(store.getState().notifications.notifications).toHaveLength(before);
    });
  });

  describe('setLoading reducer', () => {
    it('actualiza flag de carga a true', () => {
      store.dispatch(setNotificationsLoading(true));
      expect(store.getState().notifications.loading).toBe(true);
    });

    it('actualiza flag de carga a false', () => {
      store.dispatch(setNotificationsLoading(false));
      expect(store.getState().notifications.loading).toBe(false);
    });
  });

  describe('setError reducer', () => {
    it('establece mensaje de error', () => {
      store.dispatch(setError('Network error'));
      expect(store.getState().notifications.error).toBe('Network error');
    });

    it('limpia error con null', () => {
      store.dispatch(setError('Error'));
      store.dispatch(setError(null));
      expect(store.getState().notifications.error).toBeNull();
    });
  });
});

// ==================== PREFERENCES SLICE ====================
describe('Preferences Slice - Comprehensive', () => {
  let store: any;

  beforeEach(() => {
    localStorageMock.clear();
    store = configureStore({
      reducer: { preferences: preferencesReducer },
    });
  });

  describe('setLanguage reducer', () => {
    it('cambia idioma a español', () => {
      store.dispatch(setLanguage('es'));
      expect(store.getState().preferences.preferences.language).toBe('es');
    });

    it('cambia idioma a inglés', () => {
      store.dispatch(setLanguage('en'));
      expect(store.getState().preferences.preferences.language).toBe('en');
    });

    it('cambia idioma múltiples veces', () => {
      store.dispatch(setLanguage('en'));
      store.dispatch(setLanguage('es'));
      store.dispatch(setLanguage('en'));
      expect(store.getState().preferences.preferences.language).toBe('en');
    });

    it('mantiene otros valores al cambiar idioma', () => {
      store.dispatch(setDarkMode(true));
      store.dispatch(setLanguage('en'));
      const state = store.getState().preferences.preferences;
      expect(state.darkMode).toBe(true);
      expect(state.language).toBe('en');
    });
  });

  describe('setDarkMode reducer', () => {
    it('cambia a modo oscuro', () => {
      store.dispatch(setDarkMode(true));
      expect(store.getState().preferences.preferences.darkMode).toBe(true);
    });

    it('cambia a modo claro', () => {
      store.dispatch(setDarkMode(false));
      expect(store.getState().preferences.preferences.darkMode).toBe(false);
    });

    it('alterna modo múltiples veces', () => {
      store.dispatch(setDarkMode(true));
      store.dispatch(setDarkMode(false));
      store.dispatch(setDarkMode(true));
      expect(store.getState().preferences.preferences.darkMode).toBe(true);
    });
  });

  describe('setNotificationPreferences reducer', () => {
    it('actualiza preferencia de trades', () => {
      store.dispatch(setNotificationPreferences({ trades: false }));
      const notif = store.getState().preferences.preferences.notifications;
      expect(notif.trades).toBe(false);
      expect(notif.messages).toBe(true);
    });

    it('actualiza múltiples preferencias', () => {
      store.dispatch(
        setNotificationPreferences({ trades: false, messages: false })
      );
      const notif = store.getState().preferences.preferences.notifications;
      expect(notif.trades).toBe(false);
      expect(notif.messages).toBe(false);
      expect(notif.friendRequests).toBe(true);
    });
  });

  describe('setPrivacyPreferences reducer', () => {
    it('oculta colección', () => {
      store.dispatch(setPrivacyPreferences({ showCollection: false }));
      const privacy = store.getState().preferences.preferences.privacy;
      expect(privacy.showCollection).toBe(false);
      expect(privacy.showWishlist).toBe(true);
    });

    it('oculta wishlist', () => {
      store.dispatch(setPrivacyPreferences({ showWishlist: false }));
      const privacy = store.getState().preferences.preferences.privacy;
      expect(privacy.showWishlist).toBe(false);
    });

    it('actualiza múltiples privacidades', () => {
      store.dispatch(
        setPrivacyPreferences({ showCollection: false, showWishlist: false })
      );
      const privacy = store.getState().preferences.preferences.privacy;
      expect(privacy.showCollection).toBe(false);
      expect(privacy.showWishlist).toBe(false);
    });
  });

  describe('setLoading reducer', () => {
    it('establece loading en true', () => {
      store.dispatch(setPreferencesLoading(true));
      expect(store.getState().preferences.loading).toBe(true);
    });

    it('establece loading en false', () => {
      store.dispatch(setPreferencesLoading(false));
      expect(store.getState().preferences.loading).toBe(false);
    });
  });

  describe('setError reducer', () => {
    it('establece error', () => {
      store.dispatch(setPreferencesError('Error message'));
      expect(store.getState().preferences.error).toBe('Error message');
    });

    it('limpia error', () => {
      store.dispatch(setPreferencesError('Error'));
      store.dispatch(setPreferencesError(null));
      expect(store.getState().preferences.error).toBeNull();
    });
  });
});

// ==================== CARDS SLICE ====================
describe('Cards Slice - Comprehensive', () => {
  let store: any;

  beforeEach(() => {
    store = configureStore({
      reducer: { cards: cardsReducer },
    });
  });

  it('initialState es correcto', () => {
    const state = store.getState().cards;
    expect(state.list).toEqual([]);
    expect(state.selectedCard).toBeNull();
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.total).toBe(0);
  });

  describe('fetchFeaturedCards pending', () => {
    it('establece loading en true cuando pending', () => {
      const action = fetchFeaturedCards.pending('', undefined, undefined);
      const nextState = cardsReducer(undefined, action);
      expect(nextState.loading).toBe(true);
    });
  });

  describe('fetchFeaturedCards fulfilled', () => {
    it('establece lista y loading en false', () => {
      const payload = [
        {
          id: 'c1',
          name: 'Pikachu',
          rarity: 'Rare',
          image: 'url',
          type: 'Electric',
          series: 'Test',
        },
      ];
      const action = fetchFeaturedCards.fulfilled(
        payload,
        '',
        undefined,
        undefined
      );
      const nextState = cardsReducer(undefined, action);
      expect(nextState.loading).toBe(false);
      expect(nextState.list).toEqual(payload);
    });
  });

  describe('searchCards fulfilled', () => {
    it('establece lista y total desde respuesta paginada', () => {
      const payload = {
        data: [{ id: 'c1', name: 'Pikachu' } as any],
        total: 100,
      };
      const action = searchCards.fulfilled(
        payload,
        '',
        { query: 'pikachu', page: 1 },
        undefined
      );
      const nextState = cardsReducer(undefined, action);
      expect(nextState.loading).toBe(false);
      expect(nextState.list).toEqual(payload.data);
      expect(nextState.total).toBe(100);
    });
  });

  describe('fetchCardById fulfilled', () => {
    it('establece selectedCard', () => {
      const payload = {
        id: 'c1',
        name: 'Pikachu',
        rarity: 'Rare',
        image: 'url',
        type: 'Electric',
        series: 'Test',
      };
      const action = fetchCardById.fulfilled(payload, '', 'c1', undefined);
      const nextState = cardsReducer(undefined, action);
      expect(nextState.selectedCard).toEqual(payload);
    });
  });
});

// ==================== COLLECTION SLICE ====================
describe('Collection Slice - Comprehensive', () => {
  let store: any;

  beforeEach(() => {
    store = configureStore({
      reducer: { collection: collectionReducer },
    });
  });

  it('initialState es correcto', () => {
    const state = store.getState().collection;
    expect(state.cards).toEqual([]);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  describe('fetchUserCollection', () => {
    it('establece loading en true cuando pending', () => {
      const action = fetchUserCollection.pending('', 'user1', undefined);
      const nextState = collectionReducer(undefined, action);
      expect(nextState.loading).toBe(true);
    });

    it('establece cards y loading en false cuando fulfilled', () => {
      const payload = [
        { id: 'c1', quantity: 1 } as any,
        { id: 'c2', quantity: 2 } as any,
      ];
      const action = fetchUserCollection.fulfilled(
        payload,
        '',
        'user1',
        undefined
      );
      const nextState = collectionReducer(undefined, action);
      expect(nextState.loading).toBe(false);
      expect(nextState.cards).toEqual(payload);
    });

    it('establece error cuando rejected', () => {
      const action = fetchUserCollection.rejected(
        new Error('Network error'),
        '',
        'user1',
        undefined
      );
      const nextState = collectionReducer(undefined, action);
      expect(nextState.loading).toBe(false);
      expect(nextState.error).toBe('Network error');
    });
  });

  describe('removeFromCollection fulfilled', () => {
    it('remueve carta de la colección', () => {
      const initialCards = [{ id: 'c1' } as any, { id: 'c2' } as any];
      let state = collectionReducer(
        { cards: initialCards, loading: false, error: null },
        {
          type: 'unknown',
        }
      );
      const action = removeFromCollection.fulfilled(
        'c1',
        '',
        { userId: 'u1', cardId: 'c1' },
        undefined
      );
      state = collectionReducer(state, action);
      expect(state.cards).toHaveLength(1);
      expect(state.cards[0].id).toBe('c2');
    });
  });
});

// ==================== TRADES SLICE ====================
describe('Trades Slice - Comprehensive', () => {
  let store: any;

  beforeEach(() => {
    store = configureStore({
      reducer: { trades: tradesReducer },
    });
  });

  it('initialState es correcto', () => {
    const state = store.getState().trades;
    expect(state.list).toEqual([]);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  describe('fetchUserTrades', () => {
    it('establece loading pending', () => {
      const action = fetchUserTrades.pending('', 'user1', undefined);
      const nextState = tradesReducer(undefined, action);
      expect(nextState.loading).toBe(true);
    });

    it('establece trades fulfilled', () => {
      const payload = [{ id: 't1', status: 'pending' } as any];
      const action = fetchUserTrades.fulfilled(payload, '', 'user1', undefined);
      const nextState = tradesReducer(undefined, action);
      expect(nextState.loading).toBe(false);
      expect(nextState.list).toEqual(payload);
    });

    it('establece error rejected', () => {
      const action = fetchUserTrades.rejected(
        new Error('Network'),
        '',
        'user1',
        undefined
      );
      const nextState = tradesReducer(undefined, action);
      expect(nextState.loading).toBe(false);
      expect(nextState.error).toBeDefined();
      expect(nextState.error).not.toBeNull();
    });
  });

  describe('createTrade', () => {
    it('establece loading pending', () => {
      const action = createTrade.pending('', {} as any, undefined);
      const nextState = tradesReducer(undefined, action);
      expect(nextState.loading).toBe(true);
    });

    it('añade trade fulfilled', () => {
      const payload = { id: 't1', status: 'pending' } as any;
      const action = createTrade.fulfilled(payload, '', {} as any, undefined);
      const nextState = tradesReducer(undefined, action);
      expect(nextState.loading).toBe(false);
      expect(nextState.list).toContainEqual(payload);
    });

    it('establece error rejected', () => {
      const action = createTrade.rejected(
        new Error('Network'),
        '',
        {} as any,
        undefined
      );
      const nextState = tradesReducer(undefined, action);
      expect(nextState.error).toBeDefined();
      expect(nextState.error).not.toBeNull();
    });
  });

  describe('updateTradeStatus fulfilled', () => {
    it('actualiza estado del trade', () => {
      const initialState = {
        list: [{ id: 't1', status: 'pending' } as any],
        loading: false,
        error: null,
      };
      const payload = { id: 't1', status: 'completed' };
      const action = updateTradeStatus.fulfilled(
        payload as any,
        '',
        { tradeId: 't1', status: 'completed' },
        undefined
      );
      const nextState = tradesReducer(initialState, action);
      expect(nextState.list[0].status).toBe('completed');
    });
  });
});

// ==================== USERS SLICE ====================
describe('Users Slice - Comprehensive', () => {
  let store: any;

  beforeEach(() => {
    store = configureStore({
      reducer: { users: usersReducer },
    });
  });

  describe('logoutUser', () => {
    it('limpia usuario y amigos', () => {
      const initialState = {
        currentUser: { id: 'u1', name: 'User' } as any,
        friends: [{ id: 'f1', name: 'Friend' } as any],
        loading: false,
        error: null,
      };
      const nextState = usersReducer(initialState, logoutUser());
      expect(nextState.currentUser).toBeNull();
      expect(nextState.friends).toEqual([]);
    });
  });

  describe('fetchUserById', () => {
    it('establece loading pending', () => {
      const action = fetchUserById.pending('', 'u1', undefined);
      const nextState = usersReducer(undefined, action);
      expect(nextState.loading).toBe(true);
    });

    it('establece usuario fulfilled', () => {
      const payload = { id: 'u1', name: 'User' } as any;
      const action = fetchUserById.fulfilled(payload, '', 'u1', undefined);
      const nextState = usersReducer(undefined, action);
      expect(nextState.loading).toBe(false);
      expect(nextState.currentUser).toEqual(payload);
    });

    it('establece error rejected', () => {
      const action = fetchUserById.rejected(
        new Error('Error al cargar usuario'),
        '',
        'u1',
        undefined
      );
      const nextState = usersReducer(undefined, action);
      expect(nextState.loading).toBe(false);
      expect(nextState.error).toContain('Error');
    });
  });

  describe('fetchUserFriends fulfilled', () => {
    it('establece lista de amigos', () => {
      const payload = [
        { id: 'f1', name: 'Friend1' } as any,
        { id: 'f2', name: 'Friend2' } as any,
      ];
      const action = fetchUserFriends.fulfilled(payload, '', 'u1', undefined);
      const nextState = usersReducer(undefined, action);
      expect(nextState.friends).toEqual(payload);
    });
  });

  describe('addFriend fulfilled', () => {
    it('añade amigo a la lista', () => {
      const initialState = {
        currentUser: null,
        friends: [{ id: 'f1' } as any],
        loading: false,
        error: null,
      };
      const payload = { id: 'f2', name: 'Friend2' } as any;
      const action = addFriend.fulfilled(
        payload,
        '',
        { userId: 'u1', friendId: 'f2' },
        undefined
      );
      const nextState = usersReducer(initialState, action);
      expect(nextState.friends).toHaveLength(2);
      expect(nextState.friends[1]).toEqual(payload);
    });
  });

  describe('removeFriend fulfilled', () => {
    it('remueve amigo de la lista', () => {
      const initialState = {
        currentUser: null,
        friends: [{ id: 'f1' } as any, { id: 'f2' } as any],
        loading: false,
        error: null,
      };
      const action = removeFriend.fulfilled(
        'f1',
        '',
        { userId: 'u1', friendId: 'f1' },
        undefined
      );
      const nextState = usersReducer(initialState, action);
      expect(nextState.friends).toHaveLength(1);
      expect(nextState.friends[0].id).toBe('f2');
    });
  });
});

// ==================== WISHLIST SLICE ====================
describe('Wishlist Slice - Comprehensive', () => {
  let store: any;

  beforeEach(() => {
    store = configureStore({
      reducer: { wishlist: whislistReducer },
    });
  });

  it('initialState es correcto', () => {
    const state = store.getState().wishlist;
    expect(state.cards).toEqual([]);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  describe('fetchWishlist', () => {
    it('establece loading pending', () => {
      const action = fetchWishlist.pending('', 'user1', undefined);
      const nextState = whislistReducer(undefined, action);
      expect(nextState.loading).toBe(true);
    });

    it('establece cards fulfilled', () => {
      const payload = [{ id: 'c1' } as any];
      const action = fetchWishlist.fulfilled(payload, '', 'user1', undefined);
      const nextState = whislistReducer(undefined, action);
      expect(nextState.loading).toBe(false);
      expect(nextState.cards).toEqual(payload);
    });

    it('establece error rejected', () => {
      const action = fetchWishlist.rejected(
        new Error('Network'),
        '',
        'user1',
        undefined
      );
      const nextState = whislistReducer(undefined, action);
      expect(nextState.loading).toBe(false);
      expect(nextState.error).toBeDefined();
      expect(nextState.error).not.toBeNull();
    });
  });

  describe('addToWishlist fulfilled', () => {
    it('añade card si no existe', () => {
      const initialState = {
        cards: [],
        loading: false,
        error: null,
      };
      const action = addToWishlist.fulfilled(
        'c1',
        '',
        { userId: 'u1', cardId: 'c1' },
        undefined
      );
      const nextState = whislistReducer(initialState, action);
      expect(nextState.cards).toHaveLength(1);
    });

    it('no añade duplicados', () => {
      const initialState = {
        cards: [{ id: 'c1' } as any],
        loading: false,
        error: null,
      };
      const action = addToWishlist.fulfilled(
        'c1',
        '',
        { userId: 'u1', cardId: 'c1' },
        undefined
      );
      const nextState = whislistReducer(initialState, action);
      expect(nextState.cards).toHaveLength(1);
    });
  });

  describe('removeFromWishlist fulfilled', () => {
    it('remueve card del wishlist', () => {
      const initialState = {
        cards: [{ id: 'c1' } as any, { id: 'c2' } as any],
        loading: false,
        error: null,
      };
      const action = removeFromWishlist.fulfilled(
        'c1',
        '',
        { userId: 'u1', cardId: 'c1' },
        undefined
      );
      const nextState = whislistReducer(initialState, action);
      expect(nextState.cards).toHaveLength(1);
      expect(nextState.cards[0].id).toBe('c2');
    });
  });
});

// ==================== INTEGRATION TESTS ====================
describe('Redux Slices Integration', () => {
  let store: any;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        cards: cardsReducer,
        collection: collectionReducer,
        notifications: notificationsReducer,
        preferences: preferencesReducer,
        trades: tradesReducer,
        users: usersReducer,
        wishlist: whislistReducer,
      },
    });
  });

  it('todos los slices están integrados', () => {
    const state = store.getState();
    expect(state).toHaveProperty('cards');
    expect(state).toHaveProperty('collection');
    expect(state).toHaveProperty('notifications');
    expect(state).toHaveProperty('preferences');
    expect(state).toHaveProperty('trades');
    expect(state).toHaveProperty('users');
    expect(state).toHaveProperty('wishlist');
  });

  it('cambios en preferences no afectan otras slices', () => {
    store.dispatch(setLanguage('en'));
    store.dispatch(setDarkMode(true));
    const state = store.getState();
    expect(state.cards.list).toEqual([]);
    expect(state.notifications.notifications).toEqual([]);
  });

  it('múltiples slices pueden cambiar independientemente', () => {
    store.dispatch(setLanguage('en'));
    store.dispatch(setNotificationsLoading(true));
    store.dispatch(setDarkMode(true));

    const state = store.getState();
    expect(state.preferences.preferences.language).toBe('en');
    expect(state.notifications.loading).toBe(true);
    expect(state.preferences.preferences.darkMode).toBe(true);
  });
});
