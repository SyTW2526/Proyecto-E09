/**
 * @file PackOpen.ts
 * @description Modelo de PackOpen - Registro de aperturas de packs
 *
 * Registra cada instancia cuando un usuario abre un pack de cartas.
 * Utilizado para:
 * - Rate limiting: Control de cuántos packs puede abrir un usuario
 * - Sistema de tokens: Consumo de pack tokens
 * - Analytics: Estadísticas de actividad
 * - Auditoría: Historial de aperturas
 *
 * Características:
 * - Una entrada por cada pack abierto
 * - Referencia al usuario
 * - Timestamp de creación
 * - Índice por userId y fecha para búsquedas eficientes
 * - TTL Index para limpiar registros antiguos (opcional)
 *
 * Relación:
 * - Muchas PackOpen → Un Usuario (User)
 * - Un PackOpen genera múltiples cartas (vía random selection)
 *
 * Integración:
 * - Se crea cuando usuario consume un token
 * - packHelpers.ts usa este modelo para rate limiting
 * - Datos disponibles en estadísticas y perfil del usuario
 *
 * @author Proyecto E09
 * @version 1.0.0
 * @requires mongoose
 * @module server/models/PackOpen
 * @see User
 * @see packHelpers.ts
 */

import mongoose from 'mongoose';

/**
 * Esquema de Apertura de Pack
 *
 * @typedef {Object} PackOpen
 * @property {ObjectId} userId - ID del usuario que abre el pack
 * @property {Date} createdAt - Fecha/hora de apertura del pack
 * @property {Date} updatedAt - Fecha de última actualización
 */
const packOpenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Índice para consultas optimizadas por usuario y fecha
 */
packOpenSchema.index({ userId: 1, createdAt: 1 });

/**
 * Modelo de Apertura de Pack exportado
 * @type {mongoose.Model}
 */
export const PackOpen = mongoose.model('PackOpen', packOpenSchema);
