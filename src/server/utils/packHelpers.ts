/**
 * @file packHelpers.ts
 * @description Helpers para operaciones de sobres (packs) con token-bucket rate limiting
 * 
 * Centraliza la lógica de:
 * - Cálculo de tokens disponibles
 * - Validación de rate limiting
 * - Refill automático de tokens
 */

import { Response } from 'express';

const MS_HOUR = 1000 * 60 * 60;
const REFILL_MS = 12 * MS_HOUR;
const MAX_TOKENS = 2;

/**
 * Calcula los tokens disponibles y el siguiente tiempo permitido
 * Implementa token-bucket rate limiting: max 2 opens per 24h, refill cada 12h
 * 
 * @param user - Usuario con packTokens y packLastRefill
 * @returns { tokens, nextAllowed, now }
 */
export function computePackTokens(user: any) {
  const now = Date.now();
  
  // Ensure fields exist
  if (
    typeof (user as any).packTokens !== 'number' ||
    !(user as any).packLastRefill
  ) {
    (user as any).packTokens = MAX_TOKENS;
    (user as any).packLastRefill = new Date();
  }
  
  const lastRefill = new Date((user as any).packLastRefill).getTime();
  const refillCount = Math.floor((now - lastRefill) / REFILL_MS);
  
  if (refillCount > 0) {
    (user as any).packTokens = Math.min(
      MAX_TOKENS,
      ((user as any).packTokens || 0) + refillCount
    );
    (user as any).packLastRefill = new Date(
      lastRefill + refillCount * REFILL_MS
    );
  }
  
  let nextAllowed: Date | null = null;
  if (((user as any).packTokens || 0) <= 0) {
    nextAllowed = new Date(lastRefill + REFILL_MS);
  }
  
  return {
    tokens: (user as any).packTokens || 0,
    nextAllowed,
    now,
  };
}

/**
 * Valida si el usuario tiene tokens disponibles
 * @param user - Usuario con información de tokens
 * @param res - Response object para enviar error si no hay tokens
 * @returns true si hay tokens, false si no
 */
export function validatePackTokens(user: any, res: Response): boolean {
  const { tokens, nextAllowed } = computePackTokens(user);
  
  if (tokens <= 0) {
    return res.status(429).send({
      error: 'No quedan tokens para abrir sobres. Espera para recargar.',
      nextAllowed,
    }) as any;
  }
  
  return true;
}

/**
 * Consume un token y guarda el estado en el usuario
 * @param user - Usuario
 * @returns true si se consumió correctamente
 */
export async function consumePackToken(user: any): Promise<boolean> {
  const { tokens } = computePackTokens(user);
  if (tokens <= 0) return false;
  
  (user as any).packTokens = Math.max(0, tokens - 1);
  await user.save();
  return true;
}

/**
 * Obtiene el recuento de packs abiertos en últimas 24 horas
 * @param PackOpen - Modelo PackOpen
 * @param userId - ID del usuario
 * @returns Número de packs abiertos
 */
export async function getPackOpenCount24h(PackOpen: any, userId: any): Promise<number> {
  const now = Date.now();
  const dayAgo = new Date(now - 24 * MS_HOUR);
  
  return await PackOpen.countDocuments({
    userId,
    createdAt: { $gte: dayAgo },
  });
}
