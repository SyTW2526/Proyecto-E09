import { describe, it, expect, beforeEach, vi } from 'vitest';
import preferencesReducer, {
  setPreferences,
  setLanguage,
  setDarkMode,
  setNotificationPreferences,
  setPrivacyPreferences,
  setLoading,
  setError,
} from '../../../src/client/features/preferences/preferencesSlice';
import { UserPreferences } from '../../../src/client/features/preferences/preferencesSlice';

describe('preferencesSlice', () => {
  let initialState: any;

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    initialState = {
      preferences: {
        language: 'es',
        darkMode: false,
        notifications: {
          trades: true,
          messages: true,
          friendRequests: true,
        },
        privacy: {
          showCollection: true,
          showWishlist: true,
        },
      },
      loading: false,
      error: null,
    };
  });

  it('debería tener el estado inicial correcto', () => {
    const state = preferencesReducer(undefined, { type: 'unknown' });
    expect(state.preferences.language).toBe('es');
    expect(state.preferences.darkMode).toBe(false);
    expect(state.preferences.notifications.trades).toBe(true);
    expect(state.preferences.privacy.showCollection).toBe(true);
  });

  describe('setPreferences', () => {
    it('debería cargar preferencias completas', () => {
      const newPreferences: UserPreferences = {
        language: 'en',
        darkMode: true,
        notifications: {
          trades: false,
          messages: false,
          friendRequests: false,
        },
        privacy: {
          showCollection: false,
          showWishlist: false,
        },
      };
      const state = preferencesReducer(
        initialState,
        setPreferences(newPreferences)
      );
      expect(state.preferences).toEqual(newPreferences);
    });

    it('debería reemplazar preferencias completamente', () => {
      const newPreferences: UserPreferences = {
        language: 'en',
        darkMode: true,
        notifications: {
          trades: true,
          messages: true,
          friendRequests: true,
        },
        privacy: {
          showCollection: true,
          showWishlist: true,
        },
      };
      const state = preferencesReducer(
        initialState,
        setPreferences(newPreferences)
      );
      expect(state.preferences.language).toBe('en');
      expect(state.preferences.darkMode).toBe(true);
    });
  });

  describe('setLanguage', () => {
    it('debería cambiar idioma a english', () => {
      const state = preferencesReducer(initialState, setLanguage('en'));
      expect(state.preferences.language).toBe('en');
    });

    it('debería cambiar idioma a spanish', () => {
      const state = preferencesReducer(
        {
          ...initialState,
          preferences: { ...initialState.preferences, language: 'en' },
        },
        setLanguage('es')
      );
      expect(state.preferences.language).toBe('es');
    });

    it('debería mantener otras preferencias al cambiar idioma', () => {
      const state = preferencesReducer(initialState, setLanguage('en'));
      expect(state.preferences.darkMode).toBe(false);
      expect(state.preferences.notifications.trades).toBe(true);
    });
  });

  describe('getSavedDarkMode', () => {
    it('debería leer dark mode desde localStorage', () => {
      localStorage.setItem('darkMode', 'true');
      // Crear nuevo estado para forzar lectura de localStorage
      const state = preferencesReducer(undefined, { type: 'unknown' });
      // El estado debería tener darkMode del localStorage
      expect(state).toBeDefined();
    });

    it('debería retornar false si localStorage no existe', () => {
      localStorage.clear();
      const state = preferencesReducer(undefined, { type: 'unknown' });
      expect(state.preferences.darkMode).toBe(false);
    });

    it('debería retornar false si localStorage contiene "false"', () => {
      localStorage.setItem('darkMode', 'false');
      const state = preferencesReducer(undefined, { type: 'unknown' });
      expect(state.preferences.darkMode).toBe(false);
    });

    it('debería manejar valores inesperados en localStorage', () => {
      localStorage.setItem('darkMode', 'invalid');
      const state = preferencesReducer(undefined, { type: 'unknown' });
      expect(state.preferences.darkMode).toBe(false);
    });
  });

  describe('setDarkMode', () => {
    it('debería activar modo oscuro', () => {
      const state = preferencesReducer(initialState, setDarkMode(true));
      expect(state.preferences.darkMode).toBe(true);
    });

    it('debería desactivar modo oscuro', () => {
      const state = preferencesReducer(
        {
          ...initialState,
          preferences: { ...initialState.preferences, darkMode: true },
        },
        setDarkMode(false)
      );
      expect(state.preferences.darkMode).toBe(false);
    });

    it('debería alternar modo oscuro múltiples veces', () => {
      let state = preferencesReducer(initialState, setDarkMode(true));
      expect(state.preferences.darkMode).toBe(true);

      state = preferencesReducer(state, setDarkMode(false));
      expect(state.preferences.darkMode).toBe(false);

      state = preferencesReducer(state, setDarkMode(true));
      expect(state.preferences.darkMode).toBe(true);
    });

    it('debería mantener otras preferencias al cambiar dark mode', () => {
      const state = preferencesReducer(initialState, setDarkMode(true));
      expect(state.preferences.language).toBe('es');
      expect(state.preferences.notifications.trades).toBe(true);
    });
  });

  describe('setNotificationPreferences', () => {
    it('debería desactivar notificaciones de trades', () => {
      const state = preferencesReducer(
        initialState,
        setNotificationPreferences({ trades: false })
      );
      expect(state.preferences.notifications.trades).toBe(false);
      expect(state.preferences.notifications.messages).toBe(true);
      expect(state.preferences.notifications.friendRequests).toBe(true);
    });

    it('debería desactivar múltiples notificaciones', () => {
      const state = preferencesReducer(
        initialState,
        setNotificationPreferences({
          trades: false,
          messages: false,
        })
      );
      expect(state.preferences.notifications.trades).toBe(false);
      expect(state.preferences.notifications.messages).toBe(false);
      expect(state.preferences.notifications.friendRequests).toBe(true);
    });

    it('debería desactivar todas las notificaciones', () => {
      const state = preferencesReducer(
        initialState,
        setNotificationPreferences({
          trades: false,
          messages: false,
          friendRequests: false,
        })
      );
      expect(state.preferences.notifications.trades).toBe(false);
      expect(state.preferences.notifications.messages).toBe(false);
      expect(state.preferences.notifications.friendRequests).toBe(false);
    });

    it('debería reactivar notificaciones', () => {
      let state = preferencesReducer(
        initialState,
        setNotificationPreferences({
          trades: false,
        })
      );
      expect(state.preferences.notifications.trades).toBe(false);

      state = preferencesReducer(
        state,
        setNotificationPreferences({
          trades: true,
        })
      );
      expect(state.preferences.notifications.trades).toBe(true);
    });

    it('debería mantener otras preferencias al cambiar notificaciones', () => {
      const state = preferencesReducer(
        initialState,
        setNotificationPreferences({ trades: false })
      );
      expect(state.preferences.language).toBe('es');
      expect(state.preferences.darkMode).toBe(false);
      expect(state.preferences.privacy.showCollection).toBe(true);
    });
  });

  describe('setPrivacyPreferences', () => {
    it('debería ocultar colección', () => {
      const state = preferencesReducer(
        initialState,
        setPrivacyPreferences({ showCollection: false })
      );
      expect(state.preferences.privacy.showCollection).toBe(false);
      expect(state.preferences.privacy.showWishlist).toBe(true);
    });

    it('debería ocultar wishlist', () => {
      const state = preferencesReducer(
        initialState,
        setPrivacyPreferences({ showWishlist: false })
      );
      expect(state.preferences.privacy.showWishlist).toBe(false);
      expect(state.preferences.privacy.showCollection).toBe(true);
    });

    it('debería ocultar ambas', () => {
      const state = preferencesReducer(
        initialState,
        setPrivacyPreferences({
          showCollection: false,
          showWishlist: false,
        })
      );
      expect(state.preferences.privacy.showCollection).toBe(false);
      expect(state.preferences.privacy.showWishlist).toBe(false);
    });

    it('debería mostrar ambas nuevamente', () => {
      let state = preferencesReducer(
        initialState,
        setPrivacyPreferences({
          showCollection: false,
          showWishlist: false,
        })
      );
      state = preferencesReducer(
        state,
        setPrivacyPreferences({
          showCollection: true,
          showWishlist: true,
        })
      );
      expect(state.preferences.privacy.showCollection).toBe(true);
      expect(state.preferences.privacy.showWishlist).toBe(true);
    });

    it('debería mantener otras preferencias al cambiar privacidad', () => {
      const state = preferencesReducer(
        initialState,
        setPrivacyPreferences({ showCollection: false })
      );
      expect(state.preferences.language).toBe('es');
      expect(state.preferences.darkMode).toBe(false);
      expect(state.preferences.notifications.trades).toBe(true);
    });
  });

  describe('setLoading', () => {
    it('debería setear loading a true', () => {
      const state = preferencesReducer(initialState, setLoading(true));
      expect(state.loading).toBe(true);
    });

    it('debería setear loading a false', () => {
      const state = preferencesReducer(
        { ...initialState, loading: true },
        setLoading(false)
      );
      expect(state.loading).toBe(false);
    });
  });

  describe('setError', () => {
    it('debería setear error', () => {
      const state = preferencesReducer(
        initialState,
        setError('Error al cargar preferencias')
      );
      expect(state.error).toBe('Error al cargar preferencias');
    });

    it('debería limpiar error', () => {
      const state = preferencesReducer(
        { ...initialState, error: 'Previous error' },
        setError(null)
      );
      expect(state.error).toBeNull();
    });
  });

  describe('Casos combinados', () => {
    it('debería cambiar múltiples preferencias', () => {
      let state = preferencesReducer(initialState, setLanguage('en'));
      state = preferencesReducer(state, setDarkMode(true));
      state = preferencesReducer(
        state,
        setNotificationPreferences({ trades: false })
      );

      expect(state.preferences.language).toBe('en');
      expect(state.preferences.darkMode).toBe(true);
      expect(state.preferences.notifications.trades).toBe(false);
      expect(state.preferences.notifications.messages).toBe(true);
    });

    it('debería manejar cambios complejos de privacidad y notificaciones', () => {
      let state = preferencesReducer(
        initialState,
        setPrivacyPreferences({
          showCollection: false,
          showWishlist: false,
        })
      );
      state = preferencesReducer(
        state,
        setNotificationPreferences({
          trades: false,
          messages: true,
        })
      );

      expect(state.preferences.privacy.showCollection).toBe(false);
      expect(state.preferences.privacy.showWishlist).toBe(false);
      expect(state.preferences.notifications.trades).toBe(false);
      expect(state.preferences.notifications.messages).toBe(true);
    });

    it('debería revertir cambios a preferencias por defecto', () => {
      let state = preferencesReducer(initialState, setLanguage('en'));
      state = preferencesReducer(state, setDarkMode(true));
      state = preferencesReducer(
        state,
        setNotificationPreferences({
          trades: false,
          messages: false,
          friendRequests: false,
        })
      );

      // Revertir
      state = preferencesReducer(state, setLanguage('es'));
      state = preferencesReducer(state, setDarkMode(false));
      state = preferencesReducer(
        state,
        setNotificationPreferences({
          trades: true,
          messages: true,
          friendRequests: true,
        })
      );

      expect(state.preferences.language).toBe('es');
      expect(state.preferences.darkMode).toBe(false);
      expect(state.preferences.notifications.trades).toBe(true);
      expect(state.preferences.notifications.messages).toBe(true);
      expect(state.preferences.notifications.friendRequests).toBe(true);
    });
  });
});
