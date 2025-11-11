import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import AppRouter from "./routes/AppRouter";
import { RootState } from './store/store';

const App: React.FC = () => {
  const darkMode = useSelector((state: RootState) => state.preferences.preferences.darkMode);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return <AppRouter />;
};

export default App;