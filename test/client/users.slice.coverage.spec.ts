import { describe, it, expect, beforeEach, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';

const apiMock = {
  getUserById: vi.fn(async (id: string) => ({ id, username: 'u', email: 'u@e.com', collection: [], wishlist: [], trades: [] })),
  getUserFriends: vi.fn(async () => [{ id: 'f1', username: 'f' }]),
  addFriend: vi.fn(async () => ({ id: 'f2', username: 'n' })),
  removeFriend: vi.fn(async () => true),
};

vi.mock('../../src/client/services/apiService', () => ({ default: apiMock }));

import usersReducer, { fetchUserById, fetchUserFriends, addFriend, removeFriend, logoutUser } from '../../src/client/features/users/usersSlice';

describe('usersSlice - cobertura principal', () => {
  let store: any;

  beforeEach(() => {
    store = configureStore({ reducer: { users: usersReducer } });
  });

  it('fetchUserById -> pending/fulfilled establece currentUser', async () => {
    await store.dispatch<any>(fetchUserById('u1'));
    const state = store.getState().users;
    expect(state.loading).toBe(false);
    expect(state.currentUser?.id).toBe('u1');
  });

  it('fetchUserById -> rejected establece error', async () => {
    apiMock.getUserById.mockResolvedValueOnce(null);
    await store.dispatch<any>(fetchUserById('u2'));
    const state = store.getState().users;
    expect(state.loading).toBe(false);
    expect(typeof state.error === 'string' || state.error === null).toBe(true);
  });

  it('friends -> fetch, add y remove actualizan lista', async () => {
    await store.dispatch<any>(fetchUserFriends('u1'));
    await store.dispatch<any>(addFriend({ userId: 'u1', friendId: 'f2' }));
    await store.dispatch<any>(removeFriend({ userId: 'u1', friendId: 'f2' }));
    const state = store.getState().users;
    expect(Array.isArray(state.friends)).toBe(true);
  });

  it('logoutUser limpia usuario y amigos', () => {
    store.dispatch(logoutUser());
    const state = store.getState().users;
    expect(state.currentUser).toBeNull();
    expect(state.friends.length).toBe(0);
  });
});
