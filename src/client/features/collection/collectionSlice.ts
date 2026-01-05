/**
 * @file collectionSlice.ts
 * @description Redux Slice para gestionar la colección personal de cartas del usuario
 *
 * Maneja:
 * - Obtención de cartas en la colección del usuario
 * - Adición de cartas a la colección
 * - Eliminación de cartas de la colección
 * - Estados de carga y errores
 * - Sincronización con servidor
 *
 * @author Proyecto E09
 * @version 1.0.0
 * @requires @reduxjs/toolkit
 * @requires ../../services/apiService
 * @requires ../../types
 * @module features/collection/collectionSlice
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/apiService';
import { UserOwnedCard } from '../../types';

interface CollectionState {
  cards: UserOwnedCard[];
  loading: boolean;
  error: string | null;
}

const initialState: CollectionState = {
  cards: [],
  loading: false,
  error: null,
};

export const fetchUserCollection = createAsyncThunk(
  'collection/fetch',
  async (username: string) => await api.getUserCollection(username)
);

export const addToCollection = createAsyncThunk(
  'collection/add',
  async ({ userId, cardId }: { userId: string; cardId: string }) => {
    const success = await api.addToCollection(userId, cardId);
    if (success) return cardId;
    throw new Error('Error al añadir carta');
  }
);

export const removeFromCollection = createAsyncThunk(
  'collection/remove',
  async ({ userId, cardId }: { userId: string; cardId: string }) => {
    const success = await api.removeFromCollection(userId, cardId);
    if (success) return cardId;
    throw new Error('Error al eliminar carta');
  }
);

const collectionSlice = createSlice({
  name: 'collection',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserCollection.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserCollection.fulfilled, (state, action) => {
        state.loading = false;
        state.cards = action.payload;
      })
      .addCase(fetchUserCollection.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Error al cargar colección';
      })
      .addCase(removeFromCollection.fulfilled, (state, action) => {
        state.cards = state.cards.filter((c) => c.id !== action.payload);
      });
  },
});

export default collectionSlice.reducer;
