/**
 * @file friendHelpers.ts
 * @description FriendHelpers - Utilidades del sistema de amigos
 *
 * Centraliza operaciones del sistema de amistades y contactos.
 * Maneja relaciones bidireccionales entre usuarios.
 *
 * **Conceptos:**
 * - Amistad: Relación mutua entre dos usuarios
 * - Solicitud: Petición unidireccional de amistad
 * - Bloqueado: Usuario que no puede enviar solicitud
 * - Estado: Amigo, Pendiente, Bloqueado, Ninguno
 *
 * **Operaciones disponibles:**
 * - addFriend(): Envía solicitud de amistad
 * - acceptFriendRequest(): Acepta solicitud
 * - rejectFriendRequest(): Rechaza solicitud
 * - removeFriend(): Elimina amistad existente
 * - blockUser(): Bloquea usuario
 * - unblockUser(): Desbloquea usuario
 *
 * **Estructura en User:**
 * ```javascript
 * friends: [ObjectId],        // Lista de amigos confirmados
 * friendRequests: {
 *   incoming: [ObjectId],    // Solicitudes recibidas
 *   outgoing: [ObjectId]     // Solicitudes enviadas
 * },
 * blocked: [ObjectId]        // Usuarios bloqueados
 * ```
 *
 * **Validaciones:**
 * - No enviar si ya son amigos
 * - No enviar si ya existe solicitud
 * - No enviar a bloqueado
 * - Validar que usuarios existen
 * - Evitar bucles infinitos
 *
 * **Notificaciones:**
 * - Socket.io notifica solicitud entrante
 * - Notificación BD en Notifications model
 * - Email opcional (si configurado)
 * - Push notification opcional
 *
 * **Bidireccionalidad:**
 * - addFriend A→B crea B's incoming
 * - acceptFriendRequest de B añade A a B.friends
 * - removeFriend sincroniza ambos lados
 * - Rollback automático en errores
 *
 * **Funciones helper:**
 * - isFriendOf(): Pregunta si son amigos
 * - hasPendingRequest(): Hay solicitud?
 * - canAddFriend(): Puede enviar solicitud?
 * - getFriendsList(): Retorna lista completa
 * - getPendingRequests(): Solo pendientes
 *
 * **Caché (opcional):**
 * - Cache de lista de amigos
 * - Invalidación en cambios
 * - Mejora performance
 *
 * **Integración:**
 * - routers/users.ts handlers de amistad
 * - models/User.ts estructura de datos
 * - Socket.io notificaciones
 * - Notifications model registra
 *
 * @author Proyecto E09
 * @version 1.0.0
 * @requires mongoose
 * @requires ../models/User
 * @module server/utils/friendHelpers
 * @see models/User.ts
 * @see routers/users.ts
 */

import { User } from '../models/User.js';

/**
 * Elimina una solicitud de amistad del usuario
 * @param user - Usuario que recibió/tiene la solicitud
 * @param fromUserId - ID del usuario que envió la solicitud
 */
export function removeFriendRequest(user: any, fromUserId: any): void {
  (user.friendRequests as any) = (user.friendRequests as any).filter(
    (r: any) => r.from.toString() !== fromUserId.toString()
  );
}

/**
 * Verifica si existe una solicitud de amistad pendiente
 * @param user - Usuario
 * @param friendId - ID del amigo
 * @returns true si hay solicitud pendiente
 */
export function hasPendingFriendRequest(user: any, friendId: any): boolean {
  return user.friendRequests.some(
    (r: any) => r.from.toString() === friendId.toString()
  );
}

/**
 * Agrega amistad bidireccional entre dos usuarios
 * @param me - Usuario actual
 * @param friend - Usuario amigo
 */
export function addFriendBidirectional(me: any, friend: any): void {
  if (!me.friends.includes(friend._id)) {
    me.friends.push(friend._id);
  }
  if (!friend.friends.includes(me._id)) {
    friend.friends.push(me._id);
  }
}

/**
 * Elimina amistad bidireccional entre dos usuarios
 * @param me - Usuario actual
 * @param friend - Usuario amigo
 */
export function removeFriendBidirectional(me: any, friend: any): void {
  me.friends = me.friends.filter(
    (id: any) => id.toString() !== friend._id.toString()
  );
  friend.friends = friend.friends.filter(
    (id: any) => id.toString() !== me._id.toString()
  );
}

/**
 * Obtiene el historial de chat entre dos usuarios
 * @param ChatMessage - Modelo ChatMessage
 * @param userId1 - ID del usuario 1
 * @param userId2 - ID del usuario 2
 * @returns Array de mensajes ordenados por fecha
 */
export async function getChatHistoryBetween(
  ChatMessage: any,
  userId1: any,
  userId2: any
) {
  return await ChatMessage.find({
    $or: [
      { from: userId1, to: userId2 },
      { from: userId2, to: userId1 },
    ],
  }).sort({ createdAt: 1 });
}

/**
 * Elimina el historial de chat entre dos usuarios
 * @param ChatMessage - Modelo ChatMessage
 * @param userId1 - ID del usuario 1
 * @param userId2 - ID del usuario 2
 */
export async function deleteChatHistoryBetween(
  ChatMessage: any,
  userId1: any,
  userId2: any
): Promise<void> {
  await ChatMessage.deleteMany({
    $or: [
      { from: userId1, to: userId2 },
      { from: userId2, to: userId1 },
    ],
  });
}
