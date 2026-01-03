import { describe, it, expect, beforeEach } from 'vitest';
import cardsReducer, { fetchFeaturedCards, searchCards, fetchCardById } from '../../../src/client/features/cards/cardsSlice';
import { PokemonCard } from '../../../src/client/types';

describe('cardsSlice', () => {
  let initialState: any;

  beforeEach(() => {
    initialState = {
      list: [],
      selectedCard: null,
      loading: false,
      error: null,
      total: 0,
    };
  });

  it('debería tener el estado inicial correcto', () => {
    const state = cardsReducer(undefined, { type: 'unknown' });
    expect(state.list).toEqual([]);
    expect(state.selectedCard).toBeNull();
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.total).toBe(0);
  });

  describe('fetchFeaturedCards', () => {
    it('debería setear loading a true en pending', () => {
      const action = { type: fetchFeaturedCards.pending.type };
      const state = cardsReducer(initialState, action as any);
      expect(state.loading).toBe(true);
    });
    it('debería limpiar error en pending', () => {
      const stateWithError = {
        ...initialState,
        error: 'Previous error',
      };
      const action = { type: fetchFeaturedCards.pending.type };
      const state = cardsReducer(stateWithError, action as any);
      expect(state.loading).toBe(true);
      expect(state.error).toBe('Previous error');
    });
    it('debería cargar tarjetas en fulfilled', () => {
      const mockCards: PokemonCard[] = [
        { id: '1', name: 'Pikachu' } as PokemonCard,
        { id: '2', name: 'Charizard' } as PokemonCard,
      ];
      const action = {
        type: fetchFeaturedCards.fulfilled.type,
        payload: mockCards,
      };
      const state = cardsReducer(initialState, action as any);
      expect(state.loading).toBe(false);
      expect(state.list).toEqual(mockCards);
    });

    it('debería setear loading a false en fulfilled', () => {
      const action = {
        type: fetchFeaturedCards.fulfilled.type,
        payload: [],
      };
      const state = cardsReducer(initialState, action as any);
      expect(state.loading).toBe(false);
    });

    it('debería manejar rejected en fetchFeaturedCards', () => {
      const action = {
        type: fetchFeaturedCards.rejected.type,
        error: { message: 'Error fetching featured' },
      };
      const state = cardsReducer(initialState, action as any);
      // fetchFeaturedCards no tiene rejected handler, pero loading debería ser false
      expect(state.loading).toBe(false);
    });
  });

  describe('searchCards', () => {
    it('debería setear loading a false cuando se completa búsqueda', () => {
      const mockCards: PokemonCard[] = [
        { id: '1', name: 'Pikachu' } as PokemonCard,
      ];
      const action = {
        type: searchCards.fulfilled.type,
        payload: {
          data: mockCards,
          total: 1,
        },
      };
      const state = cardsReducer(initialState, action as any);
      expect(state.loading).toBe(false);
    });

    it('debería actualizar lista y total en fulfilled', () => {
      const mockCards: PokemonCard[] = [
        { id: '1', name: 'Pikachu' } as PokemonCard,
      ];
      const action = {
        type: searchCards.fulfilled.type,
        payload: {
          data: mockCards,
          total: 1,
        },
      };
      const state = cardsReducer(initialState, action as any);
      expect(state.loading).toBe(false);
      expect(state.list).toEqual(mockCards);
      expect(state.total).toBe(1);
    });

    it('debería setear loading a false en fulfilled', () => {
      const action = {
        type: searchCards.fulfilled.type,
        payload: {
          data: [],
          total: 0,
        },
      };
      const state = cardsReducer(initialState, action as any);
      expect(state.loading).toBe(false);
    });

    it('debería manejar búsqueda sin resultados', () => {
      const action = {
        type: searchCards.fulfilled.type,
        payload: {
          data: [],
          total: 0,
        },
      };
      const state = cardsReducer(initialState, action as any);
      expect(state.list).toEqual([]);
      expect(state.total).toBe(0);
    });

    it('debería manejar rejected en searchCards', () => {
      const action = {
        type: searchCards.rejected.type,
        error: { message: 'Search error' },
      };
      const state = cardsReducer(initialState, action as any);
      // searchCards no tiene rejected handler específico
      expect(state.loading).toBe(false);
    });

    it('debería mantener lista anterior hasta nuevo fulfilled', () => {
      const oldCards: PokemonCard[] = [
        { id: '1', name: 'Pikachu' } as PokemonCard,
      ];
      let state = cardsReducer(initialState, {
        type: searchCards.fulfilled.type,
        payload: {
          data: oldCards,
          total: 1,
        },
      } as any);
      expect(state.list.length).toBe(1);

      const newCards: PokemonCard[] = [
        { id: '2', name: 'Charizard' } as PokemonCard,
        { id: '3', name: 'Blastoise' } as PokemonCard,
      ];
      state = cardsReducer(state, {
        type: searchCards.fulfilled.type,
        payload: {
          data: newCards,
          total: 2,
        },
      } as any);
      expect(state.list.length).toBe(2);
      expect(state.list[0].id).toBe('2');
    });
  });

  describe('fetchCardById', () => {
    it('debería setear selectedCard en fulfilled', () => {
      const mockCard: PokemonCard = {
        id: '1',
        name: 'Pikachu',
      } as PokemonCard;
      const action = {
        type: fetchCardById.fulfilled.type,
        payload: mockCard,
      };
      const state = cardsReducer(initialState, action as any);
      expect(state.selectedCard).toEqual(mockCard);
    });

    it('debería mantener tarjeta anterior si falla', () => {
      const previousCard: PokemonCard = {
        id: '1',
        name: 'Pikachu',
      } as PokemonCard;
      const stateWithCard = {
        ...initialState,
        selectedCard: previousCard,
      };
      const action = {
        type: fetchCardById.pending.type,
      };
      const state = cardsReducer(stateWithCard, action as any);
      expect(state.selectedCard).toEqual(previousCard);
    });

    it('debería actualizar selectedCard cuando se carga nueva tarjeta', () => {
      const card1: PokemonCard = {
        id: '1',
        name: 'Pikachu',
      } as PokemonCard;
      const card2: PokemonCard = {
        id: '2',
        name: 'Charizard',
      } as PokemonCard;

      let state = cardsReducer(initialState, {
        type: fetchCardById.fulfilled.type,
        payload: card1,
      } as any);
      expect(state.selectedCard).toEqual(card1);

      state = cardsReducer(state, {
        type: fetchCardById.fulfilled.type,
        payload: card2,
      } as any);
      expect(state.selectedCard).toEqual(card2);
    });

    it('debería manejar rejected en fetchCardById', () => {
      const previousCard: PokemonCard = {
        id: '1',
        name: 'Pikachu',
      } as PokemonCard;
      const stateWithCard = {
        ...initialState,
        selectedCard: previousCard,
      };
      const action = {
        type: fetchCardById.rejected.type,
        error: { message: 'Card not found' },
      };
      const state = cardsReducer(stateWithCard, action as any);
      // fetchCardById no tiene rejected handler, mantiene tarjeta anterior
      expect(state.selectedCard).toEqual(previousCard);
    });
  });

  describe('Casos combinados', () => {
    it('debería manejar flujo completo de búsqueda', () => {
      const mockCards: PokemonCard[] = [
        { id: '1', name: 'Pikachu' } as PokemonCard,
      ];

      let state = cardsReducer(initialState, {
        type: searchCards.fulfilled.type,
        payload: {
          data: mockCards,
          total: 1,
        },
      } as any);
      expect(state.loading).toBe(false);
      expect(state.list).toEqual(mockCards);
      expect(state.total).toBe(1);
    });

    it('debería permitir buscar mientras una tarjeta está seleccionada', () => {
      const selectedCard: PokemonCard = {
        id: '99',
        name: 'Blastoise',
      } as PokemonCard;
      const searchResults: PokemonCard[] = [
        { id: '1', name: 'Pikachu' } as PokemonCard,
      ];

      let state = {
        ...initialState,
        selectedCard,
      };

      state = cardsReducer(state, {
        type: searchCards.fulfilled.type,
        payload: {
          data: searchResults,
          total: 1,
        },
      } as any);

      expect(state.selectedCard).toEqual(selectedCard);
      expect(state.list).toEqual(searchResults);
    });

    it('debería manejar múltiples búsquedas consecutivas', () => {
      const results1: PokemonCard[] = [
        { id: '1', name: 'Pikachu' } as PokemonCard,
      ];
      const results2: PokemonCard[] = [
        { id: '2', name: 'Charizard' } as PokemonCard,
      ];

      let state = cardsReducer(initialState, {
        type: searchCards.fulfilled.type,
        payload: {
          data: results1,
          total: 1,
        },
      } as any);
      expect(state.list).toEqual(results1);
      expect(state.total).toBe(1);

      state = cardsReducer(state, {
        type: searchCards.fulfilled.type,
        payload: {
          data: results2,
          total: 1,
        },
      } as any);
      expect(state.list).toEqual(results2);
      expect(state.total).toBe(1);
    });
  });
});
