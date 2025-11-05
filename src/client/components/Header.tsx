import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Bell, Settings, User } from 'lucide-react';

const Header: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <div className="w-16 h-16 bg-linear-to-br from-amber-700 to-amber-900 rounded-lg flex items-center justify-center border-4 border-amber-600 shadow-lg">
              <span className="text-white font-bold text-2xl">AMI</span>
            </div>
          </Link>

          {/* Navegación */}
          <nav className="flex gap-4 ml-8">
            <Link
              to="/coleccion"
              className="px-8 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-full font-semibold text-lg transition-all duration-300 shadow-md"
            >
              COLECCIÓN
            </Link>
            <Link
              to="/intercambio"
              className="px-8 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-full font-semibold text-lg transition-all duration-300 shadow-md"
            >
              INTERCAMBIO
            </Link>
          </nav>

          {/* Buscador */}
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar cartas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pr-12 rounded-full border-2 border-gray-300 focus:border-blue-500 focus:outline-none"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Search className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Iconos de usuario */}
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Bell className="w-6 h-6 text-gray-700" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Settings className="w-6 h-6 text-gray-700" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <User className="w-8 h-8 text-gray-700" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;