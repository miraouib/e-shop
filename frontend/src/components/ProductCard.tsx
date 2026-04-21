"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useLocale } from 'next-intl';

export default function ProductCard({ product }: { product: any }) {
  const locale = useLocale();
  const imageUrl = product.images?.[0] || "/placeholder.webp";
  const title = product.translations?.[locale]?.title || product.translations?.fr?.title || product.title || "Produit";

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-shadow overflow-hidden group flex flex-col h-full border border-gray-100">
      <Link href={`/${locale}/product/${product.id}`} className="relative h-48 w-full block overflow-hidden">
        {/* Placeholder if no image, using simple img tag for external URLs if they are not configured in next.config.js */}
        <img 
          src={imageUrl} 
          alt={title} 
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
        />
        {/* Badge promotion */}
        {product.discountPrice && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            Promo
          </div>
        )}
      </Link>
      
      <div className="p-4 flex flex-col flex-grow">
        <Link href={`/${locale}/product/${product.id}`}>
          <h3 className="font-semibold text-lg text-gray-800 line-clamp-2 hover:text-primary transition-colors">
            {title}
          </h3>
        </Link>
        <p className="text-sm text-gray-500 mt-1">{product.category?.name}</p>
        
        <div className="mt-auto pt-4 flex items-center justify-between">
          <div>
            <span className="text-xl font-bold text-primary">{product.price} DT</span>
          </div>
          
          <button className="bg-primary/10 text-primary p-3 rounded-full hover:bg-primary hover:text-white transition-colors" aria-label="Ajouter au panier">
            <ShoppingCart size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
