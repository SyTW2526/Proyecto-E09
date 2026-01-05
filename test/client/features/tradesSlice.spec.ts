import { describe, it, expect, beforeEach } from 'vitest';
import tradesReducer, {
  fetchUserTrades,
  createTrade,
  updateTradeStatus,
} from '../../../src/client/features/trades/tradesSlice';
import { Trade, TradeStatus } from '../../../src/client/types';

describe('tradesSlice', () => {
  let initialState: any;

  beforeEach(() => {
    initialState = {
      list: [],
      loading: false,
      error: null,
    };
  });

  it('debería tener el estado inicial correcto', () => {
    const state = tradesReducer(undefined, { type: 'unknown' });
    expect(state.list).toEqual([]);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  describe('fetchUserTrades', () => {
    it('debería setear loading a true en pending', () => {
      const action = { type: fetchUserTrades.pending.type };
      const state = tradesReducer(initialState, action as any);
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('debería manejar error al cargar intercambios', () => {
      const action = {
        type: fetchUserTrades.rejected.type,
        payload: 'Network error',
      };
      const state = tradesReducer(initialState, action as any);
      expect(state.loading).toBe(false);
      expect(state.error).toBe('Network error');
    });

    it('debería cargar intercambios en fulfilled', () => {
      const mockTrades: Trade[] = [
        {
          id: '1',
          initiatorUserId: 'user1',
          receiverUserId: 'user2',
          status: 'pending' as TradeStatus,
        } as Trade,
        {
          id: '2',
          initiatorUserId: 'user1',
          receiverUserId: 'user3',
          status: 'completed' as TradeStatus,
        } as Trade,
      ];
      const action = {
        type: fetchUserTrades.fulfilled.type,
        payload: mockTrades,
      };
      const state = tradesReducer(initialState, action as any);
      expect(state.loading).toBe(false);
      expect(state.list).toEqual(mockTrades);
      expect(state.error).toBeNull();
    });

    it('debería manejar error en rejected', () => {
      const action = {
        type: fetchUserTrades.rejected.type,
        payload: 'Error al cargar intercambios',
      };
      const state = tradesReducer(initialState, action as any);
      expect(state.loading).toBe(false);
      expect(state.error).toBe('Error al cargar intercambios');
    });

    it('debería usar mensaje de error personalizado si no hay payload', () => {
      const action = {
        type: fetchUserTrades.rejected.type,
        error: { message: 'Network error' },
      };
      const state = tradesReducer(initialState, action as any);
      expect(state.loading).toBe(false);
      // El reducer prefiere error.message sobre el mensaje por defecto
      expect(state.error).toBe('Network error');
    });

    it('debería cargar lista vacía', () => {
      const action = {
        type: fetchUserTrades.fulfilled.type,
        payload: [],
      };
      const state = tradesReducer(initialState, action as any);
      expect(state.list).toEqual([]);
      expect(state.loading).toBe(false);
    });
  });

  describe('createTrade', () => {
    it('debería setear loading a true y error null en pending', () => {
      const action = { type: createTrade.pending.type };
      const state = tradesReducer(initialState, action as any);
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('debería limpiar error previo en pending', () => {
      const stateWithError = {
        ...initialState,
        error: 'Previous error',
      };
      const action = { type: createTrade.pending.type };
      const state = tradesReducer(stateWithError, action as any);
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('debería agregar nuevo intercambio en fulfilled', () => {
      const newTrade: Trade = {
        id: '1',
        initiatorUserId: 'user1',
        receiverUserId: 'user2',
        status: 'pending' as TradeStatus,
      } as Trade;
      const action = {
        type: createTrade.fulfilled.type,
        payload: newTrade,
      };
      const state = tradesReducer(initialState, action as any);
      expect(state.loading).toBe(false);
      expect(state.list).toContain(newTrade);
      expect(state.list.length).toBe(1);
    });

    it('debería manejar error en createTrade rejected', () => {
      const action = {
        type: createTrade.rejected.type,
        payload: 'Invalid trade data',
      };
      const state = tradesReducer(initialState, action as any);
      expect(state.loading).toBe(false);
      expect(state.error).toBe('Invalid trade data');
    });

    it('debería agregar múltiples intercambios', () => {
      const trade1: Trade = {
        id: '1',
        initiatorUserId: 'user1',
        receiverUserId: 'user2',
        status: 'pending' as TradeStatus,
      } as Trade;
      const trade2: Trade = {
        id: '2',
        initiatorUserId: 'user1',
        receiverUserId: 'user3',
        status: 'pending' as TradeStatus,
      } as Trade;

      let state = tradesReducer(initialState, {
        type: createTrade.fulfilled.type,
        payload: trade1,
      } as any);
      expect(state.list.length).toBe(1);

      state = tradesReducer(state, {
        type: createTrade.fulfilled.type,
        payload: trade2,
      } as any);
      expect(state.list.length).toBe(2);
    });

    it('debería manejar error en rejected', () => {
      const action = {
        type: createTrade.rejected.type,
        payload: 'Error creando intercambio',
      };
      const state = tradesReducer(initialState, action as any);
      expect(state.loading).toBe(false);
      expect(state.error).toBe('Error creando intercambio');
    });

    it('debería usar mensaje de error por defecto si falta payload', () => {
      const action = {
        type: createTrade.rejected.type,
        error: { message: 'Unknown error' },
      };
      const state = tradesReducer(initialState, action as any);
      // El reducer prefiere error.message sobre el mensaje por defecto
      expect(state.error).toBe('Unknown error');
    });
  });

  describe('updateTradeStatus', () => {
    it('debería actualizar estado de intercambio en fulfilled', () => {
      const initialTrade: Trade = {
        id: '1',
        initiatorUserId: 'user1',
        receiverUserId: 'user2',
        status: 'pending' as TradeStatus,
      } as Trade;

      let state = tradesReducer(initialState, {
        type: createTrade.fulfilled.type,
        payload: initialTrade,
      } as any);

      const updatedTrade: Trade = {
        ...initialTrade,
        status: 'accepted' as TradeStatus,
      };

      state = tradesReducer(state, {
        type: updateTradeStatus.fulfilled.type,
        payload: updatedTrade,
      } as any);

      const trade = state.list.find((t: Trade) => t.id === '1');
      expect(trade.status).toBe('accepted');
    });

    it('debería manejar actualización a múltiples estados', () => {
      const trade: Trade = {
        id: '1',
        initiatorUserId: 'user1',
        receiverUserId: 'user2',
        status: 'pending' as TradeStatus,
      } as Trade;

      let state = tradesReducer(initialState, {
        type: createTrade.fulfilled.type,
        payload: trade,
      } as any);

      const statuses: TradeStatus[] = ['accepted', 'completed', 'cancelled'];
      for (const status of statuses) {
        const updated = { ...trade, status };
        state = tradesReducer(state, {
          type: updateTradeStatus.fulfilled.type,
          payload: updated,
        } as any);
        const foundTrade = state.list.find((t: Trade) => t.id === '1');
        expect(foundTrade.status).toBe(status);
      }
    });

    it('debería actualizar intercambio específico de varios', () => {
      const trade1: Trade = {
        id: '1',
        initiatorUserId: 'user1',
        receiverUserId: 'user2',
        status: 'pending' as TradeStatus,
      } as Trade;
      const trade2: Trade = {
        id: '2',
        initiatorUserId: 'user1',
        receiverUserId: 'user3',
        status: 'pending' as TradeStatus,
      } as Trade;

      let state = tradesReducer(initialState, {
        type: createTrade.fulfilled.type,
        payload: trade1,
      } as any);
      state = tradesReducer(state, {
        type: createTrade.fulfilled.type,
        payload: trade2,
      } as any);

      const updatedTrade1 = { ...trade1, status: 'accepted' as TradeStatus };
      state = tradesReducer(state, {
        type: updateTradeStatus.fulfilled.type,
        payload: updatedTrade1,
      } as any);

      const t1 = state.list.find((t: Trade) => t.id === '1');
      const t2 = state.list.find((t: Trade) => t.id === '2');
      expect(t1.status).toBe('accepted');
      expect(t2.status).toBe('pending');
    });
  });

  describe('Casos combinados', () => {
    it('debería manejar flujo completo de intercambios', () => {
      const mockTrades: Trade[] = [
        {
          id: '1',
          initiatorUserId: 'user1',
          receiverUserId: 'user2',
          status: 'pending' as TradeStatus,
        } as Trade,
      ];

      let state = tradesReducer(initialState, {
        type: fetchUserTrades.pending.type,
      } as any);
      expect(state.loading).toBe(true);

      state = tradesReducer(state, {
        type: fetchUserTrades.fulfilled.type,
        payload: mockTrades,
      } as any);
      expect(state.loading).toBe(false);
      expect(state.list.length).toBe(1);
      expect(state.error).toBeNull();

      const newTrade: Trade = {
        id: '2',
        initiatorUserId: 'user1',
        receiverUserId: 'user3',
        status: 'pending' as TradeStatus,
      } as Trade;
      state = tradesReducer(state, {
        type: createTrade.fulfilled.type,
        payload: newTrade,
      } as any);
      expect(state.list.length).toBe(2);

      const updated = { ...mockTrades[0], status: 'completed' as TradeStatus };
      state = tradesReducer(state, {
        type: updateTradeStatus.fulfilled.type,
        payload: updated,
      } as any);
      const trade = state.list.find((t: Trade) => t.id === '1');
      expect(trade.status).toBe('completed');
    });

    it('debería mantener lista al manejar errores', () => {
      const mockTrades: Trade[] = [
        {
          id: '1',
          initiatorUserId: 'user1',
          receiverUserId: 'user2',
          status: 'pending' as TradeStatus,
        } as Trade,
      ];

      let state = tradesReducer(initialState, {
        type: fetchUserTrades.fulfilled.type,
        payload: mockTrades,
      } as any);
      expect(state.list.length).toBe(1);

      state = tradesReducer(state, {
        type: fetchUserTrades.pending.type,
      } as any);
      expect(state.list.length).toBe(1);
    });
  });
});
