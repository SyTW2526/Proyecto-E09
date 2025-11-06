import React from 'react';

const Hero: React.FC = () => {
  return (
    <section className="container mx-auto px-6 py-12">
      <div className="flex items-center justify-between gap-12">
        {/* Texto izquierdo */}
        <div className="flex-1 margin-left=10">
          <h1 className="hero-text">CARDS AMI</h1>
        </div>
    
        {/* Logo central */}
        <div className="flex-1 flex justify-center">
          <img 
            src="/logo.png" 
            alt="AMI Logo" 
            className="hero-logo"
          />
        </div>

        {/* Texto derecho */}
        <div className="flex-1 flex justify-end">
          <h2 className="hero-text text-right">NUNCA ES TARDE PARA JUGAR</h2>
        </div>
      </div>
    </section>
  );
};

export default Hero;