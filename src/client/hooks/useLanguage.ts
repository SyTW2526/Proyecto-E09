/**
 * @file useLanguage.ts
 * @description Hook React personalizado para gestionar el idioma de la aplicación
 *
 * Obtiene el idioma actual del estado Redux y actualiza
 * automáticamente el atributo lang en el elemento HTML root.
 * Sincroniza con i18next para traducciones en toda la aplicación.
 *
 * @author Proyecto E09
 * @version 1.0.0
 * @requires react
 * @requires react-redux
 * @requires i18next
 * @module hooks/useLanguage
 * @returns {string} Código de idioma actual (ej: 'es', 'en')
 * @example
 * const language = useLanguage();
 * console.log(language); // 'es'
 */

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

/**
 * Hook para gestionar el idioma de la aplicación
 *
 * Efectos:
 * - Lee el idioma del estado Redux
 * - Actualiza el atributo lang en el HTML root
 * - Se sincroniza automáticamente cuando cambia el idioma
 *
 * @function
 * @returns {string} Idioma actual ('es' | 'en')
 *
 * @example
 * function MyComponent() {
 *   const language = useLanguage();
 *   return <div>Idioma actual: {language}</div>;
 * }
 */
export const useLanguage = () => {
  /**
   * Obtiene el idioma desde el estado Redux
   */
  const language = useSelector(
    (state: RootState) => state.preferences.preferences.language
  );

  /**
   * Efecto: actualizar lang en el HTML cuando cambia el idioma
   * Esto ayuda a navegadores y lectores de pantalla a entender el idioma
   */
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return language;
};
