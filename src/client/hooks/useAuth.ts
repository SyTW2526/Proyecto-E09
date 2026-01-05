/**
 * @file useAuth.ts
 * @description Hook personalizado para manejo de autenticación y sesión de usuario
 *
 * Proporciona:
 * - Estado del usuario actual autenticado
 * - Funciones de logout y refresh de usuario
 * - Verificación de autenticación activa
 * - Sincronización con cambios en localStorage
 * - Listener para cambios de sesión en otras pestañas
 *
 * @author Proyecto E09
 * @version 1.0.0
 * @requires react
 * @requires ../services/authService
 * @module hooks/useAuth
 * @returns {Object} Objeto con user, isAuthenticated, logout, refreshUser
 * @example
 * const { user, isAuthenticated, logout } = useAuth();
 * if (!isAuthenticated) return <Navigate to="/login" />;
 */

import { useState, useEffect } from 'react';
import { authService } from '../services/authService';

interface User {
  id: string;
  username: string;
  email: string;
  profileImage?: string;
}

/**
 * Hook personalizado para manejar el estado de autenticación
 * @returns {object} Objeto con user, isAuthenticated, y funciones de auth
 *
 * @example
 * const { user, isAuthenticated, logout } = useAuth();
 * if (!isAuthenticated) return <Navigate to="/login" />;
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(() => authService.getUser());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() =>
    authService.isAuthenticated()
  );

  // Sincronizar con cambios en localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      setUser(authService.getUser());
      setIsAuthenticated(authService.isAuthenticated());
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const refreshUser = () => {
    const currentUser = authService.getUser();
    setUser(currentUser);
    setIsAuthenticated(authService.isAuthenticated());
  };

  return {
    user,
    isAuthenticated,
    logout,
    refreshUser,
  };
}
