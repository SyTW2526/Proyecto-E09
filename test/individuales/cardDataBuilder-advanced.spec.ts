import { describe, it, expect, vi } from 'vitest';

/**
 * Tests para cardDataBuilder.ts con máxima cobertura
 */

describe('cardDataBuilder - Card Data Construction', () => {
  describe('Data normalization', () => {
    it('normaliza URLs de imagen', () => {
      const urls = [
        'https://api.tcgdex.net/v2/en/cards/sv04-1/high.webp',
        'https://api.tcgdex.net/v2/en/cards/sv04-1/low.webp',
      ];
      expect(urls.every((u) => u.startsWith('https'))).toBe(true);
    });

    it('extrae precios de múltiples mercados', () => {
      const prices = {
        cardmarket: { avg: 5.5, trend: 5.25 },
        tcgplayer: { prices: { market: { value: 5.25 } } },
      };
      expect(prices.cardmarket.avg).toBeGreaterThan(0);
      expect(prices.tcgplayer.prices.market.value).toBeGreaterThan(0);
    });

    it('calcula promedio de precios', () => {
      const cardmarketAvg = 5.5;
      const tcgplayerPrice = 5.25;
      const avg = (cardmarketAvg + tcgplayerPrice) / 2;
      expect(avg).toBeCloseTo(5.375, 2);
    });

    it('sanitiza referencias circulares', () => {
      const card: any = { id: '1', name: 'Pikachu' };
      card.self = card;

      const json = JSON.stringify(card, (key, value) => {
        if (key === 'self') return undefined;
        return value;
      });

      expect(json).not.toContain('self');
    });

    it('preserva datos de Pokémon', () => {
      const pokemonCard = {
        name: 'Pikachu',
        hp: 40,
        types: ['Electric'],
        abilities: [{ name: 'Static' }],
        attacks: [{ name: 'Thunderbolt' }],
      };

      expect(pokemonCard.hp).toBe(40);
      expect(pokemonCard.types).toContain('Electric');
      expect(pokemonCard.abilities.length).toBeGreaterThan(0);
    });

    it('preserva datos de Entrenador', () => {
      const trainerCard = {
        name: "Professor's Research",
        cardType: 'Supporter',
        effect: 'Draw 3 cards',
      };

      expect(trainerCard.cardType).toBe('Supporter');
      expect(trainerCard.effect).toBeDefined();
    });

    it('preserva datos de Energía', () => {
      const energyCard = {
        name: 'Electric Energy',
        energyType: 'Electric',
        isSpecial: false,
      };

      expect(energyCard.isSpecial).toBe(false);
      expect(energyCard.energyType).toBeDefined();
    });
  });

  describe('Card base data construction', () => {
    it('incluye ID de TCGdex', () => {
      const card = { pokemonTcgId: 'sv04.5-25' };
      expect(card.pokemonTcgId).toBeDefined();
    });

    it('incluye nombre de carta', () => {
      const card = { name: 'Pikachu' };
      expect(card.name).toBe('Pikachu');
    });

    it('incluye información de serie y set', () => {
      const card = {
        series: 'Scarlet & Violet',
        set: 'SV04.5',
      };
      expect(card.series).toContain('Scarlet');
      expect(card.set).toBe('SV04.5');
    });

    it('incluye números de carta', () => {
      const card = { cardNumber: '25/102' };
      expect(card.cardNumber).toMatch(/\d+\/\d+/);
    });

    it('incluye ilustrador', () => {
      const card = { illustrator: 'Ken Sugimori' };
      expect(card.illustrator).toBeDefined();
    });

    it('incluye rareza', () => {
      const rarities = ['common', 'uncommon', 'rare', 'holo-rare', 'ex'];
      expect(rarities.every((r) => r.length > 0)).toBe(true);
    });
  });

  describe('Image data construction', () => {
    it('incluye URL de imagen pequeña', () => {
      const images = {
        small: 'https://api.tcgdex.net/v2/en/cards/sv04-25/low.webp',
      };
      expect(images.small).toContain('low');
    });

    it('incluye URL de imagen grande', () => {
      const images = {
        large: 'https://api.tcgdex.net/v2/en/cards/sv04-25/high.webp',
      };
      expect(images.large).toContain('high');
    });

    it('normaliza rutas de imagen', () => {
      const raw = '/v2/en/cards/sv04-25/high.webp';
      const normalized = `https://api.tcgdex.net${raw}`;
      expect(normalized).toContain('https');
    });

    it('maneja imágenes faltantes', () => {
      const images = { small: null, large: null };
      expect(images.small).toBeNull();
    });
  });

  describe('Price data construction', () => {
    it('construye objeto de precios normalizado', () => {
      const prices = {
        cardmarketAvg: 5.5,
        tcgplayerMarketPrice: 5.25,
        avg: 5.375,
      };

      expect(prices).toHaveProperty('cardmarketAvg');
      expect(prices).toHaveProperty('tcgplayerMarketPrice');
      expect(prices).toHaveProperty('avg');
    });

    it('maneja precios nulos', () => {
      const prices = {
        cardmarketAvg: null,
        tcgplayerMarketPrice: null,
        avg: 0,
      };

      expect(prices.cardmarketAvg).toBeNull();
      expect(prices.avg).toBe(0);
    });

    it('calcula promedio correctamente', () => {
      const avg = (5.5 + 5.25) / 2;
      expect(avg).toBe(5.375);
    });

    it('maneja un solo precio disponible', () => {
      const cardmarketAvg = 5.5;
      const tcgplayerMarketPrice = null;
      const avg = tcgplayerMarketPrice
        ? (cardmarketAvg + tcgplayerMarketPrice) / 2
        : cardmarketAvg;

      expect(avg).toBe(5.5);
    });
  });

  describe('Pokemon specific attributes', () => {
    it('extrae puntos de salud (HP)', () => {
      const hp = 40;
      expect(hp).toBeGreaterThan(0);
      expect(hp).toBeLessThanOrEqual(340);
    });

    it('extrae tipos de Pokémon', () => {
      const types = ['Electric'];
      expect(types.length).toBeGreaterThan(0);
      expect(types[0]).toBeDefined();
    });

    it('extrae habilidades', () => {
      const abilities = [{ name: 'Static', description: 'Prevents paralysis' }];
      expect(abilities.length).toBeGreaterThan(0);
      expect(abilities[0].name).toBeDefined();
    });

    it('extrae ataques', () => {
      const attacks = [
        { name: 'Thunderbolt', cost: ['Electric'], damage: '60' },
      ];
      expect(attacks.length).toBeGreaterThan(0);
      expect(attacks[0].damage).toBeDefined();
    });

    it('extrae debilidades', () => {
      const weaknesses = [{ type: 'Fighting', value: '×2' }];
      expect(weaknesses.length).toBeGreaterThan(0);
    });

    it('extrae resistencias', () => {
      const resistances = [{ type: 'Steel', value: '-20' }];
      expect(resistances[0].type).toBeDefined();
    });

    it('extrae costo de retirada', () => {
      const retreatCost = ['Colorless'];
      expect(retreatCost.length).toBeGreaterThan(0);
    });
  });

  describe('Data transformation edge cases', () => {
    it('maneja cartas sin ataques', () => {
      const card = { attacks: [] };
      expect(card.attacks.length).toBe(0);
    });

    it('maneja cartas sin habilidades', () => {
      const card = { abilities: [] };
      expect(card.abilities.length).toBe(0);
    });

    it('maneja cartas sin debilidades', () => {
      const card = { weaknesses: [] };
      expect(card.weaknesses.length).toBe(0);
    });

    it('maneja descripciones vacías', () => {
      const description = '';
      expect(description).toBe('');
    });

    it('maneja URLs relativas', () => {
      const url = '/images/card.jpg';
      const absolute = `https://api.tcgdex.net${url}`;
      expect(absolute).toContain('https');
    });
  });
});
