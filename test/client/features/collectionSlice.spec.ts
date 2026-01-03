import { describe, it, expect, beforeEach } from 'vitest';
import collectionReducer, {
  fetchUserCollection,
  addToCollection,
  removeFromCollection,
} from '../../../src/client/features/collection/collectionSlice';
import { UserOwnedCard } from '../../../src/client/types';

describe('collectionSlice', () => {
  let initialState: any;

  beforeEach(() => {
    initialState = {
      cards: [],
      loading: false,
      error: null,
    };
  });

  it('debería tener el estado inicial correcto', () => {
    const state = collectionReducer(undefined, { type: 'unknown' });
    expect(state.cards).toEqual([]);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  describe('fetchUserCollection', () => {
    it('debería setear loading a true en pending', () => {
      const action = { type: fetchUserCollection.pending.type };
      const state = collectionReducer(initialState, action as any);
      expect(state.loading).toBe(true);
    });

    it('debería cargar colección del usuario en fulfilled', () => {
      const mockCards: UserOwnedCard[] = [
        { id: '1', quantity: 2 } as UserOwnedCard,
        { id: '2', quantity: 1 } as UserOwnedCard,
      ];
      const action = {
        type: fetchUserCollection.fulfilled.type,
        payload: mockCards,
      };
      const state = collectionReducer(initialState, action as any);
      expect(state.loading).toBe(false);
      expect(state.cards).toEqual(mockCards);
    });

    it('debería setear error en rejected', () => {
      const action = {
        type: fetchUserCollection.rejected.type,
        error: { message: 'Error al cargar colección' },
      };
      const state = collectionReducer(initialState, action as any);
      expect(state.loading).toBe(false);
      expect(state.error).toBe('Error al cargar colección');
    });

    it('debería usar error por defecto si no hay mensaje', () => {
      const action = {
        type: fetchUserCollection.rejected.type,
        error: {},
      };
      const state = collectionReducer(initialState, action as any);
      expect(state.error).toBe('Error al cargar colección');
    });

    it('debería cargar colección vacía', () => {
      const action = {
        type: fetchUserCollection.fulfilled.type,
        payload: [],
      };
      const state = collectionReducer(initialState, action as any);
      expect(state.cards).toEqual([]);
      expect(state.loading).toBe(false);
    });

    it('debería mantener colección anterior durante pending', () => {
      const previousCards: UserOwnedCard[] = [
        { id: '1', quantity: 1 } as UserOwnedCard,
      ];
      const stateWithCards = {
        ...initialState,
        cards: previousCards,
      };
      const action = { type: fetchUserCollection.pending.type };
      const state = collectionReducer(stateWithCards, action as any);
      expect(state.loading).toBe(true);
      expect(state.cards).toEqual(previousCards);
    });

    it('debería reemplazar colección anterior', () => {
      const oldCards: UserOwnedCard[] = [
        { id: '1', quantity: 1 } as UserOwnedCard,
      ];
      let state = collectionReducer(initialState, {
        type: fetchUserCollection.fulfilled.type,
        payload: oldCards,
      } as any);
      expect(state.cards.length).toBe(1);

      const newCards: UserOwnedCard[] = [
        { id: '2', quantity: 2 } as UserOwnedCard,
        { id: '3', quantity: 3 } as UserOwnedCard,
      ];
      state = collectionReducer(state, {
        type: fetchUserCollection.fulfilled.type,
        payload: newCards,
      } as any);
      expect(state.cards.length).toBe(2);
      expect(state.cards[0].id).toBe('2');
    });
  });

  describe('addToCollection', () => {
    it('debería manejar fulfilled en addToCollection', () => {
      const action = {
        type: addToCollection.fulfilled.type,
        payload: '1',
      };
      const state = collectionReducer(initialState, action as any);
      expect(state.loading).toBe(false);
      // addToCollection no tiene handler específico para fulfilled
    });
  });

  describe('removeFromCollection', () => {
    it('debería remover tarjeta de la colección en fulfilled', () => {
      const stateWithCards = {
        ...initialState,
        cards: [
          { id: '1', quantity: 1 } as UserOwnedCard,
          { id: '2', quantity: 1 } as UserOwnedCard,
          { id: '3', quantity: 1 } as UserOwnedCard,
        ],
      };
      const action = {
        type: removeFromCollection.fulfilled.type,
        payload: '2',
      };
      const state = collectionReducer(stateWithCards, action as any);
      expect(state.cards.length).toBe(2);
      expect(state.cards.some((c) => c.id === '2')).toBe(false);
      expect(state.cards.some((c) => c.id === '1')).toBe(true);
      expect(state.cards.some((c) => c.id === '3')).toBe(true);
    });

    it('debería manejar remoción de tarjeta inexistente', () => {
      const stateWithCards = {
        ...initialState,
        cards: [
          { id: '1', quantity: 1 } as UserOwnedCard,
          { id: '2', quantity: 1 } as UserOwnedCard,
        ],
      };
      const action = {
        type: removeFromCollection.fulfilled.type,
        payload: '999',
      };
      const state = collectionReducer(stateWithCards, action as any);
      expect(state.cards.length).toBe(2);
    });

    it('debería manejar remoción de última tarjeta', () => {
      const stateWithCards = {
        ...initialState,
        cards: [{ id: '1', quantity: 1 } as UserOwnedCard],
      };
      const action = {
        type: removeFromCollection.fulfilled.type,
        payload: '1',
      };
      const state = collectionReducer(stateWithCards, action as any);
      expect(state.cards.length).toBe(0);
    });
  });

  describe('Casos combinados', () => {
    it('debería permitir flujo de cargar y remover tarjetas', () => {
      const mockCards: UserOwnedCard[] = [
        { id: '1', quantity: 1 } as UserOwnedCard,
        { id: '2', quantity: 2 } as UserOwnedCard,
      ];

      let state = collectionReducer(initialState, {
        type: fetchUserCollection.fulfilled.type,
        payload: mockCards,
      } as any);
      expect(state.cards.length).toBe(2);

      state = collectionReducer(state, {
        type: removeFromCollection.fulfilled.type,
        payload: '1',
      } as any);
      expect(state.cards.length).toBe(1);
      expect(state.cards[0].id).toBe('2');
    });

    it('debería recargar colección después de remover tarjeta', () => {
      let state = {
        ...initialState,
        cards: [{ id: '1', quantity: 1 } as UserOwnedCard],
      };

      state = collectionReducer(state, {
        type: removeFromCollection.fulfilled.type,
        payload: '1',
      } as any);
      expect(state.cards.length).toBe(0);

      const newCards: UserOwnedCard[] = [
        { id: '2', quantity: 1 } as UserOwnedCard,
        { id: '3', quantity: 1 } as UserOwnedCard,
      ];
      state = collectionReducer(state, {
        type: fetchUserCollection.fulfilled.type,
        payload: newCards,
      } as any);
      expect(state.cards.length).toBe(2);
      expect(state.cards[0].id).toBe('2');
    });

    it('debería manejar múltiples remociones', () => {
      let state = {
        ...initialState,
        cards: [
          { id: '1', quantity: 1 } as UserOwnedCard,
          { id: '2', quantity: 1 } as UserOwnedCard,
          { id: '3', quantity: 1 } as UserOwnedCard,
        ],
      };

      state = collectionReducer(state, {
        type: removeFromCollection.fulfilled.type,
        payload: '1',
      } as any);
      expect(state.cards.length).toBe(2);

      state = collectionReducer(state, {
        type: removeFromCollection.fulfilled.type,
        payload: '3',
      } as any);
      expect(state.cards.length).toBe(1);
      expect(state.cards[0].id).toBe('2');
    });

    it('debería mantener cantidad en colección', () => {
      const mockCards: UserOwnedCard[] = [
        { id: '1', quantity: 5 } as UserOwnedCard,
        { id: '2', quantity: 3 } as UserOwnedCard,
      ];
      const state = collectionReducer(initialState, {
        type: fetchUserCollection.fulfilled.type,
        payload: mockCards,
      } as any);
      expect(state.cards[0].quantity).toBe(5);
      expect(state.cards[1].quantity).toBe(3);
    });
  });
});
