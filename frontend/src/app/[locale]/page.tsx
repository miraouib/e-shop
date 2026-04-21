import HeroSlider from "@/components/HeroSlider";
import ProductCard from "@/components/ProductCard";

async function getPromotions() {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/promotions", { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data['hydra:member'] || data['member'] || [];
  } catch (e) {
    return [];
  }
}

async function getProducts() {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/products?isActive=true", { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data['hydra:member'] || data['member'] || [];
  } catch (e) {
    // Return dummy data if backend is not up yet
    return [
      { id: 1, title: "Produit Test 1", price: 120.5, category: { name: "Électronique" }, images: ["https://placehold.co/400x400"] },
      { id: 2, title: "Produit Test 2", price: 45.0, category: { name: "Mode" }, images: ["https://placehold.co/400x400"] },
      { id: 3, title: "Produit Test 3", price: 89.9, category: { name: "Maison" }, images: ["https://placehold.co/400x400"] },
      { id: 4, title: "Produit Test 4", price: 210.0, category: { name: "Électronique" }, images: ["https://placehold.co/400x400"] },
    ];
  }
}

import { getTranslations } from 'next-intl/server';

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('HomePage');
  
  const promotions = await getPromotions();
  const products = await getProducts();

  return (
    <div className="space-y-12 py-8">
      <section>
        <HeroSlider promotions={promotions} />
      </section>

      <section>
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-3xl font-bold">{t('new_arrivals')}</h2>
          <a href={`/${locale}/shop`} className="text-primary hover:underline font-medium">{t('view_all')}</a>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Amélioration : Section Témoignages */}
      <section className="bg-gray-50 rounded-2xl p-8 md:p-12 mt-12 text-center">
        <h2 className="text-2xl font-bold mb-8">{t('testimonials_title')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex text-yellow-400 justify-center mb-4">
                {"★★★★★"}
              </div>
              <p className="text-gray-600 mb-4">"{t('testimonial_text')}"</p>
              <p className="font-semibold">- {t('client')} {i}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
