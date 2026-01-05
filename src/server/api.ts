/**
 * @file api.ts
 * @description Configuración centralizada de la aplicación Express
 *
 * Este archivo configura la instancia de Express que es usada tanto
 * para las pruebas como para el servidor principal (index.ts).
 *
 * Configura:
 * - CORS habilitado para desarrollo (localhost:5173)
 * - Parseo de JSON y formularios URL-encoded
 * - Límite de tamaño de payload (10MB)
 * - Enrutadores de API registrados
 * - Manejo de errores centralizado
 *
 * @author Proyecto E09
 * @version 1.0.0
 * @requires express
 * @requires cors
 * @requires ./db/mongoose
 * @module server/api
 */

import express from 'express';
import cors from 'cors';
import './db/mongoose.js';

// Routers importados
import { defaultRouter } from './routers/default.js';
import { userRouter } from './routers/users.js';
import { pokemonRouter } from './routers/pokemon.js';
import { userCardRouter } from './routers/usercard.js';
import { tradeRouter } from './routers/trade.js';
import { cardRouter } from './routers/card.js';
import { syncRouter } from './routers/api.js';
import { notificationRouter } from './routers/notification.js';
import { preferencesRouter } from './routers/preferences.js';
import { tradeRequestRouter } from './routers/trade_request.js';
import { friendTradeRoomsRouter } from './routers/friend_trade.js';

/**
 * Instancia de la aplicación Express
 * Exportada para ser usada en pruebas e index.ts
 * @type {Express.Application}
 */
export const app = express();

/**
 * Configuración de CORS
 * Permite solicitudes desde localhost:5173 (Vite dev server)
 */
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

/**
 * Middleware de parseo
 * Límite de 10MB para uploads de imágenes y datos
 */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/**
 * Registro de routers de la API
 * Los routers manejan las diferentes rutas de la aplicación
 */
app.use(userRouter);
app.use(notificationRouter);
app.use(preferencesRouter);
app.use(syncRouter);
app.use(cardRouter);
app.use(tradeRouter);
app.use(tradeRequestRouter);
app.use(friendTradeRoomsRouter);
app.use(userCardRouter);
app.use(pokemonRouter);
app.use(defaultRouter);
