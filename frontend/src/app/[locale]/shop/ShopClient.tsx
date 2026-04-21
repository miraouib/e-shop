"use client";

import { useState, useEffect } from "react";
import ProductCard from "@/components/ProductCard";
import { Filter, X, ChevronDown } from "lucide-react";
import { useTranslations } from 'next-intl';

export default function ShopClient({ categories }: { categories: any[] }) {
  const t = useTranslations('Shop');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  // Filters state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<string>("");

  const fetchProducts = async (pageNum: number, reset: boolean = false) => {
    try {
      setLoading(true);
      let url = `http://127.0.0.1:8000/api/products?page=${pageNum}&isActive=true`;
      
      if (selectedCategory) {
        url += `&category=${selectedCategory}`;
      }
      
      if (sortOrder === "price_asc") {
        url += "&order[price]=asc";
      } else if (sortOrder === "price_desc") {
        url += "&order[price]=desc";
      } else if (sortOrder === "newest") {
        url += "&order[id]=desc";
      }

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const newProducts = data['hydra:member'] || data['member'] || [];
        
        if (reset) {
          setProducts(newProducts);
        } else {
          setProducts(prev => [...prev, ...newProducts]);
        }
        
        const view = data['hydra:view'] || data['view'];
        const next = view ? (view['hydra:next'] || view['next']) : null;
        setHasMore(!!next);
      } else {
        // Mock fallback
        if (reset) {
          setProducts([
            { id: 1, title: "Produit Test 1", price: 120.5, category: { name: "Électronique" } },
            { id: 2, title: "Produit Test 2", price: 45.0, category: { name: "Mode" } },
            { id: 3, title: "Produit Test 3", price: 89.9, category: { name: "Maison" } },
            { id: 4, title: "Produit Test 4", price: 210.0, category: { name: "Électronique" } },
          ]);
        }
        setHasMore(false);
      }
    } catch (e) {
      console.error(e);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(1, true);
    setPage(1);
  }, [selectedCategory, sortOrder]);

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchProducts(nextPage, false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 relative">
      {/* Bouton Filtres Mobile */}
      <div className="md:hidden flex justify-between items-center bg-gray-50 p-4 rounded-xl border mb-4">
        <button 
          onClick={() => setIsDrawerOpen(true)}
          className="flex items-center gap-2 font-medium"
        >
          <Filter size={20} /> {t('filters')}
        </button>
        
        <div className="relative">
          <select 
            className="appearance-none bg-transparent pr-8 font-medium outline-none"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="">{t('sort_by')}</option>
            <option value="newest">{t('newest')}</option>
            <option value="price_asc">{t('price_asc')}</option>
            <option value="price_desc">{t('price_desc')}</option>
          </select>
          <ChevronDown size={16} className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Sidebar Desktop & Drawer Mobile */}
      <div className={`
        fixed inset-0 z-50 bg-black/50 transition-opacity md:static md:bg-transparent md:z-auto
        ${isDrawerOpen ? "opacity-100 visible" : "opacity-0 invisible md:opacity-100 md:visible"}
      `}>
        <div className={`
          fixed top-0 left-0 bottom-0 w-[280px] bg-white p-6 shadow-xl transition-transform transform md:static md:w-64 md:p-0 md:shadow-none md:translate-x-0 md:bg-transparent
          ${isDrawerOpen ? "translate-x-0" : "-translate-x-full"}
        `}>
          <div className="flex justify-between items-center mb-6 md:hidden">
            <h2 className="text-xl font-bold">{t('filters')}</h2>
            <button onClick={() => setIsDrawerOpen(false)}><X size={24} /></button>
          </div>

          <div className="mb-8">
            <h3 className="font-semibold text-lg mb-4 border-b pb-2">{t('categories')}</h3>
            <ul className="space-y-3">
              <li>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="radio" 
                    name="category" 
                    value="" 
                    checked={selectedCategory === ""} 
                    onChange={() => setSelectedCategory("")}
                    className="w-4 h-4 text-primary focus:ring-primary accent-primary"
                  />
                  <span className={`group-hover:text-primary transition-colors ${selectedCategory === "" ? "font-medium text-primary" : "text-gray-600"}`}>
                    {t('all')}
                  </span>
                </label>
              </li>
              {categories.map((cat) => (
                <li key={cat.id}>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="radio" 
                      name="category" 
                      value={cat.id} 
                      checked={selectedCategory === cat.id.toString()} 
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-4 h-4 text-primary focus:ring-primary accent-primary"
                    />
                    <span className={`group-hover:text-primary transition-colors ${selectedCategory === cat.id.toString() ? "font-medium text-primary" : "text-gray-600"}`}>
                      {cat.name}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </div>

          <div className="hidden md:block">
            <h3 className="font-semibold text-lg mb-4 border-b pb-2">{t('sort_by')}</h3>
            <select 
              className="w-full p-3 border rounded-xl outline-none focus:border-primary"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="">{t('relevance')}</option>
              <option value="newest">{t('newest')}</option>
              <option value="price_asc">{t('price_asc')}</option>
              <option value="price_desc">{t('price_desc')}</option>
            </select>
          </div>
          
          <div className="md:hidden mt-auto pt-6">
             <button 
                onClick={() => setIsDrawerOpen(false)}
                className="w-full bg-primary text-white py-3 rounded-xl font-bold"
             >
               {t('apply')}
             </button>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1">
        {products.length === 0 && !loading ? (
          <div className="text-center py-20 bg-gray-50 rounded-2xl">
            <p className="text-xl text-gray-500">{t('no_products')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
            
            {loading && (
              // Skeletons de chargement
              Array.from({ length: 4 }).map((_, i) => (
                <div key={`skel-${i}`} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
                  <div className="h-48 w-full bg-gray-200 animate-pulse"></div>
                  <div className="p-4 flex flex-col flex-grow">
                    <div className="h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse mb-4"></div>
                    <div className="mt-auto pt-4 flex justify-between items-center">
                      <div className="h-6 w-1/3 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Load More Button */}
        {hasMore && !loading && (
          <div className="mt-12 text-center">
            <button 
              onClick={loadMore}
              className="border-2 border-primary text-primary font-bold px-8 py-3 rounded-full hover:bg-primary hover:text-white transition-colors"
            >
              {t('load_more')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
