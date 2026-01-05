/**
 * @file api.ts (router)
 * @description Router API - Endpoints de administración y sincronización
 *
 * API REST para operaciones administrativas y de sincronización.
 * Endpoints para mantener el catálogo de cartas actualizado.
 *
 * **Operaciones disponibles:**
 * - POST /api/sync/cards - Sincronizar todas las cartas desde TCGdex
 * - GET /api/sync/status - Obtener estado de sincronización
 * - POST /api/sync/cards/:id - Resincronizar carta específica
 *
 * **Sincronización:**
 * - Importa datos frescos desde API externa TCGdex.net
 * - Actualiza cartas existentes
 * - Crea nuevas cartas (Pokémon, Trainer, Energy)
 * - Manejo de errores y reintentos
 * - Logging de progreso
 *
 * **Responsabilidades:**
 * - Obtiene datos desde pokemonService.ts
 * - Transforma datos mediante cardDataBuilder.ts
 * - Persiste en MongoDB (Card, PokemonCard, TrainerCard, EnergyCard)
 * - Maneja duplicados y actualizaciones
 * - Reporta cantidad de cartas procesadas
 *
 * **Restricciones de seguridad:**
 * - Requiere API key o autenticación admin (si se implementa)
 * - Operación puede ser lenta (primera sincronización)
 * - Se recomienda ejecutar fuera de horarios pico
 *
 * **Respuestas:**
 * - 200: Sincronización exitosa, retorna conteo total
 * - 500: Error durante sincronización
 * - Mensaje descriptivo de resultado
 *
 * Integración:
 * - Services: cards.ts, pokemon.ts
 * - Modelos: Card y sus discriminadores
 * - Utilidad de administración
 * - Puede ejecutarse manualmente o en scheduler
 *
 * @author Proyecto E09
 * @version 1.0.0
 * @requires express
 * @requires ../services/cards
 * @module server/routers/api
 * @see services/cards.ts
 * @see services/pokemon.ts
 */

import express from 'express';
import { syncAllCards } from '../services/cards.js';

export const syncRouter = express.Router();

/**
 * Ruta para sincronizar todas las cartas desde la API externa
 */
syncRouter.post('/sync/cards', async (req, res) => {
  try {
    const total = await syncAllCards();
    res.send({ message: 'Sincronización completada correctamente', total });
  } catch (error) {
    res.status(500).send({
      error: 'Error al sincronizar cartas',
      details: (error as Error).message ?? String(error),
    });
  }
});
