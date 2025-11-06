import express from 'express';

export const defaultRouter = express.Router();

/**
 * Ruta por defecto, cualquier ruta no especificada entrará aqui
 */
defaultRouter.all('/{*splat}', (_, res) => {
  res.status(501).send();
});