import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AppRouter from './routes/AppRouter';
import { RootState } from './store/store';
import {
  setDarkMode,
  setLanguage,
} from './features/preferences/preferencesSlice';
import { addNotification } from './features/notifications/notificationsSlice';
import { initSocket, getSocket } from './socket';
import ToastContainer from './components/toast';
import ToastManager from './components/ToastManager';

const App: React.FC = () => {
  const dispatch = useDispatch();
  const darkMode = useSelector(
    (state: RootState) => state.preferences.preferences.darkMode
  );

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    const savedLanguage = localStorage.getItem('language') as
      | 'es'
      | 'en'
      | null;

    if (savedDarkMode !== null) {
      const isDark = savedDarkMode === 'true';
      dispatch(setDarkMode(isDark));
      document.documentElement.classList.toggle('dark', isDark);
      document.body.style.colorScheme = isDark ? 'dark' : 'light';
    }

    if (savedLanguage) {
      dispatch(setLanguage(savedLanguage));
    }
  }, [dispatch]);

  // Socket.io se inicializa bajo demanda en las páginas que lo necesiten (TradePage, FriendsPage)
  // No lo inicializamos aquí para evitar errores si el servidor no está disponible
  
  useEffect(() => {
    try {
      const s = getSocket();
      if (!s) return;
      
      const handler = (notification: any) => {
        dispatch(addNotification(notification));
        window.dispatchEvent(
          new CustomEvent('toast', {
            detail: {
              title: notification.title,
              message: notification.message,
            },
          })
        );
      };

      s.on('notification', handler);
      return () => {
        s.off('notification', handler);
      };
    } catch (error) {
      console.warn('Error al configurar listener de notificaciones:', error);
    }
  }, [dispatch]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    document.body.style.colorScheme = darkMode ? 'dark' : 'light';
  }, [darkMode]);

  return (
    <>
      <ToastManager />
      <AppRouter />
      <ToastContainer />
    </>
  );
};

export default App;
