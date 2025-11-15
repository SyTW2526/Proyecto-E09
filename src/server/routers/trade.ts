import express from 'express';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Trade } from '../models/Trade.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

export const tradeRouter = express.Router();

/**
 * POST /trades
 * Crear un nuevo intercambio
 */

tradeRouter.post('/trades', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { receiverUserId, initiatorCards, receiverCards, tradeType = 'private' } = req.body;
    const initiatorUserId = req.user!._id;
    let resolvedReceiverId;

    if (mongoose.Types.ObjectId.isValid(receiverUserId)) {
      resolvedReceiverId = new mongoose.Types.ObjectId(receiverUserId);
    } else {
      const receiverUser = await User.findOne({
        $or: [{ username: receiverUserId }, { email: receiverUserId }],
      });

      if (!receiverUser) {
        return res
          .status(404)
          .send({ error: `Usuario receptor no encontrado: ${receiverUserId}` });
      }

      resolvedReceiverId = receiverUser._id;
    }

    const trade = new Trade({
      initiatorUserId,
      receiverUserId: resolvedReceiverId,
      initiatorCards,
      receiverCards,
      tradeType,
    });

    await trade.save();

    res.status(201).send({
      message: 'Intercambio creado correctamente',
      tradeId: trade._id,
      privateRoomCode: trade.privateRoomCode,
    });
  } catch (error: any) {
    console.error('Error creando intercambio:', error);
    res.status(400).send({ error: error.message });
  }
});
/**
 * GET /trades
 * Obtener todos los intercambios y aplicar filtros
 */
tradeRouter.get('/trades', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, tradeType } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const filter: any = {};
    if (status) filter.status = status;
    if (tradeType) filter.tradeType = tradeType;

    const trades = await Trade.find(filter)
      .populate('initiatorUserId', 'username email')
      .populate('receiverUserId', 'username email')
      .populate('initiatorCards.userCardId')
      .populate('receiverCards.userCardId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Trade.countDocuments(filter);
    const totalPages = Math.ceil(total / Number(limit));

    res.send({
      page: Number(page),
      totalPages,
      totalResults: total,
      resultsPerPage: Number(limit),
      trades
    });
  } catch (error: any) {
    res.status(500).send({ error: error.message });
  }
});
/**
 * GET /trades/:id
 * Obtener un intercambio por ID
 */
tradeRouter.get('/trades/:id', authMiddleware, async (req, res) => {
  try {
    const trade = await Trade.findById(req.params.id)
      .populate('initiatorUserId', 'username email')
      .populate('receiverUserId', 'username email')
      .populate('initiatorCards.cardId', 'name imageUrl')
      .populate('receiverCards.cardId', 'name imageUrl');

    if (!trade) {
      return res.status(404).send({ error: 'Intercambio no encontrado' });
    }
    res.send(trade);
  } catch (error) {
    res.status(500).send({ error: (error as Error).message ?? String(error) });
  }
});

/**
 * GET /trades/room/:code
 * Obtener un intercambio por código de sala privada
 */
tradeRouter.get('/trades/room/:code', authMiddleware, async (req, res) => {
  try {
    const trade = await Trade.findOne({ privateRoomCode: req.params.code })
      .populate('initiatorUserId', 'username email')
      .populate('receiverUserId', 'username email')
      .populate('initiatorCards.cardId', 'name imageUrl')
      .populate('receiverCards.cardId', 'name imageUrl');

    if (!trade) return res.status(404).send({ error: 'Sala no encontrada' });
    res.send(trade);
  } catch (error:any) {
    res.status(500).send({ error: error.message });
  }
});
/**
 * PATCH /trades/:id
 * Actualizar el estado de un intercambio
 */
tradeRouter.patch('/trades/:id', authMiddleware, async (req, res) => {
  try {
    const allowed = ['status', 'completedAt', 'messages'];
    const updates = Object.keys(req.body);

    const valid = updates.every((u) => allowed.includes(u));
    if (!valid) {
      return res.status(400).send({ error: 'Actualización no permitida' });
    }  
    const trade = await Trade.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!trade) {
      return res.status(404).send({ error: 'Intercambio no encontrado' });
    }
    res.send(trade);
  } catch (error) {
    res.status(400).send({ error: (error as Error).message ?? String(error) });
  }
});

/**
 * DELETE /trades/:id
 * Eliminar un intercambio
 */
tradeRouter.delete('/trades/:id', authMiddleware, async (req, res) => {
  try {
    const trade = await Trade.findByIdAndDelete(req.params.id);
    if (!trade) {
      return res.status(404).send({ error: 'Intercambio no encontrado' });
    }
    res.send({ message: 'Intercambio eliminado', trade });
  } catch (error) {
    res.status(500).send({ error: (error as Error).message ?? String(error) });
  }
});
