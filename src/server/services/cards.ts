import { Card } from '../models/Card.js';
import { PokemonCard } from '../models/PokemonCard.js';
import { TrainerCard } from '../models/TrainerCard.js';
import { EnergyCard } from '../models/EnergyCard.js';
import { getAllSets, getCardsBySet } from './pokemon.js';
import { sanitizeBriefCard, getCardCategory } from '../services/tcgdx.js';

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

      for (const raw of cards) {
        const c = sanitizeBriefCard(raw);
        const category = getCardCategory(c);

        try {
          if (category === 'pokemon') {
            await PokemonCard.findOneAndUpdate(
              { pokemonTcgId: c.id },
              {
                pokemonTcgId: c.id,
                name: c.name,
                supertype: c.supertype || '',
                subtype: c.subtype || '',
                hp: c.hp || '',
                types: c.types || [],
                evolvesFrom: c.evolvesFrom || '',
                abilities: c.abilities || [],
                attacks: c.attacks || [],
                weaknesses: c.weaknesses || [],
                resistances: c.resistances || [],
                retreatCost: c.retreat || c.retreatCost || [],
                series: c.set?.series || '',
                set: c.set?.name || '',
                rarity: c.rarity || '',
                images: { small: c.images?.small || '', large: c.images?.large || '' },
                nationalPokedexNumber: c.nationalPokedexNumbers?.[0] || null,
                artist: c.artist || '',
                cardNumber: c.number || '',
                lastPriceUpdate: new Date()
              },
              { upsert: true, new: true, setDefaultsOnInsert: true }
            );
          } else if (category === 'trainer') {
            await TrainerCard.findOneAndUpdate(
              { pokemonTcgId: c.id },
              {
                pokemonTcgId: c.id,
                name: c.name,
                supertype: c.supertype || '',
                subtype: c.subtype || '',
                series: c.set?.series || '',
                set: c.set?.name || '',
                rarity: c.rarity || '',
                images: { small: c.images?.small || '', large: c.images?.large || '' },
                text: Array.isArray(c.text) ? c.text.join('\n') : c.text || '',
                effect: c.effect || '',
                artist: c.artist || '',
                cardNumber: c.number || '',
                lastPriceUpdate: new Date()
              },
              { upsert: true, new: true, setDefaultsOnInsert: true }
            );
          } else if (category === 'energy') {
            await EnergyCard.findOneAndUpdate(
              { pokemonTcgId: c.id },
              {
                pokemonTcgId: c.id,
                name: c.name,
                supertype: c.supertype || '',
                subtype: c.subtype || '',
                energyType: c?.energyType || (c?.subtype || ''),
                series: c.set?.series || '',
                set: c.set?.name || '',
                rarity: c.rarity || '',
                images: { small: c.images?.small || '', large: c.images?.large || '' },
                text: Array.isArray(c.text) ? c.text.join('\n') : c.text || '',
                artist: c.artist || '',
                cardNumber: c.number || '',
                lastPriceUpdate: new Date()
              },
              { upsert: true, new: true, setDefaultsOnInsert: true }
            );
          } else {
            // fallback to existing generic Card model for unknown types
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
          }

          count++;
        } catch (err) {
          console.error(`Error saving card ${c?.id || c?.name}:`, (err as Error).message ?? String(err));
        }
      }
    } catch (error) {
      console.error(`Error al sincronizar el set ${setId}:`, (error as Error).message ?? String(error));
    }
  }

  console.log(`Sincronización completada. Total de cartas procesadas: ${count}`);
  return count;
}
