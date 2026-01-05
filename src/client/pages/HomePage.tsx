/**
 * @file HomePage.tsx
 * @description Página de inicio - Hub central después de autenticarse
 *
 * Página principal después de login donde usuario ve:
 * - Cartas destacadas/featured
 * - Slider de cartas recientes
 * - Acceso a navegación principal
 * - Recomendaciones personalizadas
 *
 * Responsabilidades:
 * - Mostrar catálogo de cartas populares
 * - Proporcionar punto de entrada a otras secciones
 * - Interfaz limpia y atractiva
 * - Responsive design
 *
 * Características:
 * - Hero section con CTAs
 * - Featured cards carousel
 * - Cartas recientes slider
 * - Header con navegación
 * - Footer con links
 *
 * Integración:
 * - Redux: Almacena cartas en cache
 * - Socket.io: Escucha actualizaciones
 * - API: Obtiene datos de cartas
 * - Navegación: Acceso a Trading, Colección, etc
 *
 * @author Proyecto E09
 * @version 1.0.0
 * @module client/pages/HomePage
 * @component
 * @returns {React.ReactElement} Página principal
 * @see components/FeaturedCards
 * @see components/Hero
 * @see components/Header/Header
 */
import React from 'react';
import Header from '../components/Header/Header';
import Hero from '../components/Hero';
import FeaturedCards from '../components/FeaturedCards';
import Footer from '../components/Footer';
import '../styles/app.css';
import '../styles/hero.css';

const HomePage: React.FC = () => {
  return (
    <div
      className="homePage"
      style={{ backgroundColor: 'var(--background)', color: 'var(--text)' }}
    >
      <Header />
      <main className="homeMain">
        <Hero />
        <div className="home-transition" />
        <FeaturedCards />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
