/**
 * @file cardDataBuilder_services_extended.spec.ts
 * @description Tests exhaustivos para el servicio cardDataBuilder.ts
 * Cubre funciones de construcción de datos de cartas para diferentes tipos
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  buildPokemonCardData,
  buildTrainerCardData,
  buildEnergyCardData,
  buildGenericCardData,
} from '../../src/server/services/cardDataBuilder.js';

describe('Card Data Builder Service', () => {
  // Helper para crear un objeto de carta crudo típico
  const createRawPokemonCard = (overrides: any = {}) => ({
    id: 'swsh1-25',
    name: 'Pikachu',
    supertype: 'Pokémon',
    subtype: 'Basic',
    hp: '40',
    types: ['Electric'],
    evolvesFrom: null,
    abilities: [
      {
        name: 'Static',
        type: 'Ability',
        text: 'Whenever this Pokémon is attacked...',
      },
    ],
    attacks: [
      {
        name: 'Thunderbolt',
        cost: ['Electric', 'Electric'],
        damage: '90',
        text: 'Discard an Energy...',
      },
    ],
    weaknesses: [{ type: 'Fighting', value: '×2' }],
    resistances: [{ type: 'Metal', value: '−20' }],
    retreat: ['Colorless'],
    retreatCost: ['Colorless'],
    rarity: 'Rare',
    nationalPokedexNumbers: [25],
    illustrator: 'Artist Name',
    images: {
      small: 'https://assets.tcgdex.net/en/swsh/swsh1/25/small.png',
      large: 'https://assets.tcgdex.net/en/swsh/swsh1/25/large.png',
    },
    set: {
      id: 'swsh1',
      name: 'Sword & Shield',
      series: 'Sword & Shield',
    },
    number: '25',
    pricing: {
      cardmarket: { avg: 15.5 },
      tcgplayer: { holofoil: { marketPrice: 12.0 } },
    },
    ...overrides,
  });

  const createRawTrainerCard = (overrides: any = {}) => ({
    id: 'swsh1-100',
    name: 'Poké Ball',
    supertype: 'Trainer',
    subtype: 'Item',
    text: ['Search your deck for a Pokémon...'],
    effect: 'Find a Pokemon in your deck',
    rarity: 'Common',
    illustrator: 'Artist Name',
    images: {
      small: 'https://assets.tcgdex.net/en/swsh/swsh1/100/small.png',
      large: 'https://assets.tcgdex.net/en/swsh/swsh1/100/large.png',
    },
    set: {
      id: 'swsh1',
      name: 'Sword & Shield',
      series: 'Sword & Shield',
    },
    number: '100',
    pricing: {
      cardmarket: { avg: 0.5 },
      tcgplayer: { holofoil: { marketPrice: 0.25 } },
    },
    ...overrides,
  });

  const createRawEnergyCard = (overrides: any = {}) => ({
    id: 'swsh1-200',
    name: 'Electric Energy',
    supertype: 'Energy',
    subtype: 'Basic Energy',
    energyType: 'Electric',
    text: ['Provides Electric energy...'],
    rarity: 'Common',
    illustrator: 'Artist Name',
    images: {
      small: 'https://assets.tcgdex.net/en/swsh/swsh1/200/small.png',
      large: 'https://assets.tcgdex.net/en/swsh/swsh1/200/large.png',
    },
    set: {
      id: 'swsh1',
      name: 'Sword & Shield',
      series: 'Sword & Shield',
    },
    number: '200',
    pricing: {
      cardmarket: { avg: 0.3 },
      tcgplayer: { holofoil: { marketPrice: 0.1 } },
    },
    ...overrides,
  });

  // ============================================
  // buildPokemonCardData tests
  // ============================================
  describe('buildPokemonCardData', () => {
    it('should build Pokemon card data with all fields', () => {
      const raw = createRawPokemonCard();
      const result = buildPokemonCardData(raw);

      expect(result.pokemonTcgId).toBe('swsh1-25');
      expect(result.name).toBe('Pikachu');
      expect(result.category).toBe('pokemon');
      expect(result.hp).toBe('40');
      expect(result.types).toEqual(['Electric']);
      expect(result.supertype).toBe('Pokémon');
      expect(result.subtype).toBe('Basic');
    });

    it('should normalize image URLs', () => {
      const raw = createRawPokemonCard();
      const result = buildPokemonCardData(raw);

      expect(result.images.small).toContain('high.png');
      expect(result.images.large).toContain('high.png');
    });

    it('should extract prices', () => {
      const raw = createRawPokemonCard();
      const result = buildPokemonCardData(raw);

      expect(result.price.cardmarketAvg).toBe(15.5);
      expect(result.price.tcgplayerMarketPrice).toBe(12.0);
      expect(result.price.avg).toBe(15.5);
    });

    it('should include abilities', () => {
      const raw = createRawPokemonCard();
      const result = buildPokemonCardData(raw);

      expect(result.abilities).toHaveLength(1);
      expect(result.abilities[0].name).toBe('Static');
    });

    it('should include attacks', () => {
      const raw = createRawPokemonCard();
      const result = buildPokemonCardData(raw);

      expect(result.attacks).toHaveLength(1);
      expect(result.attacks[0].name).toBe('Thunderbolt');
      expect(result.attacks[0].damage).toBe('90');
    });

    it('should include weaknesses and resistances', () => {
      const raw = createRawPokemonCard();
      const result = buildPokemonCardData(raw);

      expect(result.weaknesses).toHaveLength(1);
      expect(result.weaknesses[0].type).toBe('Fighting');
      expect(result.resistances).toHaveLength(1);
      expect(result.resistances[0].type).toBe('Metal');
    });

    it('should include retreat cost', () => {
      const raw = createRawPokemonCard();
      const result = buildPokemonCardData(raw);

      expect(result.retreatCost).toEqual(['Colorless']);
    });

    it('should extract national pokedex number', () => {
      const raw = createRawPokemonCard();
      const result = buildPokemonCardData(raw);

      expect(result.nationalPokedexNumber).toBe(25);
    });

    it('should handle data wrapper (data field)', () => {
      const raw = {
        data: createRawPokemonCard(),
      };
      const result = buildPokemonCardData(raw);

      expect(result.pokemonTcgId).toBe('swsh1-25');
      expect(result.name).toBe('Pikachu');
    });

    it('should handle missing optional fields', () => {
      const raw = createRawPokemonCard({
        evolvesFrom: null,
        abilities: null,
        attacks: null,
        weaknesses: null,
        resistances: null,
        nationalPokedexNumbers: null,
      });
      const result = buildPokemonCardData(raw);

      expect(result.evolvesFrom).toBe('');
      expect(result.abilities).toEqual([]);
      expect(result.attacks).toEqual([]);
      expect(result.weaknesses).toEqual([]);
      expect(result.resistances).toEqual([]);
      expect(result.nationalPokedexNumber).toBeNull();
    });

    it('should use retreat as fallback for retreatCost', () => {
      const raw = createRawPokemonCard({ retreatCost: null });
      const result = buildPokemonCardData(raw);

      expect(result.retreatCost).toEqual(['Colorless']);
    });

    it('should include set information', () => {
      const raw = createRawPokemonCard();
      const result = buildPokemonCardData(raw);

      expect(result.series).toBe('Sword & Shield');
      expect(result.set).toBe('Sword & Shield');
    });

    it('should include card number', () => {
      const raw = createRawPokemonCard();
      const result = buildPokemonCardData(raw);

      expect(result.cardNumber).toBe('25');
    });

    it('should include illustrator', () => {
      const raw = createRawPokemonCard();
      const result = buildPokemonCardData(raw);

      expect(result.illustrator).toBe('Artist Name');
    });

    it('should have lastPriceUpdate as a Date', () => {
      const raw = createRawPokemonCard();
      const result = buildPokemonCardData(raw);

      expect(result.lastPriceUpdate).toBeInstanceOf(Date);
    });
  });

  // ============================================
  // buildTrainerCardData tests
  // ============================================
  describe('buildTrainerCardData', () => {
    it('should build Trainer card data with all fields', () => {
      const raw = createRawTrainerCard();
      const result = buildTrainerCardData(raw);

      expect(result.pokemonTcgId).toBe('swsh1-100');
      expect(result.name).toBe('Poké Ball');
      expect(result.category).toBe('trainer');
      expect(result.supertype).toBe('Trainer');
      expect(result.subtype).toBe('Item');
    });

    it('should include text field', () => {
      const raw = createRawTrainerCard();
      const result = buildTrainerCardData(raw);

      expect(result.text).toContain('Search your deck');
    });

    it('should join text array with newlines', () => {
      const raw = createRawTrainerCard({
        text: ['Line 1', 'Line 2', 'Line 3'],
      });
      const result = buildTrainerCardData(raw);

      expect(result.text).toContain('Line 1');
      expect(result.text).toContain('Line 2');
      expect(result.text).toContain('Line 3');
      expect(result.text).toContain('\n');
    });

    it('should include effect field', () => {
      const raw = createRawTrainerCard();
      const result = buildTrainerCardData(raw);

      expect(result.effect).toBe('Find a Pokemon in your deck');
    });

    it('should handle missing text field', () => {
      const raw = createRawTrainerCard({ text: null });
      const result = buildTrainerCardData(raw);

      expect(result.text).toBe('');
    });

    it('should handle missing effect field', () => {
      const raw = createRawTrainerCard({ effect: null });
      const result = buildTrainerCardData(raw);

      expect(result.effect).toBe('');
    });

    it('should handle data wrapper', () => {
      const raw = {
        data: createRawTrainerCard(),
      };
      const result = buildTrainerCardData(raw);

      expect(result.pokemonTcgId).toBe('swsh1-100');
      expect(result.category).toBe('trainer');
    });

    it('should extract prices for trainer cards', () => {
      const raw = createRawTrainerCard();
      const result = buildTrainerCardData(raw);

      expect(result.price.cardmarketAvg).toBe(0.5);
      expect(result.price.tcgplayerMarketPrice).toBe(0.25);
    });
  });

  // ============================================
  // buildEnergyCardData tests
  // ============================================
  describe('buildEnergyCardData', () => {
    it('should build Energy card data with all fields', () => {
      const raw = createRawEnergyCard();
      const result = buildEnergyCardData(raw);

      expect(result.pokemonTcgId).toBe('swsh1-200');
      expect(result.name).toBe('Electric Energy');
      expect(result.category).toBe('energy');
      expect(result.supertype).toBe('Energy');
      expect(result.subtype).toBe('Basic Energy');
    });

    it('should include energyType field', () => {
      const raw = createRawEnergyCard();
      const result = buildEnergyCardData(raw);

      expect(result.energyType).toBe('Electric');
    });

    it('should use subtype as fallback for energyType', () => {
      const raw = createRawEnergyCard({ energyType: null });
      const result = buildEnergyCardData(raw);

      expect(result.energyType).toBe('Basic Energy');
    });

    it('should include text field', () => {
      const raw = createRawEnergyCard();
      const result = buildEnergyCardData(raw);

      expect(result.text).toContain('Provides Electric energy');
    });

    it('should join text arrays with newlines', () => {
      const raw = createRawEnergyCard({
        text: ['Effect 1', 'Effect 2'],
      });
      const result = buildEnergyCardData(raw);

      expect(result.text).toContain('Effect 1');
      expect(result.text).toContain('Effect 2');
    });

    it('should handle missing text', () => {
      const raw = createRawEnergyCard({ text: null });
      const result = buildEnergyCardData(raw);

      expect(result.text).toBe('');
    });

    it('should handle data wrapper', () => {
      const raw = {
        data: createRawEnergyCard(),
      };
      const result = buildEnergyCardData(raw);

      expect(result.pokemonTcgId).toBe('swsh1-200');
      expect(result.category).toBe('energy');
    });

    it('should extract prices for energy cards', () => {
      const raw = createRawEnergyCard();
      const result = buildEnergyCardData(raw);

      expect(result.price.cardmarketAvg).toBe(0.3);
      expect(result.price.tcgplayerMarketPrice).toBe(0.1);
    });
  });

  // ============================================
  // buildGenericCardData tests
  // ============================================
  describe('buildGenericCardData', () => {
    it('should build generic card data as fallback', () => {
      const raw = createRawPokemonCard({
        supertype: 'Unknown',
      });
      const result = buildGenericCardData(raw);

      expect(result.pokemonTcgId).toBe('swsh1-25');
      expect(result.name).toBe('Pikachu');
      expect(result.category).toBe('unknown');
    });

    it('should include basic fields', () => {
      const raw = createRawPokemonCard({ supertype: 'Unknown' });
      const result = buildGenericCardData(raw);

      expect(result.series).toBe('Sword & Shield');
      expect(result.set).toBe('Sword & Shield');
      expect(result.rarity).toBe('Rare');
      expect(result.illustrator).toBe('Artist Name');
    });

    it('should include types array', () => {
      const raw = createRawPokemonCard({ supertype: 'Unknown' });
      const result = buildGenericCardData(raw);

      expect(result.types).toEqual(['Electric']);
    });

    it('should include image URLs', () => {
      const raw = createRawPokemonCard({ supertype: 'Unknown' });
      const result = buildGenericCardData(raw);

      expect(result.imageUrl).toContain('high.png');
      expect(result.imageUrlHiRes).toContain('high.png');
    });

    it('should include price data', () => {
      const raw = createRawPokemonCard({ supertype: 'Unknown' });
      const result = buildGenericCardData(raw);

      expect(result.price.cardmarketAvg).toBe(15.5);
      expect(result.price.avg).toBe(15.5);
    });

    it('should include national pokedex number if available', () => {
      const raw = createRawPokemonCard({ supertype: 'Unknown' });
      const result = buildGenericCardData(raw);

      expect(result.nationalPokedexNumber).toBe(25);
    });

    it('should include card number', () => {
      const raw = createRawPokemonCard({ supertype: 'Unknown' });
      const result = buildGenericCardData(raw);

      expect(result.cardNumber).toBe('25');
    });

    it('should have lastPriceUpdate', () => {
      const raw = createRawPokemonCard({ supertype: 'Unknown' });
      const result = buildGenericCardData(raw);

      expect(result.lastPriceUpdate).toBeInstanceOf(Date);
    });

    it('should handle data wrapper', () => {
      const raw = {
        data: createRawPokemonCard({ supertype: 'Unknown' }),
      };
      const result = buildGenericCardData(raw);

      expect(result.pokemonTcgId).toBe('swsh1-25');
      expect(result.category).toBe('unknown');
    });

    it('should handle missing national pokedex number', () => {
      const raw = createRawPokemonCard({
        supertype: 'Unknown',
        nationalPokedexNumbers: null,
      });
      const result = buildGenericCardData(raw);

      expect(result.nationalPokedexNumber).toBeNull();
    });
  });

  // ============================================
  // Integration/Cross-cutting tests
  // ============================================
  describe('Integration across card builders', () => {
    it('should all handle missing pricing data', () => {
      const raw = createRawPokemonCard({ pricing: {} });

      const pokemon = buildPokemonCardData(raw);
      const trainer = buildTrainerCardData(
        createRawTrainerCard({ pricing: {} })
      );
      const energy = buildEnergyCardData(createRawEnergyCard({ pricing: {} }));

      expect(pokemon.price.avg).toBe(0);
      expect(trainer.price.avg).toBe(0);
      expect(energy.price.avg).toBe(0);
    });

    it('should all normalize images properly', () => {
      const raw = createRawPokemonCard({
        images: {
          small: 'https://assets.tcgdex.net/en/swsh/swsh1/25/small.png',
          large: 'https://assets.tcgdex.net/en/swsh/swsh1/25/small.png',
        },
      });

      const pokemon = buildPokemonCardData(raw);
      const trainer = buildTrainerCardData(
        createRawTrainerCard({
          images: {
            small: 'https://assets.tcgdex.net/en/swsh/swsh1/100/low.png',
            large: 'https://assets.tcgdex.net/en/swsh/swsh1/100/low.png',
          },
        })
      );

      // Both should normalize to high.png
      expect(pokemon.images.small).toContain('high.png');
      expect(trainer.images.large).toContain('high.png');
    });

    it('should all include lastPriceUpdate timestamp', () => {
      const before = new Date();
      const pokemon = buildPokemonCardData(createRawPokemonCard());
      const trainer = buildTrainerCardData(createRawTrainerCard());
      const energy = buildEnergyCardData(createRawEnergyCard());
      const generic = buildGenericCardData(
        createRawPokemonCard({ supertype: 'Unknown' })
      );
      const after = new Date();

      [pokemon.lastPriceUpdate, trainer.lastPriceUpdate, energy.lastPriceUpdate, generic.lastPriceUpdate].forEach(
        (timestamp) => {
          expect(timestamp).toBeInstanceOf(Date);
          expect(timestamp.getTime()).toBeGreaterThanOrEqual(before.getTime());
          expect(timestamp.getTime()).toBeLessThanOrEqual(after.getTime());
        }
      );
    });
  });
});
