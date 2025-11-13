import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AppRouter from "./routes/AppRouter";
import { RootState } from './store/store';
import { setDarkMode, setLanguage } from './features/preferences/preferencesSlice';

const App: React.FC = () => {
  const dispatch = useDispatch();
  const darkMode = useSelector((state: RootState) => state.preferences.preferences.darkMode);

  // Cargar preferencias del localStorage al montar
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    const savedLanguage = localStorage.getItem('language') as 'es' | 'en' | null;

    if (savedDarkMode !== null) {
      const isDark = savedDarkMode === 'true';
      dispatch(setDarkMode(isDark));
      if (isDark) {
        document.documentElement.classList.add('dark');
        document.body.style.colorScheme = 'dark';
      } else {
        document.documentElement.classList.remove('dark');
        document.body.style.colorScheme = 'light';
      }
    }

    if (savedLanguage) {
      dispatch(setLanguage(savedLanguage));
    }
  }, [dispatch]);

  // Actualizar clase del HTML cuando cambia el darkMode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.body.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.colorScheme = 'light';
    }
  }, [darkMode]);

  return <AppRouter />;
};

export default App;