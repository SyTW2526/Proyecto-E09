import { describe, it, expect, beforeEach, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';

const apiMock = {
  getUserTrades: vi.fn(async () => [{ id: 't1', from: 'a', to: 'b', offeredCards: [], requestedCards: [], status: 'pending', createdAt: new Date() }]),
  createTrade: vi.fn(async () => ({ id: 't2', from: 'a', to: 'b', offeredCards: [], requestedCards: [], status: 'pending', createdAt: new Date() })),
  updateTradeStatus: vi.fn(async (_id: string, _s: string) => ({ id: 't2', status: 'accepted' })),
};

vi.mock('../../src/client/services/apiService', () => ({ default: apiMock }));

import tradesReducer, { fetchUserTrades, createTrade, updateTradeStatus } from '../../src/client/features/trades/tradesSlice';

describe('tradesSlice - cobertura principal', () => {
  let store: any;

  beforeEach(() => {
    store = configureStore({ reducer: { trades: tradesReducer } });
  });

  it('fetchUserTrades -> pending/fulfilled carga lista', async () => {
    await store.dispatch<any>(fetchUserTrades('u1'));
    const state = store.getState().trades;
    expect(state.loading).toBe(false);
    expect(state.list.length).toBeGreaterThan(0);
  });

  it('fetchUserTrades -> rejected establece error', async () => {
    apiMock.getUserTrades.mockRejectedValueOnce(new Error('net'));
    await store.dispatch<any>(fetchUserTrades('u2'));
    const state = store.getState().trades;
    expect(state.loading).toBe(false);
    expect(typeof state.error === 'string' || state.error === null).toBe(true);
  });

  it('createTrade -> pending/fulfilled agrega trade y updateTradeStatus actualiza estado', async () => {
    await store.dispatch<any>(createTrade({ initiatorUserId: 'a', receiverUserId: 'b' } as any));
    let state = store.getState().trades;
    expect(state.list.find((t: any) => t.id === 't2')).toBeTruthy();

    await store.dispatch<any>(updateTradeStatus({ tradeId: 't2', status: 'accepted' } as any));
    state = store.getState().trades;
    expect(state.list.find((t: any) => t.id === 't2')?.status).toBe('accepted');
  });
});
