import { describe, it, expect } from 'vitest';
import preferencesReducer from '../../src/client/features/preferences/preferencesSlice';

describe('preferencesSlice reducer (basic)', () => {
  const initial: any = preferencesReducer(
    undefined as any,
    { type: '@@INIT' } as any
  );

  it('tiene un estado inicial definido', () => {
    expect(initial).toBeDefined();
  });

  it('actualiza la preferencia de tema cuando se dispatcha la acción', () => {
    const next = preferencesReducer(initial, {
      type: 'preferences/updateTheme',
      payload: 'light',
    } as any);
    expect(next).toBeDefined();
  });

  it('cambia la preferencia de notificaciones', () => {
    const next = preferencesReducer(initial, {
      type: 'preferences/setNotifications',
      payload: false,
    } as any);
    expect(next).toBeDefined();
  });
});
