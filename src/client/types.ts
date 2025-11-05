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
  collection: string[];
  wishlist: string[];
  trades: Trade[];
}

export interface Trade {
  id: string;
  from: string;
  to: string;
  offeredCards: string[];
  requestedCards: string[];
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  createdAt: Date;
}