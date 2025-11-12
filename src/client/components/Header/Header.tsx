import React, { useState } from "react";
import { Search, Bell, Settings, User, Menu } from "lucide-react";

const Header: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-gradient-to-r from-sky-600 to-blue-500 shadow-lg sticky top-0 left-0 w-full z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-2 sm:px-10">
        {/* IZQUIERDA */}
        <div className="flex items-center gap-6 sm:gap-8">
          <img
            src="/logo.png"
            alt="AMI Logo"
            className="w-20 h-20 sm:w-24 sm:h-24 object-contain drop-shadow-lg"
          />

          {/* NAV desktop */}
          <nav className="hidden md:flex items-center gap-4 sm:gap-6">
            <a href="/coleccion" className="CollectionButton">Colección</a>
            <a href="/intercambio" className="CollectionButton">Intercambio</a>
          </nav>

          {/* Burger mobile */}
          <button
            className="md:hidden p-2 text-white"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* BUSCADOR */}
        <div className="hidden sm:flex items-center justify-center w-full max-w-md relative mx-4 md:mx-10">
          <input
            type="text"
            placeholder="Buscar cartas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="header-search pr-10 w-full"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-black/70 pointer-events-none" />
        </div>

        {/* ICONOS */}
        <div className="flex items-center justify-end gap-4 sm:gap-5">
          <button className="p-2 hover:bg-white/20 rounded-full transition" aria-label="Notificaciones">
            <Bell className="w-6 h-6 sm:w-7 sm:h-7 text-black" />
          </button>
          <button className="p-2 hover:bg-white/20 rounded-full transition" aria-label="Ajustes">
            <Settings className="w-6 h-6 sm:w-7 sm:h-7 text-black" />
          </button>
          <button className="p-2 hover:bg-white/20 rounded-full transition" aria-label="Perfil">
            <User className="w-6 h-6 sm:w-7 sm:h-7 text-black" />
          </button>
        </div>
      </div>

      {/* MENÚ MÓVIL */}
      {menuOpen && (
        <nav className="md:hidden bg-sky-700 text-white flex flex-col items-center gap-4 py-4 shadow-inner">
          <a href="/coleccion" className="CollectionButton w-40 text-center">Colección</a>
          <a href="/intercambio" className="CollectionButton w-40 text-center">Intercambio</a>
        </nav>
      )}
    </header>
  );
};

export default Header;
