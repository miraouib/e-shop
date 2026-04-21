"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination, Autoplay } from "swiper/modules";

export default function HeroSlider({ promotions }: { promotions: any[] }) {
  if (!promotions || promotions.length === 0) {
    return (
      <div className="w-full h-64 bg-gray-200 rounded-2xl flex items-center justify-center">
        <p className="text-gray-500">Aucune promotion en cours</p>
      </div>
    );
  }

  return (
    <Swiper
      pagination={{ clickable: true }}
      autoplay={{ delay: 5000 }}
      modules={[Pagination, Autoplay]}
      className="w-full h-[300px] md:h-[400px] rounded-2xl overflow-hidden shadow-lg"
    >
      {promotions.map((promo, index) => (
        <SwiperSlide key={index}>
          <div className="relative w-full h-full bg-gradient-to-r from-primary to-secondary flex items-center p-8 md:p-16">
            <div className="text-white z-10 w-full md:w-1/2">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">{promo.product?.title || "Offre Spéciale"}</h2>
              <p className="text-xl mb-6">À partir de {promo.discountPrice} DT (pour {promo.quantityThreshold} achetés)</p>
              <a href={`/product/${promo.product?.id}`} className="inline-block bg-white text-primary font-semibold px-6 py-3 rounded-full hover:bg-gray-100 transition-colors">
                Découvrir
              </a>
            </div>
            {/* Si image disponible */}
            {promo.product?.images?.[0] && (
              <img 
                src={promo.product.images[0]} 
                alt={promo.product.title} 
                className="absolute right-0 top-0 h-full w-1/2 object-cover opacity-50 mix-blend-overlay"
              />
            )}
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
