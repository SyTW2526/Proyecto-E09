import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import PokemonCard from './PokemonCard';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

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
  // Datos de ejemplo - reemplazar con datos de la API
  const featuredCards: Card[] = [
    {
      id: '1',
      name: 'PEPE',
      image: 'placeholder',
      hp: '110',
      type: 'Fire',
      rarity: 'Rare',
      price: { low: 15, mid: 20, high: 30 }
    },
    {
      id: '2',
      name: 'PEPE',
      image: 'placeholder',
      hp: '110',
      type: 'Fire',
      rarity: 'Common',
      price: { low: 5, mid: 10, high: 15 }
    },
    {
      id: '3',
      name: 'PEPE',
      image: 'placeholder',
      hp: '110',
      type: 'Psychic',
      rarity: 'Uncommon',
      price: { low: 8, mid: 12, high: 18 }
    },
    {
      id: '4',
      name: 'PEPE',
      image: 'placeholder',
      hp: '110',
      type: 'Psychic',
      rarity: 'Rare',
      price: { low: 20, mid: 25, high: 35 }
    },
    {
      id: '5',
      name: 'PEPE',
      image: 'placeholder',
      hp: '110',
      type: 'Psychic',
      rarity: 'Holo Rare',
      price: { low: 30, mid: 40, high: 60 }
    },
    {
      id: '6',
      name: 'PEPE',
      image: 'placeholder',
      hp: '110',
      type: 'Psychic',
      rarity: 'Ultra Rare',
      price: { low: 50, mid: 70, high: 100 }
    },
  ];

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="border-t-2 border-b-2 border-dashed border-gray-400 py-8">
        {/* Título */}
        <div className="text-center mb-8">
          <h2 className="inline-block px-12 py-4 bg-blue-400 text-white text-3xl font-bold rounded-lg shadow-lg border-2 border-blue-600">
            CARTAS DESTACADAS
          </h2>
        </div>

        {/* Slider de cartas */}
        <Swiper
          modules={[Navigation, Pagination]}
          spaceBetween={20}
          slidesPerView={5}
          navigation
          pagination={{ clickable: true }}
          breakpoints={{
            320: { slidesPerView: 1 },
            640: { slidesPerView: 2 },
            768: { slidesPerView: 3 },
            1024: { slidesPerView: 4 },
            1280: { slidesPerView: 5 },
          }}
          className="pb-12"
        >
          {featuredCards.map((card) => (
            <SwiperSlide key={card.id}>
              <PokemonCard card={card} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default FeaturedCards;