import React from "react";
import "../styles/form.css";

const SignInForm: React.FC = () => {
  return (
    <div className="signup-background">
      <div className="relative z-10 w-full max-w-lg bg-white rounded-3xl shadow-2xl p-12 border border-sky-100 flex flex-col items-center">
        <h2 className="text-4xl font-bold text-sky-700 mb-3 text-center">Iniciar sesión</h2>
        <p className="text-gray-500 mb-10 text-center text-lg">Accede a tu cuenta para gestionar tu colección.</p>

        <form className="w-full flex flex-col items-center gap-5">
          {/* Username */}
          <div className="w-4/5 flex flex-col">
            <label className="text-base font-semibold text-gray-900 mb-2 ml-1">Nombre de usuario</label>
            <input
              type="text"
              placeholder="Pepe123"
              className="px-4 py-2.5 border border-sky-200 rounded-lg text-gray-800 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-400 transition"
            />
          </div>

          {/* Password */}
          <div className="w-4/5 flex flex-col">
            <label className="text-base font-semibold text-gray-900 mb-2 ml-1">Contraseña</label>
            <input
              type="password"
              placeholder="**********"
              className="px-4 py-2.5 border border-sky-200 rounded-lg text-gray-800 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-400 transition"
            />
          </div>

          {/* Botón */}
          <button
            type="button"
            onClick={() => window.location.href = '/home'}
            className="w-4/5 mt-6 bg-linear-to-r from-sky-600 to-blue-600 text-white font-semibold py-3 rounded-lg shadow-md hover:from-sky-700 hover:to-blue-700 transition text-base cursor-pointer"
          >
            Iniciar sesión
          </button>
        </form>

        {/* Enlace Inferior */}
        <p className="text-gray-500 text-sm mt-10 text-center">
          ¿Aún no tienes cuenta?{' '}
          <a href="/signup" className="text-sky-600 font-semibold hover:underline">Regístrate</a>
        </p>
      </div>
    </div>
  );
};

export default SignInForm;
