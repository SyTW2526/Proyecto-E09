/**
 * Servicio de autenticación
 * Maneja las llamadas a los endpoints de registro e inicio de sesión
 */

const API_URL = "http://localhost:3000";

interface RegisterData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface LoginData {
  username: string;
  password: string;
}

interface User {
  id: string;
  username: string;
  email: string;
}

interface AuthResponse {
  message: string;
  user: User;
}

export const authService = {
  /**
   * Registra un nuevo usuario
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/users/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error al registrarse");
    }

    return response.json();
  },

  /**
   * Inicia sesión con un usuario existente
   */
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error al iniciar sesión");
    }

    return response.json();
  },

  /**
   * Guarda el usuario en localStorage
   */
  saveUser(user: User): void {
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("isAuthenticated", "true");
  },

  /**
   * Obtiene el usuario del localStorage
   */
  getUser(): User | null {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  /**
   * Verifica si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return localStorage.getItem("isAuthenticated") === "true";
  },

  /**
   * Cierra la sesión del usuario
   */
  logout(): void {
    localStorage.removeItem("user");
    localStorage.removeItem("isAuthenticated");
  },
};
