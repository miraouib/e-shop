"use client";

import { useCartStore } from "@/store/cartStore";
import { Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslations, useLocale } from 'next-intl';
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

const schema = z.object({
  fullName: z.string().min(3, "Nom complet requis"),
  phone: z.string().regex(/^[0-9]{8}$/, "Numéro tunisien invalide (8 chiffres)"),
  address: z.string().min(5, "Adresse détaillée requise"),
});

type FormData = z.infer<typeof schema>;

export default function CartPage() {
  const t = useTranslations('Cart');
  const locale = useLocale();
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalSettings, setGlobalSettings] = useState({ globalShippingFee: 7.0, freeShippingThreshold: 100 });
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCartStore();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema)
  });

  useEffect(() => {
    setMounted(true);
    const fetchSettings = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/settings");
        if (res.ok) {
          const data = await res.json();
          const settings = data['hydra:member']?.[0] || data['member']?.[0];
          if (settings) {
            setGlobalSettings({
              globalShippingFee: settings.globalShippingFee ?? 7.0,
              freeShippingThreshold: settings.freeShippingThreshold ?? 100
            });
          }
        }
      } catch (e) {
        console.error("Failed to fetch settings", e);
      }
    };
    fetchSettings();
  }, []);

  if (!mounted) return <div className="py-20 text-center">Chargement...</div>;

  if (items.length === 0) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-3xl font-bold mb-4">{t('empty')}</h1>
        <p className="text-gray-500 mb-8">Découvrez nos nouveautés et promotions !</p>
        <Link href={`/${locale}/shop`} className="bg-primary text-white font-bold px-8 py-3 rounded-full hover:opacity-90">
          Aller à la boutique
        </Link>
      </div>
    );
  }

  const getCalculatedItems = () => {
    return items.map(item => {
      let currentPrice = item.price;
      let hasPromo = false;
      if (item.promotions && item.promotions.length > 0) {
        const applicablePromotions = item.promotions
          .filter((p: any) => item.quantity >= p.quantityThreshold)
          .sort((a: any, b: any) => b.quantityThreshold - a.quantityThreshold);
        if (applicablePromotions.length > 0) {
          currentPrice = applicablePromotions[0].discountPrice;
          hasPromo = true;
        }
      } else if (item.quantityThreshold && item.quantity >= item.quantityThreshold && item.discountPrice) {
         currentPrice = item.discountPrice;
         hasPromo = true;
      }
      return { ...item, currentPrice, hasPromo };
    });
  };

  const calculatedItems = getCalculatedItems();
  const subTotal = calculatedItems.reduce((acc, item) => acc + (item.currentPrice * item.quantity), 0);

  let shippingFee = globalSettings.globalShippingFee;
  let isFreeShipping = false;

  if (calculatedItems.length >= 2) {
    isFreeShipping = subTotal >= globalSettings.freeShippingThreshold;
  } else if (calculatedItems.length === 1) {
    const item = calculatedItems[0];
    const itemTotal = item.currentPrice * item.quantity;
    
    if (item.isFreeShipping) {
      isFreeShipping = true;
    } else if (item.freeShippingPriceThreshold !== null && itemTotal >= item.freeShippingPriceThreshold) {
      isFreeShipping = true;
    } else if (item.freeShippingQuantityThreshold !== null && item.quantity >= item.freeShippingQuantityThreshold) {
      isFreeShipping = true;
    } else {
      isFreeShipping = subTotal >= globalSettings.freeShippingThreshold;
    }
  }

  const finalTotal = subTotal + (isFreeShipping ? 0 : shippingFee);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const orderItems = calculatedItems.map(item => ({
        id: item.id,
        title: item.title,
        quantity: item.quantity,
        price: item.currentPrice
      }));

      const orderData = {
        customerName: data.fullName,
        phone: data.phone,
        address: data.address,
        totalPrice: finalTotal,
        items: orderItems
      };

      const res = await fetch("http://127.0.0.1:8000/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/ld+json" },
        body: JSON.stringify(orderData)
      });

      if (res.ok) {
        toast.success(t('order_success') || "Commande globale envoyée avec succès !");
        clearCart();
        reset();
      } else {
        toast.error("Erreur lors de la création de la commande.");
      }
    } catch (e) {
      toast.error("Erreur de connexion au serveur.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold mb-8">{t('cart')}</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {calculatedItems.map((item) => (
            <div key={item.id} className="flex flex-col sm:flex-row items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl border dark:border-gray-700 shadow-sm transition-all hover:shadow-md">
              <img 
                src={item.image || "https://placehold.co/100x100"} 
                alt={item.title} 
                className="w-24 h-24 object-cover rounded-md"
              />
              
              <div className="flex-1 text-center sm:text-left">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{item.title}</h3>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Prix unitaire: <span className={item.hasPromo ? "line-through" : ""}>{item.price} DT</span>
                  {item.hasPromo && <span className="text-primary font-bold ml-2">{item.currentPrice} DT</span>}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-bold transition-colors"
                  onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                >
                  -
                </button>
                <span className="w-8 text-center font-bold text-gray-900 dark:text-white">{item.quantity}</span>
                <button 
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-bold transition-colors"
                  onClick={() => updateQuantity(item.id, Math.min(20, item.quantity + 1))}
                >
                  +
                </button>
              </div>

              <div className="font-bold text-lg min-w-[80px] text-center sm:text-right text-gray-900 dark:text-white">
                {item.currentPrice * item.quantity} DT
              </div>

              <button 
                onClick={() => removeItem(item.id)}
                className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 p-2 rounded-full transition-colors"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl border dark:border-gray-700 h-fit shadow-sm">
          <h2 className="text-xl font-bold mb-4 border-b dark:border-gray-700 pb-2 text-gray-900 dark:text-white">Récapitulatif & Commande</h2>
          
          <div className="space-y-3 mb-6 text-gray-600 dark:text-gray-300">
            <div className="flex justify-between">
              <span>Sous-total</span>
              <span className="font-semibold">{subTotal} DT</span>
            </div>
            <div className="flex justify-between">
              <span>Frais de livraison</span>
              <span className={isFreeShipping ? "text-green-600 font-bold" : "font-semibold"}>
                {isFreeShipping ? "Gratuit" : `${shippingFee} DT`}
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center py-4 border-t border-gray-200 dark:border-gray-700 mb-6">
            <span className="text-lg font-bold text-gray-900 dark:text-white">{t('total')}</span>
            <span className="text-2xl font-bold text-primary">{finalTotal} DT</span>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <input 
                {...register("fullName")} 
                placeholder="Nom complet" 
                className="w-full p-3 border dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-primary outline-none"
              />
              {errors.fullName && <span className="text-red-500 text-sm mt-1">{errors.fullName.message}</span>}
            </div>

            <div>
              <input 
                {...register("phone")} 
                placeholder="Numéro de téléphone" 
                type="tel"
                className="w-full p-3 border dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-primary outline-none"
              />
              {errors.phone && <span className="text-red-500 text-sm mt-1">{errors.phone.message}</span>}
            </div>

            <div>
              <textarea 
                {...register("address")} 
                placeholder="Adresse complète de livraison" 
                rows={3}
                className="w-full p-3 border dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-primary outline-none resize-none"
              />
              {errors.address && <span className="text-red-500 text-sm mt-1">{errors.address.message}</span>}
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-primary text-white font-bold text-lg py-4 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isSubmitting ? "Envoi..." : "Valider la commande globale"}
          </button>
        </form>
      </div>
    </div>
  );
}
