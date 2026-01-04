import { describe, it, expect, vi } from 'vitest';

// Mock api service methods used by thunks
vi.mock('../../src/client/services/apiService', () => ({
  default: {
    fetchFeaturedCards: vi.fn(async () => [{ id: 'c1', name: 'Pikachu' }]),
    searchCards: vi.fn(async (q: string, page = 1) => ({
      data: [{ id: 'x' }],
      total: 1,
      page,
      limit: 20,
    })),
    getCardById: vi.fn(async (id: string) => ({ id, name: 'Charizard' })),
  },
}));

import { store } from '../../src/client/store/store';
import {
  fetchFeaturedCards,
  searchCards,
  fetchCardById,
} from '../../src/client/features/cards/cardsSlice';

describe('Redux store - smoke test dispatching thunks', () => {
  it('dispatches fetchFeaturedCards and updates state', async () => {
    await store.dispatch<any>(fetchFeaturedCards());
    const state = store.getState();
    expect(state.cards.loading).toBe(false);
    expect(state.cards.list.length).toBe(1);
  });

  it('dispatches searchCards and sets list + total', async () => {
    await store.dispatch<any>(searchCards({ query: 'charizard', page: 2 }));
    const state = store.getState();
    expect(state.cards.list.length).toBeGreaterThanOrEqual(1);
    expect(state.cards.total).toBe(1);
  });

  it('dispatches fetchCardById and sets selectedCard', async () => {
    await store.dispatch<any>(fetchCardById('base1-4'));
    const state = store.getState();
    expect(state.cards.selectedCard?.id).toBe('base1-4');
  });
});
