import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express'
import { User } from '../models/User.js';

export interface AuthRequest extends Request {
  user?: any
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
      return res.status(401).send({ error: 'Token no proporcionado' })
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string }
    const user = await User.findById(decoded.id)
    if (!user) {
      return res.status(401).send({ error: 'Usuario no encontrado' })
    }
    req.user = user 
    next()
  } catch (error) {
    res.status(401).send({ error: 'Token inválido o expirado' })
  }
}
