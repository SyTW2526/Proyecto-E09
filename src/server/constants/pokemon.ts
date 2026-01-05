/**
 * @file pokemon.ts
 * @description Constantes Pokemon TCG - Definiciones globales
 *
 * Define valores constantes usados en toda la aplicación.
 * Centraliza configuración relacionada con Pokémon Trading Card Game.
 *
 * **Propósito:**
 * - Evita hardcoding de valores repetidos
 * - Facilita cambios globales (ej: ajustar rarezas)
 * - Mantiene consistencia en toda la app
 * - Documentación de dominio TCG
 *
 * **Categorías de constantes:**
 * - Raridades de cartas (orden de frecuencia)
 * - Tipos de energía (agua, fuego, etc)
 * - Estados/categorías de cartas
 * - Valores de ponderación
 * - Límites y umbrales
 *
 * **Raridades (RARITY_ORDER):**
 * Orden de menor a mayor rareza, usado para:
 * - Generación aleatoria de packs
 * - Probabilidades de drop
 * - Cálculo de valor estimado
 * - Filtros de búsqueda
 *
 * Valores:
 * - Common: Frecuente en packs
 * - Uncommon: Menos frecuente
 * - Rare: Raro
 * - Holo Rare: Versión holográfica
 * - V: Cartas V (Pokémon con "V")
 * - GX: Cartas GX (antiguas)
 * - Ex: Cartas Ex (antiguas)
 *
 * **Tipos de energía:**
 * - Grass (Planta)
 * - Fire (Fuego)
 * - Water (Agua)
 * - Lightning (Rayo)
 * - Psychic (Psíquica)
 * - Fighting (Lucha)
 * - Darkness (Oscuridad)
 * - Metal (Acero)
 * - Fairy (Hada)
 * - Colorless (Incolora)
 *
 * **Integración:**
 * - packHelpers.ts: Genera cartas según rareza
 * - cardHelpers.ts: Icono de tipo
 * - Search filters: Búsqueda por tipo/rareza
 * - Admin: Configuración de game balance
 *
 * **Mantenibilidad:**
 * - Si TCG cambia formato: actualizar aquí
 * - Nuevas raridades: agregar a RARITY_ORDER
 * - Cambio de probabilidades: ajustar weights
 * - Versionado: histórico de cambios
 *
 * @author Proyecto E09
 * @version 1.0.0
 * @module server/constants/pokemon
 * @see utils/packHelpers.ts
 * @see services/cardDataBuilder.ts
 */

/**
 * @file pokemon.ts
 * @description Constantes relacionadas con Pokémon TCG
 *
 * Define valores constantes usados en toda la aplicación para lógica de cartas
 */

/**
 * Orden de raridades para selección de cartas en packs
 * Ordenado de menor a mayor rareza
 *
 * @constant
 * @type {string[]}
 */
export const RARITY_ORDER = [
  'Common',
  'Uncommon',
  'Rare',
  'Holo Rare',
  'Rare Holo',
  'Ultra Rare',
  'Secret Rare',
] as const;

/**
 * Tipo para raridades válidas
 */
export type CardRarity = (typeof RARITY_ORDER)[number];
