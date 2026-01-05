/**
 * @file TradeRequest.ts
 * @description Modelo de PropuestaComercial - Solicitud de intercambio pendiente
 *
 * Representa una propuesta de trade que aún no ha sido aceptada. Diferente
 * de Trade completado, TradeRequest es una solicitud unidireccional:
 * - Un usuario (from) propone un intercambio
 * - A otro usuario (to)
 * - Con cartas específicas ofertadas
 * - Esperando aceptación o rechazo
 *
 * Caracteriza lo que se ofrece y lo que se solicita:
 * - Cartas ofrecidas por el remitente
 * - Cartas solicitadas del receptor
 * - Información de preview (nombre, imagen para UI)
 * - Timestamps y estado
 *
 * Flujo:
 * 1. Usuario A crea TradeRequest a Usuario B
 * 2. Usuario B lo revisa (puede aceptar → crea Trade, o rechazar → elimina)
 * 3. Si se acepta → se crea Trade y TradeRequest se finaliza
 *
 * @author Proyecto E09
 * @version 1.0.0
 * @requires mongoose
 * @module server/models/TradeRequest
 * @see Trade
 * @see User
 */

import mongoose from 'mongoose';

const offeredCardSchema = new mongoose.Schema(
  {
    pokemonTcgId: { type: String, default: '' },
    cardName: { type: String, default: '' },
    cardImage: { type: String, default: '' },
  },
  { _id: false }
);

const tradeRequestSchema = new mongoose.Schema(
  {
    from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    pokemonTcgId: { type: String, default: null },
    requestedPokemonTcgId: { type: String, default: null },

    cardName: { type: String, default: '' },
    cardImage: { type: String, default: '' },
    note: { type: String, default: '' },

    offeredCard: { type: offeredCardSchema, default: null },
    offeredPrice: { type: Number, default: null },
    targetPrice: { type: Number, default: null },

    offeredUserCardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserCard',
      default: null,
    },
    targetUserCardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserCard',
      default: null,
    },

    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'cancelled', 'completed'],
      default: 'pending',
    },

    isManual: { type: Boolean, default: false },

    tradeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trade',
      default: null,
    },

    finishedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

tradeRequestSchema.index(
  { finishedAt: 1 },
  {
    expireAfterSeconds: 2 * 24 * 60 * 60,
    partialFilterExpression: { finishedAt: { $ne: null } },
  }
);

export const TradeRequest = mongoose.model('TradeRequest', tradeRequestSchema);
