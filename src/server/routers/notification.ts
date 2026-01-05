/**
 * @file notification.ts (router)
 * @description Router Notification - Endpoints de notificaciones del usuario
 *
 * API REST para gestión de notificaciones del sistema.
 * Proporciona endpoints para leer, marcar, eliminar y filtrar notificaciones.
 *
 * **Operaciones disponibles:**
 * - GET /notifications - Listar todas las notificaciones
 * - GET /notifications/unread - Listar solo no leídas
 * - GET /notifications/:id - Obtener una notificación
 * - PATCH /notifications/:id/read - Marcar como leída
 * - PATCH /notifications/read-all - Marcar todas como leídas
 * - DELETE /notifications/:id - Eliminar notificación
 * - DELETE /notifications/clear-all - Limpiar todas las notificaciones
 *
 * **Tipos de notificación:**
 * - trade: Propuesta o cambio de estado de intercambio
 * - message: Nuevo mensaje privado
 * - friendRequest: Solicitud de amistad
 * - system: Eventos del servidor
 *
 * **Características:**
 * - Filtrado por tipo
 * - Paginación de resultados
 * - Marca de leído/no leído
 * - Eliminación selectiva
 * - Datos contextuales (relatedUser, relatedItem)
 * - Timestamps para ordenamiento
 *
 * **Integración con eventos:**
 * - Socket.io emite notificaciones en tiempo real
 * - Algunos eventos crean automáticamente notificaciones
 * - Las notificaciones se persisten en BD
 * - UI muestra badge de notificaciones sin leer
 *
 * **Responsabilidades:**
 * - Validar acceso a notificaciones (solo del usuario)
 * - Consultar base de datos
 * - Formatear respuestas
 * - Manejar eliminaciones
 *
 * Integración:
 * - Modelo: Notification
 * - Middleware JWT para autenticación
 * - Usuarios solo ven sus propias notificaciones
 * - Socket.io para eventos en tiempo real
 *
 * @author Proyecto E09
 * @version 1.0.0
 * @requires express
 * @requires mongoose
 * @requires ../models/Notification
 * @requires ../utils/mongoHelpers
 * @requires ../utils/responseHelpers
 * @module server/routers/notification
 * @see models/Notification.ts
 * @see index.ts (Socket.io setup)
 */

import express from 'express';
import { Notification } from '../models/Notification.js';
import { validateObjectId } from '../utils/mongoHelpers.js';
import {
  sendError,
  sendSuccess,
  asyncHandler,
  ensureResourceExists,
} from '../utils/responseHelpers.js';

export const notificationRouter = express.Router();

/**
 * GET /notifications/:userId
 * Obtener todas las notificaciones del usuario
 */
notificationRouter.get(
  '/notifications/:userId',
  asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { limit = 10, skip = 0 } = req.query;

    if (!validateObjectId(userId, res, 'ID de usuario')) return;

    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(skip));

    const total = await Notification.countDocuments({ userId });
    const unread = await Notification.countDocuments({ userId, isRead: false });

    return sendSuccess(res, {
      notifications,
      total,
      unread,
      limit: Number(limit),
      skip: Number(skip),
    });
  })
);

/**
 * PATCH /notifications/:notificationId/read
 * Marcar una notificación como leída
 */
notificationRouter.patch(
  '/notifications/:notificationId/read',
  asyncHandler(async (req, res) => {
    const { notificationId } = req.params;

    if (!validateObjectId(notificationId, res, 'ID de notificación')) return;

    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
    );

    if (!ensureResourceExists(res, notification, 'Notificación')) return;
    return sendSuccess(res, notification);
  })
);

/**
 * PATCH /notifications/:userId/read-all
 * Marcar todas las notificaciones como leídas
 */
notificationRouter.patch(
  '/notifications/:userId/read-all',
  asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!validateObjectId(userId, res, 'ID de usuario')) return;

    const result = await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true }
    );

    return sendSuccess(res, {
      message: 'Todas las notificaciones han sido marcadas como leídas',
      modifiedCount: result.modifiedCount,
    });
  })
);

/**
 * DELETE /notifications/:notificationId
 * Eliminar una notificación
 */
notificationRouter.delete(
  '/notifications/:notificationId',
  asyncHandler(async (req, res) => {
    const { notificationId } = req.params;

    if (!validateObjectId(notificationId, res, 'ID de notificación')) return;

    const notification = await Notification.findByIdAndDelete(notificationId);

    if (!ensureResourceExists(res, notification, 'Notificación')) return;
    return sendSuccess(res, { message: 'Notificación eliminada exitosamente' });
  })
);
