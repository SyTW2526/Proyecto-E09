// services/pokemon.ts
import 'dotenv/config';

const POKEMON_TCG_BASE_URL = 'https://api.pokemontcg.io/v2';
const API_KEY = process.env.POKEMON_TCG_API_KEY;

async function apiFetch(endpoint: string) {
  const response = await fetch(`${POKEMON_TCG_BASE_URL}${endpoint}`, {
    headers: {
      'X-Api-Key': API_KEY!,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Pokemon TCG API Error: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Obtiene una carta por nombre o ID
 */
export async function getPokemon(nameOrId: string) {
  // Búsqueda por nombre (puede devolver varias cartas)
  return apiFetch(`/cards?q=name:${nameOrId}`);
}

/**
 * Lista cartas con paginación
 */
export async function getPokemonList(limit = 20, offset = 0) {
  const page = Math.floor(offset / limit) + 1;
  return apiFetch(`/cards?page=${page}&pageSize=${limit}`);
}

/**
 * Obtiene multiples cartas por array de IDs
 */
export async function getMultiplePokemon(ids: string[]) {
  const query = ids.map(id => `id:${id}`).join(" OR ");
  return apiFetch(`/cards?q=${query}`);
}

/**
 * Obtiene una carta aleatoria
 */
export async function getRandomPokemon() {
  const randomPage = Math.floor(Math.random() * 100);
  const list = await getPokemonList(1, randomPage);
  return list.data?.[0];
}