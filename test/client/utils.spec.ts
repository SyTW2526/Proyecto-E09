import { describe, it, expect } from 'vitest';
import {
  getTcgdexImageUrl,
  getCardImage,
} from '../../src/client/utils/cardHelpers';
import {
  normalizeImageUrl,
} from '../../src/client/utils/imageHelpers';

describe('cardHelpers - getTcgdexImageUrl', () => {
  it('genera URL correcta para cartas inglesas no ambiguas', () => {
    const url = getTcgdexImageUrl('base1-1');
    expect(url).toContain('assets.tcgdex.net/en/base1/1/high.png');
  });

  it('genera URL con calidad baja para cartas inglesas', () => {
    const url = getTcgdexImageUrl('base1-1', 'low');
    expect(url).toContain('assets.tcgdex.net/en/base1/1/low.png');
  });

  it('detecta cartas japonesas correctamente', () => {
    const url = getTcgdexImageUrl('me01-178');
    expect(url).toContain('/jp/');
    expect(url).toContain('me01');
  });

  it('maneja ID inválido retornando string vacío', () => {
    expect(getTcgdexImageUrl('invalid')).toBe('');
    expect(getTcgdexImageUrl('nodeash')).toBe('');
    expect(getTcgdexImageUrl('')).toBe('');
  });

  it('retorna string vacío para null o undefined', () => {
    expect(getTcgdexImageUrl(null)).toBe('');
    expect(getTcgdexImageUrl(undefined)).toBe('');
  });

  it('maneja diferentes sets correctamente', () => {
    const urls = [
      getTcgdexImageUrl('base1-1'),
      getTcgdexImageUrl('me01-5'),
      getTcgdexImageUrl('xy1-1'),
    ];
    urls.forEach((url) => {
      expect(url).toContain('https://assets.tcgdex.net');
      expect(url).toContain('high.png');
    });
  });

  it('convierte set code a minúsculas', () => {
    const url = getTcgdexImageUrl('SWSH1-100');
    expect(url).toContain('swsh1');
  });
});

describe('cardHelpers - getCardImage', () => {
  it('prioriza imagen large', () => {
    const url = getCardImage({
      large: 'https://large.png',
      small: 'https://small.png',
    });
    expect(url).toBe('https://large.png');
  });

  it('usa small si large no existe', () => {
    const url = getCardImage({
      small: 'https://small.png',
    });
    expect(url).toBe('https://small.png');
  });

  it('usa imageUrl como fallback', () => {
    const url = getCardImage(undefined, undefined, 'https://fallback.png');
    expect(url).toBe('https://fallback.png');
  });

  it('genera TCGdex URL si no hay otras opciones', () => {
    const url = getCardImage(undefined, 'swsh1-1');
    expect(url).toContain('tcgdex.net');
  });

  it('retorna string vacío si no hay ninguna opción', () => {
    const url = getCardImage();
    expect(url).toBe('');
  });

  it('priorización correcta: large > small > imageUrl > tcgdex > vacío', () => {
    // Case 1: only large
    expect(getCardImage({ large: 'L' })).toBe('L');

    // Case 2: large and small
    expect(getCardImage({ large: 'L', small: 'S' })).toBe('L');

    // Case 3: only small
    expect(getCardImage({ small: 'S' })).toBe('S');

    // Case 4: small and imageUrl
    expect(getCardImage({ small: 'S' }, undefined, 'I')).toBe('S');

    // Case 5: only imageUrl
    expect(getCardImage(undefined, undefined, 'I')).toBe('I');

    // Case 6: only tcgdex id
    const url = getCardImage(undefined, 'sv1-1');
    expect(url).toContain('tcgdex');
  });

  it('maneja objetos de imagen nulos', () => {
    const url = getCardImage(null, 'sv1-1', 'https://fallback.png');
    expect(url).toBe('https://fallback.png');
  });
});

describe('imageHelpers - normalizeImageUrl', () => {
  it('normaliza URLs de TCGdex', () => {
    const url = normalizeImageUrl('https://assets.tcgdex.net/en/swsh1/1/high.png');
    expect(url).toBeTruthy();
  });

  it('maneja strings vacíos', () => {
    expect(normalizeImageUrl('')).toBe('');
  });

  it('maneja undefined', () => {
    expect(normalizeImageUrl(undefined)).toBe('');
  });

  it('retorna string para URLs válidas', () => {
    const url = normalizeImageUrl('https://assets.tcgdex.net/jp/sv01/100/high.png');
    expect(typeof url).toBe('string');
  });
});

