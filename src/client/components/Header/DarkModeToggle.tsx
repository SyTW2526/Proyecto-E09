import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import { setDarkMode } from '../../features/preferences/preferencesSlice';

const DarkModeToggle: React.FC = () => {
  const dispatch = useDispatch();
  const darkMode = useSelector((state: RootState) => state.preferences.preferences.darkMode);

  const handleToggleDarkMode = () => {
    const newDarkMode = !darkMode;
    dispatch(setDarkMode(newDarkMode));
    
    // Aplicar cambio al HTML element
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  };

  return (
    <button
      aria-label="Modo oscuro"
      onClick={handleToggleDarkMode}
      className="p-2 hover:bg-white/20 rounded-full transition"
      title={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
    >
      {darkMode ? (
        <Sun className="w-6 h-6 sm:w-7 sm:h-7 text-yellow-300" />
      ) : (
        <Moon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
      )}
    </button>
  );
};

export default DarkModeToggle;
