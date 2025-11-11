import React from "react";
import { Settings } from "lucide-react";
import NotificationBell from "./NotificationBell";
import LanguageSelector from "./LanguageSelector";
import DarkModeToggle from "./DarkModeToggle";

const AuthHeader: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-sky-600 to-blue-500 shadow-lg fixed top-0 left-0 w-full z-40">
      <div className="flex items-center justify-between w-full px-8 py-4">
        
        {/*LOGO */}
        <div className="flex items-center gap-4">
          <img
            src="/logo.png"
            alt="AMI Logo"
            className="w-28 h-28 object-contain drop-shadow-lg"
          />
          <h1 className="text-white font-bold text-2xl tracking-wide">
            CARDS AMI
          </h1>
        </div>

        {/* BOTONES + CONTROLES */}
        <div className="flex items-center gap-6">
          {/* Bloque de botones */}
          <div className="flex items-center gap-4">
            <a href="/login" className="CollectionButton text-sm">
              Iniciar sesión
            </a>
            <a href="/signup" className="CollectionButton text-sm">
              Crear cuenta
            </a>
          </div>

          {/* Nuevos controles: Notificaciones, Idioma, Modo Oscuro */}
          <div className="flex items-center gap-2">
            <NotificationBell />
            <LanguageSelector />
            <DarkModeToggle />
          </div>

          {/* Icono ajustes */}
          <button
            aria-label="Ajustes"
            className="p-2 hover:bg-white/20 rounded-full transition"
          >
            <Settings className="w-7 h-7 text-white" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default AuthHeader;
