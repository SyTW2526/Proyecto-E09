import express from 'express';
import { Trade } from '../models/Trade.js';


export const tradeRouter = express.Router();

/**
 * POST /trades
 * Crear un nuevo intercambio
 */
tradeRouter.post('/trades', async (req, res) => {
  try {
    const trade = new Trade(req.body);
    await trade.save();
    res.status(201).send(trade);
  } catch (error) {
    res.status(400).send({ error: (error as Error).message ?? String(error) });
  }
});

/**
 * GET /trades
 * Obtener todos los intercambios y aplicar filtros
 */
tradeRouter.get('/trades', async (req, res) => {
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
tradeRouter.get('/trades/:id', async (req, res) => {
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
 * PATCH /trades/:id
 * Actualizar el estado de un intercambio
 */
tradeRouter.patch('/trades/:id', async (req, res) => {
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
tradeRouter.delete('/trades/:id', async (req, res) => {
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
