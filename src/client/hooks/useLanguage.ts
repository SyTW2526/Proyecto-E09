import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

export const useLanguage = () => {
  const language = useSelector((state: RootState) => state.preferences.preferences.language);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return language;
};
