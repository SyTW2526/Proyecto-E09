/**
 * @file card.ts
 * @description Router Card - Endpoints CRUD y búsqueda de cartas
 *
 * API REST para catálogo de cartas disponibles en el sistema.
 * Gestión de cartas Pokémon, Entrenador y Energía.
 *
 * **Búsqueda y listado:**
 * - GET /cards - Listar cartas con paginación
 * - GET /cards/search - Búsqueda por nombre/criterios
 * - GET /cards/:id - Obtener detalles de una carta
 * - GET /cards/featured - Cartas destacadas
 *
 * **Filtros disponibles:**
 * - Por tipo (water, fire, electric, etc)
 * - Por rareza (common, rare, holo rare)
 * - Por serie/expansión
 * - Por rango de precio
 * - Por set/colección
 *
 * **Gestión del catálogo:**
 * - POST /cards/sync - Sincronizar cartas desde API TCGdex
 * - PUT /cards/:id - Actualizar información de carta
 * - DELETE /cards/:id - Eliminar carta
 * - GET /cards/stats - Estadísticas del catálogo
 *
 * **Relaciones:**
 * - Card base (genérica)
 * - PokemonCard (con ataques, habilidades)
 * - TrainerCard (Items, Supporters)
 * - EnergyCard (tipos de energía)
 *
 * Características:
 * - Búsqueda full-text (nombre, descripción)
 * - Paginación con límite configurable
 * - Filtros complejos (AND/OR)
 * - Caché de búsquedas frecuentes
 * - Índices de base de datos para rendimiento
 *
 * Integración:
 * - Services/cards.ts para lógica de negocio
 * - Services/pokemon.ts para datos TCGdex
 * - Models: Card, PokemonCard, TrainerCard, EnergyCard
 * - Socket.io para notificaciones de nuevas cartas
 *
 * @author Proyecto E09
 * @version 1.0.0
 * @requires express
 * @requires mongoose
 * @requires ../services/cards
 * @requires ../services/pokemon
 * @requires ../models/Card
 * @requires ../models/PokemonCard
 * @requires ../models/TrainerCard
 * @requires ../models/EnergyCard
 * @module server/routers/card
 * @see services/cards.ts
 * @see services/pokemon.ts
*/
import express from 'express';
import { Card } from '../models/Card.js';
import { PokemonCard } from '../models/PokemonCard.js';
import { TrainerCard } from '../models/TrainerCard.js';
import { EnergyCard } from '../models/EnergyCard.js';
import { getCardById } from '../services/pokemon.js';
import {
  sanitizeBriefCard,
  getCardCategory,
  normalizeImageUrl,
  extractPrices,
  normalizeSearchCard,
} from '../services/tcgdx.js';
import { upsertCardFromRaw } from '../services/cards.js';
import {
  sendSuccess,
  sendError,
  sendPaginated,
  parsePaginationParams,
  ensureResourceExists,
} from '../utils/responseHelpers.js';

/**
 * Router de cartas
 */
export const cardRouter = express.Router();

/**
 * GET /cards
 * Obtiene una lista paginada de cartas con filtros opcionales
 *
 * @query {number} page - Número de página (por defecto 1)
 * @query {number} limit - Límite de resultados por página (por defecto 20)
 * @query {string} name - Filtro por nombre de carta (regex)
 * @query {string} rarity - Filtro por rareza
 * @query {string} series - Filtro por serie
 * @query {string} set - Filtro por conjunto/extensión
 * @query {string} type - Filtro por tipo
 *
 * @returns {Object} Objeto con cartas, total y paginación
 */
cardRouter.get('/cards', async (req, res) => {
  try {
    const { page, limit } = parsePaginationParams(req.query);
    const { name, rarity, series, set, type } = req.query;

    const filter: Record<string, any> = {};

    if (name) filter.name = { $regex: `^${name}`, $options: 'i' };
    if (rarity) filter.rarity = rarity;
    if (series) filter.series = series;
    if (set) filter.set = set;
    if (type) filter.types = type;

    const skip = (page - 1) * limit;

    const [cards, total] = await Promise.all([
      Card.find(filter).sort({ name: 1 }).skip(skip).limit(limit),
      Card.countDocuments(filter),
    ]);

    sendPaginated(res, cards, page, limit, total);
  } catch (error: any) {
    sendError(res, error);
  }
});

/**
 * GET /cards/featured
 * Obtiene las cartas destacadas directamente desde TCGdex API (sin caché)
 * Devuelve un array de cartas con imágenes de alta calidad garantizadas
 * NOTA: Debe ir ANTES de /cards/:id para evitar que :id capture "featured"
 */
cardRouter.get('/cards/featured', async (req, res) => {
  try {
    // IDs de las cartas destacadas - solo sets SWSH (Sword & Shield) en inglés
    const featuredIds = [
      'swsh3-136', // Pikachu VMAX
      'swsh3-25', // Pikachu V
      'swsh4-74', // Eternatus VMAX
      'swsh1-25', // Cinderace
      'swsh2-192', // Charizard VMAX
      'swsh5-123', // Zapdos
      'swsh6-71', // Leafeon VMAX
    ];

    // Obtener todas las cartas en paralelo desde TCGdex
    const promises = featuredIds.map(async (id) => {
      try {
        const apiResp = await getCardById(id);
        if (!apiResp) return null;

        // Usar buildPokemonCardData para construir los datos con imágenes correctas
        const { buildPokemonCardData } =
          await import('../services/cardDataBuilder.js');
        const cardData = buildPokemonCardData(apiResp);

        return cardData;
      } catch (error) {
        console.error(`Error fetching featured card ${id}:`, error);
        return null;
      }
    });

    const cards = (await Promise.all(promises)).filter((card) => card !== null);

    return sendSuccess(res, cards);
  } catch (error: any) {
    console.error('Error in GET /cards/featured:', error);
    return sendError(res, error);
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

    if (!ensureResourceExists(res, card, 'Carta')) return;

    sendSuccess(res, card);
  } catch (error: any) {
    sendError(res, error);
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

    if (!id) {
      return sendError(res, 'Missing card id in body', 400);
    }

    // Check cache in unified collection (discriminator pattern)
    const cached = await Card.findOne({ pokemonTcgId: id }).lean();

    if (cached) {
      return sendSuccess(res, { source: 'cache', card: cached });
    }

    // Fetch from external TCGdex API
    const apiResp = await getCardById(id);

    if (!apiResp) {
      return sendError(res, 'Card not found in external API', 404);
    }

    // Use centralized upsert function
    const saved = await upsertCardFromRaw(apiResp);

    if (!saved) {
      return sendError(res, 'Error saving card', 500);
    }

    // Responder directamente sin envolver para compatibilidad con cliente
    return res.status(200).send({ source: 'tcgdex', card: saved });
  } catch (error: any) {
    console.error('Error in POST /cards:', error?.message ?? error);
    return sendError(res, error);
  }
});

/**
 * GET /cards/tcg/:tcgId
 * Busca una carta en caché por su pokemonTcgId en la colección unificada.
 */
cardRouter.get('/cards/tcg/:tcgId', async (req, res) => {
  try {
    const { tcgId } = req.params;
    const found = await Card.findOne({ pokemonTcgId: tcgId });

    if (!ensureResourceExists(res, found, 'Card')) return;

    // Responder directamente sin envolver para compatibilidad con cliente
    return res.status(200).send({ source: 'cache', card: found });
  } catch (err: any) {
    return sendError(res, err);
  }
});

/**
 * GET /cards/search/quick
 * Búsqueda rápida de cartas por nombre para el desplegable
 * Retorna máximo 10 resultados sin paginación
 */
cardRouter.get('/cards/search/quick', async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string') {
      return sendError(res, 'Query parameter "q" is required', 400);
    }

    const filter = { name: { $regex: q, $options: 'i' } };

    const cards = await Card.find(filter).sort({ name: 1 }).limit(10).lean();

    return sendSuccess(res, { data: cards, count: cards.length });
  } catch (error: any) {
    return sendError(res, error);
  }
});

/**
 * GET /cards/search/tcg
 * Proxy search to TCGdex API without caching results. Supports q, page, limit, set, rarity
 */
cardRouter.get('/cards/search/tcg', async (req, res) => {
  try {
    const { q, page = '1', limit = '20', set, rarity } = req.query as any;
    if (!q || typeof q !== 'string')
      return sendError(res, 'Query parameter "q" is required', 400);

    const filters: any = { name: q };
    if (set) filters.set = set;
    if (rarity) filters.rarity = rarity;

    console.log('[SEARCH] Searching TCGdex with filters:', filters);

    const apiResp = await (
      await import('../services/pokemon.js')
    ).searchCards(filters);

    console.log(
      '[SEARCH] TCGdex response:',
      JSON.stringify(apiResp).substring(0, 200)
    );

    const raw = apiResp.data ?? apiResp;
    const cards = Array.isArray(raw) ? raw : (raw.cards ?? raw.data ?? []);

    console.log('[SEARCH] Extracted cards count:', cards.length);

    // Usar función reutilizable para normalizar cartas
    const normalized = (cards || []).map(normalizeSearchCard);

    // simple server-side pagination
    const p = Math.max(1, Number(page));
    const l = Math.max(1, Number(limit));
    const total = normalized.length;
    const start = (p - 1) * l;
    const pageItems = normalized.slice(start, start + l);

    console.log('[SEARCH] Returning', pageItems.length, 'of', total, 'cards');

    return sendSuccess(res, { data: pageItems, total, page: p, limit: l });
  } catch (err: any) {
    console.error('[SEARCH ERROR] Error in /cards/search/tcg:', err.message);
    console.error('[SEARCH ERROR] Stack:', err.stack);
    return sendError(res, 'Error searching TCGdex: ' + err.message, 500);
  }
});
