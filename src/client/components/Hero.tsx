/**
 * @file Hero.tsx
 * @description Componente Hero - Banner principal de la página de inicio
 *
 * Banner hero que aparece en la página de inicio (HomePage).
 * Proporciona presentación visual de la aplicación con CTA (call-to-action).
 *
 * **Elementos:**
 * - Background con imagen/gradiente
 * - Título principal
 * - Descripción corta
 * - Botones de acción (ver cartas, empezar)
 * - Animaciones suaves
 *
 * **Características:**
 * - Responsive design (adapta altura en mobile)
 * - Dark mode compatible
 * - Multiidioma (i18n)
 * - Gradientes y efectos visuales
 * - Accesibilidad (semantic HTML)
 *
 * **Responsividad:**
 * - Desktop: Hero grande con imagen de fondo
 * - Tablet: Altura media, texto ajustado
 * - Mobile: Altura reducida, fonts más pequeñas
 *
 * **Animaciones:**
 * - Fade-in del contenido
 * - Hover effects en botones
 * - Parallax opcional en background
 *
 * **Integración:**
 * - Usado solo en HomePage
 * - Traducciones desde i18n
 * - Links a páginas de acción
 *
 * @author Proyecto E09
 * @version 1.0.0
 * @component
 * @example
 * return <Hero />
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
const Hero: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section className="home-hero">
      <div className="home-hero-bg" />

      <div className="home-hero-content">
        <h1 className="home-hero-brand">CARDS AMI</h1>

        <p className="home-hero-tagline">
          {t(
            'hero.tagline',
            'Descubre el mundo Pokémon a través de nuestras cartas'
          )}
        </p>

        <div className="home-hero-actions">
          <a href="/discover" className="hero-btn hero-btn-primary">
            {t('hero.explore', 'Explorar cartas')}
          </a>
          <a href="/collection" className="hero-btn hero-btn-secondary">
            {t('hero.myCollection', 'Mi colección')}
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;
