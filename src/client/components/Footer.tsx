import React from 'react';
import { Instagram, Youtube } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="footer-bg text-white py-8 mt-12">
      <div className="container mx-auto px-4">
        <div className="footer-grid">
          {/* Redes Sociales */}
          <div>
            <h3 className="footer-title">Redes Sociales</h3>
            <div className="footer-links">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-link"
              >
                <Instagram className="w-5 h-5" />
                <span>Instagram</span>
              </a>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-link"
              >
                <span className="w-5 h-5 flex items-center justify-center">▶️</span>
                <span>TikTok</span>
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-link"
              >
                <Youtube className="w-5 h-5" />
                <span>YouTube</span>
              </a>
            </div>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="footer-title">Contacto</h3>
            <div className="footer-links">
              <p className="text-sm mb-1">Email:</p>
              <a
                href="mailto:cardsami@gmail.com"
                className="footer-link-email"
              >
                cardsami@gmail.com
              </a>
            </div>
          </div>

          {/* Copyright - Centrado */}
          <div className="text-center">
            <p className="footer-link-simple">
              2025 - CardsAMI. Todos los derechos reservados
            </p>
          </div>

          {/* Aspectos Legales */}
          <div>
            <h3 className="footer-title">Aspectos legales</h3>
            <div className="footer-links">
              <a href="/privacidad" className="footer-link-simple">Política de privacidad</a>
              <a href="/terminos" className="footer-link-simple">Términos de uso</a>
              <a href="/aviso-legal" className="footer-link-simple">Aviso legal</a>
            </div>
          </div>

          {/* Accesibilidad */}
          <div>
            <h3 className="footer-title">Accesibilidad</h3>
            <div className="footer-links">
              <a href="/accesibilidad" className="footer-link-simple">Declaración de accesibilidad</a>
              <a href="/herramientas" className="footer-link-simple">Herramientas de accesibilidad</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;