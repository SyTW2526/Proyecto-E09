import express from 'express';
import { Trade } from '../models/Trade.js';


export const tradeRouter = express.Router();

/**
 * Ruta para crear un nuevo intercambio
 */
tradeRouter.post('/trades', async (req, res) => {
  try {
    const trade = new Trade(req.body);
    await trade.save();
    res.status(201).send(trade);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

/**
 * Ruta para obtener todos los intercambios y aplicar filtros
 */
tradeRouter.get('/trades', async (req, res) => {
  try {
    const filter = req.query || {};
    const trades = await Trade.find(filter)
      .populate('initiatorUserId', 'username email')
      .populate('receiverUserId', 'username email')
      .populate('initiatorCards.cardId', 'name imageUrl')
      .populate('receiverCards.cardId', 'name imageUrl');

    res.send(trades);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

/**
 * Ruta para obtener un intercambio por ID
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
    res.status(500).send({ error: error.message });
  }
});

/**
 * Ruta para actualizar el estado de un intercambio 
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
    res.status(400).send({ error: error.message });
  }
});

/**
 * Ruta para eliminar un intercambio
 */
tradeRouter.delete('/trades/:id', async (req, res) => {
  try {
    const trade = await Trade.findByIdAndDelete(req.params.id);
    if (!trade) {
      return res.status(404).send({ error: 'Intercambio no encontrado' });
    }
    res.send({ message: 'Intercambio eliminado', trade });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});
