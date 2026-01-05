/**
 * @file UserCard.ts
 * @description Modelo de Carta del Usuario - Colección personal del jugador
 *
 * Representa una instancia específica de una carta en posesión de un usuario.
 * Cada UserCard mapea a un usuario y a una carta base, incluyendo información
 * específica de su copia personal:
 * - Condición física (Mint, Near Mint, Excellent, Good, Poor)
 * - Estado de disponibilidad (en venta, tradeable)
 * - Anotaciones personales
 * - Historial de cambios
 *
 * Relaciones:
 * - Muchas UserCard → Un Usuario (User)
 * - Muchas UserCard → Una Carta (Card)
 * - Referencia a Card base para información de título, tipo, etc
 *
 * Almacenamiento:
 * - Colección: 'usercards'
 * - Índices: userId, cardId, condition para búsquedas eficientes
 *
 * @author Proyecto E09
 * @version 1.0.0
 * @requires mongoose
 * @module server/models/UserCard
 * @see User
 * @see Card
 */

import mongoose from 'mongoose';

/**
 * Esquema de Carta del Usuario
 *
 * @typedef {Object} UserCard
 * @property {ObjectId} userId - ID del propietario
 * @property {ObjectId} cardId - Referencia a la carta
 * @property {string} pokemonTcgId - ID TCG de la carta
 * @property {string} condition - Condición (Mint, Near Mint, Excellent, Good, Poor)
 * @property {boolean} isPublic - Visible en el perfil público
 * @property {boolean} isFavorite - Marcada como favorita
 * @property {Date} acquisitionDate - Fecha de adquisición
 * @property {string} notes - Notas personales del usuario
 * @property {number} quantity - Cantidad de copias
 * @property {number} estimatedValue - Valor estimado
 * @property {boolean} forTrade - Disponible para intercambio
 * @property {string} collectionType - Tipo (collection o wishlist)
 * @property {Date} createdAt - Fecha de creación
 * @property {Date} updatedAt - Fecha de última actualización
 */
const userCardSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    cardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Card',
      required: true,
    },
    pokemonTcgId: {
      type: String,
      required: true,
    },
    condition: {
      type: String,
      enum: ['Mint', 'Near Mint', 'Excellent', 'Good', 'Poor'],
      default: 'Near Mint',
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
    acquisitionDate: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },
    estimatedValue: {
      type: Number,
    },
    forTrade: {
      type: Boolean,
      default: false,
    },
    collectionType: {
      type: String,
      enum: ['collection', 'wishlist'],
      default: 'collection',
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Índices para optimizar consultas frecuentes
 */
userCardSchema.index({ userId: 1, cardId: 1 });
userCardSchema.index({ userId: 1, isPublic: 1 });
userCardSchema.index({ userId: 1, collectionType: 1 });

/**
 * Modelo de Carta del Usuario exportado
 * @type {mongoose.Model}
 */
export const UserCard = mongoose.model('UserCard', userCardSchema);
