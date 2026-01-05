/**
 * @file preferences.ts (router)
 * @description Router Preferences - Endpoints de configuración de usuario
 *
 * API REST para gestión de preferencias y configuración del usuario.
 * Almacena opciones personales de interfaz y comportamiento.
 *
 * **Operaciones disponibles:**
 * - GET /users/:userId/preferences - Obtener todas las preferencias
 * - PATCH /users/:userId/preferences - Actualizar preferencias
 * - PATCH /users/:userId/preferences/language - Cambiar idioma
 * - PATCH /users/:userId/preferences/theme - Cambiar tema
 * - PATCH /users/:userId/preferences/notifications - Configurar notificaciones
 * - PATCH /users/:userId/preferences/privacy - Configurar privacidad
 *
 * **Campos de preferencia:**
 * - language: Idioma de interfaz (es, en, etc)
 * - darkMode: Tema oscuro activado (boolean)
 * - notifications: Notificaciones habilitadas (boolean)
 * - soundEnabled: Sonidos habilitados (boolean)
 * - emailNotifications: Notificaciones por email (boolean)
 * - privateProfile: Perfil privado (boolean)
 * - allowFriendRequests: Permitir solicitudes de amistad (boolean)
 * - tradeNotifications: Notificaciones de trades (boolean)
 *
 * **Persistencia:**
 * - Guardado en modelo User
 * - Sincronizado con sesión del cliente
 * - Persisten entre sesiones
 * - Aplicables globalmente para ese usuario
 *
 * **Respuestas:**
 * - GET: Retorna objeto con todas las preferencias
 * - PATCH: Actualiza parcialmente, retorna nuevas preferencias
 * - Validación de valores (ej: language válido)
 * - Error 404 si usuario no existe
 *
 * Integración:
 * - Modelo: User (subcampos preferences)
 * - Redux Preferences slice sincroniza en cliente
 * - Socket.io notifica cambios en tiempo real
 * - Validación de valores permitidos
 *
 * @author Proyecto E09
 * @version 1.0.0
 * @requires express
 * @requires mongoose
 * @requires ../models/User
 * @requires ../utils/mongoHelpers
 * @requires ../utils/responseHelpers
 * @module server/routers/preferences
 * @see models/User.ts
 * @see routers/users.ts
 */

import express from 'express';
import { User } from '../models/User.js';
import { validateObjectId } from '../utils/mongoHelpers.js';
import {
  sendError,
  sendSuccess,
  asyncHandler,
  ensureResourceExists,
} from '../utils/responseHelpers.js';

export const preferencesRouter = express.Router();

/**
 * GET /users/:userId/preferences
 * Obtener preferencias del usuario
 */
preferencesRouter.get(
  '/users/:userId/preferences',
  asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!validateObjectId(userId, res, 'ID de usuario')) return;

    const user = await User.findById(userId).select('settings');
    if (!ensureResourceExists(res, user, 'Usuario')) return;

    return sendSuccess(res, {
      language: user.settings?.language || 'es',
      darkMode: user.settings?.darkMode || false,
      notifications: user.settings?.notifications,
      privacy: user.settings?.privacy,
    });
  })
);

/**
 * PATCH /users/:userId/preferences
 * Actualizar preferencias del usuario
 */
preferencesRouter.patch(
  '/users/:userId/preferences',
  asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { language, darkMode, notifications, privacy } = req.body;

    if (!validateObjectId(userId, res, 'ID de usuario')) return;

    // Validar idioma
    if (language && !['es', 'en'].includes(language)) {
      return sendError(res, 'Idioma inválido. Usa "es" o "en"', 400);
    }

    const updateData: any = {};

    if (language !== undefined) updateData['settings.language'] = language;
    if (darkMode !== undefined) updateData['settings.darkMode'] = darkMode;

    if (notifications) {
      if (notifications.trades !== undefined)
        updateData['settings.notifications.trades'] = notifications.trades;
      if (notifications.messages !== undefined)
        updateData['settings.notifications.messages'] = notifications.messages;
      if (notifications.friendRequests !== undefined)
        updateData['settings.notifications.friendRequests'] =
          notifications.friendRequests;
    }

    if (privacy) {
      if (privacy.showCollection !== undefined)
        updateData['settings.privacy.showCollection'] = privacy.showCollection;
      if (privacy.showWishlist !== undefined)
        updateData['settings.privacy.showWishlist'] = privacy.showWishlist;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    ).select('settings');

    if (!ensureResourceExists(res, user, 'Usuario')) return;

    return sendSuccess(
      res,
      {
        language: user.settings?.language,
        darkMode: user.settings?.darkMode,
        notifications: user.settings?.notifications,
        privacy: user.settings?.privacy,
      },
      'Preferencias actualizadas exitosamente'
    );
  })
);
