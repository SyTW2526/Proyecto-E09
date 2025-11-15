import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

/**
 * Interfaz extendida de Request para incluir el userId después de validar el token
 */
export interface AuthRequest extends Request {
  userId?: string;
  username?: string;
}

/**
 * Middleware de autenticación con JWT
 * Valida el token enviado en el header Authorization
 * 
 * Uso:
 * router.get('/protected-route', authMiddleware, (req, res) => { ... })
 */
export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
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
      res.status(401).send({ error: 'Formato de token inválido. Use: Bearer <token>' });
      return;
    }

    const token = parts[1];
    const secret = process.env.JWT_SECRET || 'tu-clave-secreta';

    // Verificar y decodificar el token
    const decoded = jwt.verify(token, secret) as { userId: string; username: string };

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
      res.status(500).send({ error: (error as Error).message ?? 'Error al validar token' });
    }
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
    const decoded = jwt.verify(token, secret) as { userId: string; username: string };

    // Guardar información del usuario en el socket
    socket.userId = decoded.userId;
    socket.username = decoded.username;

    next();
  } catch (error) {
    next(new Error('Autenticación fallida: ' + (error as Error).message));
  }
};
