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
    <header className="bg-gradient-to-r from-sky-600 to-blue-500 shadow-lg fixed top-0 left-0 w-full z-40 dark:from-gray-800 dark:to-gray-900 dark:border-b dark:border-gray-700 transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3 sm:px-10">
        
        {/* IZQUIERDA: LOGO + NAV */}
        <div className="flex items-center gap-6 sm:gap-10">
          <img
            src="/logo.png"
            alt="AMI Logo"
            className="w-20 h-20 sm:w-24 sm:h-24 object-contain drop-shadow-lg"
          />

          {/* NAV desktop */}
          <nav className="hidden md:flex items-center gap-4 sm:gap-6">
            <a href="/coleccion" className="CollectionButton dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100 dark:border-gray-600 transition-colors">
              {t('header.coleccion')}
            </a>
            <a href="/intercambio" className="CollectionButton dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100 dark:border-gray-600 transition-colors">
              {t('header.intercambio')}
            </a>
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
            placeholder={t('header.buscar')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="header-search pr-10 w-full px-4 py-2 rounded-lg border border-sky-300 bg-white text-gray-900 placeholder-gray-500 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-400 dark:focus:ring-sky-500 transition-colors"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-black/70 dark:text-gray-300 pointer-events-none" />
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
