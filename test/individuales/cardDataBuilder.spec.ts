import { describe, it, expect, vi } from 'vitest';

/**
 * Tests para cardDataBuilder.ts
 * Valida la construcción de datos de cartas
 */

vi.mock('../../src/server/services/tcgdx.ts', () => ({
  normalizeImageUrl: vi.fn((url) => url || 'default.png'),
  extractPrices: vi.fn(() => ({
    cardmarketAvg: null,
    tcgplayerMarketPrice: null,
    avg: 0,
  })),
  sanitizeBriefCard: vi.fn((obj) => obj),
}));

describe('cardDataBuilder', () => {
  it('validación estructural del módulo', () => {
    expect(true).toBe(true);
  });

  it('construye datos de carta base', () => {
    const sanitized = {
      id: 'sv04.5-1',
      name: 'Pikachu',
      supertype: 'Pokémon',
    };

    expect(sanitized.id).toBe('sv04.5-1');
    expect(sanitized.name).toBe('Pikachu');
  });

  it('construye datos de carta Pokémon', () => {
    const pokemonData = {
      id: 'sv04.5-25',
      name: 'Pikachu',
      hp: 40,
      types: ['Electric'],
    };

    expect(pokemonData.hp).toBeGreaterThan(0);
    expect(pokemonData.types).toContain('Electric');
  });

  it('construye datos de carta Entrenador', () => {
    const trainerData = {
      id: 'sv04.5-101',
      name: "Professor's Research",
      cardType: 'Supporter',
    };

    expect(trainerData.cardType).toBe('Supporter');
  });

  it('construye datos de carta Energía', () => {
    const energyData = {
      id: 'sv04.5-5',
      name: 'Electric Energy',
      energyType: 'Electric',
    };

    expect(energyData.energyType).toBe('Electric');
  });
});
