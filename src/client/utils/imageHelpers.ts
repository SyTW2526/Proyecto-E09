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

  console.log('[normalizeImageUrl] Input:', url);

  // Detectar URLs de TCGdex (con o sin extensión) para procesarlas
  const tcgdexUrlPattern = /^(https?:\/\/assets\.tcgdex\.net\/)(.+)$/i;
  const tcgdexMatch = s.match(tcgdexUrlPattern);
  
  if (tcgdexMatch) {
    const [, baseUrl, path] = tcgdexMatch;
    
    // Lista oficial de series de TCGdex
    const validSeries = [
      'base', 'misc', 'gym', 'neo', 'lc', 'ecard', 'ex', 'pop', 'tk', 
      'dp', 'pl', 'hgss', 'col', 'bw', 'mc', 'xy', 'sm', 'swsh', 'sv', 
      'tcgp', 'me'
    ];
    
    // Eliminar extensión si existe para procesamiento uniforme
    const pathWithoutExt = path.replace(/\/(high|low)\.png$/i, '');
    
    // Mapa completo de setId a series basado en datos oficiales de TCGdex
    const seriesMap: Record<string, string> = {
      // Base series
      'base1': 'base', 'base2': 'base', 'basep': 'base', 'wp': 'base', 
      'base3': 'base', 'base4': 'base', 'base5': 'base',
      // Miscellaneous
      'jumbo': 'misc',
      // Gym series
      'gym1': 'gym', 'gym2': 'gym',
      // Legendary Collection
      'lc': 'lc',
      // E-Card series
      'sp': 'ecard', 'ecard1': 'ecard', 'bog': 'ecard', 'ecard2': 'ecard', 'ecard3': 'ecard',
      // EX series
      'ex1': 'ex', 'ex2': 'ex', 'ex3': 'ex', 'ex4': 'ex', 'ex5': 'ex', 'ex5.5': 'ex', 
      'ex6': 'ex', 'ex7': 'ex', 'ex8': 'ex', 'ex9': 'ex', 'ex10': 'ex', 'exu': 'ex',
      'ex11': 'ex', 'ex12': 'ex', 'ex13': 'ex', 'ex14': 'ex', 'ex15': 'ex', 'ex16': 'ex',
      // POP series
      'np': 'pop', 'pop1': 'pop', 'pop2': 'pop', 'pop3': 'pop', 'pop4': 'pop',
      'pop5': 'pop', 'pop6': 'pop', 'pop7': 'pop', 'pop8': 'pop', 'pop9': 'pop',
      // Trainer Kits
      'tk-ex-latia': 'tk', 'tk-ex-latio': 'tk', 'tk-ex-m': 'tk', 'tk-ex-p': 'tk',
      'tk-dp-m': 'tk', 'tk-dp-l': 'tk', 'tk-hs-r': 'tk', 'tk-hs-g': 'tk',
      'tk-bw-e': 'tk', 'tk-bw-z': 'tk', 'tk-xy-n': 'tk', 'tk-xy-sy': 'tk',
      'tk-xy-w': 'tk', 'tk-xy-b': 'tk', 'tk-xy-latio': 'tk', 'tk-xy-latia': 'tk',
      'tk-xy-su': 'tk', 'tk-xy-p': 'tk', 'tk-sm-r': 'tk', 'tk-sm-l': 'tk',
      // Diamond & Pearl
      'dpp': 'dp', 'dp1': 'dp', 'dp2': 'dp', 'dp3': 'dp', 'dp4': 'dp',
      'dp5': 'dp', 'dp6': 'dp', 'dp7': 'dp',
      // Platinum
      'pl1': 'pl', 'pl2': 'pl', 'pl3': 'pl', 'pl4': 'pl', 'ru1': 'pl',
      // HeartGold & SoulSilver
      'hgss1': 'hgss', 'hgssp': 'hgss', 'hgss2': 'hgss', 'hgss3': 'hgss', 'hgss4': 'hgss',
      // Call of Legends
      'col1': 'col',
      // Black & White
      'bw1': 'bw', 'bwp': 'bw', 'bw2': 'bw', 'bw3': 'bw', 'bw4': 'bw', 'bw5': 'bw',
      'bw6': 'bw', 'dv1': 'bw', 'bw7': 'bw', 'bw8': 'bw', 'bw9': 'bw', 'bw10': 'bw', 
      'bw11': 'bw', 'rc': 'bw',
      // McDonald's Collection
      '2011bw': 'mc', '2012bw': 'mc', '2014xy': 'mc', '2015xy': 'mc', '2016xy': 'mc',
      '2017sm': 'mc', '2018sm': 'mc', '2019sm': 'mc', '2021swsh': 'mc',
      // XY series
      'xyp': 'xy', 'xy0': 'xy', 'xya': 'xy', 'xy1': 'xy', 'xy2': 'xy', 'xy3': 'xy', 
      'xy4': 'xy', 'xy5': 'xy', 'dc1': 'xy', 'xy6': 'xy', 'xy7': 'xy', 'xy8': 'xy', 
      'xy9': 'xy', 'g1': 'xy', 'xy10': 'xy', 'xy11': 'xy', 'xy12': 'xy',
      // Sun & Moon (con y sin puntos decimales)
      'smp': 'sm', 'sm1': 'sm', 'sm2': 'sm', 'sm3': 'sm', 'sm3.5': 'sm', 'sm35': 'sm',
      'sm4': 'sm', 'sm5': 'sm', 'sm6': 'sm', 'sm7': 'sm', 'sm7.5': 'sm', 'sm75': 'sm',
      'sm8': 'sm', 'sm9': 'sm', 'det1': 'sm', 'sm10': 'sm', 'sm11': 'sm', 
      'sma': 'sm', 'sm115': 'sm', 'sm11.5': 'sm', 'sm12': 'sm',
      // Sword & Shield (con y sin puntos decimales)
      'swshp': 'swsh', 'swsh1': 'swsh', 'swsh2': 'swsh', 'swsh3': 'swsh', 'fut2020': 'swsh',
      'swsh3.5': 'swsh', 'swsh35': 'swsh', 'swsh4': 'swsh', 'swsh4.5': 'swsh', 'swsh45': 'swsh',
      'swsh5': 'swsh', 'swsh6': 'swsh', 'swsh7': 'swsh', 'cel25': 'swsh', 'swsh8': 'swsh',
      'swsh9': 'swsh', 'swsh10': 'swsh', 'swsh10.5': 'swsh', 'swsh105': 'swsh',
      'swsh11': 'swsh', 'swsh12': 'swsh', 'swsh12.5': 'swsh', 'swsh125': 'swsh',
      // Scarlet & Violet (con y sin puntos decimales)
      'sv01': 'sv', 'svp': 'sv', 'sv02': 'sv', 'sv03': 'sv', 'sv03.5': 'sv', 'sv035': 'sv',
      'sv04': 'sv', 'sv04.5': 'sv', 'sv045': 'sv', 'sv05': 'sv', 'sv06': 'sv', 
      'sv06.5': 'sv', 'sv065': 'sv', 'sv07': 'sv', 'sv08': 'sv', 'sv08.5': 'sv', 'sv085': 'sv',
      'sv09': 'sv', 'sv10': 'sv', 'sv10.5w': 'sv', 'sv105w': 'sv', 'sv10.5b': 'sv', 'sv105b': 'sv',
      // TCG Pocket (mayúsculas y minúsculas)
      'P-A': 'tcgp', 'p-a': 'tcgp', 'A1': 'tcgp', 'a1': 'tcgp', 'A1a': 'tcgp', 'a1a': 'tcgp',
      'A2': 'tcgp', 'a2': 'tcgp', 'A2a': 'tcgp', 'a2a': 'tcgp', 'A2b': 'tcgp', 'a2b': 'tcgp',
      'A3': 'tcgp', 'a3': 'tcgp', 'A3a': 'tcgp', 'a3a': 'tcgp', 'A3b': 'tcgp', 'a3b': 'tcgp',
      'A4': 'tcgp', 'a4': 'tcgp', 'A4a': 'tcgp', 'a4a': 'tcgp', 
      'B1': 'tcgp', 'b1': 'tcgp', 'B1a': 'tcgp', 'b1a': 'tcgp',
      // Mega Evolution
      'mep': 'me', 'me01': 'me', 'me02': 'me',
    };
    
    // Dividir el path en partes para analizar
    const parts = pathWithoutExt.split('/').filter(Boolean);
    
    if (parts.length >= 3) {
      // Formato: lang/serie/setCode/cardNumber o lang/setCode/cardNumber
      let lang, series, setCode, cardNumber;
      
      if (parts.length === 4) {
        // Formato: lang/serie/setCode/cardNumber
        [lang, series, setCode, cardNumber] = parts;
        
        // Verificar si la serie es válida
        if (validSeries.includes(series.toLowerCase())) {
          // Ya tiene formato correcto - normalizar idioma y agregar calidad
          return `${baseUrl}en/${series.toLowerCase()}/${setCode}/${cardNumber}/high.png`;
        } else {
          // La "serie" es en realidad el setCode, tratar como 3 partes
          setCode = series;
          cardNumber = parts[2];
        }
      } else if (parts.length === 3) {
        // Formato: lang/setCode/cardNumber (falta la serie)
        [lang, setCode, cardNumber] = parts;
      } else {
        // Formato desconocido, retornar original
        console.warn('[normalizeImageUrl] Formato desconocido:', pathWithoutExt);
        return s;
      }
      
      // Buscar la serie correspondiente al setCode
      const setCodeNormalized = setCode.toLowerCase().replace(/\./g, '');
      const correctSeries = seriesMap[setCode.toLowerCase()] || 
                           seriesMap[setCodeNormalized];
      
      if (correctSeries) {
        // Reconstruir URL completa con serie correcta
        return `${baseUrl}en/${correctSeries}/${setCode}/${cardNumber}/high.png`;
      } else {
        // No se encontró serie, intentar inferir del prefijo del setCode
        const inferredSeries = setCode.match(/^([a-z]+)/i)?.[1].toLowerCase();
        if (inferredSeries && validSeries.includes(inferredSeries)) {
          return `${baseUrl}en/${inferredSeries}/${setCode}/${cardNumber}/high.png`;
        }
        
        console.warn('[normalizeImageUrl] No se encontró serie para setCode:', setCode);
        return s; // Retornar original sin modificar
      }
    }
  }

  console.log('[normalizeImageUrl] Output:', s);

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
