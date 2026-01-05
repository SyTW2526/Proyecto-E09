/**
 * @file types.ts
 * @description Definiciones de tipos TypeScript para la aplicación cliente
 *
 * Centraliza todas las interfaces y tipos utilizados en toda la aplicación,
 * proporcionando type-safety para:
 * - Cartas Pokémon y sus propiedades (rareza, ataques, precios)
 * - Usuarios y datos de perfil
 * - Trading y solicitudes comerciales
 * - Respuestas de API (éxito, paginadas)
 * - Notificaciones y preferencias
 *
 * @author Proyecto E09
 * @version 1.0.0
 * @module types
 * @requires TypeScript
 */

/**
 * Tipos de Pokémon disponibles en TCG
 * @typedef {string} PokemonType
 */
export type PokemonType =
  | 'Fire'
  | 'Water'
  | 'Grass'
  | 'Electric'
  | 'Psychic'
  | 'Fighting'
  | 'Darkness'
  | 'Metal'
  | 'Fairy'
  | 'Dragon'
  | 'Colorless';

/**
 * Interface para una Carta Pokémon
 * @interface PokemonCard
 * @property {string} id - Identificador único de la carta
 * @property {string} name - Nombre de la carta
 * @property {string} image - URL de la imagen
 * @property {string} hp - Puntos de salud
 * @property {PokemonType} type - Tipo del Pokémon
 * @property {Rarity} rarity - Nivel de rareza
 * @property {CardPrice} [price] - Información de precios
 * @property {Attack[]} [attacks] - Ataques disponibles
 * @property {string} [weakness] - Debilidad de tipo
 * @property {number} [retreat] - Costo de retirada
 * @property {string} [description] - Descripción de la carta
 * @property {string} [number] - Número de la carta en el set
 * @property {string} [set] - Conjunto/Extensión
 */
// Tipos para las cartas Pokémon
export interface PokemonCard {
  id: string;
  name: string;
  image: string;
  hp: string;
  type: PokemonType;
  rarity: Rarity;
  price?: CardPrice;
  attacks?: Attack[];
  weakness?: string;
  retreat?: number;
  description?: string;
  number?: string;
  set?: string;
}

export type Rarity =
  | 'Common'
  | 'Uncommon'
  | 'Rare'
  | 'Holo Rare'
  | 'Ultra Rare'
  | 'Secret Rare';

export interface Attack {
  name: string;
  cost: string[];
  damage: number;
  text?: string;
}

export interface CardPrice {
  low: number;
  mid: number;
  high: number;
  market?: number;
}

// Tipos para la API
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// Tipos para el usuario
export interface User {
  id: string;
  username: string;
  email: string;
  profileImage?: string;
  collection: string[];
  wishlist: string[];
  trades: Trade[];
}
// Tipo para las cartas del usuario
export interface UserOwnedCard {
  id: string;
  name: string;
  image: string;
  rarity: string;
  forTrade: boolean;
}

export type TradeStatus = 'pending' | 'accepted' | 'rejected' | 'completed';
export interface Trade {
  id: string;
  from: string;
  to: string;
  offeredCards: string[];
  requestedCards: string[];
  status: TradeStatus;
  createdAt: Date;
}
