/**
 * @file FriendTrade.ts
 * @description Modelo de FriendTrade - Salas de trading privadas entre amigos
 *
 * Gestiona invitaciones y sesiones de trading privado entre usuarios amigos.
 * Similar a Trade, pero:
 * - Requiere relación de amistad previa
 * - Ocurre en "salas" privadas
 * - Comunicación en tiempo real vía Socket.io
 * - Posibilidad de chat paralelo durante el trading
 *
 * Estados:
 * - PENDING: Invitación enviada, esperando aceptación
 * - ACCEPTED: Amistad aceptó la invitación
 * - ACTIVE: Trading en progreso
 * - COMPLETED: Trading completado
 * - REJECTED: Amistad rechazó la invitación
 * - CANCELLED: Cancelado durante el trading
 *
 * Características:
 * - Código de sala único para identificar la sesión
 * - Cartas propuestas por cada participante
 * - Socket.io room para comunicación en tiempo real
 * - Integración con sistema de notificaciones
 * - Historial de cambios
 *
 * Flujo:
 * 1. Usuario A invita a amigo Usuario B
 * 2. Usuario B acepta → se crea sala
 * 3. Ambos añaden cartas a intercambiar
 * 4. Se confirman mutuamente → se completa
 *
 * @author Proyecto E09
 * @version 1.0.0
 * @requires mongoose
 * @module server/models/FriendTrade
 * @see User
 * @see Trade
 */

import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * Esquema de Invitación de Sala de Trading entre Amigos
 *
 * @typedef {Object} FriendTradeRoomInvite
 * @property {ObjectId} from - ID del usuario que invita
 * @property {ObjectId} to - ID del usuario invitado
 * @property {string} status - Estado (pending, accepted, rejected, cancelled, completed)
 * @property {string} privateRoomCode - Código único de la sala privada
 * @property {ObjectId} tradeId - ID del Trade asociado
 * @property {Date} createdAt - Fecha de creación
 * @property {Date} completedAt - Fecha de finalización
 * @property {Date} updatedAt - Fecha de última actualización
 */
const friendTradeRoomInviteSchema = new Schema(
  {
    from: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    to: { type: Schema.Types.ObjectId, ref: 'User', required: true },

    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'cancelled', 'completed'],
      default: 'pending',
    },

    privateRoomCode: {
      type: String,
      default: null,
    },

    tradeId: {
      type: Schema.Types.ObjectId,
      ref: 'Trade',
      default: null,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Modelo de Invitación de Sala de Trading entre Amigos exportado
 * @type {mongoose.Model}
 */
export const FriendTradeRoomInvite = mongoose.model(
  'FriendTradeRoomInvite',
  friendTradeRoomInviteSchema
);
