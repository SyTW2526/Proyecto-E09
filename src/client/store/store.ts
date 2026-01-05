/**
 * @file store.ts
 * @description Configuración centralizada del store Redux
 *
 * Gestiona el estado global de:
 * - Usuarios (autenticación y datos de perfil)
 * - Cartas (búsqueda, cartas destacadas)
 * - Colección personal del usuario
 * - Trading y solicitudes comerciales
 * - Lista de deseos (wishlist)
 * - Notificaciones en tiempo real
 * - Preferencias de usuario (idioma, tema, etc)
 *
 * Utiliza Redux Toolkit con redux-persist para persistencia en localStorage.
 *
 * @author Proyecto E09
 * @version 1.0.0
 * @requires @reduxjs/toolkit
 * @requires redux-persist
 * @requires react-redux
 * @module store
 * @see {@link RootState|RootState} para el tipo del estado global
 * @see {@link AppDispatch|AppDispatch} para el tipo del dispatch
 */

import { configureStore } from '@reduxjs/toolkit';
import cardsReducer from '../features/cards/cardsSlice';
import collectionReducer from '../features/collection/collectionSlice';
import tradesReducer from '../features/trades/tradesSlice';
import usersReducer from '../features/users/usersSlice';
import wishlistReducer from '../features/whislist/whislistSlice';
import notificationsReducer from '../features/notifications/notificationsSlice';
import preferencesReducer from '../features/preferences/preferencesSlice';

/**
 * Store de Redux
 * Contiene todos los reducers del estado global
 * @type {ReturnType<typeof configureStore>}
 */
export const store = configureStore({
  /**
   * Reducers del store
   * Cada uno maneja una parte del estado global
   */
  reducer: {
    users: usersReducer,
    cards: cardsReducer,
    collection: collectionReducer,
    trades: tradesReducer,
    wishlist: wishlistReducer,
    notifications: notificationsReducer,
    preferences: preferencesReducer,
  },
});

/**
 * Tipo para acceder al estado global completo
 * @type {ReturnType<typeof store.getState>}
 */
export type RootState = ReturnType<typeof store.getState>;

/**
 * Tipo para el dispatch de acciones
 * @type {typeof store.dispatch}
 */
export type AppDispatch = typeof store.dispatch;
