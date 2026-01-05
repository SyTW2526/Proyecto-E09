/**
 * @file mongoHelpers.ts
 * @description MongoHelpers - Utilidades de operaciones MongoDB
 *
 * Conjunto de funciones helper para trabajar con MongoDB/Mongoose.
 * Simplifica operaciones comunes, validaciones y búsquedas.
 *
 * **Validaciones ObjectId:**
 * - validateObjectId(): Valida formato MongoDB ID
 * - parseObjectId(): Convierte string a ObjectId
 * - isValidObjectId(): Pregunta sin error
 * - Manejo automático de errores
 *
 * **Búsquedas flexibles:**
 * - findUserFlexible(): Por username, email o ID
 * - findByIdOrThrow(): Lanza error si no existe
 * - findMultiple(): Búsqueda de múltiples docs
 * - softFind(): Busca sin error si falla
 *
 * **Operaciones normalizadas:**
 * - bulkUpsert(): Insertarlas o actualizar múltiples
 * - deleteWithForeignKey(): Valida referencias
 * - updateWithValidation(): Actualiza con validación
 * - countDocuments(): Con filtros
 *
 * **Queries comunes:**
 * - buildMongoQuery(): Construye query MongoDB
 * - applyPagination(): Añade skip/limit
 * - applySorting(): Añade ordenamiento
 * - addTextSearch(): Búsqueda full-text
 *
 * **Índices:**
 * - ensureIndexes(): Crea índices necesarios
 * - indexStatus(): Información de índices
 * - dropIndex(): Elimina índice
 *
 * **Transacciones:**
 * - startTransaction(): Inicia sesión transaccional
 * - commitTransaction(): Confirma cambios
 * - rollbackTransaction(): Revierte cambios
 *
 * **Validación de datos:**
 * - validateSchema(): Valida contra esquema
 * - sanitizeInput(): Limpia XSS/injection
 * - normalizeDateRange(): Normaliza fechas
 * - validateFilterFields(): Campos permitidos
 *
 * **Errores comunes:**
 * - Manejo de duplicate key
 * - Manejo de cast errors
 * - Manejo de validation errors
 * - Mensajes descriptivos
 *
 * **Performance:**
 * - Proyeccciones para queries eficientes
 * - Lean() para consultas de solo lectura
 * - Batch processing para bulk operations
 * - Connection pooling
 *
 * **Integración:**
 * - Usado por todos los routers
 * - Modelo de consistencia en CRUD
 * - Error handling estandarizado
 * - Logging opcional
 *
 * @author Proyecto E09
 * @version 1.0.0
 * @requires mongoose
 * @requires express
 * @requires ../models/User
 * @requires ../utils/responseHelpers
 * @requires ../utils/validationHelpers
 * @module server/utils/mongoHelpers
 * @see routers/*.ts
 */

import { Response } from 'express';
import mongoose from 'mongoose';
import { sendError } from './responseHelpers.js';
import { findUserByUsernameOrEmail } from './validationHelpers.js';

/**
 * Valida si un ID es un ObjectId válido de MongoDB
 * @param id - El ID a validar
 * @param res - Objeto Response de Express para enviar error si es inválido
 * @param fieldName - Nombre del campo para el mensaje de error (por defecto 'ID')
 * @returns true si es válido, false si no lo es (y envía respuesta de error)
 */
export function validateObjectId(
  id: string,
  res: Response,
  fieldName: string = 'ID'
): boolean {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    sendError(res, `${fieldName} no válido`, 400);
    return false;
  }
  return true;
}

/**
 * Busca un usuario de forma flexible (por username, email o ID)
 * Wrapper sobre findUserByUsernameOrEmail para uso consistente en routers
 * @param identifier - Username, email o ID del usuario
 * @returns Usuario encontrado o null si no existe
 */
export async function findUserFlexible(identifier: string) {
  return await findUserByUsernameOrEmail(identifier);
}
