import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import React from "react";
import { useTranslation } from "react-i18next";
import "../styles/form.css";

const SignUpForm: React.FC = () => {
  const { t } = useTranslation();

  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(null); // Limpia el error cuando el usuario empieza a escribir
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await authService.register(formData);
      // Registro exitoso - redirige a login
      navigate("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-background">
      {/* Formulario*/}
      <div className="relative z-10 w-full max-w-lg bg-white rounded-3xl shadow-2xl p-12 border border-sky-100 flex flex-col items-center dark:bg-gray-800 dark:border-gray-700">
        <h2 className="text-4xl font-bold text-sky-700 mb-3 text-center dark:text-sky-400">
          {t("signUp.titulo")}
        </h2>
        <p className="text-gray-500 mb-10 text-center text-lg dark:text-gray-400">
          {t("signUp.subtitulo")}
        </p>

        <form className="w-full flex flex-col items-center gap-5" onSubmit={handleSubmit}>
          {/* Mostrar errores */}
          {error && (
            <div className="w-4/5 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          {/* Usuario */}
          <div className="w-4/5 flex flex-col">
            <label className="text-base font-semibold text-gray-900 mb-2 ml-1 dark:text-gray-100">
              Nombre de usuario
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="Pepe123"
              className="px-4 py-2.5 border border-sky-200 rounded-lg text-gray-800
                         focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-400 transition dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
            />
          </div>

          {/* Correo */}
          <div className="w-4/5 flex flex-col">
            <label className="text-base font-semibold text-gray-900 mb-2 ml-1 dark:text-gray-100">
              Correo electrónico
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="ejemplo@correo.com"
              className="px-4 py-2.5 border border-sky-200 rounded-lg text-gray-800
                         focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-400 transition dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
            />
          </div>

          {/* Contraseña */}
          <div className="w-4/5 flex flex-col">
            <label className="text-base font-semibold text-gray-900 mb-2 ml-1">
              Contraseña
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="**********"
              className="px-4 py-2.5 border border-sky-200 rounded-lg text-gray-800
                         focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-400 transition"
            />
          </div>

          {/* Repetir contraseña */}
          <div className="w-4/5 flex flex-col">
            <label className="text-base font-semibold text-gray-900 mb-2 ml-1">
              Repite la contraseña
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="**********"
              className="px-4 py-2.5 border border-sky-200 rounded-lg text-gray-800
                         focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-400 transition"
            />
          </div>

          {/* Botón*/}
          <button
            type="submit"
            disabled={loading}
            className="w-4/5 mt-6 bg-linear-to-r from-sky-600 to-blue-600 text-white
                      font-semibold py-3 rounded-lg shadow-md hover:from-sky-700 hover:to-blue-700
                      transition text-base cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Registrando..." : "Crear cuenta"}
          </button>
        </form>

        {/* Enlace inferior */}
        <p className="text-gray-500 text-sm mt-10 text-center">
          ¿Ya tienes una cuenta?{" "}
          <a href="/login" className="text-sky-600 font-semibold hover:underline">
            Inicia sesión
          </a>
        </p>
      </div>
    </div>
  );
};

export default SignUpForm;
