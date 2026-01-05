/**
 * @file constants.ts
 * @description Constantes globales de configuración del cliente
 *
 * Centraliza:
 * - URLs de APIs (backend local, TCGdex externa)
 * - URLs de assets y recursos
 * - Configuraciones globales de la aplicación
 *
 * Actualizar estas constantes si cambian los servidores o URLs.
 *
 * @author Proyecto E09
 * @version 1.0.0
 * @module config/constants
 */

/**
 * URL base de la API del servidor backend
 * @constant
 */
export const API_BASE_URL = 'http://localhost:3000';

/**
 * URL base de la API pública TCGdex
 * @constant
 */
export const TCGDEX_API_URL = 'https://api.tcgdex.net/v2/en';

/**
 * URL base de los assets de TCGdex (imágenes de cartas)
 * @constant
 */
export const TCGDEX_ASSETS_URL = 'https://assets.tcgdex.net';
