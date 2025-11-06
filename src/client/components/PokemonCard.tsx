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

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
    >
      <div className="relative w-full">
        {/* Frente de la carta - Imagen real */}
        {!isFlipped ? (
          <div className="relative rounded-2xl shadow-xl overflow-hidden cursor-pointer border-4 border-blue-400">
            <img 
              src={card.image} 
              alt={card.name}
              className="w-full h-auto object-cover"
            />
            
            {/* Botón de favorito */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsFavorite(!isFavorite);
              }}
              className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-lg hover:scale-110 transition-transform z-10"
            >
              <Heart
                className={`w-6 h-6 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
              />
            </button>
          </div>
        ) : (
          /* Reverso de la carta - Información */
          <div className="rounded-2xl shadow-xl border-4 border-blue-400 bg-white p-6 min-h-[400px]">
            <div className="h-full flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-4 text-center text-gray-800">{card.name}</h3>
                <div className="bg-blue-50 rounded-lg p-4 mb-4">
                  <p className="text-sm mb-2 text-gray-700">Su cuerpo arde con una llama eterna.</p>
                  <p className="text-sm text-gray-700">Cuando se enfurece, vibra como un sol en miniatura.</p>
                </div>
              </div>

              {card.price && (
                <div className="space-y-3">
                  <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-700">Debilidad:</span>
                      <span className="text-blue-600">💧 x2</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-700">Retirada:</span>
                      <span className="text-gray-600">⚪ x1</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-blue-200">
                      <span className="font-bold text-lg text-gray-800">Precio:</span>
                      <span className="text-2xl font-bold text-blue-600">{card.price.mid}€</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PokemonCard;