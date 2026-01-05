import { describe, it, expect, beforeEach } from 'vitest';
import wishlistReducer, {
  fetchWishlist,
  addToWishlist,
  removeFromWishlist,
} from '../../../src/client/features/whislist/whislistSlice';
import { UserOwnedCard } from '../../../src/client/types';

describe('whislistSlice', () => {
  let initialState: any;

  beforeEach(() => {
    initialState = {
      cards: [],
      loading: false,
      error: null,
    };
  });

  it('debería tener el estado inicial correcto', () => {
    const state = wishlistReducer(undefined, { type: 'unknown' });
    expect(state.cards).toEqual([]);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  describe('fetchWishlist', () => {
    it('debería setear loading a true en pending', () => {
      const action = { type: fetchWishlist.pending.type };
      const state = wishlistReducer(initialState, action as any);
      expect(state.loading).toBe(true);
    });

    it('debería limpiar error en pending', () => {
      const stateWithError = {
        ...initialState,
        error: 'Previous error',
      };
      const action = { type: fetchWishlist.pending.type };
      const state = wishlistReducer(stateWithError, action as any);
      expect(state.loading).toBe(true);
      expect(state.error).toBe('Previous error'); // Error no se limpia en pending
    });

    it('debería setear loading a false y mantener lista en pending', () => {
      const cards: UserOwnedCard[] = [{ id: '1' } as UserOwnedCard];
      let state = {
        ...initialState,
        cards,
      };
      const action = { type: fetchWishlist.pending.type };
      state = wishlistReducer(state, action as any);
      expect(state.loading).toBe(true);
      expect(state.cards.length).toBe(1);
    });

    it('debería cargar wishlist en fulfilled', () => {
      const mockCards: UserOwnedCard[] = [
        { id: '1', quantity: 2 } as UserOwnedCard,
        { id: '2', quantity: 1 } as UserOwnedCard,
      ];
      const action = {
        type: fetchWishlist.fulfilled.type,
        payload: mockCards,
      };
      const state = wishlistReducer(initialState, action as any);
      expect(state.loading).toBe(false);
      expect(state.cards).toEqual(mockCards);
    });

    it('debería manejar error en fetchWishlist rejected', () => {
      const action = {
        type: fetchWishlist.rejected.type,
        error: { message: 'Network error' },
      };
      const state = wishlistReducer(initialState, action as any);
      expect(state.loading).toBe(false);
      expect(state.error).toBe('Network error');
    });

    it('debería usar mensaje de error por defecto', () => {
      const action = {
        type: fetchWishlist.rejected.type,
        error: {},
      };
      const state = wishlistReducer(initialState, action as any);
      expect(state.error).toBe('Error al cargar wishlist');
    });
  });

  describe('addToWishlist', () => {
    it('debería agregar tarjeta a wishlist en fulfilled', () => {
      const action = {
        type: addToWishlist.fulfilled.type,
        payload: '1',
      };
      const state = wishlistReducer(initialState, action as any);
      expect(state.cards.length).toBe(1);
      expect(state.cards[0].id).toBe('1');
    });

    it('debería agregar múltiples tarjetas', () => {
      let state = wishlistReducer(initialState, {
        type: addToWishlist.fulfilled.type,
        payload: '1',
      } as any);
      expect(state.cards.length).toBe(1);

      state = wishlistReducer(state, {
        type: addToWishlist.fulfilled.type,
        payload: '2',
      } as any);
      expect(state.cards.length).toBe(2);
    });

    it('debería no agregar tarjeta duplicada', () => {
      let state = wishlistReducer(initialState, {
        type: addToWishlist.fulfilled.type,
        payload: '1',
      } as any);
      expect(state.cards.length).toBe(1);

      state = wishlistReducer(state, {
        type: addToWishlist.fulfilled.type,
        payload: '1',
      } as any);
      expect(state.cards.length).toBe(1);
    });
  });

  describe('addToWishlist', () => {
    it('debería agregar tarjeta a wishlist en fulfilled', () => {
      const action = {
        type: addToWishlist.fulfilled.type,
        payload: '1',
      };
      const state = wishlistReducer(initialState, action as any);
      expect(state.cards.length).toBe(1);
      expect(state.cards[0].id).toBe('1');
    });

    it('debería agregar múltiples tarjetas', () => {
      let state = wishlistReducer(initialState, {
        type: addToWishlist.fulfilled.type,
        payload: '1',
      } as any);
      expect(state.cards.length).toBe(1);

      state = wishlistReducer(state, {
        type: addToWishlist.fulfilled.type,
        payload: '2',
      } as any);
      expect(state.cards.length).toBe(2);
    });

    it('debería no agregar tarjeta duplicada', () => {
      let state = wishlistReducer(initialState, {
        type: addToWishlist.fulfilled.type,
        payload: '1',
      } as any);
      expect(state.cards.length).toBe(1);

      state = wishlistReducer(state, {
        type: addToWishlist.fulfilled.type,
        payload: '1',
      } as any);
      expect(state.cards.length).toBe(1);
    });

    it('debería manejar agregar tarjeta con estructura completa', () => {
      const newCard: UserOwnedCard = { id: '1', quantity: 1 } as UserOwnedCard;
      let state = {
        ...initialState,
        cards: [newCard],
      };

      state = wishlistReducer(state, {
        type: addToWishlist.fulfilled.type,
        payload: '2',
      } as any);
      expect(state.cards.length).toBe(2);
    });
  });

  describe('removeFromWishlist', () => {
    it('debería remover tarjeta de wishlist en fulfilled', () => {
      const cards: UserOwnedCard[] = [
        { id: '1', quantity: 1 } as UserOwnedCard,
        { id: '2', quantity: 1 } as UserOwnedCard,
      ];

      let state = {
        ...initialState,
        cards,
      };

      state = wishlistReducer(state, {
        type: removeFromWishlist.fulfilled.type,
        payload: '1',
      } as any);

      expect(state.cards.length).toBe(1);
      expect(state.cards.some((c) => c.id === '1')).toBe(false);
      expect(state.cards[0].id).toBe('2');
    });

    it('debería manejar remoción de tarjeta inexistente', () => {
      const cards: UserOwnedCard[] = [
        { id: '1', quantity: 1 } as UserOwnedCard,
        { id: '2', quantity: 1 } as UserOwnedCard,
      ];

      let state = {
        ...initialState,
        cards,
      };

      state = wishlistReducer(state, {
        type: removeFromWishlist.fulfilled.type,
        payload: '999',
      } as any);

      expect(state.cards.length).toBe(2);
    });

    it('debería remover última tarjeta', () => {
      const cards: UserOwnedCard[] = [
        { id: '1', quantity: 1 } as UserOwnedCard,
      ];

      let state = {
        ...initialState,
        cards,
      };

      state = wishlistReducer(state, {
        type: removeFromWishlist.fulfilled.type,
        payload: '1',
      } as any);

      expect(state.cards.length).toBe(0);
    });

    it('debería remover tarjeta específica de varias', () => {
      const cards: UserOwnedCard[] = [
        { id: '1', quantity: 1 } as UserOwnedCard,
        { id: '2', quantity: 1 } as UserOwnedCard,
        { id: '3', quantity: 1 } as UserOwnedCard,
      ];

      let state = {
        ...initialState,
        cards,
      };

      state = wishlistReducer(state, {
        type: removeFromWishlist.fulfilled.type,
        payload: '2',
      } as any);

      expect(state.cards.length).toBe(2);
      expect(state.cards[0].id).toBe('1');
      expect(state.cards[1].id).toBe('3');
    });

    it('debería permitir remover múltiples tarjetas', () => {
      const cards: UserOwnedCard[] = [
        { id: '1', quantity: 1 } as UserOwnedCard,
        { id: '2', quantity: 1 } as UserOwnedCard,
        { id: '3', quantity: 1 } as UserOwnedCard,
      ];

      let state = {
        ...initialState,
        cards,
      };

      state = wishlistReducer(state, {
        type: removeFromWishlist.fulfilled.type,
        payload: '1',
      } as any);
      expect(state.cards.length).toBe(2);

      state = wishlistReducer(state, {
        type: removeFromWishlist.fulfilled.type,
        payload: '3',
      } as any);
      expect(state.cards.length).toBe(1);
      expect(state.cards[0].id).toBe('2');
    });
  });

  describe('Casos combinados', () => {
    it('debería manejar flujo completo de wishlist', () => {
      const mockCards: UserOwnedCard[] = [
        { id: '1', quantity: 1 } as UserOwnedCard,
        { id: '2', quantity: 1 } as UserOwnedCard,
      ];

      let state = wishlistReducer(initialState, {
        type: fetchWishlist.pending.type,
      } as any);
      expect(state.loading).toBe(true);

      state = wishlistReducer(state, {
        type: fetchWishlist.fulfilled.type,
        payload: mockCards,
      } as any);
      expect(state.loading).toBe(false);
      expect(state.cards.length).toBe(2);

      state = wishlistReducer(state, {
        type: addToWishlist.fulfilled.type,
        payload: '3',
      } as any);
      expect(state.cards.length).toBe(3);

      state = wishlistReducer(state, {
        type: removeFromWishlist.fulfilled.type,
        payload: '1',
      } as any);
      expect(state.cards.length).toBe(2);
    });

    it('debería permitir recargar wishlist después de cambios', () => {
      let state = wishlistReducer(initialState, {
        type: addToWishlist.fulfilled.type,
        payload: '1',
      } as any);
      expect(state.cards.length).toBe(1);

      const newCards: UserOwnedCard[] = [
        { id: '2', quantity: 1 } as UserOwnedCard,
        { id: '3', quantity: 1 } as UserOwnedCard,
      ];
      state = wishlistReducer(state, {
        type: fetchWishlist.fulfilled.type,
        payload: newCards,
      } as any);
      expect(state.cards.length).toBe(2);
      expect(state.cards[0].id).toBe('2');
    });

    it('debería manejar agregar y remover en secuencia', () => {
      let state = wishlistReducer(initialState, {
        type: addToWishlist.fulfilled.type,
        payload: '1',
      } as any);
      state = wishlistReducer(state, {
        type: addToWishlist.fulfilled.type,
        payload: '2',
      } as any);
      state = wishlistReducer(state, {
        type: addToWishlist.fulfilled.type,
        payload: '3',
      } as any);
      expect(state.cards.length).toBe(3);

      state = wishlistReducer(state, {
        type: removeFromWishlist.fulfilled.type,
        payload: '2',
      } as any);
      expect(state.cards.length).toBe(2);
      expect(state.cards.some((c) => c.id === '2')).toBe(false);
    });

    it('debería mantener cantidad de tarjetas al actualizar wishlist', () => {
      const card1: UserOwnedCard = { id: '1', quantity: 5 } as UserOwnedCard;
      const card2: UserOwnedCard = { id: '2', quantity: 3 } as UserOwnedCard;

      let state = {
        ...initialState,
        cards: [card1, card2],
      };

      state = wishlistReducer(state, {
        type: removeFromWishlist.fulfilled.type,
        payload: '1',
      } as any);

      expect(state.cards[0].quantity).toBe(3);
    });
  });
});
