import { Card } from '../models/Card.js';
import { getAllSets, getCardsBySet } from './pokemon.js';

/**
 * Sincroniza todas las cartas desde la API externa hacia la base de datos local
 * @returns El número total de cartas procesadas
 */
export async function syncAllCards() {
  console.log('Iniciando sincronización de cartas');

  const setsResponse = await getAllSets();
  const sets = setsResponse.data ?? setsResponse; 

  let count = 0;

  for (const set of sets) {
    const setId = set.id || set.code;
    console.log(`Sincronizando set: ${setId}...`);

    try {
      const cardsResponse = await getCardsBySet(setId);
      const cards = cardsResponse.data ?? cardsResponse;

      for (const c of cards) {
        await Card.findOneAndUpdate(
          { pokemonTcgId: c.id },
          {
            pokemonTcgId: c.id,
            name: c.name,
            series: c.set?.series || '',
            set: c.set?.name || '',
            rarity: c.rarity || '',
            types: c.types || [],
            imageUrl: c.images?.small || '',
            imageUrlHiRes: c.images?.large || '',
            nationalPokedexNumber: c.nationalPokedexNumbers?.[0] || null,
            artist: c.artist || '',
            cardNumber: c.number || '',
            lastPriceUpdate: new Date()
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        count++;
      }
    } catch (err) {
      console.error(`Error al sincronizar el set ${setId}:`, err.message);
    }
  }

  console.log(`Sincronización completada. Total de cartas procesadas: ${count}`);
  return count;
}
