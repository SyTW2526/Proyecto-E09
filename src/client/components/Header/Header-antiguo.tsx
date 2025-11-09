import React, { useState } from "react";
import { Search, Bell, Settings, User } from "lucide-react";

const Header: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="bg-linear-to-r from-sky-600 to-blue-500 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto grid items-center grid-cols-3 px-6 py-2 gap-4">
        {/* IZQUIERDA: LOGO + NAVEGACIÓN */}
        <div className="flex items-center gap-6 pr-4">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="AMI Logo"
              className="header-logo"
            />
          </div>

          <nav className="flex items-center gap-4 ml-4">
            <a href="/coleccion" className="CollectionButton">
              Colección
            </a>
            <a href="/intercambio" className="CollectionButton">
              Intercambio
            </a>
          </nav>
        </div>

        {/* CENTRO: BUSCADOR */}
        <div className="flex justify-center">
          <div className="w-full max-w-xs md:max-w-sm relative">
            <input
              type="text"
              placeholder="Buscar cartas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="header-search pl-10 w-full"
            />
            <Search className="absolute -left-1/18 top-1/4 -translate-y-2 w-4 h-4 text-white/70" />
          </div>
        </div>

        {/* DERECHA: ICONOS */}
        <div className="header-icons flex justify-end items-center gap-4">
          <button
            type="button"
            aria-label="Notificaciones"
            className="p-3 md:p-4 hover:bg-white/20 rounded-full transition-colors"
          >
            <Bell className="header-icon w-6 h-6 md:w-7 md:h-7" />
          </button>
          <button
            type="button"
            aria-label="Ajustes"
            className="p-3 md:p-4 hover:bg-white/20 rounded-full transition-colors"
          >
            <Settings className="header-icon w-6 h-6 md:w-7 md:h-7" />
          </button>
          <button
            type="button"
            aria-label="Perfil"
            className="p-3 md:p-4 hover:bg-white/20 rounded-full transition-colors"
          >
            <User className="header-icon w-6 h-6 md:w-7 md:h-7" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
