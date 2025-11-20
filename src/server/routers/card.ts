import express from 'express';
import { Card } from '../models/Card.js';
import { PokemonCard } from '../models/PokemonCard.js';
import { TrainerCard } from '../models/TrainerCard.js';
import { EnergyCard } from '../models/EnergyCard.js';
import { getCardById } from '../services/pokemon.js';
import { sanitizeBriefCard, getCardCategory, normalizeImageUrl, extractPrices } from '../services/tcgdx.js';

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


/**
 * POST /cards
 * Body: { id: string }  (TCGdex card id, e.g. "swsh3-25")
 * Behavior: cache-first. If the card exists locally (pokemonTcgId) return it.
 * Otherwise fetch from TCGdex, sanitize, persist in the corresponding model and return it.
 */
cardRouter.post('/cards', async (req, res) => {
  try {
    const { id } = req.body as { id?: string };
    if (!id) return res.status(400).send({ error: 'Missing card id in body' });

    // check cache across specialized collections then fallback
    const cached = await Promise.any([
      PokemonCard.findOne({ pokemonTcgId: id }).lean(),
      TrainerCard.findOne({ pokemonTcgId: id }).lean(),
      EnergyCard.findOne({ pokemonTcgId: id }).lean(),
      Card.findOne({ pokemonTcgId: id }).lean(),
    ]).catch(() => null);

    if (cached) {
      return res.send({ source: 'cache', card: cached });
    }

    // fetch from external TCGdex API
    const apiResp = await getCardById(id);
    // API may return data directly or wrapped in data
    const raw = apiResp.data ?? apiResp;
    // sometimes the API returns an array when querying by search - normalize
    const brief = Array.isArray(raw) ? raw[0] : raw;
    if (!brief) return res.status(404).send({ error: 'Card not found in external API' });

  // extract prices from the raw API response (avoid losing nested fields during sanitization)
  const prices = extractPrices(brief);
  const c = sanitizeBriefCard(brief);
  const category = getCardCategory(c);

    let saved: any = null;
    if (category === 'pokemon') {
      saved = await PokemonCard.findOneAndUpdate(
        { pokemonTcgId: c.id },
        {
          pokemonTcgId: c.id,
          name: c.name,
          supertype: c.supertype || '',
          subtype: c.subtype || '',
          hp: c.hp || '',
          types: c.types || [],
          evolvesFrom: c.evolvesFrom || '',
          abilities: c.abilities || [],
          attacks: c.attacks || [],
          weaknesses: c.weaknesses || [],
          resistances: c.resistances || [],
          retreatCost: c.retreat || c.retreatCost || [],
          series: c.set?.series || '',
          set: c.set?.name || '',
          rarity: c.rarity || '',
          images: { small: normalizeImageUrl(c.images?.small || ''), large: normalizeImageUrl(c.images?.large || '') },
          illustrator: c.illustrator || '',
          nationalPokedexNumber: c.nationalPokedexNumbers?.[0] || null,
          price: {
            cardmarketAvg: prices.cardmarketAvg,
            tcgplayerMarketPrice: prices.tcgplayerMarketPrice,
            avg: prices.avg ?? 0
          },
          cardNumber: c.number || '',
          lastPriceUpdate: new Date()
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    } else if (category === 'trainer') {
      saved = await TrainerCard.findOneAndUpdate(
        { pokemonTcgId: c.id },
        {
          pokemonTcgId: c.id,
          name: c.name,
          supertype: c.supertype || '',
          subtype: c.subtype || '',
          series: c.set?.series || '',
          set: c.set?.name || '',
          rarity: c.rarity || '',
          images: { small: normalizeImageUrl(c.images?.small || ''), large: normalizeImageUrl(c.images?.large || '') },
          illustrator: c.illustrator || '',
          price: {
            cardmarketAvg: prices.cardmarketAvg,
            tcgplayerMarketPrice: prices.tcgplayerMarketPrice,
            avg: prices.avg ?? 0
          },
          text: Array.isArray(c.text) ? c.text.join('\n') : c.text || '',
          effect: c.effect || '',
          cardNumber: c.number || '',
          lastPriceUpdate: new Date()
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    } else if (category === 'energy') {
      saved = await EnergyCard.findOneAndUpdate(
        { pokemonTcgId: c.id },
        {
          pokemonTcgId: c.id,
          name: c.name,
          supertype: c.supertype || '',
          subtype: c.subtype || '',
          energyType: c?.energyType || (c?.subtype || ''),
          series: c.set?.series || '',
          set: c.set?.name || '',
          rarity: c.rarity || '',
          images: { small: normalizeImageUrl(c.images?.small || ''), large: normalizeImageUrl(c.images?.large || '') },
          illustrator: c.illustrator || '',
          price: {
            cardmarketAvg: prices.cardmarketAvg,
            tcgplayerMarketPrice: prices.tcgplayerMarketPrice,
            avg: prices.avg ?? 0
          },
          text: Array.isArray(c.text) ? c.text.join('\n') : c.text || '',
          cardNumber: c.number || '',
          lastPriceUpdate: new Date()
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    } else {
      saved = await Card.findOneAndUpdate(
        { pokemonTcgId: c.id },
        {
          pokemonTcgId: c.id,
          name: c.name,
          series: c.set?.series || '',
          set: c.set?.name || '',
          rarity: c.rarity || '',
          types: c.types || [],
          imageUrl: normalizeImageUrl(c.images?.small || ''),
          imageUrlHiRes: normalizeImageUrl(c.images?.large || ''),
          illustrator: c.illustrator || '',
          price: {
            cardmarketAvg: prices.cardmarketAvg,
            tcgplayerMarketPrice: prices.tcgplayerMarketPrice,
            avg: prices.avg ?? 0
          },
          nationalPokedexNumber: c.nationalPokedexNumbers?.[0] || null,
          cardNumber: c.number || '',
          lastPriceUpdate: new Date()
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    return res.send({ source: 'tcgdex', card: saved });
  } catch (error: any) {
    console.error('Error in POST /cards:', error?.message ?? error);
    return res.status(500).send({ error: error?.message ?? String(error) });
  }
});


/**
 * GET /cards/tcg/:tcgId
 * Busca una carta en caché por su pokemonTcgId en las colecciones especializadas.
 */
cardRouter.get('/cards/tcg/:tcgId', async (req, res) => {
  try {
    const { tcgId } = req.params;
    const found = await PokemonCard.findOne({ pokemonTcgId: tcgId })
      || await TrainerCard.findOne({ pokemonTcgId: tcgId })
      || await EnergyCard.findOne({ pokemonTcgId: tcgId })
      || await Card.findOne({ pokemonTcgId: tcgId });

    if (!found) return res.status(404).send({ error: 'Card not found in cache' });
    return res.send({ source: 'cache', card: found });
  } catch (err: any) {
    return res.status(500).send({ error: err.message });
  }
});
