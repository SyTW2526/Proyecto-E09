import express from 'express';
import { Card } from '../models/Card.js';

export const cardRouter = express.Router();


/**
 * GET /cards
 * Obtiene una lista paginada de cartas con filtros opcionales
 */
cardRouter.get('/cards', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      name,
      rarity,
      series,
      set,
      type,
    } = req.query;

    const filter: Record<string, any> = {};

    if (name) filter.name = { $regex: `^${name}`, $options: 'i' };
    if (rarity) filter.rarity = rarity;
    if (series) filter.series = series;
    if (set) filter.set = set;
    if (type) filter.types = type;

    const skip = (Number(page) - 1) * Number(limit);

    const cards = await Card.find(filter)
      .sort({ name: 1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Card.countDocuments(filter);
    const totalPages = Math.ceil(total / Number(limit));

    res.send({
      page: Number(page),
      totalPages,
      totalResults: total,
      resultsPerPage: Number(limit),
      cards,
    });
  } catch (error: any) {
    res.status(500).send({ error: error.message });
  }
});

/**
 * GET /cards/:id
 * Obtiene una carta específica por su ID local
 */
cardRouter.get('/cards/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const card = await Card.findById(id);

    if (!card) {
      return res.status(404).send({ error: 'Carta no encontrada' });
    }

    res.send(card);
  } catch (error: any) {
    res.status(500).send({ error: error.message });
  }
});
