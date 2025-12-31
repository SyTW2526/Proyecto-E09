import express, { Response } from 'express';
import mongoose from 'mongoose';
import { TradeRequest } from '../models/TradeRequest.js';
import { Trade } from '../models/Trade.js';
import { User } from '../models/User.js';
import { UserCard } from '../models/UserCard.js';
import { Notification } from '../models/Notification.js';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware.js';
import { findUserFlexible } from '../utils/mongoHelpers.js';

export const tradeRequestRouter = express.Router();

const emitNotification = (req: any, userId: any, notification: any) => {
  try {
    if (req?.io) req.io.to(`user:${userId}`).emit('notification', notification);
  } catch {}
};
tradeRequestRouter.post(
  '/trade-requests',
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const {
        receiverIdentifier,
        pokemonTcgId,
        cardName = '',
        cardImage = '',
        note = '',
        isManual = false,

        offeredCard,
        offeredPrice = null,
        targetPrice = null,
        offeredUserCardId = null,
        targetUserCardId = null,
      } = req.body as any;

      const currentUserId = req.userId;

      if (!receiverIdentifier) {
        return res
          .status(400)
          .send({ error: 'receiverIdentifier es obligatorio' });
      }

      if (!isManual && !pokemonTcgId) {
        return res.status(400).send({
          error: 'pokemonTcgId es obligatorio para solicitudes de carta',
        });
      }

      const me = await User.findById(currentUserId);
      if (!me)
        return res.status(404).send({ error: 'Usuario actual no encontrado' });

      const receiver = await findUserFlexible(receiverIdentifier);
      if (!receiver)
        return res.status(404).send({ error: 'Usuario destino no encontrado' });

      if (receiver._id.equals(me._id)) {
        return res
          .status(400)
          .send({ error: 'No puedes enviarte una solicitud a ti mismo' });
      }

      const hasOffered = !!offeredCard?.pokemonTcgId;
      const isQuick = !isManual && hasOffered;

      const existsQuery: any = {
        status: 'pending',
        $or: [
          { from: me._id, to: receiver._id },
          { from: receiver._id, to: me._id },
        ],
      };

      if (isManual) {
        existsQuery.isManual = true;
      } else {
        existsQuery.pokemonTcgId = pokemonTcgId;
        existsQuery.isManual = false;

        if (isQuick) {
          existsQuery['offeredCard.pokemonTcgId'] = offeredCard.pokemonTcgId;
        }
      }

      const exists = await TradeRequest.findOne(existsQuery);
      if (exists) {
        return res.status(400).send({
          errorCode: 'TRADE_ALREADY_EXISTS',
          error: isManual
            ? 'Ya existe una invitación pendiente de sala entre estos usuarios'
            : 'Ya existe una solicitud pendiente para esta carta entre estos usuarios',
        });
      }

      let normalizedOfferedCard = hasOffered
        ? {
            pokemonTcgId: String(offeredCard.pokemonTcgId || ''),
            cardName: String(offeredCard.cardName || ''),
            cardImage: String(offeredCard.cardImage || ''),
          }
        : null;

      if (isQuick && offeredUserCardId) {
        const offeredUC: any =
          await UserCard.findById(offeredUserCardId).populate('cardId');
        if (!offeredUC)
          return res
            .status(404)
            .send({ error: 'La carta ofrecida (UserCard) no existe' });

        if (offeredUC.userId.toString() !== me._id.toString()) {
          return res
            .status(400)
            .send({
              error: 'La carta ofrecida no pertenece al usuario emisor',
            });
        }

        if (normalizedOfferedCard) {
          const c: any = offeredUC.cardId || {};

          if (!normalizedOfferedCard.cardName) {
            normalizedOfferedCard.cardName =
              c.name ||
              offeredUC.cardName ||
              offeredUC.name ||
              normalizedOfferedCard.cardName ||
              '';
          }

          if (!normalizedOfferedCard.cardImage) {
            normalizedOfferedCard.cardImage =
              c.image ||
              c.imageUrl ||
              c.imageUrlHiRes ||
              c.images?.large ||
              c.images?.small ||
              normalizedOfferedCard.cardImage ||
              '';
          }
        }
      }

      if (isQuick && normalizedOfferedCard && !normalizedOfferedCard.cardName) {
        normalizedOfferedCard.cardName = 'Carta ofrecida';
      }

      if (isQuick && targetUserCardId) {
        const targetUC: any = await UserCard.findById(targetUserCardId);
        if (!targetUC)
          return res
            .status(404)
            .send({ error: 'La carta objetivo (UserCard) no existe' });
        if (targetUC.userId.toString() !== receiver._id.toString()) {
          return res
            .status(400)
            .send({
              error: 'La carta objetivo no pertenece al usuario receptor',
            });
        }
      }

      const request = await TradeRequest.create({
        from: me._id,
        to: receiver._id,
        pokemonTcgId: isManual ? null : pokemonTcgId,
        cardName: isManual
          ? cardName || 'Sala privada de intercambio'
          : cardName,
        cardImage: isManual ? '' : cardImage,
        note,
        status: 'pending',
        isManual,

        offeredCard: isQuick ? normalizedOfferedCard : undefined,
        offeredPrice: isQuick ? offeredPrice : null,
        targetPrice: isQuick ? targetPrice : null,
        offeredUserCardId: isQuick ? offeredUserCardId : null,
        targetUserCardId: isQuick ? targetUserCardId : null,
      });

      const notification = await Notification.create({
        userId: receiver._id,
        title: isManual
          ? 'Invitación a sala privada de intercambio'
          : isQuick
            ? 'Nueva propuesta de intercambio rápido'
            : 'Nueva solicitud de intercambio',
        message: isManual
          ? `${me.username} quiere abrir una sala privada de intercambio contigo.`
          : isQuick
            ? `${me.username} te propone un intercambio rápido: ${
                normalizedOfferedCard?.cardName || 'una carta'
              } por ${cardName || 'una carta'}.`
            : `${me.username} quiere intercambiar por ${cardName || 'una carta'}.`,
        isRead: false,
      });

      req.io.to(`user:${receiver._id}`).emit('notification', notification);

      res.status(201).send({
        message: isManual
          ? 'Invitación a sala privada enviada'
          : isQuick
            ? 'Propuesta de intercambio rápido enviada'
            : 'Solicitud de intercambio enviada',
        request,
      });
    } catch (error: any) {
      console.error('Error creando solicitud de intercambio:', error);
      res
        .status(500)
        .send({ error: error.message ?? 'Error creando solicitud' });
    }
  }
);

tradeRequestRouter.get(
  '/trade-requests/received/:userId',
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const { userId } = req.params;

      if (!req.userId || req.userId.toString() !== userId.toString()) {
        return res
          .status(403)
          .send({ error: 'No puedes ver las solicitudes de otro usuario' });
      }

      const requests = await TradeRequest.find({ to: userId })
        .populate('from', 'username email profileImage')
        .populate('tradeId', 'privateRoomCode status')
        .sort({ createdAt: -1 });

      return res.send({ requests });
    } catch (error: any) {
      return res
        .status(500)
        .send({ error: error.message ?? 'Error obteniendo solicitudes' });
    }
  }
);

tradeRequestRouter.get(
  '/trade-requests/sent/:userId',
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const { userId } = req.params;

      if (!req.userId || req.userId.toString() !== userId.toString()) {
        return res
          .status(403)
          .send({ error: 'No puedes ver las solicitudes de otro usuario' });
      }

      const requests = await TradeRequest.find({ from: userId })
        .populate('to', 'username email profileImage')
        .populate('tradeId', 'privateRoomCode status')
        .sort({ createdAt: -1 });

      return res.send({ requests });
    } catch (error: any) {
      return res
        .status(500)
        .send({ error: error.message ?? 'Error obteniendo solicitudes' });
    }
  }
);

tradeRequestRouter.post(
  '/trade-requests/:id/open-room',
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const currentUserId = req.userId;

      const request: any = await TradeRequest.findById(id);
      if (!request)
        return res.status(404).send({ error: 'Solicitud no encontrada' });

      if (request.to.toString() !== currentUserId?.toString()) {
        return res
          .status(403)
          .send({ error: 'No puedes crear sala para esta solicitud' });
      }

      if (request.status !== 'pending') {
        return res
          .status(400)
          .send({ error: 'La solicitud ya no está pendiente' });
      }

      const trade = new Trade({
        initiatorUserId: request.from,
        receiverUserId: request.to,
        initiatorCards: [],
        receiverCards: [],
        tradeType: 'private',
        status: 'pending',
        origin: 'request',
        requestId: request._id,
        requestedPokemonTcgId: request.pokemonTcgId,
      });

      await trade.save();

      request.tradeId = trade._id as any;
      request.status = 'accepted';
      request.finishedAt = null;
      await request.save();

      const toUser = await User.findById(request.to).lean();

      const notification = await Notification.create({
        userId: request.from,
        title: 'Sala de intercambio creada',
        message: `${toUser?.username || 'El usuario'} ha creado una sala para negociar el intercambio.`,
        isRead: false,
        data: {
          type: 'tradeRoomCreated',
          tradeId: trade._id,
          privateRoomCode: (trade as any).privateRoomCode,
        },
      });

      emitNotification(req, request.from, notification);

      return res.send({
        message: 'Sala creada',
        request,
        tradeId: trade._id,
        privateRoomCode: (trade as any).privateRoomCode,
      });
    } catch (error: any) {
      return res
        .status(500)
        .send({ error: error.message ?? 'Error creando sala' });
    }
  }
);

tradeRequestRouter.post(
  '/trade-requests/:id/reject',
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const currentUserId = req.userId;

      const request: any = await TradeRequest.findById(id);
      if (!request)
        return res.status(404).send({ error: 'Solicitud no encontrada' });

      if (request.to.toString() !== currentUserId?.toString()) {
        return res
          .status(403)
          .send({ error: 'No puedes rechazar esta solicitud' });
      }

      if (request.status !== 'pending') {
        return res
          .status(400)
          .send({ error: 'La solicitud ya no está pendiente' });
      }

      request.status = 'rejected';
      request.finishedAt = new Date();
      await request.save();

      const toUser = await User.findById(request.to).lean();

      const notification = await Notification.create({
        userId: request.from,
        title: 'Solicitud de intercambio rechazada',
        message: `${toUser?.username || 'El usuario'} ha rechazado tu solicitud de intercambio.`,
        isRead: false,
      });

      emitNotification(req, request.from, notification);

      return res.send({ message: 'Solicitud rechazada', request });
    } catch (error: any) {
      return res
        .status(500)
        .send({ error: error.message ?? 'Error rechazando solicitud' });
    }
  }
);

tradeRequestRouter.post(
  '/trade-requests/:id/accept',
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const currentUserId = req.userId;

      const request: any = await TradeRequest.findById(id);
      if (!request)
        return res.status(404).send({ error: 'Solicitud no encontrada' });

      if (request.to.toString() !== currentUserId?.toString()) {
        return res
          .status(403)
          .send({ error: 'No puedes aceptar esta solicitud' });
      }

      if (request.status !== 'pending') {
        return res
          .status(400)
          .send({ error: 'La solicitud ya no está pendiente' });
      }

      const isQuick = !!request.offeredCard?.pokemonTcgId;

      if (!isQuick) {
        request.status = 'accepted';

        const trade = new Trade({
          initiatorUserId: request.from,
          receiverUserId: request.to,
          initiatorCards: [],
          receiverCards: [],
          tradeType: 'private',
          status: 'pending',
          origin: 'request',
          requestId: request._id,
          requestedPokemonTcgId: request.pokemonTcgId,
        });

        await trade.save();
        request.tradeId = trade._id as any;
        await request.save();

        const toUser = await User.findById(request.to).lean();

        const notification = await Notification.create({
          userId: request.from,
          title: 'Solicitud de intercambio aceptada',
          message: `${toUser?.username || 'El usuario'} ha aceptado tu solicitud por ${request.cardName || 'una carta'}.`,
          isRead: false,
          data: {
            type: 'tradeAccepted',
            tradeId: trade._id,
            privateRoomCode: (trade as any).privateRoomCode,
          },
        });

        emitNotification(req, request.from, notification);

        return res.send({
          message: 'Solicitud aceptada',
          request,
          tradeId: trade._id,
          privateRoomCode: (trade as any).privateRoomCode,
        });
      }

      let offeredUC: any = null;
      let targetUC: any = null;

      if (request.offeredUserCardId)
        offeredUC = await UserCard.findById(request.offeredUserCardId);
      if (!offeredUC) {
        offeredUC = await UserCard.findOne({
          userId: request.from,
          pokemonTcgId: request.offeredCard.pokemonTcgId,
        });
      }

      if (request.targetUserCardId)
        targetUC = await UserCard.findById(request.targetUserCardId);
      if (!targetUC) {
        targetUC = await UserCard.findOne({
          userId: request.to,
          pokemonTcgId: request.pokemonTcgId,
        });
      }

      if (!offeredUC || !targetUC) {
        return res.status(404).send({
          error:
            'No se han encontrado las cartas en la colección para completar el intercambio rápido',
        });
      }

      if (offeredUC.userId.toString() !== request.from.toString()) {
        return res
          .status(400)
          .send({ error: 'La carta ofrecida no pertenece al usuario emisor' });
      }
      if (targetUC.userId.toString() !== request.to.toString()) {
        return res
          .status(400)
          .send({
            error: 'La carta objetivo no pertenece al usuario receptor',
          });
      }

      const offeredP =
        typeof request.offeredPrice === 'number' ? request.offeredPrice : null;
      const targetP =
        typeof request.targetPrice === 'number' ? request.targetPrice : null;

      if (offeredP != null && targetP != null) {
        const max = Math.max(offeredP, targetP);
        if (max > 0) {
          const diffRatio = Math.abs(offeredP - targetP) / max;
          const MAX_DIFF = 0.25;
          if (diffRatio > MAX_DIFF) {
            return res.status(400).send({
              error: 'TRADE_VALUE_DIFF_TOO_HIGH',
              details: {
                offeredPrice: offeredP,
                targetPrice: targetP,
                diffRatio,
              },
            });
          }
        }
      }

      const trade = new Trade({
        initiatorUserId: request.from,
        receiverUserId: request.to,
        initiatorCards: [{ userCardId: offeredUC._id }],
        receiverCards: [{ userCardId: targetUC._id }],
        tradeType: 'private',
        status: 'pending',
        origin: 'quick-request',
        requestId: request._id,
        requestedPokemonTcgId: request.pokemonTcgId,
        initiatorAccepted: true,
        receiverAccepted: true,
      });

      await trade.save();

      const transferOneCopy = async (
        sourceUserCard: any,
        targetUserId: mongoose.Types.ObjectId
      ) => {
        const {
          cardId,
          pokemonTcgId,
          condition,
          collectionType,
          estimatedValue,
          isPublic,
        } = sourceUserCard;

        const existing = await UserCard.findOne({
          userId: targetUserId,
          cardId,
          collectionType: collectionType || 'collection',
          condition: condition || 'Near Mint',
        });

        if (existing) {
          existing.quantity = (existing.quantity || 1) + 1;
          existing.forTrade = false;
          await existing.save();
        } else {
          await UserCard.create({
            userId: targetUserId,
            cardId,
            pokemonTcgId,
            condition: condition || 'Near Mint',
            collectionType: collectionType || 'collection',
            quantity: 1,
            isPublic,
            isFavorite: false,
            notes: '',
            estimatedValue,
            forTrade: false,
          });
        }

        if (sourceUserCard.quantity && sourceUserCard.quantity > 1) {
          sourceUserCard.quantity = sourceUserCard.quantity - 1;
          sourceUserCard.forTrade = false;
          await sourceUserCard.save();
        } else {
          await UserCard.findByIdAndDelete(sourceUserCard._id);
        }
      };

      await transferOneCopy(offeredUC, request.to as mongoose.Types.ObjectId);
      await transferOneCopy(targetUC, request.from as mongoose.Types.ObjectId);

      trade.status = 'completed';
      trade.completedAt = new Date();
      await trade.save();

      request.status = 'completed';
      request.tradeId = trade._id as any;
      request.finishedAt = new Date();
      await request.save();

      const toUser = await User.findById(request.to).lean();
      const notification = await Notification.create({
        userId: request.from,
        title: 'Intercambio rápido completado',
        message: `${toUser?.username || 'El usuario'} ha aceptado tu intercambio rápido.`,
        isRead: false,
        data: { type: 'quickTradeCompleted', tradeId: trade._id },
      });

      emitNotification(req, request.from, notification);

      return res.send({
        message: 'QUICK_TRADE_COMPLETED',
        request,
        tradeId: trade._id,
      });
    } catch (error: any) {
      console.error('Error aceptando solicitud:', error);
      return res
        .status(500)
        .send({ error: error.message ?? 'Error aceptando solicitud' });
    }
  }
);

tradeRequestRouter.delete(
  '/trade-requests/:id/cancel',
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const currentUserId = req.userId;

      const request: any = await TradeRequest.findById(id);
      if (!request)
        return res.status(404).send({ error: 'Solicitud no encontrada' });

      if (request.from.toString() !== currentUserId?.toString()) {
        return res
          .status(403)
          .send({ error: 'No puedes cancelar esta solicitud' });
      }

      if (request.status !== 'pending') {
        return res
          .status(400)
          .send({ error: 'La solicitud ya no está pendiente' });
      }

      request.status = 'cancelled';
      request.finishedAt = new Date();
      await request.save();

      return res.send({ message: 'Solicitud cancelada', request });
    } catch (error: any) {
      return res
        .status(500)
        .send({ error: error.message ?? 'Error cancelando solicitud' });
    }
  }
);
