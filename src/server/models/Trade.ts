/**
 * @file Trade.ts
 * @description Modelo de Trade - Transacción completa entre dos usuarios
 *
 * Representa un intercambio de cartas completado o en progreso entre dos
 * jugadores. Cada Trade incluye:
 * - Participantes (Usuario ofertante, Usuario receptor)
 * - Cartas ofertadas por cada lado (lista de UserCard)
 * - Estado (pendiente, aceptado, rechazado, completado, cancelado)
 * - Timestamps (creación, actualización, completado)
 * - Validación y confirmación de ambos usuarios
 *
 * Estados del Trade:
 * - PENDING: Esperando respuesta del receptor
 * - ACCEPTED: Ambos usuarios aceptaron
 * - REJECTED: Rechazado
 * - COMPLETED: Intercambio completado
 * - CANCELLED: Cancelado por uno de los usuarios
 *
 * Características:
 * - Sistema de confirmación bilateral
 * - Historial de cambios de estado
 * - Estimación de valor para validar equidad
 * - Integración con Socket.io para notificaciones en tiempo real
 *
 * @author Proyecto E09
 * @version 1.0.0
 * @requires mongoose
 * @requires nanoid
 * @module server/models/Trade
 * @see User
 * @see UserCard
 */

import mongoose from 'mongoose';
import { nanoid } from 'nanoid';

/**
 * Esquema de carta en una transacción
 * @typedef {Object} TradeSideCard
 * @property {ObjectId} userCardId - Referencia a UserCard
 * @property {ObjectId} cardId - Referencia a Card
 * @property {number} estimatedValue - Valor estimado de la carta
 */
const tradeSideCardSchema = new mongoose.Schema(
  {
    userCardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserCard',
    },
    cardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Card',
    },
    estimatedValue: {
      type: Number,
    },
  },
  { _id: false }
);

/**
 * Esquema principal de Trade
 * Controla el flujo completo de una transacción de trading
 *
 * @typedef {Object} Trade
 * @property {ObjectId} initiatorUserId - Usuario que inicia el trade
 * @property {ObjectId} receiverUserId - Usuario que recibe el trade
 * @property {string} status - Estado del trade (pending, accepted, rejected, completed, cancelled)
 * @property {string} tradeType - Tipo (public o private)
 * @property {string} privateRoomCode - Código único para salas privadas
 * @property {ObjectId} requestId - ID de la solicitud de trade relacionada
 * @property {string} requestedPokemonTcgId - TCG ID de la carta solicitada
 * @property {Array<TradeSideCard>} initiatorCards - Cartas ofrecidas por el iniciador
 * @property {Array<TradeSideCard>} receiverCards - Cartas ofrecidas por el receptor
 * @property {boolean} initiatorAccepted - Confirmación del iniciador
 * @property {boolean} receiverAccepted - Confirmación del receptor
 * @property {number} initiatorTotalValue - Valor total de cartas del iniciador
 * @property {number} receiverTotalValue - Valor total de cartas del receptor
 * @property {number} valueDifferencePercentage - Diferencia de valor en porcentaje
 * @property {Array} messages - Mensajes intercambiados durante el trade
 * @property {Date} completedAt - Fecha de finalización
 * @property {Date} createdAt - Fecha de creación
 * @property {Date} updatedAt - Fecha de última actualización
 */
const tradeSchema = new mongoose.Schema(
  {
    initiatorUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiverUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
      default: 'pending',
    },

    tradeType: {
      type: String,
      enum: ['public', 'private'],
      default: 'public',
    },
    privateRoomCode: {
      type: String,
    },

    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TradeRequest',
      default: null,
    },

    requestedPokemonTcgId: {
      type: String,
      default: null,
    },

    initiatorCards: [tradeSideCardSchema],
    receiverCards: [tradeSideCardSchema],

    initiatorCardUserCardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserCard',
      default: null,
    },
    receiverCardUserCardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserCard',
      default: null,
    },
    initiatorAccepted: {
      type: Boolean,
      default: false,
    },
    receiverAccepted: {
      type: Boolean,
      default: false,
    },

    initiatorTotalValue: {
      type: Number,
    },
    receiverTotalValue: {
      type: Number,
    },
    valueDifferencePercentage: {
      type: Number,
    },

    messages: [
      {
        senderId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        message: {
          type: String,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Índices para optimizar consultas frecuentes
 */
tradeSchema.index({ privateRoomCode: 1 });
tradeSchema.index({ initiatorUserId: 1 });
tradeSchema.index({ receiverUserId: 1 });
tradeSchema.index({ status: 1 });

/**
 * Middleware pre-save
 * Genera código de sala privada y valida diferencias de valor en trades públicos
 */
tradeSchema.pre('save', function (next) {
  const trade: any = this;

  if (trade.tradeType === 'private' && !trade.privateRoomCode) {
    trade.privateRoomCode = nanoid(10);
  }

  if (
    trade.tradeType === 'public' &&
    typeof trade.initiatorTotalValue === 'number' &&
    typeof trade.receiverTotalValue === 'number'
  ) {
    const diff = Math.abs(trade.initiatorTotalValue - trade.receiverTotalValue);
    const maxValue = Math.max(
      trade.initiatorTotalValue,
      trade.receiverTotalValue
    );

    trade.valueDifferencePercentage =
      maxValue > 0 ? (diff / maxValue) * 100 : 0;

    if (trade.valueDifferencePercentage > 10) {
      return next(
        new Error(
          'La diferencia de valor no puede superar el 10% en intercambios públicos'
        )
      );
    }
  }

  next();
});

/**
 * Modelo de Trade exportado
 * @type {mongoose.Model}
 */
export const Trade = mongoose.model('Trade', tradeSchema);
