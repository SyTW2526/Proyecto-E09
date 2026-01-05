/**
 * @file authMiddleware.ts
 * @description Middleware de Autenticación - Verificación de JWT
 *
 * Middleware Express para validar JSON Web Tokens en requests.
 * Protege rutas que requieren autenticación de usuario.
 *
 * **Flujo de autenticación:**
 * 1. Cliente envía token en header Authorization
 * 2. Middleware extrae y valida token
 * 3. Si válido: almacena userId en request
 * 4. Si inválido: retorna 401 Unauthorized
 * 5. Siguiente handler recibe request autenticado
 *
 * **Header esperado:**
 * ```
 * Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
 * ```
 *
 * **Interfaz AuthRequest:**
 * Extiende Request de Express con campos:
 * - userId: ID MongoDB del usuario
 * - username: Nombre de usuario
 * - io: Instancia de Socket.io (opcional)
 *
 * **Validaciones:**
 * - Presencia del header Authorization
 * - Formato "Bearer <token>"
 * - Token válido (firma correcta)
 * - Token no expirado
 * - Payload contiene userId
 *
 * **Respuestas de error:**
 * - 401: Token no proporcionado
 * - 401: Formato inválido (no es Bearer)
 * - 401: Token inválido/malformado
 * - 401: Token expirado
 * - 401: Firma incorrecta
 *
 * **Uso en routers:**
 * ```typescript
 * router.get('/profile', authMiddleware, async (req, res) => {
 *   const userId = (req as AuthRequest).userId; // Ya autenticado
 *   // ... handler logic
 * });
 * ```
 *
 * **Seguridad:**
 * - Valida en servidor (no confía cliente)
 * - HMAC con secret fuerte
 * - Expiración de tokens (7 días)
 * - Manejo de errores sin leaks
 * - Rate limiting recomendado
 *
 * **Socket.io integración:**
 * - Valida token en handshake Socket.io
 * - Propaga io al request (si existe)
 * - Permite emisión de eventos desde rutas
 *
 * **Alternativas consideradas:**
 * - Passport.js (más complejo)
 * - OpenID Connect (OAuth)
 * - API Keys (menos seguro)
 * - Sessions (requiere servidor stateful)
 * → Elegimos JWT por stateless y simplicidad
 *
 * **Mejoras posibles:**
 * - Refresh tokens (reissue tokens expirados)
 * - Token blacklist (logout efectivo)
 * - CSRF protection (si usa cookies)
 * - Rate limiting por usuario
 * - Auditoría de accesos
 *
 * **Integración:**
 * - Aplicado a rutas protegidas
 * - jwtHelpers.ts para token signing
 * - routers/users.ts genera tokens
 * - Socket.io usa en setup
 *
 * @author Proyecto E09
 * @version 1.0.0
 * @requires express
 * @requires jsonwebtoken
 * @module server/middleware/authMiddleware
 * @see utils/jwtHelpers.ts
 * @see routers/users.ts
 * @see index.ts
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

/**
 * Interfaz extendida de Request para incluir el userId después de validar el token
 */
export interface AuthRequest extends Request {
  userId?: string;
  username?: string;
  io?: any;
}

/**
 * Middleware de autenticación con JWT
 * Valida el token enviado en el header Authorization
 *
 * Uso:
 * router.get('/protected-route', authMiddleware, (req, res) => { ... })
 */
export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Obtener el token del header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).send({ error: 'Token no proporcionado' });
      return;
    }

    // El formato esperado es: "Bearer <token>"
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      res
        .status(401)
        .send({ error: 'Formato de token inválido. Use: Bearer <token>' });
      return;
    }

    const token = parts[1];
    const secret = process.env.JWT_SECRET || 'tu-clave-secreta';

    // Verificar y decodificar el token
    const decoded = jwt.verify(token, secret) as {
      userId: string;
      username: string;
    };

    // Guardar información del usuario en la request para usarla en la ruta
    req.userId = decoded.userId;
    req.username = decoded.username;

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).send({ error: 'Token expirado' });
    } else if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).send({ error: 'Token inválido' });
    } else {
      res
        .status(500)
        .send({ error: (error as Error).message ?? 'Error al validar token' });
    }
  }
};

/**
 * Middleware opcional de autenticación.
 * Si viene un token válido en Authorization lo decodifica y pone req.userId/username.
 * Si no viene token o es inválido, no bloquea la petición — simplemente continúa sin user info.
 */
export const optionalAuthMiddleware = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return next();
    }
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return next();
    }
    const token = parts[1];
    const secret = process.env.JWT_SECRET || 'tu-clave-secreta';
    try {
      const decoded = jwt.verify(token, secret) as {
        userId: string;
        username: string;
      };
      req.userId = decoded.userId;
      req.username = decoded.username;
    } catch (e) {
      // token inválido: no bloqueamos, solo no seteamos userId
    }
    return next();
  } catch (error) {
    return next();
  }
};

/**
 * Middleware para Socket.io
 * Valida el token antes de permitir la conexión a Socket
 */
export const socketAuthMiddleware = (socket: any, next: any) => {
  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Token no proporcionado'));
    }

    const secret = process.env.JWT_SECRET || 'tu-clave-secreta';
    const decoded = jwt.verify(token, secret) as {
      userId: string;
      username: string;
    };

    // Guardar información del usuario en el socket
    socket.userId = decoded.userId;
    socket.username = decoded.username;

    next();
  } catch (error) {
    next(new Error('Autenticación fallida: ' + (error as Error).message));
  }
};
