/**
 * @file DarkModeToggle.tsx
 * @description Toggle para cambiar entre modo oscuro y claro
 *
 * Componente botón en el header que permite alternar entre tema oscuro y claro.
 * Persiste la preferencia en localStorage y aplica clases CSS al documento.
 *
 * **Características principales:**
 * - Toggle button con icono Sol (light mode) / Luna (dark mode)
 * - Sincronización con Redux preferencesSlice
 * - Persistencia en localStorage (darkMode)
 * - Aplica clase "dark" al elemento HTML
 * - Cambia colorScheme CSS del body (dark/light)
 * - Animación de transición suave
 * - Responsive design (adapta tamaño en mobile/desktop)
 *
 * **Comportamiento:**
 * - Al cargar: Lee preferencia guardada de localStorage
 * - Al hacer click: Toglea el modo y guarda en localStorage
 * - Automático: Aplica CSS class al documentElement
 * - Persistente: Se mantiene entre sesiones
 *
 * **Estados:**
 * - darkMode: Boolean de preferencia (Redux)
 * - Sin estado local (todo en Redux + localStorage)
 *
 * **Estilo:**
 * - Light mode: Icono Luna (blanco), botón con hover semi-transparent
 * - Dark mode: Icono Sol (amarillo/dorado), botón con hover semi-transparent
 *
 * **Integración:**
 * - Redux preferencesSlice (setDarkMode)
 * - localStorage para persistencia
 * - CSS Tailwind class "dark" para estilos globales
 *
 * **Accesibilidad:**
 * - aria-label dinámico (Dark Mode / Light Mode)
 * - Keyboard accessible (click vía Enter/Space)
 * - Icono claro e intuitivo
 *
 * @author Proyecto E09
 * @version 1.0.0
 * @component
 * @requires react
 * @requires react-redux
 * @requires react-i18next
 * @requires lucide-react (Moon, Sun icons)
 * @module client/components/Header/DarkModeToggle
 * @see Header.tsx
 * @see preferencesSlice.ts
 */

import React, { useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { RootState } from '../../store/store';
import { setDarkMode } from '../../features/preferences/preferencesSlice';

const DarkModeToggle: React.FC = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const darkMode = useSelector(
    (state: RootState) => state.preferences.preferences.darkMode
  );
  useEffect(() => {
    const htmlElement = document.documentElement;
    if (darkMode) {
      htmlElement.classList.add('dark');
      document.body.style.colorScheme = 'dark';
    } else {
      htmlElement.classList.remove('dark');
      document.body.style.colorScheme = 'light';
    }
  }, [darkMode]);

  useEffect(() => {
    const saved = localStorage.getItem('darkMode');
    if (saved === 'true') {
      dispatch(setDarkMode(true));
    }
  }, [dispatch]);

  const handleToggle = () => {
    const newMode = !darkMode;
    dispatch(setDarkMode(newMode));
    localStorage.setItem('darkMode', String(newMode));
  };

  return (
    <button
      onClick={handleToggle}
      aria-label={darkMode ? t('darkMode.light') : t('darkMode.dark')}
      className="p-2 hover:bg-white/20 rounded-full transition"
    >
      {darkMode ? (
        <Sun className="w-6 h-6 sm:w-7 sm:h-7 text-yellow-300" />
      ) : (
        <Moon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
      )}
    </button>
  );
};

export default DarkModeToggle;
