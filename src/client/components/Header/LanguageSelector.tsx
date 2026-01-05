/**
 * @file LanguageSelector.tsx
 * @description Selector de idioma - Cambia entre español e inglés
 *
 * Componente dropdown en el header que permite cambiar el idioma de la aplicación.
 * Soporta español (ES) e inglés (EN) con iconos de bandera.
 *
 * **Características principales:**
 * - Dropdown con opciones ES y EN
 * - Iconos de bandera (🇪🇸 🇺🇸) para identificar idiomas
 * - Marca visual del idioma actualmente seleccionado
 * - Sincronización con i18next
 * - Guardado de preferencia en localStorage
 * - Dispatch a Redux preferencesSlice
 * - Cierra dropdown automático al seleccionar
 * - Responsive design (mobile/desktop)
 *
 * **Comportamiento:**
 * - Click en globo: Abre/cierra dropdown
 * - Click en idioma: Cambia idioma, guarda preferencia, cierra dropdown
 * - Toda la app se traduce automáticamente vía i18next
 * - Persistencia entre sesiones
 *
 * **Idiomas soportados:**
 * - Español (es): Interfaz y contenido en español
 * - English (en): Interfaz y contenido en inglés
 *
 * **Estilos:**
 * - Activo: Fondo azul, texto azul, animación "is-active"
 * - Inactivo: Gris claro en hover, oscuro en dark mode
 * - Separador entre opciones
 * - z-index 9999 para aparecer sobre otros elementos
 *
 * **Integración:**
 * - i18n.changeLanguage(newLanguage)
 * - Redux setLanguage action
 * - localStorage para persistencia
 * - Dark/light mode compatible
 *
 * **Accesibilidad:**
 * - aria-label en botón principal
 * - Keyboard accessible
 * - Iconos claros de bandera
 *
 * @author Proyecto E09
 * @version 1.0.0
 * @component
 * @requires react
 * @requires react-redux
 * @requires react-i18next (i18n context)
 * @requires lucide-react (Globe icon)
 * @module client/components/Header/LanguageSelector
 * @see Header.tsx
 * @see preferencesSlice.ts
 */

import React, { useState } from 'react';
import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { setLanguage } from '../../features/preferences/preferencesSlice';

const LanguageSelector: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { i18n, t } = useTranslation();
  const dispatch = useDispatch();

  const handleLanguageChange = (newLanguage: 'es' | 'en') => {
    i18n.changeLanguage(newLanguage);
    dispatch(setLanguage(newLanguage));
    setIsOpen(false);
    localStorage.setItem('language', newLanguage);
  };

  return (
    <div className="relative">
      <button
        aria-label={t('common.languageSelector', 'Language Selector')}
        className="p-2 hover:bg-white/20 rounded-full transition"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Globe className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
      </button>

      {isOpen && (
        <div className="language-dropdown absolute right-0 mt-2 w-40 rounded-lg shadow-2xl z-[9999] border overflow-hidden">
          <button
            onClick={() => handleLanguageChange('es')}
            className={`w-full text-left px-4 py-3 text-sm font-medium transition border-b border-gray-100 dark:border-gray-700 ${
              i18n.language === 'es'
                ? 'is-active'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'
            }`}
          >
            🇪🇸 {t('common.spanish', 'Español')}
          </button>
          <button
            onClick={() => handleLanguageChange('en')}
            className={`w-full text-left px-4 py-3 text-sm font-medium transition ${
              i18n.language === 'en'
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'
            }`}
          >
            🇺🇸 {t('common.english', 'English')}
          </button>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
