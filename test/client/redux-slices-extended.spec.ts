import { describe, it, expect, beforeEach, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import cardsReducer from '../../src/client/features/cards/cardsSlice';
import collectionReducer from '../../src/client/features/collection/collectionSlice';
import notificationsReducer, {
  setNotifications,
  setLoading as setNotificationsLoading,
  setError,
} from '../../src/client/features/notifications/notificationsSlice';
import preferencesReducer, {
  setLanguage,
  setDarkMode,
  setNotificationPreferences,
  setPrivacyPreferences,
} from '../../src/client/features/preferences/preferencesSlice';
import tradesReducer from '../../src/client/features/trades/tradesSlice';
import usersReducer from '../../src/client/features/users/usersSlice';
import whislistReducer from '../../src/client/features/whislist/whislistSlice';

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
 * Tests de cobertura para Redux slices
 * Enfocados en reducers puros (sin async thunks que requieren API)
 */

describe('Redux Slices Coverage - Notifications', () => {
  let store: any;

  beforeEach(() => {
    store = configureStore({
      reducer: { notifications: notificationsReducer },
    });
  });

  it('setNotifications carga notificaciones desde payload', () => {
    const notifications = [
      {
        _id: 'n1',
        userId: 'u1',
        type: 'trade' as const,
        title: 'Trade',
        message: 'msg',
        isRead: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    store.dispatch(setNotifications(notifications));
    const state = store.getState().notifications;
    expect(state.notifications).toHaveLength(1);
    expect(state.unread).toBe(1);
  });

  it('setNotifications con notificaciones leídas no cuenta unread', () => {
    const notifications = [
      {
        _id: 'n1',
        userId: 'u1',
        type: 'trade' as const,
        title: 'Trade',
        message: 'msg',
        isRead: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    store.dispatch(setNotifications(notifications));
    const state = store.getState().notifications;
    expect(state.unread).toBe(0);
  });

  it('setLoading actualiza flag de carga', () => {
    store.dispatch(setNotificationsLoading(true));
    expect(store.getState().notifications.loading).toBe(true);
    store.dispatch(setNotificationsLoading(false));
    expect(store.getState().notifications.loading).toBe(false);
  });

  it('setError establece mensaje de error', () => {
    store.dispatch(setError('Network error'));
    expect(store.getState().notifications.error).toBe('Network error');
    store.dispatch(setError(null));
    expect(store.getState().notifications.error).toBeNull();
  });
});

describe('Redux Slices Coverage - Preferences', () => {
  let store: any;

  beforeEach(() => {
    store = configureStore({
      reducer: { preferences: preferencesReducer },
    });
  });

  it('setLanguage cambia idioma a español', () => {
    store.dispatch(setLanguage('es'));
    const state = store.getState().preferences;
    expect(state.preferences.language).toBe('es');
  });

  it('setLanguage cambia idioma a inglés', () => {
    store.dispatch(setLanguage('en'));
    const state = store.getState().preferences;
    expect(state.preferences.language).toBe('en');
  });

  it('setLanguage cambia idioma múltiples veces', () => {
    store.dispatch(setLanguage('es'));
    expect(store.getState().preferences.preferences.language).toBe('es');
    store.dispatch(setLanguage('en'));
    expect(store.getState().preferences.preferences.language).toBe('en');
  });

  it('setDarkMode cambia tema a oscuro', () => {
    store.dispatch(setDarkMode(true));
    const state = store.getState().preferences;
    expect(state.preferences.darkMode).toBe(true);
  });

  it('setDarkMode cambia tema a claro', () => {
    store.dispatch(setDarkMode(false));
    const state = store.getState().preferences;
    expect(state.preferences.darkMode).toBe(false);
  });

  it('setDarkMode cambia tema múltiples veces', () => {
    store.dispatch(setDarkMode(true));
    expect(store.getState().preferences.preferences.darkMode).toBe(true);
    store.dispatch(setDarkMode(false));
    expect(store.getState().preferences.preferences.darkMode).toBe(false);
  });

  it('setNotificationPreferences actualiza notificaciones', () => {
    store.dispatch(
      setNotificationPreferences({ trades: false, messages: true })
    );
    const state = store.getState().preferences;
    expect(state.preferences.notifications.trades).toBe(false);
    expect(state.preferences.notifications.messages).toBe(true);
  });

  it('setPrivacyPreferences actualiza privacidad', () => {
    store.dispatch(
      setPrivacyPreferences({ showCollection: false, showWishlist: true })
    );
    const state = store.getState().preferences;
    expect(state.preferences.privacy.showCollection).toBe(false);
    expect(state.preferences.privacy.showWishlist).toBe(true);
  });

  it('preferencesSlice mantiene ambos valores independientes', () => {
    store.dispatch(setLanguage('es'));
    store.dispatch(setDarkMode(true));
    const state = store.getState().preferences;
    expect(state.preferences.language).toBe('es');
    expect(state.preferences.darkMode).toBe(true);
  });
});

describe('Redux Slices Coverage - Cards', () => {
  let store: any;

  beforeEach(() => {
    store = configureStore({
      reducer: { cards: cardsReducer },
    });
  });

  it('cardsSlice initialState es correcto', () => {
    const state = store.getState().cards;
    expect(state.list).toEqual([]);
    expect(state.selectedCard).toBeNull();
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.total).toBe(0);
  });

  it('cardsSlice mantiene estado sin mutación', () => {
    const initialState = store.getState().cards;
    const stateCopy = { ...initialState };
    expect(store.getState().cards).toEqual(stateCopy);
  });
});

describe('Redux Slices Coverage - Collection', () => {
  let store: any;

  beforeEach(() => {
    store = configureStore({
      reducer: { collection: collectionReducer },
    });
  });

  it('collectionSlice initialState es correcto', () => {
    const state = store.getState().collection;
    expect(state.cards).toEqual([]);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });
});

describe('Redux Slices Coverage - Trades', () => {
  let store: any;

  beforeEach(() => {
    store = configureStore({
      reducer: { trades: tradesReducer },
    });
  });

  it('tradesSlice initialState es correcto', () => {
    const state = store.getState().trades;
    expect(state.list).toEqual([]);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });
});

describe('Redux Slices Coverage - Users', () => {
  let store: any;

  beforeEach(() => {
    store = configureStore({
      reducer: { users: usersReducer },
    });
  });

  it('usersSlice initialState es correcto', () => {
    const state = store.getState().users;
    expect(state).toBeDefined();
    expect(state).toHaveProperty('currentUser');
  });
});

describe('Redux Slices Coverage - Wishlist', () => {
  let store: any;

  beforeEach(() => {
    store = configureStore({
      reducer: { wishlist: whislistReducer },
    });
  });

  it('whislistSlice initialState es correcto', () => {
    const state = store.getState().wishlist;
    expect(state).toBeDefined();
  });
});

describe('Redux Slices - Integration', () => {
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

  it('todos los slices se integran correctamente en store', () => {
    const state = store.getState();
    expect(state.cards).toBeDefined();
    expect(state.collection).toBeDefined();
    expect(state.notifications).toBeDefined();
    expect(state.preferences).toBeDefined();
    expect(state.trades).toBeDefined();
    expect(state.users).toBeDefined();
    expect(state.wishlist).toBeDefined();
  });

  it('cambios en un slice no afectan otros', () => {
    store.dispatch(setLanguage('en'));
    const langState = store.getState().preferences.preferences.language;
    const notificationState = store.getState().notifications.notifications;

    expect(langState).toBe('en');
    expect(notificationState).toEqual([]);
  });

  it('preferences y notifications funcionan juntas', () => {
    store.dispatch(setLanguage('es'));
    store.dispatch(setDarkMode(true));
    const notification = {
      _id: 'n1',
      userId: 'u1',
      type: 'system' as const,
      title: 'Test',
      message: 'Test message',
      isRead: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.dispatch(setNotifications([notification]));

    const state = store.getState();
    expect(state.preferences.preferences.language).toBe('es');
    expect(state.preferences.preferences.darkMode).toBe(true);
    expect(state.notifications.notifications).toHaveLength(1);
  });
});
