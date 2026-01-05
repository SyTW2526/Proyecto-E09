/**
 * @file validationHelpers.ts
 * @description ValidationHelpers - Validaciones de entrada y datos
 *
 * Utilidades para validar datos de usuario, cartas, trades y otros.
 * Centraliza reglas de validación para consistencia en toda la API.
 *
 * **Validaciones de usuario:**
 * - validateUsername(): Formato válido (3-20 chars, alfanuméricos)
 * - validateEmail(): Formato email válido
 * - validatePassword(): Fortaleza (min 8 chars, mixed case, números)
 * - validateUserInput(): Valida registro/login
 *
 * **Reglas username:**
 * - Longitud: 3-20 caracteres
 * - Caracteres: Letras, números, _, -
 * - No espacios, sin caracteres especiales
 * - Case-insensitive para duplicados
 *
 * **Reglas email:**
 * - Formato RFC 5322 simple
 * - Máximo 254 caracteres
 * - Única por usuario
 * - Case-insensitive
 *
 * **Reglas password:**
 * - Mínimo 8 caracteres
 * - Al menos una mayúscula
 * - Al menos una minúscula
 * - Al menos un número
 * - Preferiblemente carácter especial
 * - Nunca se almacena en plain text
 *
 * **Validaciones de datos:**
 * - validateCardData(): Estructura de carta válida
 * - validateTradeData(): Trade tiene cartas válidas
 * - validateObjectId(): ID MongoDB válido
 * - validateDates(): Ranges de fecha válidos
 * - validateEnums(): Valores en enum válido
 *
 * **Búsquedas de credenciales:**
 * - checkUsernameExists(): Usuario tomado
 * - checkEmailExists(): Email registrado
 * - findByUsername(): Busca usuario
 * - findByEmail(): Busca usuario
 * - findByCredentials(): Auth username/password
 *
 * **Mensajes de error:**
 * - Específicos a problema (no generales)
 * - Guían al usuario a solución
 * - Lenguaje claro y educado
 * - Sin información de seguridad
 *
 * **Seguridad:**
 * - Validación en servidor (no confiar cliente)
 * - XSS prevention (sanitización)
 * - Injection prevention (parametrizado)
 * - Rate limiting en validación
 * - Logging de intentos fallidos
 *
 * **Integración:**
 * - routers/users.ts en register/login
 * - routers/trade.ts valida trades
 * - authMiddleware.ts verifica tokens
 * - Todos los routers usan helpers
 * - Middleware global de validación
 *
 * @author Proyecto E09
 * @version 1.0.0
 * @requires mongoose
 * @requires ../models/User
 * @module server/utils/validationHelpers
 * @see routers/users.ts
 * @see middleware/authMiddleware.ts
 */

import { User } from '../models/User.js';

/**
 * Busca un usuario por username o email
 * @param identifier - Username o email del usuario
 * @returns Usuario encontrado o null
 */
export async function findUserByUsernameOrEmail(identifier: string) {
  return await User.findOne({
    $or: [{ username: identifier }, { email: identifier }],
  });
}

/**
 * Valida que un username y email no estén en uso
 * @param newUsername - Username a validar (puede ser undefined si no se cambia)
 * @param newEmail - Email a validar (puede ser undefined si no se cambia)
 * @param currentUsername - Username actual del usuario (para comparación)
 * @param currentEmail - Email actual del usuario (para comparación)
 * @returns { valid: boolean, field?: string, error?: string }
 */
export async function validateUsernameEmail(
  newUsername?: string,
  newEmail?: string,
  currentUsername?: string,
  currentEmail?: string
): Promise<{ valid: boolean; field?: string; error?: string }> {
  // Validar username si es diferente al actual
  if (newUsername && newUsername !== currentUsername) {
    const existsUser = await User.findOne({ username: newUsername });
    if (existsUser) {
      return { valid: false, field: 'username', error: 'USERNAME_EXISTS' };
    }
  }

  // Validar email si es diferente al actual
  if (newEmail && newEmail !== currentEmail) {
    const existsEmail = await User.findOne({ email: newEmail });
    if (existsEmail) {
      return { valid: false, field: 'email', error: 'EMAIL_EXISTS' };
    }
  }

  return { valid: true };
}

/**
 * Valida que el usuario actual sea propietario del recurso
 * @param reqUsername - Username del usuario autenticado (de req.username)
 * @param paramUsername - Username del parámetro de ruta
 * @returns true si es propietario, false si no
 */
export function validateUsernameOwnership(
  reqUsername: string,
  paramUsername: string
): boolean {
  return reqUsername === paramUsername;
}

/**
 * Valida los campos requeridos para registración
 * @param username - Username
 * @param email - Email
 * @param password - Contraseña
 * @param confirmPassword - Confirmación de contraseña
 * @returns { valid: boolean, error?: string }
 */
export function validateRegistrationInput(
  username?: string,
  email?: string,
  password?: string,
  confirmPassword?: string
): { valid: boolean; error?: string } {
  if (!username || !email || !password || !confirmPassword) {
    return { valid: false, error: 'Todos los campos son requeridos' };
  }

  if (password !== confirmPassword) {
    return { valid: false, error: 'Las contraseñas no coinciden' };
  }

  return { valid: true };
}
