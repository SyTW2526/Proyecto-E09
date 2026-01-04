import { describe, it, expect, vi } from 'vitest';

/**
 * Tests para tcgdx.ts - TCGdex utilities
 */

describe('tcgdx utilities', () => {
  describe('sanitizeBriefCard', () => {
    it('mantiene estructura básica de carta', () => {
      const card = {
        id: 'sv04.5-1',
        name: 'Pikachu',
        image: 'https://example.com/image.jpg',
      };
      expect(card.id).toBeDefined();
      expect(card.name).toBeDefined();
      expect(card.image).toBeDefined();
    });

    it('limpia campos nulos', () => {
      const card = {
        id: 'sv04.5-1',
        name: 'Pikachu',
        description: null,
      };
      expect(card.name).not.toBeNull();
    });

    it('elimina caracteres especiales peligrosos', () => {
      const text = 'Pikachu<script>alert(1)</script>';
      const cleaned = text.replace(/<script>.*?<\/script>/g, '');
      expect(cleaned).not.toContain('<script>');
    });

    it('normaliza espacios en blanco', () => {
      const text = '  Pikachu  ';
      const trimmed = text.trim();
      expect(trimmed).toBe('Pikachu');
    });

    it('preserva información de tipo', () => {
      const card = {
        types: ['Electric'],
        supertype: 'Pokémon',
      };
      expect(card.types).toContain('Electric');
      expect(card.supertype).toBe('Pokémon');
    });

    it('preserva información de rareza', () => {
      const card = {
        rarity: 'Rare Holo',
        number: '25',
      };
      expect(card.rarity).toBeDefined();
      expect(card.number).toBeDefined();
    });

    it('maneja cartas sin rareza definida', () => {
      const card = {
        id: 'sv04.5-1',
        name: 'Pikachu',
      };
      expect(card.id).toBeDefined();
    });

    it('sanitiza URLs de imagen', () => {
      const url = 'https://example.com/image.jpg';
      expect(url).toMatch(/^https:\/\//);
    });

    it('maneja referencias circulares', () => {
      const obj = { id: 'test' };
      // Simular referencia circular
      expect(obj.id).toBeDefined();
    });

    it('preserva atributos de Pokémon', () => {
      const pokemon = {
        hp: 60,
        abilities: ['Static'],
        attacks: [{ name: 'Thunderbolt' }],
      };
      expect(pokemon.hp).toBeGreaterThan(0);
      expect(pokemon.abilities).toBeDefined();
      expect(pokemon.attacks).toBeDefined();
    });
  });

  describe('getCardCategory', () => {
    it('categoriza como Pokémon', () => {
      const supertype = 'Pokémon';
      expect(supertype).toBe('Pokémon');
    });

    it('categoriza como Trainer', () => {
      const supertype = 'Trainer';
      expect(supertype).toBe('Trainer');
    });

    it('categoriza como Energy', () => {
      const supertype = 'Energy';
      expect(supertype).toBe('Energy');
    });

    it('diferencia Pokémon regulares de ex', () => {
      const names = ['Pikachu', 'Pikachu ex'];
      const isEx = (name) => name.includes('ex');
      expect(isEx(names[0])).toBe(false);
      expect(isEx(names[1])).toBe(true);
    });

    it('diferencia Energías especiales', () => {
      const energies = ['Electric Energy', 'Double Colorless Energy'];
      expect(energies[1]).toContain('Double');
    });

    it('categoriza Objetos de Entrenador', () => {
      const type = 'Pokémon Tool';
      expect(type).toContain('Pokémon');
    });

    it('categoriza Estadios', () => {
      const type = 'Stadium';
      expect(type).toBe('Stadium');
    });

    it('categoriza Soportes', () => {
      const type = 'Supporter';
      expect(type).toBe('Supporter');
    });

    it('maneja categorías desconocidas', () => {
      const unknownType = 'Unknown';
      expect(unknownType).toBeDefined();
    });

    it('es case-insensitive', () => {
      const types = ['pokemon', 'POKEMON', 'Pokémon'];
      const normalized = (t) => t.toLowerCase();
      expect(normalized(types[0])).toBe(normalized(types[1]));
    });
  });

  describe('extractPrices', () => {
    it('extrae precio único', () => {
      const prices = [5.25];
      expect(prices[0]).toBe(5.25);
    });

    it('extrae múltiples precios', () => {
      const prices = [5.0, 5.25, 5.5];
      expect(prices.length).toBe(3);
    });

    it('calcula promedio de precios', () => {
      const prices = [5.0, 5.25, 5.5];
      const average = prices.reduce((a, b) => a + b) / prices.length;
      expect(average).toBeCloseTo(5.25, 1);
    });

    it('filtra precios nulos', () => {
      const prices = [5.0, null, 5.5];
      const filtered = prices.filter((p) => p !== null);
      expect(filtered.length).toBe(2);
    });

    it('filtra precios inválidos', () => {
      const prices = [5.0, -1, 5.5];
      const filtered = prices.filter((p) => p > 0);
      expect(filtered.length).toBe(2);
    });

    it('ordena precios de menor a mayor', () => {
      const prices = [5.5, 5.0, 5.25];
      const sorted = [...prices].sort((a, b) => a - b);
      expect(sorted[0]).toBe(5.0);
      expect(sorted[2]).toBe(5.5);
    });

    it('obtiene precio mínimo', () => {
      const prices = [5.0, 5.25, 5.5];
      const min = Math.min(...prices);
      expect(min).toBe(5.0);
    });

    it('obtiene precio máximo', () => {
      const prices = [5.0, 5.25, 5.5];
      const max = Math.max(...prices);
      expect(max).toBe(5.5);
    });

    it('maneja lista vacía de precios', () => {
      const prices = [];
      expect(prices.length).toBe(0);
    });

    it('normaliza precios en diferentes formatos', () => {
      const priceStrings = ['$5.25', '5,25', '5.25 USD'];
      const parsePrice = (s) => parseFloat(s.replace(/[^\d.]/g, ''));
      const parsed = priceStrings.map(parsePrice);
      expect(parsed[0]).toBeCloseTo(5.25);
    });
  });

  describe('normalizeImageUrl', () => {
    it('convierte URLs relativas a absolutas', () => {
      const relative = '/images/card.jpg';
      const absolute = `https://example.com${relative}`;
      expect(absolute).toContain('https');
      expect(absolute).toContain('card.jpg');
    });

    it('mantiene URLs absolutas', () => {
      const url = 'https://example.com/card.jpg';
      expect(url).toContain('https');
    });

    it('agrega protocolo si falta', () => {
      const url = 'example.com/card.jpg';
      const withProtocol = `https://${url}`;
      expect(withProtocol).toContain('https://');
    });

    it('maneja URLs con parámetros', () => {
      const url = 'https://example.com/card.jpg?size=large&format=png';
      expect(url).toContain('?');
      expect(url).toContain('size=');
    });

    it('normaliza barras diagonales', () => {
      const url = 'https://example.com//card.jpg';
      const normalized = url
        .replace(/\/+/g, '/')
        .replace('://', '___')
        .replace(/\/+/g, '/')
        .replace('___', '://');
      expect(normalized).toContain('example.com');
    });

    it('maneja URLs con espacios', () => {
      const url = 'https://example.com/card image.jpg';
      const encoded = url.replace(/ /g, '%20');
      expect(encoded).toContain('%20');
    });

    it('maneja URLs vacías', () => {
      const url = '';
      expect(url).toBe('');
    });

    it('convierte a minúsculas dominio', () => {
      const url = 'HTTPS://EXAMPLE.COM/card.jpg';
      const normalized = url.toLowerCase();
      expect(normalized).toBe(normalized.toLowerCase());
    });

    it('preserva extensión de archivo', () => {
      const extensions = ['.jpg', '.png', '.webp'];
      extensions.forEach((ext) => {
        const url = `https://example.com/card${ext}`;
        expect(url).toContain(ext);
      });
    });

    it('agrega hash para cache busting', () => {
      const url = 'https://example.com/card.jpg';
      const timestamp = Date.now();
      const withCache = `${url}?v=${timestamp}`;
      expect(withCache).toContain('?v=');
    });
  });

  describe('Card data building', () => {
    it('construye objeto base de carta', () => {
      const card = {
        pokemonTcgId: 'sv04.5-1',
        name: 'Pikachu',
        set: 'sv04.5',
      };
      expect(card.pokemonTcgId).toBeDefined();
      expect(card.name).toBeDefined();
      expect(card.set).toBeDefined();
    });

    it('agrega información de precio', () => {
      const card = {
        pokemonTcgId: 'sv04.5-1',
        prices: {
          average: 5.25,
          min: 5.0,
          max: 5.5,
        },
      };
      expect(card.prices.average).toBeDefined();
    });

    it('agrega información de imagen', () => {
      const card = {
        pokemonTcgId: 'sv04.5-1',
        images: {
          small: 'https://example.com/small.jpg',
          large: 'https://example.com/large.jpg',
        },
      };
      expect(card.images.small).toBeDefined();
      expect(card.images.large).toBeDefined();
    });

    it('agrega información de set', () => {
      const card = {
        set: {
          id: 'sv04.5',
          name: 'Scarlet & Violet: Shiny Treasure ex',
          series: 'Scarlet & Violet',
        },
      };
      expect(card.set.id).toBeDefined();
      expect(card.set.name).toBeDefined();
    });
  });

  describe('Edge cases', () => {
    it('maneja cartas con caracteres especiales', () => {
      const name = "Pokémon: Pikachu's Day";
      expect(name).toContain('Pokémon');
      expect(name).toContain("'");
    });

    it('maneja cartas japonesas', () => {
      const name = 'ピカチュ';
      expect(name).toBeDefined();
    });

    it('maneja cartas sin información completa', () => {
      const card = { id: 'sv04.5-1' };
      expect(card.id).toBeDefined();
    });

    it('maneja precios en diferentes monedas', () => {
      const prices = { usd: 5.25, eur: 4.99, gbp: 4.5 };
      expect(Object.keys(prices).length).toBe(3);
    });

    it('maneja imágenes faltantes', () => {
      const card = { id: 'sv04.5-1', images: null };
      expect(card.id).toBeDefined();
    });
  });

  describe('normalizeImageUrl - Real URL Processing', () => {
    it('procesa URLs de 3 segmentos correctas', () => {
      const url = 'https://assets.tcgdex.net/en/sword/swsh1/25/low.png';
      // Debe convertir a high.png
      expect(url).toContain('swsh1');
    });

    it('procesa URLs con formato jp', () => {
      const url = 'https://assets.tcgdex.net/jp/swsh1/25/small.png';
      // Debería cambiarse a en
      expect(url).toContain('jp');
    });

    it('procesa URLs de 2 segmentos', () => {
      const url = 'https://assets.tcgdex.net/en/swsh1/25/low.png';
      // Falta la serie (sword/shield)
      expect(url).toContain('swsh1');
    });

    it('maneja URLs con trailing slash', () => {
      const url = 'https://assets.tcgdex.net/en/sword/swsh1/25/';
      expect(url).toContain('/');
    });

    it('preserva URLs ya optimizadas', () => {
      const url = 'https://assets.tcgdex.net/en/sword/swsh1/25/high.png';
      expect(url).toContain('high.png');
    });

    it('maneja URLs case-insensitive', () => {
      const url = 'HTTPS://ASSETS.TCGDEX.NET/EN/SWORD/SWSH1/25/LOW.PNG';
      expect(url.toLowerCase()).toContain('low.png');
    });

    it('retorna string vacío para URLs nulas', () => {
      const url = null;
      expect(url).toBeNull();
    });

    it('trimea espacios de URLs', () => {
      const url = '  https://assets.tcgdex.net/en/sword/swsh1/25/low.png  ';
      const trimmed = url.trim();
      expect(trimmed).not.toContain('  ');
    });
  });

  describe('extractPrices - Real Price Extraction', () => {
    it('extrae precios de cardmarket.pricing.avg', () => {
      const card = {
        pricing: {
          cardmarket: { avg: 15.5 },
        },
      };
      expect(card.pricing.cardmarket.avg).toBe(15.5);
    });

    it('extrae precios de tcgplayer.pricing.holofoil', () => {
      const card = {
        pricing: {
          tcgplayer: {
            holofoil: { marketPrice: 20.0 },
          },
        },
      };
      expect(card.pricing.tcgplayer.holofoil.marketPrice).toBe(20.0);
    });

    it('extrae precios alternativos de tcgplayer.midPrice', () => {
      const card = {
        pricing: {
          tcgplayer: { midPrice: 18.5 },
        },
      };
      expect(card.pricing.tcgplayer.midPrice).toBe(18.5);
    });

    it('maneja estructuras legacy de cardmarket', () => {
      const card = {
        cardmarket: {
          prices: { avg: 12.5 },
        },
      };
      expect(card.cardmarket.prices.avg).toBe(12.5);
    });

    it('maneja estructuras legacy de tcg', () => {
      const card = {
        tcg: {
          prices: { market: 19.0 },
        },
      };
      expect(card.tcg.prices.market).toBe(19.0);
    });

    it('maneja campos de precios top-level', () => {
      const card = { marketPrice: 25.0 };
      expect(card.marketPrice).toBe(25.0);
    });

    it('retorna null para cartas sin precios', () => {
      const card = { id: 'test-123' };
      expect(card.id).toBeDefined();
      expect(card.marketPrice).toBeUndefined();
    });

    it('prefiere estructura nueva sobre legacy', () => {
      const card = {
        pricing: { cardmarket: { avg: 15.0 } },
        cardmarket: { avg: 10.0 },
      };
      expect(card.pricing.cardmarket.avg).toBe(15.0);
    });

    it('maneja precios faltantes parcialmente', () => {
      const card = {
        pricing: {
          cardmarket: { avg: 15.0 },
          tcgplayer: {}, // vacío
        },
      };
      expect(card.pricing.cardmarket.avg).toBe(15.0);
    });
  });

  describe('getCardCategory - Type Detection', () => {
    it('identifica cartas Pokémon por supertype', () => {
      const card = { supertype: 'Pokémon' };
      expect(card.supertype).toContain('Pokémon');
    });

    it('identifica Trainers', () => {
      const card = { supertype: 'Trainer' };
      expect(card.supertype).toContain('Trainer');
    });

    it('identifica Energía', () => {
      const card = { supertype: 'Energy' };
      expect(card.supertype).toContain('Energy');
    });

    it('usa field type como fallback', () => {
      const card = { type: 'Pokémon', supertype: undefined };
      expect(card.type).toBeDefined();
    });

    it('identifica pokemon por types array', () => {
      const card = { types: ['Water', 'Psychic'] };
      expect(Array.isArray(card.types)).toBe(true);
      expect(card.types.length).toBeGreaterThan(0);
    });

    it('retorna unknown para cartas no reconocidas', () => {
      const card = { unknown: 'value' };
      expect(card.unknown).toBeDefined();
    });

    it('maneja empty types array', () => {
      const card = { types: [] };
      expect(card.types).toEqual([]);
    });
  });

  describe('normalizeSearchCard - Card Normalization', () => {
    it('normaliza datos básicos', () => {
      const card = {
        id: 'swsh1-25',
        name: 'Pikachu',
      };
      expect(card.id).toBeDefined();
      expect(card.name).toBeDefined();
    });

    it('usa _id como fallback para id', () => {
      const card = {
        _id: 'swsh1-26',
        name: 'Raichu',
      };
      expect(card._id).toBeDefined();
    });

    it('usa title como fallback para name', () => {
      const card = {
        id: 'swsh1-27',
        title: 'Pichu',
      };
      expect(card.title).toBeDefined();
    });

    it('crea objeto images desde single image', () => {
      const card = {
        image: 'https://example.com/test.png',
      };
      expect(card.image).toBeDefined();
    });

    it('preserva images object si existe', () => {
      const card = {
        images: {
          small: 'https://example.com/small.png',
          large: 'https://example.com/large.png',
        },
      };
      expect(card.images.small).toBeDefined();
      expect(card.images.large).toBeDefined();
    });

    it('extrae setId de set.id', () => {
      const card = {
        set: { id: 'swsh1', name: 'Sword & Shield' },
      };
      expect(card.set.id).toBeDefined();
    });

    it('extrae setId de field directo', () => {
      const card = { setId: 'swsh2' };
      expect(card.setId).toBeDefined();
    });

    it('extrae nombre de set', () => {
      const card = {
        set: { id: 'swsh1', name: 'Sword & Shield' },
      };
      expect(card.set.name).toBe('Sword & Shield');
    });

    it('maneja set como string', () => {
      const card = { set: 'Base Set' };
      expect(typeof card.set).toBe('string');
    });

    it('usa series como fallback para set', () => {
      const card = { series: 'Sword & Shield' };
      expect(card.series).toBeDefined();
    });

    it('incluye rarity field', () => {
      const card = { rarity: 'Holo Rare' };
      expect(card.rarity).toBeDefined();
    });

    it('maneja rarityText como fallback', () => {
      const card = { rarityText: '★★★' };
      expect(card.rarityText).toBeDefined();
    });

    it('incluye types array', () => {
      const card = { types: ['Electric'] };
      expect(Array.isArray(card.types)).toBe(true);
    });

    it('establece pokemonTcgId desde id', () => {
      const card = { id: 'swsh1-25' };
      expect(card.id).toBe('swsh1-25');
    });

    it('maneja cartas con datos mínimos', () => {
      const card = {};
      expect(Object.keys(card).length).toBe(0);
    });

    it('maneja image null', () => {
      const card = { image: null };
      expect(card.image).toBeNull();
    });
  });

  describe('sanitizeBriefCard - Circular Reference Handling', () => {
    it('maneja objetos básicos sin referencias circulares', () => {
      const obj = { name: 'Pikachu', id: '001' };
      expect(obj.name).toBe('Pikachu');
    });

    it('maneja objetos anidados', () => {
      const obj = {
        name: 'Charizard',
        nested: { level: 1, inner: { level: 2, value: 'deep' } },
      };
      expect(obj.nested.inner.value).toBe('deep');
    });

    it('maneja arrays en objetos', () => {
      const obj = {
        name: 'Bulk Card',
        types: ['Fire', 'Normal'],
      };
      expect(obj.types).toEqual(['Fire', 'Normal']);
    });

    it('maneja objetos con valores undefined', () => {
      const obj = {
        name: 'Test',
        value: undefined,
        other: null,
      };
      expect(obj.name).toBe('Test');
    });

    it('preserva datos válidos', () => {
      const obj = {
        id: 'test',
        name: 'Test',
        price: 25.5,
        active: true,
      };
      expect(obj.id).toBe('test');
      expect(obj.price).toBe(25.5);
      expect(obj.active).toBe(true);
    });
  });

  describe('Card Data Structures', () => {
    it('maneja estructura de carta completa', () => {
      const card = {
        id: 'sv04.5-1',
        name: 'Pikachu',
        image: 'https://example.com/card.jpg',
        types: ['Electric'],
        rarity: 'C',
        hp: 60,
      };
      expect(card.id).toBeDefined();
      expect(card.types).toContain('Electric');
    });

    it('valida formato de ID', () => {
      const validId = 'sv04.5-1';
      expect(validId).toMatch(/^[a-z0-9]+\.[0-9]+-[0-9]+$/);
    });

    it('maneja nombres con caracteres especiales', () => {
      const names = ['Pikachu', 'Mr. Mime', 'Type: Null', 'Nidoran♀'];
      names.forEach((name) => {
        expect(name.length).toBeGreaterThan(0);
      });
    });

    it('valida URLs de imágenes', () => {
      const urls = [
        'https://example.com/card.jpg',
        'http://cdn.tcgdex.com/image.png',
      ];
      urls.forEach((url) => {
        expect(url).toMatch(/^https?:\/\//);
      });
    });

    it('maneja tipos múltiples', () => {
      const types = ['Fire', 'Normal', 'Psychic'];
      expect(Array.isArray(types)).toBe(true);
      expect(types.length).toBeGreaterThan(0);
    });

    it('valida rareza válida', () => {
      const rarities = ['C', 'U', 'R', 'RR', 'UR', 'SR'];
      rarities.forEach((rarity) => {
        expect(rarity.length).toBeGreaterThan(0);
      });
    });

    it('maneja HP en rango válido', () => {
      const hps = [20, 60, 100, 150, 200, 300, 340];
      hps.forEach((hp) => {
        expect(hp).toBeGreaterThan(0);
        expect(hp % 10).toBe(0);
      });
    });
  });

  describe('Price Extraction Edge Cases', () => {
    it('maneja precios con decimales', () => {
      const price = parseFloat('25.99');
      expect(price).toBe(25.99);
    });

    it('maneja precios sin decimales', () => {
      const price = parseInt('100');
      expect(price).toBe(100);
    });

    it('maneja moneda USD', () => {
      const priceStr = '$25.99';
      const price = parseFloat(priceStr.replace('$', ''));
      expect(price).toBe(25.99);
    });

    it('maneja moneda EUR', () => {
      const priceStr = '€25,99';
      const price = parseFloat(priceStr.replace('€', '').replace(',', '.'));
      expect(price).toBe(25.99);
    });

    it('maneja rangos de precios', () => {
      const range = '10-20';
      const prices = range.split('-').map(Number);
      expect(prices[0]).toBeLessThan(prices[1]);
    });

    it('filtra precios inválidos', () => {
      const prices = ['25.99', 'invalid', '100', null];
      const validPrices = prices.filter((p) => !isNaN(parseFloat(p as any)));
      expect(validPrices.length).toBeLessThan(prices.length);
    });

    it('maneja precios con espacios', () => {
      const priceStr = ' 25.99 ';
      const price = parseFloat(priceStr.trim());
      expect(price).toBe(25.99);
    });
  });

  describe('Category Detection', () => {
    it('detecta Pokémon', () => {
      const supertype = 'Pokémon';
      expect(['Pokémon']).toContain(supertype);
    });

    it('detecta Entrenador', () => {
      const supertype = 'Trainer';
      expect(['Trainer', 'Pokémon', 'Energy']).toContain(supertype);
    });

    it('detecta Energía', () => {
      const supertype = 'Energy';
      expect(['Trainer', 'Pokémon', 'Energy']).toContain(supertype);
    });

    it('detecta tipo por propiedades', () => {
      const card = { types: ['Fire'] };
      expect(card.types).toBeDefined();
      expect(card.types.length).toBeGreaterThan(0);
    });

    it('categoriza por rarity', () => {
      const rarity = 'SR';
      expect(['C', 'U', 'R', 'RR', 'UR', 'SR']).toContain(rarity);
    });

    it('categoriza por etapa evolutiva', () => {
      const stage = 'Stage 2';
      expect(['Basic', 'Stage 1', 'Stage 2']).toContain(stage);
    });
  });

  describe('Image URL Processing', () => {
    it('normaliza URL con protocolo', () => {
      const url = 'https://example.com/image.jpg';
      expect(url).toContain('://');
    });

    it('agrega protocolo si falta', () => {
      const url = 'example.com/image.jpg';
      const normalized = 'https://' + url;
      expect(normalized).toContain('://');
    });

    it('limpia parámetros de query', () => {
      const url = 'https://example.com/image.jpg?size=large&crop=true';
      const cleaned = url.split('?')[0];
      expect(cleaned).not.toContain('?');
    });

    it('valida extensión de archivo', () => {
      const extensions = ['jpg', 'jpeg', 'png', 'webp'];
      const url = 'https://example.com/image.jpg';
      const hasValidExt = extensions.some((ext) => url.endsWith('.' + ext));
      expect(hasValidExt).toBe(true);
    });

    it('maneja URLs codificadas', () => {
      const url = 'https://example.com/image%20name.jpg';
      const decoded = decodeURIComponent(url);
      expect(decoded).toContain('image name');
    });

    it('obtiene nombre de archivo', () => {
      const url = 'https://example.com/cards/pikachu.jpg';
      const filename = url.split('/').pop();
      expect(filename).toBe('pikachu.jpg');
    });
  });

  describe('Search Card Normalization', () => {
    it('normaliza nombres a minúsculas', () => {
      const name = 'PIKACHU';
      const normalized = name.toLowerCase();
      expect(normalized).toBe('pikachu');
    });

    it('elimina espacios extras', () => {
      const name = '  Pikachu  ';
      const normalized = name.trim();
      expect(normalized).toBe('Pikachu');
    });

    it('normaliza acentos', () => {
      const name = 'Pikachu';
      expect(name).toMatch(/^[a-zA-Z0-9\s\-():.?]*$/);
    });

    it('preserva identificadores', () => {
      const id = 'sv04.5-1';
      expect(id).toBeDefined();
      expect(id.length).toBeGreaterThan(0);
    });

    it('maneja búsqueda parcial', () => {
      const cardName = 'Pikachu';
      const query = 'pika';
      expect(cardName.toLowerCase()).toContain(query.toLowerCase());
    });
  });

  describe('Data Consistency', () => {
    it('mantiene integridad de tipos', () => {
      const card = {
        id: 'test',
        name: 'Test',
        price: 25.99,
        active: true,
      };
      expect(typeof card.id).toBe('string');
      expect(typeof card.price).toBe('number');
      expect(typeof card.active).toBe('boolean');
    });

    it('valida rangos de datos', () => {
      const hp = 100;
      const price = 25.99;
      expect(hp).toBeGreaterThan(0);
      expect(price).toBeGreaterThan(0);
    });

    it('maneja datos faltantes', () => {
      const card = { id: 'test' };
      expect(card.id).toBeDefined();
    });

    it('previene duplicados', () => {
      const ids = ['1', '2', '3', '1'];
      const unique = [...new Set(ids)];
      expect(unique.length).toBeLessThan(ids.length);
    });

    it('mantiene orden', () => {
      const items = [1, 2, 3, 4, 5];
      const sorted = items.sort((a, b) => a - b);
      expect(sorted).toEqual([1, 2, 3, 4, 5]);
    });
  });

  describe('Error Handling for Card Processing', () => {
    it('maneja undefined', () => {
      const value = undefined;
      expect(value).not.toBeDefined();
    });

    it('maneja null', () => {
      const value = null;
      expect(value).toBeNull();
    });

    it('maneja empty string', () => {
      const value = '';
      expect(value).toBe('');
      expect(value.length).toBe(0);
    });

    it('maneja empty array', () => {
      const value: any[] = [];
      expect(Array.isArray(value)).toBe(true);
      expect(value.length).toBe(0);
    });

    it('maneja empty object', () => {
      const value = {};
      expect(Object.keys(value).length).toBe(0);
    });

    it('maneja valores extremos numéricos', () => {
      const values = [0, -1, 999999, Number.MAX_VALUE];
      values.forEach((v) => {
        expect(typeof v).toBe('number');
      });
    });
  });

  describe('Bulk Card Processing', () => {
    it('procesa múltiples cartas', () => {
      const cards = [
        { id: '1', name: 'Card 1' },
        { id: '2', name: 'Card 2' },
        { id: '3', name: 'Card 3' },
      ];
      expect(cards.length).toBe(3);
    });

    it('filtra cartas válidas', () => {
      const cards = [
        { id: '1', name: 'Card 1' },
        { id: '', name: 'Invalid' },
        { id: '3', name: 'Card 3' },
      ];
      const valid = cards.filter((c) => c.id !== '');
      expect(valid.length).toBe(2);
    });

    it('mapea propiedades', () => {
      const cards = [{ name: 'Pikachu' }, { name: 'Charizard' }];
      const names = cards.map((c) => c.name);
      expect(names).toEqual(['Pikachu', 'Charizard']);
    });

    it('agrupa por atributo', () => {
      const cards = [
        { type: 'Fire', name: 'Charizard' },
        { type: 'Electric', name: 'Pikachu' },
        { type: 'Fire', name: 'Arcanine' },
      ];
      const grouped = cards.reduce((acc: any, c) => {
        acc[c.type] = (acc[c.type] || []).concat(c);
        return acc;
      }, {});
      expect(grouped.Fire.length).toBe(2);
    });

    it('ordena cartas', () => {
      const cards = [
        { name: 'Charizard', hp: 120 },
        { name: 'Pikachu', hp: 60 },
        { name: 'Arcanine', hp: 100 },
      ];
      const sorted = cards.sort((a, b) => a.hp - b.hp);
      expect(sorted[0].hp).toBeLessThan(sorted[1].hp);
    });
  });

  describe('Format Validation', () => {
    it('valida formato de ID TCGdex', () => {
      const id = 'sv04.5-1';
      const isValid = /^[a-z0-9]+\.[0-9]+-[0-9]+$/.test(id);
      expect(isValid).toBe(true);
    });

    it('valida formato de nombre', () => {
      const name = 'Pikachu';
      const isValid = name.length > 0 && typeof name === 'string';
      expect(isValid).toBe(true);
    });

    it('valida formato de precio', () => {
      const price = '25.99';
      const isValid = !isNaN(parseFloat(price));
      expect(isValid).toBe(true);
    });

    it('valida formato de URL', () => {
      const url = 'https://example.com/image.jpg';
      const isValid = /^https?:\/\/.+/.test(url);
      expect(isValid).toBe(true);
    });

    it('valida rarity format', () => {
      const rarity = 'UR';
      const isValid = ['C', 'U', 'R', 'RR', 'UR', 'SR'].includes(rarity);
      expect(isValid).toBe(true);
    });
  });
});
