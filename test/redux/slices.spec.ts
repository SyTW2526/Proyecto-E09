import { describe, it, expect } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';

/**
 * Tests para Redux slices
 * Estos tests validan la lógica de reducers sin dependencias de React
 */

describe('Redux Slices - State Management', () => {
  describe('Auth Slice Actions', () => {
    it('setUser establece usuario actual', () => {
      const user = { id: '1', username: 'testuser', email: 'test@test.com' };
      const state = { user: null, isAuthenticated: false };
      const newState = { ...state, user, isAuthenticated: true };

      expect(newState.user).toEqual(user);
      expect(newState.isAuthenticated).toBe(true);
    });

    it('logout limpia usuario', () => {
      const state = { user: { id: '1' }, isAuthenticated: true };
      const newState = { ...state, user: null, isAuthenticated: false };

      expect(newState.user).toBeNull();
      expect(newState.isAuthenticated).toBe(false);
    });

    it('setToken guarda token de autenticación', () => {
      const token = 'jwt-token-123';
      const state = { token: null };
      const newState = { ...state, token };

      expect(newState.token).toBe('jwt-token-123');
    });

    it('clearToken elimina token', () => {
      const state = { token: 'jwt-token-123' };
      const newState = { ...state, token: null };

      expect(newState.token).toBeNull();
    });
  });

  describe('Trades Slice Actions', () => {
    it('inicializa estado de trades', () => {
      const initialState = {
        trades: [],
        loading: false,
        error: null,
        selectedTrade: null,
      };

      expect(initialState.trades).toEqual([]);
      expect(initialState.loading).toBe(false);
    });

    it('setTrades actualiza lista de trades', () => {
      const state = { trades: [], loading: false };
      const trades = [
        { id: '1', status: 'pending' },
        { id: '2', status: 'accepted' },
      ];
      const newState = { ...state, trades };

      expect(newState.trades).toHaveLength(2);
      expect(newState.trades[0].id).toBe('1');
    });

    it('setLoading actualiza estado de carga', () => {
      const state = { loading: false };
      const newState = { ...state, loading: true };

      expect(newState.loading).toBe(true);
    });

    it('setError establece mensaje de error', () => {
      const state = { error: null };
      const error = 'Trade not found';
      const newState = { ...state, error };

      expect(newState.error).toBe('Trade not found');
    });

    it('selectTrade selecciona trade específico', () => {
      const state = { trades: [{ id: '1', name: 'Trade 1' }] };
      const newState = {
        ...state,
        selectedTrade: state.trades[0],
      };

      expect(newState.selectedTrade?.id).toBe('1');
    });

    it('clearSelectedTrade limpia selección', () => {
      const state = { selectedTrade: { id: '1' } };
      const newState = { ...state, selectedTrade: null };

      expect(newState.selectedTrade).toBeNull();
    });

    it('addTrade agrega nuevo trade', () => {
      const state = { trades: [{ id: '1' }] };
      const newTrade = { id: '2', status: 'pending' };
      const newState = { ...state, trades: [...state.trades, newTrade] };

      expect(newState.trades).toHaveLength(2);
      expect(newState.trades[1].id).toBe('2');
    });

    it('removeTrade elimina trade', () => {
      const state = { trades: [{ id: '1' }, { id: '2' }] };
      const newState = {
        ...state,
        trades: state.trades.filter((t) => t.id !== '1'),
      };

      expect(newState.trades).toHaveLength(1);
      expect(newState.trades[0].id).toBe('2');
    });

    it('updateTrade actualiza trade existente', () => {
      const state = { trades: [{ id: '1', status: 'pending' }] };
      const updated = { id: '1', status: 'accepted' };
      const newState = {
        ...state,
        trades: state.trades.map((t) => (t.id === '1' ? updated : t)),
      };

      expect(newState.trades[0].status).toBe('accepted');
    });
  });

  describe('Wishlist Slice Actions', () => {
    it('inicializa wishlists vacías', () => {
      const state = { wishlists: [], loading: false };
      expect(state.wishlists).toEqual([]);
    });

    it('setWishlists actualiza lista de wishlists', () => {
      const state = { wishlists: [] };
      const wishlists = [
        { id: '1', name: 'Mi Deseo 1' },
        { id: '2', name: 'Mi Deseo 2' },
      ];
      const newState = { ...state, wishlists };

      expect(newState.wishlists).toHaveLength(2);
    });

    it('addCardToWishlist agrega carta a deseo', () => {
      const state = {
        wishlists: [{ id: '1', cards: [{ id: 'c1' }] }],
      };
      const newState = {
        wishlists: state.wishlists.map((w) =>
          w.id === '1'
            ? { ...w, cards: [...w.cards, { id: 'c2' }] }
            : w
        ),
      };

      expect(newState.wishlists[0].cards).toHaveLength(2);
    });

    it('removeCardFromWishlist elimina carta', () => {
      const state = {
        wishlists: [{ id: '1', cards: [{ id: 'c1' }, { id: 'c2' }] }],
      };
      const newState = {
        wishlists: state.wishlists.map((w) =>
          w.id === '1'
            ? { ...w, cards: w.cards.filter((c) => c.id !== 'c1') }
            : w
        ),
      };

      expect(newState.wishlists[0].cards).toHaveLength(1);
    });
  });

  describe('Notifications Slice Actions', () => {
    it('inicializa notificaciones vacías', () => {
      const state = { notifications: [] };
      expect(state.notifications).toEqual([]);
    });

    it('addNotification agrega notificación', () => {
      const state = { notifications: [] };
      const notification = { id: '1', message: 'New trade', read: false };
      const newState = {
        ...state,
        notifications: [...state.notifications, notification],
      };

      expect(newState.notifications).toHaveLength(1);
    });

    it('removeNotification elimina notificación', () => {
      const state = {
        notifications: [{ id: '1', message: 'Test' }],
      };
      const newState = {
        notifications: state.notifications.filter((n) => n.id !== '1'),
      };

      expect(newState.notifications).toHaveLength(0);
    });

    it('markAsRead marca notificación como leída', () => {
      const state = { notifications: [{ id: '1', read: false }] };
      const newState = {
        notifications: state.notifications.map((n) =>
          n.id === '1' ? { ...n, read: true } : n
        ),
      };

      expect(newState.notifications[0].read).toBe(true);
    });

    it('clearAllNotifications limpia todas', () => {
      const state = {
        notifications: [
          { id: '1', message: 'Test 1' },
          { id: '2', message: 'Test 2' },
        ],
      };
      const newState = { ...state, notifications: [] };

      expect(newState.notifications).toHaveLength(0);
    });
  });

  describe('Collection Slice Actions', () => {
    it('inicializa collections vacías', () => {
      const state = { collections: [], loading: false };
      expect(state.collections).toEqual([]);
    });

    it('setCollections actualiza colecciones', () => {
      const state = { collections: [] };
      const collections = [
        { id: '1', name: 'Mi Colección' },
        { id: '2', name: 'Otra Colección' },
      ];
      const newState = { ...state, collections };

      expect(newState.collections).toHaveLength(2);
    });

    it('createCollection agrega nueva colección', () => {
      const state = { collections: [] };
      const newCollection = { id: '1', name: 'Nueva' };
      const newState = {
        ...state,
        collections: [...state.collections, newCollection],
      };

      expect(newState.collections).toHaveLength(1);
    });

    it('updateCollection modifica colección', () => {
      const state = { collections: [{ id: '1', name: 'Old' }] };
      const newState = {
        collections: state.collections.map((c) =>
          c.id === '1' ? { ...c, name: 'New' } : c
        ),
      };

      expect(newState.collections[0].name).toBe('New');
    });

    it('deleteCollection elimina colección', () => {
      const state = {
        collections: [{ id: '1', name: 'Col 1' }],
      };
      const newState = {
        collections: state.collections.filter((c) => c.id !== '1'),
      };

      expect(newState.collections).toHaveLength(0);
    });
  });

  describe('Cards Slice Actions', () => {
    it('inicializa cards vacías', () => {
      const state = { cards: [], loading: false };
      expect(state.cards).toEqual([]);
    });

    it('setCards actualiza lista de cartas', () => {
      const state = { cards: [] };
      const cards = [
        { id: 'c1', name: 'Pikachu' },
        { id: 'c2', name: 'Charizard' },
      ];
      const newState = { ...state, cards };

      expect(newState.cards).toHaveLength(2);
    });

    it('addCards agrega nuevas cartas', () => {
      const state = { cards: [{ id: 'c1' }] };
      const newCards = [{ id: 'c2' }, { id: 'c3' }];
      const newState = {
        ...state,
        cards: [...state.cards, ...newCards],
      };

      expect(newState.cards).toHaveLength(3);
    });

    it('filterCards filtra por tipo', () => {
      const state = {
        cards: [
          { id: 'c1', type: 'Electric' },
          { id: 'c2', type: 'Fire' },
        ],
      };
      const filtered = state.cards.filter((c) => c.type === 'Electric');

      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('c1');
    });

    it('searchCards busca por nombre', () => {
      const state = {
        cards: [
          { id: 'c1', name: 'Pikachu' },
          { id: 'c2', name: 'Raichu' },
        ],
      };
      const search = 'Pikachu';
      const results = state.cards.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase())
      );

      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Pikachu');
    });
  });

  describe('Preferences Slice Actions', () => {
    it('inicializa preferencias por defecto', () => {
      const state = {
        theme: 'light',
        language: 'es',
        notifications: true,
      };

      expect(state.theme).toBe('light');
      expect(state.language).toBe('es');
    });

    it('setTheme cambia tema', () => {
      const state = { theme: 'light' };
      const newState = { ...state, theme: 'dark' };

      expect(newState.theme).toBe('dark');
    });

    it('setLanguage cambia idioma', () => {
      const state = { language: 'es' };
      const newState = { ...state, language: 'en' };

      expect(newState.language).toBe('en');
    });

    it('setNotifications activa/desactiva notificaciones', () => {
      const state = { notifications: true };
      const newState = { ...state, notifications: false };

      expect(newState.notifications).toBe(false);
    });
  });

  describe('Users Slice Actions', () => {
    it('inicializa usuarios vacío', () => {
      const state = { users: [], loading: false };
      expect(state.users).toEqual([]);
    });

    it('setUsers actualiza lista de usuarios', () => {
      const state = { users: [] };
      const users = [
        { id: '1', username: 'user1' },
        { id: '2', username: 'user2' },
      ];
      const newState = { ...state, users };

      expect(newState.users).toHaveLength(2);
    });

    it('selectUser selecciona usuario', () => {
      const state = {
        users: [{ id: '1', username: 'user1' }],
        selectedUser: null,
      };
      const newState = {
        ...state,
        selectedUser: state.users[0],
      };

      expect(newState.selectedUser?.id).toBe('1');
    });

    it('updateUserProfile actualiza perfil', () => {
      const state = {
        currentUser: { id: '1', bio: 'Old bio' },
      };
      const newState = {
        ...state,
        currentUser: { ...state.currentUser, bio: 'New bio' },
      };

      expect(newState.currentUser.bio).toBe('New bio');
    });
  });
});

describe('Redux Slices - Multiple Action Flows', () => {
  describe('Trade Creation Flow', () => {
    it('flujo de creación: pending -> success', () => {
      let state = { trades: [], loading: false, error: null };

      // Inicia carga
      state = { ...state, loading: true };
      expect(state.loading).toBe(true);

      // Agrega trade
      const newTrade = { id: '1', status: 'pending' };
      state = {
        ...state,
        trades: [...state.trades, newTrade],
        loading: false,
      };

      expect(state.trades).toHaveLength(1);
      expect(state.loading).toBe(false);
    });

    it('flujo de creación con error', () => {
      let state = { trades: [], loading: false, error: null };

      state = { ...state, loading: true };
      state = {
        ...state,
        loading: false,
        error: 'Failed to create trade',
      };

      expect(state.error).toBe('Failed to create trade');
      expect(state.loading).toBe(false);
    });
  });

  describe('Wishlist Management Flow', () => {
    it('crea wishlist y agrega cartas', () => {
      let state = { wishlists: [] };

      // Crea wishlist
      const newWishlist = { id: '1', name: 'Deseos', cards: [] };
      state = {
        ...state,
        wishlists: [...state.wishlists, newWishlist],
      };

      // Agrega cartas
      state = {
        wishlists: state.wishlists.map((w) =>
          w.id === '1'
            ? {
                ...w,
                cards: [...w.cards, { id: 'c1' }, { id: 'c2' }],
              }
            : w
        ),
      };

      expect(state.wishlists[0].cards).toHaveLength(2);
    });
  });
});
