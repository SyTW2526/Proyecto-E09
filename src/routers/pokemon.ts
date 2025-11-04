import { Router, Request, Response } from 'express';
import { 
  getPokemon, 
  getPokemonList, 
  getRandomPokemon,
  getMultiplePokemon 
} from '../services/pokemon.js';

export const pokemonRouter = Router();

/**
 * GET /pokemon/list
 * Obtiene una lista de Pokemon con paginación
 */
pokemonRouter.get('/pokemon/list', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    
    const pokemonList = await getPokemonList(limit, offset);
    res.send(pokemonList);
  } catch (error) {
    res.status(500).send({ error: 'Error fetching Pokemon list' });
  }
});

/**
 * GET /pokemon/random
 * Obtiene un Pokemon aleatorio
 */
pokemonRouter.get('/pokemon/random', async (req: Request, res: Response) => {
  try {
    const pokemon = await getRandomPokemon();
    res.send(pokemon);
  } catch (error) {
    res.status(500).send({ error: 'Error fetching random Pokemon' });
  }
});

/**
 * GET /pokemon/:nameOrId
 * Obtiene un Pokemon específico por nombre o ID
 */
pokemonRouter.get('/pokemon/:nameOrId', async (req: Request, res: Response) => {
  try {
    const { nameOrId } = req.params;
    const pokemon = await getPokemon(nameOrId);
    res.send(pokemon);
  } catch (error) {
    res.status(404).send({ error: 'Pokemon not found' });
  }
});

/**
 * POST /pokemon/multiple
 * Obtiene múltiples Pokemon por sus IDs
 * Body: { ids: number[] }
 */
pokemonRouter.post('/pokemon/multiple', async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;
    
    if (!Array.isArray(ids)) {
      return res.status(400).send({ error: 'ids must be an array' });
    }
    
    const pokemon = await getMultiplePokemon(ids);
    res.send(pokemon);
  } catch (error) {
    res.status(500).send({ error: 'Error fetching multiple Pokemon' });
  }
});
