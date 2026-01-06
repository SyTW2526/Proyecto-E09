/**
 * @file authService.ts
 * @description Servicio centralizado de autenticación y gestión de sesión
 *
 * Maneja:
 * - Registro de nuevos usuarios con validación
 * - Inicio de sesión (login) con JWT
 * - Cierre de sesión (logout) y limpieza
 * - Gestión de tokens JWT en localStorage
 * - Recuperación de datos del usuario autenticado
 * - Validación de sesión activa
 * - Sincronización de estado con servicios
 *
 * @author Proyecto E09
 * @version 1.0.0
 * @requires config/constants
 * @module services/authService
 * @see {@link http://localhost:3000/api/users/register|Register Endpoint}
 * @see {@link http://localhost:3000/api/users/login|Login Endpoint}
 */

import { API_BASE_URL } from '../config/constants';

/**
 * Interface para datos de registro
 * @interface RegisterData
 * @property {string} username - Nombre de usuario (único)
 * @property {string} email - Email del usuario (único)
 * @property {string} password - Contraseña
 * @property {string} confirmPassword - Confirmación de contraseña
 */
interface RegisterData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

/**
 * Interface para datos de login
 * @interface LoginData
 * @property {string} username - Nombre de usuario o email
 * @property {string} password - Contraseña
 */
interface LoginData {
  username: string;
  password: string;
}

/**
 * Interface para datos de usuario autenticado
 * @interface User
 * @property {string} id - ID único del usuario (ObjectId)
 * @property {string} username - Nombre de usuario
 * @property {string} email - Email del usuario
 * @property {string} [profileImage] - URL de imagen de perfil (opcional)
 */
interface User {
  id: string;
  username: string;
  email: string;
  profileImage?: string;
}

/**
 * Interface para respuesta de autenticación
 * @interface AuthResponse
 * @property {string} message - Mensaje de respuesta
 * @property {User} user - Datos del usuario autenticado
 * @property {string} [token] - JWT devuelto por el servidor en login
 */
interface AuthResponse {
  message: string;
  user: User;
  token?: string; // JWT devuelto por el servidor en login
}

/**
 * Servicio de autenticación exportado como objeto singleton
 * @namespace authService
 */
export const authService = {
  /**
   * @async
   * @function register
   * @description Registra un nuevo usuario en el sistema
   * @param {RegisterData} data - Datos de registro (username, email, password)
   * @returns {Promise<AuthResponse>} Usuario registrado y token JWT
   * @throws {Error} Si el registro falla (usuario existe, email inválido, etc.)
   * @example
   * const response = await authService.register({
   *   username: 'john_doe',
   *   email: 'john@example.com',
   *   password: 'secure123',
   *   confirmPassword: 'secure123'
   * });
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al registrarse');
    }

    return response.json();
  },

  /**
   * @async
   * @function login
   * @description Inicia sesión con credenciales de usuario existente
   * @param {LoginData} data - Credenciales (username/email y password)
   * @returns {Promise<AuthResponse>} Usuario autenticado y token JWT
   * @throws {Error} Si las credenciales son inválidas
   * @example
   * const response = await authService.login({
   *   username: 'john_doe',
   *   password: 'secure123'
   * });
   */
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al iniciar sesión');
    }

    return response.json();
  },

  /**
   * @async
   * @function updateProfileImage
   * @description Actualiza la imagen de perfil del usuario autenticado
   * @param {string} username - Nombre de usuario
   * @param {string} profileImage - URL de la nueva imagen de perfil
   * @returns {Promise<User>} Datos del usuario actualizados
   * @throws {Error} Si no está autorizado o la solicitud falla
   */
async updateProfileImage(
  username: string,
  profileImage: string
): Promise<User> {
  const response = await fetch(
    `${API_BASE_URL}/users/${username}/profile-image`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify({ profileImage }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error || 'Error al actualizar imagen de perfil'
    );
  }

  const json = await response.json();
  const user = json.data?.user;

  if (!user) {
    throw new Error('Respuesta inválida del servidor');
  }

  this.saveUser(user);
  return user;
}
  ,

  /**
   * Actualiza el perfil del usuario
   */
async updateProfile(
  currentUsername: string,
  changes: { username?: string; email?: string }
): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/users/${currentUsername}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...this.getAuthHeaders(),
    },
    body: JSON.stringify(changes),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'UPDATE_ERROR');
  }

  const json = await response.json();

  const user = json.data?.user;
  const token = json.data?.token;

  if (!user) {
    throw new Error('Respuesta inválida del servidor');
  }

  if (token) {
    this.saveToken(token);
  }

  this.saveUser(user);
  return user;
},

  /**
   * Elimina la imagen de perfil del usuario
   */
async deleteProfileImage(username: string): Promise<User> {
  const response = await fetch(
    `${API_BASE_URL}/users/${username}/profile-image`,
    {
      method: 'DELETE',
      headers: {
        ...this.getAuthHeaders(),
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error || 'Error al eliminar la imagen de perfil'
    );
  }

  const json = await response.json();

 
  const user = json.data?.user;

  if (!user) {
    throw new Error('Respuesta inválida del servidor');
  }

  this.saveUser(user);
  return user;
},

  /**
   * Elimina la cuenta del usuario
   */
  async deleteAccount(username: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/users/${username}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Error eliminando cuenta');
    }

    // Eliminar usuario del localStorage
    this.logout();
  },

  /**
   * @function saveUser
   * @description Guarda los datos del usuario en localStorage
   * @param {User} user - Datos del usuario a guardar
   * @returns {void}
   */
  saveUser(user: User): void {
    const savedUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      profileImage: user.profileImage ?? '',
    };

    localStorage.setItem('user', JSON.stringify(savedUser));
    localStorage.setItem('isAuthenticated', 'true');
  },

  /**
   * @function getUser
   * @description Obtiene los datos del usuario del localStorage
   * @returns {User | null} Datos del usuario o null si no está autenticado
   */
  getUser(): User | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  /**
   * @function saveToken
   * @description Guarda el token JWT en localStorage
   * @param {string} token - Token JWT a guardar
   * @returns {void}
   */
  saveToken(token: string): void {
    localStorage.setItem('token', token);
  },

  /**
   * @function getToken
   * @description Obtiene el token JWT del localStorage
   * @returns {string | null} Token JWT o null si no existe
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  },

  /**
   * @function getAuthHeaders
   * @description Retorna headers con el token JWT para peticiones autenticadas
   * @returns {Object} Headers con Authorization o objeto vacío si no hay token
   */
  getAuthHeaders(): { Authorization: string } | {} {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  },

  /**
   * @function isAuthenticated
   * @description Verifica si el usuario está autenticado
   * @returns {boolean} true si usuario y token existen, false en caso contrario
   */
  isAuthenticated(): boolean {
    // Verificar que existe tanto el usuario como el token
    const hasUser = localStorage.getItem('isAuthenticated') === 'true';
    const hasToken = this.getToken() !== null;
    return hasUser && hasToken;
  },

  /**
   * Cierra la sesión del usuario
   */
  logout(): void {
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('token'); // Limpiar JWT también
  },
};
