/**
 * @file Chat.ts
 * @description Modelo de Chat - Mensajes privados entre usuarios
 *
 * Almacena mensajes directos entre dos usuarios con características:
 * - Relación bidireccional (de usuario a usuario)
 * - Contenido de texto plano
 * - Timestamps de creación y lectura
 * - Expiración automática (TTL Index de 3 días)
 * - Indexación para búsquedas rápidas por usuarios
 *
 * Características:
 * - Mensajes privados punto-a-punto
 * - Se borra automáticamente después de 3 días (TTL)
 * - Marca de leído (si se implementa en frontend)
 * - Utiliza Socket.io para entregas en tiempo real
 * - Sincronización con notificaciones
 *
 * Flujo:
 * 1. Usuario A envía mensaje a Usuario B vía Socket.io
 * 2. Se crea documento Chat
 * 3. Usuario B recibe vía Socket notificación
 * 4. Se elimina automáticamente después de TTL
 *
 * @author Proyecto E09
 * @version 1.0.0
 * @requires mongoose
 * @module server/models/Chat
 * @see User
 * @see Notification
 */

import mongoose from 'mongoose';

/**
 * Esquema de Mensaje de Chat
 *
 * @typedef {Object} ChatMessage
 * @property {ObjectId} from - ID del usuario remitente
 * @property {ObjectId} to - ID del usuario destinatario
 * @property {string} text - Contenido del mensaje
 * @property {Date} createdAt - Fecha de creación (se borra después de 3 días)
 */
const chatMessageSchema = new mongoose.Schema({
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  text: {
    type: String,
    required: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: '3d',
  },
});

/**
 * Modelo de Mensaje de Chat exportado
 * @type {mongoose.Model}
 */
export const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);
