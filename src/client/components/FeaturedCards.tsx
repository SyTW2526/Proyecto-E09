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
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const trackRef = React.useRef<HTMLDivElement | null>(null);

  const featuredCards: Card[] = [
    {
      id: '1',
      name: 'Mega Gardevoir',
      image: 'https://assets.tcgdex.net/en/me/me01/178/high.png',
      hp: '360',
      type: 'Psychic',
      rarity: 'Mega Hyper Rare',
      price: { low: 429.99, mid: 555, high: 1299 }
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

  // Triple list to enable infinite scroll illusion (copy - original - copy)
  const tripleList = React.useMemo(() => [...featuredCards, ...featuredCards, ...featuredCards], [featuredCards]);

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
            <div className="pokemon-card overflow-hidden cursor-pointer">
              <img
                src={card.image}
                alt={card.name}
                className="pokemon-card-image"
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
            <div className="pokemon-card-back bg-white dark:bg-gray-800 p-4 min-h-[320px]">
              <div className="h-full flex flex-col justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-4 text-center text-gray-800 dark:text-gray-100">{card.name}</h3>
                  <div className="bg-blue-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                    <p className="text-sm mb-2 text-gray-700 dark:text-gray-300">Su cuerpo arde con una llama eterna.</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">Cuando se enfurece, vibra como un sol en miniatura.</p>
                  </div>
                </div>

                {card.price && (
                  <div className="space-y-3">
                    <div className="bg-blue-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-700 dark:text-gray-300">Debilidad:</span>
                        <span className="text-blue-600 dark:text-blue-400">💧 x2</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-700 dark:text-gray-300">Retirada:</span>
                        <span className="text-gray-600 dark:text-gray-400">⚪ x1</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-blue-200 dark:border-gray-600">
                        <span className="font-bold text-lg text-gray-800 dark:text-gray-100">Precio:</span>
                        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{card.price.mid}€</span>
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

  const scrollByCard = (direction: 'next' | 'prev') => {
    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track) return;

    const firstCard = track.querySelector<HTMLElement>('.card-item');
    if (!firstCard) return;

    const gap = parseInt(getComputedStyle(track).gap || '16', 10) || 16;
    const cardWidth = firstCard.offsetWidth + gap;

    const offset = direction === 'next' ? cardWidth : -cardWidth;
    container.scrollBy({ left: offset, behavior: 'smooth' });
  };

  // Optional autoplay (every 5s)
  React.useEffect(() => {
    const id = setInterval(() => scrollByCard('next'), 5000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Setup initial scroll position to the middle copy and handle wrapping
  React.useEffect(() => {
    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track) return;

    // Wait a tick so images/layout can settle
    const init = () => {
      const singleWidth = track.scrollWidth / 3;
      if (singleWidth && Number.isFinite(singleWidth)) {
        container.scrollLeft = singleWidth;
      }
    };

    const t = window.setTimeout(init, 150);

    const onScroll = () => {
      const singleWidth = track.scrollWidth / 3;
      if (!singleWidth) return;

      const threshold = Math.max(8, singleWidth * 0.02); // small buffer

      // If we've scrolled into the last copy (near the end), jump back one copy (no animation)
      if (container.scrollLeft >= singleWidth * 2 - threshold) {
        // compute equivalent position in the middle copy
        container.scrollLeft = container.scrollLeft - singleWidth;
      }

      // If we've scrolled into the first copy (near the start), jump forward one copy
      if (container.scrollLeft <= threshold) {
        container.scrollLeft = container.scrollLeft + singleWidth;
      }
    };

    container.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.clearTimeout(t);
      container.removeEventListener('scroll', onScroll);
    };
  }, [tripleList]);

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="featured-section py-12">
        {/* Título */}
        <div className="text-center mb-8">
          <h2 className="featured-title">
            CARTAS DESTACADAS
          </h2>
        </div>

        {/* Slider de cartas (responsive, scroll-based) */}
        <div className="relative">
          <div ref={containerRef} className="overflow-x-auto no-scrollbar">
            <div ref={trackRef} className="flex gap-6 items-stretch py-4 featured-slider">
              {tripleList.map((card, i) => (
                <div key={`${card.id}-${i}`} className="card-item px-2">
                  <PokemonCard card={card} />
                </div>
              ))}
            </div>
          </div>

          {/* Botones de navegación */}
          <button onClick={() => scrollByCard('prev')} aria-label="Anterior" className="slider-button slider-button-left z-20">
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>
          <button onClick={() => scrollByCard('next')} aria-label="Siguiente" className="slider-button slider-button-right z-20">
            <ChevronRight className="w-6 h-6 text-gray-700" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCards;