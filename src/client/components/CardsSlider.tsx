import React from 'react';
import '../styles/feature.css';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SimpleCard {
  id: string;
  name?: string;
  image?: string;
  rarity?: string;
  price?: { mid?: number } | null;
}

const CardsSlider: React.FC<{ title?: string; cards: SimpleCard[] }> = ({ title, cards }) => {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const trackRef = React.useRef<HTMLDivElement | null>(null);

  const normalizeImageUrl = (url?: string) => {
    if (!url) return '';
    if (/\/(?:small|large|high|low)\.png$/i.test(url)) {
      return url.replace(/\/(?:small|large|high|low)\.png$/i, '/high.png');
    }
    if (/\.(png|jpg|jpeg|gif|webp)$/i.test(url)) return url;
    return url.endsWith('/') ? `${url}high.png` : `${url}/high.png`;
  };

  const triple = React.useMemo(() => {
    // For a single card, don't duplicate — show it once.
    if (!cards || cards.length <= 1) return cards;
    // For multiple cards, duplicate to create the infinite-loop effect.
    return [...cards, ...cards, ...cards];
  }, [cards]);

  const CardView = ({ card }: { card: SimpleCard }) => (
    <div className="relative featured-card">
      <div className="relative w-full">
        <div className="pokemon-card overflow-hidden cursor-pointer">
          <img src={normalizeImageUrl(card.image)} alt={card.name} className="pokemon-card-image" />
          <div className="absolute left-0 right-0 bottom-0 p-3 bg-linear-to-t from-black/70 to-transparent text-white">
            <div className="flex justify-between items-center">
              <div className="text-sm font-semibold truncate">{card.name}</div>
              <div className="text-xs opacity-90">{card.rarity || '—'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const scrollByCard = (direction: 'next' | 'prev') => {
    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track) return;
    const firstCard = track.querySelector<HTMLElement>('.featured-card');
    if (!firstCard) return;
    const gap = 24;
    const cardWidth = firstCard.offsetWidth + gap;
    container.scrollBy({ left: direction === 'next' ? cardWidth : -cardWidth, behavior: 'smooth' });
  };

  React.useEffect(() => {
    if (!cards || cards.length <= 1) return;
    const id = setInterval(() => scrollByCard('next'), 5000);
    return () => clearInterval(id);
  }, [cards]);

  React.useEffect(() => {
    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track) return;

    // Only center the scroll if we duplicated the list (i.e., cards.length > 1)
    if (cards && cards.length > 1) {
      const t = setTimeout(() => {
        const singleWidth = track.scrollWidth / 3;
        container.scrollLeft = singleWidth;
      }, 150);
      return () => clearTimeout(t);
    }
    return;
  }, [triple, cards]);

  return (
    <section className="featured-wrapper">
      {title && <div className="text-center mb-4"><h2 className="featured-title">{title}</h2></div>}
      <div className="featured-inner">
        <div ref={containerRef} className="overflow-x-auto no-scrollbar">
          <div ref={trackRef} className="featured-slider">
            {triple.map((c, i) => (
              <CardView key={`${c.id}-${i}`} card={c} />
            ))}
          </div>
        </div>

        <button onClick={() => scrollByCard('prev')} className="slider-button slider-button-left">
          <ChevronLeft className="w-6 h-6 text-gray-700" />
        </button>

        <button onClick={() => scrollByCard('next')} className="slider-button slider-button-right">
          <ChevronRight className="w-6 h-6 text-gray-700" />
        </button>
      </div>
    </section>
  );
};

export default CardsSlider;
