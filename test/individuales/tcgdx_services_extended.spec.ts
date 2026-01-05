/**
 * @file tcgdx_services_extended.spec.ts
 * @description Tests exhaustivos para el servicio tcgdx.ts
 * Cubre funciones de sanitización, categorización, normalización y extracción de precios
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  sanitizeBriefCard,
  getCardCategory,
  normalizeImageUrl,
  extractPrices,
  normalizeSearchCard,
} from '../../src/server/services/tcgdx.js';

describe('TCGdex Service Functions', () => {
  // ============================================
  // sanitizeBriefCard tests
  // ============================================
  describe('sanitizeBriefCard', () => {
    it('should return a sanitized copy of the input object', () => {
      const input = { name: 'Pikachu', type: 'Electric' };
      const result = sanitizeBriefCard(input);
      expect(result).toEqual(input);
      // Note: sanitization may not create new references for simple objects
      // The important thing is that circular references are removed
    });

    it('should remove circular references', () => {
      const input: any = { name: 'Pikachu', type: 'Electric' };
      input.self = input; // Create circular reference
      expect(() => sanitizeBriefCard(input)).not.toThrow();
      const result = sanitizeBriefCard(input);
      expect(result.name).toBe('Pikachu');
      expect(result.type).toBe('Electric');
      // self should be removed after sanitization
      expect(result.self).toBeUndefined();
    });

    it('should handle nested objects with circular references', () => {
      const input: any = {
        name: 'Pikachu',
        data: { hp: 100 },
      };
      input.data.card = input; // Create circular reference
      const result = sanitizeBriefCard(input);
      expect(result.name).toBe('Pikachu');
      expect(result.data.hp).toBe(100);
      // The circular reference should be removed
      expect('card' in result.data && result.data.card).toBeFalsy();
    });

    it('should handle empty objects', () => {
      const input = {};
      const result = sanitizeBriefCard(input);
      expect(result).toEqual({});
    });

    it('should handle objects with null and undefined values', () => {
      const input = { name: 'Pikachu', value: null, optional: undefined };
      const result = sanitizeBriefCard(input);
      expect(result.name).toBe('Pikachu');
      expect(result.value).toBeNull();
      // undefined gets removed by JSON.stringify
    });

    it('should handle deeply nested objects', () => {
      const input = {
        level1: {
          level2: {
            level3: {
              name: 'Pikachu',
              hp: 100,
            },
          },
        },
      };
      const result = sanitizeBriefCard(input);
      expect(result.level1.level2.level3.name).toBe('Pikachu');
      expect(result.level1.level2.level3.hp).toBe(100);
    });

    it('should handle arrays in objects', () => {
      const input = {
        name: 'Pikachu',
        types: ['Electric'],
        abilities: [{ name: 'Static' }, { name: 'Lightning Rod' }],
      };
      const result = sanitizeBriefCard(input);
      expect(result.types).toEqual(['Electric']);
      expect(result.abilities).toHaveLength(2);
      expect(result.abilities[0].name).toBe('Static');
    });

    it('should handle primitive types', () => {
      const input = {
        string: 'text',
        number: 42,
        boolean: true,
        null: null,
      };
      const result = sanitizeBriefCard(input);
      expect(result.string).toBe('text');
      expect(result.number).toBe(42);
      expect(result.boolean).toBe(true);
      expect(result.null).toBeNull();
    });
  });

  // ============================================
  // getCardCategory tests
  // ============================================
  describe('getCardCategory', () => {
    it('should return "pokemon" for Pokémon cards', () => {
      const card = { supertype: 'Pokémon' };
      expect(getCardCategory(card)).toBe('pokemon');
    });

    it('should return "pokemon" for cards with type field containing "pokemon"', () => {
      const card = { type: 'Pokemon' };
      expect(getCardCategory(card)).toBe('pokemon');
    });

    it('should return "trainer" for Trainer cards', () => {
      const card = { supertype: 'Trainer' };
      expect(getCardCategory(card)).toBe('trainer');
    });

    it('should return "energy" for Energy cards', () => {
      const card = { supertype: 'Energy' };
      expect(getCardCategory(card)).toBe('energy');
    });

    it('should return "pokemon" if types array exists and is not empty', () => {
      const card = { types: ['Water', 'Electric'] };
      expect(getCardCategory(card)).toBe('pokemon');
    });

    it('should be case-insensitive', () => {
      expect(getCardCategory({ supertype: 'POKEMON' })).toBe('pokemon');
      expect(getCardCategory({ supertype: 'trainer' })).toBe('trainer');
      expect(getCardCategory({ supertype: 'ENERGY' })).toBe('energy');
    });

    it('should return "unknown" for unrecognized categories', () => {
      const card = { supertype: 'Unknown' };
      expect(getCardCategory(card)).toBe('unknown');
    });

    it('should return "unknown" for empty objects', () => {
      const card = {};
      expect(getCardCategory(card)).toBe('unknown');
    });

    it('should handle partial matches', () => {
      const card = { supertype: 'A Pokemon card' };
      expect(getCardCategory(card)).toBe('pokemon');
    });
  });

  // ============================================
  // normalizeImageUrl tests
  // ============================================
  describe('normalizeImageUrl', () => {
    it('should return empty string for null/undefined input', () => {
      expect(normalizeImageUrl(null)).toBe('');
      expect(normalizeImageUrl(undefined)).toBe('');
    });

    it('should handle empty string input', () => {
      expect(normalizeImageUrl('')).toBe('');
    });

    it('should normalize /small.png to /high.png', () => {
      const url = 'https://assets.tcgdex.net/en/swsh/swsh1/25/small.png';
      expect(normalizeImageUrl(url)).toBe(
        'https://assets.tcgdex.net/en/swsh/swsh1/25/high.png'
      );
    });

    it('should normalize /large.png to /high.png', () => {
      const url = 'https://assets.tcgdex.net/en/swsh/swsh1/25/large.png';
      expect(normalizeImageUrl(url)).toBe(
        'https://assets.tcgdex.net/en/swsh/swsh1/25/high.png'
      );
    });

    it('should normalize /low.png to /high.png', () => {
      const url = 'https://assets.tcgdex.net/en/swsh/swsh1/25/low.png';
      expect(normalizeImageUrl(url)).toBe(
        'https://assets.tcgdex.net/en/swsh/swsh1/25/high.png'
      );
    });

    it('should return url unchanged if already /high.png', () => {
      const url = 'https://assets.tcgdex.net/en/swsh/swsh1/25/high.png';
      expect(normalizeImageUrl(url)).toBe(url);
    });

    it('should change jp to en', () => {
      const url = 'https://assets.tcgdex.net/jp/swsh/swsh1/25/high.png';
      const result = normalizeImageUrl(url);
      expect(result).toContain('/en/');
    });

    it('should fix missing series in 2-segment format', () => {
      const url = 'https://assets.tcgdex.net/jp/swsh1/25/low.png';
      const result = normalizeImageUrl(url);
      expect(result).toContain('/en/swsh/swsh1/');
      expect(result).toContain('/high.png');
    });

    it('should handle non-TCGdex URLs', () => {
      const url = 'https://example.com/card.png';
      const result = normalizeImageUrl(url);
      expect(result).toBe('https://example.com/card.png');
    });

    it('should trim whitespace', () => {
      const url = '  https://assets.tcgdex.net/en/swsh/swsh1/25/high.png  ';
      const result = normalizeImageUrl(url);
      expect(result).toBe(
        'https://assets.tcgdex.net/en/swsh/swsh1/25/high.png'
      );
    });

    it('should handle URLs without file extension by adding /high.png', () => {
      const url = 'https://assets.tcgdex.net/en/swsh/swsh1/25';
      const result = normalizeImageUrl(url);
      expect(result).toContain('/high.png');
    });

    it('should handle 3-segment format with incorrect series', () => {
      const url = 'https://assets.tcgdex.net/en/ba/base1/25/low.png';
      const result = normalizeImageUrl(url);
      expect(result).toContain('/high.png');
    });
  });

  // ============================================
  // extractPrices tests
  // ============================================
  describe('extractPrices', () => {
    it('should extract cardmarket average price', () => {
      const card = {
        pricing: {
          cardmarket: {
            avg: 15.5,
          },
        },
      };
      const result = extractPrices(card);
      expect(result.cardmarketAvg).toBe(15.5);
    });

    it('should extract tcgplayer market price from holofoil', () => {
      const card = {
        pricing: {
          tcgplayer: {
            holofoil: {
              marketPrice: 12.0,
            },
          },
        },
      };
      const result = extractPrices(card);
      expect(result.tcgplayerMarketPrice).toBe(12.0);
    });

    it('should prefer holofoil.marketPrice over holofoil.midPrice', () => {
      const card = {
        pricing: {
          tcgplayer: {
            holofoil: {
              marketPrice: 12.0,
              midPrice: 10.0,
            },
          },
        },
      };
      const result = extractPrices(card);
      expect(result.tcgplayerMarketPrice).toBe(12.0);
    });

    it('should handle older cardmarket structure', () => {
      const card = {
        cardmarket: {
          prices: {
            avg: 14.5,
          },
        },
      };
      const result = extractPrices(card);
      expect(result.cardmarketAvg).toBe(14.5);
    });

    it('should handle older tcgplayer structure', () => {
      const card = {
        tcg: {
          prices: {
            market: 13.0,
          },
        },
      };
      const result = extractPrices(card);
      expect(result.tcgplayerMarketPrice).toBe(13.0);
    });

    it('should compute average from available prices', () => {
      const card = {
        pricing: {
          cardmarket: {
            avg: 10.0,
          },
        },
      };
      const result = extractPrices(card);
      expect(result.avg).toBe(10.0);
    });

    it('should prefer cardmarketAvg over tcgplayerMarketPrice for avg', () => {
      const card = {
        pricing: {
          cardmarket: {
            avg: 15.0,
          },
          tcgplayer: {
            holofoil: {
              marketPrice: 12.0,
            },
          },
        },
      };
      const result = extractPrices(card);
      expect(result.avg).toBe(15.0);
    });

    it('should return null for missing prices', () => {
      const card = {};
      const result = extractPrices(card);
      expect(result.cardmarketAvg).toBeNull();
      expect(result.tcgplayerMarketPrice).toBeNull();
      expect(result.avg).toBeNull();
    });

    it('should handle alternative cardmarket field names', () => {
      const card = {
        cardmarket: {
          prices: {
            average: 14.5,
          },
        },
      };
      const result = extractPrices(card);
      expect(result.cardmarketAvg).toBe(14.5);
    });

    it('should extract from top-level marketPrice field', () => {
      const card = {
        marketPrice: 20.0,
      };
      const result = extractPrices(card);
      expect(result.tcgplayerMarketPrice).toBe(20.0);
    });

    it('should handle multiple price fallbacks', () => {
      const card = {
        pricing: {
          cardmarket: {
            // No avg, try average
            average: 11.0,
          },
          tcgplayer: {
            holofoil: {
              // No marketPrice, try midPrice
              midPrice: 9.5,
            },
          },
        },
      };
      const result = extractPrices(card);
      expect(result.cardmarketAvg).toBe(11.0);
      expect(result.tcgplayerMarketPrice).toBe(9.5);
    });
  });

  // ============================================
  // normalizeSearchCard tests
  // ============================================
  describe('normalizeSearchCard', () => {
    it('should normalize a basic card object', () => {
      const card = {
        id: 'swsh1-25',
        name: 'Pikachu',
        image: 'https://assets.tcgdex.net/en/swsh/swsh1/25/high.png',
        set: {
          id: 'swsh1',
          name: 'Sword & Shield',
        },
        rarity: 'Rare',
        types: ['Electric'],
      };
      const result = normalizeSearchCard(card);
      expect(result.id).toBe('swsh1-25');
      expect(result.name).toBe('Pikachu');
      expect(result.setId).toBe('swsh1');
      expect(result.set).toBe('Sword & Shield');
      expect(result.rarity).toBe('Rare');
      expect(result.types).toEqual(['Electric']);
    });

    it('should handle missing image', () => {
      const card = {
        id: 'swsh1-25',
        name: 'Pikachu',
      };
      const result = normalizeSearchCard(card);
      expect(result.images).toEqual({});
    });

    it('should create images object from single image URL', () => {
      const card = {
        id: 'swsh1-25',
        name: 'Pikachu',
        image: 'https://example.com/pikachu.png',
      };
      const result = normalizeSearchCard(card);
      expect(result.images.small).toBe('https://example.com/pikachu.png');
      expect(result.images.large).toBe('https://example.com/pikachu.png');
    });

    it('should use imageUrl if image is not provided', () => {
      const card = {
        id: 'swsh1-25',
        name: 'Pikachu',
        imageUrl: 'https://example.com/pikachu.png',
      };
      const result = normalizeSearchCard(card);
      expect(result.images.small).toBe('https://example.com/pikachu.png');
    });

    it('should use existing images object if provided', () => {
      const card = {
        id: 'swsh1-25',
        name: 'Pikachu',
        images: {
          small: 'https://example.com/small.png',
          large: 'https://example.com/large.png',
        },
      };
      const result = normalizeSearchCard(card);
      expect(result.images.small).toBe('https://example.com/small.png');
      expect(result.images.large).toBe('https://example.com/large.png');
    });

    it('should handle set object with code field', () => {
      const card = {
        id: 'swsh1-25',
        name: 'Pikachu',
        set: {
          code: 'swsh1',
          name: 'Sword & Shield',
        },
      };
      const result = normalizeSearchCard(card);
      expect(result.setId).toBe('swsh1');
    });

    it('should handle setId/setCode fields directly', () => {
      const card = {
        id: 'swsh1-25',
        name: 'Pikachu',
        setId: 'custom-id',
        setCode: 'custom-code',
      };
      const result = normalizeSearchCard(card);
      expect(result.setId).toBe('custom-id');
    });

    it('should handle string set value', () => {
      const card = {
        id: 'swsh1-25',
        name: 'Pikachu',
        set: 'Sword & Shield',
      };
      const result = normalizeSearchCard(card);
      expect(result.setId).toBe('Sword & Shield');
      expect(result.set).toBe('Sword & Shield');
    });

    it('should handle missing rarity', () => {
      const card = {
        id: 'swsh1-25',
        name: 'Pikachu',
      };
      const result = normalizeSearchCard(card);
      expect(result.rarity).toBe('');
    });

    it('should use rarityText as fallback', () => {
      const card = {
        id: 'swsh1-25',
        name: 'Pikachu',
        rarityText: 'Holo Rare',
      };
      const result = normalizeSearchCard(card);
      expect(result.rarity).toBe('Holo Rare');
    });

    it('should handle empty types array', () => {
      const card = {
        id: 'swsh1-25',
        name: 'Pikachu',
        types: [],
      };
      const result = normalizeSearchCard(card);
      expect(result.types).toEqual([]);
    });

    it('should use _id as fallback for id', () => {
      const card = {
        _id: 'mongo-id',
        name: 'Pikachu',
      };
      const result = normalizeSearchCard(card);
      expect(result.id).toBe('mongo-id');
    });

    it('should use title as fallback for name', () => {
      const card = {
        id: 'swsh1-25',
        title: 'Pikachu Card',
      };
      const result = normalizeSearchCard(card);
      expect(result.name).toBe('Pikachu Card');
    });

    it('should set pokemonTcgId from id field', () => {
      const card = {
        id: 'swsh1-25',
        name: 'Pikachu',
      };
      const result = normalizeSearchCard(card);
      expect(result.pokemonTcgId).toBe('swsh1-25');
    });

    it('should handle series field as fallback for set', () => {
      const card = {
        id: 'swsh1-25',
        name: 'Pikachu',
        series: 'Sword & Shield Series',
      };
      const result = normalizeSearchCard(card);
      expect(result.set).toBe('Sword & Shield Series');
    });
  });
});
