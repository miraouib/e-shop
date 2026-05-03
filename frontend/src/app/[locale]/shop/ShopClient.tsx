"use client";

import { useState, useEffect } from "react";
import ProductCard from "@/components/ProductCard";
import { Filter, X, SlidersHorizontal, ChevronDown } from "lucide-react";
import { useTranslations } from 'next-intl';

export default function ShopClient({ categories: initialCategories }: { categories: any[] }) {
  const t = useTranslations('Shop');

  // Categories fetched client-side
  const [categories, setCategories] = useState<any[]>(initialCategories || []);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/categories", {
      headers: { Accept: "application/ld+json" }
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return;
        // API returns 'member' or 'hydra:member' depending on Accept header
        const list = data['hydra:member'] || data['member'] || (Array.isArray(data) ? data : []);
        if (list.length > 0) setCategories(list);
      })
      .catch(() => {});
  }, []);

  // Products
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Filters
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]); // multiple
  const [sortOrder, setSortOrder] = useState<string>("");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [onlyNew, setOnlyNew] = useState(false);

  const toggleCategory = (id: string) => {
    setSelectedCategories(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const activeFilterCount = [
    selectedCategories.length > 0,
    sortOrder !== "",
    minPrice !== "" || maxPrice !== "",
    onlyNew,
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSelectedCategories([]);
    setSortOrder("");
    setMinPrice("");
    setMaxPrice("");
    setOnlyNew(false);
  };

  const fetchProducts = async (pageNum: number, reset: boolean = false) => {
    try {
      setLoading(true);
      let url = `http://127.0.0.1:8000/api/products?page=${pageNum}&isActive=true`;

      // Multiple categories: add each as separate param
      selectedCategories.forEach(id => {
        url += `&category[]=/api/categories/${id}`;
      });

      if (onlyNew) url += `&isNewArrival=true`;
      if (sortOrder === "price_asc") url += "&order[price]=asc";
      else if (sortOrder === "price_desc") url += "&order[price]=desc";
      else if (sortOrder === "newest") url += "&order[id]=desc";

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        let newProducts = data['hydra:member'] || data['member'] || [];

        // Client-side price filtering
        if (minPrice !== "") newProducts = newProducts.filter((p: any) => p.price >= Number(minPrice));
        if (maxPrice !== "") newProducts = newProducts.filter((p: any) => p.price <= Number(maxPrice));

        if (reset) setProducts(newProducts);
        else setProducts(prev => [...prev, ...newProducts]);

        const view = data['hydra:view'] || data['view'];
        setHasMore(!!(view?.['hydra:next'] || view?.['next']));
      } else {
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
  }, [selectedCategories, sortOrder, minPrice, maxPrice, onlyNew]);

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchProducts(nextPage, false);
    }
  };

  // ── Filter Panel ──────────────────────────────────────────────
  const FilterPanel = () => (
    <div className="space-y-6">

      {/* Categories with checkboxes */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400">
            {t('categories')}
          </h3>
          {selectedCategories.length > 0 && (
            <button
              onClick={() => setSelectedCategories([])}
              className="text-[10px] font-bold text-primary hover:underline"
            >
              Tout effacer
            </button>
          )}
        </div>

        <ul className="space-y-1">
          {categories.length === 0 ? (
            <li className="text-xs text-gray-400 px-2 py-1 italic">Chargement...</li>
          ) : (
            categories.map((cat) => {
              const isChecked = selectedCategories.includes(cat.id.toString());
              return (
                <li key={cat.id}>
                  <label className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all
                    ${isChecked
                      ? "bg-primary/10 dark:bg-primary/20 border border-primary/30"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700 border border-transparent"
                    }
                  `}>
                    <div className={`
                      w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all
                      ${isChecked
                        ? "bg-primary border-primary"
                        : "border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-800"
                      }
                    `}>
                      {isChecked && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-sm font-medium ${isChecked ? "text-primary font-bold" : "text-gray-700 dark:text-gray-300"}`}>
                      {cat.name}
                    </span>
                    {cat.products && (
                      <span className="ml-auto text-[11px] font-bold text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded-full">
                        {cat.products.length}
                      </span>
                    )}
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={isChecked}
                      onChange={() => toggleCategory(cat.id.toString())}
                    />
                  </label>
                </li>
              );
            })
          )}
        </ul>
      </div>

      <hr className="dark:border-gray-700" />

      {/* Sort */}
      <div>
        <h3 className="font-bold text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3">
          {t('sort_by')}
        </h3>
        <div className="space-y-0.5">
          {[
            { value: "", label: t('relevance') },
            { value: "newest", label: t('newest') },
            { value: "price_asc", label: t('price_asc') },
            { value: "price_desc", label: t('price_desc') },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSortOrder(opt.value)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                sortOrder === opt.value
                  ? "bg-primary text-white"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <hr className="dark:border-gray-700" />

      {/* Price Range */}
      <div>
        <h3 className="font-bold text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3">
          Prix (DT)
        </h3>
        <div className="flex gap-2 items-center">
          <input
            type="number"
            min="0"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => {
              const newMin = e.target.value;
              setMinPrice(newMin);
              if (newMin !== "" && (maxPrice === "" || Number(maxPrice) <= Number(newMin))) {
                setMaxPrice(String(Number(newMin) + 1));
              }
            }}
            className="w-full p-2 border dark:border-gray-600 rounded-lg text-sm outline-none focus:border-primary bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          />
          <span className="text-gray-400 shrink-0">—</span>
          <input
            type="number"
            min="0"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full p-2 border dark:border-gray-600 rounded-lg text-sm outline-none focus:border-primary bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      <hr className="dark:border-gray-700" />

      {/* Options */}
      <div>
        <h3 className="font-bold text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3">
          Options
        </h3>
        <label className="flex items-center gap-3 cursor-pointer px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <input
            type="checkbox"
            checked={onlyNew}
            onChange={(e) => setOnlyNew(e.target.checked)}
            className="w-4 h-4 accent-primary rounded"
          />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Nouveautés uniquement</span>
        </label>
      </div>

      {/* Clear all filters */}
      {activeFilterCount > 0 && (
        <>
          <hr className="dark:border-gray-700" />
          <button
            onClick={clearFilters}
            className="w-full py-2.5 text-sm font-bold text-red-500 border border-red-200 dark:border-red-900/30 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            Effacer tous les filtres ({activeFilterCount})
          </button>
        </>
      )}
    </div>
  );

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="flex flex-col md:flex-row gap-8 relative">

      {/* ── Mobile top bar ──────────────────────────────────── */}
      <div className="md:hidden flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-2xl border-2 border-gray-200 dark:border-gray-600 shadow-md mb-1">
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="flex items-center gap-2.5 bg-primary/10 dark:bg-primary/20 text-primary px-4 py-2.5 rounded-xl font-bold text-sm"
        >
          <SlidersHorizontal size={18} />
          Filtres
          {activeFilterCount > 0 && (
            <span className="w-6 h-6 bg-primary text-white rounded-full text-xs flex items-center justify-center font-black">
              {activeFilterCount}
            </span>
          )}
        </button>
        <div className="relative">
          <select
            className="appearance-none bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white pl-3 pr-8 py-2.5 rounded-xl text-sm font-semibold outline-none border border-gray-200 dark:border-gray-600 cursor-pointer"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="">{t('sort_by')}</option>
            <option value="newest">{t('newest')}</option>
            <option value="price_asc">{t('price_asc')}</option>
            <option value="price_desc">{t('price_desc')}</option>
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 dark:text-gray-300" />
        </div>
      </div>

      {/* ── Mobile Drawer ────────────────────────────────────── */}
      {isDrawerOpen && (
        <div className="md:hidden fixed inset-0 z-50" onClick={() => setIsDrawerOpen(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="absolute top-0 left-0 bottom-0 w-[300px] bg-white dark:bg-gray-900 p-6 overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Filter size={20} className="text-primary" /> Filtres
              </h2>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X size={22} className="text-gray-700 dark:text-white" />
              </button>
            </div>
            <FilterPanel />
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="mt-8 w-full bg-primary text-white py-3 rounded-xl font-bold hover:opacity-90 transition"
            >
              {t('apply')} ({products.length} résultats)
            </button>
          </div>
        </div>
      )}

      {/* ── Desktop Sidebar ──────────────────────────────────── */}
      <aside className="hidden md:block w-60 shrink-0">
        <div className="sticky top-24 bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 shadow-sm p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
              <SlidersHorizontal size={16} className="text-primary" /> Filtres
            </h2>
            {activeFilterCount > 0 && (
              <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                {activeFilterCount} actif{activeFilterCount > 1 ? "s" : ""}
              </span>
            )}
          </div>
          <FilterPanel />
        </div>
      </aside>

      {/* ── Products Grid ────────────────────────────────────── */}
      <div className="flex-1 min-w-0">

        {/* Active filter tags */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedCategories.map(id => {
              const cat = categories.find(c => c.id.toString() === id);
              return cat ? (
                <span key={id} className="flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full">
                  {cat.name}
                  <button onClick={() => toggleCategory(id)}><X size={12} /></button>
                </span>
              ) : null;
            })}
            {onlyNew && (
              <span className="flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full">
                Nouveautés <button onClick={() => setOnlyNew(false)}><X size={12} /></button>
              </span>
            )}
            {(minPrice || maxPrice) && (
              <span className="flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full">
                {minPrice || "0"} — {maxPrice || "∞"} DT
                <button onClick={() => { setMinPrice(""); setMaxPrice(""); }}><X size={12} /></button>
              </span>
            )}
            {sortOrder && (
              <span className="flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full">
                {sortOrder === "newest" ? t('newest') : sortOrder === "price_asc" ? t('price_asc') : t('price_desc')}
                <button onClick={() => setSortOrder("")}><X size={12} /></button>
              </span>
            )}
          </div>
        )}

        {/* Product count */}
        {!loading && (
          <div className="flex items-center gap-2 mb-5">
            <span className="inline-flex items-center gap-1.5 bg-primary text-white text-sm font-black px-3.5 py-1.5 rounded-full shadow-sm shadow-primary/30">
              {products.length}
            </span>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              produit{products.length !== 1 ? "s" : ""} trouvé{products.length !== 1 ? "s" : ""}
            </span>
          </div>
        )}

        {products.length === 0 && !loading ? (
          <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/30 rounded-2xl border dark:border-gray-700">
            <p className="text-xl text-gray-500 dark:text-gray-400 mb-2">{t('no_products')}</p>
            {activeFilterCount > 0 && (
              <button onClick={clearFilters} className="text-primary text-sm font-bold hover:underline mt-2 block mx-auto">
                Effacer les filtres
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}

            {loading && Array.from({ length: 4 }).map((_, i) => (
              <div key={`skel-${i}`} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border dark:border-gray-700 overflow-hidden">
                <div className="h-48 w-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
                <div className="p-4 space-y-3">
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="h-8 w-1/3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        )}

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
