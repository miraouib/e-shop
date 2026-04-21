import { Metadata } from 'next';
import ProductGallery from './ProductGallery';
import QuickBuyForm from './QuickBuyForm';

import { getTranslations } from 'next-intl/server';

// Génération SEO
export async function generateMetadata({ params }: { params: Promise<{ id: string, locale: string }> }): Promise<Metadata> {
  try {
    const { id, locale } = await params;
    const res = await fetch(`http://127.0.0.1:8000/api/products/${id}`, { cache: 'no-store' });
    const product = await res.json();
    const title = product.translations?.[locale]?.title || product.translations?.fr?.title || "Produit";
    const desc = product.translations?.[locale]?.description || product.translations?.fr?.description || "";
    return {
      title: `${title} | Custom Shop`,
      description: desc.substring(0, 160) || `Achetez ${title} sur Custom Shop.`,
    };
  } catch (e) {
    return { title: 'Produit | Custom Shop' };
  }
}

export default async function ProductPage({ params }: { params: Promise<{ id: string, locale: string }> }) {
  const { id, locale } = await params;
  const t = await getTranslations('Product');
  
  // Fetch product data
  let product = null;
  try {
    const res = await fetch(`http://127.0.0.1:8000/api/products/${id}`, { cache: 'no-store' });
    if (res.ok) product = await res.json();
  } catch (e) {
    // Mock data for demo
    product = {
      id: parseInt(params.id),
      title: "Super Casque Audio Sans Fil",
      description: "Profitez d'un son exceptionnel avec ce casque audio bluetooth à réduction de bruit active. Confortable et élégant.",
      price: 150.0,
      images: ["https://placehold.co/600x600", "https://placehold.co/600x600/eee/333"],
      category: { name: "Électronique" }
    };
  }

  if (!product) return <div className="text-center py-20 text-xl">Produit introuvable</div>;

  // API returns product.promotions as an array
  const promotions = product.promotions || [];

  const title = product.translations?.[locale]?.title || product.translations?.fr?.title || "Produit";
  const desc = product.translations?.[locale]?.description || product.translations?.fr?.description || "";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 py-8 relative">
      {/* Galerie */}
      <div>
        <ProductGallery images={product.images || ["https://placehold.co/600x600"]} />
      </div>

      {/* Détails */}
      <div className="flex flex-col">
        <h1 className="text-4xl font-bold mb-2">{title}</h1>
        <p className="text-gray-500 mb-6">{product.category?.name}</p>
        
        <div className="mb-6">
          <span className="text-3xl font-bold text-primary">{product.price} DT</span>
        </div>

        {/* Badges Prix Dégressif */}
        {promotions.length > 0 && (
          <div className="bg-primary/10 border border-primary/30 text-primary p-4 rounded-lg mb-8 inline-block space-y-2">
            <span className="font-bold flex items-center gap-2">✨ {t('special_offer')}</span>
            <ul className="list-disc list-inside">
              {promotions.map((p: any) => (
                <li key={p.id || p.quantityThreshold}>
                  {p.discountPrice} DT l'unité à partir de {p.quantityThreshold} articles.
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="prose mb-8">
          <p>{desc}</p>
        </div>

        {/* Formulaire Achat Rapide */}
        <div className="mt-auto">
          <h3 className="text-xl font-semibold mb-4 border-b pb-2">{t('quick_buy')}</h3>
          <QuickBuyForm product={product} promotions={promotions} />
        </div>
      </div>
    </div>
  );
}
