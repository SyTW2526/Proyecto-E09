/**
 * @file cardDataBuilder.ts
 * @description CardDataBuilder - Constructor/Normalizador de datos de cartas
 *
 * Patrón Builder para construir objetos de cartas normalizados desde
 * respuestas RAW de la API TCGdex.
 *
 * Responsabilidades:
 * - Mapeo de estructuras TCGdex → esquemas internos
 * - Normalización de campos (URLs, nombres, tipos)
 * - Validación de datos antes de persistencia
 * - Construcción de objetos complejos (Pokémon con ataques)
 * - Extracción de información relevante
 * - Sanitización de strings
 *
 * Procesos principales:
 * - buildPokemonCard(): Transforma datos TCGdex → PokemonCard
 * - buildTrainerCard(): Transforma datos TCGdex → TrainerCard
 * - buildEnergyCard(): Transforma datos TCGdex → EnergyCard
 * - normalización de imágenes (manejo de URLs inconsistentes)
 * - extracción de precios y valores
 *
 * Patrón:
 * - Métodos estáticos o factory para cada tipo
 * - Valida estructura esperada de API
 * - Rellena defaults para campos opcionales
 * - Lanza excepciones en casos de datos inválidos
 *
 * Integración:
 * - Usado por cardsService.ts en sincronización
 * - Recibe datos de pokemonService.ts
 * - Produce objetos listos para guardar en MongoDB
 * - Reutiliza utilidades de tcgdx.ts
 *
 * @author Proyecto E09
 * @version 1.0.0
 * @requires ./tcgdx
 * @requires ../models/Card
 * @requires ../models/PokemonCard
 * @requires ../models/TrainerCard
 * @requires ../models/EnergyCard
 * @module server/services/cardDataBuilder
 * @see services/tcgdx.ts
 * @see services/cards.ts
 */

import {
  normalizeImageUrl,
  extractPrices,
  sanitizeBriefCard,
} from './tcgdx.js';

/**
 * Tipo para los datos de precios normalizados
 */
interface NormalizedPrices {
  cardmarketAvg: number | null;
  tcgplayerMarketPrice: number | null;
  avg: number;
}

/**
 * Datos base comunes a todos los tipos de cartas
 */
interface BaseCardData {
  pokemonTcgId: string;
  name: string;
  supertype: string;
  subtype: string;
  series: string;
  set: string;
  rarity: string;
  images: {
    small: string;
    large: string;
  };
  illustrator: string;
  price: NormalizedPrices;
  cardNumber: string;
  lastPriceUpdate: Date;
}

/**
 * Construye datos base comunes a todos los tipos de cartas
 */
function buildBaseCardData(sanitized: any, rawPrices: any): BaseCardData {
  const prices = extractPrices(rawPrices);

  return {
    pokemonTcgId: sanitized.id || '',
    name: sanitized.name || '',
    supertype: sanitized.supertype || '',
    subtype: sanitized.subtype || '',
    series: sanitized.set?.series || '',
    set: sanitized.set?.name || '',
    rarity: sanitized.rarity || '',
    images: {
      small: normalizeImageUrl(sanitized.images?.small),
      large: normalizeImageUrl(sanitized.images?.large),
    },
    illustrator: sanitized.illustrator || sanitized.artist || '',
    price: {
      cardmarketAvg: prices.cardmarketAvg,
      tcgplayerMarketPrice: prices.tcgplayerMarketPrice,
      avg: prices.avg ?? 0,
    },
    cardNumber: sanitized.number || '',
    lastPriceUpdate: new Date(),
  };
}

/**
 * Construye datos específicos de cartas Pokémon
 */
export function buildPokemonCardData(raw: any) {
  const sanitized = sanitizeBriefCard(raw?.data ?? raw);
  const base = buildBaseCardData(sanitized, raw);

  return {
    ...base,
    category: 'pokemon' as const,
    hp: sanitized.hp || '',
    types: sanitized.types || [],
    evolvesFrom: sanitized.evolvesFrom || '',
    abilities: sanitized.abilities || [],
    attacks: sanitized.attacks || [],
    weaknesses: sanitized.weaknesses || [],
    resistances: sanitized.resistances || [],
    retreatCost: sanitized.retreat || sanitized.retreatCost || [],
    nationalPokedexNumber: sanitized.nationalPokedexNumbers?.[0] || null,
  };
}

/**
 * Construye datos específicos de cartas Entrenador
 */
export function buildTrainerCardData(raw: any) {
  const sanitized = sanitizeBriefCard(raw?.data ?? raw);
  const base = buildBaseCardData(sanitized, raw);

  return {
    ...base,
    category: 'trainer' as const,
    text: Array.isArray(sanitized.text)
      ? sanitized.text.join('\n')
      : sanitized.text || '',
    effect: sanitized.effect || '',
  };
}

/**
 * Construye datos específicos de cartas Energía
 */
export function buildEnergyCardData(raw: any) {
  const sanitized = sanitizeBriefCard(raw?.data ?? raw);
  const base = buildBaseCardData(sanitized, raw);

  return {
    ...base,
    category: 'energy' as const,
    energyType: sanitized.energyType || sanitized.subtype || '',
    text: Array.isArray(sanitized.text)
      ? sanitized.text.join('\n')
      : sanitized.text || '',
  };
}

/**
 * Construye datos para cartas genéricas (fallback)
 */
export function buildGenericCardData(raw: any) {
  const sanitized = sanitizeBriefCard(raw?.data ?? raw);
  const base = buildBaseCardData(sanitized, raw);

  return {
    pokemonTcgId: base.pokemonTcgId,
    category: 'unknown' as const,
    name: base.name,
    series: base.series,
    set: base.set,
    rarity: base.rarity,
    types: sanitized.types || [],
    imageUrl: base.images.small,
    imageUrlHiRes: base.images.large,
    illustrator: base.illustrator,
    price: base.price,
    nationalPokedexNumber: sanitized.nationalPokedexNumbers?.[0] || null,
    cardNumber: base.cardNumber,
    lastPriceUpdate: base.lastPriceUpdate,
  };
}
