import React from 'react';

const Hero: React.FC = () => {
  return (
    <section className="container mx-auto px-4 py-12">
      <div className="flex items-center justify-between">
        {/* Texto izquierdo */}
        <div className="flex-1">
          <h1 className="text-5xl font-serif tracking-wide">CARDS AMI</h1>
        </div>

        {/* Logo central */}
        <div className="flex-1 flex justify-center">
          <div className="w-32 h-32 bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl flex items-center justify-center border-4 border-amber-600 shadow-2xl transform hover:scale-105 transition-transform">
            <span className="text-white font-bold text-4xl">AMI</span>
          </div>
        </div>

        {/* Texto derecho */}
        <div className="flex-1 flex justify-end">
          <h2 className="text-5xl font-serif tracking-wide">NUNCA ES TARDE PARA JUGAR</h2>
        </div>
      </div>
    </section>
  );
};

export default Hero;