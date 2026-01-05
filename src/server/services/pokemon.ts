/**
 * @file pokemon.ts
 * @description Servicio Pokemon - Integración con API TCGdex para cartas Pokémon
 *
 * Capa de abstracción para interacción con la API pública TCGdex.net.
 * Responsabilidades:
 * - Obtención de datos de cartas desde TCGdex
 * - Transformación de respuestas de API
 * - Normalización de estructura de datos
 * - Caché de datos (si aplica)
 * - Manejo de errores de red
 *
 * Base URL: https://api.tcgdex.net/v2/en
 *
 * Endpoints principales:
 * - /cards - Lista de cartas disponibles
 * - /series - Series/expansiones de cartas
 * - /types - Tipos de energía
 * - /rarities - Rarezas de cartas
 *
 * Características:
 * - Requests asíncronos
 * - Formato JSON de respuestas
 * - Fallback para imágenes no disponibles
 * - Validación de datos recibidos
 *
 * Integración:
 * - Utilizado por cardsService.ts para sincronización
 * - Llamadas desde routers/pokemon.ts para API endpoints
 * - cardDataBuilder.ts usa estos datos para normalizar
 *
 * @author Proyecto E09
 * @version 1.0.0
 * @requires fetch
 * @module server/services/pokemon
 * @see services/cardDataBuilder.ts
 * @see routers/pokemon.ts
 */

// services/pokemon.ts

/**
 * URL base de la API TCGdex
 * @constant
 * @type {string}
 */
const TCGDEX_BASE_URL = 'https://api.tcgdex.net/v2/en';

/**
 * Función auxiliar para hacer fetches a la API TCGdex
 * Maneja errores y retorna JSON automáticamente
 *
 * @param {string} endpoint - Endpoint relativo (ej: "/cards", "/sets/swsh3")
 * @returns {Promise<any>} Respuesta JSON de la API
 * @throws {Error} Si la respuesta no es 200 OK
 */
async function apiFetch(endpoint: string) {
  const url = `${TCGDEX_BASE_URL}${endpoint}`;
  console.log('[TCGdex] Fetching:', url);

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  console.log(
    '[TCGdex] Response status:',
    response.status,
    response.statusText
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[TCGdex] Error response:', errorText);
    throw new Error(`TCGdex API Error: ${response.statusText} - ${errorText}`);
  }
  const data = await response.json();
  console.log(
    '[TCGdex] Response data type:',
    Array.isArray(data) ? 'array' : typeof data
  );
  return data;
}

/**
 * Obtiene cartas por nombre
 * @param {string} name - Nombre del Pokémon a buscar
 * @returns {Promise<Array>} Array de cartas que coinciden con el nombre
 */
export async function getCardsByName(name: string) {
  return apiFetch(`/cards?name=${encodeURIComponent(name)}`);
}

/**
 * Obtiene una carta específica por ID
 * @param {string} id - ID de la carta (ej: "swsh3-25")
 * @returns {Promise<Object>} Detalles completos de la carta
 */
export async function getCardById(id: string) {
  return apiFetch(`/cards/${id}`);
}

/**
 * Obtiene todas las cartas de un set específico
 * @param {string} setId - ID del set (ej: "swsh3", "base1")
 * @returns {Promise<Array>} Array de cartas del set
 */
export async function getCardsBySet(setId: string) {
  return apiFetch(`/sets/${setId}`);
}

/**
 * Obtiene la lista de todos los sets disponibles
 * @returns {Promise<Array>} Array de sets con información básica
 */
export async function getAllSets() {
  return apiFetch('/sets');
}

/**
 * Obtiene cartas filtradas por tipo
 * @param type - Tipo de carta (ej: "Pokémon", "Trainer", "Energy")
 * @returns Array de cartas del tipo especificado
 */
export async function getCardsByType(type: string) {
  return apiFetch(`/cards?types=${encodeURIComponent(type)}`);
}

/**
 * Obtiene cartas filtradas por HP
 * @param hp - HP mínimo o exacto
 * @returns Array de cartas con ese HP
 */
export async function getCardsByHP(hp: number) {
  return apiFetch(`/cards?hp=${hp}`);
}

/**
 * Obtiene cartas por rareza
 * @param rarity - Rareza de la carta (ej: "Common", "Rare", "Ultra Rare")
 * @returns Array de cartas con esa rareza
 */
export async function getCardsByRarity(rarity: string) {
  return apiFetch(`/cards?rarity=${encodeURIComponent(rarity)}`);
}

/**
 * Obtiene información de una serie específica
 * @param seriesId - ID de la serie
 * @returns Información de la serie
 */
export async function getSeriesById(seriesId: string) {
  return apiFetch(`/series/${seriesId}`);
}

/**
 * Obtiene todas las series disponibles
 * @returns Array de series
 */
export async function getAllSeries() {
  return apiFetch('/series');
}

/**
 * Búsqueda avanzada de cartas con múltiples filtros
 * @param filters - Objeto con filtros opcionales (name, types, hp, rarity, etc.)
 * @returns Array de cartas que cumplen los filtros
 */
export async function searchCards(filters: {
  name?: string;
  types?: string;
  hp?: number;
  rarity?: string;
  set?: string;
}) {
  const params = new URLSearchParams();

  if (filters.name) params.append('name', filters.name);
  if (filters.types) params.append('types', filters.types);
  if (filters.hp) params.append('hp', filters.hp.toString());
  if (filters.rarity) params.append('rarity', filters.rarity);
  if (filters.set) params.append('set', filters.set);

  const queryString = params.toString();
  return apiFetch(`/cards${queryString ? `?${queryString}` : ''}`);
}
