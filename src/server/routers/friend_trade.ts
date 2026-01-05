/**
 * @file friend_trade.ts (router)
 * @description Router FriendTrade - Endpoints de salas de trading entre amigos
 *
 * API REST para gestión de salas de trading privadas entre amigos.
 * Facilita trading colaborativo en tiempo real.
 *
 * **Operaciones disponibles:**
 * - GET /friend-trade-rooms/invites - Listar invitaciones
 * - GET /friend-trade-rooms/:roomId - Obtener detalles de sala
 * - POST /friend-trade-rooms/invite - Invitar a amigo
 * - PATCH /friend-trade-rooms/:roomId/accept - Aceptar invitación
 * - PATCH /friend-trade-rooms/:roomId/reject - Rechazar invitación
 * - POST /friend-trade-rooms/:roomId/cards - Añadir cartas a intercambiar
 * - DELETE /friend-trade-rooms/:roomId/cards/:cardId - Remover carta
 * - POST /friend-trade-rooms/:roomId/confirm - Confirmar y completar
 * - DELETE /friend-trade-rooms/:roomId - Cancelar sala
 *
 * **Características especiales:**
 * - Requiere relación de amistad previa
 * - Salas privadas con código único
 * - Trading en tiempo real via Socket.io
 * - Chat paralelo durante la sala
 * - Validación de cartas disponibles
 * - Confirmación bilateral antes de completar
 *
 * **Estados de sala:**
 * - PENDING: Esperando aceptación
 * - ACTIVE: Trading en progreso
 * - COMPLETED: Intercambio finalizado
 * - REJECTED: Rechazado
 * - CANCELLED: Cancelado
 *
 * **Flujo típico:**
 * 1. Usuario A invita a amigo Usuario B
 * 2. Usuario B acepta → se crea sala ACTIVE
 * 3. Ambos usuarios añaden cartas
 * 4. Socket.io sincroniza cambios en tiempo real
 * 5. Ambos confirman → se completa Trade
 * 6. Cartas se transfieren
 *
 * **Diferencias con trade.ts:**
 * - trade.ts: Intercambios entre cualquier usuario
 * - friend_trade.ts: Solo entre amigos, en salas privadas
 * - friend_trade.ts: Más colaborativo, chat integrado
 * - friend_trade.ts: Basado en Socket.io para sincronización real
 *
 * Integración:
 * - Modelos: FriendTrade, Trade, User
 * - Middleware JWT para autenticación
 * - Socket.io para eventos en tiempo real
 * - Validación de relación de amistad
 * - Notificaciones automáticas
 *
 * @author Proyecto E09
 * @version 1.0.0
 * @requires express
 * @requires mongoose
 * @requires ../middleware/authMiddleware
 * @requires ../models/FriendTrade
 * @requires ../models/Trade
 * @requires ../utils/mongoHelpers
 * @module server/routers/friend_trade
 * @see models/FriendTrade.ts
 * @see routers/trade.ts
 */

import express, { Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest, authMiddleware } from '../middleware/authMiddleware.js';
import { User } from '../models/User.js';
import { Trade } from '../models/Trade.js';
import { FriendTradeRoomInvite } from '../models/FriendTrade.js';
import { validateObjectId } from '../utils/mongoHelpers.js';
import { sendError } from '../utils/responseHelpers.js';

export const friendTradeRoomsRouter = express.Router();

/**
 * GET /friend-trade-rooms/invites
 * Obtener invitaciones enviadas y recibidas
 */
friendTradeRoomsRouter.get(
  '/friend-trade-rooms/invites',
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const currentUserId = req.userId;
      if (!currentUserId) {
        return res.status(401).send({ error: 'No autenticado' });
      }

      const received = await FriendTradeRoomInvite.find({
        to: currentUserId,
      })
        .populate('from', 'username email profileImage')
        .sort({ createdAt: -1 });

      const sent = await FriendTradeRoomInvite.find({
        from: currentUserId,
      })
        .populate('to', 'username email profileImage')
        .sort({ createdAt: -1 });

      res.send({ received, sent });
    } catch (error: any) {
      console.error('Error cargando invitaciones:', error);
      res
        .status(500)
        .send({ error: error.message ?? 'Error cargando invitaciones' });
    }
  }
);

/**
 * POST /friend-trade-rooms/invite
 * Crear invitación a amigo
 */
friendTradeRoomsRouter.post(
  '/friend-trade-rooms/invite',
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const { friendId } = req.body as { friendId?: string };
      const currentUserId = req.userId;

      if (!currentUserId) {
        return res.status(401).send({ error: 'No autenticado' });
      }

      if (!friendId || !validateObjectId(friendId, res, 'friendId')) {
        return;
      }

      const me = await User.findById(currentUserId);
      if (!me) {
        return res.status(404).send({ error: 'Usuario actual no encontrado' });
      }

      const friend = await User.findById(friendId);
      if (!friend) {
        return res.status(404).send({ error: 'Amigo no encontrado' });
      }
      const isFriend = me.friends.some(
        (id: any) => id.toString() === friend._id.toString()
      );
      if (!isFriend) {
        return res.status(400).send({
          error: 'Sólo puedes invitar a usuarios que sean tus amigos',
        });
      }

      if (friend._id.equals(me._id)) {
        return res
          .status(400)
          .send({ error: 'No puedes invitarte a ti mismo' });
      }
      const existing = await FriendTradeRoomInvite.findOne({
        from: me._id,
        to: friend._id,
        status: 'pending',
      });

      if (existing) {
        return res.status(400).send({
          error: 'Ya tienes una invitación pendiente a este amigo',
        });
      }

      const invite = await FriendTradeRoomInvite.create({
        from: me._id,
        to: friend._id,
        status: 'pending',
        tradeId: null,
        privateRoomCode: null,
      });

      return res.status(201).send({
        message: 'Invitación enviada correctamente',
        invite,
      });
    } catch (error: any) {
      console.error('Error creando invitación de sala:', error);
      return res.status(500).send({
        error: error.message ?? 'Error creando invitación de sala',
      });
    }
  }
);

/**
 * POST /friend-trade-rooms/invites/:id/accept
 * Aceptar invitación
 */
friendTradeRoomsRouter.post(
  '/friend-trade-rooms/invites/:id/accept',
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const currentUserId = req.userId;

      const invite = await FriendTradeRoomInvite.findById(id);
      if (!invite) {
        return res.status(404).send({ error: 'Invitación no encontrada' });
      }

      if (invite.to.toString() !== currentUserId?.toString()) {
        return res
          .status(403)
          .send({ error: 'No puedes aceptar esta invitación' });
      }

      if (invite.status !== 'pending') {
        return res
          .status(400)
          .send({ error: 'La invitación ya no está pendiente' });
      }
      const trade = new Trade({
        initiatorUserId: invite.from,
        receiverUserId: invite.to,
        initiatorCards: [],
        receiverCards: [],
        tradeType: 'private',
        status: 'pending',
      });

      await trade.save();

      if (!trade.privateRoomCode) {
        return res.status(500).send({
          error: 'No se pudo generar el código de sala privada',
        });
      }

      invite.status = 'accepted';
      invite.tradeId = trade._id;
      invite.privateRoomCode = trade.privateRoomCode;
      await invite.save();
      const populatedInvite = await FriendTradeRoomInvite.findById(invite._id)
        .populate('from', 'username email profileImage')
        .populate('to', 'username email profileImage');

      return res.send({
        message: 'Invitación aceptada',
        invite: populatedInvite,
        privateRoomCode: trade.privateRoomCode,
      });
    } catch (error: any) {
      console.error('Error aceptando invitación:', error);
      return res
        .status(500)
        .send({ error: error.message ?? 'Error aceptando invitación' });
    }
  }
);
/**
 * POST /friend-trade-rooms/invites/:id/reject
 * Rechazar invitación
 */
friendTradeRoomsRouter.post(
  '/friend-trade-rooms/invites/:id/reject',
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const currentUserId = req.userId;

      if (!currentUserId) {
        return res.status(401).send({ error: 'No autenticado' });
      }

      const invite = await FriendTradeRoomInvite.findById(id);
      if (!invite) {
        return res.status(404).send({ error: 'Invitación no encontrada' });
      }

      if (invite.to.toString() !== currentUserId.toString()) {
        return res
          .status(403)
          .send({ error: 'No puedes rechazar una invitación ajena' });
      }

      if (invite.status !== 'pending') {
        return res
          .status(400)
          .send({ error: 'La invitación ya no está pendiente' });
      }

      invite.status = 'rejected';
      await invite.save();

      res.send({ message: 'Invitación rechazada', invite });
    } catch (error: any) {
      console.error('Error rechazando invitación:', error);
      res
        .status(500)
        .send({ error: error.message ?? 'Error rechazando invitación' });
    }
  }
);
