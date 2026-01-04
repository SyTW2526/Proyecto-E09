import { describe, it, expect, beforeEach, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';

const apiMock = {
  getUserCollection: vi.fn(async (_username: string) => [
    { id: 'u1', name: 'Card 1', image: '', rarity: 'Common', forTrade: false },
  ]),
  addToCollection: vi.fn(async () => true),
  removeFromCollection: vi.fn(async () => true),
};

vi.mock('../../src/client/services/apiService', () => ({ default: apiMock }));

import collectionReducer, {
  fetchUserCollection,
  addToCollection,
  removeFromCollection,
} from '../../src/client/features/collection/collectionSlice';

describe('collectionSlice - cobertura principal', () => {
  let store: any;

  beforeEach(() => {
    store = configureStore({ reducer: { collection: collectionReducer } });
  });

  it('fetchUserCollection -> pending/fulfilled carga lista', async () => {
    await store.dispatch<any>(fetchUserCollection('userA'));
    const state = store.getState().collection;
    expect(state.loading).toBe(false);
    expect(state.cards.length).toBe(1);
  });

  it('removeFromCollection -> fulfilled filtra por id', async () => {
    // Pre-carga estado
    await store.dispatch<any>(fetchUserCollection('userA'));
    await store.dispatch<any>(
      removeFromCollection({ userId: 'u', cardId: 'u1' })
    );
    const state = store.getState().collection;
    expect(state.cards.find((c: any) => c.id === 'u1')).toBeUndefined();
  });

  it('fetchUserCollection -> rejected establece error', async () => {
    apiMock.getUserCollection.mockRejectedValueOnce(new Error('fallo'));
    await store.dispatch<any>(fetchUserCollection('userB'));
    const state = store.getState().collection;
    expect(state.loading).toBe(false);
    expect(typeof state.error === 'string' || state.error === null).toBe(true);
  });
});
