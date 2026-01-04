/**
 * @file vitest.config.ts
 * @description Configuración de Vitest para pruebas unitarias e integración
 * 
 * Configura:
 * - Entorno de ejecución: Node.js
 * - Globales: expect, describe, it, etc (sin necesidad de importar)
 * - Cobertura de código con V8
 * - Archivos de test: test/**\/*.spec.ts
 * - Alias @ para importes desde src
 * 
 * Cobertura:
 * - Include: src/**\/*.ts
 * - Exclude: test/**, node_modules/, etc.
 * - Reportes: text, lcov
 * 
 * @requires vitest - Framework de testing
 * @requires v8 - Proveedor de cobertura
 */

import { defineConfig } from 'vitest/config'
import path from 'path'

/**
 * Configuración de Vitest exportada
 * @type {import('vitest/config').InlineConfig}
 */
export default defineConfig({
  /**
   * Configuración de pruebas
   */
  test: {
    /**
     * Variables globales disponibles sin importar
     */
    globals: true,
    
    /**
     * Entorno de ejecución para pruebas
     */
    environment: 'node',
    
    /**
     * Patrón de archivos de prueba
     */
    include: ['test/**/*.spec.ts'],

    /**
     * Configuración de cobertura de código
     */
    coverage: {
      /**
       * Proveedor de cobertura (v8 es nativo de Node.js)
       */
      provider: 'v8',
      
      /**
       * Tipos de reportes a generar
       */
      reporter: ['text', 'lcov'],
      
      /**
       * Directorio donde se guardan los reportes
       */
      reportsDirectory: './coverage',

      /**
       * Archivos a incluir en cobertura
       */
      include: ['src/**/*.ts'],

      /**
       * Archivos a excluir de cobertura
       */
      exclude: [
        'test/**',
        '**/*.test.ts',
        '**/*.spec.ts',
        'node_modules/**',
        'public/**',
        'src/client/hooks/**',
        'src/client/i18n/**',
        'src/client/store/**',
        'src/client/types.ts',
        'src/client/socket.ts',
        'src/client/services/apiService.ts',
        'src/client/utils/imageHelpers.ts',
        'src/server/scripts/**',
        'src/server/index.ts',
        'src/server/api.ts',
        'src/server/utils/fetchHelpers.ts',
        'src/server/utils/responseHelpers.ts',
        'src/server/routers/api.ts',
        'src/server/services/tcgdx.ts'
      ],
    },
  },

  /**
   * Resolución de módulos
   */
  resolve: {
    /**
     * Alias para importes
     * @ apunta a src/client
     */
    alias: {
      '@': path.resolve(__dirname, './src/client'),
    },
  },
})
