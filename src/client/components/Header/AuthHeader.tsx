/**
 * @file AuthHeader.tsx
 * @description Header para página de autenticación (StartPage)
 *
 * Componente header simplificado que aparece solo en la página de inicio/auth.
 * Muestra el logo, botones Sign In/Sign Up, y selectores de idioma/tema.
 *
 * **Características principales:**
 * - Logo con gradiente de color
 * - Botones Sign In y Sign Up
 * - Selector de idioma (ES/EN)
 * - Toggle de modo oscuro
 * - Diferente de Header.tsx (navegación simplificada)
 * - Responsive design
 * - Estilos heredados de header.css
 *
 * **Secciones:**
 * - Logo a la izquierda
 * - Botones de autenticación en el medio/derecha
 * - Selectores de preferencias a la derecha
 *
 * **Props:**
 * - onSignIn: Callback para abrir modal de Sign In
 * - onSignUp: Callback para abrir modal de Sign Up
 *
 * **Comportamiento:**
 * - Click en "Sign In": Ejecuta onSignIn (abre modal)
 * - Click en "Sign Up": Ejecuta onSignUp (abre modal)
 * - Idioma/Tema: Afecta toda la app
 * - No tiene búsqueda ni notificaciones
 *
 * **Estilo:**
 * - Logo con gradiente azul
 * - Botones con estilos especiales para auth
 * - Estructura de dos columnas (logo | acciones)
 * - Colores de tema light/dark en selectores
 *
 * **Diferencias con Header.tsx:**
 * - Header.tsx: Navegación completa, búsqueda, notificaciones (para usuarios autenticados)
 * - AuthHeader.tsx: Simplificado, solo auth buttons, sin navegación (para StartPage)
 *
 * **Integración:**
 * - Uso en StartPage.tsx
 * - Hereda estilos de header.css (siteHeader, brand, topNav)
 * - Reutiliza LanguageSelector y DarkModeToggle
 * - i18next para traducciones
 *
 * @author Proyecto E09
 * @version 1.0.0
 * @component
 * @requires react
 * @requires react-i18next
 * @requires ./LanguageSelector
 * @requires ./DarkModeToggle
 * @module client/components/Header/AuthHeader
 * @see StartPage.tsx
 * @see Header.tsx
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSelector from './LanguageSelector';
import DarkModeToggle from './DarkModeToggle';
import '../../styles/header.css';

interface AuthHeaderProps {
  onSignIn: () => void;
  onSignUp: () => void;
}

const AuthHeader: React.FC<AuthHeaderProps> = ({ onSignIn, onSignUp }) => {
  const { t } = useTranslation();

  return (
    <header className="siteHeader">
      <div className="siteHeader__inner">
        <div className="siteHeader__left">
          <a href="/" className="brand">
            <span className="brand__text brand__text--gradient">
              {t('header.brand')}
            </span>
          </a>
        </div>

        <div />

        <div className="siteHeader__right">
          <nav className="topNav topNav--auth">
            <button onClick={onSignIn} className="topNav__link" type="button">
              {t('header.signIn')}
            </button>

            <button
              onClick={onSignUp}
              className="topNav__link topNav__link--btn"
              type="button"
            >
              {t('header.signUp')}
            </button>
          </nav>

          <LanguageSelector />
          <DarkModeToggle />
        </div>
      </div>
    </header>
  );
};

export default AuthHeader;
