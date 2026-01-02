/**
 * @file imageHelpers.ts
 * @description Utilidades para manejo y normalización de URLs de imágenes de cartas
 * Centraliza la lógica de corrección de URLs malformadas de TCGdex
 */

/**
 * Normaliza y corrige URLs de imágenes de cartas TCGdex
 * 
 * Corrige URLs malformadas que vienen de la API de TCGdex:
 * - Inserta el componente de serie faltante (swsh, sm, xy, etc.)
 * - Fuerza idioma inglés (en)
 * - Convierte calidad a high
 * 
 * @example
 * // URL malformada
 * normalizeImageUrl('https://assets.tcgdex.net/jp/swsh5/123/low.png')
 * // Retorna: 'https://assets.tcgdex.net/en/swsh/swsh5/123/high.png'
 * 
 * @param url - URL de imagen a normalizar
 * @returns URL normalizada o string vacío si no hay URL
 */
export function normalizeImageUrl(url?: string): string {
  if (!url) return '';
  let s = String(url);

  // Si ya tiene extensión de imagen válida, retornar como está
  if (/\.(png|jpg|jpeg|gif|webp)$/i.test(s)) return s;

  // Detectar URLs de TCGdex sin extensión
  const tcgdexUrlPattern = /^(https?:\/\/assets\.tcgdex\.net\/)(.+)$/i;
  const tcgdexMatch = s.match(tcgdexUrlPattern);
  
  if (tcgdexMatch) {
    const [, baseUrl, path] = tcgdexMatch;
    
    // Mapa de setCode prefijos a series correctas
    const seriesMap: Record<string, string> = {
      'det': 'sm',    // Detective Pikachu es parte de Sun & Moon
      'cel': 'swsh',  // Celebrations es parte de Sword & Shield
      'pl': 'pl',     // Platinum
      'dp': 'dp',     // Diamond & Pearl
      'ex': 'ex',     // EX series
      'gym': 'gym',   // Gym series
      'base': 'base', // Base set
      'lc': 'base',   // Legendary Collection es base
      'sm': 'sm',     // Sun & Moon
      'xy': 'xy',     // XY
      'bw': 'bw',     // Black & White
      'swsh': 'swsh', // Sword & Shield
    };
    
    // Intentar detectar formato con 3 segmentos: lang/serie/setCode/cardNumber
    const threeSegmentPattern = /^(?:jp|en)\/([a-z]+)\/([a-z]+\d*[a-z]*)\/(\S+)$/i;
    const threeSegmentMatch = path.match(threeSegmentPattern);
    
    if (threeSegmentMatch) {
      // Ya tiene formato de 3 segmentos - validar la serie
      const [, currentSeries, setCode, rest] = threeSegmentMatch;
      const setPrefix = setCode.match(/^([a-z]+)/i)?.[1].toLowerCase();
      const correctSeries = setPrefix ? seriesMap[setPrefix] || setPrefix : currentSeries;
      
      if (correctSeries && currentSeries.toLowerCase() !== correctSeries) {
        // Serie incorrecta - corregir
        s = `${baseUrl}en/${correctSeries}/${setCode.toLowerCase()}/${rest}`;
      } else {
        // Serie correcta - solo asegurar idioma inglés
        s = s.replace(/^(https?:\/\/assets\.tcgdex\.net\/)jp\//i, '$1en/');
      }
    } else {
      // Formato de 2 segmentos: lang/setCode/resto (falta la serie)
      const twoSegmentPattern = /^(?:jp|en)\/([a-z]+\d+)\/(.+)$/i;
      const twoSegmentMatch = path.match(twoSegmentPattern);
      
      if (twoSegmentMatch) {
        const [, setCode, rest] = twoSegmentMatch;
        const series = setCode.match(/^([a-z]+)/i)?.[1].toLowerCase();
        
        if (series) {
          s = `${baseUrl}en/${series}/${setCode.toLowerCase()}/${rest}`;
        }
      }
    }
  }

  // Si ya tiene extensión de imagen, retornar como está
  if (/\.(png|jpg|jpeg|gif|webp)$/i.test(s)) return s;
  
  // Para URLs de TCGdex sin extensión, agregar /high.png
  // Las URLs de TCGdex como https://assets.tcgdex.net/en/pl/pl4/1 necesitan /high.png
  if (/assets\.tcgdex\.net/.test(s) && !s.endsWith('/')) {
    return `${s}/high.png`;
  }
  
  // Para otras URLs, si termina con /, agregar high.png
  if (s.endsWith('/')) {
    return `${s}high.png`;
  }
  
  return s;
}
