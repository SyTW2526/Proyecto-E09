import { describe, it, expect } from 'vitest';
import {
  getTcgdexImageUrl,
  getCardImage,
  parseCardId,
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

  it('normaliza URLs con calidad baja', () => {
    const url = normalizeImageUrl('https://assets.tcgdex.net/en/swsh1/1/low.png');
    expect(url).toContain('high.png');
  });

  it('normaliza URLs sin extensión de imagen', () => {
    const url = normalizeImageUrl('https://assets.tcgdex.net/en/swsh1/1');
    expect(url).toContain('high.png');
  });

  it('normaliza URLs sin serie (3 partes)', () => {
    const url = normalizeImageUrl('https://assets.tcgdex.net/en/sv01/100');
    expect(url).toContain('high.png');
    expect(url).toContain('sv01');
  });

  it('maneja URLs con más de 4 partes', () => {
    const url = normalizeImageUrl('https://assets.tcgdex.net/en/swsh1/1/extra/part');
    expect(typeof url).toBe('string');
  });

  it('retorna original para URLs sin TCGdex', () => {
    const url = normalizeImageUrl('https://example.com/image.png');
    expect(url).toBe('https://example.com/image.png');
  });

  it('agrega /high.png a URLs de TCGdex que terminan con /', () => {
    const url = normalizeImageUrl('https://assets.tcgdex.net/en/swsh1/1/');
    expect(url).toContain('high.png');
  });

  it('retorna original si es URL normal de imagen', () => {
    const url = normalizeImageUrl('https://example.com/image.jpg');
    expect(url).toBe('https://example.com/image.jpg');
  });

  it('agrega high.png a URL que termina con slash', () => {
    const url = normalizeImageUrl('https://example.com/images/');
    expect(url).toBe('https://example.com/images/high.png');
  });

  it('normaliza URLs con formato incorrecto de serie', () => {
    const url = normalizeImageUrl('https://assets.tcgdex.net/en/invalid/sv01/100');
    expect(typeof url).toBe('string');
  });

  it('infiere serie del prefijo del setCode', () => {
    const url = normalizeImageUrl('https://assets.tcgdex.net/en/sv99/100');
    expect(url).toContain('sv');
  });

  it('maneja URLs de TCGdex con decimales en setCode', () => {
    const url = normalizeImageUrl('https://assets.tcgdex.net/en/sm3.5/100');
    expect(url).toContain('sm');
  });

  it('normaliza URLs con 4 partes donde primera es serie válida', () => {
    const url = normalizeImageUrl('https://assets.tcgdex.net/en/swsh/swsh1/100');
    expect(url).toContain('high.png');
    expect(url).toContain('en');
  });

  it('normaliza URLs con 4 partes donde primera NO es serie válida', () => {
    const url = normalizeImageUrl('https://assets.tcgdex.net/en/notaseries/sv01/100');
    // Si no encuentra la serie, retorna la URL original sin cambios
    expect(url).toBe('https://assets.tcgdex.net/en/notaseries/sv01/100');
  });

  it('maneja URLs de TCGdex con slash final después de quality', () => {
    const url = normalizeImageUrl('https://assets.tcgdex.net/en/swsh1/100/high.png/');
    expect(typeof url).toBe('string');
  });

  it('normaliza setCode con puntos decimales correctamente', () => {
    const url = normalizeImageUrl('https://assets.tcgdex.net/en/sv04.5/100');
    expect(url).toContain('sv');
  });

  it('retorna original si setCode no tiene prefijo válido', () => {
    const url = normalizeImageUrl('https://assets.tcgdex.net/en/99unknown/100');
    expect(url).toBe('https://assets.tcgdex.net/en/99unknown/100');
  });

  it('maneja URLs de TCGdex sin serie cuando setCode no se reconoce', () => {
    const url = normalizeImageUrl('https://assets.tcgdex.net/en/xyz/100');
    expect(typeof url).toBe('string');
  });

  it('normaliza URLs de TCGdex correctas sin cambios innecesarios', () => {
    const url = normalizeImageUrl('https://assets.tcgdex.net/en/swsh/swsh1/100/high.png');
    expect(url).toContain('high.png');
  });

  it('agrega /high.png a URL de TCGdex sin extensión que tiene partes insuficientes', () => {
    // URL de TCGdex incompleta que no tiene suficientes partes
    // Aquí entra en tcgdexMatch pero tiene menos de 3 partes, por lo que no debería entrar en el if(parts.length >= 3)
    const url = normalizeImageUrl('https://assets.tcgdex.net/file.jpg');
    // Debería retornar la original porque tiene extensión
    expect(url).toBe('https://assets.tcgdex.net/file.jpg');
  });

  it('agrega high.png a URL que termina con /', () => {
    // Esta SÍ debería activar la línea 379
    const url = normalizeImageUrl('https://example.com/path/');
    expect(url).toBe('https://example.com/path/high.png');
  });
});

describe('cardHelpers - parseCardId', () => {
  it('parsea ID válido correctamente', () => {
    const result = parseCardId('me01-178');
    expect(result).toEqual({ setCode: 'me01', number: '178' });
  });

  it('parsea diferentes formatos de ID', () => {
    const result = parseCardId('base1-1');
    expect(result).toEqual({ setCode: 'base1', number: '1' });
  });

  it('retorna null para ID sin guión', () => {
    const result = parseCardId('invalid');
    expect(result).toBeNull();
  });

  it('retorna null para ID vacío', () => {
    const result = parseCardId('');
    expect(result).toBeNull();
  });

  it('retorna null para null', () => {
    const result = parseCardId(null);
    expect(result).toBeNull();
  });

  it('retorna null para undefined', () => {
    const result = parseCardId(undefined);
    expect(result).toBeNull();
  });

  it('retorna null para ID con múltiples guiones', () => {
    const result = parseCardId('set-code-number');
    expect(result).toBeNull();
  });

  it('retorna null si setCode está vacío', () => {
    const result = parseCardId('-123');
    expect(result).toBeNull();
  });

  it('retorna null si number está vacío', () => {
    const result = parseCardId('sv01-');
    expect(result).toBeNull();
  });

  it('parsea números grandes correctamente', () => {
    const result = parseCardId('sv01-999');
    expect(result).toEqual({ setCode: 'sv01', number: '999' });
  });
});

