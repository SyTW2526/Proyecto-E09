import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Card {
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
}

const FeaturedCards: React.FC = () => {
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const featuredCards: Card[] = [
    {
      id: '1',
      name: 'PEPE',
      image: '/carta1.png',
      hp: '110',
      type: 'Fire',
      rarity: 'Rare',
      price: { low: 15, mid: 20, high: 30 }
    },
    {
      id: '2',
      name: 'PEPE',
      image: '/carta2.png',
      hp: '110',
      type: 'Psychic',
      rarity: 'Common',
      price: { low: 5, mid: 10, high: 15 }
    },
    {
      id: '3',
      name: 'PEPE',
      image: '/carta3.png',
      hp: '110',
      type: 'Psychic',
      rarity: 'Uncommon',
      price: { low: 8, mid: 12, high: 18 }
    },
    {
      id: '4',
      name: 'PEPE',
      image: '/carta4.png',
      hp: '110',
      type: 'Psychic',
      rarity: 'Rare',
      price: { low: 20, mid: 25, high: 35 }
    },
    {
      id: '5',
      name: 'PEPE',
      image: '/carta5.png',
      hp: '110',
      type: 'Psychic',
      rarity: 'Holo Rare',
      price: { low: 30, mid: 40, high: 60 }
    },
  ];

  const PokemonCard = ({ card }: { card: Card }) => {
    const [isFlipped, setIsFlipped] = React.useState(false);
    const [isFavorite, setIsFavorite] = React.useState(false);

    return (
      <div
        className="relative"
        onMouseEnter={() => setIsFlipped(true)}
        onMouseLeave={() => setIsFlipped(false)}
      >
        <div className="relative w-full">
          {!isFlipped ? (
            <div className="relative rounded-2xl shadow-xl overflow-hidden cursor-pointer border-4 border-blue-400">
              <img 
                src={card.image} 
                alt={card.name}
                className="w-full h-auto object-cover"
              />
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFavorite(!isFavorite);
                }}
                className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-lg hover:scale-110 transition-transform z-10"
              >
                <span className={`text-2xl ${isFavorite ? '❤️' : '🤍'}`}>
                  {isFavorite ? '❤️' : '🤍'}
                </span>
              </button>
            </div>
          ) : (
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

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % (featuredCards.length - 4));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + (featuredCards.length - 4)) % (featuredCards.length - 4));
  };

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="border-t-4 border-b-4 border-dashed border-gray-400 py-8">
        {/* Título */}
        <div className="text-center mb-8">
          <h2 className="inline-block px-12 py-4 bg-gradient-to-r from-blue-400 to-blue-500 text-white text-3xl font-bold rounded-lg shadow-lg border-2 border-blue-600">
            CARTAS DESTACADAS
          </h2>
        </div>

        {/* Slider de cartas */}
        <div className="relative">
          <div className="overflow-hidden">
            <div 
              className="flex gap-6 transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * (100 / 5)}%)` }}
            >
              {featuredCards.map((card) => (
                <div key={card.id} className="flex-shrink-0 w-1/5 px-2">
                  <PokemonCard card={card} />
                </div>
              ))}
            </div>
          </div>

          {/* Botones de navegación */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-white rounded-full p-3 shadow-lg hover:bg-gray-100 transition-colors z-10"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-white rounded-full p-3 shadow-lg hover:bg-gray-100 transition-colors z-10"
          >
            <ChevronRight className="w-6 h-6 text-gray-700" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCards;