import React, { useState } from 'react';
import { Globe } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import { setLanguage } from '../../features/preferences/preferencesSlice';

const LanguageSelector: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();
  const language = useSelector((state: RootState) => state.preferences.preferences.language);

  const handleLanguageChange = (newLanguage: 'es' | 'en') => {
    dispatch(setLanguage(newLanguage));
    setIsOpen(false);
    localStorage.setItem('language', newLanguage);
  };

  return (
    <div className="relative">
      <button
        aria-label="Selector de idioma"
        className="p-2 hover:bg-white/20 rounded-full transition"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Globe className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-2xl z-[9999] border border-gray-200 overflow-hidden">
          <button
            onClick={() => handleLanguageChange('es')}
            className={`w-full text-left px-4 py-3 text-sm font-medium transition border-b border-gray-100 ${
              language === 'es'
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            🇪🇸 Español
          </button>
          <button
            onClick={() => handleLanguageChange('en')}
            className={`w-full text-left px-4 py-3 text-sm font-medium transition ${
              language === 'en'
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            🇺🇸 English
          </button>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
