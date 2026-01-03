import { describe, it, expect, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import reducer, {
  setPreferences,
  setLanguage,
  setDarkMode,
  setNotificationPreferences,
  setPrivacyPreferences,
  setLoading,
  setError,
} from '../../src/client/features/preferences/preferencesSlice';

describe('preferencesSlice - cobertura principal', () => {
  let store: any;

  beforeEach(() => {
    store = configureStore({ reducer: { preferences: reducer } });
  });

  it('setLanguage y setDarkMode actualizan preferencias', () => {
    store.dispatch(setLanguage('en'));
    store.dispatch(setDarkMode(true));
    const s = store.getState().preferences;
    expect(s.preferences.language).toBe('en');
    expect(s.preferences.darkMode).toBe(true);
  });

  it('setNotificationPreferences fusiona parcialmente', () => {
    store.dispatch(setNotificationPreferences({ trades: false }));
    const s = store.getState().preferences;
    expect(s.preferences.notifications.trades).toBe(false);
    expect(s.preferences.notifications.messages).toBe(true);
  });

  it('setPrivacyPreferences fusiona parcialmente', () => {
    store.dispatch(setPrivacyPreferences({ showWishlist: false }));
    const s = store.getState().preferences;
    expect(s.preferences.privacy.showWishlist).toBe(false);
    expect(s.preferences.privacy.showCollection).toBe(true);
  });

  it('setPreferences reemplaza el objeto completo', () => {
    const next = {
      language: 'es' as const,
      darkMode: false,
      notifications: { trades: false, messages: false, friendRequests: true },
      privacy: { showCollection: false, showWishlist: false },
    };
    store.dispatch(setPreferences(next));
    const s = store.getState().preferences;
    expect(s.preferences).toEqual(next);
  });

  it('setLoading y setError cambian flags', () => {
    store.dispatch(setLoading(true));
    store.dispatch(setError('err'));
    const s = store.getState().preferences;
    expect(s.loading).toBe(true);
    expect(s.error).toBe('err');
  });
});
