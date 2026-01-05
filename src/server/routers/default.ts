/**
 * @file default.ts
 * @description Router Default - Manejador de rutas no definidas
 *
 * Router de respaldo para capturar y responder a endpoints no implementados.
 * Se coloca al final de la cadena de routers como fallback.
 *
 * **Funciones:**
 * - Captura cualquier ruta que no matched otros routers
 * - Retorna código 501 (Not Implemented)
 * - Proporciona feedback claro al cliente
 * - Logging de rutas no válidas (opcional)
 *
 * **Respuestas:**
 * - 501 Not Implemented
 * - Mensaje descriptivo: "Endpoint no implementado"
 * - Información de ruta intentada
 *
 * **Posicionamiento:**
 * En la aplicación (api.ts):
 * 1. Routers específicos (users, card, trade, etc)
 * 2. Routers generales (pokemon, api)
 * 3. defaultRouter (fallback)
 *
 * **Ejemplo de uso en api.ts:**
 * ```javascript
 * app.use('/api', usersRouter);
 * app.use('/api', cardRouter);
 * // ... otros routers
 * app.use(defaultRouter); // Al final
 * ```
 *
 * **Mejoras posibles:**
 * - Logging de 404s para análisis
 * - Sugerencias de endpoints válidos
 * - Documentación swagger/OpenAPI link
 * - Rate limiting para fuerza bruta
 *
 * Integración:
 * - Parte de la arquitectura de routers
 * - Usado en api.ts
 * - No tiene dependencias de modelos
 * - Independiente de autenticación
 *
 * @author Proyecto E09
 * @version 1.0.0
 * @requires express
 * @module server/routers/default
 * @see api.ts
 */

/**
 * @file default.ts
 * @description Router por defecto para rutas no especificadas
 *
 * Maneja todas las rutas que no están definidas en otros routers.
 * Retorna 501 (Not Implemented) para cualquier ruta desconocida.
 *
 * @requires express - Framework web
 */

import express from 'express';

/**
 * Router por defecto
 * Última opción en la cadena de routers
 */
export const defaultRouter = express.Router();

/**
 * Ruta por defecto, cualquier ruta no especificada entrará aqui
 * Retorna status 501 (Not Implemented)
 */
defaultRouter.all('/{*splat}', (_, res) => {
  res.status(501).send();
});
