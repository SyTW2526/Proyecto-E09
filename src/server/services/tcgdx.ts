/**
 * Utilities for working with TCGdex responses.
 * Includes a sanitizer to remove circular references from BriefCard-like objects
 * and helpers to determine card category.
 */

export function sanitizeBriefCard<T extends Record<string, any>>(input: T): T {
  // JSON.stringify with a replacer that removes circular references
  const seen = new WeakSet();

  function replacer(_key: string, value: any) {
    if (value && typeof value === 'object') {
      if (seen.has(value)) {
        // drop circular reference
        return undefined;
      }
      seen.add(value);
    }
    return value;
  }

  try {
    const str = JSON.stringify(input, replacer);
    return JSON.parse(str) as T;
  } catch (err) {
    // If serialization failed for any unexpected reason, fall back to a shallow clone
    const out: any = {};
    for (const k of Object.keys(input)) {
      const v = (input as any)[k];
      if (v && typeof v === 'object') {
        try { out[k] = JSON.parse(JSON.stringify(v)); } catch { out[k] = undefined; }
      } else {
        out[k] = v;
      }
    }
    return out as T;
  }
}

/**
 * Determine card supertype/category from the API object.
 * The TCGdex API typically exposes `supertype` with values 'Pokémon', 'Trainer', 'Energy'.
 */
export function getCardCategory(card: Record<string, any>): 'pokemon' | 'trainer' | 'energy' | 'unknown' {
  const supertype = (card?.supertype || card?.type || '').toString().toLowerCase();
  if (supertype.includes('pokemon')) return 'pokemon';
  if (supertype.includes('trainer')) return 'trainer';
  if (supertype.includes('energy')) return 'energy';
  // fallback: if `types` exists it's likely a Pokemon card
  if (Array.isArray(card?.types) && card.types.length > 0) return 'pokemon';
  return 'unknown';
}

/**
 * Normalize an image base URL to point to the high resolution PNG.
 * Examples:
 * - https://.../178 -> https://.../178/high.png
 * - https://.../178/large.png -> https://.../178/high.png
 */
export function normalizeImageUrl(url?: string | null): string {
  if (!url) return '';
  const s = String(url);
  // if already ends with /high.png (case-insensitive)
  if (/\/high\.png$/i.test(s)) return s;
  // replace known size suffixes
  if (/\/(?:small|large|low)\.png$/i.test(s)) {
    return s.replace(/\/(?:small|large|low)\.png$/i, '/high.png');
  }
  // if ends with an image extension, keep as-is
  if (/\.(png|jpe?g|gif|webp)$/i.test(s)) return s;
  // otherwise append /high.png
  return s.endsWith('/') ? `${s}high.png` : `${s}/high.png`;
}
