/**
 * @file Notification.ts
 * @description Modelo de Notificación del Sistema para Usuarios
 *
 * Almacena todas las notificaciones que reciben los usuarios:
 * - Solicitudes de intercambio (trades)
 * - Mensajes privados (chat)
 * - Solicitudes de amistad
 * - Alertas del sistema
 * - Eventos en tiempo real
 *
 * Características:
 * - Clasificación por tipo para filtrado y gestión
 * - Marca de leído/no leído
 * - Datos contextuales (relatedUserId, relatedItemId)
 * - Timestamps para ordenamiento temporal
 * - Enrutamiento automático según tipo
 *
 * Tipos de notificación:
 * - trade: Propuesta o actualización de intercambio
 * - message: Nuevo mensaje privado
 * - friendRequest: Solicitud de amistad
 * - system: Eventos del servidor
 *
 * Integración:
 * - Se crean automáticamente en eventos de trading/chat
 * - Se envían en tiempo real via Socket.io
 * - Se pueden recuperar en UI para feed de notificaciones
 *
 * @author Proyecto E09
 * @version 1.0.0
 * @requires mongoose
 * @module server/models/Notification
 * @see User
 */

import mongoose from 'mongoose';

/**
 * Esquema de Notificación
 *
 * @typedef {Object} Notification
 * @property {ObjectId} userId - ID del usuario destinatario
 * @property {string} type - Tipo (trade, message, friendRequest, system)
 * @property {string} title - Título de la notificación
 * @property {string} message - Contenido de la notificación
 * @property {boolean} isRead - Si ha sido leída
 * @property {ObjectId} relatedId - ID de la entidad relacionada (Trade, Message, etc)
 * @property {Date} createdAt - Fecha de creación
 * @property {Date} updatedAt - Fecha de última actualización
 */
const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['trade', 'message', 'friendRequest', 'system'],
      default: 'system',
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Modelo de Notificación exportado
 * @type {mongoose.Model}
 */
export const Notification = mongoose.model('Notification', notificationSchema);
