/**
 * @file socketHelpers.ts
 * @description SocketHelpers - Utilidades de emisión Socket.io
 *
 * Centraliza la lógica de envío de eventos en tiempo real mediante Socket.io.
 * Proporciona funciones helper para emitir eventos a usuarios, salas, etc.
 *
 * **Conceptos Socket.io:**
 * - Room: Grupo de conexiones (ej: "user:123", "trade:456")
 * - Event: Mensaje nombrado con datos (ej: "notification", "trade:update")
 * - Emit: Envío desde servidor a cliente
 * - Broadcast: Envío a todos excepto el remitente
 *
 * **Salas privadas por usuario:**
 * - Nombre: `user:{userId}`
 * - Usuario se une al conectarse
 * - Solo ese usuario recibe mensajes
 * - Usado para notificaciones personales
 *
 * **Salas de trading:**
 * - Nombre: `trade:{tradeId}`
 * - Ambos usuarios se unen
 * - Sincronización bidireccional
 * - Chat integrado en la sala
 *
 * **Funciones principales:**
 * - emitToUser(): Envía evento a usuario específico
 * - emitToRoom(): Envía a toda una sala
 * - broadcastToRoom(): Broadcast en sala (excluye remitente)
 * - emitToUsers(): Envía a múltiples usuarios
 * - emitNotification(): Helper para notificaciones
 *
 * **Tipos de eventos:**
 * - notification: Nueva notificación general
 * - trade:update: Cambio de estado en trade
 * - trade:message: Mensaje de chat en sala
 * - friend:request: Solicitud de amistad
 * - chat:message: Mensaje privado
 * - server:status: Estado del servidor
 *
 * **Estructura de datos:**
 * ```javascript
 * // Notification event
 * {
 *   type: 'trade',
 *   title: 'Trade received',
 *   message: 'Usuario X sent you a trade',
 *   relatedUserId: 'xyz',
 *   relatedItemId: 'trade123'
 * }
 * ```
 *
 * **Manejo de errores:**
 * - Valida que usuario existe
 * - Valida que room existe
 * - Fallback silencioso si usuario no conectado
 * - Logging en desarrollo
 *
 * **Integración:**
 * - Llamado desde routers (trade.ts, users.ts)
 * - Índice.ts setup Socket.io server
 * - Cliente escucha en socket listeners
 * - Sincronización con BD (persistencia)
 *
 * @author Proyecto E09
 * @version 1.0.0
 * @requires socket.io
 * @requires mongoose
 * @module server/utils/socketHelpers
 * @see index.ts
 * @see routers/trade.ts
 * @see routers/users.ts
 */

import { Types } from 'mongoose';

/**
 * Emite un evento a la sala privada de un usuario específico
 *
 * @param io - Instancia de Socket.io
 * @param userId - ID del usuario (ObjectId o string)
 * @param eventName - Nombre del evento a emitir
 * @param data - Datos a enviar con el evento
 *
 * @example
 * emitToUser(req.io, friend._id, 'notification', { message: 'Nueva solicitud' });
 */
export function emitToUser(
  io: any,
  userId: Types.ObjectId | string,
  eventName: string,
  data: any
): void {
  const userIdStr = userId.toString();
  io.to(`user:${userIdStr}`).emit(eventName, data);
}

/**
 * Emite múltiples eventos a la sala privada de un usuario
 *
 * @param io - Instancia de Socket.io
 * @param userId - ID del usuario (ObjectId o string)
 * @param events - Array de objetos { eventName, data }
 *
 * @example
 * emitMultipleToUser(req.io, friend._id, [
 *   { eventName: 'notification', data: notification },
 *   { eventName: 'friendRequestReceived', data: requestData }
 * ]);
 */
export function emitMultipleToUser(
  io: any,
  userId: Types.ObjectId | string,
  events: Array<{ eventName: string; data: any }>
): void {
  const userIdStr = userId.toString();
  const room = `user:${userIdStr}`;

  events.forEach(({ eventName, data }) => {
    io.to(room).emit(eventName, data);
  });
}
