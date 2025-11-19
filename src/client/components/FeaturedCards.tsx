import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from "react-i18next";
import "../styles/feature.css"

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
  const { t } = useTranslation();

  const [currentIndex] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const trackRef = React.useRef<HTMLDivElement | null>(null);

  const featuredCards: Card[] = [
    {
      id: "1",
      name: "Mega Gardevoir",
      image: "https://assets.tcgdex.net/en/me/me01/178/high.png",
      hp: "360",
      type: "Psychic",
      rarity: "Mega Hyper Rare",
      price: { low: 429.99, mid: 555, high: 1299 },
    },
    {
      id: "2",
      name: "PEPE",
      image: "/carta2.png",
      hp: "110",
      type: "Psychic",
      rarity: "Common",
      price: { low: 5, mid: 10, high: 15 },
    },
    {
      id: "3",
      name: "PEPE",
      image: "/carta3.png",
      hp: "110",
      type: "Psychic",
      rarity: "Uncommon",
      price: { low: 8, mid: 12, high: 18 },
    },
    {
      id: "4",
      name: "PEPE",
      image: "/carta4.png",
      hp: "110",
      type: "Psychic",
      rarity: "Rare",
      price: { low: 20, mid: 25, high: 35 },
    },
    {
      id: "5",
      name: "PEPE",
      image: "/carta5.png",
      hp: "110",
      type: "Psychic",
      rarity: "Holo Rare",
      price: { low: 30, mid: 40, high: 60 },
    },
  ];

  const tripleList = React.useMemo(
    () => [...featuredCards, ...featuredCards, ...featuredCards],
    []
  );

  const PokemonCard = ({ card }: { card: Card }) => {
    const [isFlipped, setIsFlipped] = React.useState(false);
    const [isFavorite, setIsFavorite] = React.useState(false);

    return (
      <div
        className="relative featured-card"
        onMouseEnter={() => setIsFlipped(true)}
        onMouseLeave={() => setIsFlipped(false)}
      >
        {!isFlipped ? (
          <div className="pokemon-card overflow-hidden cursor-pointer">
            <img src={card.image} alt={card.name} />

            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsFavorite(!isFavorite);
              }}
              className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-lg hover:scale-110 transition-transform z-10"
            >
              <span className="text-2xl">{isFavorite ? "❤️" : "🤍"}</span>
            </button>
          </div>
        ) : (
          <div className="pokemon-card-back bg-white dark:bg-gray-800 p-4 min-h-[320px] rounded-xl">

            <h3 className="text-xl font-bold mb-3 text-center text-gray-800 dark:text-gray-100">
              {card.name}
            </h3>

            {/* DESCRIPCIÓN */}
            <div className="bg-blue-50 dark:bg-gray-700 rounded-lg p-3 mb-4">
              <p className="text-sm mb-2 text-gray-700 dark:text-gray-300">
                {t("featured.desc1")}
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {t("featured.desc2")}
              </p>
            </div>

            {/* ESTADÍSTICAS */}
            <div className="bg-blue-50 dark:bg-gray-700 rounded-lg p-3 space-y-2 mb-3">
              <div className="flex justify-between">
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  {t("featured.weakness")}:
                </span>
                <span className="text-blue-600 dark:text-blue-400">💧 x2</span>
              </div>

              <div className="flex justify-between">
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  {t("featured.retreat")}:
                </span>
                <span className="text-gray-600 dark:text-gray-400">⚪ x1</span>
              </div>

              {/* PRECIO */}
              {card.price && (
                <div className="flex justify-between items-center pt-2 border-t border-blue-200 dark:border-gray-600">
                  <span className="font-bold text-lg text-gray-800 dark:text-gray-100">
                    {t("featured.price")}:
                  </span>
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {card.price.mid}€
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    );
  };

  const scrollByCard = (direction: "next" | "prev") => {
    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track) return;

    const firstCard = track.querySelector<HTMLElement>(".featured-card");
    if (!firstCard) return;

    const gap = 24;
    const cardWidth = firstCard.offsetWidth + gap;

    container.scrollBy({
      left: direction === "next" ? cardWidth : -cardWidth,
      behavior: "smooth",
    });
  };

  React.useEffect(() => {
    const id = setInterval(() => scrollByCard("next"), 5000);
    return () => clearInterval(id);
  }, []);

  React.useEffect(() => {
    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track) return;

    const timer = setTimeout(() => {
      const singleWidth = track.scrollWidth / 3;
      container.scrollLeft = singleWidth;
    }, 150);

    return () => clearTimeout(timer);
  }, [tripleList]);

  return (
    <section className="featured-wrapper">
      {/* TÍTULO */}
      <div className="text-center mb-8">
        <h2 className="featured-title">{t("featured.title")}</h2>
      </div>

      {/* CONTENEDOR FULL WIDTH */}
      <div className="featured-inner">
        <div ref={containerRef} className="overflow-x-auto no-scrollbar">
          <div ref={trackRef} className="featured-slider">
            {tripleList.map((card, i) => (
              <PokemonCard key={`${card.id}-${i}`} card={card} />
            ))}
          </div>
        </div>

        {/* BOTONES */}
        <button
          onClick={() => scrollByCard("prev")}
          className="slider-button slider-button-left"
        >
          <ChevronLeft className="w-6 h-6 text-gray-700" />
        </button>

        <button
          onClick={() => scrollByCard("next")}
          className="slider-button slider-button-right"
        >
          <ChevronRight className="w-6 h-6 text-gray-700" />
        </button>
      </div>
    </section>
  );
};

export default FeaturedCards;
