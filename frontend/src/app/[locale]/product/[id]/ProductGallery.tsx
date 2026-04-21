"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { Pagination, Navigation } from "swiper/modules";

export default function ProductGallery({ images }: { images: string[] }) {
  if (!images || images.length === 0) {
    return <div className="w-full aspect-square bg-gray-100 rounded-2xl"></div>;
  }

  return (
    <div className="sticky top-24">
      <Swiper
        pagination={{ clickable: true }}
        navigation={true}
        modules={[Pagination, Navigation]}
        className="w-full aspect-square rounded-2xl overflow-hidden border border-gray-100 shadow-sm"
      >
        {images.map((src, idx) => (
          <SwiperSlide key={idx}>
            <img 
              src={src} 
              alt={`Galerie ${idx + 1}`} 
              className="w-full h-full object-cover"
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
