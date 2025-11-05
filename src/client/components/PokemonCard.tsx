import React, { useState } from 'react';
import { Heart } from 'lucide-react';

interface CardProps {
  card: {
    id: string;
    name: string;
    image: string;
    hp: string;
    type: string;
    rarity: string;
    price?: {
      low: number;
      mid: number;
      high: number;
    };
  };
}

const PokemonCard: React.FC<CardProps> = ({ card }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const getTypeColor = (type: string): string => {
    const colors: { [key: string]: string } = {
      Fire: 'from-orange-500 to-red-600',
      Water: 'from-blue-400 to-blue-600',
      Grass: 'from-green-400 to-green-600',
      Electric: 'from-yellow-400 to-yellow-600',
      Psychic: 'from-purple-400 to-purple-600',
      Fighting: 'from-red-600 to-orange-700',
      Darkness: 'from-gray-700 to-gray-900',
      Metal: 'from-gray-400 to-gray-600',
      Fairy: 'from-pink-400 to-pink-600',
      Dragon: 'from-indigo-600 to-purple-700',
      Colorless: 'from-gray-300 to-gray-500',
    };
    return colors[type] || 'from-gray-400 to-gray-600';
  };

  return (
    <div
      className="relative perspective-1000"
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
    >
      <div
        className={`relative w-full aspect-[2.5/3.5] transition-transform duration-500 transform-style-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        {/* Frente de la carta */}
        <div
          className={`absolute inset-0 backface-hidden rounded-2xl shadow-xl border-4 border-yellow-400 overflow-hidden cursor-pointer ${
            isFlipped ? 'pointer-events-none' : ''
          }`}
        >
          <div className={`h-full bg-gradient-to-br ${getTypeColor(card.type)} p-4 flex flex-col`}>
            {/* Header de la carta */}
            <div className="bg-white/90 rounded-lg p-2 mb-2">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-xl">{card.name}</h3>
                  <p className="text-xs text-gray-600">{card.type}</p>
                </div>
                <div className="text-right">
                  <span className="text-red-600 font-bold">HP {card.hp}</span>
                </div>
              </div>
            </div>

            {/* Imagen del Pokémon */}
            <div className="flex-1 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-lg mb-2 flex items-center justify-center">
              <div className="w-32 h-32 bg-orange-400 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-6xl">🐸</span>
              </div>
            </div>

            {/* Ataques */}
            <div className="bg-white/90 rounded-lg p-2 space-y-1">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1">
                  <span className="text-xs">🔥🔥</span>
                  <span className="text-sm font-semibold">Ember</span>
                </div>
                <span className="text-sm font-bold">30</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1">
                  <span className="text-xs">🔥🔥🔥</span>
                  <span className="text-sm font-semibold">Flare Blitz</span>
                </div>
                <span className="text-sm font-bold">100</span>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-2 text-center">
              <span className="text-xs text-white font-semibold bg-black/30 px-2 py-1 rounded">
                {card.rarity}
              </span>
            </div>
          </div>

          {/* Botón de favorito */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsFavorite(!isFavorite);
            }}
            className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-lg hover:scale-110 transition-transform z-10"
          >
            <Heart
              className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
            />
          </button>
        </div>

        {/* Reverso de la carta (información de precios) */}
        <div
          className={`absolute inset-0 backface-hidden rotate-y-180 rounded-2xl shadow-xl border-4 border-yellow-400 bg-gradient-to-br from-indigo-600 to-purple-700 p-6 ${
            !isFlipped ? 'pointer-events-none' : ''
          }`}
        >
          <div className="h-full flex flex-col justify-between text-white">
            <div>
              <h3 className="text-2xl font-bold mb-4 text-center">{card.name}</h3>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 mb-4">
                <p className="text-sm mb-2 opacity-90">Su cuerpo arde con una llama eterna.</p>
                <p className="text-sm opacity-90">Cuando se enfurece, vibra como un sol en miniatura.</p>
              </div>
            </div>

            {card.price && (
              <div className="space-y-3">
                <h4 className="text-lg font-bold text-center mb-3">Información de Mercado</h4>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="font-semibold">Debilidad:</span>
                    <span>💧 x2</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Retirada:</span>
                    <span>⚪ x1</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-white/30">
                    <span className="font-bold text-lg">Precio:</span>
                    <span className="text-2xl font-bold text-yellow-300">{card.price.mid}€</span>
                  </div>
                  <div className="text-xs text-center opacity-80">
                    Rango: {card.price.low}€ - {card.price.high}€
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PokemonCard;