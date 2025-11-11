import React, { useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import { setDarkMode } from '../../features/preferences/preferencesSlice';

const DarkModeToggle: React.FC = () => {
  const dispatch = useDispatch();
  const darkMode = useSelector((state: RootState) => state.preferences.preferences.darkMode);

  useEffect(() => {
    const htmlElement = document.documentElement;
    if (darkMode) {
      htmlElement.classList.add('dark');
      document.body.style.colorScheme = 'dark';
    } else {
      htmlElement.classList.remove('dark');
      document.body.style.colorScheme = 'light';
    }
  }, [darkMode]);

  const handleToggleDarkMode = () => {
    const newDarkMode = !darkMode;
    dispatch(setDarkMode(newDarkMode));
    localStorage.setItem('darkMode', String(newDarkMode));
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
