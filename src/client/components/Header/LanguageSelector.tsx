import React from 'react';
import { Globe } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import { setLanguage } from '../../features/preferences/preferencesSlice';

const LanguageSelector: React.FC = () => {
  const dispatch = useDispatch();
  const language = useSelector((state: RootState) => state.preferences.preferences.language);

  const handleLanguageChange = (newLanguage: 'es' | 'en') => {
    dispatch(setLanguage(newLanguage));
    // Aquí puedes agregar lógica para guardar en el backend
    // savePreferencesToBackend({ language: newLanguage });
  };

  return (
    <div className="relative group">
      <button
        aria-label="Selector de idioma"
        className="p-2 hover:bg-white/20 rounded-full transition"
        title={language === 'es' ? 'Español' : 'English'}
      >
        <Globe className="w-6 h-6 sm:w-7 sm:h-7 text-black dark:text-white" />
      </button>

      <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-40">
        <button
          onClick={() => handleLanguageChange('es')}
          className={`w-full text-left px-4 py-2 text-sm transition ${
            language === 'es'
              ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 font-semibold'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          🇪🇸 Español
        </button>
        <button
          onClick={() => handleLanguageChange('en')}
          className={`w-full text-left px-4 py-2 text-sm transition ${
            language === 'en'
              ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 font-semibold'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          🇺🇸 English
        </button>
      </div>
    </div>
  );
};

export default LanguageSelector;
