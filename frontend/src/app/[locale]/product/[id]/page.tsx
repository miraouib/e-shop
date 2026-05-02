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
        
        <div className="mb-6 flex items-baseline gap-3">
          <span className="text-3xl font-bold text-primary">{product.price} DT</span>
          {product.originalPrice && (
            <span className="text-xl text-gray-400 line-through font-medium">{product.originalPrice} DT</span>
          )}
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

      {/* Product Blocks (Content sections) */}
      {product.productBlocks && product.productBlocks.filter((b: any) => b.isActive).length > 0 && (
        <div className="col-span-1 md:col-span-2 mt-16 space-y-12">
          {product.productBlocks
            .filter((b: any) => b.isActive)
            .sort((a: any, b: any) => a.position - b.position)
            .map((block: any) => {
              const blockTitle = block.translations?.[locale]?.title || block.translations?.fr?.title || "";
              const blockContent = block.translations?.[locale]?.content || block.translations?.fr?.content || "";
              
              return (
                <div key={block.id} className="flex flex-col md:flex-row gap-8 items-center bg-card p-8 rounded-3xl shadow-sm border dark:border-gray-700">
                  <div className="flex-1 space-y-4">
                    {blockTitle && <h3 className="text-2xl font-bold">{blockTitle}</h3>}
                    {blockContent && (
                      <div 
                        className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300"
                        dangerouslySetInnerHTML={{ __html: blockContent }}
                      />
                    )}
                  </div>
                  {block.image && (
                    <div className="w-full md:w-1/3 flex-shrink-0">
                      <img src={block.image} alt={blockTitle} className="w-full h-auto object-cover rounded-xl shadow-md" />
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
