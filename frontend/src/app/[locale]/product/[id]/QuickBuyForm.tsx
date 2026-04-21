"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCartStore } from "@/store/cartStore";
import toast from "react-hot-toast";
import { useState, useEffect } from "react";
import { useTranslations, useLocale } from 'next-intl';

const schema = z.object({
  fullName: z.string().min(3, "Nom complet requis"),
  phone: z.string().regex(/^[0-9]{8}$/, "Numéro tunisien invalide (8 chiffres)"),
  address: z.string().min(5, "Adresse détaillée requise"),
  quantity: z.number().min(1).max(20),
});

type FormData = z.infer<typeof schema>;

export default function QuickBuyForm({ product, promotions }: { product: any, promotions: any[] }) {
  const t = useTranslations('Product');
  const locale = useLocale();
  const title = product.translations?.[locale]?.title || product.translations?.fr?.title || "Produit";
  const [isClient, setIsClient] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  const addItem = useCartStore((state) => state.addItem);
  
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      quantity: 1
    }
  });

  const quantity = watch("quantity");
  
  // Sticky Buy Button State for Mobile
  const [showSticky, setShowSticky] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setShowSticky(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Trouver la meilleure promotion selon la quantité
  const applicablePromotions = promotions
    .filter(p => quantity >= p.quantityThreshold)
    .sort((a, b) => b.quantityThreshold - a.quantityThreshold); // Descending

  const bestPromotion = applicablePromotions.length > 0 ? applicablePromotions[0] : null;

  const currentPrice = bestPromotion ? bestPromotion.discountPrice : product.price;

  const total = currentPrice * quantity;

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const orderData = {
        customerName: data.fullName,
        phone: data.phone,
        address: data.address,
        totalPrice: total,
        items: [
          {
            id: product.id,
            title: title,
            quantity: data.quantity,
            price: currentPrice
          }
        ]
      };

      const res = await fetch("http://127.0.0.1:8000/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/ld+json" },
        body: JSON.stringify(orderData)
      });

      if (res.ok) {
        toast.success(t('order_success') || "Commande envoyée avec succès !");
        // Reset form except quantity
        setValue("fullName", "");
        setValue("phone", "");
        setValue("address", "");
      } else {
        toast.error("Erreur lors de la création de la commande.");
      }
    } catch (e) {
      toast.error("Erreur de connexion.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      title: title,
      price: product.price,
      discountPrice: bestPromotion?.discountPrice,
      quantityThreshold: bestPromotion?.quantityThreshold,
      quantity: quantity,
      image: product.images?.[0],
      promotions: promotions // Pass all promotions to the cart to re-calculate if quantity changes in cart
    });
    toast.success(t('added_to_cart') || "Produit ajouté au panier !");
  };

  if (!isClient) return null;

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-gray-50 dark:bg-gray-900 p-6 rounded-2xl">
        <div className="flex items-center gap-4 mb-6">
          <label className="font-semibold">{t('quantity')} :</label>
          <div className="flex items-center bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg overflow-hidden">
            <button 
              type="button" 
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white"
              onClick={() => setValue("quantity", Math.max(1, quantity - 1))}
            >
              -
            </button>
            <span className="px-4 py-2 min-w-[3rem] text-center text-gray-900 dark:text-white">{quantity}</span>
            <button 
              type="button" 
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white"
              onClick={() => setValue("quantity", Math.min(20, quantity + 1))}
            >
              +
            </button>
          </div>
        </div>

        <div>
          <input 
            {...register("fullName")} 
            placeholder={t('name')} 
            className="w-full p-3 border dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-primary outline-none"
          />
          {errors.fullName && <span className="text-red-500 text-sm mt-1">{errors.fullName.message}</span>}
        </div>

        <div>
          <input 
            {...register("phone")} 
            placeholder={t('phone')} 
            type="tel"
            className="w-full p-3 border dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-primary outline-none"
          />
          {errors.phone && <span className="text-red-500 text-sm mt-1">{errors.phone.message}</span>}
        </div>

        <div>
          <textarea 
            {...register("address")} 
            placeholder={t('address')} 
            rows={3}
            className="w-full p-3 border dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-primary outline-none resize-none"
          />
          {errors.address && <span className="text-red-500 text-sm mt-1">{errors.address.message}</span>}
        </div>

        <div className="flex justify-between items-center py-4 border-t border-gray-200 mt-4">
          <span className="text-lg text-gray-600 dark:text-gray-300">Total :</span>
          <span className="text-2xl font-bold text-primary">{total} DT</span>
        </div>

        <div className="flex flex-col gap-3">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-primary text-white font-bold text-lg py-4 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isSubmitting ? "Envoi..." : (t('order_now') || "Achat Direct")}
          </button>
          
          <button 
            type="button" 
            onClick={handleAddToCart}
            className="w-full bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white font-bold text-lg py-4 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
          >
            {t('add_to_cart') || "Ajouter au Panier"}
          </button>
        </div>
      </form>

      {/* Amélioration: Sticky Buy Button pour Mobile */}
      {showSticky && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-900 border-t dark:border-gray-800 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50 md:hidden flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="font-bold text-primary">{currentPrice} DT</p>
          </div>
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="bg-primary text-white font-bold px-6 py-3 rounded-full"
          >
            {t('quick_buy')}
          </button>
        </div>
      )}
    </>
  );
}
