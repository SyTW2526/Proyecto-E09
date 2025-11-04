/**
 * Pokemon API Service
 * Servicio para conectar con la API de Pokemon (PokeAPI)
 */

const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2';

export interface PokemonData {
  id: number;
  name: string;
  sprites: {
    front_default: string;
    back_default: string;
    front_shiny: string;
    back_shiny: string;
  };
  types: Array<{
    slot: number;
    type: {
      name: string;
      url: string;
    };
  }>;
  stats: Array<{
    base_stat: number;
    effort: number;
    stat: {
      name: string;
      url: string;
    };
  }>;
  height: number;
  weight: number;
}

export interface PokemonListItem {
  name: string;
  url: string;
}

export interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PokemonListItem[];
}

/**
 * Obtiene un Pokemon por su nombre o ID
 * @param nameOrId - Nombre o ID del Pokemon
 * @returns Datos del Pokemon
 */
export async function getPokemon(nameOrId: string | number): Promise<PokemonData> {
  try {
    const response = await fetch(`${POKEAPI_BASE_URL}/pokemon/${nameOrId}`);
    
    if (!response.ok) {
      throw new Error(`Error fetching Pokemon: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data as PokemonData;
  } catch (error) {
    console.error('Error in getPokemon:', error);
    throw error;
  }
}

/**
 * Obtiene una lista de Pokemon con paginación
 * @param limit - Número de Pokemon a obtener (por defecto 20)
 * @param offset - Offset para la paginación (por defecto 0)
 * @returns Lista de Pokemon
 */
export async function getPokemonList(limit: number = 20, offset: number = 0): Promise<PokemonListResponse> {
  try {
    const response = await fetch(`${POKEAPI_BASE_URL}/pokemon?limit=${limit}&offset=${offset}`);
    
    if (!response.ok) {
      throw new Error(`Error fetching Pokemon list: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data as PokemonListResponse;
  } catch (error) {
    console.error('Error in getPokemonList:', error);
    throw error;
  }
}

/**
 * Obtiene múltiples Pokemon por sus IDs
 * @param ids - Array de IDs de Pokemon
 * @returns Array de datos de Pokemon
 */
export async function getMultiplePokemon(ids: number[]): Promise<PokemonData[]> {
  try {
    const promises = ids.map(id => getPokemon(id));
    return await Promise.all(promises);
  } catch (error) {
    console.error('Error in getMultiplePokemon:', error);
    throw error;
  }
}

/**
 * Obtiene un Pokemon aleatorio (del 1 al 151 - primera generación)
 * @returns Datos de un Pokemon aleatorio
 */
export async function getRandomPokemon(): Promise<PokemonData> {
  const randomId = Math.floor(Math.random() * 151) + 1;
  return getPokemon(randomId);
}
