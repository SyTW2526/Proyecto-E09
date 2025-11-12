import React from "react";

const Start: React.FC = () => {
  return (
    <div className="min-h-screen bg-sky-50 flex flex-col items-center text-gray-900 px-6 py-16">
      <div className="flex-1 flex flex-col items-center justify-center gap-16 max-w-6xl w-full">
        {/* Logo y Slogan */}
        <div className="flex flex-col items-center gap-8">
          <img
            src="/logo.png"
            alt="Cards AMI Logo"
            className="w-56 drop-shadow-lg"
          />
          <h1 className="text-5xl font-extrabold text-sky-700 text-center">
            ¡Colecciona, intercambia y descubre tu mundo Pokémon!
          </h1>
          <p className="text-lg text-gray-600 text-center max-w-2xl">
            En <span className="font-semibold text-sky-600">Cards AMI</span> puedes crear tu colección personal,
            descubrir nuevas cartas e intercambiarlas con otros aficionados al
            mundo Pokémon.
          </p>
        </div>

        {/* Secciones de características */}
        <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-8 w-full px-6">
          {/* Colecciona */}
          <div className="bg-white rounded-2xl shadow-md p-8 border border-sky-100 text-center hover:shadow-lg transition">
            <h3 className="text-xl font-bold text-sky-700 mb-3">Colecciona</h3>
            <p className="text-gray-600 text-base">
              Guarda tus cartas favoritas, organiza tu colección y crea una lista de deseos. ¡Tu biblioteca Pokémon siempre al día!
            </p>
          </div>

          {/* Intercambia */}
          <div className="bg-white rounded-2xl shadow-md p-8 border border-sky-100 text-center hover:shadow-lg transition">
            <h3 className="text-xl font-bold text-sky-700 mb-3">Intercambia</h3>
            <p className="text-gray-600 text-base">
              Conecta con otros coleccionistas o con tus amigos y realiza intercambios seguros
              para conseguir las cartas que te faltan.
            </p>
          </div>

          {/* Explora */}
          <div className="bg-white rounded-2xl shadow-md p-8 border border-sky-100 text-center hover:shadow-lg transition">
            <h3 className="text-xl font-bold text-sky-700 mb-3">Explora</h3>
            <p className="text-gray-600 text-base">
              Encuentra las cartas que buscas, descubre nuevas expansiones y mantente al tanto de las últimas novedades en el mundo Pokémon.
            </p>
          </div>
        </div>

        {/* Botón principal */}
        <a
          href="/trade"
          className="inline-block bg-gradient-to-r from-sky-600 to-blue-600 text-white font-semibold py-4 px-12 rounded-lg shadow-md hover:from-sky-700 hover:to-blue-700 transition text-lg"
        >
           Empieza ya  
        </a>
      </div>
    </div>
  );
};

export default Start;