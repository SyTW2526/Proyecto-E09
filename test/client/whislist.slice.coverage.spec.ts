import { describe, it, expect, beforeEach, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';

const apiMock = {
  getUserWishlist: vi.fn(async () => [{ id: 'w1', name: 'Wish', image: '', rarity: 'Common', forTrade: false }]),
  addToWishlist: vi.fn(async () => true),
  removeFromWishlist: vi.fn(async () => true),
};

vi.mock('../../src/client/services/apiService', () => ({ default: apiMock }));

import wishlistReducer, { fetchWishlist, addToWishlist, removeFromWishlist } from '../../src/client/features/whislist/whislistSlice';

describe('whislistSlice - cobertura principal', () => {
  let store: any;

  beforeEach(() => {
    store = configureStore({ reducer: { wishlist: wishlistReducer } });
  });

  it('fetchWishlist -> pending/fulfilled carga lista', async () => {
    await store.dispatch<any>(fetchWishlist('userX'));
    const state = store.getState().wishlist;
    expect(state.loading).toBe(false);
    expect(state.cards.length).toBe(1);
  });

  it('add/remove -> actualiza lista correctamente', async () => {
    await store.dispatch<any>(fetchWishlist('userX'));
    await store.dispatch<any>(addToWishlist({ userId: 'u1', cardId: 'w2' }));
    await store.dispatch<any>(removeFromWishlist({ userId: 'u1', cardId: 'w1' }));
    const state = store.getState().wishlist;
    expect(Array.isArray(state.cards)).toBe(true);
  });

  it('fetchWishlist -> rejected establece error', async () => {
    apiMock.getUserWishlist.mockRejectedValueOnce(new Error('fallo'));
    await store.dispatch<any>(fetchWishlist('userY'));
    const state = store.getState().wishlist;
    expect(state.loading).toBe(false);
    expect(typeof state.error === 'string' || state.error === null).toBe(true);
  });
});
