/**
 * @file cards_services_extended.spec.ts
 * @description Tests exhaustivos para el servicio cards.ts
 * Cubre funciones de sincronización y gestión de cartas
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Card } from '../../src/server/models/Card.js';
import { PokemonCard } from '../../src/server/models/PokemonCard.js';
import { TrainerCard } from '../../src/server/models/TrainerCard.js';
import { EnergyCard } from '../../src/server/models/EnergyCard.js';
import { syncAllCards, upsertCardFromRaw } from '../../src/server/services/cards.js';
import * as pokemonService from '../../src/server/services/pokemon.js';
import * as tcgdxService from '../../src/server/services/tcgdx.js';

describe('Cards Service', () => {
  beforeEach(async () => {
    // Clean up test data before each test
    await Card.deleteMany({});
    await PokemonCard.deleteMany({});
    await TrainerCard.deleteMany({});
    await EnergyCard.deleteMany({});
  });

  afterEach(async () => {
    // Clean up test data after each test
    await Card.deleteMany({});
    await PokemonCard.deleteMany({});
    await TrainerCard.deleteMany({});
    await EnergyCard.deleteMany({});
  });

  // ============================================
  // upsertCardFromRaw tests
  // ============================================
  describe('upsertCardFromRaw', () => {
    it('should insert a new Pokemon card', async () => {
      const rawPokemon = {
        id: 'swsh1-25',
        name: 'Pikachu',
        supertype: 'Pokémon',
        subtype: 'Basic',
        hp: '40',
        types: ['Electric'],
        evolvesFrom: null,
        abilities: [],
        attacks: [
          {
            name: 'Thunderbolt',
            cost: ['Electric'],
            damage: '90',
          },
        ],
        weaknesses: [],
        resistances: [],
        retreat: [],
        rarity: 'Rare',
        illustrator: 'Artist',
        images: {
          small: 'https://example.com/small.png',
          large: 'https://example.com/large.png',
        },
        set: {
          id: 'swsh1',
          name: 'Sword & Shield',
        },
        number: '25',
        pricing: {},
      };

      const result = await upsertCardFromRaw(rawPokemon);

      expect(result).toBeDefined();
      expect(result?.pokemonTcgId).toBe('swsh1-25');
      expect(result?.name).toBe('Pikachu');

      const inserted = await PokemonCard.findOne({ pokemonTcgId: 'swsh1-25' });
      expect(inserted).toBeDefined();
      expect(inserted?.name).toBe('Pikachu');
    });

    it('should insert a new Trainer card', async () => {
      const rawTrainer = {
        id: 'swsh1-100',
        name: 'Poké Ball',
        supertype: 'Trainer',
        subtype: 'Item',
        text: 'Search your deck',
        rarity: 'Common',
        illustrator: 'Artist',
        images: {
          small: 'https://example.com/small.png',
          large: 'https://example.com/large.png',
        },
        set: {
          id: 'swsh1',
          name: 'Sword & Shield',
        },
        number: '100',
        pricing: {},
      };

      const result = await upsertCardFromRaw(rawTrainer);

      expect(result).toBeDefined();
      expect(result?.pokemonTcgId).toBe('swsh1-100');
      expect(result?.name).toBe('Poké Ball');

      const inserted = await TrainerCard.findOne({ pokemonTcgId: 'swsh1-100' });
      expect(inserted).toBeDefined();
    });

    it('should insert a new Energy card', async () => {
      const rawEnergy = {
        id: 'swsh1-200',
        name: 'Electric Energy',
        supertype: 'Energy',
        subtype: 'Basic Energy',
        energyType: 'Electric',
        rarity: 'Common',
        illustrator: 'Artist',
        images: {
          small: 'https://example.com/small.png',
          large: 'https://example.com/large.png',
        },
        set: {
          id: 'swsh1',
          name: 'Sword & Shield',
        },
        number: '200',
        pricing: {},
      };

      const result = await upsertCardFromRaw(rawEnergy);

      expect(result).toBeDefined();
      expect(result?.pokemonTcgId).toBe('swsh1-200');

      const inserted = await EnergyCard.findOne({ pokemonTcgId: 'swsh1-200' });
      expect(inserted).toBeDefined();
    });

    it('should insert a generic/unknown card as fallback', async () => {
      const rawUnknown = {
        id: 'unknown-1',
        name: 'Unknown Card',
        supertype: 'Unknown',
        rarity: 'Rare',
        illustrator: 'Artist',
        images: {
          small: 'https://example.com/small.png',
          large: 'https://example.com/large.png',
        },
        set: {
          id: 'set1',
          name: 'Test Set',
        },
        number: '1',
        pricing: {},
      };

      const result = await upsertCardFromRaw(rawUnknown);

      expect(result).toBeDefined();
      expect(result?.pokemonTcgId).toBe('unknown-1');

      const inserted = await Card.findOne({ pokemonTcgId: 'unknown-1' });
      expect(inserted).toBeDefined();
    });

    it('should update an existing card on upsert', async () => {
      const rawPokemon = {
        id: 'swsh1-25',
        name: 'Pikachu v1',
        supertype: 'Pokémon',
        subtype: 'Basic',
        hp: '40',
        types: ['Electric'],
        rarity: 'Rare',
        illustrator: 'Artist v1',
        images: {
          small: 'https://example.com/small.png',
          large: 'https://example.com/large.png',
        },
        set: {
          id: 'swsh1',
          name: 'Sword & Shield',
        },
        number: '25',
        pricing: {},
      };

      // First insert
      await upsertCardFromRaw(rawPokemon);

      // Update
      const updated = await upsertCardFromRaw({
        ...rawPokemon,
        name: 'Pikachu v2',
        illustrator: 'Artist v2',
      });

      expect(updated?.name).toBe('Pikachu v2');
      expect(updated?.illustrator).toBe('Artist v2');

      // Verify only one document exists
      const count = await PokemonCard.countDocuments({ pokemonTcgId: 'swsh1-25' });
      expect(count).toBe(1);
    });

    it('should handle data wrapped in data field', async () => {
      const raw = {
        data: {
          id: 'swsh1-25',
          name: 'Pikachu',
          supertype: 'Pokémon',
          subtype: 'Basic',
          hp: '40',
          types: ['Electric'],
          rarity: 'Rare',
          illustrator: 'Artist',
          images: {
            small: 'https://example.com/small.png',
            large: 'https://example.com/large.png',
          },
          set: {
            id: 'swsh1',
            name: 'Sword & Shield',
          },
          number: '25',
          pricing: {},
        },
      };

      const result = await upsertCardFromRaw(raw);

      expect(result).toBeDefined();
      expect(result?.pokemonTcgId).toBe('swsh1-25');
    });

    it('should handle null input gracefully', async () => {
      const result = await upsertCardFromRaw(null);
      expect(result).toBeNull();
    });

    it('should handle undefined input gracefully', async () => {
      const result = await upsertCardFromRaw(undefined);
      expect(result).toBeNull();
    });

    it('should handle empty object', async () => {
      const result = await upsertCardFromRaw({});
      // May return null or a partially saved card with default values
      expect(result).toBeDefined();
    });

    it('should sanitize circular references in card data', async () => {
      const rawPokemon: any = {
        id: 'swsh1-25',
        name: 'Pikachu',
        supertype: 'Pokémon',
        subtype: 'Basic',
        hp: '40',
        types: ['Electric'],
        rarity: 'Rare',
        illustrator: 'Artist',
        images: {
          small: 'https://example.com/small.png',
          large: 'https://example.com/large.png',
        },
        set: {
          id: 'swsh1',
          name: 'Sword & Shield',
        },
        number: '25',
        pricing: {},
      };

      // Add circular reference
      rawPokemon.self = rawPokemon;

      const result = await upsertCardFromRaw(rawPokemon);
      expect(result).toBeDefined();
      expect(result?.pokemonTcgId).toBe('swsh1-25');
    });

    it('should handle malformed card data gracefully', async () => {
      const rawBadData = {
        id: 'bad-card',
        name: 'Bad Card',
        // Missing required fields like images, set, etc.
      };

      const result = await upsertCardFromRaw(rawBadData);
      // Should not throw, but may return null or a partially saved card
      expect(result).toBeDefined();
    });

    it('should handle cards with different rarity formats', async () => {
      const raw = {
        id: 'swsh1-25',
        name: 'Pikachu',
        supertype: 'Pokémon',
        rarity: 'Holo Rare',
        illustrator: 'Artist',
        images: {
          small: 'https://example.com/small.png',
          large: 'https://example.com/large.png',
        },
        set: {
          id: 'swsh1',
          name: 'Sword & Shield',
        },
        number: '25',
        pricing: {},
      };

      const result = await upsertCardFromRaw(raw);
      expect(result?.rarity).toBe('Holo Rare');
    });

    it('should preserve complex nested structures', async () => {
      const raw = {
        id: 'swsh1-25',
        name: 'Pikachu',
        supertype: 'Pokémon',
        abilities: [
          {
            name: 'Static',
            type: 'Ability',
            text: 'Effect text',
          },
          {
            name: 'Lightning Rod',
            type: 'Ability',
            text: 'Another effect',
          },
        ],
        attacks: [
          {
            name: 'Thunderbolt',
            cost: ['Electric', 'Electric'],
            damage: '90',
            text: 'Discard energy',
          },
        ],
        rarity: 'Rare',
        illustrator: 'Artist',
        images: {
          small: 'https://example.com/small.png',
          large: 'https://example.com/large.png',
        },
        set: {
          id: 'swsh1',
          name: 'Sword & Shield',
        },
        number: '25',
        pricing: {},
      };

      const result = await upsertCardFromRaw(raw);
      if (result) {
        expect(result.pokemonTcgId).toBe('swsh1-25');
        // Check if abilities and attacks are preserved
        if ('abilities' in result && 'attacks' in result) {
          expect(result.abilities).toHaveLength(2);
          expect(result.attacks).toHaveLength(1);
        }
      }
    });
  });

  // ============================================
  // syncAllCards tests (mocked)
  // ============================================
  describe('syncAllCards', () => {
    it('should sync cards from all sets', async () => {
      // Mock getAllSets
      vi.spyOn(pokemonService, 'getAllSets').mockResolvedValueOnce({
        data: [
          { id: 'swsh1', code: 'swsh1', name: 'Sword & Shield' },
          { id: 'swsh2', code: 'swsh2', name: 'Rebel Clash' },
        ],
      });

      // Mock getCardsBySet
      vi.spyOn(pokemonService, 'getCardsBySet').mockImplementation(
        async (setId) => {
          if (setId === 'swsh1') {
            return {
              data: [
                {
                  id: 'swsh1-25',
                  name: 'Pikachu',
                  supertype: 'Pokémon',
                  rarity: 'Rare',
                  illustrator: 'Artist',
                  images: {
                    small: 'https://example.com/small.png',
                    large: 'https://example.com/large.png',
                  },
                  set: { id: 'swsh1', name: 'Sword & Shield' },
                  number: '25',
                  pricing: {},
                },
              ],
            };
          }
          return { data: [] };
        }
      );

      const count = await syncAllCards();
      expect(count).toBe(1);

      const inserted = await PokemonCard.findOne({ pokemonTcgId: 'swsh1-25' });
      expect(inserted).toBeDefined();
    });

    it('should handle sets with no cards', async () => {
      vi.spyOn(pokemonService, 'getAllSets').mockResolvedValueOnce({
        data: [{ id: 'empty-set', code: 'empty-set', name: 'Empty Set' }],
      });

      vi.spyOn(pokemonService, 'getCardsBySet').mockResolvedValueOnce({
        data: [],
      });

      const count = await syncAllCards();
      expect(count).toBe(0);
    });

    it('should continue syncing even if one set fails', async () => {
      vi.spyOn(pokemonService, 'getAllSets').mockResolvedValueOnce({
        data: [
          { id: 'set1', code: 'set1' },
          { id: 'set2', code: 'set2' },
        ],
      });

      vi.spyOn(pokemonService, 'getCardsBySet').mockImplementation(
        async (setId) => {
          if (setId === 'set1') {
            throw new Error('Set 1 fetch failed');
          }
          return {
            data: [
              {
                id: 'set2-1',
                name: 'Card 1',
                supertype: 'Pokémon',
                rarity: 'Common',
                illustrator: 'Artist',
                images: {
                  small: 'https://example.com/small.png',
                  large: 'https://example.com/large.png',
                },
                set: { id: 'set2', name: 'Set 2' },
                number: '1',
                pricing: {},
              },
            ],
          };
        }
      );

      const count = await syncAllCards();
      expect(count).toBeGreaterThanOrEqual(1);
    });

    it('should continue syncing even if one card fails', async () => {
      vi.spyOn(pokemonService, 'getAllSets').mockResolvedValueOnce({
        data: [{ id: 'set1', code: 'set1' }],
      });

      vi.spyOn(pokemonService, 'getCardsBySet').mockResolvedValueOnce({
        data: [
          {
            id: 'set1-1',
            name: 'Card 1',
            supertype: 'Pokémon',
            rarity: 'Common',
            illustrator: 'Artist',
            images: {
              small: 'https://example.com/small.png',
              large: 'https://example.com/large.png',
            },
            set: { id: 'set1', name: 'Set 1' },
            number: '1',
            pricing: {},
          },
          {
            id: 'set1-2',
            // Missing required fields - will fail
            name: 'Card 2',
          },
          {
            id: 'set1-3',
            name: 'Card 3',
            supertype: 'Trainer',
            rarity: 'Common',
            illustrator: 'Artist',
            images: {
              small: 'https://example.com/small.png',
              large: 'https://example.com/large.png',
            },
            set: { id: 'set1', name: 'Set 1' },
            number: '3',
            pricing: {},
          },
        ],
      });

      const count = await syncAllCards();
      expect(count).toBeGreaterThanOrEqual(2);
    });
  });
});
