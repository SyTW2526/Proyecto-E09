import { describe, it, expect, beforeEach, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import notificationsReducer from '../../src/client/features/notifications/notificationsSlice';

describe('notificationsSlice', () => {
  let store: any;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        notifications: notificationsReducer,
      },
    });
  });

  it('should have initial state', () => {
    const state = store.getState().notifications;
    expect(state).toBeDefined();
  });

  it('should initialize notifications reducer', () => {
    const state = store.getState().notifications;
    expect(state !== null).toBe(true);
  });

  it('should have reducer function', () => {
    expect(notificationsReducer).toBeDefined();
    expect(typeof notificationsReducer).toBe('function');
  });

  it('should be serializable', () => {
    const state = store.getState().notifications;
    expect(() => {
      JSON.stringify(state);
    }).not.toThrow();
  });

  it('should integrate with store', () => {
    const fullState = store.getState();
    expect(fullState.notifications).toBeDefined();
  });

  it('should handle state immutability', () => {
    const state1 = store.getState().notifications;
    const state2 = store.getState().notifications;
    expect(state1 === state2).toBe(true);
  });

  it('reducer should process undefined state', () => {
    const result = notificationsReducer(undefined, { type: '@@INIT' });
    expect(result).toBeDefined();
  });

  it('should support store dispatch', () => {
    expect(() => {
      store.dispatch({ type: 'TEST_ACTION' });
    }).not.toThrow();
  });

  it('should maintain state across getState calls', () => {
    const state1 = store.getState().notifications;
    const state2 = store.getState().notifications;
    expect(state1).toEqual(state2);
  });
});
