import React, { useState } from "react";
import { Search, Settings, User, Menu } from "lucide-react";
import { useTranslation } from "react-i18next";
import NotificationBell from "./NotificationBell";
import LanguageSelector from "./LanguageSelector";
import DarkModeToggle from "./DarkModeToggle";

const Header: React.FC = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-gradient-to-r from-sky-600 to-blue-500 shadow-lg fixed top-0 left-0 w-full z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3 sm:px-10">
        
        {/* IZQUIERDA: LOGO + NAV */}
        <div className="flex items-center gap-6 sm:gap-10">
          <img
            src="/logo.png"
            alt="AMI Logo"
            className="w-24 h-24 sm:w-32 sm:h-32 object-contain drop-shadow-lg"
          />

          {/* NAV SOLO EN DESKTOP */}
          <nav className="hidden md:flex items-center gap-4 sm:gap-6">
            <a href="/coleccion" className="CollectionButton">
              {t('header.coleccion')}
            </a>
            <a href="/intercambio" className="CollectionButton">
              {t('header.intercambio')}
            </a>
          </nav>

          {/* BOTÓN HAMBURGUESA (solo móvil) */}
          <button
            className="md:hidden p-2 text-white"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* CENTRO: BUSCADOR (solo visible en escritorio y tablets grandes) */}
        <div className="hidden sm:flex items-center justify-center w-full max-w-md relative mx-4 md:mx-10">
          <input
            type="text"
            placeholder={t('header.buscar')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="header-search pr-10 w-full"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-black/70 pointer-events-none" />
        </div>

        {/* DERECHA: ICONOS */}
        <div className="flex items-center justify-end gap-2 sm:gap-3">
          {/* Nuevos componentes */}
          <NotificationBell />
          <LanguageSelector />
          <DarkModeToggle />
          
          {/* Ajustes legacy */}
          <button
            aria-label={t('header.settings')}
            className="p-2 hover:bg-white/20 rounded-full transition"
          >
            <Settings className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </button>
          <button
            aria-label={t('header.perfil')}
            className="p-2 hover:bg-white/20 rounded-full transition"
          >
            <User className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </button>
        </div>
      </div>

      {/* MENÚ MÓVIL (colapsable) */}
      {menuOpen && (
        <nav className="md:hidden bg-sky-700 text-white flex flex-col items-center gap-4 py-4 shadow-inner">
          <a href="/coleccion" className="CollectionButton w-40 text-center">
            {t('header.coleccion')}
          </a>
          <a href="/intercambio" className="CollectionButton w-40 text-center">
            {t('header.intercambio')}
          </a>
        </nav>
      )}
    </header>
  );
};

export default Header;
