import React from 'react';
import { Instagram, Youtube } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-black text-white py-6 mt-12">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-start">
          {/* Redes Sociales */}
          <div>
            <h3 className="font-bold mb-3">Redes Sociales</h3>
            <div className="space-y-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-pink-400 transition-colors"
              >
                <Instagram className="w-5 h-5" />
                <span>Instagram</span>
              </a>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-cyan-400 transition-colors"
              >
                <span className="w-5 h-5 flex items-center justify-center font-bold">📱</span>
                <span>Tik Tok</span>
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-red-500 transition-colors"
              >
                <Youtube className="w-5 h-5" />
                <span>YouTube</span>
              </a>
            </div>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="font-bold mb-3">Contacto</h3>
            <div>
              <p className="text-sm mb-1">Email:</p>
              <a
                href="mailto:cardsami@gmail.com"
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                cardsami@gmail.com
              </a>
            </div>
          </div>

          {/* Copyright */}
          <div className="text-center">
            <p className="text-sm">
              2025 - CardsAMI. Todos los derechos reservados
            </p>
          </div>

          {/* Aspectos Legales */}
          <div>
            <h3 className="font-bold mb-3">Aspectos legales</h3>
            <div className="space-y-1 text-sm">
              <a href="/privacidad" className="block hover:text-gray-300 transition-colors">
                Política de privacidad
              </a>
              <a href="/terminos" className="block hover:text-gray-300 transition-colors">
                Términos de uso
              </a>
              <a href="/aviso-legal" className="block hover:text-gray-300 transition-colors">
                Aviso legal
              </a>
            </div>
          </div>

          {/* Accesibilidad */}
          <div>
            <h3 className="font-bold mb-3">Accesibilidad</h3>
            <div className="space-y-1 text-sm">
              <a href="/accesibilidad" className="block hover:text-gray-300 transition-colors">
                Declaración de accesibilidad
              </a>
              <a href="/herramientas" className="block hover:text-gray-300 transition-colors">
                Herramientas de accesibilidad
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;