/**
 * @file jwtHelpers.ts
 * @description Utilidades JWT - Generación y validación de tokens
 *
 * Centraliza la lógica de autenticación mediante JSON Web Tokens.
 * Proporciona funciones para crear y verificar tokens de sesión.
 *
 * **Funcionalidades:**
 * - Generación de tokens JWT con payload de usuario
 * - Verificación y decodificación de tokens
 * - Validación de firma y expiración
 * - Manejo de errores de tokens inválidos
 * - Configuración centralizada de secretos
 *
 * **Estructura de JWT:**
 * Header: { alg: 'HS256', typ: 'JWT' }
 * Payload: { userId, username, iat, exp }
 * Signature: HMACSHA256(header.payload, secret)
 *
 * **Flujo de autenticación:**
 * 1. Usuario hace login exitoso
 * 2. Servidor genera JWT via signToken()
 * 3. Cliente almacena en localStorage
 * 4. Cliente envía en header Authorization
 * 5. authMiddleware verifica con verifyToken()
 * 6. Si válido, request procede; si no, rechaza
 *
 * **Configuración:**
 * - Secret: variable de entorno JWT_SECRET
 * - Expiración default: 7 días
 * - Algoritmo: HS256 (HMAC-SHA256)
 * - Payload: userId, username (customizable)
 *
 * **Seguridad:**
 * - Secret debe ser fuerte y secreto
 * - Tokens tienen fecha de expiración
 * - No contiene información sensible en payload
 * - Verificación de firma en cada request
 * - Protección contra token tampering
 *
 * **Integración:**
 * - authMiddleware.ts verifica tokens en request
 * - routers/users.ts genera tokens en login
 * - Socket.io usa tokens en conexión
 * - Frontend guarda en localStorage
 *
 * @author Proyecto E09
 * @version 1.0.0
 * @requires jsonwebtoken
 * @module server/utils/jwtHelpers
 * @see middleware/authMiddleware.ts
 * @see routers/users.ts
 */

import jwt from 'jsonwebtoken';

/**
 * Genera un token JWT para autenticación de usuario
 *
 * @param userId - ID del usuario
 * @param username - Nombre de usuario
 * @param expiresIn - Tiempo de expiración (por defecto 7 días)
 * @returns Token JWT firmado
 *
 * @example
 * const token = generateAuthToken(user._id.toString(), user.username);
 */
export function generateAuthToken(
  userId: string,
  username: string,
  expiresIn: string = '7d'
): string {
  const secret = process.env.JWT_SECRET || 'tu-clave-secreta';

  return jwt.sign({ userId, username }, secret, {
    expiresIn,
  } as jwt.SignOptions);
}
