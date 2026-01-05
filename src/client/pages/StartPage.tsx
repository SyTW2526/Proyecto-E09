/**
 * @file StartPage.tsx
 * @description Página de autenticación - Landing page con acceso a login/registro
 *
 * Página principal de bienvenida para usuarios no autenticados.
 * Proporciona acceso a formularios de registro e inicio de sesión.
 *
 * Características:
 * - Interfaz de hero/landing page
 * - Modal para login y registro
 * - Control de scroll cuando modal está abierto
 * - Header con botones de autenticación
 * - Footer informativo
 * - Responsive design
 *
 * Estados:
 * - modal: 'signin' | 'signup' | null - Formulario actualmente mostrado
 *
 * Flujo:
 * 1. Usuario ve página de inicio
 * 2. Clickea en "Iniciar sesión" o "Registrarse"
 * 3. Se abre modal con el formulario correspondiente
 * 4. Usuario completa y envía
 * 5. Si exitoso, redirige a HomePage
 *
 * Estilos:
 * - Gradiente de fondo dinámico
 * - Dark mode soportado
 * - Overlay para modal
 * - Animaciones suaves
 *
 * @author Proyecto E09
 * @version 1.0.0
 * @module client/pages/StartPage
 * @component
 * @returns {React.ReactElement} Página de inicio
 * @see components/SignInForm
 * @see components/SignUpForm
 * @see components/Header/AuthHeader
 */
import React, { useState, useEffect } from 'react';
import Header from '../components/Header/AuthHeader';
import Start from '../components/Start';
import Footer from '../components/Footer';
import SignInForm from '../components/SignInForm';
import SignUpForm from '../components/SignUpForm';
import '../styles/app.css';

const StartPage: React.FC = () => {
  const [modal, setModal] = useState<'signin' | 'signup' | null>(null);

  useEffect(() => {
    document.body.style.overflow = modal ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [modal]);

  return (
    <div className="min-h-screen bg-[radial-gradient(900px_500px_at_50%_-200px,rgba(48,120,211,0.06),transparent_60%)] dark:bg-[radial-gradient(900px_500px_at_50%_-200px,rgba(48,120,211,0.10),#0f172a_60%)]">
      <Header
        onSignIn={() => setModal('signin')}
        onSignUp={() => setModal('signup')}
      />

      <Start onStart={() => setModal('signup')} />

      <Footer />

      {modal && (
        <div className="auth-modal-overlay" onClick={() => setModal(null)}>
          <div className="auth-modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              className="auth-modal-close"
              onClick={() => setModal(null)}
              aria-label="Cerrar"
            >
              ✕
            </button>
            {modal === 'signin' && (
              <SignInForm onSwitch={() => setModal('signup')} />
            )}

            {modal === 'signup' && (
              <SignUpForm onSwitch={() => setModal('signin')} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StartPage;
