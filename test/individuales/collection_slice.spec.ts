import { describe, it, expect } from 'vitest';
import collectionReducer, {
  fetchUserCollection,
  removeFromCollection,
} from '../../src/client/features/collection/collectionSlice';

describe('collectionSlice - reducer (pruebas en español)', () => {
  const initialState: any = {
    cards: [],
    loading: false,
    error: null,
  };

  it('pone loading al iniciar fetch (pending)', () => {
    const next = collectionReducer(initialState, {
      type: fetchUserCollection.pending.type,
    } as any);
    expect(next.loading).toBe(true);
    expect(next.error).toBeNull();
  });

  it('almacena cartas cuando fetch es exitoso (fulfilled)', () => {
    const payload = [{ id: 'c1' }, { id: 'c2' }];
    const next = collectionReducer(initialState, {
      type: fetchUserCollection.fulfilled.type,
      payload,
    } as any);
    expect(next.loading).toBe(false);
    expect(next.cards).toEqual(payload);
  });

  it('gestiona error en fetch (rejected) con mensaje por defecto', () => {
    const action: any = {
      type: fetchUserCollection.rejected.type,
      error: { message: 'fallo' },
    };
    const next = collectionReducer(initialState, action);
    expect(next.loading).toBe(false);
    expect(next.error).toBe('fallo');
  });

  it('elimina carta al recibir removeFromCollection.fulfilled', () => {
    const stateWith: any = {
      ...initialState,
      cards: [{ id: 'a' }, { id: 'b' }],
    };
    const next = collectionReducer(
      stateWith as any,
      { type: removeFromCollection.fulfilled.type, payload: 'a' } as any
    );
    expect(next.cards).toEqual([{ id: 'b' }]);
  });
});
