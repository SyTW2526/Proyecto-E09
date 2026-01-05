import { describe, it, expect, beforeEach, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';

vi.mock('../../src/client/services/apiService', () => ({
  default: {
    fetchFeaturedCards: vi.fn(async () => [{ id: 'c1', name: 'Pikachu' }]),
    searchCards: vi.fn(async (q: string, page = 1, limit = 20) => ({
      data: [{ id: 'c2' }],
      total: 3,
      page,
      limit,
    })),
    getCardById: vi.fn(async (id: string) => ({ id, name: 'Charizard' })),
  },
}));

import cardsReducer, {
  fetchFeaturedCards,
  searchCards,
  fetchCardById,
} from '../../src/client/features/cards/cardsSlice';

describe('cardsSlice - cobertura de casos principales', () => {
  let store: any;

  beforeEach(() => {
    store = configureStore({ reducer: { cards: cardsReducer } });
  });

  it('fetchFeaturedCards -> pending/fulfilled actualiza lista y loading', async () => {
    // Ejecuta thunk
    await store.dispatch<any>(fetchFeaturedCards());
    const state = store.getState().cards;
    expect(state.loading).toBe(false);
    expect(state.list.length).toBe(1);
  });

  it('searchCards -> fulfilled establece data y total', async () => {
    await store.dispatch<any>(searchCards({ query: 'charizard', page: 2 }));
    const state = store.getState().cards;
    expect(state.list.length).toBeGreaterThan(0);
    expect(state.total).toBe(3);
  });

  it('fetchCardById -> fulfilled establece selectedCard', async () => {
    await store.dispatch<any>(fetchCardById('base1-4'));
    const state = store.getState().cards;
    expect(state.selectedCard?.id).toBe('base1-4');
  });
});
