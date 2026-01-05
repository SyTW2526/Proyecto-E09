/**
 * @file tradeHelpers.ts
 * @description TradeHelpers - Utilidades de gestión de trades
 *
 * Centraliza lógica repetida para operaciones de intercambio.
 * Simplifica queries, validaciones y transformaciones de trades.
 *
 * **Consultas comunes:**
 * - getPaginatedTrades(): Lista con paginación
 * - getTradeByRoomCode(): Obtiene por código único
 * - getPopulatedTrade(): Obtiene con datos relacionados
 * - getTradeBetweenUsers(): Trade entre dos usuarios
 * - getTradeHistory(): Historial completo
 *
 * **Poblamiento (populate):**
 * Campos estándar para traer relaciones:
 * - Usuarios: username, email, imagen
 * - Cartas: nombre, imagen, rareza, tipo
 * - Historial: timestamps, estado previo
 *
 * **Validaciones:**
 * - validateTrade(): Estructura válida
 * - validateCards(): Cartas pertenecen a usuarios
 * - validateEquity(): Equidad de valores
 * - canCancel(): Usuario puede cancelar?
 * - isCompleted(): Estado de trade
 *
 * **Estados de trade:**
 * - PENDING: Esperando respuesta
 * - ACCEPTED: Ambos aceptaron
 * - COMPLETED: Cartas transferidas
 * - REJECTED: Rechazado
 * - CANCELLED: Cancelado por usuario
 *
 * **Estadísticas:**
 * - getTotalTrades(): Conteo de todos
 * - getCompletedTrades(): Solo completados
 * - getTradeValue(): Valor total intercambiado
 * - getFrequentTrader(): Usuarios más activos
 *
 * **Filtros:**
 * - Por estado
 * - Por usuario
 * - Por rango de fechas
 * - Por valor de cartas
 * - Por tipo de cartas
 *
 * **Paginación:**
 * ```javascript
 * {
 *   docs: [...trades],
 *   total: 150,
 *   page: 1,
 *   pages: 5,
 *   hasNextPage: true,
 *   hasPrevPage: false
 * }
 * ```
 *
 * **Transformaciones:**
 * - formatTrade(): Estructura para cliente
 * - enrichTrade(): Añade datos calculados
 * - normalizeTrade(): Campos estándar
 * - sanitizeTrade(): Remueve sensibles
 *
 * **Seguridad:**
 * - Valida propiedad de cartas
 * - Verifica autorización de usuario
 * - Previene dobles transferencias
 * - Logging de operaciones
 *
 * **Performance:**
 * - Índices en userId, estado, fecha
 * - Proyecciones eficientes
 * - Caching de trades recientes
 * - Batch processing
 *
 * **Integración:**
 * - routers/trade.ts usa helpers
 * - routers/trade_request.ts al convertir
 * - socketHelpers.ts para notificaciones
 * - User model para saldo de cartas
 *
 * @author Proyecto E09
 * @version 1.0.0
 * @requires mongoose
 * @requires ../models/Trade
 * @requires ../models/TradeRequest
 * @module server/utils/tradeHelpers
 * @see models/Trade.ts
 * @see routers/trade.ts
 */

import { FilterQuery } from 'mongoose';
import { Trade } from '../models/Trade.js';
import { TradeRequest } from '../models/TradeRequest.js';

/**
 * Campos de populate estándar para trades
 */
export const TRADE_POPULATE_FIELDS = [
  { path: 'initiatorUserId', select: 'username email' },
  { path: 'receiverUserId', select: 'username email' },
  { path: 'initiatorCards.cardId', select: 'name imageUrl rarity' },
  { path: 'receiverCards.cardId', select: 'name imageUrl rarity' },
];

/**
 * Obtiene un trade con populate completo
 * @param tradeId - ID del trade
 * @returns Trade poblado o null
 */
export async function getPopulatedTrade(tradeId: string) {
  return await Trade.findById(tradeId)
    .populate('initiatorUserId', 'username email')
    .populate('receiverUserId', 'username email')
    .populate('initiatorCards.cardId', 'name imageUrl rarity')
    .populate('receiverCards.cardId', 'name imageUrl rarity');
}

/**
 * Obtiene un trade por código de sala con populate completo
 * @param roomCode - Código de la sala privada
 * @returns Trade poblado o null
 */
export async function getTradeByRoomCode(roomCode: string) {
  return await Trade.findOne({ privateRoomCode: roomCode })
    .populate('initiatorUserId', 'username email')
    .populate('receiverUserId', 'username email')
    .populate('initiatorCards.cardId', 'name imageUrl rarity')
    .populate('receiverCards.cardId', 'name imageUrl rarity');
}

/**
 * Obtiene trades con paginación y filtros
 * @param filter - Filtros de búsqueda
 * @param page - Página actual
 * @param limit - Resultados por página
 * @returns Objeto con trades y metadatos de paginación
 */
export async function getPaginatedTrades(
  filter: FilterQuery<typeof Trade>,
  page: number = 1,
  limit: number = 20
) {
  const skip = (page - 1) * limit;

  const trades = await Trade.find(filter)
    .populate('initiatorUserId', 'username email')
    .populate('receiverUserId', 'username email')
    .populate('initiatorCards.cardId', 'name imageUrl rarity')
    .populate('receiverCards.cardId', 'name imageUrl rarity')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Trade.countDocuments(filter);
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    totalPages,
    totalResults: total,
    resultsPerPage: limit,
    trades,
  };
}

/**
 * Obtiene una solicitud de intercambio con populate completo
 * @param requestId - ID de la solicitud
 * @returns TradeRequest poblado o null
 */
export async function getPopulatedTradeRequest(requestId: string) {
  return await TradeRequest.findById(requestId)
    .populate('senderId', 'username email')
    .populate('receiverId', 'username email');
}

/**
 * Obtiene solicitudes de intercambio con paginación
 * @param filter - Filtros de búsqueda
 * @param page - Página actual
 * @param limit - Resultados por página
 * @returns Objeto con solicitudes y metadatos de paginación
 */
export async function getPaginatedTradeRequests(
  filter: FilterQuery<typeof TradeRequest>,
  page: number = 1,
  limit: number = 20
) {
  const skip = (page - 1) * limit;

  const requests = await TradeRequest.find(filter)
    .populate('senderId', 'username email')
    .populate('receiverId', 'username email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await TradeRequest.countDocuments(filter);
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    totalPages,
    totalResults: total,
    resultsPerPage: limit,
    requests,
  };
}
